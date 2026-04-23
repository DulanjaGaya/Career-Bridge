@echo off
REM Career Bridge - Quick Setup Script for Windows

echo.
echo ============================================
echo   Career Bridge - Setup Script
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed. Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Check if MongoDB is available
mongo --version >nul 2>&1
if errorlevel 1 (
    echo Warning: MongoDB not found. Install from https://www.mongodb.com/try/download/community
    echo You can also use MongoDB Atlas (cloud) and update MONGODB_URI in backend/.env
)

echo Setting up Backend...
echo.
cd backend

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo Please edit backend/.env and update:
    echo - MONGODB_URI (if using local MongoDB)
    echo - JWT_SECRET (change to a strong secret)
    echo.
    pause
)

echo Installing backend dependencies...
call npm install

echo.
echo Setting up Frontend...
echo.
cd ../frontend

echo Installing frontend dependencies...
call npm install

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Next steps:
echo.
echo 1. Ensure MongoDB is running:
echo    - mongod (for local installation)
echo    - or use MongoDB Atlas cloud
echo.
echo 2. Start the backend:
echo    cd backend
echo    npm run dev
echo.
echo 3. In another terminal, start the frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open your browser to http://localhost:5173
echo.
echo Backend API runs on http://localhost:5000
echo.
pause
