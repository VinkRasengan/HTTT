@echo off
echo ========================================
echo    Stopping Messenger Simulator
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Cannot run stop script without Node.js
    echo.
    echo Trying alternative method...
    echo.
    goto ALTERNATIVE_STOP
)

echo Using npm stop script...
call npm stop

if %errorlevel% equ 0 (
    echo.
    echo Application stopped successfully!
    goto END
)

:ALTERNATIVE_STOP
echo Using alternative stop method...
echo.

REM Stop processes manually
echo Stopping Node.js processes...
taskkill /f /im node.exe /t >nul 2>&1

echo Stopping Electron processes...
taskkill /f /im electron.exe /t >nul 2>&1

echo Stopping Messenger Simulator processes...
taskkill /f /im "Messenger Simulator.exe" /t >nul 2>&1

echo Stopping npm processes...
taskkill /f /im npm.exe /t >nul 2>&1

echo Freeing up ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo All processes stopped!

:END
echo.
echo ========================================
echo   Messenger Simulator stopped
echo ========================================
echo.
pause
