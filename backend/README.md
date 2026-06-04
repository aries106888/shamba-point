# ShambaPoint Backend API

A PHP + MySQL REST API for the ShambaPoint Agri-Tech platform, serving the React frontend at `http://localhost:5173`.

## ⚡ Quick Setup

### 1. Create the Database
Open **phpMyAdmin** → SQL tab → paste and run:
```
c:\Xampp\htdocs\Small-Farmers\backend\database\schema.sql
```
Or via MySQL CLI:
```bash
mysql -u root -p < database/schema.sql
```

### 2. Configure Credentials (if needed)
Edit `config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'shambapoint');
define('DB_USER', 'root');
define('DB_PASS', '');          // your XAMPP MySQL password
```

### 3. Enable mod_rewrite in XAMPP
- Open `C:\xampp\apache\conf\httpd.conf`
- Find `#LoadModule rewrite_module` → remove the `#`
- Restart Apache

### 4. Test the API
Open: **http://localhost/Small-Farmers/backend/dashboard**

---

## 📡 API Endpoints

Base URL: `http://localhost/Small-Farmers/backend`

### Auth
| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | `/auth?action=register` | `{name, phone, password, role, county}` | ❌ |
| POST | `/auth?action=login` | `{phone, password}` | ❌ |
| GET  | `/auth?action=me` | — | ✅ Bearer |

### Listings (Produce)
| Method | Path | Notes |
|--------|------|-------|
| GET  | `/listings` | `?county=&search=&status=active` |
| GET  | `/listings?id=1` | single listing |
| POST | `/listings` | create (farmer only) |
| PUT  | `/listings?id=1` | update (owner/admin) |
| DELETE | `/listings?id=1` | delete (owner/admin) |

### Orders
| Method | Path | Notes |
|--------|------|-------|
| GET  | `/orders` | scoped by role |
| POST | `/orders` | place order (buyer) |
| PUT  | `/orders?id=1&action=status` | `{status: confirmed}` |

### Market Prices
| Method | Path | Notes |
|--------|------|-------|
| GET  | `/prices` | `?produce=Kale&market=Wakulima` |
| POST | `/prices` | admin only |

### M-PESA
| Method | Path | Notes |
|--------|------|-------|
| GET  | `/mpesa?action=balance` | wallet balance |
| GET  | `/mpesa?action=history` | transactions |
| POST | `/mpesa?action=stk` | `{phone, amount, order_id}` STK push |
| POST | `/mpesa?action=callback` | Daraja webhook |

### Logistics
| Method | Path | Notes |
|--------|------|-------|
| GET  | `/logistics` | farmer's own routes |
| POST | `/logistics` | book transport |
| PUT  | `/logistics?id=1` | update status |

### Dashboard (aggregated)
| Method | Path | Notes |
|--------|------|-------|
| GET  | `/dashboard` | All stats + recent data in one call |

---

## 🔑 Authentication
All protected routes require:
```
Authorization: Bearer <jwt_token>
```
Tokens expire in 24 hours. Get one via `/auth?action=login`.

---

## 🌱 Demo Credentials
```
Phone:    0712345678
Password: farmer123
Role:     farmer
```

---

## 📂 File Structure
```
backend/
├── index.php              ← Main router
├── .htaccess              ← Apache rewrite rules
├── config/
│   ├── database.php       ← PDO connection + constants
│   ├── cors.php           ← CORS headers + JSON helpers
│   └── jwt.php            ← JWT sign/verify
├── api/
│   ├── auth.php           ← Register, login, me
│   ├── listings.php       ← Produce CRUD
│   ├── orders.php         ← Order management
│   ├── prices.php         ← Market prices
│   ├── mpesa.php          ← Daraja integration
│   ├── logistics.php      ← Transport tracking
│   └── dashboard.php      ← Aggregated stats
└── database/
    └── schema.sql         ← MySQL schema + seed data
```
