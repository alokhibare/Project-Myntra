const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'myntra_og_super_secret_key_2026';

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../')));

// Helper middleware for Auth token verification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) req.user = null;
    else req.user = user;
    next();
  });
}

app.use(authenticateToken);

// -------------------------------------------------------------
// PRODUCT ENDPOINTS
// -------------------------------------------------------------

app.get('/api/products', (req, res) => {
  const { category, gender, brand, search, minPrice, maxPrice, sort } = req.query;

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    sql += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }

  if (gender) {
    sql += ' AND (LOWER(gender) = LOWER(?) OR LOWER(gender) = "unisex")';
    params.push(gender);
  }

  if (brand) {
    const brandList = Array.isArray(brand) ? brand : [brand];
    sql += ` AND brand IN (${brandList.map(() => '?').join(',')})`;
    params.push(...brandList);
  }

  if (search) {
    sql += ' AND (LOWER(title) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ?)';
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  if (minPrice) {
    sql += ' AND price >= ?';
    params.push(parseInt(minPrice, 10));
  }

  if (maxPrice) {
    sql += ' AND price <= ?';
    params.push(parseInt(maxPrice, 10));
  }

  if (sort === 'price_asc') {
    sql += ' ORDER BY price ASC';
  } else if (sort === 'price_desc') {
    sql += ' ORDER BY price DESC';
  } else if (sort === 'discount_desc') {
    sql += ' ORDER BY discount DESC';
  } else if (sort === 'rating_desc') {
    sql += ' ORDER BY rating DESC';
  } else {
    sql += ' ORDER BY id DESC';
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/products/brands', (req, res) => {
  db.all('SELECT DISTINCT brand FROM products ORDER BY brand ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.brand));
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

// -------------------------------------------------------------
// COUPONS & PINCODE APIs
// -------------------------------------------------------------

app.post('/api/coupons/apply', (req, res) => {
  const { code, cartTotal } = req.body;
  const upperCode = (code || '').trim().toUpperCase();

  if (!upperCode) return res.status(400).json({ error: 'Please enter a coupon code' });

  if (upperCode === 'MYNTRA500') {
    if (cartTotal < 1000) {
      return res.status(400).json({ error: 'MYNTRA500 requires minimum order value of Rs. 1000' });
    }
    return res.json({ code: 'MYNTRA500', discountAmount: 500, message: 'Coupon MYNTRA500 applied! Flat ₹500 OFF' });
  }

  if (upperCode === 'MYNTRA200') {
    if (cartTotal < 500) {
      return res.status(400).json({ error: 'MYNTRA200 requires minimum order value of Rs. 500' });
    }
    return res.json({ code: 'MYNTRA200', discountAmount: 200, message: 'Coupon MYNTRA200 applied! Flat ₹200 OFF' });
  }

  if (upperCode === 'WELCOME20') {
    const discount = Math.min(Math.round(cartTotal * 0.20), 300);
    return res.json({ code: 'WELCOME20', discountAmount: discount, message: `Coupon WELCOME20 applied! 20% OFF (₹${discount})` });
  }

  res.status(400).json({ error: 'Invalid coupon code. Try MYNTRA500, MYNTRA200 or WELCOME20' });
});

app.get('/api/pincode/check', (req, res) => {
  const { pincode } = req.query;
  if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
    return res.status(400).json({ valid: false, message: 'Please enter a valid 6-digit pincode' });
  }
  const date = new Date();
  date.setDate(date.getDate() + 2);
  const deliveryDate = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  res.json({
    valid: true,
    pincode,
    deliveryDate,
    codAvailable: true,
    returnPolicy: '14 Days Easy Return & Exchange'
  });
});

app.get('/api/insider/status', (req, res) => {
  res.json({
    tier: 'Insider Elite',
    points: 1850,
    perks: ['Free Early Access to Sales', 'Free Express Delivery', '10% Extra Insider Rewards']
  });
});

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email.toLowerCase(), password_hash],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: err.message });
        }
        const token = jwt.sign({ id: this.lastID, name, email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: this.lastID, name, email } });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Encryption failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: req.user });
});

// -------------------------------------------------------------
// CART ENDPOINTS
// -------------------------------------------------------------

