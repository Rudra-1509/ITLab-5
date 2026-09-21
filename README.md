# Multiplayer Gaming Platform - Backend Service

Authoritative backend engine for a real-time multiplayer game platform (featuring Tic-Tac-Toe), engineered with client-server architecture, RESTful APIs, Socket.IO, internal event-driven architecture (EDA), service-oriented architecture (SOA), credit/scoring systems, and database repository abstraction.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Inside the backend directory
npm install
```

### 2. Configure Environment (Optional)
The defaults in `.env` are ready for instant execution:
```env
PORT=5000
NODE_ENV=development
HOST=0.0.0.0
CORS_ORIGIN=*
JWT_SECRET=super_secret_jwt_key_project5_college_demo_2024
JWT_EXPIRES_IN=7d
SCORING_PARTICIPATION=5
SCORING_WIN=20
SCORING_DRAW=10
SCORING_LOSS=2
```

### 3. Run Server
```bash
# Production mode
npm start

# Development mode (auto-reload with nodemon)
npm run dev
```

### 4. Run Automated Demo & Verification Test
```bash
npm test
```

---

## 📡 Multi-Machine LAN Setup (Machine A & Machine B)

The server binds to `0.0.0.0:5000` with permissive CORS (`*`), enabling devices on the same Wi-Fi / Local Area Network (LAN) to interact seamlessly.

When you run `npm run dev`, the server will automatically detect and print your local IP addresses in the console:
```text
====================================================
🚀 Multiplayer Game Server is running on port 5000
🌐 Environment: development
🔒 Localhost:    http://localhost:5000
📡 LAN IP Addresses (for Developer 1 & other machines):
   - http://192.168.1.45:5000 (Wi-Fi)
⚡ Socket.IO is ready for real-time multiplayer connections
====================================================
```

### Instructions for Developer 1 (Frontend):
1. Replace `http://localhost:5000` in the frontend API and Socket.IO client config with your machine's LAN IP:
   ```javascript
   const BACKEND_URL = "http://192.168.1.45:5000"; // replace with actual IP
   const socket = io(BACKEND_URL);
   ```
2. Frontend on Machine A (Host) and Machine B (Client) can now connect directly to the same backend.

---

## 🏗️ System Architecture

```
Frontend (Machine A & B)
       │
       ├─────────────────────────────────┐
       ▼ (REST API: /api/*)              ▼ (Real-Time: Socket.IO)
Express Router & Middleware         Socket.IO Handlers & Rooms
 (Auth, Validation, Error)          (Auth Handshake, Rooms, Turns)
       │                                 │
       ▼                                 ▼
Controllers / Route Handlers        Socket Controllers
       │                                 │
       └────────────────┬────────────────┘
                        ▼
               Service Layer
     ┌──────────────────┼──────────────────┐
     ▼                  ▼                  ▼
AuthService        RoomService       TicTacToeService
ScoringService     UserService       AnalyticsService
                        │
                        ▼
               Internal Event Bus (EventEmitter)
   [GAME_CREATED, PLAYER_JOINED, GAME_STARTED, MOVE_MADE,
    GAME_WON, GAME_DRAW, GAME_COMPLETED, PLAYER_LEFT]
                        │
                        ▼ (Event Listeners)
            Scoring & Analytics Handlers
                        │
                        ▼
            Database Repository Layer
  (UserRepo, GameRepo, RoomRepo, HistoryRepo, AnalyticsRepo)
                        │
                        ▼
         Data Store (In-Memory / Database)
```

---

## 📑 Contract for Developer 1 (Frontend)

All API responses follow a strict standard payload structure:

