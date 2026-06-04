<?php
// ──────────────────────────────────────────────
//  CORS + JSON headers
//  Allows requests from Vite dev server (port 5173)
//  and production domain.
// ──────────────────────────────────────────────
function setCorsHeaders(): void {
    $allowed = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'https://shambapoint.co.ke',
        'https://www.shambapoint.co.ke',
    ];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: http://localhost:5173");
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function jsonResponse(mixed $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError(string $message, int $code = 400): never {
    jsonResponse(['success' => false, 'error' => $message], $code);
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}
