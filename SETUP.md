# Wordly - Setup Guide

Aplikasi lengkap untuk berbagi satu kata per hari dengan wordcloud visualization.

## 📋 Prerequisites

- Node.js (v14+)
- MySQL Server (v5.7+)
- npm atau yarn

## 🗄️ Database Setup

### 1. Buat Database dan Tabel

Buka MySQL client dan jalankan:

```sql
CREATE DATABASE IF NOT EXISTS wordly_db;
USE wordly_db;

CREATE TABLE IF NOT EXISTS inputs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(50) NOT NULL,
  word VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_date (ip_address, DATE(created_at))
);
```

Atau gunakan file `backend/database.sql`:
```bash
mysql -u root -p < backend/database.sql
```

### 2. Konfigurasi Database Connection

Edit file `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wordly_db
PORT=5000
NODE_ENV=development
```

## 🚀 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Jalankan Server

```bash
# Development (dengan auto-reload)
npm run dev

# Production
npm start
```

Server akan berjalan di `http://localhost:5000`

### 3. Test Backend

Cek health check:
```bash
curl http://localhost:5000/api/health
```

Lihat IP Anda:
```bash
curl http://localhost:5000/api/user-ip
```

## 💻 Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173` (atau port lain yang ditampilkan)

### 3. Build untuk Production

```bash
npm run build
```

## 🔌 API Endpoints

### POST /api/submit
Submit kata baru dari user

**Request:**
```json
{
  "word": "inspirasi"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Kata berhasil disimpan",
  "word": "inspirasi"
}
```

**Response (403) - Sudah input hari ini:**
```json
{
  "error": "Anda sudah melakukan input hari ini. Silakan coba lagi besok."
}
```

### GET /api/words
Ambil semua kata dari hari ini dengan frequency

**Response:**
```json
{
  "success": true,
  "words": [
    { "word": "inspirasi", "frequency": 3 },
    { "word": "semangat", "frequency": 2 }
  ]
}
```

### GET /api/user-ip
Lihat IP address Anda (untuk debugging)

**Response:**
```json
{
  "ip": "192.168.1.1"
}
```

### GET /api/health
Health check

**Response:**
```json
{
  "status": "OK"
}
```

## 🏗️ Struktur Project

```
worldly/
├── backend/
│   ├── server.js           # Express server
│   ├── database.sql        # SQL setup script
│   ├── .env.example        # Environment variables template
│   └── package.json        # Backend dependencies
├── src/
│   ├── App.tsx            # Main React component
│   ├── App.css            # Styling
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── package.json           # Frontend dependencies
└── SETUP.md              # File ini
```

## 🔍 Fitur Utama

✅ **IP Detection** - Sistem otomatis mendeteksi IP user
✅ **Daily Limit** - Setiap IP hanya bisa input 1 kata per hari
✅ **Wordcloud** - Visualisasi kata-kata dalam bentuk cloud
✅ **Real-time Update** - Wordcloud update setiap 5 detik
✅ **Error Handling** - Pesan error yang user-friendly
✅ **Responsive Design** - Bekerja di mobile dan desktop

## 🐛 Troubleshooting

### "Cannot connect to database"
- Pastikan MySQL server berjalan
- Cek konfigurasi `.env` di backend
- Pastikan database `wordly_db` sudah dibuat

### "CORS error"
- Backend harus berjalan di `http://localhost:5000`
- Frontend harus berjalan di `http://localhost:5173`
- CORS sudah dikonfigurasi di backend

### "Wordcloud tidak muncul"
- Pastikan ada data di database (submit minimal 1 kata)
- Cek console browser untuk error
- Pastikan react-wordcloud terinstall dengan benar

### "Bisa submit lebih dari 1 kata per hari"
- Cek timezone server MySQL
- Pastikan index `idx_ip_date` sudah dibuat
- Restart backend server

## 📝 Development Notes

- Frontend menggunakan React 19 + TypeScript
- Backend menggunakan Express.js + MySQL2
- IP detection menggunakan header `x-forwarded-for` atau `x-real-ip`
- Wordcloud update otomatis setiap 5 detik
- Database menggunakan DATE() function untuk daily check

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy folder 'dist' ke Vercel/Netlify
```

### Backend (Heroku/Railway)
```bash
# Set environment variables di platform
# Deploy folder 'backend' ke platform
```

Pastikan update `API_BASE_URL` di `src/App.tsx` sesuai dengan backend URL production.

## 📄 License

MIT
