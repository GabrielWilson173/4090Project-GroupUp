require('dotenv').config(); // load .env in development
const express = require('express');
const cors = require('cors');

const clubsRoutes = require('./routes/clubsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Register API routes
app.use('/api/clubs', clubsRoutes);
app.use('/api/users', userRoutes);

// Basic health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
