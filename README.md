# NexusArena — Real-Time Multiplayer Gaming Platform

A modern, full-stack, real-time multiplayer gaming platform featuring **Multiplayer Tic-Tac-Toe**, engineered for multi-machine local area network (LAN) play, client-server RESTful APIs, WebSocket-based real-time game coordination (Socket.IO), internal Event-Driven Architecture (EDA), Service-Oriented Architecture (SOA), dynamic credit/scoring calculation, player performance analytics, and a swappable database persistence layer (MongoDB + Mongoose with automatic In-Memory fallback).

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Monorepo Project Structure](#monorepo-project-structure)
6. [Prerequisites](#prerequisites)
7. [Environment Variables](#environment-variables)
8. [Installation & Setup](#installation--setup)
   - [One-Click Windows Launcher (`start-project.bat`)](#one-click-windows-launcher-start-projectbat)
   - [Manual Local Setup](#manual-local-setup)
9. [Database Persistence Layer (MongoDB / In-Memory)](#database-persistence-layer-mongodb--in-memory)
10. [REST API Documentation](#rest-api-documentation)
11. [Socket.IO Real-Time Event Protocol](#socketio-real-time-event-protocol)
12. [Authentication & Authorization Flow](#authentication--authorization-flow)
13. [Multiplayer Game Flow](#multiplayer-game-flow)
14. [Scoring & Credit Calculation](#scoring--credit-calculation)
15. [Running Automated Tests](#running-automated-tests)
16. [Docker & Docker Compose Deployment](#docker--docker-compose-deployment)
17. [Multi-Machine & LAN Multiplayer Setup](#multi-machine--lan-multiplayer-setup)
18. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## 🎯 Project Overview

NexusArena is a collaborative software engineering project developed by a 3-engineer team:
- **Developer 1 (Frontend):** Responsive React 18 SPA built with Vite, TailwindCSS, React Router 6, Axios, and Socket.IO Client.
- **Developer 2 (Backend):** Node.js & Express.js REST API with Socket.IO authoritative game server, JWT authentication, bcrypt hashing, Zod validation, and internal Node.js EventEmitter.
- **Developer 3 (Database):** Mongoose schemas, MongoDB repository patterns, indexing, and seed utilities.

The architecture enforces complete decoupling:
- The **Frontend** communicates via standardized REST endpoints and Socket.IO channels.
- The **Backend** implements server-authoritative move validation and decoupled business services.
- The **Database** implements a clean Repository Pattern. The backend includes a dual-mode adapter: if MongoDB is running, it saves to MongoDB; if MongoDB is not present, it seamlessly switches to an internal in-memory repository, ensuring the demo runs out-of-the-box anywhere.

---

## ✨ Key Features

- **Real-Time Multiplayer Play:** Play Tic-Tac-Toe between two different physical machines or browser tabs with sub-millisecond turn updates.
- **Server-Authoritative Validation:** The server strictly verifies player turns, position availability, active match status, and computes winners/draws. Clients cannot falsify moves.
- **Event-Driven Architecture (EDA):** State changes emit domain events (`GAME_CREATED`, `PLAYER_JOINED`, `GAME_STARTED`, `MOVE_MADE`, `GAME_WON`, `GAME_DRAW`, `GAME_COMPLETED`, `PLAYER_LEFT`) to decouple gameplay from scoring and audit logging.
- **Dynamic Scoring & Credit System:** Configurable reward policies (+20 credits for win, +10 credits for draw, +2 credits for loss, +5 for participation).
- **Player Analytics & Leaderboards:** Real-time win rate computation, total games tracker, credit balance, and global leaderboard ranking.
- **Match History Audit:** Full historical log of completed matches, opposing players, dates, and credits awarded.
- **LAN Discovery Support:** Server listens on `0.0.0.0` and prints host IPv4 addresses on startup so teammates can connect instantly.
- **Zero-Setup Resilience:** Runs with MongoDB or without MongoDB using the automatic in-memory fallback.

---

## 🏗️ System Architecture

```
                                 [ Physical Machine A (Host) ]          [ Physical Machine B (Client) ]
                                  React SPA (Vite / Port 5173)           React SPA (Vite / Port 5173)
                                               │                                      │
                                               ├───────────────────┬──────────────────┘
                                               ▼ (HTTP: /api/*)    ▼ (WebSockets)
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       NODE.JS / EXPRESS BACKEND (Port 5000)                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│  [ Express REST API ]                                         [ Socket.IO Real-Time Server ]            │
│  ├── /api/auth (Register, Login, Me)                          ├── Handshake & JWT Auth Verification     │
│  ├── /api/games (Definitions, Catalog, History)               ├── Room Channels (join_room, leave_room) │
│  ├── /api/rooms (Create, Join, Leave, Move)                   └── Authoritative Move Broadcasts         │
│  └── /api/analytics (Me, Leaderboard, Platform)                                                         │
│                                                                                                         │
│  [ Middleware Layer ]                                                                                   │
│  ├── authMiddleware (JWT Token Validation)                                                              │
│  ├── validationMiddleware (Zod Schema Validation)                                                       │
│  └── errorMiddleware (Standardized { success: false, error } format)                                    │
│                                                                                                         │
│  [ Service Layer (SOA) ]                                                                                │
│  ├── AuthService        ├── RoomService           ├── TicTacToeService (Rules & Win Detection)          │
│  ├── UserService        ├── ScoringService        └── AnalyticsService                                  │
│                                                                                                         │
│  [ Central Event Bus (EventEmitter EDA) ]                                                               │
│  ├── Events: GAME_STARTED, MOVE_MADE, GAME_WON, GAME_DRAW, GAME_COMPLETED, PLAYER_LEFT                  │
│  └── Listeners: Scoring Service updates credits -> Analytics updates statistics -> History logged      │
│                                                                                                         │
│  [ Repository Abstraction Layer (Adapter Pattern) ]                                                     │
│  ├── userRepository       ├── roomRepository          ├── analyticsRepository                           │
│  ├── gameRepository       └── gameHistoryRepository                                                     │
│                                                                                                         │
└────────────────────────────────────────────────┬────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
               ┌─────────────────────────────────┴─────────────────────────────────┐
               ▼ (If MongoDB Available)                                            ▼ (If Offline / Standalone)
   [ MongoDB + Mongoose Persistence ]                                     [ In-Memory Async Datastore ]
   - Users Collection                                                     - Maps / In-Memory Arrays
   - Games Collection                                                     - Zero-configuration fallback
   - Rooms Collection                                                     - Instant developer demo mode
   - GameHistory Collection
```

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, TailwindCSS 3, React Router 6, Axios, Socket.IO Client 4 |
| **Backend** | Node.js (v18+), Express.js 4, Socket.IO 4, JSON Web Token (jsonwebtoken), bcryptjs, Zod, dotenv, cors |
| **Database** | MongoDB 6+, Mongoose 8, with built-in in-memory fallback adapter |
| **DevOps / Containers** | Docker, Docker Compose, Nginx Alpine, Multi-stage builds, Windows `.bat` |

---

## 📁 Monorepo Project Structure

```
Project5/
├── backend/                              # Backend Service
│   ├── src/
│   │   ├── config/config.js              # Port, Host, JWT, CORS, scoring policy
│   │   ├── controllers/                  # HTTP route controllers
│   │   │   ├── authController.js
│   │   │   ├── gameController.js
│   │   │   ├── roomController.js
│   │   │   └── analyticsController.js
│   │   ├── events/                       # Node.js EventEmitter EDA
│   │   │   ├── eventBus.js
│   │   │   ├── eventTypes.js
│   │   │   └── eventHandlers.js
│   │   ├── middleware/                   # Express middlewares
│   │   │   ├── authMiddleware.js
│   │   │   ├── validationMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/types.js               # Shared data shapes & constants
│   │   ├── repositories/                 # Unified repository adapters
│   │   │   ├── dbHelper.js
│   │   │   ├── userRepository.js
│   │   │   ├── gameRepository.js
│   │   │   ├── roomRepository.js
│   │   │   ├── gameHistoryRepository.js
│   │   │   └── analyticsRepository.js
│   │   ├── routes/                       # Express route aggregators
│   │   │   ├── authRoutes.js
│   │   │   ├── gameRoutes.js
│   │   │   ├── roomRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   └── index.js
│   │   ├── services/                     # Business logic services
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── gameService.js
│   │   │   ├── roomService.js
│   │   │   ├── ticTacToeService.js
│   │   │   ├── scoringService.js
│   │   │   └── analyticsService.js
│   │   ├── sockets/                      # Real-time WebSocket layer
│   │   │   ├── socketServer.js
│   │   │   └── gameSocket.js
│   │   ├── utils/apiResponse.js          # Uniform API response helpers
│   │   ├── app.js                        # Express app configuration
│   │   └── server.js                     # Server entrypoint on 0.0.0.0
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── README.md
│   └── test-demo.js                      # E2E Socket & REST simulation test
├── database/                             # Database Schemas & Persistence
│   ├── config/database.js                # Mongoose connection & configuration
│   ├── models/                           # Mongoose Schemas
│   │   ├── User.js
│   │   ├── Game.js
│   │   ├── Room.js
│   │   └── GameHistory.js
│   ├── repositories/                     # Mongoose Repository implementations
│   │   ├── userRepository.js
│   │   ├── gameRepository.js
│   │   ├── roomRepository.js
│   │   └── gameHistoryRepository.js
│   ├── scripts/seed.js                   # Seed initial game definitions
│   ├── tests/repositoryContract.test.js  # Contract verification test
│   └── README.md
├── frontend/                             # React SPA Client
│   ├── public/
│   │   ├── favicon.svg
│   │   └── env-config.js                 # Dynamic runtime config fallback
│   ├── src/
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── GameBoard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PlayerCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   └── Icons.jsx
│   │   ├── context/AuthContext.jsx       # Authentication & user state
│   │   ├── pages/                        # View routes
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Rooms.jsx
│   │   │   ├── Game.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── History.jsx
│   │   ├── services/                     # Axios API clients
│   │   │   ├── api.js
│   │   │   ├── authApi.js
│   │   │   ├── roomApi.js
│   │   │   └── analyticsApi.js
│   │   ├── socket/socket.js              # Socket.IO client instance
│   │   ├── App.jsx                       # Router setup
│   │   ├── index.css                     # Tailwind styling & animations
│   │   └── main.jsx                      # React entrypoint
│   ├── .env.example
│   ├── .env
│   ├── Dockerfile                        # Multi-stage build + Nginx
│   ├── nginx.conf
│   ├── docker-entrypoint.sh
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml                    # Full-stack Docker compose configuration
├── Dockerfile                            # Root backend Dockerfile
├── start-project.bat                     # Windows 1-command startup script
├── package.json                          # Monorepo workspaces & master scripts
└── README.md                             # Comprehensive project documentation
```

---

## ⚙️ Prerequisites

- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** v9.0.0 or higher
- **MongoDB (Optional):** v6.0+ local server or Docker container. *(If MongoDB is not installed, the platform automatically runs using its high-performance in-memory persistence layer!)*
- **Docker & Docker Compose (Optional):** For containerized execution.

---

## 🔐 Environment Variables

### Backend Configuration (`backend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | HTTP and WebSocket port |
| `HOST` | `0.0.0.0` | Listen host (0.0.0.0 allows LAN connections) |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`) |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (`*` enables LAN devices) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/multiplayer_game_platform` | MongoDB connection URI |
| `JWT_SECRET` | `super_secret_jwt_key_project5_college_demo_2024` | Secret key for JWT signing |
| `JWT_EXPIRES_IN`| `7d` | Token lifetime |
| `SCORING_PARTICIPATION` | `5` | Credits awarded for match participation |
| `SCORING_WIN` | `20` | Credits awarded for a victory |
| `SCORING_DRAW`| `10` | Credits awarded to each player for a draw |
| `SCORING_LOSS`| `2` | Credits awarded for a defeat |

### Frontend Configuration (`frontend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend REST API base URL |
| `VITE_SOCKET_URL`| `http://localhost:5000` | Socket.IO server address |

*(Note: In Docker mode, runtime environment injection dynamically overrides these values via `env-config.js` without requiring a rebuild).*

---

## 🚀 Installation & Setup

### Option 1: One-Click Windows Launcher (`start-project.bat`)
On Windows, you can start the entire platform with **one single command**:
1. Double-click [`start-project.bat`](file:///./start-project.bat) OR run:
   ```cmd
   .\start-project.bat
   ```
2. The launcher will:
   - Check Node.js and npm installations.
   - Automatically initialize `.env` configuration files if missing.
   - Install missing dependencies for backend and frontend.
   - Check MongoDB status.
   - Open dedicated, labeled console windows for Backend (Port 5000) and Frontend (Port 5173).
3. Access your web browser at: **`http://localhost:5173`**

---

### Option 2: Manual Local Setup

#### 1. Install All Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or individually: `cd backend && npm install`, `cd frontend && npm install`)*

#### 2. Start the Backend Service
```bash
npm run dev:backend
```
*The backend server will start on port `5000` and display your local network IP addresses in the console.*

#### 3. Start the Frontend Application
In a separate terminal window:
```bash
npm run dev:frontend
```
*The frontend Vite dev server will start on port `5173`.*

Open your browser at: **`http://localhost:5173`**

---

## 🗄️ Database Persistence Layer (MongoDB / In-Memory)

The backend incorporates an **Adapter Repository Pattern**:
1. **Automatic Detection:** On startup, `server.js` attempts to connect to MongoDB via Mongoose using `MONGODB_URI`.
2. **MongoDB Mode:** If MongoDB is connected, all CRUD operations route to the Mongoose models in `database/models/` (`User`, `Game`, `Room`, `GameHistory`).
3. **In-Memory Fallback Mode:** If MongoDB is offline, the backend logs an informational note and routes queries to its in-memory datastore.
4. **Seeding the Database (Optional):**
   If MongoDB is running, you can seed game definitions by running:
   ```bash
   npm run seed:db
   ```

---

## 📡 REST API Documentation

All REST responses follow a standardized JSON envelope:
- **Success:** `{ "success": true, "data": <Payload> }`
- **Error:** `{ "success": false, "error": { "code": "<CODE>", "message": "<Message>" } }`

### 1. Authentication Endpoints

#### Register Player
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "username": "alice",
    "email": "alice@example.com",
    "password": "password123"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "usr_1726900_abc",
        "username": "alice",
        "email": "alice@example.com",
        "credits": 0,
        "wins": 0,
        "losses": 0,
        "draws": 0
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

#### Login Player
- **Endpoint:** `POST /api/auth/login`
- **Body:** `{ "email": "alice@example.com", "password": "password123" }`
- **Response (200):** Same structure as register.

#### Get Current Profile
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200):** `{ "success": true, "data": { "user": { ... } } }`

---

### 2. Room Management Endpoints

#### Create Room
- **Endpoint:** `POST /api/rooms`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Body:** `{ "gameId": "game-tictactoe-001" }`
- **Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "id": "room_1726912_xyz",
      "gameId": "game-tictactoe-001",
      "gameType": "TIC_TAC_TOE",
      "creatorId": "usr_1726900_abc",
      "players": [{ "userId": "usr_1726900_abc", "username": "alice", "symbol": "X" }],
      "status": "WAITING",
      "board": [null, null, null, null, null, null, null, null, null],
      "currentTurn": "X",
      "winner": null
    }
  }
  ```

#### List Waiting Rooms
- **Endpoint:** `GET /api/rooms?status=WAITING`
- **Response (200):** Array of available rooms waiting for an opponent.

#### Get Room Details
- **Endpoint:** `GET /api/rooms/:roomId`
- **Response (200):** Full room object with board state and player list.

#### Join Room (REST fallback)
- **Endpoint:** `POST /api/rooms/:roomId/join`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200):** Room object with status updated to `IN_PROGRESS` and player assigned symbol `O`.

#### Leave Room
- **Endpoint:** `POST /api/rooms/:roomId/leave`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200):** `{ "success": true, "data": { "message": "Left room successfully" } }`

---

### 3. Analytics & Leaderboard Endpoints

#### User Statistics
- **Endpoint:** `GET /api/analytics/me`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "totalGames": 10,
      "wins": 7,
      "losses": 2,
      "draws": 1,
      "winRate": 70,
      "credits": 154
    }
  }
  ```

#### Leaderboard
- **Endpoint:** `GET /api/analytics/leaderboard?limit=20`
- **Response (200):** Users sorted descending by credits and victories.

#### Match History
- **Endpoint:** `GET /api/games/history`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "hist_1726919_123",
        "gameId": "game-tictactoe-001",
        "gameType": "TIC_TAC_TOE",
        "roomId": "room_1726912_xyz",
        "userId": "usr_1726900_abc",
        "opponents": ["usr_1726901_def"],
        "result": "WIN",
        "creditsAwarded": 20,
        "startedAt": "2026-09-21T19:16:57.078Z",
        "completedAt": "2026-09-21T19:16:59.168Z"
      }
    ]
  }
  ```

#### Platform Game Metrics
- **Endpoint:** `GET /api/analytics/games`
- **Response (200):** Total registered players, completed matches, and active rooms.

---

## ⚡ Socket.IO Real-Time Event Protocol

Clients connect to the Socket.IO server:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://BACKEND_IP:5000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

### Events Emitted from Client $\to$ Server

| Event | Payload | Description |
|---|---|---|
| `join_room` | `{ roomId: "room_123", token?: "..." }` | Joins room socket channel. If user is player 2, starts match. |
| `make_move` | `{ roomId: "room_123", position: 0-8 }` | Executes a move at board cell index 0 to 8. |
| `leave_room` | `{ roomId: "room_123" }` | Leaves the room channel. |

### Events Broadcasted from Server $\to$ Client

| Event | Payload | Trigger Condition |
|---|---|---|
| `player_joined` | `{ roomId, player: { userId, username, symbol }, players }` | Broadcasted to room members when a second player enters. |
| `game_started` | `{ roomId, players, currentTurn, board }` | Broadcasted to both players when room status transitions to `IN_PROGRESS`. |
| `move_made` | `{ roomId, playerId, symbol, position, board, nextTurn }` | Broadcasted after an authoritative move is validated. |
| `turn_changed` | `{ roomId, currentTurn: "X" \| "O" }` | Informs clients whose turn it is. |
| `game_over` | `{ roomId, result: "WIN" \| "DRAW", winnerId, winnerSymbol, winningLine, board }` | Emitted when 3-in-a-row is detected or the board is full. |
| `player_left` | `{ roomId, userId, username }` | Broadcasted when an opponent departs. |
| `game_error` | `{ code: "INVALID_MOVE", message: "..." }` | Sent directly to the client if move or turn is invalid. |

---

## 🎮 Multiplayer Game Flow

1. **Host (Player X):** Logs in $\to$ clicks **Create Game** on Dashboard $\to$ Server allocates room in `WAITING` status $\to$ Navigates to `/game/:roomId`.
2. **Opponent (Player O):** Logs in on another tab or another PC $\to$ Views available rooms on `/rooms` (or enters Room ID on Dashboard) $\to$ Clicks **Join**.
3. **Match Start:**
   - Server assigns symbol `O` to Player 2.
   - Room status updates to `IN_PROGRESS`.
   - `game_started` event triggers on both screens simultaneously.
4. **Turn Execution:**
   - Player `X` clicks an empty grid cell (indices 0 to 8).
   - Server verifies:
     1. Player is in room.
     2. Game status is `IN_PROGRESS`.
     3. Player symbol matches `currentTurn`.
     4. Position is an integer between 0 and 8 and empty.
   - Server writes move to authoritative board $\to$ emits `move_made` $\to$ switches turn to `O`.
5. **Game Over & Scoring:**
   - On winning line `[0,1,2]`, `[3,4,5]`, `[6,7,8]`, `[0,3,6]`, `[1,4,7]`, `[2,5,8]`, `[0,4,8]`, or `[2,4,6]`:
     - Server emits `game_over` (`result: "WIN"`, winning line).
     - Node.js EventBus emits `GAME_WON`.
     - `ScoringService` awards `+20 credits` to winner, `+2 credits` to loser.
     - Match history record is stored.
     - Frontend displays victory modal and refreshes credit balance.

---

## 💰 Scoring & Credit System

| Result | Credits Awarded | Stats Updated |
|---|---|---|
| **Win** | **+20 Credits** | `wins +1`, `totalGames +1` |
| **Draw** | **+10 Credits** (each) | `draws +1`, `totalGames +1` |
| **Loss** | **+2 Credits** | `losses +1`, `totalGames +1` |
| **Participation** | **+5 Credits** | Configurable base |

All scoring parameters are customizable via `.env` (`SCORING_WIN`, `SCORING_DRAW`, `SCORING_LOSS`, `SCORING_PARTICIPATION`).

---

## 🧪 Running Automated Tests

Run the complete test suite (both backend real-time simulation and database contracts):
```bash
npm test
```

### Individual Test Suites:
- **Backend & Socket.IO E2E Simulation:**
  ```bash
  npm run test:backend
  ```
  *Spawns virtual HTTP server and 2 Socket.IO clients (Alice vs Bob), executes turn-by-turn game moves to victory, and asserts event bus scoring updates, leaderboard ranking, and history recording.*
- **Database Repository Interface Contracts:**
  ```bash
  npm run test:database
  ```
  *Verifies that all Mongoose repositories expose required async CRUD methods matching backend expectations.*

---

## 🐳 Docker & Docker Compose Deployment

The entire stack (MongoDB + Backend + Frontend) can be launched in isolated Docker containers:

### 1. Launch Stack
```bash
docker compose up --build
```

### 2. Services Exposed:
- **Frontend SPA (Nginx):** `http://localhost:5173`
- **Backend API & Sockets:** `http://localhost:5000`
- **MongoDB Database:** `mongodb://localhost:27017`

### 3. Tear Down
```bash
docker compose down -v
```

---

## 🌐 Multi-Machine & LAN Multiplayer Setup

To play between two physical machines (e.g. Laptop A and Laptop B on the same Wi-Fi):

1. **Find Host IP:**
   When you start the backend (`npm run dev:backend`), it automatically scans and outputs your local IPv4 address:
   ```text
   📡 LAN IP Addresses (for Developer 1 & other machines):
      - http://192.168.1.45:5000 (Wi-Fi)
   ```
2. **Configure Frontend:**
   - In `frontend/.env` on Machine B, set:
     ```env
     VITE_API_URL=http://192.168.1.45:5000/api
     VITE_SOCKET_URL=http://192.168.1.45:5000
     ```
3. **Firewall Note (Windows):**
   If Machine B cannot connect, ensure port `5000` is allowed in Windows Defender Firewall on Machine A, or allow Node.js through the private network prompt.

---

## 🔧 Troubleshooting & FAQ

#### Q: "MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017"
**A:** This is completely safe. The backend has an automatic fallback to an in-memory repository store. The app and demo will continue to run normally without requiring MongoDB. If you wish to use MongoDB, start your local `mongod` service or use `docker compose up`.

#### Q: "Frontend displays 'Network Error'"
**A:** Ensure the backend service is running on port 5000. Test by visiting `http://localhost:5000/api/health` in your browser.

#### Q: "Room code says 'Room is already full'"
**A:** Tic-Tac-Toe supports exactly 2 players. If 2 players have joined, other players cannot enter as participants. Create a new room from the Dashboard.
