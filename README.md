# Inventory Warehouse

End-to-end inventory management app with a Next.js (App Router) frontend and a Go (Gin + GORM) backend. Tracks master items, stock, purchase (pembelian), sales (penjualan), history logs, and reports. JWT-based authentication protects write operations.

## Project Structure

```
Inventory/
├─ client/warehouse/           # Next.js 16 frontend (React 19, Tailwind v4)
│  ├─ app/                     # App Router pages (barang, stok, pembelian, penjualan, laporan)
│  ├─ public/                  # Static assets
│  ├─ package.json             # Scripts (dev/build/start @ port 3001)
│  ├─ .env                     # NEXT_PUBLIC_URL (API base)
│  └─ next.config.ts           # Next config
└─ warehouse-api/              # Go backend (Gin, GORM, Postgres)
	 ├─ main.go                  # Server, CORS, route wiring (/api)
	 ├─ config/database.go       # DB init via env vars
	 ├─ handlers/                # HTTP handlers (auth, barang, stok, pembelian, penjualan, laporan)
	 ├─ repositories/            # DB access and business operations
	 ├─ models/                  # GORM models (users, master_barang, stok, header/detail)
	 ├─ migration/               # SQL schema + seed data
	 ├─ middleware/auth.go       # JWT verification (Bearer token)
	 ├─ utils/jwt.go             # Token generate/parse
	 ├─ hash_users.go            # Helper tool to hash seeded plaintext passwords
	 └─ .env                     # Backend environment variables
```

## Requirements

- Node.js 18+ (front-end)
- Go 1.21+ (back-end)
- PostgreSQL 14+ (database)

## Environment Variables

- Frontend (`client/warehouse/.env`)
	- `NEXT_PUBLIC_URL`: API base, e.g. `http://localhost:8080/api`

- Backend (`warehouse-api/.env`)
	- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE`
	- `JWT_SECRET`: secret for signing tokens
	- `JWT_EXPIRES_HOURS`: token validity in hours
	- `CLIENT_PORT`: origin allowed by CORS (e.g. `http://localhost:3001`)

## Database Setup

1) Create the database and user that match your backend `.env`.
2) Apply migrations in order:

```bash
# From repo root (Windows bash.exe)
psql -h localhost -U postgres -d warehouse -f warehouse-api/migration/001_init_schema.sql
psql -h localhost -U postgres -d warehouse -f warehouse-api/migration/002_seed_data.sql
```

3) Optional: Hash the seeded plaintext passwords to bcrypt using the helper tool:

```bash
cd warehouse-api
go run -tags hashusers ./hash_users.go
```

## Install & Run

Frontend (port 3001):

```bash
cd client/warehouse
npm install
npm run dev
# Open http://localhost:3001
```

Backend (port 8080):

```bash
cd warehouse-api
go mod download
go run main.go
# API: http://localhost:8080/api
```

Ensure `CLIENT_PORT=http://localhost:3001` in backend `.env` so the frontend can access the API via CORS.

## API Overview

Base URL: `http://localhost:8080/api`

- Auth
	- `POST /login` — authenticate with username + password
		- Body: `{ "username": "admin", "password": "..." }`
		- Response: `{ success, data: { token, user } }`
		- Use header `Authorization: Bearer <token>` for protected routes

- Barang (Items)
	- `GET /barang` — list items
	- `GET /barang/:id` — get item by ID
	- `POST /barang` — create item (protected)
	- `PUT /barang/:id` — update item (protected)
	- `GET /barang/stok` — items joined with stock

- Stok (Stock)
	- `GET /stok` — list stock entries
	- `GET /stok/:barang_id` — get stock by item ID

- History Stok
	- `GET /history-stok` — list stock change history
	- `GET /history-stok/:barang_id` — history for a specific item

- Pembelian (Purchases)
	- `POST /pembelian` — create purchase (protected)
		- Body: `{ no_faktur, supplier, user_id, items: [{ barang_id, qty, harga }] }`
	- `GET /pembelian` — list purchases (optional `start_date`, `end_date`)
	- `GET /pembelian/:id` — purchase detail (header + details)

- Penjualan (Sales)
	- `POST /penjualan` — create sale (protected)
		- Body: `{ no_faktur, customer, user_id, items: [{ barang_id, qty, harga }] }`
		- Returns 400 with message `Stok tidak mencukupi` if stock is insufficient
	- `GET /penjualan` — list sales (optional `start_date`, `end_date`)
	- `GET /penjualan/:id` — sale detail (header + details)

- Laporan (Reports)
	- `GET /laporan/stok`
	- `GET /laporan/penjualan?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
	- `GET /laporan/pembelian?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

## Data Model (Summary)

- `users` — id, username, email, password (bcrypt), full_name, role
- `master_barang` — master items (kode_barang, nama_barang, satuan, harga)
- `mstok` — current stock per item (`stok_akhir`)
- `history_stok` — audit of stock changes (masuk/keluar/adjustment)
- `beli_header` / `beli_detail` — purchases
- `jual_header` / `jual_detail` — sales

## Quick Test (cURL)

```bash
# Login
curl -s -X POST "http://localhost:8080/api/login" \
	-H "Content-Type: application/json" \
	-d '{"username":"admin","password":"admin123"}'

# Use the token in subsequent requests
TOKEN="<paste_token_here>"

# List barang
curl -s "http://localhost:8080/api/barang" -H "Authorization: Bearer $TOKEN"

# Create penjualan
curl -s -X POST "http://localhost:8080/api/penjualan" \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{
		"no_faktur":"JUAL003",
		"customer":"PT Demo",
		"user_id":2,
		"items":[{"barang_id":2,"qty":1,"harga":350000}]
	}'
```

## Notes

- Frontend uses `NEXT_PUBLIC_URL` to reach the backend. Set it to your API base (`/api`).
- JWT secret and CORS origin must be configured in backend `.env`.
- Seed data inserts plaintext passwords. Run the `hash_users` tool to bcrypt-hash them in your DB.
- Default ports: frontend `3001`, backend `8080`.

