@echo off
echo ========================================
echo    Messenger Simulator - HTTT Project
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo npm version:
npm --version
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes on first run...
    echo.
    call npm run install:all
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        echo Please check the error messages above and try again.
        echo.
        echo You can also try:
        echo   1. npm cache clean --force
        echo   2. npm run clean
        echo   3. npm run install:all
        echo.
        pause
        exit /b 1
    )
    echo.
)

echo Starting Messenger Simulator...
echo.
echo The application will open in:
echo - Web browser: http://localhost:3000
echo - Desktop app: Electron window
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start the application
call npm start

echo.
echo Application stopped.
pause
