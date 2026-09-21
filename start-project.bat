@echo off
setlocal

title NexusArena - Multiplayer Game Platform Launcher

echo ==============================================================================
echo        NEXUSARENA - MULTIPLAYER TIC-TAC-TOE PLATFORM LAUNCHER
echo ==============================================================================
echo.

:: Get project root
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: ============================================================
:: 1. Check Node.js
:: ============================================================

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js v18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: ============================================================
:: 2. Check npm
:: ============================================================

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH!
    pause
    exit /b 1
)

echo [OK] Node.js:
node -v

echo [OK] npm:
call npm -v

echo.

:: ============================================================
:: 3. Environment files
:: ============================================================

if not exist "backend\.env" (
    if exist "backend\.env.example" (
        echo [CONFIG] Creating backend\.env from .env.example...
        copy /Y "backend\.env.example" "backend\.env" >nul
    ) else (
        echo [WARNING] backend\.env.example not found.
    )
)

if not exist "frontend\.env" (
    echo [CONFIG] Creating frontend\.env...
    (
        echo VITE_API_URL=http://localhost:5000/api
        echo VITE_SOCKET_URL=http://localhost:5000
    ) > "frontend\.env"
)

if not exist "database\.env" (
    if exist "database\.env.example" (
        echo [CONFIG] Creating database\.env from .env.example...
        copy /Y "database\.env.example" "database\.env" >nul
    ) else (
        echo [INFO] database\.env.example not found.
    )
)

echo [OK] Environment configuration checked.
echo.

:: ============================================================
:: 4. Backend dependencies
:: ============================================================

if not exist "backend\node_modules\" (
    echo [SETUP] Installing backend dependencies...
    cd /d "%PROJECT_ROOT%backend"
    call npm install

    if errorlevel 1 (
        echo [ERROR] Backend npm install failed.
        pause
        exit /b 1
    )

    cd /d "%PROJECT_ROOT%"
)

:: ============================================================
:: 5. Frontend dependencies
:: ============================================================

if not exist "frontend\node_modules\" (
    echo [SETUP] Installing frontend dependencies...
    cd /d "%PROJECT_ROOT%frontend"
    call npm install

    if errorlevel 1 (
        echo [ERROR] Frontend npm install failed.
        pause
        exit /b 1
    )

    cd /d "%PROJECT_ROOT%"
)

:: ============================================================
:: 6. Start MongoDB using Docker Compose
:: ============================================================

echo ==============================================================================
echo [DATABASE] Checking Docker...
echo ==============================================================================

where docker >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker is not installed or not in PATH.
    echo [INFO] Continuing without Docker.
    echo [INFO] Backend must use its configured database adapter.
    echo.
) else (
    echo [OK] Docker detected.
    echo [DATABASE] Starting MongoDB container...

    docker compose up -d mongodb

    if errorlevel 1 (
        echo [WARNING] Could not start MongoDB through Docker Compose.
        echo [INFO] Continuing with backend startup.
    ) else (
        echo [OK] MongoDB container started.
    )

    echo.
)

:: ============================================================
:: 7. Start Backend
:: ============================================================

echo ==============================================================================
echo [STARTING SERVICES]
echo ==============================================================================
echo.

echo [1/2] Launching Backend API and Socket.IO...
start "NexusArena - Backend Service (Port 5000)" cmd /k "cd /d ""%PROJECT_ROOT%backend"" && echo === BACKEND SERVICE - PORT 5000 === && npm run dev"

:: Give backend time to initialize
timeout /t 3 /nobreak >nul

:: ============================================================
:: 8. Start Frontend
:: ============================================================

echo [2/2] Launching Frontend React/Vite...
start "NexusArena - Frontend Service (Port 5173)" cmd /k "cd /d ""%PROJECT_ROOT%frontend"" && echo === FRONTEND APPLICATION - PORT 5173 === && npm run dev"

:: ============================================================
:: 9. Complete
:: ============================================================

echo.
echo ==============================================================================
echo                         SYSTEM LAUNCH COMPLETE
echo ==============================================================================
echo.
echo   Frontend:
echo   http://localhost:5173
echo.
echo   Backend API:
echo   http://localhost:5000/api
echo.
echo   Health Check:
echo   http://localhost:5000/api/health
echo.
echo   Socket.IO:
echo   http://localhost:5000
echo.
echo ==============================================================================
echo.
echo Keep the Backend and Frontend windows open.
echo.
pause