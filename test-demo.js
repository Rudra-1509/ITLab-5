/**
 * Automated Verification and Demo Simulation Script
 * Tests the entire platform: REST APIs, Socket.IO, EventBus, Scoring, and Analytics.
 */
const http = require('http');
const ioClient = require('socket.io-client');
const app = require('./src/app');
const config = require('./src/config/config');
const { initializeSocketServer } = require('./src/sockets/socketServer');
const { registerEventHandlers } = require('./src/events/eventHandlers');

// Initialize event handlers
registerEventHandlers();

const server = http.createServer(app);
const io = initializeSocketServer(server);

const TEST_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// Helper for making JSON HTTP requests
function httpRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runDemo() {
  console.log('===========================================================');
  console.log('🧪 STARTING COMPREHENSIVE BACKEND VERIFICATION & DEMO SUITE');
  console.log('===========================================================');

  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`[Test Server] Listening on ${BASE_URL}\n`);

  try {
    // 1. Health Check
    console.log('Step 1: Testing Health Endpoint...');
    const healthRes = await httpRequest('GET', '/api/health');
    console.log('Health check response:', healthRes.body);
    if (healthRes.status !== 200 || healthRes.body.status !== 'ok') {
      throw new Error('Health check failed');
    }
    console.log('✅ Health check passed.\n');

    // 2. Authentication: Register Player 1 and Player 2
    console.log('Step 2: Testing User Registration...');
    const p1Reg = await httpRequest('POST', '/api/auth/register', {
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123'
    });
    console.log('Alice registration:', p1Reg.body);
    if (!p1Reg.body.success || !p1Reg.body.data.token) {
      throw new Error('Alice registration failed');
    }
    const tokenA = p1Reg.body.data.token;
    const userA = p1Reg.body.data.user;

    const p2Reg = await httpRequest('POST', '/api/auth/register', {
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123'
    });
    console.log('Bob registration:', p2Reg.body);
    if (!p2Reg.body.success || !p2Reg.body.data.token) {
      throw new Error('Bob registration failed');
    }
    const tokenB = p2Reg.body.data.token;
    const userB = p2Reg.body.data.user;
    console.log('✅ User registration passed.\n');

    // 3. User Login & Profile
    console.log('Step 3: Testing User Login & GET /api/auth/me...');
    const loginRes = await httpRequest('POST', '/api/auth/login', {
      email: 'alice@example.com',
      password: 'password123'
    });
    if (!loginRes.body.success) throw new Error('Login failed');

    const meRes = await httpRequest('GET', '/api/auth/me', null, tokenA);
    console.log('Alice profile (/api/auth/me):', meRes.body);
    if (meRes.body.data.user.username !== 'alice') throw new Error('/api/auth/me failed');
    console.log('✅ Auth & Profile verified.\n');

    // 4. Game Catalog
    console.log('Step 4: Fetching Game Definitions (/api/games)...');
    const gamesRes = await httpRequest('GET', '/api/games');
    console.log('Available games:', gamesRes.body.data.map(g => `${g.name} (${g.gameType})`));
    const ticTacToeGame = gamesRes.body.data.find(g => g.gameType === 'TIC_TAC_TOE');
    if (!ticTacToeGame) throw new Error('Tic-Tac-Toe game definition not found');
    console.log('✅ Game definitions verified.\n');

    // 5. Room Creation (Player 1)
    console.log('Step 5: Player 1 (Alice) creates a room...');
    const createRoomRes = await httpRequest('POST', '/api/rooms', { gameId: ticTacToeGame.id }, tokenA);
    console.log('Room created:', createRoomRes.body);
    const room = createRoomRes.body.data;
    if (!room || room.status !== 'WAITING' || room.players[0].symbol !== 'X') {
      throw new Error('Room creation failed');
    }
    const roomId = room.id;
    console.log(`✅ Room ${roomId} created with status WAITING.\n`);

    // 6. List Waiting Rooms
    console.log('Step 6: Listing available waiting rooms...');
    const roomsList = await httpRequest('GET', '/api/rooms?status=WAITING');
    console.log('Waiting rooms count:', roomsList.body.data.length);
    if (roomsList.body.data.length === 0) throw new Error('Waiting rooms list is empty');
    console.log('✅ Waiting rooms listed.\n');

    // 7. Socket.IO Real-Time Gameplay
    console.log('Step 7: Connecting Alice and Bob via Socket.IO...');
    const socketA = ioClient(BASE_URL, {
      auth: { token: tokenA },
      transports: ['websocket']
    });

    const socketB = ioClient(BASE_URL, {
      auth: { token: tokenB },
      transports: ['websocket']
    });

    await Promise.all([
      new Promise((res) => socketA.on('connect', res)),
      new Promise((res) => socketB.on('connect', res))
    ]);
    console.log('Alice socket connected:', socketA.id);
    console.log('Bob socket connected:', socketB.id);

    // Setup listeners for gameplay events
    const movesA = [];
    const movesB = [];
    let gameOverData = null;
    let gameStartedData = null;

    socketA.on('game_started', (data) => {
      console.log('⚡ [Alice Socket Event: game_started]:', data.players.map(p => `${p.username} (${p.symbol})`));
      gameStartedData = data;
    });

    socketB.on('game_started', (data) => {
      console.log('⚡ [Bob Socket Event: game_started]');
    });

    socketA.on('move_made', (data) => {
      movesA.push(data);
      console.log(`⚡ [Alice Socket Event: move_made]: ${data.symbol} placed at position ${data.position}, nextTurn: ${data.nextTurn}`);
    });

    socketB.on('move_made', (data) => {
      movesB.push(data);
      console.log(`⚡ [Bob Socket Event: move_made]: ${data.symbol} placed at position ${data.position}`);
    });

    socketA.on('game_over', (data) => {
      console.log('⚡ [Alice Socket Event: game_over]:', data);
      gameOverData = data;
    });

    socketB.on('game_over', (data) => {
      console.log('⚡ [Bob Socket Event: game_over]');
    });

    // Alice joins room channel
    console.log('Alice joins room channel via socket...');
    socketA.emit('join_room', { roomId });
    await delay(300);

    // Bob joins room channel via socket (triggers player_joined & game_started)
    console.log('Bob joins room channel via socket...');
    socketB.emit('join_room', { roomId });
    await delay(500);

    if (!gameStartedData) {
      throw new Error('game_started event was not received');
    }
    console.log('✅ Both players in room, match started.\n');

    // 8. Turn-by-turn game simulation
    // Grid positions:
    // 0 | 1 | 2
    // 3 | 4 | 5
    // 6 | 7 | 8
    // Alice (X) plays 0
    console.log('Move 1: Alice (X) plays position 0...');
    socketA.emit('make_move', { roomId, position: 0 });
    await delay(300);

    // Bob (O) plays 3
    console.log('Move 2: Bob (O) plays position 3...');
    socketB.emit('make_move', { roomId, position: 3 });
    await delay(300);

    // Alice (X) plays 1
    console.log('Move 3: Alice (X) plays position 1...');
    socketA.emit('make_move', { roomId, position: 1 });
    await delay(300);

    // Bob (O) plays 4
    console.log('Move 4: Bob (O) plays position 4...');
    socketB.emit('make_move', { roomId, position: 4 });
    await delay(300);

    // Alice (X) plays 2 -> Completes Row [0, 1, 2] -> WIN!
    console.log('Move 5: Alice (X) plays position 2 (Winning move!)...');
    socketA.emit('make_move', { roomId, position: 2 });
    await delay(600);

    // Verify game_over
    if (!gameOverData || gameOverData.result !== 'WIN' || gameOverData.winnerSymbol !== 'X') {
      throw new Error(`Game over mismatch: ${JSON.stringify(gameOverData)}`);
    }
    console.log('✅ Real-time game finished with WIN result for Alice!\n');

    // Disconnect sockets
    socketA.disconnect();
    socketB.disconnect();

    // 9. Verify Event-Driven Scoring & Credits
    console.log('Step 8: Verifying Scoring & Credit updates via Event Bus...');
    await delay(400); // Wait for async event handler completion

    const aliceAnalytics = await httpRequest('GET', '/api/analytics/me', null, tokenA);
    console.log('Alice Analytics (/api/analytics/me):', aliceAnalytics.body.data);
    if (aliceAnalytics.body.data.credits !== 20 || aliceAnalytics.body.data.wins !== 1) {
      throw new Error(`Alice credits expected 20, got ${aliceAnalytics.body.data.credits}`);
    }

    const bobAnalytics = await httpRequest('GET', '/api/analytics/me', null, tokenB);
    console.log('Bob Analytics (/api/analytics/me):', bobAnalytics.body.data);
    if (bobAnalytics.body.data.credits !== 2 || bobAnalytics.body.data.losses !== 1) {
      throw new Error(`Bob credits expected 2, got ${bobAnalytics.body.data.credits}`);
    }
    console.log('✅ Scoring Policy accurately applied (+20 for winner, +2 for loser).\n');

    // 10. Leaderboard Verification
    console.log('Step 9: Testing Leaderboard (/api/analytics/leaderboard)...');
    const leaderboard = await httpRequest('GET', '/api/analytics/leaderboard');
    console.log('Leaderboard:', leaderboard.body.data);
    if (leaderboard.body.data[0].username !== 'alice') {
      throw new Error('Alice should be #1 on leaderboard');
    }
    console.log('✅ Leaderboard correctly ranked.\n');

    // 11. Game History Verification
    console.log('Step 10: Testing Match History (/api/games/history)...');
    const aliceHistory = await httpRequest('GET', '/api/games/history', null, tokenA);
    console.log('Alice match history record:', aliceHistory.body.data);
    if (aliceHistory.body.data.length === 0 || aliceHistory.body.data[0].result !== 'WIN') {
      throw new Error('Match history record missing or invalid');
    }
    console.log('✅ Game History correctly recorded.\n');

    // 12. Platform Statistics
    console.log('Step 11: Testing Platform Game Stats (/api/analytics/games)...');
    const platformStats = await httpRequest('GET', '/api/analytics/games');
    console.log('Platform Stats:', platformStats.body.data);
    if (platformStats.body.data.totalPlayers < 2) {
      throw new Error('Platform stats total players incorrect');
    }
    console.log('✅ Platform Statistics verified.\n');

    console.log('===========================================================');
    console.log('🎉 ALL TESTS PASSED! BACKEND IS READY FOR TOMORROW\'S DEMO!');
    console.log('===========================================================');

  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runDemo();
