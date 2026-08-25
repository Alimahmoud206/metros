const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    line: {
      type: String,
      required: [true, 'Line is required'],
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
    },
  },
  { timestamps: true }
);

// Stations are always listed grouped by line, in platform order.
stationSchema.index({ line: 1, order: 1 });

module.exports = mongoose.model('Station', stationSchema);
