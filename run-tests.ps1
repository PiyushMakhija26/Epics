param(
    [int]$WaitSeconds = 12
)

# Kill any existing node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start backend
Write-Host "Starting backend..."
$backendProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev" -PassThru -WorkingDirectory "c:\Users\piyu4\OneDrive\Desktop\Epics\backend" -NoNewWindow

# Wait for backend to initialize
Write-Host "Waiting $WaitSeconds seconds for backend to initialize..."
Start-Sleep -Seconds $WaitSeconds

# Check if backend is running
$proc = Get-Process node -ErrorAction SilentlyContinue
if ($proc) {
    Write-Host "Backend process is running"
} else {
    Write-Host "ERROR: Backend process is not running!"
}

# Run smoke tests
Write-Host "`nRunning smoke tests..."
cd "c:\Users\piyu4\OneDrive\Desktop\Epics"
node scripts/smoke_node.js

# Stop backend
Write-Host "`nStopping backend..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
