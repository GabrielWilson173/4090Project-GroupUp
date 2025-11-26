const organizerService = require('../services/organizerService');

async function getMyClubs(req, res) {
  try {
    const userId = req.user.userId;
    const clubs = await organizerService.fetchMyClubs(userId);
    res.json({ clubs });
  } catch (err) {
    console.error('Get my clubs error:', err);
    res.status(err.status || 500).json({ error: err.message || 'internal server error' });
  }
}

async function createClub(req, res) {
  try {
    const userId = req.user.userId;
    const clubData = {
      ...req.body,
      image_url: req.file ? `/uploads/${req.file.filename}` : null
    };
    
    const result = await organizerService.createNewClub(userId, clubData);
    res.status(201).json({ success: true, club: result });
  } catch (err) {
    console.error('Create club error:', err);
    res.status(err.status || 500).json({ error: err.message || 'internal server error' });
  }
}

async function editClub(req, res) {
  try {
    const userId = req.user.userId;
    const clubId = req.params.clubId;
    const clubData = {
      ...req.body,
      image_url: req.file ? `/uploads/${req.file.filename}` : null
    };
    
    const result = await organizerService.updateClub(userId, clubId, clubData);
    res.json({ success: true, club: result });
  } catch (err) {
    console.error('Edit club error:', err);
    res.status(err.status || 500).json({ error: err.message || 'internal server error' });
  }
}

module.exports = {
  getMyClubs,
  createClub,
  editClub
};



