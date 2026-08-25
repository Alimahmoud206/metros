const mongoose = require('mongoose');

// Connects to MongoDB using the connection string in .env.
// Must resolve before the app starts serving requests, and must log
// the outcome (success or failure) to the console.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[db] MongoDB connection error: ${err.message}`);
    throw err;
  }
};

module.exports = connectDB;
