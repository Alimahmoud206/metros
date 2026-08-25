const express = require('express');
const cors = require('cors');
const path = require('path');

const stationRoutes = require('./routes/stationRoutes');
const authRoutes = require('./routes/authRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check — must return a simple JSON status message with no errors.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Metro API is running' });
});

app.use('/api/v1/stations', stationRoutes);
app.use('/api/v1/auth', authRoutes);
// Announcement routes are station sub-resources, so they share the
// /api/v1/stations prefix (e.g. /api/v1/stations/:id/announcements).
app.use('/api/v1/stations', announcementRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
