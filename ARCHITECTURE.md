# Wordly - Architecture & Flow

Dokumentasi lengkap tentang arsitektur dan alur aplikasi Wordly.

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App.tsx                                             │  │
│  │  - Form input kata                                   │  │
│  │  - Wordcloud visualization                           │  │
│  │  - Error/Success messages                            │  │
│  │  - Real-time word updates (5s interval)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                    axios HTTP requests                      │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  server.js                                           │  │
│  │  - IP Detection Middleware                           │  │
│  │  - POST /api/submit (validate & save)                │  │
│  │  - GET /api/words (fetch today's words)              │  │
│  │  - GET /api/user-ip (debug)                          │  │
│  │  - GET /api/health (health check)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                    MySQL2 Connection Pool                   │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (MySQL)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  wordly_db                                           │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ inputs table                                    │ │  │
│  │  │ - id (PK)                                       │ │  │
│  │  │ - ip_address (VARCHAR 50)                       │ │  │
│  │  │ - word (VARCHAR 100)                            │ │  │
│  │  │ - created_at (DATETIME)                         │ │  │
│  │  │ - INDEX: (ip_address, DATE(created_at))         │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 User Flow

### 1. User Membuka Website

```
User membuka http://localhost:5173
    │
    ▼
React App Mount
    │
    ├─ fetchUserIp() → GET /api/user-ip
    │  └─ Tampilkan IP user di header
    │
    ├─ fetchWords() → GET /api/words
    │  └─ Ambil kata-kata hari ini
    │
    └─ setInterval(fetchWords, 5000)
       └─ Auto-refresh wordcloud setiap 5 detik
```

### 2. User Input Kata

```
User ketik kata di input field
    │
    ▼
User klik tombol "Kirim"
    │
    ▼
handleSubmit() dipanggil
    │
    ├─ Validasi input (tidak kosong, max 100 char)
    │
    ▼
POST /api/submit { word: "inspirasi" }
    │
    ▼
Backend: getClientIp() deteksi IP user
    │
    ├─ Dari header: x-forwarded-for
    ├─ Atau: x-real-ip
    ├─ Atau: socket.remoteAddress
    └─ Default: 127.0.0.1
    │
    ▼
Backend: Query database
    │
    SELECT id FROM inputs 
    WHERE ip_address = ? 
    AND DATE(created_at) = DATE(NOW())
    │
    ├─ Jika ada hasil (sudah input hari ini)
    │  │
    │  └─ Return 403 Forbidden
    │     └─ Error: "Anda sudah melakukan input hari ini..."
    │
    └─ Jika tidak ada hasil (belum input hari ini)
       │
       ▼
       INSERT INTO inputs (ip_address, word, created_at)
       VALUES (?, ?, NOW())
       │
       ▼
       Return 201 Created
       └─ Success: "Kata berhasil disimpan"
```

### 3. Frontend Menampilkan Hasil

```
Response dari backend diterima
    │
    ├─ Jika 201 (success)
    │  │
    │  ├─ Tampilkan success message
    │  ├─ Clear input field
    │  └─ fetchWords() → refresh wordcloud
    │
    └─ Jika 403 (sudah input)
       │
       └─ Tampilkan error message
```

### 4. Wordcloud Update

```
fetchWords() dipanggil
    │
    ▼
GET /api/words
    │
    ▼
Backend: Query database
    │
    SELECT word, COUNT(*) as frequency 
    FROM inputs 
    WHERE DATE(created_at) = DATE(NOW()) 
    GROUP BY word 
    ORDER BY frequency DESC
    │
    ▼
Return array of words dengan frequency
    │
    ▼
Frontend: Transform data untuk react-wordcloud
    │
    {
      text: "inspirasi",
      value: 30  // frequency * 10 untuk scale
    }
    │
    ▼
Render wordcloud dengan d3-cloud
```

## 🔐 IP Detection Logic

### Bagaimana IP Dideteksi?

```javascript
const getClientIp = (req) => {
  return (
    // 1. Cek header x-forwarded-for (proxy/load balancer)
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    
    // 2. Cek header x-real-ip (nginx proxy)
    req.headers['x-real-ip'] ||
    
    // 3. Cek socket remoteAddress
    req.socket.remoteAddress ||
    req.connection.remoteAddress ||
    
    // 4. Default fallback
    '127.0.0.1'
  );
};
```

### Urutan Prioritas:
1. **x-forwarded-for** - Diset oleh proxy/load balancer (production)
2. **x-real-ip** - Diset oleh nginx atau reverse proxy
3. **socket.remoteAddress** - IP langsung dari socket connection
4. **127.0.0.1** - Fallback jika semua gagal

## 📅 Daily Limit Validation

### Query untuk Cek Sudah Input Hari Ini:

```sql
SELECT id FROM inputs 
WHERE ip_address = '192.168.1.1' 
AND DATE(created_at) = DATE(NOW())
```

### Penjelasan:
- `ip_address = '192.168.1.1'` - Cocokkan dengan IP user
- `DATE(created_at) = DATE(NOW())` - Hanya cek hari ini
- Index `(ip_address, DATE(created_at))` - Optimize query

### Timezone Consideration:
- Query menggunakan `NOW()` yang mengikuti timezone server MySQL
- Pastikan timezone server MySQL sesuai dengan timezone aplikasi
- Atau gunakan `UTC_TIMESTAMP()` untuk consistency

## 📊 Frequency Calculation

### Database Query:
```sql
SELECT word, COUNT(*) as frequency 
FROM inputs 
WHERE DATE(created_at) = DATE(NOW()) 
GROUP BY word 
ORDER BY frequency DESC
```

### Contoh Result:
```
word        | frequency
------------|----------
inspirasi   | 3
semangat    | 2
cinta       | 1
```

### Frontend Transform:
```javascript
const wordcloudData = words.map(item => ({
  text: item.word,
  value: item.frequency * 10  // Scale untuk visibility
}));

// Result:
// [
//   { text: "inspirasi", value: 30 },
//   { text: "semangat", value: 20 },
//   { text: "cinta", value: 10 }
// ]
```

## 🔄 Real-time Update Mechanism

### Frontend Auto-refresh:

```javascript
useEffect(() => {
  fetchUserIp();
  fetchWords();
  
  // Refresh setiap 5 detik
  const interval = setInterval(fetchWords, 5000);
  return () => clearInterval(interval);
}, []);
```

### Keuntungan:
- ✅ Simple implementation
- ✅ Tidak perlu WebSocket
- ✅ Cocok untuk aplikasi kecil-menengah

### Alternatif (untuk production):
- WebSocket untuk real-time push
- Server-Sent Events (SSE)
- GraphQL Subscriptions

## 🛡️ Error Handling

### Frontend Error Cases:

```javascript
try {
  const response = await axios.post(`${API_BASE_URL}/submit`, {
    word: word.trim()
  });
  
  if (response.status === 201) {
    // Success
  }
} catch (err: any) {
  if (err.response?.status === 403) {
    // Sudah input hari ini
    setError(err.response.data.error);
  } else if (err.response?.status === 400) {
    // Input tidak valid
    setError(err.response.data.error);
  } else {
    // Server error
    setError('Terjadi kesalahan. Silakan coba lagi.');
  }
}
```

### Backend Error Cases:

| Status | Scenario | Message |
|--------|----------|---------|
| 201 | Success | Kata berhasil disimpan |
| 400 | Empty/invalid input | Kata tidak boleh kosong |
| 403 | Already submitted today | Anda sudah melakukan input hari ini... |
| 500 | Server error | Terjadi kesalahan server |

## 🗄️ Database Schema

### Table: inputs

```sql
CREATE TABLE inputs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(50) NOT NULL,
  word VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_date (ip_address, DATE(created_at))
);
```

### Index Explanation:
- `idx_ip_date` - Composite index untuk optimize query
- Mempercepat WHERE clause dengan `ip_address` dan `DATE(created_at)`
- Sangat penting untuk performance dengan data besar

### Contoh Data:
```
id | ip_address    | word       | created_at
---|---------------|------------|-------------------
1  | 192.168.1.1   | inspirasi  | 2024-01-15 10:30:00
2  | 192.168.1.2   | semangat   | 2024-01-15 11:45:00
3  | 192.168.1.1   | cinta      | 2024-01-16 09:15:00
```

## 🚀 Performance Considerations

### Optimizations:

1. **Connection Pooling**
   - MySQL2 dengan pool (10 connections)
   - Reuse connections untuk efficiency

2. **Database Indexing**
   - Index pada `(ip_address, DATE(created_at))`
   - Mempercepat daily limit check

3. **Frontend Caching**
   - Words di-cache di state
   - Refresh setiap 5 detik (configurable)

4. **CORS Optimization**
   - CORS enabled untuk semua origin (development)
   - Restrict di production

### Scalability Tips:

- Tambah connection pool size jika traffic tinggi
- Implementasi caching layer (Redis)
- Gunakan database replication untuk read scaling
- Implementasi rate limiting di backend

## 📝 API Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Kata berhasil disimpan",
  "word": "inspirasi"
}
```

### Error Response:
```json
{
  "error": "Anda sudah melakukan input hari ini. Silakan coba lagi besok."
}
```

### Words Response:
```json
{
  "success": true,
  "words": [
    { "word": "inspirasi", "frequency": 3 },
    { "word": "semangat", "frequency": 2 }
  ]
}
```

## 🔧 Configuration

### Backend (.env):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=wordly_db
PORT=5000
NODE_ENV=development
```

