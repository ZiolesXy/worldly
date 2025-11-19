# 🧪 Wordly - Testing Guide

Panduan lengkap untuk testing aplikasi Wordly.

## 🔧 Manual Testing

### Test Case 1: First User Input

**Objective:** Verify user dapat submit kata pertama

**Steps:**
1. Buka http://localhost:5173 di browser baru
2. Lihat IP user di header
3. Ketik kata "inspirasi" di input field
4. Klik tombol "Kirim"

**Expected Result:**
- ✅ Success message: "Kata 'inspirasi' berhasil disimpan!"
- ✅ Input field dikosongkan
- ✅ Wordcloud update dengan kata "inspirasi"
- ✅ Database: 1 row baru di tabel inputs

**Verify di Database:**
```sql
SELECT * FROM inputs WHERE DATE(created_at) = DATE(NOW());
```

---

### Test Case 2: Daily Limit - Same IP

**Objective:** Verify user tidak bisa submit 2x dalam sehari

**Steps:**
1. User yang sama (IP sama) coba input kata "semangat"
2. Klik tombol "Kirim"

**Expected Result:**
- ✅ Error message: "Anda sudah melakukan input hari ini. Silakan coba lagi besok."
- ✅ Input field tidak dikosongkan
- ✅ Wordcloud tidak update
- ✅ Database: Tidak ada row baru

---

### Test Case 3: Multiple Users - Different IPs

**Objective:** Verify multiple users bisa submit kata berbeda

**Steps:**
1. Buka browser 1 (atau incognito) - User A
2. User A input kata "cinta"
3. Buka browser 2 (atau incognito) - User B
4. User B input kata "cinta"

**Expected Result:**
- ✅ Kedua user bisa submit
- ✅ Wordcloud menampilkan "cinta" dengan frequency 2
- ✅ Database: 2 rows dengan word "cinta" tapi IP berbeda

**Verify di Database:**
```sql
SELECT word, COUNT(*) as frequency 
FROM inputs 
WHERE DATE(created_at) = DATE(NOW()) 
GROUP BY word;
```

Output:
```
word  | frequency
------|----------
cinta | 2
```

---

### Test Case 4: Input Validation - Empty Input

**Objective:** Verify sistem reject input kosong

**Steps:**
1. Jangan ketik apa-apa di input field
2. Klik tombol "Kirim"

**Expected Result:**
- ✅ Button disabled (tidak bisa diklik)
- ✅ Tidak ada request ke backend

---

### Test Case 5: Input Validation - Max Length

**Objective:** Verify sistem enforce max 100 karakter

**Steps:**
1. Ketik 101 karakter di input field
2. Observe input field

**Expected Result:**
- ✅ Input field hanya menerima 100 karakter
- ✅ Karakter ke-101 tidak bisa diketik

---

### Test Case 6: Wordcloud Update - Real-time

**Objective:** Verify wordcloud auto-update setiap 5 detik

**Steps:**
1. Buka 2 browser (User A dan User B)
2. User A submit kata "hari"
3. Observe wordcloud di User B

**Expected Result:**
- ✅ Wordcloud di User B update dalam 5 detik
- ✅ Kata "hari" muncul di wordcloud User B
- ✅ Tidak perlu refresh page

---

### Test Case 7: Timezone Boundary - Next Day

**Objective:** Verify daily limit reset di tengah malam

**Prerequisites:**
- Bisa mengubah system time atau database time

**Steps:**
1. User A submit kata "malam"
2. Ubah system time ke next day (00:01)
3. User A coba submit kata "pagi"

**Expected Result:**
- ✅ User A bisa submit (daily limit reset)
- ✅ Database: 2 rows dengan created_at di hari berbeda

---

### Test Case 8: Error Handling - Database Connection Lost

**Objective:** Verify graceful error handling saat database down

**Steps:**
1. Stop MySQL server
2. User coba submit kata
3. Observe error message

**Expected Result:**
- ✅ Error message: "Terjadi kesalahan. Silakan coba lagi."
- ✅ Tidak ada crash atau blank page
- ✅ User bisa retry setelah database online

---

### Test Case 9: Concurrent Requests

**Objective:** Verify sistem handle multiple requests simultaneously

**Steps:**
1. Buka 3 browser dengan IP berbeda
2. Semua submit kata "bersamaan" (dalam 1 detik)
3. Observe wordcloud

**Expected Result:**
- ✅ Semua kata tersimpan
- ✅ Wordcloud menampilkan 3 kata
- ✅ Tidak ada data corruption

---

### Test Case 10: IP Detection - Behind Proxy

**Objective:** Verify IP detection bekerja di behind proxy

**Steps:**
1. Setup reverse proxy (nginx/Apache)
2. Set header `X-Forwarded-For`
3. User submit kata

**Expected Result:**
- ✅ Backend detect IP dari header (bukan proxy IP)
- ✅ Daily limit bekerja dengan IP yang benar

---

## 🧬 API Testing (cURL)

### Test Submit Endpoint

```bash
# Test 1: Valid submission
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"word": "testing"}'

# Expected: 201 Created
# Response: {"success": true, "message": "Kata berhasil disimpan", "word": "testing"}
```

```bash
# Test 2: Empty word
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"word": ""}'

# Expected: 400 Bad Request
# Response: {"error": "Kata tidak boleh kosong"}
```

