const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/clubs.db');

// Create basic table for testing
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  // Insert initial mock data if empty
  db.get("SELECT COUNT(*) AS count FROM clubs", (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO clubs (name) VALUES ('Cycling Club'), ('Yoga in the Park')");
    }
  });
});

module.exports = db;