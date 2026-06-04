<?php
// ══════════════════════════════════════════════════
//  Auth API  — /api/auth/{register|login|me|logout}
// ══════════════════════════════════════════════════
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/jwt.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

match ([$method, $action]) {
    ['POST', 'register'] => handleRegister(),
    ['POST', 'login']    => handleLogin(),
    ['GET',  'me']       => handleMe(),
    default              => jsonError('Route not found', 404),
};

// ── REGISTER ─────────────────────────────────────
function handleRegister(): void {
    $body = getBody();

    $name     = trim($body['name']    ?? '');
    $phone    = trim($body['phone']   ?? '');
    $email    = trim($body['email']   ?? '') ?: null;
    $password = $body['password']     ?? '';
    $role     = $body['role']         ?? 'farmer';
    $county   = trim($body['county']  ?? '') ?: null;
    $location = trim($body['location'] ?? '') ?: null;

    if (!$name || !$phone || !$password) {
        jsonError('name, phone and password are required');
    }
    if (strlen($password) < 6) {
        jsonError('password must be at least 6 characters');
    }
    if (!in_array($role, ['farmer', 'buyer', 'admin'], true)) {
        jsonError('role must be farmer, buyer or admin');
    }

    $db   = getDB();
    $stmt = $db->prepare('SELECT id FROM users WHERE phone = ?');
    $stmt->execute([$phone]);
    if ($stmt->fetch()) {
        jsonError('Phone number already registered', 409);
    }

    $hash      = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $initials  = strtoupper(substr($name, 0, 1) . (strpos($name, ' ') !== false ? substr(strrchr($name, ' '), 1, 1) : ''));

    $ins = $db->prepare('
        INSERT INTO users (name, phone, email, password_hash, role, county, location, avatar_initials)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $ins->execute([$name, $phone, $email, $hash, $role, $county, $location, $initials]);
    $userId = (int)$db->lastInsertId();

    $token = generateJWT(['sub' => $userId, 'role' => $role, 'name' => $name]);

    jsonResponse([
        'success' => true,
        'token'   => $token,
        'user'    => compact('userId', 'name', 'phone', 'email', 'role', 'county', 'location', 'initials'),
    ], 201);
}

// ── LOGIN ────────────────────────────────────────
function handleLogin(): void {
    $body     = getBody();
    $phone    = trim($body['phone']    ?? '');
    $password = $body['password']      ?? '';

    if (!$phone || !$password) {
        jsonError('phone and password are required');
    }

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE phone = ? AND is_active = 1');
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonError('Invalid phone number or password', 401);
    }

    $token = generateJWT(['sub' => $user['id'], 'role' => $user['role'], 'name' => $user['name']]);

    unset($user['password_hash']);
    jsonResponse(['success' => true, 'token' => $token, 'user' => $user]);
}

// ── ME ───────────────────────────────────────────
function handleMe(): void {
    $payload = requireAuth();
    $db      = getDB();
    $stmt    = $db->prepare('SELECT id,name,phone,email,role,county,location,avatar_initials,created_at FROM users WHERE id = ?');
    $stmt->execute([$payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) jsonError('User not found', 404);
    jsonResponse(['success' => true, 'user' => $user]);
}
