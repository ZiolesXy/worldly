# 🚀 Wordly - Quick Start Guide

Panduan cepat untuk menjalankan aplikasi Wordly dalam 5 menit.

## ⚡ Prerequisites

- Node.js v14+
- MySQL Server
- npm atau yarn

## 📋 Step-by-Step Setup

### Step 1: Setup Database (2 menit)

**Buka MySQL client dan jalankan:**

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

**Atau gunakan command line:**
```bash
mysql -u root -p < backend/database.sql
```

### Step 2: Setup Backend (1 menit)

**Terminal 1:**
```bash
cd backend
npm install
```

**Edit `.env` file:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=wordly_db
PORT=5000
NODE_ENV=development
```

**Jalankan backend:**
```bash
npm run dev
```

Output:
```
Server berjalan di http://localhost:5000
```

### Step 3: Setup Frontend (1 menit)

**Terminal 2 (di root folder):**
```bash
npm install
npm run dev
```

Output:
```
  VITE v7.2.2  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 4: Buka Browser (1 menit)

Buka **http://localhost:5173** di browser Anda.

Selesai! 🎉

## ✅ Verify Setup

### Test 1: Submit Kata
1. Ketik kata di input field
2. Klik tombol "Kirim"
3. Verify: Success message muncul

### Test 2: Daily Limit
1. Coba input kata lagi
2. Verify: Error message "Anda sudah melakukan input hari ini..."

### Test 3: Wordcloud
1. Buka browser lain (atau incognito)
2. Input kata berbeda
3. Verify: Wordcloud update dengan 2 kata

## 🔍 Debugging

### Check Backend Health
```bash
curl http://localhost:5000/api/health
```

### Check Your IP
```bash
curl http://localhost:5000/api/user-ip
```

### Check Today's Words
```bash
curl http://localhost:5000/api/words
```

### Check Database
```bash
mysql -u root -p wordly_db
SELECT * FROM inputs WHERE DATE(created_at) = DATE(NOW());
```

## 🛑 Troubleshooting

### "Cannot connect to database"
```bash
# Pastikan MySQL running
mysql -u root -p -e "SELECT 1"

# Cek .env file di backend folder
cat backend/.env
```

### "CORS error di browser"
- Pastikan backend berjalan di `http://localhost:5000`
- Pastikan frontend berjalan di `http://localhost:5173`
- Refresh browser (Ctrl+Shift+R)

### "Port 5000 sudah digunakan"
```bash
# Ganti port di backend/.env
PORT=5001

# Update API_BASE_URL di src/App.tsx
const API_BASE_URL = 'http://localhost:5001/api';
```

### "Port 5173 sudah digunakan"
```bash
# Vite akan otomatis gunakan port berikutnya
npm run dev
```

## 📁 Project Structure

```
worldly/
├── backend/
│   ├── server.js          ← Backend API
│   ├── database.sql       ← Database schema
│   ├── .env.example       ← Environment template
│   └── package.json
├── src/
│   ├── App.tsx            ← Main React component
│   ├── App.css            ← Styling
│   └── main.tsx
├── package.json
├── SETUP.md               ← Detailed setup
├── ARCHITECTURE.md        ← System architecture
└── QUICKSTART.md          ← File ini
```

## 🎯 Next Steps

1. **Customize Styling**
   - Edit `src/App.css` untuk mengubah warna dan layout

2. **Customize Wordcloud**
   - Edit `options` di `src/App.tsx` untuk mengubah appearance

3. **Deploy**
   - Frontend: Deploy ke Vercel/Netlify
   - Backend: Deploy ke Heroku/Railway
   - Database: Gunakan managed MySQL (AWS RDS, DigitalOcean, etc)

4. **Add Features**
   - Authentication
   - User profiles
   - Word history
   - Export wordcloud as image

## 📚 Documentation

- **SETUP.md** - Detailed setup guide
- **ARCHITECTURE.md** - System design & flow
- **backend/README.md** - Backend documentation
- **API Endpoints** - Lihat di ARCHITECTURE.md

## 🆘 Need Help?

1. Check error message di browser console (F12)
2. Check backend logs di terminal
3. Check database dengan MySQL client
4. Baca ARCHITECTURE.md untuk detailed flow

## 🎉 Success Indicators

✅ Backend running di http://localhost:5000
✅ Frontend running di http://localhost:5173
✅ Database connected dan tabel sudah dibuat
✅ Bisa submit kata tanpa error
✅ Wordcloud muncul dengan kata-kata
✅ Daily limit bekerja (error 403 saat submit 2x)

Selamat! Aplikasi Wordly Anda sudah siap! 🌍
