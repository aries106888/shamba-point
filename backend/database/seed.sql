-- ══════════════════════════════════════════════════
--  ShambaPoint Seed Data
--  Loaded automatically by Docker / phpMyAdmin
-- ══════════════════════════════════════════════════
USE shambapoint;

-- ── Demo Users ─────────────────────────────────
-- passwords are bcrypt of "farmer123", "buyer123", "admin123"
INSERT IGNORE INTO users (name, phone, email, password_hash, role, county, location, avatar_initials) VALUES
('Kevin Muli',    '0712345678', 'kevin@shambapoint.co.ke',
 '$2y$12$VvGFMaMqwz/zMLpj7qCp7eP9vRkQzFgqN6hS9D0IKvHJVnxERkzOu',
 'farmer', 'Nakuru', 'Nakuru Town', 'KM'),
('Amina Wanjiru', '0723456789', 'amina@shambapoint.co.ke',
 '$2y$12$VvGFMaMqwz/zMLpj7qCp7eP9vRkQzFgqN6hS9D0IKvHJVnxERkzOu',
 'farmer', 'Meru', 'Meru Town', 'AW'),
('Joseph Kamau',  '0734567890', 'joseph@shambapoint.co.ke',
 '$2y$12$VvGFMaMqwz/zMLpj7qCp7eP9vRkQzFgqN6hS9D0IKvHJVnxERkzOu',
 'buyer',  'Nairobi', 'Westlands', 'JK'),
('Admin User',    '0700000001', 'admin@shambapoint.co.ke',
 '$2y$12$VvGFMaMqwz/zMLpj7qCp7eP9vRkQzFgqN6hS9D0IKvHJVnxERkzOu',
 'admin',  'Nairobi', 'CBD', 'AU');

-- ── Market Prices ───────────────────────────────
INSERT IGNORE INTO market_prices (produce_name, market_name, county, price_per_kg, trend, recorded_at) VALUES
('Kale (Sukuma)',  'Wakulima',    'Nairobi', 22.00, 'rising',   CURRENT_DATE),
('Kale (Sukuma)',  'City Market', 'Nairobi', 25.00, 'rising',   CURRENT_DATE),
('Tomatoes',       'Wakulima',    'Nairobi', 60.00, 'stable',   CURRENT_DATE),
('Tomatoes',       'City Market', 'Nairobi', 65.00, 'stable',   CURRENT_DATE),
('Red Onions',     'Wakulima',    'Nairobi', 80.00, 'rising',   CURRENT_DATE),
('Red Onions',     'City Market', 'Nairobi', 82.00, 'rising',   CURRENT_DATE),
('Carrots',        'Wakulima',    'Nairobi', 40.00, 'dropping', CURRENT_DATE),
('Carrots',        'City Market', 'Nairobi', 38.00, 'dropping', CURRENT_DATE),
('Potatoes',       'Wakulima',    'Nairobi', 44.00, 'stable',   CURRENT_DATE),
('Potatoes',       'City Market', 'Nairobi', 46.00, 'stable',   CURRENT_DATE),
('Avocado',        'Wakulima',    'Nairobi',120.00, 'rising',   CURRENT_DATE),
('Coffee AA',      'Wakulima',    'Nairobi',350.00, 'stable',   CURRENT_DATE),
('Tea Leaves',     'Wakulima',    'Nairobi',180.00, 'stable',   CURRENT_DATE),
('Maize',          'Wakulima',    'Nairobi', 35.00, 'rising',   CURRENT_DATE),
('Cabbage',        'Wakulima',    'Nairobi', 18.00, 'dropping', CURRENT_DATE);

-- ── Demo Listings ───────────────────────────────
INSERT IGNORE INTO listings
  (farmer_id, name, category, quantity_kg, price_per_kg, county, location, quality_grade, description, emoji, status) VALUES
(1, 'Kale (Sukuma Wiki)',      'Vegetables', 500,  18.00, 'Nakuru',  'Nakuru Town',   'Grade A', 'Fresh sukuma wiki harvested this morning. Pesticide-free.', '🥬', 'active'),
(1, 'Red Onions',              'Vegetables', 300,  65.00, 'Nakuru',  'Nakuru Town',   'Grade A', 'Dry red onions, well cured, minimal damage.', '🧅', 'active'),
(2, 'Tomatoes (Money Maker)',  'Vegetables', 250,  50.00, 'Meru',    'Meru Central',  'Grade B', 'Ripe tomatoes, ready for retail. Packed in 50kg crates.', '🍅', 'active'),
(2, 'Carrots',                 'Vegetables', 400,  32.00, 'Meru',    'Meru Central',  'Grade A', 'Freshly harvested carrots with tops removed.', '🥕', 'active'),
(1, 'Potatoes (Shangi)',       'Tubers',     800,  38.00, 'Nakuru',  'Gilgil',        'Grade A', 'Shangi variety. Uniform size. Ready for transport.', '🥔', 'active');

-- ── Demo Order ──────────────────────────────────
INSERT IGNORE INTO orders
  (listing_id, buyer_id, farmer_id, quantity_kg, unit_price, total_ksh, status, delivery_location, notes) VALUES
(1, 3, 1, 100, 18.00, 1800.00, 'confirmed', 'Westlands Market, Nairobi', 'Deliver by Thursday morning please.');

-- ── Demo Logistics ──────────────────────────────
INSERT IGNORE INTO logistics
  (farmer_id, order_id, route_from, route_to, vehicle_type, driver_name, driver_phone,
   departure_date, pooled_count, cost_ksh, status) VALUES
(1, 1, 'Nakuru Town', 'Westlands, Nairobi', 'truck', 'James Kariuki', '0711000111',
 DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 1, 4500.00, 'confirmed');

-- ── Demo M-PESA transaction ─────────────────────
INSERT IGNORE INTO mpesa_transactions
  (user_id, order_id, direction, amount_ksh, phone, mpesa_code, status, description) VALUES
(3, 1, 'in', 1800.00, '254723456789', 'QKJ89DEMO1', 'completed', 'Payment for order #1 — Kale (Sukuma Wiki)');
