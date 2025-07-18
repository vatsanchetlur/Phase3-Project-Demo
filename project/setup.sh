#!/bin/bash

echo "🚀 Customer REST API Server Setup Script"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB first."
    echo "You can download it from: https://www.mongodb.com/try/download/community"
    echo "Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
fi

echo "📦 Installing npm dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully!"

echo "🌱 Setting up sample data..."
npm run seed

if [ $? -ne 0 ]; then
    echo "⚠️  Failed to seed database. Make sure MongoDB is running."
    echo "You can start MongoDB with: mongod"
else
    echo "✅ Sample data added successfully!"
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo "   • Start the server: npm start"
echo "   • Start in development mode: npm run dev"
echo "   • Visit: http://localhost:3000"
echo ""
echo "📖 API Documentation: http://localhost:3000/index.html"
echo "🔧 API Endpoints: http://localhost:3000/customers"
