const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_strong_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw { status: 400, message: 'name, email and password required' };
  }

  return new Promise((resolve, reject) => {
    db.get('SELECT user_id FROM UserAccounts WHERE email = ?', [email], async (err, row) => {
      if (err) return reject({ status: 500, message: 'DB error on user lookup', err });
      if (row) return reject({ status: 409, message: 'email already registered' });

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      db.run(
        'INSERT INTO UserAccounts (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, password_hash],
        function (err) {
          if (err) return reject({ status: 500, message: 'DB error inserting user', err });
          resolve({ id: this.lastID, name, email });
        }
      );
    });
  });
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw { status: 400, message: 'email and password required' };
  }

  return new Promise((resolve, reject) => {
    db.get('SELECT user_id, name, email, password_hash FROM UserAccounts WHERE email = ?', [email], async (err, row) => {
      if (err) return reject({ status: 500, message: 'DB error on login lookup', err });
      if (!row) return reject({ status: 401, message: 'invalid credentials' });

      const match = await bcrypt.compare(password, row.password_hash);
      if (!match) return reject({ status: 401, message: 'invalid credentials' });

      const payload = { sub: row.user_id, email: row.email };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      resolve({
        token,
        user: { id: row.user_id, name: row.name, email: row.email }
      });
    });
  });
}

async function getCurrentUser(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT user_id, name, email, created_at FROM UserAccounts WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject({ status: 500, message: 'DB error fetching user', err });
      if (!row) return reject({ status: 404, message: 'user not found' });

      db.all('SELECT club_ref FROM ClubMembership WHERE user_ref = ?', [userId], (err, clubs) => {
        if (err) return reject({ status: 500, message: 'DB error fetching memberships', err });

        const joined_clubs = clubs.map(r => r.club_ref);
        resolve({
          id: row.user_id,
          name: row.name,
          email: row.email,
          created_at: row.created_at,
          joined_clubs
        });
      });
    });
  });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
