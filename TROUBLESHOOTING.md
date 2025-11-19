# 🔧 Wordly - Troubleshooting Guide

Panduan lengkap untuk mengatasi masalah umum saat menjalankan aplikasi Wordly.

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot connect to database"

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Causes:**
- MySQL server tidak berjalan
- Database credentials salah
- Database belum dibuat

**Solutions:**

**Step 1: Pastikan MySQL berjalan**
```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

**Step 2: Cek MySQL connection**
```bash
mysql -u root -p
```

**Step 3: Cek .env file**
```bash
cat backend/.env
```

Pastikan:
- `DB_HOST=localhost` (atau IP yang benar)
- `DB_USER=root` (atau user yang benar)
- `DB_PASSWORD=` (sesuai dengan password Anda)

**Step 4: Buat database**
```bash
mysql -u root -p < backend/database.sql
```

**Step 5: Restart backend**
```bash
npm run dev
```

---

### Issue 2: "CORS error" di browser

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/submit' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causes:**
- Backend tidak berjalan
- Port backend salah
- CORS tidak dikonfigurasi

**Solutions:**

**Step 1: Pastikan backend berjalan**
```bash
# Terminal 1
cd backend
npm run dev

# Output: Server berjalan di http://localhost:5000
```

**Step 2: Pastikan frontend berjalan di port 5173**
```bash
# Terminal 2
npm run dev

# Output: Local: http://localhost:5173/
```

**Step 3: Cek API_BASE_URL di src/App.tsx**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

**Step 4: Refresh browser**
```
Ctrl+Shift+R (hard refresh)
```

**Step 5: Cek browser console**
```
F12 → Console → Lihat error message
```

---

### Issue 3: "Wordcloud tidak muncul"

**Symptoms:**
- Halaman load tapi wordcloud kosong
- Atau error di console

**Causes:**
- Tidak ada data di database
- react-wordcloud tidak terinstall
- Data format salah

**Solutions:**

**Step 1: Submit minimal 1 kata**
1. Buka http://localhost:5173
2. Ketik kata di input field
3. Klik tombol "Kirim"
4. Wordcloud harus muncul

**Step 2: Cek browser console**
```
F12 → Console → Lihat error message
```

**Step 3: Cek database**
```bash
mysql -u root -p wordly_db
SELECT * FROM inputs WHERE DATE(created_at) = DATE(NOW());
```

Harus ada minimal 1 row.

**Step 4: Reinstall dependencies**
```bash
npm install
npm run dev
```

**Step 5: Cek react-wordcloud version**
```bash
npm list react-wordcloud
```

Harus v1.2.7 atau lebih baru.

---

### Issue 4: "Bisa submit lebih dari 1 kata per hari"

**Symptoms:**
- User bisa submit 2x atau lebih dalam sehari
- Daily limit tidak bekerja

**Causes:**
- Timezone mismatch
- Index tidak dibuat
- Query salah

**Solutions:**

**Step 1: Cek timezone MySQL**
```bash
mysql -u root -p wordly_db
SELECT NOW(), UTC_TIMESTAMP();
```

Pastikan timezone sesuai dengan timezone aplikasi.

**Step 2: Set timezone MySQL**
```sql
SET GLOBAL time_zone = '+07:00';  -- Untuk WIB
```

Atau di my.cnf:
```
[mysqld]
default-time-zone = '+07:00'
```

**Step 3: Cek index**
```bash
mysql -u root -p wordly_db
SHOW INDEX FROM inputs;
```

Harus ada index `idx_ip_date`.

**Step 4: Recreate index**
```sql
DROP INDEX idx_ip_date ON inputs;
CREATE INDEX idx_ip_date ON inputs (ip_address, DATE(created_at));
```

**Step 5: Restart backend**
```bash
npm run dev
```

**Step 6: Clear database (untuk testing)**
```sql
DELETE FROM inputs;
```

---

### Issue 5: "Port 5000 sudah digunakan"

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Causes:**
- Backend sudah berjalan di port 5000
- Aplikasi lain menggunakan port 5000

**Solutions:**

**Step 1: Cek proses yang menggunakan port 5000**

**Windows:**
```bash
netstat -ano | findstr :5000
```

**macOS/Linux:**
```bash
lsof -i :5000
```

**Step 2: Kill proses**

**Windows:**
```bash
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
kill -9 <PID>
```

**Step 3: Atau gunakan port berbeda**

Edit `backend/.env`:
```
PORT=5001
```

Edit `src/App.tsx`:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

**Step 4: Restart backend**
```bash
npm run dev
```

---

### Issue 6: "Port 5173 sudah digunakan"

**Error Message:**
```
Port 5173 is in use, trying 5174
```

**Solutions:**

Vite akan otomatis menggunakan port berikutnya (5174, 5175, dst).

Atau gunakan port spesifik:
```bash
npm run dev -- --port 3000
```

---

### Issue 7: "npm install gagal"

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Causes:**
- Dependency conflict
- Node version tidak compatible

**Solutions:**

**Step 1: Update npm**
```bash
npm install -g npm@latest
```

**Step 2: Clear cache**
```bash
npm cache clean --force
```

**Step 3: Delete node_modules dan package-lock.json**
```bash
rm -rf node_modules package-lock.json
```

**Step 4: Reinstall**
```bash
npm install
```

**Step 5: Jika masih error, gunakan --legacy-peer-deps**
```bash
npm install --legacy-peer-deps
```

---

### Issue 8: "IP detection salah"

**Symptoms:**
- IP yang ditampilkan bukan IP user
- Daily limit tidak bekerja dengan benar

**Causes:**
- Behind proxy tanpa X-Forwarded-For header
- Reverse proxy tidak forward IP

**Solutions:**

**Step 1: Cek IP yang terdeteksi**
```bash
curl http://localhost:5000/api/user-ip
```

**Step 2: Jika behind proxy, set header**

**Nginx:**
```nginx
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header X-Real-IP $remote_addr;
```

**Apache:**
```apache
RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"
RequestHeader set X-Real-IP "%{REMOTE_ADDR}s"
```

**Step 3: Restart proxy**
```bash
sudo systemctl restart nginx
```

---

### Issue 9: "Database query timeout"

**Error Message:**
```
Error: Query timeout
```

**Causes:**
- Database besar (banyak data)
- Query tidak optimal
- Connection pool penuh

**Solutions:**

**Step 1: Cek jumlah data**
```sql
SELECT COUNT(*) FROM inputs;
```

**Step 2: Optimize query dengan index**
```sql
SHOW INDEX FROM inputs;
```

Pastikan index `idx_ip_date` ada.

**Step 3: Increase connection pool**

Edit `backend/server.js`:
```javascript
const pool = mysql.createPool({
  connectionLimit: 20,  // Dari 10 menjadi 20
  queueLimit: 0
});
```

**Step 4: Increase query timeout**

Edit `backend/server.js`:
```javascript
const connection = await pool.getConnection();
connection.query({ timeout: 10000 }, ...);  // 10 detik
```

---

### Issue 10: "Wordcloud rendering lambat"

**Symptoms:**
- Wordcloud render memakan waktu lama
- Browser freeze saat render

**Causes:**
- Terlalu banyak kata
- Browser resource terbatas

**Solutions:**

**Step 1: Limit jumlah kata**

Edit `src/App.tsx`:
```javascript
const wordcloudData = words
  .slice(0, 50)  // Hanya ambil 50 kata teratas
  .map(item => ({
    text: item.word,
    value: item.frequency * 10
  }));
