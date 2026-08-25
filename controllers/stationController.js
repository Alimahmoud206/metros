const { getAllStations } = require('../services/stationService');

// GET /api/v1/stations
const getStations = async (req, res, next) => {
  try {
    const stations = await getAllStations();
    res.status(200).json({ success: true, data: stations });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStations };
