/**
 * Event Handlers
 * Subscribes to events on the central EventBus.
 * Demonstrates internal Event-Driven Architecture (EDA) & Service-Oriented Architecture (SOA).
 */
const eventBus = require('./eventBus');
const EVENT_TYPES = require('./eventTypes');
const scoringService = require('../services/scoringService');

function registerEventHandlers() {
  console.log('[EventHandlers] Initializing internal event bus listeners...');

  // User Registered Event Listener
  eventBus.on(EVENT_TYPES.USER_REGISTERED, (payload) => {
    console.log(`[Event: USER_REGISTERED] User ${payload.username} (${payload.userId}) signed up.`);
  });

  // Room Created Event Listener
  eventBus.on(EVENT_TYPES.ROOM_CREATED, (payload) => {
    console.log(`[Event: ROOM_CREATED] Room ${payload.roomId} created for ${payload.gameType} by user ${payload.creatorId}`);
  });

  // Player Joined Event Listener
  eventBus.on(EVENT_TYPES.PLAYER_JOINED, (payload) => {
    console.log(`[Event: PLAYER_JOINED] User ${payload.player.username} joined room ${payload.roomId} with symbol ${payload.player.symbol}`);
  });

  // Game Started Event Listener
  eventBus.on(EVENT_TYPES.GAME_STARTED, (payload) => {
    console.log(`[Event: GAME_STARTED] Match starting in room ${payload.roomId}. Players: ${payload.players.map(p => p.username).join(' vs ')}`);
  });

  // Move Made Event Listener
  eventBus.on(EVENT_TYPES.MOVE_MADE, (payload) => {
    console.log(`[Event: MOVE_MADE] Player ${payload.playerId} placed ${payload.symbol} at position ${payload.position} in room ${payload.roomId}`);
  });

  // Game Won Event Listener -> Triggers Scoring Service & Analytics Update
  eventBus.on(EVENT_TYPES.GAME_WON, async (payload) => {
    console.log(`[Event: GAME_WON] Room ${payload.roomId}: Winner ${payload.winnerId} (${payload.winnerSymbol})! Triggering ScoringService...`);
    try {
      await scoringService.processWin({
        roomId: payload.roomId,
        gameId: payload.gameId,
        gameType: payload.gameType,
        winnerId: payload.winnerId,
        loserId: payload.loserId,
        customPolicy: payload.customPolicy,
        startedAt: payload.startedAt
      });
    } catch (err) {
      console.error('[Event: GAME_WON] Error processing scoring:', err);
    }
  });

  // Game Draw Event Listener -> Triggers Scoring Service & Analytics Update
  eventBus.on(EVENT_TYPES.GAME_DRAW, async (payload) => {
    console.log(`[Event: GAME_DRAW] Room ${payload.roomId}: Game ended in a DRAW. Triggering ScoringService...`);
    try {
      await scoringService.processDraw({
        roomId: payload.roomId,
        gameId: payload.gameId,
        gameType: payload.gameType,
        playerIds: payload.playerIds,
        customPolicy: payload.customPolicy,
        startedAt: payload.startedAt
      });
    } catch (err) {
      console.error('[Event: GAME_DRAW] Error processing scoring:', err);
    }
  });

  // Game Completed Event Listener
  eventBus.on(EVENT_TYPES.GAME_COMPLETED, (payload) => {
    console.log(`[Event: GAME_COMPLETED] Room ${payload.roomId} completed. Result: ${payload.result}. Credits distributed.`);
  });

  // Player Left Event Listener
  eventBus.on(EVENT_TYPES.PLAYER_LEFT, (payload) => {
    console.log(`[Event: PLAYER_LEFT] Player ${payload.username} (${payload.userId}) left room ${payload.roomId}`);
  });
}

module.exports = { registerEventHandlers };
