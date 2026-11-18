CREATE DATABASE IF NOT EXISTS library_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_management;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  membership_id VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','member') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(160) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  isbn VARCHAR(30) NOT NULL UNIQUE,
  quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_books_quantity CHECK (quantity >= 0)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NULL,
  user_id INT NULL,
  book_title VARCHAR(200) NOT NULL,
  member_name VARCHAR(120) NULL,
  transaction_type ENUM('borrow','return','restock') NOT NULL,
  quantity INT NOT NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transaction_book FOREIGN KEY (book_id)
    REFERENCES books(id) ON DELETE SET NULL,
  CONSTRAINT fk_transaction_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_transaction_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_books_title ON books(title);