```

**Step 2: Reduce wordcloud size**

Edit `src/App.tsx`:
```javascript
const options = {
  width: 400,   // Dari 600 menjadi 400
  height: 300,  // Dari 400 menjadi 300
  fontSizes: [15, 40]  // Dari [20, 60]
};
```

**Step 3: Increase refresh interval**

Edit `src/App.tsx`:
```javascript
const interval = setInterval(fetchWords, 10000);  // Dari 5000 menjadi 10000
```

---

### Issue 11: "Input field tidak bisa diketik"

**Symptoms:**
- Input field disabled
- Tidak bisa mengetik

**Causes:**
- Loading state true
- Button disabled

**Solutions:**

**Step 1: Cek browser console**
```
F12 → Console → Lihat error
```

**Step 2: Refresh page**
```
F5 atau Ctrl+R
```

**Step 3: Clear browser cache**
```
Ctrl+Shift+Delete → Clear browsing data
```

**Step 4: Restart frontend**
```bash
npm run dev
```

---

### Issue 12: "Error message tidak muncul"

**Symptoms:**
- Submit gagal tapi tidak ada error message
- Atau error message muncul tapi tidak hilang

**Causes:**
- State tidak update
- CSS error message hidden

**Solutions:**

**Step 1: Cek browser console**
```
F12 → Console → Lihat error
```

**Step 2: Cek CSS**

Edit `src/App.css`:
```css
.error-message {
  display: block;  /* Pastikan tidak hidden */
  padding: 1rem;
  background-color: #fee;
  color: #c33;
}
```

**Step 3: Cek state**

Edit `src/App.tsx`:
```javascript
console.log('Error:', error);  // Debug
```

---

### Issue 13: "Database file corrupted"

**Symptoms:**
- MySQL error saat query
- Database tidak bisa diakses

**Causes:**
- Improper shutdown
- Disk space penuh
- File corruption

**Solutions:**

**Step 1: Check database**
```bash
mysql -u root -p
CHECK TABLE inputs;
```

**Step 2: Repair database**
```sql
REPAIR TABLE inputs;
```

**Step 3: Jika tidak bisa diperbaiki, recreate**
```bash
mysql -u root -p
DROP DATABASE wordly_db;
CREATE DATABASE wordly_db;
```

Lalu jalankan:
```bash
mysql -u root -p < backend/database.sql
```

---

### Issue 14: "Memory leak / aplikasi jadi lambat"

**Symptoms:**
- Aplikasi jadi lambat seiring waktu
- Memory usage terus naik

**Causes:**
- Interval tidak di-cleanup
- Connection tidak di-release
- Memory leak di library

**Solutions:**

**Step 1: Cek cleanup di useEffect**

Edit `src/App.tsx`:
```javascript
useEffect(() => {
  const interval = setInterval(fetchWords, 5000);
  return () => clearInterval(interval);  // Cleanup
}, []);
```

**Step 2: Cek connection release**

Edit `backend/server.js`:
```javascript
const connection = await pool.getConnection();
try {
  // Query
} finally {
  connection.release();  // Pastikan di-release
}
```

**Step 3: Restart aplikasi**
```bash
npm run dev
```

---

### Issue 15: "Timezone error - sudah input tapi bisa input lagi"

**Symptoms:**
- User sudah input hari ini tapi bisa input lagi
- Atau sebaliknya, tidak bisa input padahal belum

**Causes:**
- Timezone server berbeda dengan timezone database
- DATE() function menggunakan timezone berbeda

**Solutions:**

**Step 1: Cek timezone**
```bash
mysql -u root -p wordly_db
SELECT NOW(), UTC_TIMESTAMP(), @@global.time_zone;
```

**Step 2: Set timezone yang sama**

**Option 1: Set di MySQL**
```sql
SET GLOBAL time_zone = '+07:00';  -- WIB
```

**Option 2: Set di .env**
```
TZ=Asia/Jakarta
```

**Option 3: Set di backend**
```javascript
process.env.TZ = 'Asia/Jakarta';
```

**Step 3: Verify timezone**
```bash
date  # Cek timezone system
```

**Step 4: Restart MySQL dan backend**
```bash
sudo systemctl restart mysql
npm run dev
```

---

## 🔍 Debugging Tips

### 1. Enable Logging

**Backend:**
```javascript
console.log('IP:', req.clientIp);
console.log('Word:', word);
console.log('Query result:', rows);
```

**Frontend:**
```javascript
console.log('Response:', response);
console.log('Error:', error);
```

### 2. Use Browser DevTools

```
F12 → Network tab → Lihat request/response
F12 → Console tab → Lihat error
F12 → Application tab → Lihat localStorage
```

### 3. Use MySQL Client

```bash
mysql -u root -p wordly_db
SELECT * FROM inputs;
SELECT * FROM inputs WHERE DATE(created_at) = DATE(NOW());
```

### 4. Use cURL untuk test API

```bash
curl -X GET http://localhost:5000/api/health
curl -X GET http://localhost:5000/api/user-ip
curl -X GET http://localhost:5000/api/words
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"word": "test"}'
```

### 5. Check Logs

**Backend logs:**
```bash
# Lihat output di terminal tempat npm run dev
```

**MySQL logs:**
```bash
# Windows
type "C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err"

# macOS
cat /usr/local/var/mysql/*.err

# Linux
tail -f /var/log/mysql/error.log
```

---

## 📞 Getting Help

1. **Check Documentation**
   - SETUP.md - Setup guide
   - ARCHITECTURE.md - System design
   - TESTING.md - Testing guide

2. **Check Browser Console**
   - F12 → Console → Lihat error message

3. **Check Backend Logs**
   - Lihat output di terminal npm run dev

4. **Check Database**
   - mysql -u root -p wordly_db
   - SELECT * FROM inputs;

5. **Restart Everything**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Restart MySQL
   - npm run dev (backend)
   - npm run dev (frontend)

---

## ✅ Checklist Sebelum Minta Help

- [ ] MySQL server berjalan
- [ ] Database wordly_db sudah dibuat
- [ ] Tabel inputs sudah dibuat
- [ ] Backend berjalan di port 5000
- [ ] Frontend berjalan di port 5173
- [ ] Browser console tidak ada error
- [ ] Backend logs tidak ada error
- [ ] Database bisa diakses dengan mysql client
- [ ] Sudah coba restart semua service
- [ ] Sudah coba clear browser cache

---

Semoga troubleshooting guide ini membantu! 🎉
