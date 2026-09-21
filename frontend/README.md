# NexusArena - Frontend Service

Modern, real-time multiplayer gaming frontend for **Multiplayer Tic-Tac-Toe**, built with React, Vite, React Router, Tailwind CSS, Axios, and Socket.IO Client.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Inside the frontend directory
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set the backend server IP:
```env
VITE_API_URL=http://<BACKEND_IP>:5000/api
VITE_SOCKET_URL=http://<BACKEND_IP>:5000
```
*(For single-machine local testing, `http://localhost:5000/api` and `http://localhost:5000` work by default).*

### 3. Run Development Server
```bash
npm run dev
```
The Vite dev server will start on port `5173` and bind to all host interfaces (`--host`), allowing both machines to access it via LAN.

---

## 📡 Multi-Machine College Demo Guide

### Presentation Scenario (Two Laptops on same Wi-Fi / Hotspot):

1. **Start Backend (Computer A):**
   ```bash
   npm run dev
   ```
   Note down the LAN IP displayed in the terminal (e.g. `192.168.1.45`).

2. **Start Frontend (Computer A or B):**
   Set `.env`:
   ```env
   VITE_API_URL=http://192.168.1.45:5000/api
   VITE_SOCKET_URL=http://192.168.1.45:5000
   ```
   Run:
   ```bash
   npm run dev
   ```

3. **Computer A (Player 1):**
   - Open `http://localhost:5173` (or `http://192.168.1.45:5173`)
   - Click "Player 1 (Alice)" Quick Sign-In (or register)
   - Click **Create Game** (Tic-Tac-Toe)
   - The game screen will open in `WAITING` state, showing "You are X"

4. **Computer B (Player 2):**
   - Open `http://<FRONTEND_HOST_IP>:5173`
   - Click "Player 2 (Bob)" Quick Sign-In (or register)
   - Go to **Game Rooms**
   - See the waiting room created by Alice
   - Click **Join Game**

5. **Instant Real-Time Gameplay:**
   - Both screens immediately transition to "Match Live"
   - Alice is X, Bob is O
   - Turns alternate in real-time over Socket.IO
   - When 3 in a row is made, server emits `game_over`
   - Both screens celebrate the result and show updated credits (+20 for winner, +2 for loser)
   - Dashboard & Leaderboard reflect authoritative backend standings

---

## 🏛️ Component Architecture & Flow

```
src/
├── components/
│   ├── Navbar.jsx          # Header with credits counter, links & user profile
│   ├── GameBoard.jsx       # Authoritative square 3x3 grid with win-line highlight
│   ├── RoomCard.jsx        # Room lobby card with live player counts & join CTA
│   ├── PlayerCard.jsx      # Active turn glow, player badges & statuses
│   ├── ScoreCard.jsx       # Reusable stat & metric display cards
│   ├── ProtectedRoute.jsx  # Auth guard with smooth loader
│   └── Icons.jsx           # Crisp zero-dependency SVGs
│
├── pages/
│   ├── Login.jsx           # Sign in with email/password + demo pre-fills
│   ├── Register.jsx        # User registration with validation
│   ├── Dashboard.jsx       # Player overview, quick join & navigation
│   ├── Rooms.jsx           # Room browser, filters & creation
│   ├── Game.jsx            # Real-time Socket.IO Tic-Tac-Toe gameplay
│   ├── Leaderboard.jsx     # Global rankings by credits
│   ├── Analytics.jsx       # Win/loss/draw charts & platform stats
│   └── History.jsx         # Match history audit trail
│
├── context/
│   └── AuthContext.jsx     # Global JWT & user state management
│
├── services/
│   ├── api.js              # Configured Axios instance with bearer interceptors
│   ├── authApi.js          # /api/auth endpoints
│   ├── roomApi.js          # /api/rooms endpoints
│   └── analyticsApi.js     # /api/analytics & /api/games endpoints
│
├── socket/
│   └── socket.js           # Singleton Socket.IO client manager
│
├── App.jsx                 # Route definitions & app layout
├── main.jsx                # Application root entry
└── index.css               # Tailwind CSS & custom gaming animations
```
