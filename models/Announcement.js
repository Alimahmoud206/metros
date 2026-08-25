const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Announcement text is required'],
    trim: true,
    maxlength: [500, 'Announcement text must be 500 characters or fewer'],
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: [true, 'Station reference is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Announcements are always read newest-first, per station.
announcementSchema.index({ station: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