- **Success (`2xx`):**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Error (`4xx`, `5xx`):**
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_MOVE",
      "message": "This position is already occupied"
    }
  }
  ```

### 1. REST Endpoints

#### Authentication
- `POST /api/auth/register`
  - Body: `{ "username": "player1", "email": "player1@example.com", "password": "password123" }`
  - Response: `{ "user": { "id", "username", "email", "credits": 0, "wins": 0, "losses": 0, "draws": 0 }, "token": "JWT..." }`
- `POST /api/auth/login`
  - Body: `{ "email": "player1@example.com", "password": "password123" }`
  - Response: `{ "user": { ... }, "token": "JWT..." }`
- `GET /api/auth/me`
  - Header: `Authorization: Bearer <token>`
  - Response: `{ "user": { ... } }`

#### Games
- `GET /api/games`: List supported game types.
- `GET /api/games/:gameId`: Get rules and scoring policy.
- `GET /api/games/history`: Get authenticated user's match history.
  - Returns: `[{ "gameId", "gameType", "roomId", "opponents", "result", "startedAt", "completedAt" }]`

#### Rooms
- `POST /api/rooms`: Create a new room.
  - Header: `Authorization: Bearer <token>`
  - Response: Room object with status `WAITING` and creator assigned as `X`.
- `GET /api/rooms?status=WAITING`: List available rooms waiting for an opponent.
- `GET /api/rooms/:roomId`: Get detailed room and board state.
- `POST /api/rooms/:roomId/join`: Join a room as player `O`. Room transitions to `IN_PROGRESS`.
- `POST /api/rooms/:roomId/leave`: Leave room.

#### Analytics
- `GET /api/analytics/me`: Current user statistics (`totalGames`, `wins`, `losses`, `draws`, `winRate`, `credits`).
- `GET /api/analytics/leaderboard`: Top players sorted by credits.
- `GET /api/analytics/games`: Overall platform metrics (`totalPlayers`, `totalGamesPlayed`, `activeRooms`).

---

### 2. Socket.IO Real-Time Game Contract

Connect to Socket.IO using your auth token:
```javascript
const socket = io("http://BACKEND_IP:5000", {
  auth: { token: "YOUR_JWT_TOKEN" }
});
```

#### Events Emitted from Client $\to$ Server:
1. `join_room`:
   ```javascript
   socket.emit("join_room", { roomId: "room_123" });
   ```
2. `make_move`:
   ```javascript
   socket.emit("make_move", { roomId: "room_123", position: 4 }); // position 0-8
   ```
3. `leave_room`:
   ```javascript
   socket.emit("leave_room", { roomId: "room_123" });
   ```

#### Events Received from Server $\to$ Client:
1. `player_joined`: Broadcasted when another player enters the room.
2. `game_started`: Broadcasted when player 2 joins and game commences.
   ```json
   {
     "roomId": "room_123",
     "players": [
       { "userId": "u1", "username": "Alice", "symbol": "X" },
       { "userId": "u2", "username": "Bob", "symbol": "O" }
     ],
     "currentTurn": "X",
     "board": [null, null, null, null, null, null, null, null, null]
   }
   ```
3. `move_made`: Broadcasted after every validated move.
   ```json
   {
     "roomId": "room_123",
     "playerId": "u1",
     "symbol": "X",
     "position": 4,
     "board": [null, null, null, null, "X", null, null, null, null],
     "nextTurn": "O"
   }
   ```
4. `turn_changed`: `{ "roomId": "room_123", "currentTurn": "O" }`
5. `game_over`: Emitted when game concludes.
   ```json
   {
     "roomId": "room_123",
     "result": "WIN", // or "DRAW"
     "winnerId": "u1",
     "winnerSymbol": "X",
     "winningLine": [0, 4, 8],
     "board": [...]
   }
   ```
6. `player_left`: `{ "roomId": "room_123", "userId": "u2", "username": "Bob" }`
7. `game_error`: `{ "code": "INVALID_MOVE", "message": "This position is already occupied" }`

---

## 🗄️ Contract for Developer 3 (Database)

All business services depend strictly on the repository layer in `src/repositories/`. To integrate MongoDB, PostgreSQL, or MySQL:

1. Keep the identical async method signatures in:
   - `userRepository.js`:
     - `create(userData)`
     - `findById(id)`
     - `findByEmail(email)`
     - `findByUsername(username)`
     - `updateStats(id, { credits, totalGames, wins, losses, draws })`
     - `findAll()`
   - `gameRepository.js`: `findAll()`, `findById(id)`, `create(gameData)`
   - `roomRepository.js`: `create(roomData)`, `findById(id)`, `findWaitingRooms()`, `findAll(filter)`, `update(id, data)`
   - `gameHistoryRepository.js`: `create(historyData)`, `findByUserId(userId)`, `countTotalGames()`
   - `analyticsRepository.js`: `getUserStats(userId)`, `getLeaderboard(limit)`, `getPlatformStats()`
2. Swap the in-memory `Map` data structures with database queries (e.g. Mongoose models or Prisma queries). No controllers, services, or routes will need to change!

---

## 🏆 Scoring & Credit System

Configurable in `.env` and `src/config/config.js`:
- **Win:** `+20 credits`, `wins +1`, `totalGames +1`
- **Draw:** `+10 credits`, `draws +1`, `totalGames +1`
- **Loss:** `+2 credits`, `losses +1`, `totalGames +1`
- **Participation:** `+5 credits`

When a game ends, `eventBus.emit("GAME_WON" | "GAME_DRAW")` triggers `scoringService`, which atomically updates player credits and registers match audit history.
