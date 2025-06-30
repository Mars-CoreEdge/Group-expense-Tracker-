#!/usr/bin/env python3
"""
Complete Group Handler - Single file solution for group data storage
This file handles group creation and storage to Supabase database
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from typing import Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ================================
# CONFIGURATION
# ================================
class Config:
    # Supabase Configuration
    SUPABASE_URL = "https://matsednelzcnguijdypt.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdHNlZG5lbHpjbmd1aWpkeXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDk4MDgsImV4cCI6MjA2NjYyNTgwOH0.HQ7WnnTCjwcBxD7pKCt1aZLrfXWORYyT5OVuhYe-Vpg"
    
    # CORS settings
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "*"  # Allow all origins for development
    ]

# ================================
# SUPABASE CLIENT INITIALIZATION
# ================================
def initialize_supabase():
    """Initialize and return Supabase client"""
    try:
        supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        logger.info("✅ Supabase client initialized successfully")
        return supabase
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase client: {e}")
        raise e

# Global Supabase client
supabase = initialize_supabase()

# ================================
# DATABASE OPERATIONS
# ================================
class GroupHandler:
    def __init__(self, supabase_client):
        self.client = supabase_client
    
    def create_group(self, group_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Create a new group in Supabase
        
        Args:
            group_data: Dictionary containing name, description, created_by
            
        Returns:
            Created group data or None if failed
        """
        try:
            logger.info(f"Creating group: {group_data}")
            
            # Insert group into Supabase groups table
            result = self.client.table("groups").insert(group_data).execute()
            
            if result.data and len(result.data) > 0:
                created_group = result.data[0]
                logger.info(f"✅ Group created successfully: {created_group['name']} (ID: {created_group['id']})")
                return created_group
            else:
                logger.error("❌ No data returned from group creation")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error creating group: {e}")
            raise e
    
    def get_user_groups(self, user_id: str) -> list:
        """Get all groups for a specific user"""
        try:
            result = self.client.table("groups").select("*").eq("created_by", user_id).order("created_at", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"❌ Error fetching groups: {e}")
            return []
    
    def verify_user_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token with Supabase Auth"""
        try:
            user_response = self.client.auth.get_user(token)
            if user_response.user:
                user = user_response.user
                return {
                    "id": user.id,
                    "email": user.email,
                    "user_metadata": user.user_metadata or {}
                }
            return None
        except Exception as e:
            logger.error(f"❌ Error verifying token: {e}")
            return None

# Initialize group handler
group_handler = GroupHandler(supabase)

# ================================
# FLASK APPLICATION
# ================================
app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS)

def get_current_user():
    """Extract and verify user from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, {"error": "Authorization header missing"}, 401
    
    try:
        token = auth_header.replace("Bearer ", "")
        user = group_handler.verify_user_token(token)
        if not user:
            return None, {"error": "Invalid token"}, 401
        return user, None, None
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return None, {"error": "Invalid authentication"}, 401

# ================================
# API ENDPOINTS
# ================================

@app.route("/")
def root():
    """Root endpoint"""
    return jsonify({
        "message": "Group Handler API", 
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "create_group": "POST /api/groups",
            "get_groups": "GET /api/groups",
            "test_connection": "/test"
        }
    })

@app.route("/health")
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Group Handler API"})

@app.route("/test")
def test_connection():
    """Test Supabase connection"""
    try:
        # Try to fetch groups table structure
        result = supabase.table("groups").select("id").limit(1).execute()
        return jsonify({
            "status": "success",
            "message": "Supabase connection working",
            "database": "connected"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database connection failed: {str(e)}"
        }), 500

@app.route("/api/groups", methods=["POST"])
def create_group():
    """Create a new group"""
    user, error, status_code = get_current_user()
    if error:
        return jsonify(error), status_code
    
    try:
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({"error": "Group name is required"}), 400
        
        # Prepare group data for database
        group_data = {
            "name": data['name'].strip(),
            "description": data.get('description', '').strip() if data.get('description') else None,
            "created_by": str(user["id"])
        }
        
        # Create group
        new_group = group_handler.create_group(group_data)
        
        if not new_group:
            return jsonify({"error": "Failed to create group"}), 500
        
        return jsonify(new_group), 201
        
    except Exception as e:
        logger.error(f"Error in create_group endpoint: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/groups", methods=["GET"])
def get_user_groups():
    """Get all groups for the authenticated user"""
    user, error, status_code = get_current_user()
    if error:
        return jsonify(error), status_code
    
    try:
        groups = group_handler.get_user_groups(str(user["id"]))
        return jsonify({
            "groups": groups,
            "count": len(groups)
        })
    except Exception as e:
        logger.error(f"Error in get_user_groups endpoint: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# ================================
# STANDALONE TESTING FUNCTIONS
# ================================

def test_group_creation():
    """Test group creation without authentication (for testing)"""
    print("\n🧪 Testing Group Creation...")
    print("="*50)
    
    # Test data
    test_group = {
        "name": "Test Group",
        "description": "This is a test group created by the handler",
        "created_by": "12345678-1234-1234-1234-123456789012"  # dummy UUID
    }
    
    try:
        result = group_handler.create_group(test_group)
        if result:
            print(f"✅ SUCCESS! Group created: {result}")
            return True
        else:
            print("❌ FAILED! No group returned")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_connection():
    """Test database connection"""
    print("\n🔍 Testing Database Connection...")
    print("="*50)
    
    try:
        result = supabase.table("groups").select("id,name").limit(5).execute()
        print(f"✅ Connection successful! Found {len(result.data)} groups")
        for group in result.data:
            print(f"   - {group}")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

# ================================
# MAIN EXECUTION
# ================================

if __name__ == "__main__":
    print("🚀 Group Handler - Starting...")
    print("="*50)
    
    # Test connection first
    if test_connection():
        print("\n✅ Database connection verified!")
        
        # Optionally test group creation
        choice = input("\nDo you want to test group creation? (y/n): ").lower()
        if choice == 'y':
            test_group_creation()
        
        print("\n🌐 Starting Flask server...")
        print("API will be available at: http://localhost:8000")
        print("Test the API at: http://localhost:8000/test")
        print("\nPress Ctrl+C to stop the server")
        
        # Start Flask server
        app.run(host="0.0.0.0", port=8000, debug=True)
    else:
        print("\n❌ Cannot start server - database connection failed!")
        print("Please check your Supabase configuration.") 