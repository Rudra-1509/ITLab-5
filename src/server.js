/**
 * Server Entrypoint
 * Binds HTTP server & Socket.IO to 0.0.0.0 for LAN multiplayer access.
 */
const http = require('http');
const os = require('os');
const app = require('./app');
const config = require('./config/config');
const { initializeSocketServer } = require('./sockets/socketServer');
const { registerEventHandlers } = require('./events/eventHandlers');

// Initialize internal event bus listeners
registerEventHandlers();

// Create HTTP server wrapping Express
const httpServer = http.createServer(app);

// Attach Socket.IO
const io = initializeSocketServer(httpServer);

// Helper function to detect local network IPv4 addresses
function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ interface: name, address: net.address });
      }
    }
  }
  return addresses;
}

const PORT = config.port;
const HOST = config.host; // '0.0.0.0'

httpServer.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log(`🚀 Multiplayer Game Server is running on port ${PORT}`);
  console.log(`🌐 Environment: ${config.env}`);
  console.log(`🔒 Localhost:    http://localhost:${PORT}`);
  
  const lanAddresses = getNetworkAddresses();
  if (lanAddresses.length > 0) {
    console.log('📡 LAN IP Addresses (for Developer 1 & other machines):');
    lanAddresses.forEach(net => {
      console.log(`   - http://${net.address}:${PORT} (${net.interface})`);
    });
  } else {
    console.log(`📡 Bound to all interfaces (0.0.0.0:${PORT})`);
  }
  console.log('⚡ Socket.IO is ready for real-time multiplayer connections');
  console.log('====================================================');

  // Pre-seed demo accounts for seamless presentation & testing
  (async () => {
    try {
      const authService = require('./services/authService');
      await authService.register({
        username: 'Player1',
        email: 'player1@example.com',
        password: 'password123'
      });
      await authService.register({
        username: 'Player2',
        email: 'player2@example.com',
        password: 'password123'
      });
      console.log('✅ Pre-seeded demo accounts: player1@example.com, player2@example.com (password123)');
    } catch (e) {
      // Ignore if already registered
    }
  })();
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down server...');
  httpServer.close(() => {
    console.log('HTTP and Socket server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, closing server...');
  httpServer.close(() => {
    process.exit(0);
  });
});

module.exports = { httpServer, io };
