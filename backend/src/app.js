const express = require('express');
const cors = require('cors');
const clubsRoutes = require('./routes/clubsRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/clubs', clubsRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));