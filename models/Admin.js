const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
