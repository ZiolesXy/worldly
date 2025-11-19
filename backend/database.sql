-- Buat database
CREATE DATABASE IF NOT EXISTS wordly_db;
USE wordly_db;

-- Buat tabel inputs
CREATE TABLE IF NOT EXISTS inputs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(50) NOT NULL,
  word VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip_date (ip_address, DATE(created_at))
);
