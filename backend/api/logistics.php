<?php
// ══════════════════════════════════════════════════
//  Logistics API  — /api/logistics
//  Farmers can book transport, pool routes, track deliveries
// ══════════════════════════════════════════════════
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/jwt.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

match (true) {
    $method === 'GET'    && $id === null => listRoutes(),
    $method === 'GET'    && $id !== null => getRoute($id),
    $method === 'POST'                   => createRoute(),
    $method === 'PUT'    && $id !== null => updateRoute($id),
    $method === 'DELETE' && $id !== null => deleteRoute($id),
    default => jsonError('Route not found', 404),
};

// ── LIST ─────────────────────────────────────────
function listRoutes(): void {
    $auth = requireAuth();
    $db   = getDB();
    $role = $auth['role'];
    $uid  = $auth['sub'];

    $where  = [];
    $params = [];

    if ($role === 'farmer') {
        $where[]     = 'l.farmer_id = :uid';
        $params[':uid'] = $uid;
    } elseif ($role === 'buyer') {
        // buyers see logistics linked to their orders
        $where[]     = 'o.buyer_id = :uid';
        $params[':uid'] = $uid;
    }
    // admin sees all

    if (!empty($_GET['status'])) {
        $where[] = 'l.status = :status';
        $params[':status'] = $_GET['status'];
    }

    $whereStr = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = $db->prepare("
        SELECT l.*,
               u.name   AS farmer_name,  u.phone AS farmer_phone,
               o.total_ksh AS order_total
        FROM logistics l
        JOIN users u ON u.id = l.farmer_id
        LEFT JOIN orders o ON o.id = l.order_id
        $whereStr
        ORDER BY l.created_at DESC
        LIMIT 50
    ");
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->execute();

    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

// ── GET SINGLE ───────────────────────────────────
function getRoute(int $id): void {
    $auth = requireAuth();
    $db   = getDB();

    $stmt = $db->prepare("
        SELECT l.*,
               u.name AS farmer_name, u.phone AS farmer_phone
        FROM logistics l
        JOIN users u ON u.id = l.farmer_id
        WHERE l.id = ?
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) jsonError('Logistics record not found', 404);

    if ($auth['role'] !== 'admin' && (int)$row['farmer_id'] !== $auth['sub']) {
        jsonError('Forbidden', 403);
    }
    jsonResponse(['success' => true, 'data' => $row]);
}

// ── CREATE ───────────────────────────────────────
function createRoute(): void {
    $auth = requireAuth();
    if (!in_array($auth['role'], ['farmer', 'admin'], true)) {
        jsonError('Only farmers can book transport', 403);
    }

    $body = getBody();
    $required = ['route_from', 'route_to', 'departure_date'];
    foreach ($required as $f) {
        if (empty($body[$f])) jsonError("$f is required");
    }

    $db  = getDB();
    $ins = $db->prepare('
        INSERT INTO logistics
          (farmer_id, order_id, route_from, route_to, vehicle_type, driver_name, driver_phone,
           departure_date, pooled_count, cost_ksh, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending")
    ');
    $ins->execute([
        $auth['sub'],
        $body['order_id']      ?? null,
        $body['route_from'],
        $body['route_to'],
        $body['vehicle_type']  ?? 'truck',
        $body['driver_name']   ?? null,
        $body['driver_phone']  ?? null,
        $body['departure_date'],
        (int)($body['pooled_count'] ?? 1),
        (float)($body['cost_ksh']   ?? 0),
        $body['notes']         ?? null,
    ]);

    jsonResponse(['success' => true, 'id' => (int)$db->lastInsertId()], 201);
}

// ── UPDATE ───────────────────────────────────────
function updateRoute(int $id): void {
    $auth = requireAuth();
    $db   = getDB();

    $stmt = $db->prepare('SELECT farmer_id FROM logistics WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) jsonError('Logistics record not found', 404);
    if ($auth['role'] !== 'admin' && (int)$row['farmer_id'] !== $auth['sub']) {
        jsonError('Forbidden', 403);
    }

    $body   = getBody();
    $fields = ['route_from','route_to','vehicle_type','driver_name','driver_phone',
               'departure_date','pooled_count','cost_ksh','notes','status'];
    $sets   = [];
    $vals   = [];
    foreach ($fields as $f) {
        if (array_key_exists($f, $body)) {
            $sets[] = "$f = ?";
            $vals[] = $body[$f];
        }
    }
    if (empty($sets)) jsonError('No fields to update');

    $vals[] = $id;
    $db->prepare('UPDATE logistics SET ' . implode(',', $sets) . ' WHERE id = ?')->execute($vals);
    jsonResponse(['success' => true]);
}

// ── DELETE ───────────────────────────────────────
function deleteRoute(int $id): void {
    $auth = requireAuth();
    $db   = getDB();

    $stmt = $db->prepare('SELECT farmer_id FROM logistics WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) jsonError('Logistics record not found', 404);
    if ($auth['role'] !== 'admin' && (int)$row['farmer_id'] !== $auth['sub']) {
        jsonError('Forbidden', 403);
    }

    $db->prepare('DELETE FROM logistics WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}
