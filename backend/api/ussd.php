<?php
// ══════════════════════════════════════════════════
//  USSD API  — /api/ussd
//  Integrates with USSD gateways like Africa's Talking
//  Accepts POST/GET requests with:
//    - sessionId
//    - phoneNumber
//    - text (e.g. "", "1", "1*2", "1*2*50")
// ══════════════════════════════════════════════════
require_once __DIR__ . '/../config/database.php';

if (!headers_sent()) {
    header('Content-Type: text/plain');
}

// Retrieve parameters (handle both POST/GET/JSON)
$sessionId   = $_REQUEST['sessionId'] ?? uniqid('ussd_', true);
$phoneNumber = $_REQUEST['phoneNumber'] ?? '';
$text        = $_REQUEST['text'] ?? '';

// Clean phone number (convert 254... or 07... to database phone format)
// Database phone is typically stored as 07... or 254...
$cleanPhone = preg_replace('/^\+254/', '0', $phoneNumber);
$cleanPhone = preg_replace('/^254/', '0', $cleanPhone);

if (empty($cleanPhone)) {
    // Default fallback phone number for simulator/testing
    $cleanPhone = '0712345678';
}

$db = getDB();

// Find user by phone number
$userStmt = $db->prepare('SELECT * FROM users WHERE phone = ? LIMIT 1');
$userStmt->execute([$cleanPhone]);
$user = $userStmt->fetch();

if (!$user) {
    // Register temporary user if not found, to make testing easy
    $initials = 'US';
    $hash = password_hash('password123', PASSWORD_BCRYPT);
    $ins = $db->prepare('
        INSERT INTO users (name, phone, role, county, location, avatar_initials, password_hash)
        VALUES (?, ?, "farmer", "Nakuru", "USSD Registration", ?, ?)
    ');
    $ins->execute(["USSD User ($cleanPhone)", $cleanPhone, $initials, $hash]);
    
    // Fetch again
    $userStmt->execute([$cleanPhone]);
    $user = $userStmt->fetch();
}

$userId = (int)$user['id'];
$userName = $user['name'];

// Split the USSD inputs by *
$inputs = explode('*', $text);
$level  = count($inputs);

// If first text is empty, it means start of USSD session
if ($text === '') {
    $level = 0;
}

$response = "";

if ($level === 0) {
    // ── MAIN MENU ──
    $response  = "CON Welcome to ShambaPoint, $userName\n";
    $response .= "1. Sell Produce (Create Listing)\n";
    $response .= "2. View Nairobi Market Prices\n";
    $response .= "3. Check Wallet Balance\n";
    $response .= "4. View Active Logistics\n";
    $response .= "5. Exit";
} 
else {
    $mainChoice = $inputs[0];

    switch ($mainChoice) {
        // ── 1. SELL PRODUCE ──
        case "1":
            if ($level === 1) {
                // Select Produce Category
                $response  = "CON Select Produce:\n";
                $response .= "1. Kale (Sukuma)\n";
                $response .= "2. Tomatoes\n";
                $response .= "3. Red Onions\n";
                $response .= "4. Carrots\n";
                $response .= "5. Potatoes";
            } 
            elseif ($level === 2) {
                // Enter Quantity in KG
                $response = "CON Enter quantity in Kilograms (KG):";
            } 
            elseif ($level === 3) {
                // Enter Price per KG
                $qty = $inputs[2];
                $response = "CON Enter price per KG (Ksh) for $qty KG:";
            } 
            elseif ($level === 4) {
                // Confirm and save listing
                $produceMap = [
                    "1" => ["name" => "Kale (Sukuma Wiki)", "emoji" => "🥬", "category" => "Vegetables"],
                    "2" => ["name" => "Tomatoes (Money Maker)", "emoji" => "🍅", "category" => "Vegetables"],
                    "3" => ["name" => "Red Onions", "emoji" => "🧅", "category" => "Vegetables"],
                    "4" => ["name" => "Carrots", "emoji" => "🥕", "category" => "Vegetables"],
                    "5" => ["name" => "Potatoes", "emoji" => "🥔", "category" => "Tubers"],
                ];
                $choice = $inputs[1];
                $qty    = (float)$inputs[2];
                $price  = (float)$inputs[3];
                
                $prod = $produceMap[$choice] ?? ["name" => "Mixed Produce", "emoji" => "🌿", "category" => "General"];

                // Save to database
                $ins = $db->prepare('
                    INSERT INTO listings
                      (farmer_id, name, category, quantity_kg, price_per_kg, county, location, quality_grade, emoji, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, "Grade A", ?, "active")
                ');
                $ins->execute([
                    $userId,
                    $prod['name'],
                    $prod['category'],
                    $qty,
                    $price,
                    $user['county'] ?? 'Nakuru',
                    $user['location'] ?? 'Nakuru Town',
                    $prod['emoji']
                ]);

                $response = "END Success! Your listing of " . $qty . "kg of " . $prod['name'] . " at Ksh " . $price . "/kg has been published on ShambaPoint.";
            }
            break;

        // ── 2. VIEW NAIROBI MARKET PRICES ──
        case "2":
            // Get latest prices
            $stmt = $db->prepare("
                SELECT produce_name, market_name, price_per_kg 
                FROM market_prices 
                ORDER BY recorded_at DESC, produce_name ASC LIMIT 5
            ");
            $stmt->execute();
            $prices = $stmt->fetchAll();

            $response = "END Live Market Prices (Nairobi):\n";
            if (empty($prices)) {
                $response .= "Prices updating soon...";
            } else {
                foreach ($prices as $p) {
                    $response .= "• " . $p['produce_name'] . " (" . $p['market_name'] . "): Ksh " . round($p['price_per_kg']) . "/kg\n";
                }
            }
            break;

        // ── 3. CHECK WALLET BALANCE ──
        case "3":
            $stmt = $db->prepare("
                SELECT
                  COALESCE(SUM(CASE WHEN direction='in'  THEN amount_ksh ELSE 0 END), 0) -
                  COALESCE(SUM(CASE WHEN direction='out' THEN amount_ksh ELSE 0 END), 0) AS balance
                FROM mpesa_transactions
                WHERE user_id = ? AND status = 'completed'
            ");
            $stmt->execute([$userId]);
            $balance = (float)$stmt->fetchColumn();

            $response = "END ShambaPoint Wallet:\n";
            $response .= "Account Name: $userName\n";
            $response .= "Wallet Balance: Ksh " . number_format($balance, 2) . "\n";
            $response .= "M-PESA withdrawals: dial *384# again.";
            break;

        // ── 4. VIEW ACTIVE LOGISTICS ──
        case "4":
            $stmt = $db->prepare("
                SELECT route_from, route_to, departure_date, status, vehicle_type 
                FROM logistics 
                WHERE farmer_id = ? AND status IN ('pending', 'confirmed', 'in_transit')
                ORDER BY departure_date ASC LIMIT 2
            ");
            $stmt->execute([$userId]);
            $routes = $stmt->fetchAll();

            $response = "END Active Logistics:\n";
            if (empty($routes)) {
                $response .= "No active transport pooled. Book transport via the online dashboard.";
            } else {
                foreach ($routes as $r) {
                    $response .= "• " . $r['route_from'] . " -> " . $r['route_to'] . " (" . $r['vehicle_type'] . "): " . $r['status'] . "\n";
                }
            }
            break;

        // ── 5. EXIT ──
        case "5":
        default:
            $response = "END Thank you for using ShambaPoint. Empowering farmers every day.";
            break;
    }
}

echo $response;
exit;