### Frontend (src/App.tsx):
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### Wordcloud Options (src/App.tsx):
```javascript
const options = {
  rotations: 2,              // Jumlah rotasi
  rotationAngles: [0, 90],   // Angle rotasi
  fontSizes: [20, 60],       // Min dan max font size
  width: 600,                // Width wordcloud
  height: 400,               // Height wordcloud
  deterministic: false       // Random atau deterministic
};
```

## 📱 Responsive Design

### Breakpoints:

```css
/* Desktop (default) */
.app-content {
  grid-template-columns: 1fr 1fr;
}

/* Mobile (max-width: 768px) */
@media (max-width: 768px) {
  .app-content {
    grid-template-columns: 1fr;
  }
  
  .input-group {
    flex-direction: column;
  }
}
```

## 🧪 Testing Scenarios

### Test Case 1: First User Input
1. User A membuka website
2. User A input kata "inspirasi"
3. Verify: Kata tersimpan, wordcloud update

### Test Case 2: Daily Limit
1. User B input kata "semangat"
2. User B coba input lagi
3. Verify: Error 403 ditampilkan

### Test Case 3: Multiple Users
1. User A input "cinta"
2. User B input "cinta"
3. Verify: Frequency = 2 di wordcloud

### Test Case 4: Timezone Boundary
1. Input kata di 23:59
2. Tunggu hingga 00:01 (next day)
3. Verify: User bisa input lagi

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS Error | Frontend & backend port berbeda | Pastikan CORS enabled di backend |
| 403 error terus | Timezone mismatch | Set timezone MySQL sama dengan app |
| Wordcloud kosong | Tidak ada data | Submit minimal 1 kata dulu |
| IP detection salah | Proxy tidak forward IP | Set x-forwarded-for header |
| Database connection error | MySQL tidak running | Start MySQL service |
