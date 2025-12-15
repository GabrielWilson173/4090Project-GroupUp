const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_strong_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function registerUser({ name, email, password, address, city, state, zip_code, latitude, longitude }) {
  if (!name || !email || !password) {
    throw { status: 400, message: 'name, email and password required' };
  }

  return new Promise((resolve, reject) => {

    db.get('SELECT user_id FROM UserAccounts WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error("[registerUser] DB error on lookup:", err);
        return reject({ status: 500, message: 'DB error on user lookup' });
      }
      if (row) {
        console.warn("[registerUser] email already registered:", email);
        return reject({ status: 409, message: 'email already registered' });
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      db.run(
        'INSERT INTO UserAccounts (name, email, password_hash, address, city, state, zip_code, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, password_hash, address || null, city || null, state || null, zip_code || null, latitude || null, longitude || null],
        function (err) {
          if (err) {
            console.error("[registerUser] DB error inserting user:", err);
            return reject({ status: 500, message: 'DB error inserting user' });
          }

          const user_id = this.lastID;

          const token = jwt.sign(
            { userId: user_id, email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
          );

          resolve({
            token,
            user: {
              id: user_id,
              name,
              email,
              latitude: latitude || null,
              longitude: longitude || null
            }
          });
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

    db.get(
      'SELECT user_id, name, email, password_hash, latitude, longitude FROM UserAccounts WHERE email = ?',
      [email],
      async (err, row) => {
        if (err) {
          console.error("[loginUser] DB error on lookup:", err);
          return reject({ status: 500, message: 'DB error on login lookup' });
        }
        if (!row) {
          console.warn("[loginUser] no user found for email:", email);
          return reject({ status: 401, message: 'invalid credentials' });
        }

        const match = await bcrypt.compare(password, row.password_hash);

        if (!match) {
          console.warn("[loginUser] invalid password for email:", email);
          return reject({ status: 401, message: 'invalid credentials' });
        }

        const payload = { userId: row.user_id, email: row.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        resolve({
          token,
          user: {
            id: row.user_id,
            name: row.name,
            email: row.email,
            latitude: row.latitude,
            longitude: row.longitude
          }
        });
      }
    );
  });
}

async function getCurrentUser(userId) {
  return new Promise((resolve, reject) => {

    db.get(
      'SELECT user_id, name, email, address, city, state, zip_code, latitude, longitude, created_at FROM UserAccounts WHERE user_id = ?',
      [userId],
      (err, row) => {
        if (err) {
          console.error("[getCurrentUser] DB error:", err);
          return reject({ status: 500, message: 'DB error fetching user' });
        }
        if (!row) {
          console.warn("[getCurrentUser] no row found for userId:", userId);
          return reject({ status: 404, message: 'User not found' });
        }

        db.all(
          'SELECT club_ref FROM ClubMembership WHERE user_ref = ?',
          [userId],
          (err, clubs) => {
            if (err) {
              console.error("[getCurrentUser] DB error fetching memberships:", err);
              return reject({ status: 500, message: 'DB error fetching memberships' });
            }

            const joined_clubs = Array.isArray(clubs)
              ? clubs.map(r => r.club_ref)
              : [];

            resolve({
              id: row.user_id,
              name: row.name,
              email: row.email,
              address: row.address,
              city: row.city,
              state: row.state,
              zip_code: row.zip_code,
              latitude: row.latitude,
              longitude: row.longitude,
              created_at: row.created_at,
              joined_clubs
            });
          }
        );
      }
    );
  });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};