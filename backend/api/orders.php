<?php
// ══════════════════════════════════════════════════
//  Orders API  — /api/orders
// ══════════════════════════════════════════════════
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/jwt.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? '';

match (true) {
    $method === 'GET'  && $id === null => listOrders(),
    $method === 'GET'  && $id !== null => getOrder($id),
    $method === 'POST' && $action === '' => createOrder(),
    $method === 'PUT'  && $id !== null && $action === 'status' => updateStatus($id),
    default => jsonError('Route not found', 404),
};

// ── LIST ─────────────────────────────────────────
function listOrders(): void {
    $auth = requireAuth();
    $db   = getDB();

    $role  = $auth['role'];
    $uid   = $auth['sub'];

    if ($role === 'farmer') {
        $where  = 'o.farmer_id = :uid';
    } elseif ($role === 'buyer') {
        $where  = 'o.buyer_id = :uid';
    } else {
        $where  = '1=1';
        $uid    = null;
    }

    $params = [];
    if ($uid !== null) $params[':uid'] = $uid;

    if (!empty($_GET['status'])) {
        $where .= ' AND o.status = :status';
        $params[':status'] = $_GET['status'];
    }

    $stmt = $db->prepare("
        SELECT o.*,
               l.name AS produce_name, l.emoji,
               b.name AS buyer_name,  b.phone AS buyer_phone,
               f.name AS farmer_name, f.phone AS farmer_phone
        FROM orders o
        JOIN listings l ON l.id = o.listing_id
        JOIN users    b ON b.id = o.buyer_id
        JOIN users    f ON f.id = o.farmer_id
        WHERE $where
        ORDER BY o.created_at DESC
    ");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->execute();

    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

// ── GET SINGLE ───────────────────────────────────
function getOrder(int $id): void {
    $auth = requireAuth();
    $db   = getDB();

    $stmt = $db->prepare("
        SELECT o.*,
               l.name AS produce_name, l.emoji, l.county AS produce_county,
               b.name AS buyer_name,  b.phone AS buyer_phone,
               f.name AS farmer_name, f.phone AS farmer_phone
        FROM orders o
        JOIN listings l ON l.id = o.listing_id
        JOIN users    b ON b.id = o.buyer_id
        JOIN users    f ON f.id = o.farmer_id
        WHERE o.id = ?
    ");
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    if (!$order) jsonError('Order not found', 404);

    // only farmer, buyer, or admin can see this order
    if ($auth['role'] !== 'admin'
        && (int)$order['farmer_id'] !== $auth['sub']
        && (int)$order['buyer_id']  !== $auth['sub']) {
        jsonError('Forbidden', 403);
    }
    jsonResponse(['success' => true, 'data' => $order]);
}

// ── CREATE ───────────────────────────────────────
function createOrder(): void {
    $auth = requireAuth();
    if ($auth['role'] !== 'buyer' && $auth['role'] !== 'admin') {
        jsonError('Only buyers can place orders', 403);
    }

    $body = getBody();
    $required = ['listing_id', 'quantity_kg', 'delivery_location'];
    foreach ($required as $f) {
        if (empty($body[$f])) jsonError("$f is required");
    }

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM listings WHERE id = ? AND status = "active"');
    $stmt->execute([$body['listing_id']]);
    $listing = $stmt->fetch();
    if (!$listing) jsonError('Listing not found or not active', 404);

    $qty   = (float)$body['quantity_kg'];
    $total = round($qty * (float)$listing['price_per_kg'], 2);

    $ins = $db->prepare('
        INSERT INTO orders (listing_id, buyer_id, farmer_id, quantity_kg, unit_price, total_ksh, delivery_location, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $ins->execute([
        $listing['id'],
        $auth['sub'],
        $listing['farmer_id'],
        $qty,
        $listing['price_per_kg'],
        $total,
        $body['delivery_location'],
        $body['notes'] ?? null,
    ]);

    jsonResponse(['success' => true, 'id' => (int)$db->lastInsertId(), 'total_ksh' => $total], 201);
}

// ── UPDATE STATUS ────────────────────────────────
function updateStatus(int $id): void {
    $auth    = requireAuth();
    $body    = getBody();
    $status  = $body['status'] ?? '';
    $allowed = ['pending','confirmed','in_transit','delivered','cancelled'];

    if (!in_array($status, $allowed, true)) {
        jsonError('Invalid status. Allowed: ' . implode(', ', $allowed));
    }

    $db   = getDB();
    $stmt = $db->prepare('SELECT farmer_id, buyer_id FROM orders WHERE id = ?');
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    if (!$order) jsonError('Order not found', 404);

    if ($auth['role'] !== 'admin'
        && (int)$order['farmer_id'] !== $auth['sub']
        && (int)$order['buyer_id']  !== $auth['sub']) {
        jsonError('Forbidden', 403);
    }

    $db->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$status, $id]);
    jsonResponse(['success' => true]);
}
