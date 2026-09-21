/**
 * Database Repository Contract & Integration Test
 * Verifies method signatures and contracts across all database repositories.
 */
const userRepo = require('../repositories/userRepository');
const gameRepo = require('../repositories/gameRepository');
const roomRepo = require('../repositories/roomRepository');
const historyRepo = require('../repositories/gameHistoryRepository');

async function testContracts() {
  console.log('===========================================================');
  console.log('🧪 VERIFYING DATABASE REPOSITORY INTERFACE CONTRACTS');
  console.log('===========================================================');

  // Verify UserRepository methods
  const userMethods = ['create', 'createUser', 'findById', 'findByEmail', 'findByUsername', 'updateStats', 'findAll', 'getLeaderboard'];
  for (const method of userMethods) {
    if (typeof userRepo[method] !== 'function') {
      throw new Error(`UserRepository missing method: ${method}`);
    }
  }
  console.log('✅ UserRepository contract verified: all 8 required methods present.');

  // Verify GameRepository methods
  const gameMethods = ['create', 'createGame', 'findById', 'findByType', 'findByGameType', 'findAll'];
  for (const method of gameMethods) {
    if (typeof gameRepo[method] !== 'function') {
      throw new Error(`GameRepository missing method: ${method}`);
    }
  }
  console.log('✅ GameRepository contract verified: all 6 required methods present.');

  // Verify RoomRepository methods
  const roomMethods = ['create', 'createRoom', 'findById', 'findWaitingRooms', 'joinRoom', 'update', 'updateRoom', 'delete', 'deleteRoom', 'findAll'];
  for (const method of roomMethods) {
    if (typeof roomRepo[method] !== 'function') {
      throw new Error(`RoomRepository missing method: ${method}`);
    }
  }
  console.log('✅ RoomRepository contract verified: all 10 required methods present.');

  // Verify GameHistoryRepository methods
  const historyMethods = ['create', 'createHistory', 'findByUserId', 'findByRoomId', 'countTotalGames'];
  for (const method of historyMethods) {
    if (typeof historyRepo[method] !== 'function') {
      throw new Error(`GameHistoryRepository missing method: ${method}`);
    }
  }
  console.log('✅ GameHistoryRepository contract verified: all 5 required methods present.');

  console.log('\n🎉 ALL DATABASE REPOSITORY CONTRACTS VERIFIED SUCCESSFULLY!');
  console.log('===========================================================');
}

testContracts().catch(err => {
  console.error('❌ Contract Verification Failed:', err);
  process.exit(1);
});
