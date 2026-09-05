const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../myntra.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          brand TEXT NOT NULL,
          category TEXT NOT NULL,
          gender TEXT NOT NULL,
          price INTEGER NOT NULL,
          mrp INTEGER NOT NULL,
          discount INTEGER NOT NULL,
          rating REAL DEFAULT 4.2,
          rating_count INTEGER DEFAULT 120,
          image TEXT NOT NULL,
          sizes TEXT DEFAULT 'S,M,L,XL',
          description TEXT
        )
      `);

      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Cart Items table
      db.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          user_id INTEGER,
          product_id INTEGER NOT NULL,
          size TEXT NOT NULL,
          quantity INTEGER DEFAULT 1,
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);

      // Wishlist Items table
      db.run(`
        CREATE TABLE IF NOT EXISTS wishlist_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          user_id INTEGER,
          product_id INTEGER NOT NULL,
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          user_id INTEGER,
          total_amount INTEGER NOT NULL,
          shipping_name TEXT NOT NULL,
          shipping_address TEXT NOT NULL,
          payment_method TEXT DEFAULT 'COD',
          status TEXT DEFAULT 'ORDERED',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Order Items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          size TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          price INTEGER NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    });
  });
}

module.exports = { db, initDb };
