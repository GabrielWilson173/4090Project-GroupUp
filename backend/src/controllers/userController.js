const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_strong_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // e.g. '7d' or '1h'

/**
 * Register new user
 * Expects: { name, email, password }
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password required' });
    }

    // Check for existing user
    db.get('SELECT id FROM Users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('DB error on user lookup:', err);
        return res.status(500).json({ error: 'internal server error' });
      }
      if (row) {
        return res.status(409).json({ error: 'email already registered' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      // Insert user
      const stmt = 'INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)';
      db.run(stmt, [name, email, password_hash], function (err) {
        if (err) {
          console.error('DB error on insert user:', err);
          return res.status(500).json({ error: 'could not create user' });
        }

        // On success, return the created user id (do not return password)
        return res.status(201).json({ id: this.lastID, name, email });
      });
    });
  } catch (e) {
    console.error('Register error:', e);
    return res.status(500).json({ error: 'internal server error' });
  }
}

/**
 * Login user
 * Expects: { email, password }
 * Returns: { token, user: { id, name, email } }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    db.get('SELECT id, name, email, password_hash FROM Users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('DB error on login lookup:', err);
        return res.status(500).json({ error: 'internal server error' });
      }
      if (!row) {
        return res.status(401).json({ error: 'invalid credentials' });
      }

      const match = await bcrypt.compare(password, row.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'invalid credentials' });
      }

      // Create token payload (minimal)
      const payload = { sub: row.id, email: row.email };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // Respond with token and basic user info
      return res.json({
        token,
        user: { id: row.id, name: row.name, email: row.email }
      });
    });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'internal server error' });
  }
}

/**
 * Utility route: get current user (requires auth middleware)
 */
function me(req, res) {
  // auth middleware should attach req.user { id, email }
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  db.get('SELECT id, name, email, created_at FROM Users WHERE id = ?', [req.user.id], (err, row) => {
    if (err) {
      console.error('DB error on me:', err);
      return res.status(500).json({ error: 'internal server error' });
    }
    if (!row) return res.status(404).json({ error: 'user not found' });
    return res.json({ user: row });
  });
}

module.exports = {
  register,
  login,
  me
};
