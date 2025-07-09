@echo off
echo ========================================
echo   Stopping Messenger Simulator
echo ========================================
echo.

echo Stopping all related processes...
echo.

REM Stop Node.js processes
echo Stopping Node.js processes...
taskkill /f /im node.exe /t >nul 2>&1
if %errorlevel% equ 0 (
    echo   - Node.js processes stopped
) else (
    echo   - No Node.js processes found
)

REM Stop Electron processes
echo Stopping Electron processes...
taskkill /f /im electron.exe /t >nul 2>&1
if %errorlevel% equ 0 (
    echo   - Electron processes stopped
) else (
    echo   - No Electron processes found
)

REM Stop Messenger Simulator processes
echo Stopping Messenger Simulator processes...
taskkill /f /im "Messenger Simulator.exe" /t >nul 2>&1
if %errorlevel% equ 0 (
    echo   - Messenger Simulator processes stopped
) else (
    echo   - No Messenger Simulator processes found
)

REM Stop npm processes
echo Stopping npm processes...
taskkill /f /im npm.exe /t >nul 2>&1
if %errorlevel% equ 0 (
    echo   - npm processes stopped
) else (
    echo   - No npm processes found
)

REM Stop cmd processes with our titles
echo Stopping related CMD processes...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq cmd.exe" /fo csv ^| find /c /v ""') do set cmdcount=%%i
if %cmdcount% gtr 1 (
    taskkill /f /fi "windowtitle eq *npm*" >nul 2>&1
    taskkill /f /fi "windowtitle eq *node*" >nul 2>&1
    taskkill /f /fi "windowtitle eq *messenger*" >nul 2>&1
    echo   - Related CMD processes stopped
) else (
    echo   - No related CMD processes found
)

REM Free up ports 3000 and 3001
echo Freeing up ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo   - Ports 3000 and 3001 freed

echo.
echo ========================================
echo   All processes stopped successfully!
echo ========================================
echo.
echo You can now safely restart the application.
echo.
