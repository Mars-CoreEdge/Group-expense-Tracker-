#!/usr/bin/env python3
"""
Flask ExpenseTracker API Server
Run this script to start the API server
"""

import sys
import os
from main import app

# Add the api directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting ExpenseTracker API Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📖 API Documentation available in code")
    print("\n" + "="*50)
    
    # Run the Flask server
    app.run(
        host="localhost",
        port=8000,
        debug=True  # Auto-reload on code changes
    ) 