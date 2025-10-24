const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/club_management.db');
const initSQL = path.join(__dirname, '../database/init.sql');

// Create database file if missing
if (!fs.existsSync(dbPath)) {
    console.log("Creating new database file...");
}

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(err.message);
});

// Execute initialization SQL
const initScript = fs.readFileSync(initSQL, 'utf-8');

db.exec(initScript, (err) => {
    if (err) {
        console.error("Error initializing database:", err.message);
    } else {
        console.log("Database initialized successfully.");
    }
    db.close();
});