app.get('/api/cart', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'guest_session';
  const userId = req.user ? req.user.id : null;

  let sql = `
    SELECT c.id as cart_id, c.size, c.quantity, p.*
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.session_id = ? OR (c.user_id IS NOT NULL AND c.user_id = ?)
  `;

  db.all(sql, [sessionId, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/cart', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'guest_session';
  const userId = req.user ? req.user.id : null;
  const { product_id, size, quantity = 1 } = req.body;

  if (!product_id || !size) {
    return res.status(400).json({ error: 'Product ID and size are required' });
  }

  db.get(
    'SELECT * FROM cart_items WHERE (session_id = ? OR user_id = ?) AND product_id = ? AND size = ?',
    [sessionId, userId, product_id, size],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        db.run(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
          [quantity, row.id],
          (uErr) => {
            if (uErr) return res.status(500).json({ error: uErr.message });
            res.json({ message: 'Cart updated successfully' });
          }
        );
      } else {
        db.run(
          'INSERT INTO cart_items (session_id, user_id, product_id, size, quantity) VALUES (?, ?, ?, ?, ?)',
          [sessionId, userId, product_id, size, quantity],
          (iErr) => {
            if (iErr) return res.status(500).json({ error: iErr.message });
            res.json({ message: 'Added to bag' });
          }
        );
      }
    }
  );
});

app.put('/api/cart/:id', (req, res) => {
  const { quantity } = req.body;
  db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Quantity updated' });
  });
});

app.delete('/api/cart/:id', (req, res) => {
  db.run('DELETE FROM cart_items WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item removed from cart' });
  });
});

// -------------------------------------------------------------
// WISHLIST ENDPOINTS
// -------------------------------------------------------------

app.get('/api/wishlist', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'guest_session';
  const userId = req.user ? req.user.id : null;

  let sql = `
    SELECT w.id as wishlist_id, p.*
    FROM wishlist_items w
    JOIN products p ON w.product_id = p.id
    WHERE w.session_id = ? OR (w.user_id IS NOT NULL AND w.user_id = ?)
  `;

  db.all(sql, [sessionId, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/wishlist/toggle', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'guest_session';
  const userId = req.user ? req.user.id : null;
  const { product_id } = req.body;

  db.get(
    'SELECT * FROM wishlist_items WHERE (session_id = ? OR user_id = ?) AND product_id = ?',
    [sessionId, userId, product_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        db.run('DELETE FROM wishlist_items WHERE id = ?', [row.id], (dErr) => {
          if (dErr) return res.status(500).json({ error: dErr.message });
          res.json({ status: 'removed', message: 'Removed from Wishlist' });
        });
      } else {
        db.run(
          'INSERT INTO wishlist_items (session_id, user_id, product_id) VALUES (?, ?, ?)',
          [sessionId, userId, product_id],
          (iErr) => {
            if (iErr) return res.status(500).json({ error: iErr.message });
            res.json({ status: 'added', message: 'Saved to Wishlist' });
          }
        );
      }
    }
  );
});

// -------------------------------------------------------------
// ORDERS & CHECKOUT ENDPOINTS
// -------------------------------------------------------------

app.post('/api/orders', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'guest_session';
  const userId = req.user ? req.user.id : null;
  const { shipping_name, shipping_address, payment_method = 'COD', discount_applied = 0 } = req.body;

  if (!shipping_name || !shipping_address) {
    return res.status(400).json({ error: 'Shipping details are required' });
  }

  const sqlCart = `
    SELECT c.id as cart_id, c.size, c.quantity, p.id as product_id, p.price
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.session_id = ? OR (c.user_id IS NOT NULL AND c.user_id = ?)
  `;

  db.all(sqlCart, [sessionId, userId], (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total_amount = Math.max(subtotal + 99 - discount_applied, 0);

    db.run(
      'INSERT INTO orders (session_id, user_id, total_amount, shipping_name, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [sessionId, userId, total_amount, shipping_name, shipping_address, payment_method],
      function (oErr) {
        if (oErr) return res.status(500).json({ error: oErr.message });

        const orderId = this.lastID;
        const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES (?, ?, ?, ?, ?)');
        
        items.forEach(item => {
          stmt.run(orderId, item.product_id, item.size, item.quantity, item.price);
        });

        stmt.finalize(() => {
          db.run(
            'DELETE FROM cart_items WHERE session_id = ? OR (user_id IS NOT NULL AND user_id = ?)',
            [sessionId, userId],
            () => {
              res.json({
                message: 'Order placed successfully!',
                order_id: orderId,
                total_amount
              });
            }
          );
        });
      }
    );
  });
});

app.get('/api/orders', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'guest_session';
  const userId = req.user ? req.user.id : null;

  db.all(
    'SELECT * FROM orders WHERE session_id = ? OR (user_id IS NOT NULL AND user_id = ?) ORDER BY id DESC',
    [sessionId, userId],
    (err, orders) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(orders);
    }
  );
});

// Initialize DB & Start Server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  REAL MYNTRA SERVER RUNNING ON HTTP://LOCALHOST:${PORT}`);
    console.log(`=================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
