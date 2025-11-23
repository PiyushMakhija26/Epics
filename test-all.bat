@echo off
setlocal enabledelayedexpansion

REM Kill existing processes
echo Killing existing node processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 3 /nobreak

REM Start backend
echo.
echo Starting backend...
cd /d "c:\Users\piyu4\OneDrive\Desktop\Epics\backend"
start "Backend Server" npm run dev
timeout /t 20 /nobreak

REM Run tests
echo.
echo Running smoke tests...
cd /d "c:\Users\piyu4\OneDrive\Desktop\Epics"
node scripts/smoke_node.js

REM Show results
echo.
echo Displaying test results...
type scripts\smoke_node_output.json

REM Kill backend
echo.
echo Cleaning up...
taskkill /F /IM node.exe /T 2>nul

pause
