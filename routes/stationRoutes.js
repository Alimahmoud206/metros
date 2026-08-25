const express = require('express');
const router = express.Router();
const { getStations } = require('../controllers/stationController');

// GET /api/v1/stations
router.get('/', getStations);

module.exports = router;
