-- ============================================================
--  Database: simple_api_db
--  Jalankan script ini sekali saat pertama setup
-- ============================================================

CREATE DATABASE IF NOT EXISTS simple_api_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE simple_api_db;

-- ── Tabel users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT           NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- ── Tabel products ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INT            NOT NULL AUTO_INCREMENT,
  name        VARCHAR(200)   NOT NULL,
  description TEXT,
  price       DECIMAL(15,2)  NOT NULL DEFAULT 0,
  stock       INT            NOT NULL DEFAULT 0,
  created_by  INT,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_name (name)
) ENGINE=InnoDB;

-- ── Seed: akun admin default ─────────────────────────────────
-- Password: Admin123!  (sudah di-hash bcrypt rounds=10)
INSERT IGNORE INTO users (name, email, password, role)
VALUES (
  'Admin',
  'admin@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
  'admin'
);

-- ── Seed: beberapa produk contoh ─────────────────────────────
INSERT IGNORE INTO products (name, description, price, stock, created_by)
VALUES
  ('Produk A', 'Deskripsi produk A', 50000,  100, 1),
  ('Produk B', 'Deskripsi produk B', 120000, 50,  1),
  ('Produk C', 'Deskripsi produk C', 35000,  200, 1);
