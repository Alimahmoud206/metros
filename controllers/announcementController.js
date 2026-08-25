const {
  getAnnouncementsForStation,
  createAnnouncement,
} = require('../services/announcementService');
const { stationRoom } = require('../sockets/socket');

// GET /api/v1/stations/:id/announcements?page=&limit=&from=&to=
const getAnnouncements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, from, to } = req.query;

    const { items, pagination } = await getAnnouncementsForStation(id, {
      page,
      limit,
      from,
      to,
    });

    res.status(200).json({ success: true, data: items, pagination });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/stations/:id/announcements  (requireAdmin)
// Persists the announcement, then broadcasts it live to every passenger
// currently watching that station so REST state and socket state stay in sync.
const postAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const announcement = await createAnnouncement(id, text);

    const io = req.app.get('io');
    if (io) {
      io.to(stationRoom(id)).emit('announcement', announcement);
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnnouncements, postAnnouncement };
