<?php
// ══════════════════════════════════════════════════
//  Listings API  — /api/listings
// ══════════════════════════════════════════════════
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/jwt.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

match (true) {
    $method === 'GET'  && $id === null => listListings(),
    $method === 'GET'  && $id !== null => getListing($id),
    $method === 'POST'                 => createListing(),
    $method === 'PUT'  && $id !== null => updateListing($id),
    $method === 'DELETE' && $id !== null => deleteListing($id),
    default => jsonError('Route not found', 404),
};

// ── LIST (with optional filters) ─────────────────
function listListings(): void {
    $db = getDB();

    $where  = ['l.status = :status'];
    $params = [':status' => $_GET['status'] ?? 'active'];

    if (!empty($_GET['county'])) {
        $where[]            = 'l.county = :county';
        $params[':county']  = $_GET['county'];
    }
    if (!empty($_GET['category'])) {
        $where[]              = 'l.category = :category';
        $params[':category']  = $_GET['category'];
    }
    if (!empty($_GET['search'])) {
        $where[]             = 'l.name LIKE :search';
        $params[':search']   = '%' . $_GET['search'] . '%';
    }

    $whereStr = implode(' AND ', $where);
    $limit    = min((int)($_GET['limit'] ?? 20), 100);
    $offset   = (int)($_GET['offset'] ?? 0);

    $sql = "
        SELECT l.*, u.name AS farmer_name, u.county AS farmer_county, u.phone AS farmer_phone
        FROM listings l
        JOIN users u ON u.id = l.farmer_id
        WHERE $whereStr
        ORDER BY l.created_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $rows    = $stmt->fetchAll();
    $countSt = $db->prepare("SELECT COUNT(*) FROM listings l WHERE $whereStr");
    foreach ($params as $k => $v) $countSt->bindValue($k, $v);
    $countSt->execute();
    $total = (int)$countSt->fetchColumn();

    jsonResponse(['success' => true, 'total' => $total, 'data' => $rows]);
}

// ── GET SINGLE ───────────────────────────────────
function getListing(int $id): void {
    $db   = getDB();
    $stmt = $db->prepare('
        SELECT l.*, u.name AS farmer_name, u.phone AS farmer_phone, u.county AS farmer_county
        FROM listings l JOIN users u ON u.id = l.farmer_id
        WHERE l.id = ?
    ');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) jsonError('Listing not found', 404);
    jsonResponse(['success' => true, 'data' => $row]);
}

// ── CREATE ───────────────────────────────────────
function createListing(): void {
    $auth = requireAuth();
    $body = getBody();

    $required = ['name', 'quantity_kg', 'price_per_kg'];
    foreach ($required as $f) {
        if (empty($body[$f])) jsonError("$f is required");
    }

    $db  = getDB();
    $ins = $db->prepare('
        INSERT INTO listings
          (farmer_id, name, category, quantity_kg, price_per_kg, county, location,
           quality_grade, description, emoji, status, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $ins->execute([
        $auth['sub'],
        $body['name'],
        $body['category']     ?? null,
        $body['quantity_kg'],
        $body['price_per_kg'],
        $body['county']       ?? null,
        $body['location']     ?? null,
        $body['quality_grade'] ?? null,
        $body['description']  ?? null,
        $body['emoji']        ?? '🌿',
        $body['status']       ?? 'active',
        $body['expires_at']   ?? null,
    ]);
    jsonResponse(['success' => true, 'id' => (int)$db->lastInsertId()], 201);
}

// ── UPDATE ───────────────────────────────────────
function updateListing(int $id): void {
    $auth = requireAuth();
    $db   = getDB();

    $row = $db->prepare('SELECT farmer_id FROM listings WHERE id = ?');
    $row->execute([$id]);
    $listing = $row->fetch();
    if (!$listing) jsonError('Listing not found', 404);
    if ($listing['farmer_id'] !== $auth['sub'] && $auth['role'] !== 'admin') {
        jsonError('Forbidden', 403);
    }

    $body   = getBody();
    $fields = ['name','category','quantity_kg','price_per_kg','county','location',
                'quality_grade','description','emoji','status','expires_at'];
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
    $db->prepare('UPDATE listings SET ' . implode(',', $sets) . ' WHERE id = ?')->execute($vals);
    jsonResponse(['success' => true]);
}

// ── DELETE ───────────────────────────────────────
function deleteListing(int $id): void {
    $auth = requireAuth();
    $db   = getDB();

    $row = $db->prepare('SELECT farmer_id FROM listings WHERE id = ?');
    $row->execute([$id]);
    $listing = $row->fetch();
    if (!$listing) jsonError('Listing not found', 404);
    if ($listing['farmer_id'] !== $auth['sub'] && $auth['role'] !== 'admin') {
        jsonError('Forbidden', 403);
    }

    $db->prepare('DELETE FROM listings WHERE id = ?')->execute([$id]);
    jsonResponse(['success' => true]);
}
