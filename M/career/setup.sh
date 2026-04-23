#!/bin/bash

# Career Bridge - Quick Setup Script for macOS/Linux

echo ""
echo "============================================"
echo "  Career Bridge - Setup Script"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install from https://nodejs.org/"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "Warning: MongoDB not found. Install from https://www.mongodb.com/try/download/community"
    echo "You can also use MongoDB Atlas (cloud) and update MONGODB_URI in backend/.env"
fi

echo "Setting up Backend..."
echo ""
cd backend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo ""
    echo "Please edit backend/.env and update:"
    echo "- MONGODB_URI (if using local MongoDB)"
    echo "- JWT_SECRET (change to a strong secret)"
    echo ""
    read -p "Press enter to continue..."
fi

echo "Installing backend dependencies..."
npm install

echo ""
echo "Setting up Frontend..."
echo ""
cd ../frontend

echo "Installing frontend dependencies..."
npm install

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Ensure MongoDB is running:"
echo "   - mongod (for local installation)"
echo "   - or use MongoDB Atlas cloud"
echo ""
echo "2. Start the backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. In another terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open your browser to http://localhost:5173"
echo ""
echo "Backend API runs on http://localhost:5000"
echo ""
