@echo off
REM Start CivicServe Backend
REM Kill any previous instances
taskkill /F /IM node.exe 2>nul
timeout /t 2

cd /d c:\Users\piyu4\OneDrive\Desktop\Epics\backend
echo Starting Backend on port 3001...
call npm run dev
