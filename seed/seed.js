require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Station = require('../models/Station');
const Admin = require('../models/Admin');

// Cairo Metro-inspired sample data: 3 lines, ordered by real platform sequence.
const stations = [
  { name: 'Al Shohadaa', line: 'Line 1', order: 1 },
  { name: 'Nasser', line: 'Line 1', order: 2 },
  { name: 'Sadat', line: 'Line 1', order: 3 },
  { name: 'Sayeda Zeinab', line: 'Line 1', order: 4 },
  { name: 'Mar Girgis', line: 'Line 1', order: 5 },
  { name: 'Helwan', line: 'Line 1', order: 6 },
  { name: 'Shubra El-Kheima', line: 'Line 2', order: 1 },
  { name: 'Al-Khalafawy', line: 'Line 2', order: 2 },
  { name: 'Attaba', line: 'Line 2', order: 3 },
  { name: 'Mohamed Naguib', line: 'Line 2', order: 4 },
  { name: 'Cairo University', line: 'Line 2', order: 5 },
  { name: 'Giza', line: 'Line 2', order: 6 },
  { name: 'Adly Mansour', line: 'Line 3', order: 1 },
  { name: 'Stadium', line: 'Line 3', order: 2 },
  { name: 'Fair Zone', line: 'Line 3', order: 3 },
  { name: 'Heliopolis Square', line: 'Line 3', order: 4 },
  { name: 'Attaba (L3)', line: 'Line 3', order: 5 },
  { name: 'Kit Kat', line: 'Line 3', order: 6 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[seed] Connected to MongoDB');

    await Station.deleteMany({});
    const created = await Station.insertMany(stations);
    console.log(`[seed] Inserted ${created.length} stations`);

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@metro.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    await Admin.deleteMany({ email: adminEmail });
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await Admin.create({ email: adminEmail, passwordHash, role: 'admin' });
    console.log(`[seed] Created admin account: ${adminEmail}`);

    console.log('[seed] Done.');
    process.exit(0);
  } catch (err) {
    console.error('[seed] Failed:', err.message);
    process.exit(1);
  }
};

seed();
