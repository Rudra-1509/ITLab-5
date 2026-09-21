# Multiplayer Game Platform Database Module

This database package provides the MongoDB and Mongoose persistence layer for the multiplayer game platform.

## Schema overview

### Users
- Stores authentication and statistical counters for each player.
- Uses unique indexes on `email` and `username`, plus a descending `credits` index for leaderboard queries.

### Games
- Stores supported game definitions such as Tic-Tac-Toe, Quiz, Crossword, and Word Formation.
- `gameType` is unique to prevent duplicate definitions.

### Rooms
- Stores active rooms, player assignments, board state, and current turn.
- Indexed by `status`, `gameType`, and `createdAt` for waiting-room queries and room lookups.

### Game History
- Stores permanent completed match records used for analytics and historical reporting.
- Indexed by `players.userId`, `completedAt`, and `gameType`.

## Relationships

- User creates rooms.
- User participates in game history records.
- Game defines rules and scoring for a room.
- Room produces one or more game history entries when completed.

## Repository architecture

Each repository hides Mongoose implementation details behind a stable API:

- `UserRepository`: `createUser`, `findByEmail`, `findByUsername`, `findById`, `updateUser`, `updateStats`, `incrementCredits`, `incrementWin`, `incrementLoss`, `incrementDraw`, `incrementTotalGames`, `getLeaderboard`
- `GameRepository`: `createGame`, `findById`, `findByType`, `findAll`, `updateGame`
- `RoomRepository`: `createRoom`, `findById`, `findWaitingRooms`, `joinRoom`, `updateRoom`, `updateBoard`, `updateTurn`, `completeRoom`, `deleteRoom`
- `GameHistoryRepository`: `createHistory`, `findByUserId`, `findByRoomId`, `findRecentGames`, `countTotalGames`

## Backend integration

The backend can use the repository module by importing the repository files directly instead of Mongoose models. This keeps the service layer independent from the database implementation details.

## Quick start

```bash
npm install
```

Start MongoDB locally:

```bash
mongod
```

Run the seed script:

```bash
node database/scripts/seed.js
```

Test the connection:

```bash
node -e "require('dotenv').config({ path: './.env' }); const { connectDatabase } = require('./database/config/database'); connectDatabase().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });"
```
