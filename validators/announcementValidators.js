const { body, param, query } = require('express-validator');

// GET /api/v1/stations/:id/announcements?page=&limit=&from=&to=
const listAnnouncementsValidator = [
  param('id').isMongoId().withMessage('Station id must be a valid id'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100'),
  query('from')
    .optional()
    .isISO8601()
    .withMessage('from must be a valid ISO 8601 date'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('to must be a valid ISO 8601 date'),
];

// POST /api/v1/stations/:id/announcements
const createAnnouncementValidator = [
  param('id').isMongoId().withMessage('Station id must be a valid id'),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Announcement text is required')
    .bail()
    .isLength({ max: 500 })
    .withMessage('Announcement text must be 500 characters or fewer'),
];

module.exports = { listAnnouncementsValidator, createAnnouncementValidator };
