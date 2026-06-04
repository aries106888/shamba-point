<?php
// ══════════════════════════════════════════════════
//  M-PESA Daraja API  — /api/mpesa
//  Supports mock mode (MPESA_MODE=mock) and live mode
// ══════════════════════════════════════════════════
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/jwt.php';

setCorsHeaders();

// ── Daraja credentials (override via environment or config) ──
define('MPESA_MODE',            getenv('MPESA_MODE')            ?: 'mock');
define('DARAJA_CONSUMER_KEY',   getenv('DARAJA_CONSUMER_KEY')   ?: '');
define('DARAJA_CONSUMER_SECRET',getenv('DARAJA_CONSUMER_SECRET') ?: '');
define('DARAJA_SHORTCODE',      getenv('DARAJA_SHORTCODE')      ?: '174379');
define('DARAJA_PASSKEY',        getenv('DARAJA_PASSKEY')        ?: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919');
define('DARAJA_CALLBACK_URL',   getenv('DARAJA_CALLBACK_URL')   ?: 'https://api.shambapoint.co.ke/api/mpesa?action=callback');
define('DARAJA_BASE_URL',       'https://sandbox.safaricom.co.ke'); // change to api.safaricom.co.ke for production

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

match ([$method, $action]) {
    ['POST', 'stk']      => handleStkPush(),
    ['POST', 'callback'] => handleCallback(),
    ['GET',  'balance']  => handleBalance(),
    ['GET',  'history']  => handleHistory(),
    default              => jsonError('Route not found', 404),
};

// ── GET DARAJA ACCESS TOKEN ─────────────────────────────────
function getDarajaToken(): string {
    $creds = base64_encode(DARAJA_CONSUMER_KEY . ':' . DARAJA_CONSUMER_SECRET);
    $ch = curl_init(DARAJA_BASE_URL . '/oauth/v1/generate?grant_type=client_credentials');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ["Authorization: Basic $creds"],
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $result = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $result['access_token'] ?? '';
}

// ── STK PUSH ────────────────────────────────────────────────
function handleStkPush(): void {
    $auth  = requireAuth();
    $body  = getBody();

    $phone    = trim($body['phone']    ?? '');
    $amount   = (int)($body['amount']  ?? 0);
    $orderId  = (int)($body['order_id'] ?? 0);

    if (!$phone || $amount < 1) jsonError('phone and amount are required');

    // Normalize phone: 07xx → 2547xx
    $phone = preg_replace('/^0/', '254', $phone);
    $phone = preg_replace('/^\+/', '', $phone);

    $db = getDB();

    // Record pending transaction
    $ins = $db->prepare('
        INSERT INTO mpesa_transactions
          (user_id, order_id, direction, amount_ksh, phone, status, description)
        VALUES (?, ?, "in", ?, ?, "pending", ?)
    ');
    $ins->execute([
        $auth['sub'],
        $orderId ?: null,
        $amount,
        $phone,
        "ShambaPoint payment for order #$orderId",
    ]);
    $txId = (int)$db->lastInsertId();

    if (MPESA_MODE === 'mock') {
        // Simulate immediate success
        $mockCode = 'MOCK' . strtoupper(substr(md5(uniqid()), 0, 8));
        $db->prepare('UPDATE mpesa_transactions SET status="completed", mpesa_code=? WHERE id=?')
           ->execute([$mockCode, $txId]);
        if ($orderId) {
            $db->prepare('UPDATE orders SET status="confirmed" WHERE id=?')->execute([$orderId]);
        }
        jsonResponse([
            'success'    => true,
            'mode'       => 'mock',
            'tx_id'      => $txId,
            'mpesa_code' => $mockCode,
            'message'    => "Mock payment of Ksh $amount completed. Code: $mockCode",
        ]);
    }

    // ── LIVE mode ─────────────────────────────────────────────
    $token     = getDarajaToken();
    $timestamp = date('YmdHis');
    $password  = base64_encode(DARAJA_SHORTCODE . DARAJA_PASSKEY . $timestamp);

    $payload = [
        'BusinessShortCode' => DARAJA_SHORTCODE,
        'Password'          => $password,
        'Timestamp'         => $timestamp,
        'TransactionType'   => 'CustomerPayBillOnline',
        'Amount'            => $amount,
        'PartyA'            => $phone,
        'PartyB'            => DARAJA_SHORTCODE,
        'PhoneNumber'       => $phone,
        'CallBackURL'       => DARAJA_CALLBACK_URL,
        'AccountReference'  => "ShambaPoint#$orderId",
        'TransactionDesc'   => "Order #$orderId payment",
    ];

    $ch = curl_init(DARAJA_BASE_URL . '/mpesa/stkpush/v1/processrequest');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer $token",
            'Content-Type: application/json',
        ],
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $result = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (($result['ResponseCode'] ?? '') !== '0') {
        jsonError('M-PESA STK push failed: ' . ($result['errorMessage'] ?? json_encode($result)), 502);
    }

    $db->prepare('UPDATE mpesa_transactions SET daraja_request_id=?, daraja_response=? WHERE id=?')
       ->execute([$result['CheckoutRequestID'], json_encode($result), $txId]);

    jsonResponse([
        'success'            => true,
        'mode'               => 'live',
        'tx_id'              => $txId,
        'checkout_request_id' => $result['CheckoutRequestID'],
        'message'            => 'STK push sent — check your phone.',
    ]);
}

// ── CALLBACK ────────────────────────────────────────────────
function handleCallback(): void {
    $raw     = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    $body     = $payload['Body']['stkCallback'] ?? null;
    if (!$body) { echo 'ok'; exit; }

    $code     = (int)($body['ResultCode'] ?? -1);
    $reqId    = $body['CheckoutRequestID'] ?? '';
    $items    = $body['CallbackMetadata']['Item'] ?? [];

    $mpesaCode = '';
    foreach ($items as $item) {
        if ($item['Name'] === 'MpesaReceiptNumber') {
            $mpesaCode = $item['Value'] ?? '';
        }
    }

    $db   = getDB();
    $stmt = $db->prepare('SELECT id, order_id FROM mpesa_transactions WHERE daraja_request_id = ? LIMIT 1');
    $stmt->execute([$reqId]);
    $tx = $stmt->fetch();

    if ($tx) {
        $status = $code === 0 ? 'completed' : 'failed';
        $db->prepare('UPDATE mpesa_transactions SET status=?, mpesa_code=?, daraja_response=? WHERE id=?')
           ->execute([$status, $mpesaCode, json_encode($payload), $tx['id']]);

        if ($status === 'completed' && $tx['order_id']) {
            $db->prepare('UPDATE orders SET status="confirmed" WHERE id=?')
               ->execute([$tx['order_id']]);
        }
    }

    echo 'ok';
    exit;
}

// ── BALANCE ─────────────────────────────────────────────────
function handleBalance(): void {
    $auth = requireAuth();
    $db   = getDB();

    $stmt = $db->prepare("
        SELECT
          COALESCE(SUM(CASE WHEN direction='in'  AND status='completed' THEN amount_ksh ELSE 0 END), 0) AS total_in,
          COALESCE(SUM(CASE WHEN direction='out' AND status='completed' THEN amount_ksh ELSE 0 END), 0) AS total_out
        FROM mpesa_transactions WHERE user_id = ?
    ");
    $stmt->execute([$auth['sub']]);
    $row = $stmt->fetch();

    jsonResponse([
        'success'   => true,
        'balance'   => (float)$row['total_in'] - (float)$row['total_out'],
        'total_in'  => (float)$row['total_in'],
        'total_out' => (float)$row['total_out'],
    ]);
}

// ── HISTORY ─────────────────────────────────────────────────
function handleHistory(): void {
    $auth  = requireAuth();
    $db    = getDB();
    $limit = min((int)($_GET['limit'] ?? 20), 100);

    $stmt = $db->prepare('
        SELECT id, order_id, direction, amount_ksh, phone, mpesa_code, status, description, created_at
        FROM mpesa_transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ');
    $stmt->execute([$auth['sub'], $limit]);

    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}
