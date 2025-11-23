@echo off
cd /d "c:\Users\piyu4\OneDrive\Desktop\Epics\backend\dist"
echo Starting backend...
start /B node server.js
echo Waiting 15 seconds for backend to fully initialize...
timeout /t 15 /nobreak
cd /d "c:\Users\piyu4\OneDrive\Desktop\Epics"
echo Running smoke tests...
node scripts/smoke_node.js
echo.
echo Results:
type scripts\smoke_node_output.json
pause
