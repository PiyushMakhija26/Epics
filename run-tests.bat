@echo off
cd c:\Users\piyu4\OneDrive\Desktop\Epics\backend
taskkill /F /IM node.exe /T 2>nul
timeout /t 2
start /B npm run dev
timeout /t 15
cd c:\Users\piyu4\OneDrive\Desktop\Epics
node scripts/smoke_node.js
pause