```bash
# Test 3: Word too long (>100 chars)
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"word": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}'

# Expected: 400 Bad Request
# Response: {"error": "Kata terlalu panjang (max 100 karakter)"}
```

```bash
# Test 4: Duplicate submission (same IP, same day)
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"word": "duplicate"}'

# First request: 201 Created
# Second request: 403 Forbidden
# Response: {"error": "Anda sudah melakukan input hari ini..."}
```

### Test Get Words Endpoint

```bash
# Get all words for today
curl http://localhost:5000/api/words

# Expected: 200 OK
# Response: 
# {
#   "success": true,
#   "words": [
#     {"word": "inspirasi", "frequency": 3},
#     {"word": "semangat", "frequency": 2}
#   ]
# }
```

### Test User IP Endpoint

```bash
# Get user IP
curl http://localhost:5000/api/user-ip

# Expected: 200 OK
# Response: {"ip": "127.0.0.1"}
```

### Test Health Check

```bash
# Health check
curl http://localhost:5000/api/health

# Expected: 200 OK
# Response: {"status": "OK"}
```

---

## 📊 Database Testing

### Verify Table Structure

```sql
DESCRIBE inputs;
```

Expected output:
```
Field      | Type         | Null | Key | Default           | Extra
-----------|--------------|------|-----|-------------------|------
id         | int          | NO   | PRI | NULL              | auto_increment
ip_address | varchar(50)  | NO   | MUL | NULL              |
word       | varchar(100) | NO   |     | NULL              |
created_at | datetime     | NO   |     | CURRENT_TIMESTAMP |
```

### Verify Index

```sql
SHOW INDEX FROM inputs;
```

Expected: Index `idx_ip_date` exists

### Test Query Performance

```sql
-- Test 1: Check if IP already submitted today
SELECT id FROM inputs 
WHERE ip_address = '127.0.0.1' 
AND DATE(created_at) = DATE(NOW());

-- Should use index idx_ip_date
EXPLAIN SELECT id FROM inputs 
WHERE ip_address = '127.0.0.1' 
AND DATE(created_at) = DATE(NOW());
```

### Test Data Integrity

```sql
-- Verify no duplicate IP per day
SELECT ip_address, DATE(created_at), COUNT(*) as count
FROM inputs
GROUP BY ip_address, DATE(created_at)
HAVING count > 1;

-- Expected: Empty result (no duplicates)
```

---

## 🔄 Load Testing

### Simple Load Test dengan Apache Bench

```bash
# Install ab (Apache Bench)
# macOS: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils
# Windows: Download dari Apache

# Test 1: 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:5000/api/words

# Test 2: POST requests (perlu file)
# Buat file post_data.txt:
# {"word": "loadtest"}

ab -n 100 -c 10 -p post_data.txt \
  -T application/json \
  http://localhost:5000/api/submit
```

### Load Test dengan Artillery

```bash
# Install artillery
npm install -g artillery

# Buat file load-test.yml
# Lihat contoh di bawah

# Run test
artillery run load-test.yml
```

**load-test.yml:**
```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up"
    - duration: 60
      arrivalRate: 100
      name: "Spike"

scenarios:
  - name: "Get Words"
    flow:
      - get:
          url: "/api/words"
  
  - name: "Submit Word"
    flow:
      - post:
          url: "/api/submit"
          json:
            word: "loadtest"
```

---

## ✅ Checklist Testing

- [ ] User dapat submit kata pertama
- [ ] Daily limit bekerja (reject 2x submit)
- [ ] Multiple users dapat submit kata berbeda
- [ ] Input validation bekerja (empty, max length)
- [ ] Wordcloud update real-time
- [ ] Error handling graceful
- [ ] Database queries optimized
- [ ] IP detection bekerja
- [ ] Concurrent requests handled
- [ ] API endpoints respond correctly
- [ ] Database integrity maintained
- [ ] Performance acceptable (< 200ms response time)

---

## 🐛 Known Issues & Workarounds

### Issue 1: Wordcloud tidak muncul
**Cause:** Tidak ada data atau library tidak load
**Workaround:** 
- Submit minimal 1 kata
- Check browser console untuk error
- Pastikan react-wordcloud installed

### Issue 2: Daily limit tidak bekerja
**Cause:** Timezone mismatch antara server dan database
**Workaround:**
- Set timezone MySQL: `SET GLOBAL time_zone = '+07:00';`
- Atau gunakan UTC di semua tempat

### Issue 3: IP detection salah
**Cause:** Behind proxy tanpa X-Forwarded-For header
**Workaround:**
- Configure proxy untuk set header
- Atau gunakan IP dari socket (less reliable)

---

## 📈 Performance Benchmarks

Target performance:
- API response time: < 200ms
- Database query time: < 50ms
- Frontend render time: < 500ms
- Wordcloud render time: < 1s

---

## 🚀 Regression Testing

Setelah setiap update, jalankan test cases:
1. First user input
2. Daily limit
3. Multiple users
4. Input validation
5. Wordcloud update
6. Error handling

---

## 📝 Test Report Template

```
Test Date: [DATE]
Tester: [NAME]
Environment: [DEV/STAGING/PROD]

Test Results:
- Test Case 1: [PASS/FAIL]
- Test Case 2: [PASS/FAIL]
- ...

Issues Found:
- [ISSUE 1]
- [ISSUE 2]

Notes:
[ADDITIONAL NOTES]
```
