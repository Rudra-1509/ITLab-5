/**
 * Socket.IO Server Initialization & Configuration
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userRepository = require('../repositories/userRepository');
const { setupGameSocket } = require('./gameSocket');

function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: false
    },
    transports: ['websocket', 'polling']
  });

  // Optional socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        const decoded = jwt.verify(cleanToken, config.jwt.secret);
        const user = await userRepository.findById(decoded.id);
        if (user) {
          const { passwordHash, ...safeUser } = user;
          socket.user = safeUser;
        }
      }
      next();
    } catch (err) {
      // Allow connection even if token fails; events can supply token or fail gracefully
      next();
    }
  });

  io.on('connection', (socket) => {
    setupGameSocket(io, socket);
  });

  return io;
}

module.exports = { initializeSocketServer };
