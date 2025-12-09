require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const clubsController = require('./controllers/clubsController');
const userController = require('./controllers/userController');
const organizerController = require('./controllers/organizerController');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg||jfif|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// ----------------------
// Clubs (public)
// ----------------------
app.get('/api/clubs', clubsController.getAllClubs);

// ----------------------
// Clubs (protected)
// ----------------------
app.post('/api/clubs/:clubId/join', requireAuth, clubsController.joinClub);
app.post('/api/clubs/:clubId/leave', requireAuth, clubsController.leaveClub);

// Feedback routes 
app.get('/api/clubs/:clubId/feedback', clubsController.getClubFeedback);
app.post('/api/clubs/:clubId/feedback', requireAuth, clubsController.submitFeedback);

// ----------------------
// Organizer (protected)
// ----------------------
app.get('/api/organizer/club-members/:clubId', requireAuth, organizerController.getClubMembers);
app.get('/api/organizer/my-clubs', requireAuth, organizerController.getMyClubs);
app.post(
  '/api/organizer/create-club',
  requireAuth,
  upload.single('image'),
  organizerController.createClub
);
app.put(
  '/api/organizer/edit-club/:clubId',
  requireAuth,
  upload.single('image'),
  organizerController.editClub
);
app.delete(
  '/api/organizer/delete-club/:clubId',
  requireAuth,
  organizerController.deleteClub
);

// ----------------------
// Users
// ----------------------
app.post('/api/users/register', userController.register);
app.post('/api/users/login', userController.login);
app.get('/api/users/me', requireAuth, userController.me);

// ----------------------
// Health
// ----------------------
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ----------------------
// Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
