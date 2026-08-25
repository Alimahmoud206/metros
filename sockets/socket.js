// Every station gets its own Socket.io room, named "station:<id>".
// Exported so the announcement controller can broadcast to the same
// room name a socket joins here.
const stationRoom = (stationId) => `station:${stationId}`;

const viewerCount = (io, stationId) => {
  const room = io.sockets.adapter.rooms.get(stationRoom(stationId));
  return room ? room.size : 0;
};

const emitPresence = (io, stationId) => {
  io.to(stationRoom(stationId)).emit('presenceUpdate', {
    stationId,
    viewers: viewerCount(io, stationId),
  });
};

// Attaches all connection-level event handlers to a Socket.io server instance.
const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    // Tracks which station room this socket currently sits in, so we can
    // remove it from the old one whenever it switches stations.
    socket.currentStation = null;

    // Passenger picks / switches a station.
    socket.on('joinStation', (stationId) => {
      if (!stationId || typeof stationId !== 'string') return;

      const previousStation = socket.currentStation;

      if (previousStation && previousStation !== stationId) {
        socket.leave(stationRoom(previousStation));
      }

      socket.join(stationRoom(stationId));
      socket.currentStation = stationId;

      // Let the new room know a viewer joined...
      emitPresence(io, stationId);
      // ...and let the old room know a viewer left.
      if (previousStation && previousStation !== stationId) {
        emitPresence(io, previousStation);
      }
    });

    // Passenger explicitly leaves without joining a new station (e.g. closes the board).
    socket.on('leaveStation', () => {
      if (!socket.currentStation) return;
      const leftStation = socket.currentStation;
      socket.leave(stationRoom(leftStation));
      socket.currentStation = null;
      emitPresence(io, leftStation);
    });

    // Tab closed / connection dropped — clean up presence for whatever
    // room this socket was last sitting in.
    socket.on('disconnect', () => {
      if (!socket.currentStation) return;
      const leftStation = socket.currentStation;
      socket.currentStation = null;
      emitPresence(io, leftStation);
    });
  });
};

module.exports = registerSocketHandlers;
module.exports.stationRoom = stationRoom;
module.exports.viewerCount = viewerCount;
