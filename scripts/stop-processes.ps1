# PowerShell script to stop all Messenger Simulator processes
Write-Host "Stopping Messenger Simulator processes..." -ForegroundColor Yellow

# Function to safely kill processes
function Stop-ProcessSafely {
    param(
        [string]$ProcessName,
        [string]$DisplayName
    )
    
    try {
        $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        if ($processes) {
            Write-Host "Stopping $DisplayName processes..." -ForegroundColor Cyan
            $processes | ForEach-Object {
                Write-Host "  - Stopping PID $($_.Id)" -ForegroundColor Gray
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            }
            Write-Host "  ✓ $DisplayName processes stopped" -ForegroundColor Green
        } else {
            Write-Host "  - No $DisplayName processes found" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  ✗ Error stopping $DisplayName processes: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Stop Node.js processes (server and client)
Stop-ProcessSafely -ProcessName "node" -DisplayName "Node.js"

# Stop Electron processes
Stop-ProcessSafely -ProcessName "electron" -DisplayName "Electron"

# Stop specific Messenger Simulator processes
Stop-ProcessSafely -ProcessName "Messenger Simulator" -DisplayName "Messenger Simulator"

# Stop any remaining npm processes
Stop-ProcessSafely -ProcessName "npm" -DisplayName "npm"

# Stop any cmd processes that might be running our scripts
$cmdProcesses = Get-Process -Name "cmd" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*npm*" -or 
    $_.MainWindowTitle -like "*node*" -or 
    $_.MainWindowTitle -like "*messenger*"
}

if ($cmdProcesses) {
    Write-Host "Stopping related CMD processes..." -ForegroundColor Cyan
    $cmdProcesses | ForEach-Object {
        Write-Host "  - Stopping CMD PID $($_.Id): $($_.MainWindowTitle)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✓ CMD processes stopped" -ForegroundColor Green
}

# Kill any processes using our ports
$ports = @(3000, 3001)
foreach ($port in $ports) {
    try {
        $connections = netstat -ano | Select-String ":$port "
        if ($connections) {
            Write-Host "Stopping processes using port $port..." -ForegroundColor Cyan
            $connections | ForEach-Object {
                $line = $_.Line.Trim()
                $pid = ($line -split '\s+')[-1]
                if ($pid -match '^\d+$') {
                    Write-Host "  - Stopping process PID $pid using port $port" -ForegroundColor Gray
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                }
            }
            Write-Host "  ✓ Port $port freed" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  - No processes found using port $port" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "All Messenger Simulator processes have been stopped!" -ForegroundColor Green
Write-Host "You can now safely restart the application." -ForegroundColor Yellow
