const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Correct path (go up two folders from /src/models)
const dbPath = path.resolve(__dirname, '../../database/club_management.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

module.exports = db;
