require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wordly_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware untuk mendeteksi IP user
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    req.connection.remoteAddress ||
    '127.0.0.1'
  );
};

app.use((req, res, next) => {
  req.clientIp = getClientIp(req);
  next();
});

// POST /api/submit - Submit kata baru
app.post('/api/submit', async (req, res) => {
  try {
    const { word } = req.body;
    const ip = req.clientIp;

    // Validasi input
    if (!word || word.trim().length === 0) {
      return res.status(400).json({ error: 'Kata tidak boleh kosong' });
    }

    if (word.length > 100) {
      return res.status(400).json({ error: 'Kata terlalu panjang (max 100 karakter)' });
    }

    // Cek apakah IP sudah input hari ini
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.query(
        'SELECT id FROM inputs WHERE ip_address = ? AND DATE(created_at) = DATE(NOW())',
        [ip]
      );

      if (rows.length > 0) {
        return res.status(403).json({
          error: 'Anda sudah melakukan input hari ini. Silakan coba lagi besok.'
        });
      }

      // Simpan kata ke database
      await connection.query(
        'INSERT INTO inputs (ip_address, word, created_at) VALUES (?, ?, NOW())',
        [ip, word.trim()]
      );

      res.status(201).json({
        success: true,
        message: 'Kata berhasil disimpan',
        word: word.trim()
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in /api/submit:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// GET /api/words - Ambil semua kata hari ini
app.get('/api/words', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.query(
        'SELECT word, COUNT(*) as frequency FROM inputs WHERE DATE(created_at) = DATE(NOW()) GROUP BY word ORDER BY frequency DESC'
      );

      res.status(200).json({
        success: true,
        words: rows
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in /api/words:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// GET /api/user-ip - Untuk debugging, lihat IP user
app.get('/api/user-ip', (req, res) => {
  res.json({ ip: req.clientIp });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
