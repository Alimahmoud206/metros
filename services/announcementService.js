const Announcement = require('../models/Announcement');
const Station = require('../models/Station');

// Returns a station's announcements newest-first, paginated, with an
// optional created-at date range filter.
const getAnnouncementsForStation = async (
  stationId,
  { page = 1, limit = 20, from, to } = {}
) => {
  const station = await Station.findById(stationId);

  if (!station) {
    const err = new Error('Station not found');
    err.status = 404;
    throw err;
  }

  const filter = { station: stationId };

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Announcement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Announcement.countDocuments(filter),
  ]);

  return {
    station,
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(Math.ceil(total / limitNum), 1),
    },
  };
};

// Creates a new announcement for a station. Caller (controller) is
// responsible for broadcasting it over the station's socket room.
const createAnnouncement = async (stationId, text) => {
  const station = await Station.findById(stationId);

  if (!station) {
    const err = new Error('Station not found');
    err.status = 404;
    throw err;
  }

  const announcement = await Announcement.create({ station: stationId, text });
  return announcement;
};

module.exports = { getAnnouncementsForStation, createAnnouncement };
