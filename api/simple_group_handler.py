#!/usr/bin/env python3
"""
Simple Group Handler - Works without complex dependencies
Uses direct HTTP requests to Supabase REST API
"""

import requests
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
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
    # Using service key to bypass RLS for data operations
    SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdHNlZG5lbHpjbmd1aWpkeXB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA0OTgwOCwiZXhwIjoyMDY2NjI1ODA4fQ.V5WFnJBv_Fx5FiqI2xgtjuK4nJDKl3mQ1s5E5Qk-fow"
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdHNlZG5lbHpjbmd1aWpkeXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDk4MDgsImV4cCI6MjA2NjYyNTgwOH0.HQ7WnnTCjwcBxD7pKCt1aZLrfXWORYyT5OVuhYe-Vpg"
    
    # CORS settings
    CORS_ORIGINS = ["*"]  # Allow all origins for development

# ================================
# SUPABASE HTTP CLIENT
# ================================
class SupabaseClient:
    def __init__(self):
        self.url = Config.SUPABASE_URL
        self.service_key = Config.SUPABASE_SERVICE_KEY
        self.anon_key = Config.SUPABASE_ANON_KEY
        self.base_url = f"{self.url}/rest/v1"
        
        # Headers for database operations (use service key to bypass RLS)
        self.db_headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # Headers for auth operations (use anon key)
        self.auth_headers = {
            "apikey": self.anon_key,
            "Content-Type": "application/json"
        }

    def create_group(self, group_data):
        """Create a new group in Supabase"""
        try:
            logger.info(f"Creating group: {group_data}")
            
            url = f"{self.base_url}/groups"
            response = requests.post(url, headers=self.db_headers, json=group_data)
            
            if response.status_code in [200, 201]:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    created_group = result[0]
                    logger.info(f"✅ Group created: {created_group['name']} (ID: {created_group['id']})")
                    return created_group
                else:
                    logger.error("❌ No data returned from group creation")
                    return None
            else:
                logger.error(f"❌ Failed to create group: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error creating group: {e}")
            return None

    def get_user_groups(self, user_id):
        """Get all groups for a specific user"""
        try:
            url = f"{self.base_url}/groups"
            params = {
                "created_by": f"eq.{user_id}",
                "order": "created_at.desc"
            }
            
            response = requests.get(url, headers=self.db_headers, params=params)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"❌ Failed to fetch groups: {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"❌ Error fetching groups: {e}")
            return []

    def verify_user_token(self, token):
        """Verify JWT token with Supabase Auth"""
        try:
            auth_url = f"{self.url}/auth/v1/user"
            headers = {
                "apikey": self.anon_key,
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(auth_url, headers=headers)
            
            if response.status_code == 200:
                user_data = response.json()
                return {
                    "id": user_data.get("id"),
                    "email": user_data.get("email"),
                    "user_metadata": user_data.get("user_metadata", {})
                }
            else:
                logger.error(f"❌ Token verification failed: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error verifying token: {e}")
            return None

    def test_connection(self):
        """Test connection to Supabase"""
        try:
            url = f"{self.base_url}/groups"
            params = {"limit": "1"}
            
            response = requests.get(url, headers=self.db_headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                return True, f"Connection successful! Found {len(data)} groups"
            else:
                return False, f"Connection failed: {response.status_code}"
        except Exception as e:
            return False, f"Connection error: {e}"

# Initialize Supabase client
supabase = SupabaseClient()

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
        user = supabase.verify_user_token(token)
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
        "message": "Simple Group Handler API", 
        "version": "1.0.0",
        "status": "working",
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
    return jsonify({"status": "healthy", "service": "Simple Group Handler API"})

@app.route("/test")
def test_connection():
    """Test Supabase connection"""
    success, message = supabase.test_connection()
    if success:
        return jsonify({
            "status": "success",
            "message": message,
            "database": "connected"
        })
    else:
        return jsonify({
            "status": "error",
            "message": message
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
        new_group = supabase.create_group(group_data)
        
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
        groups = supabase.get_user_groups(str(user["id"]))
        return jsonify({
            "groups": groups,
            "count": len(groups)
        })
    except Exception as e:
        logger.error(f"Error in get_user_groups endpoint: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# ================================
# TESTING FUNCTIONS
# ================================

def test_group_creation():
    """Test group creation"""
    print("\n🧪 Testing Group Creation...")
    print("="*50)
    
    test_group = {
        "name": "Test Group from Simple Handler",
        "description": "This is a test group",
        "created_by": "12345678-1234-1234-1234-123456789012"
    }
    
    result = supabase.create_group(test_group)
    if result:
        print(f"✅ SUCCESS! Group created: {result}")
        return True
    else:
        print("❌ FAILED! No group returned")
        return False

def test_connection():
    """Test database connection"""
    print("\n🔍 Testing Database Connection...")
    print("="*50)
    
    success, message = supabase.test_connection()
    if success:
        print(f"✅ {message}")
        return True
    else:
        print(f"❌ {message}")
        return False

# ================================
# MAIN EXECUTION
# ================================

if __name__ == "__main__":
    print("🚀 Simple Group Handler - Starting...")
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