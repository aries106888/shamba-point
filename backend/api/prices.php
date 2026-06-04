<?php
// ══════════════════════════════════════════════════
//  Market Prices API  — /api/prices
// ══════════════════════════════════════════════════
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/jwt.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

match (true) {
    $method === 'GET'  && $id === null => listPrices(),
    $method === 'POST'                 => upsertPrice(),
    $method === 'DELETE' && $id !== null => deletePrice($id),
    default => jsonError('Route not found', 404),
};

// ── LIST with optional filters ────────────────────
function listPrices(): void {
    $db     = getDB();
    $where  = ['1=1'];
    $params = [];

    if (!empty($_GET['produce'])) {
        $where[]              = 'produce_name LIKE :produce';
        $params[':produce']   = '%' . $_GET['produce'] . '%';
    }
    if (!empty($_GET['market'])) {
        $where[]             = 'market_name = :market';
        $params[':market']   = $_GET['market'];
    }
    if (!empty($_GET['county'])) {
        $where[]             = 'county = :county';
        $params[':county']   = $_GET['county'];
    }
    if (!empty($_GET['date'])) {
        $where[]             = 'recorded_at = :date';
        $params[':date']     = $_GET['date'];
    }

    $whereStr = implode(' AND ', $where);
    $stmt = $db->prepare("
        SELECT * FROM market_prices
        WHERE $whereStr
        ORDER BY produce_name, market_name, recorded_at DESC
    ");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->execute();

    // Group by produce for easier frontend use
    $rows    = $stmt->fetchAll();
    $grouped = [];
    foreach ($rows as $r) {
        $grouped[$r['produce_name']][] = $r;
    }

    jsonResponse(['success' => true, 'data' => $rows, 'grouped' => $grouped]);
}

// ── UPSERT (admin only) ───────────────────────────
function upsertPrice(): void {
    $auth = requireAuth();
    if ($auth['role'] !== 'admin') jsonError('Admin only', 403);

    $body = getBody();
    $req  = ['produce_name', 'market_name', 'price_per_kg'];
    foreach ($req as $f) {
        if (empty($body[$f])) jsonError("$f is required");
    }

    $db  = getDB();
    $ins = $db->prepare('
        INSERT INTO market_prices (produce_name, market_name, county, price_per_kg, trend, recorded_at)
        VALUES (:produce, :market, :county, :price, :trend, :date)
        ON DUPLICATE KEY UPDATE
          price_per_kg = VALUES(price_per_kg),
          trend        = VALUES(trend)
    ');
    $ins->execute([
        ':produce' => $body['produce_name'],
        ':market'  => $body['market_name'],
        ':county'  => $body['county']      ?? null,
        ':price'   => $body['price_per_kg'],
        ':trend'   => $body['trend']        ?? 'stable',
        ':date'    => $body['recorded_at']  ?? date('Y-m-d'),
    ]);

    jsonResponse(['success' => true, 'id' => (int)$db->lastInsertId()], 201);
}

// ── DELETE (admin only) ───────────────────────────
function deletePrice(int $id): void {
    $auth = requireAuth();
    if ($auth['role'] !== 'admin') jsonError('Admin only', 403);

    $db = getDB();
    $db->prepare('DELETE FROM market_prices WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}
