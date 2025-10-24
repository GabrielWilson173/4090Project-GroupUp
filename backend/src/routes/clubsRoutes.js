const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', (req, res) => {
  db.all("SELECT * FROM clubs", [], (err, rows) => {
    res.json(rows);
  });
});

module.exports = router;