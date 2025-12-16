#!/bin/bash

# AgriConnect Backend Development Server
echo "🌾 Starting AgriConnect Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please update .env with your credentials before starting the server."
    exit 1
fi

# Start the server
echo "🚀 Starting FastAPI server on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
