require('dotenv').config();
const express = require('express');
const cors = require('cors');

const clubsController = require('./controllers/clubsController');
const userController = require('./controllers/userController');

const app = express();
app.use(cors());
app.use(express.json());

// Clubs
app.get('/api/clubs', clubsController.getAllClubs);

const { requireAuth } = require('./middleware/authMiddleware');

// Clubs (protected)
app.post('/api/clubs/:clubId/join', requireAuth, clubsController.joinClub);
app.post('/api/clubs/:clubId/leave', requireAuth, clubsController.leaveClub);



// Users
app.post('/api/users/register', userController.register);
app.post('/api/users/login', userController.login);
app.get('/api/users/me', requireAuth, userController.me);

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));