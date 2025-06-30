#!/usr/bin/env python3
"""
Working Group Handler - Uses anon key with proper user handling
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
SUPABASE_URL = "https://matsednelzcnguijdypt.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdHNlZG5lbHpjbmd1aWpkeXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDk4MDgsImV4cCI6MjA2NjYyNTgwOH0.HQ7WnnTCjwcBxD7pKCt1aZLrfXWORYyT5OVuhYe-Vpg"

# ================================
# SUPABASE CLIENT
# ================================
class SimpleSupabaseClient:
    def __init__(self):
        self.url = SUPABASE_URL
        self.key = SUPABASE_ANON_KEY
        self.base_url = f"{self.url}/rest/v1"
        
        # Basic headers
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def create_group_with_user_token(self, group_data, user_token):
        """Create a group using a real user token to bypass RLS"""
        try:
            logger.info(f"Creating group with user auth: {group_data}")
            
            # Use user token for authorization to satisfy RLS
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            url = f"{self.base_url}/groups"
            response = requests.post(url, headers=headers, json=group_data)
            
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

    def test_basic_connection(self):
        """Test basic connection to Supabase"""
        try:
            url = f"{self.base_url}/groups"
            params = {"limit": "0"}  # Just check if endpoint exists
            
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code in [200, 401]:  # 401 is OK, means auth is working
                return True, "Connection successful!"
            else:
                return False, f"Connection failed: {response.status_code}"
        except Exception as e:
            return False, f"Connection error: {e}"

    def verify_user_token(self, token):
        """Verify JWT token with Supabase Auth"""
        try:
            auth_url = f"{self.url}/auth/v1/user"
            headers = {
                "apikey": self.key,
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

    def get_user_groups_with_token(self, user_id, user_token):
        """Get groups for user using their token"""
        try:
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            url = f"{self.base_url}/groups"
            params = {
                "created_by": f"eq.{user_id}",
                "order": "created_at.desc"
            }
            
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"❌ Failed to fetch groups: {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"❌ Error fetching groups: {e}")
            return []

# Initialize client
supabase = SimpleSupabaseClient()

# ================================
# FLASK APPLICATION
# ================================
app = Flask(__name__)
CORS(app, origins=["*"])

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
        return user, token, None  # Return user and token
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
        "message": "Working Group Handler API", 
        "version": "2.0.0",
        "status": "working",
        "note": "Uses proper user authentication for RLS compliance",
        "endpoints": {
            "health": "/health",
            "create_group": "POST /api/groups",
            "get_groups": "GET /api/groups",
            "test": "/test"
        }
    })

@app.route("/health")
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Working Group Handler API"})

@app.route("/test")
def test_endpoint():
    """Test endpoint"""
    success, message = supabase.test_basic_connection()
    return jsonify({
        "status": "success" if success else "error",
        "message": message,
        "note": "This tests basic connectivity. Authentication is handled per-request."
    })

@app.route("/api/groups", methods=["POST"])
def create_group():
    """Create a new group"""
    user, user_token, status_code = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401
    
    try:
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({"error": "Group name is required"}), 400
        
        # Prepare group data
        group_data = {
            "name": data['name'].strip(),
            "description": data.get('description', '').strip() if data.get('description') else None,
            "created_by": str(user["id"])
        }
        
        # Create group using user's token
        new_group = supabase.create_group_with_user_token(group_data, user_token)
        
        if not new_group:
            return jsonify({"error": "Failed to create group"}), 500
        
        return jsonify(new_group), 201
        
    except Exception as e:
        logger.error(f"Error in create_group endpoint: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/groups", methods=["GET"])
def get_user_groups():
    """Get all groups for the authenticated user"""
    user, user_token, status_code = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401
    
    try:
        groups = supabase.get_user_groups_with_token(str(user["id"]), user_token)
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

def test_connection():
    """Test basic connection"""
    print("\n🔍 Testing Basic Connection...")
    print("="*50)
    
    success, message = supabase.test_basic_connection()
    if success:
        print(f"✅ {message}")
        print("📝 Note: RLS requires user authentication for data operations")
        return True
    else:
        print(f"❌ {message}")
        return False

# ================================
# MAIN EXECUTION
# ================================

if __name__ == "__main__":
    print("🚀 Working Group Handler - Starting...")
    print("="*50)
    
    # Test connection
    if test_connection():
        print("\n✅ Basic connection verified!")
        print("📝 Authentication will be handled per-request with user tokens")
        
        print("\n🌐 Starting Flask server...")
        print("API will be available at: http://localhost:8000")
        print("Test the API at: http://localhost:8000/test")
        print("\nTo create groups, your frontend needs to:")
        print("1. Have users sign in through Supabase Auth")
        print("2. Send the user's JWT token in Authorization header")
        print("3. Call POST /api/groups with group data")
        print("\nPress Ctrl+C to stop the server")
        
        # Start Flask server
        app.run(host="0.0.0.0", port=8000, debug=True)
    else:
        print("\n❌ Cannot start server - basic connection failed!")
        print("Please check your Supabase URL and anon key.") 