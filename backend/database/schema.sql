-- ══════════════════════════════════════════════════
--  ShambaPoint Database Schema
--  Run this once in phpMyAdmin or MySQL CLI
-- ══════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS shambapoint
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shambapoint;

-- ── USERS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  phone         VARCHAR(20)   NOT NULL UNIQUE,
  email         VARCHAR(160)  UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('farmer','buyer','admin') NOT NULL DEFAULT 'farmer',
  county        VARCHAR(80),
  location      VARCHAR(120),
  avatar_initials VARCHAR(4),
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── PRODUCE LISTINGS ─────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  farmer_id     INT UNSIGNED NOT NULL,
  name          VARCHAR(120) NOT NULL,
  category      VARCHAR(60),
  quantity_kg   DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_kg  DECIMAL(10,2) NOT NULL,
  county        VARCHAR(80),
  location      VARCHAR(120),
  quality_grade VARCHAR(40),
  description   TEXT,
  emoji         VARCHAR(8)   DEFAULT '🌿',
  status        ENUM('active','sold','expired','pending') NOT NULL DEFAULT 'active',
  expires_at    DATE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_farmer (farmer_id),
  INDEX idx_status (status),
  INDEX idx_county (county)
);

-- ── ORDERS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id    INT UNSIGNED NOT NULL,
  buyer_id      INT UNSIGNED NOT NULL,
  farmer_id     INT UNSIGNED NOT NULL,
  quantity_kg   DECIMAL(10,2) NOT NULL,
  unit_price    DECIMAL(10,2) NOT NULL,
  total_ksh     DECIMAL(12,2) NOT NULL,
  status        ENUM('pending','confirmed','in_transit','delivered','cancelled') NOT NULL DEFAULT 'pending',
  delivery_location VARCHAR(200),
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE RESTRICT,
  FOREIGN KEY (buyer_id)   REFERENCES users(id)    ON DELETE RESTRICT,
  FOREIGN KEY (farmer_id)  REFERENCES users(id)    ON DELETE RESTRICT,
  INDEX idx_buyer  (buyer_id),
  INDEX idx_farmer (farmer_id),
  INDEX idx_status (status)
);

-- ── MARKET PRICES ────────────────────────────────
CREATE TABLE IF NOT EXISTS market_prices (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  produce_name  VARCHAR(80)  NOT NULL,
  market_name   VARCHAR(80)  NOT NULL,   -- e.g. Wakulima, City Market
  county        VARCHAR(80),
  price_per_kg  DECIMAL(10,2) NOT NULL,
  trend         ENUM('rising','stable','dropping') NOT NULL DEFAULT 'stable',
  recorded_at   DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_produce (produce_name),
  INDEX idx_market  (market_name),
  INDEX idx_date    (recorded_at)
);

-- ── MPESA TRANSACTIONS ───────────────────────────
CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  order_id          INT UNSIGNED,
  direction         ENUM('in','out') NOT NULL,
  amount_ksh        DECIMAL(12,2) NOT NULL,
  phone             VARCHAR(20)  NOT NULL,
  mpesa_code        VARCHAR(30),            -- M-PESA confirmation code
  description       VARCHAR(200),
  daraja_request_id VARCHAR(80),
  daraja_response   JSON,
  status            ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_user   (user_id),
  INDEX idx_status (status)
);

-- ── LOGISTICS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS logistics (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id      INT UNSIGNED,
  farmer_id     INT UNSIGNED NOT NULL,
  route_from    VARCHAR(120) NOT NULL,
  route_to      VARCHAR(120) NOT NULL,
  vehicle_type  ENUM('truck','pickup','motorbike','handcart','other') DEFAULT 'truck',
  driver_name   VARCHAR(100),
  driver_phone  VARCHAR(20),
  departure_date DATE,
  status        ENUM('pending','confirmed','in_transit','delivered') NOT NULL DEFAULT 'pending',
  pooled_count  INT UNSIGNED DEFAULT 1,   -- number of farmers sharing this transport
  cost_ksh      DECIMAL(10,2),
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)  REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (farmer_id) REFERENCES users(id)  ON DELETE CASCADE,
  INDEX idx_farmer (farmer_id),
  INDEX idx_status (status)
);

-- ── COOPERATIVE GROUPS ───────────────────────────
CREATE TABLE IF NOT EXISTS cooperatives (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  county      VARCHAR(80),
  admin_id    INT UNSIGNED NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cooperative_members (
  cooperative_id INT UNSIGNED NOT NULL,
  user_id        INT UNSIGNED NOT NULL,
  joined_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cooperative_id, user_id),
  FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE
);

-- ── SEED: sample market prices ───────────────────
INSERT IGNORE INTO market_prices (produce_name, market_name, county, price_per_kg, trend, recorded_at) VALUES
('Kale',      'Wakulima', 'Nairobi', 22.00, 'rising',   CURRENT_DATE),
('Kale',      'City Market', 'Nairobi', 25.00, 'rising', CURRENT_DATE),
('Tomatoes',  'Wakulima', 'Nairobi', 60.00, 'stable',   CURRENT_DATE),
('Tomatoes',  'City Market', 'Nairobi', 65.00, 'stable', CURRENT_DATE),
('Onions',    'Wakulima', 'Nairobi', 80.00, 'rising',   CURRENT_DATE),
('Onions',    'City Market', 'Nairobi', 82.00, 'rising', CURRENT_DATE),
('Carrots',   'Wakulima', 'Nairobi', 40.00, 'dropping', CURRENT_DATE),
('Carrots',   'City Market', 'Nairobi', 38.00, 'dropping', CURRENT_DATE),
('Potatoes',  'Wakulima', 'Nairobi', 44.00, 'stable',   CURRENT_DATE),
('Potatoes',  'City Market', 'Nairobi', 46.00, 'stable', CURRENT_DATE),
('Avocado',   'Wakulima', 'Nairobi', 120.00, 'rising',  CURRENT_DATE),
('Coffee AA', 'Wakulima', 'Nairobi', 350.00, 'stable',  CURRENT_DATE),
('Tea Leaves','Wakulima', 'Nairobi', 180.00, 'stable',  CURRENT_DATE);

-- ── SEED: demo farmer ───────────────────────────
-- password: farmer123  (bcrypt hash)
INSERT IGNORE INTO users (name, phone, email, password_hash, role, county, location, avatar_initials)
VALUES ('Kevin Muli', '0712345678', 'kevin@shambapoint.co.ke',
        '$2y$12$VvGFMaMqwz/zMLpj7qCp7eP9vRkQzFgqN6hS9D0IKvHJVnxERkzOu',
        'farmer', 'Nakuru', 'Nakuru Town', 'KM');
