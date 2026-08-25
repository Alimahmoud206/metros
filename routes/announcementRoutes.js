const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  postAnnouncement,
} = require('../controllers/announcementController');
const requireAdmin = require('../middleware/requireAdmin');
const validateRequest = require('../middleware/validateRequest');
const {
  listAnnouncementsValidator,
  createAnnouncementValidator,
} = require('../validators/announcementValidators');

// GET /api/v1/stations/:id/announcements — public read
router.get('/:id/announcements', listAnnouncementsValidator, validateRequest, getAnnouncements);

// POST /api/v1/stations/:id/announcements — admin only
router.post(
  '/:id/announcements',
  requireAdmin,
  createAnnouncementValidator,
  validateRequest,
  postAnnouncement
);

module.exports = router;
