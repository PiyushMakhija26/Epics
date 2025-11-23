@echo off
REM Kill any existing node processes
taskkill /F /IM node.exe 2>nul

REM Start backend server in background
cd c:\Users\piyu4\OneDrive\Desktop\Epics\backend
start /B node -r ts-node/register src/server.ts

REM Wait for server to start
timeout /t 10 /nobreak

REM Run smoke tests
cd c:\Users\piyu4\OneDrive\Desktop\Epics
node scripts/smoke_node.js

REM Stop the server
taskkill /F /IM node.exe 2>nul

pause
