require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const registerSocketHandlers = require('./sockets/socket');

// Runs on port 3000 by default (override with PORT in .env).
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

// Made available to controllers via req.app.get('io') so REST handlers
// (e.g. postAnnouncement) can broadcast over the same server instance.
app.set('io', io);
registerSocketHandlers(io);

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`[server] Metro backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
};

start();

module.exports = server;
