@echo off
REM Start CivicServe Backend and Frontend in separate terminal windows

echo Starting CivicServe Backend and Frontend...

REM Kill any lingering Node processes
taskkill /F /IM node.exe 2>nul

REM Wait for cleanup
timeout /t 2 /nobreak

REM Start Backend in new terminal
start "CivicServe Backend" cmd /k "cd backend && npm run dev"

REM Start Frontend in new terminal
timeout /t 3 /nobreak
start "CivicServe Frontend" cmd /k "cd frontend && npm install --legacy-peer-deps && npm run dev"

echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Close either terminal to stop the servers.
