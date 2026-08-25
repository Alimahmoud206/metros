require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/db');

// Requires a real MongoDB connection (MONGO_URI in .env) that has already
// been seeded via `npm run seed`, since the login test needs the seeded
// admin account to exist.
beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/v1/stations', () => {
  it('returns 200 with an array of stations', async () => {
    const res = await request(app).get('/api/v1/stations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns a token for valid admin credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: 'definitely-wrong-password',
      });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/stations/:id/announcements', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/v1/stations/507f1f77bcf86cd799439011/announcements')
      .send({ text: 'Test announcement' });
    expect(res.status).toBe(401);
  });
});
