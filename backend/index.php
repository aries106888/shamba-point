<?php
// ══════════════════════════════════════════════════
//  ShambaPoint Backend  —  Main Router
//  URL pattern:  /backend/{resource}?action=&id=
//  e.g.  /backend/auth?action=login
//        /backend/listings?id=3
//        /backend/dashboard
// ══════════════════════════════════════════════════

require_once __DIR__ . '/config/cors.php';

// Apply CORS headers immediately (handles OPTIONS preflight)
setCorsHeaders();

// ── Parse resource from URL path ─────────────────
//   /backend/auth       → $resource = 'auth'
//   /backend/listings   → $resource = 'listings'
$uri      = $_SERVER['REQUEST_URI'];
$path     = parse_url($uri, PHP_URL_PATH);
$segments = array_filter(explode('/', trim($path, '/')));
$segments = array_values($segments);

// Find "backend" in path, take the next segment as resource
$resource = null;
foreach ($segments as $i => $seg) {
    if ($seg === 'backend' && isset($segments[$i + 1])) {
        $resource = strtolower($segments[$i + 1]);
        break;
    }
}

// Allow direct file-based routing too (index.php?resource=auth)
if (!$resource && isset($_GET['resource'])) {
    $resource = strtolower($_GET['resource']);
}

$allowed = ['auth', 'listings', 'orders', 'prices', 'mpesa', 'logistics', 'dashboard', 'ussd'];

if (!$resource || !in_array($resource, $allowed, true)) {
    http_response_code(404);
    echo json_encode([
        'error'     => 'API resource not found',
        'available' => array_map(fn($r) => "/backend/$r", $allowed),
        'docs'      => 'See /backend/README.md for usage',
    ]);
    exit;
}

// ── Dispatch ─────────────────────────────────────
require_once __DIR__ . "/api/{$resource}.php";
