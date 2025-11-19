import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wordly',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
}

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

app.post('/api/submit', async (req, res) => {
  try {
    const { word } = req.body;
    const ip = getClientIp(req);
    const today = getTodayDate();

    if (!word || word.trim() === '') {
      return res.status(400).json({ error: 'Kata tidak boleh kosong' });
    }

    const connection = await pool.getConnection();

    try {
      const [existingRecords] = await connection.execute(
        'SELECT id FROM inputs WHERE ip_address = ? AND DATE(created_at) = ?',
        [ip, today]
      );

      if (existingRecords.length > 0) {
        return res.status(403).json({
          error: 'Anda sudah menginput kata hari ini. Coba lagi besok.',
        });
      }

      await connection.execute(
        'INSERT INTO inputs (ip_address, word, created_at) VALUES (?, ?, NOW())',
        [ip, word.trim()]
      );

      res.status(201).json({
        success: true,
        message: 'Kata berhasil disimpan',
        word: word.trim(),
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.get('/api/words', async (req, res) => {
  try {
    const today = getTodayDate();
    const connection = await pool.getConnection();

    try {
      const [words] = await connection.execute(
        'SELECT word, COUNT(*) as count FROM inputs WHERE DATE(created_at) = ? GROUP BY word ORDER BY count DESC',
        [today]
      );

      res.json({
        date: today,
        words: words.map((row) => ({
          text: row.word,
          value: row.count,
        })),
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
