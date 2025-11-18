const db = require("../models/db");

exports.fetchAllClubs = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM clubs", [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};
