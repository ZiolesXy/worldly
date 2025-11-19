# Wordly Backend

Backend API untuk aplikasi Wordly menggunakan Node.js + Express + MySQL.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Jalankan development server
npm run dev

# Atau production
npm start
```

## Environment Variables

Buat file `.env` berdasarkan `.env.example`:

```
DB_HOST=localhost          # Host MySQL
DB_USER=root              # User MySQL
DB_PASSWORD=              # Password MySQL
DB_NAME=wordly_db         # Nama database
PORT=5000                 # Port server
NODE_ENV=development      # Environment
```

## Database Setup

Jalankan SQL script untuk membuat database dan tabel:

```bash
mysql -u root -p < database.sql
```

Atau manual:
```sql
CREATE DATABASE wordly_db;
USE wordly_db;

CREATE TABLE inputs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(50) NOT NULL,
  word VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_date (ip_address, DATE(created_at))
);
```

## API Endpoints

### POST /api/submit
Submit kata baru

```bash
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"word": "inspirasi"}'
```

### GET /api/words
Ambil semua kata hari ini

```bash
curl http://localhost:5000/api/words
```

### GET /api/user-ip
Lihat IP user (debugging)

```bash
curl http://localhost:5000/api/user-ip
```

### GET /api/health
Health check

```bash
curl http://localhost:5000/api/health
```

## Architecture

- **Express.js** - Web framework
- **MySQL2** - Database driver dengan promise support
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables management

## Key Features

✅ IP Detection dari request header
✅ Daily limit validation (1 kata per IP per hari)
✅ Frequency counting untuk wordcloud
✅ Error handling yang robust
✅ Connection pooling untuk performance

## Development

```bash
# Dengan auto-reload (nodemon)
npm run dev

# Lint (jika ada)
npm run lint
```

## Production Deployment

1. Set environment variables di platform deployment
2. Build: `npm install --production`
3. Start: `npm start`
4. Pastikan MySQL accessible dari server

## Troubleshooting

**Error: "connect ECONNREFUSED"**
- MySQL server tidak berjalan
- Cek DB_HOST dan DB_USER di .env

**Error: "ER_BAD_DB_ERROR"**
- Database belum dibuat
- Jalankan `mysql -u root -p < database.sql`

**CORS Error**
- CORS sudah enabled untuk semua origin
- Pastikan frontend request ke `http://localhost:5000`
