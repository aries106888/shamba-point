<?php
// ──────────────────────────────────────────────
//  JWT Helper
// ──────────────────────────────────────────────
require_once __DIR__ . '/database.php';

function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

function generateJWT(array $payload): string {
    $header  = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $body    = base64UrlEncode(json_encode($payload));
    $sig     = base64UrlEncode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function verifyJWT(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $body, $sig] = $parts;
    $expected = base64UrlEncode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;

    $payload = json_decode(base64UrlDecode($body), true);
    if (!$payload || $payload['exp'] < time()) return null;

    return $payload;
}

function requireAuth(): array {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized — missing token']);
        exit;
    }
    $token   = substr($authHeader, 7);
    $payload = verifyJWT($token);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized — invalid or expired token']);
        exit;
    }
    return $payload;
}
