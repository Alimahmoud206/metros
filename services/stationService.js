const Station = require('../models/Station');

// All stations, sorted by line then by platform order.
// This is the query the frontend dropdown, map, and train animation depend on.
const getAllStations = async () => {
  return Station.find().sort({ line: 1, order: 1 });
};

const getStationById = async (stationId) => {
  return Station.findById(stationId);
};

module.exports = { getAllStations, getStationById };
