<?php
// ══════════════════════════════════════════════════
//  Dashboard API  — /api/dashboard
//  Single endpoint returning aggregated stats
//  scoped by authenticated user's role
// ══════════════════════════════════════════════════
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/jwt.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed', 405);
}

$auth = requireAuth();
$db   = getDB();
$role = $auth['role'];
$uid  = $auth['sub'];

$out = [];

// ── FARMER DASHBOARD ────────────────────────────
if ($role === 'farmer') {
    // listing counts
    $stmt = $db->prepare("
        SELECT status, COUNT(*) AS cnt
        FROM listings WHERE farmer_id = ?
        GROUP BY status
    ");
    $stmt->execute([$uid]);
    $listingStats = [];
    foreach ($stmt->fetchAll() as $r) $listingStats[$r['status']] = (int)$r['cnt'];

    // order counts & revenue
    $stmt = $db->prepare("
        SELECT
          COUNT(*)                                              AS total_orders,
          SUM(CASE WHEN status='delivered' THEN total_ksh ELSE 0 END) AS revenue_ksh
        FROM orders WHERE farmer_id = ?
    ");
    $stmt->execute([$uid]);
    $orderStats = $stmt->fetch();

    // wallet balance
    $stmt = $db->prepare("
        SELECT
          COALESCE(SUM(CASE WHEN direction='in'  AND status='completed' THEN amount_ksh ELSE 0 END),0)
        - COALESCE(SUM(CASE WHEN direction='out' AND status='completed' THEN amount_ksh ELSE 0 END),0) AS balance
        FROM mpesa_transactions WHERE user_id = ?
    ");
    $stmt->execute([$uid]);
    $balance = (float)$stmt->fetchColumn();

    // recent orders
    $stmt = $db->prepare("
        SELECT o.id, o.status, o.total_ksh, o.created_at,
               l.name AS produce_name, l.emoji,
               b.name AS buyer_name
        FROM orders o
        JOIN listings l ON l.id = o.listing_id
        JOIN users    b ON b.id = o.buyer_id
        WHERE o.farmer_id = ?
        ORDER BY o.created_at DESC LIMIT 5
    ");
    $stmt->execute([$uid]);
    $recentOrders = $stmt->fetchAll();

    // market prices
    $prices = $db->query("
        SELECT produce_name, market_name, price_per_kg, trend
        FROM market_prices
        ORDER BY recorded_at DESC LIMIT 6
    ")->fetchAll();

    // active logistics
    $stmt = $db->prepare("
        SELECT id, route_from, route_to, status, departure_date, vehicle_type
        FROM logistics WHERE farmer_id = ? AND status != 'delivered'
        ORDER BY departure_date LIMIT 3
    ");
    $stmt->execute([$uid]);
    $logistics = $stmt->fetchAll();

    $out = [
        'listing_stats'  => $listingStats,
        'total_orders'   => (int)$orderStats['total_orders'],
        'revenue_ksh'    => (float)$orderStats['revenue_ksh'],
        'wallet_balance' => $balance,
        'recent_orders'  => $recentOrders,
        'market_prices'  => $prices,
        'active_logistics' => $logistics,
    ];
}

// ── BUYER DASHBOARD ─────────────────────────────
elseif ($role === 'buyer') {
    $stmt = $db->prepare("
        SELECT COUNT(*) AS total_orders,
               SUM(total_ksh) AS total_spent,
               SUM(CASE WHEN status='delivered' THEN total_ksh ELSE 0 END) AS delivered_ksh
        FROM orders WHERE buyer_id = ?
    ");
    $stmt->execute([$uid]);
    $orderStats = $stmt->fetch();

    $stmt = $db->prepare("
        SELECT o.id, o.status, o.total_ksh, o.quantity_kg, o.created_at,
               l.name AS produce_name, l.emoji,
               f.name AS farmer_name, f.county AS farmer_county
        FROM orders o
        JOIN listings l ON l.id = o.listing_id
        JOIN users    f ON f.id = o.farmer_id
        WHERE o.buyer_id = ?
        ORDER BY o.created_at DESC LIMIT 5
    ");
    $stmt->execute([$uid]);
    $recentOrders = $stmt->fetchAll();

    $prices = $db->query("
        SELECT produce_name, market_name, price_per_kg, trend
        FROM market_prices ORDER BY recorded_at DESC LIMIT 8
    ")->fetchAll();

    // recent active listings
    $listings = $db->query("
        SELECT l.id, l.name, l.emoji, l.quantity_kg, l.price_per_kg,
               l.county, l.quality_grade, u.name AS farmer_name
        FROM listings l JOIN users u ON u.id = l.farmer_id
        WHERE l.status = 'active'
        ORDER BY l.created_at DESC LIMIT 6
    ")->fetchAll();

    $out = [
        'total_orders'  => (int)$orderStats['total_orders'],
        'total_spent'   => (float)$orderStats['total_spent'],
        'delivered_ksh' => (float)$orderStats['delivered_ksh'],
        'recent_orders' => $recentOrders,
        'market_prices' => $prices,
        'fresh_listings' => $listings,
    ];
}

// ── ADMIN DASHBOARD ─────────────────────────────
else {
    $totals = $db->query("
        SELECT
          (SELECT COUNT(*) FROM users)    AS total_users,
          (SELECT COUNT(*) FROM listings) AS total_listings,
          (SELECT COUNT(*) FROM orders)   AS total_orders,
          (SELECT COALESCE(SUM(amount_ksh),0) FROM mpesa_transactions WHERE status='completed' AND direction='in') AS total_revenue
    ")->fetch();

    $ordersByStatus = $db->query("
        SELECT status, COUNT(*) AS cnt FROM orders GROUP BY status
    ")->fetchAll();

    $usersByRole = $db->query("
        SELECT role, COUNT(*) AS cnt FROM users GROUP BY role
    ")->fetchAll();

    $recentUsers = $db->query("
        SELECT id, name, phone, role, county, created_at
        FROM users ORDER BY created_at DESC LIMIT 5
    ")->fetchAll();

    $recentOrders = $db->query("
        SELECT o.id, o.status, o.total_ksh, o.created_at,
               l.name AS produce_name, l.emoji,
               b.name AS buyer_name, f.name AS farmer_name
        FROM orders o
        JOIN listings l ON l.id = o.listing_id
        JOIN users    b ON b.id = o.buyer_id
        JOIN users    f ON f.id = o.farmer_id
        ORDER BY o.created_at DESC LIMIT 10
    ")->fetchAll();

    $prices = $db->query("
        SELECT produce_name, market_name, price_per_kg, trend, recorded_at
        FROM market_prices ORDER BY recorded_at DESC LIMIT 10
    ")->fetchAll();

    $out = [
        'totals'          => $totals,
        'orders_by_status' => $ordersByStatus,
        'users_by_role'   => $usersByRole,
        'recent_users'    => $recentUsers,
        'recent_orders'   => $recentOrders,
        'market_prices'   => $prices,
    ];
}

jsonResponse(['success' => true, 'role' => $role, 'data' => $out]);
