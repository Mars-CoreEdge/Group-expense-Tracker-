#!/usr/bin/env python3
"""
Fast Group Handler - No hanging requests + Expenses functionality
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
class FastSupabaseClient:
    def __init__(self):
        self.url = SUPABASE_URL
        self.key = SUPABASE_ANON_KEY
        self.base_url = f"{self.url}/rest/v1"

    def create_group_fast(self, group_data, user_token):
        """Create a group quickly with timeout"""
        try:
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            url = f"{self.base_url}/groups"
            response = requests.post(url, headers=headers, json=group_data, timeout=5)
            
            if response.status_code in [200, 201]:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0]
            return None
                
        except Exception as e:
            logger.error(f"Group creation error: {e}")
            return None

    def get_groups_fast(self, user_id, user_token):
        """Get groups quickly with timeout"""
        try:
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            url = f"{self.base_url}/groups"
            params = {"created_by": f"eq.{user_id}", "order": "created_at.desc"}
            
            response = requests.get(url, headers=headers, params=params, timeout=5)
            
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.error(f"Get groups error: {e}")
            return []

    def create_expense_fast(self, expense_data, user_token):
        """Create an expense quickly with timeout"""
        try:
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            url = f"{self.base_url}/expenses"
            response = requests.post(url, headers=headers, json=expense_data, timeout=5)
            
            if response.status_code in [200, 201]:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0]
            return None
                
        except Exception as e:
            logger.error(f"Expense creation error: {e}")
            return None

    def get_expenses_fast(self, group_id, user_token):
        """Get expenses for a group quickly with timeout"""
        try:
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            url = f"{self.base_url}/expenses"
            params = {"group_id": f"eq.{group_id}", "order": "created_at.desc"}
            
            response = requests.get(url, headers=headers, params=params, timeout=5)
            
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            logger.error(f"Get expenses error: {e}")
            return []

    def get_expense_by_id_fast(self, expense_id, user_token):
        """Get a specific expense by ID quickly with timeout"""
        try:
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            url = f"{self.base_url}/expenses"
            params = {"id": f"eq.{expense_id}"}
            
            response = requests.get(url, headers=headers, params=params, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0]
            return None
        except Exception as e:
            logger.error(f"Get expense by ID error: {e}")
            return None

    def delete_group_fast(self, group_id, user_token):
        """Delete a group quickly with timeout"""
        try:
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            url = f"{self.base_url}/groups"
            params = {"id": f"eq.{group_id}"}
            
            response = requests.delete(url, headers=headers, params=params, timeout=5)
            
            return response.status_code in [200, 204]
        except Exception as e:
            logger.error(f"Delete group error: {e}")
            return False

    def delete_expense_fast(self, expense_id, user_token):
        """Delete an expense quickly with timeout"""
        try:
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            url = f"{self.base_url}/expenses"
            params = {"id": f"eq.{expense_id}"}
            
            response = requests.delete(url, headers=headers, params=params, timeout=5)
            
            return response.status_code in [200, 204]
        except Exception as e:
            logger.error(f"Delete expense error: {e}")
            return False

# Initialize client
supabase = FastSupabaseClient()

# ================================
# FLASK APPLICATION
# ================================
app = Flask(__name__)
CORS(app, origins=["*"])

def extract_user_from_token(token):
    """Extract user ID from JWT token without external call"""
    try:
        import base64
        import json
        
        # Decode JWT payload (basic extraction, no verification for speed)
        parts = token.split('.')
        if len(parts) >= 2:
            payload = parts[1]
            # Add padding if needed
            payload += '=' * (4 - len(payload) % 4)
            decoded = base64.urlsafe_b64decode(payload)
            data = json.loads(decoded)
            
            return {
                "id": data.get("sub"),
                "email": data.get("email"),
                "exp": data.get("exp", 0)
            }
    except:
        pass
    return None

# ================================
# API ENDPOINTS
# ================================

@app.route("/")
def root():
    """Root endpoint"""
    return jsonify({
        "message": "Fast Group Handler API", 
        "version": "3.0.0",
        "status": "fast",
        "endpoints": {
            "health": "/health",
            "create_group": "POST /api/groups",
            "get_groups": "GET /api/groups",
            "delete_group": "DELETE /api/groups/{group_id}",
            "create_expense": "POST /api/groups/{group_id}/expenses",
            "get_expenses": "GET /api/groups/{group_id}/expenses",
            "get_expense_by_id": "GET /api/expenses/{expense_id}",
            "delete_expense": "DELETE /api/expenses/{expense_id}"
        }
    })

@app.route("/health")
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Fast Group Handler API"})

@app.route("/api/groups", methods=["POST"])
def create_group():
    """Create a new group - FAST VERSION"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    try:
        token = auth_header.replace("Bearer ", "")
        user = extract_user_from_token(token)
        
        if not user or not user.get("id"):
            return jsonify({"error": "Invalid token"}), 401
        
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({"error": "Group name is required"}), 400
        
        # Prepare group data
        group_data = {
            "name": data['name'].strip(),
            "description": data.get('description', '').strip() if data.get('description') else None,
            "created_by": str(user["id"])
        }
        
        # Create group
        new_group = supabase.create_group_fast(group_data, token)
        
        if new_group:
            logger.info(f"✅ Group created: {new_group['name']}")
            return jsonify(new_group), 201
        else:
            return jsonify({"error": "Failed to create group"}), 500
        
    except Exception as e:
        logger.error(f"Error in create_group: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/groups", methods=["GET"])
def get_user_groups():
    """Get all groups for the authenticated user - FAST VERSION"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    try:
        token = auth_header.replace("Bearer ", "")
        user = extract_user_from_token(token)
        
        if not user or not user.get("id"):
            return jsonify({"error": "Invalid token"}), 401
        
        groups = supabase.get_groups_fast(str(user["id"]), token)
        
        # Calculate expense count and total amount for each group
        for group in groups:
            expenses = supabase.get_expenses_fast(group["id"], token)
            group["expense_count"] = len(expenses)
            group["total_amount"] = round(sum(float(expense["amount"]) for expense in expenses), 2)
        
        return jsonify({
            "groups": groups,
            "count": len(groups)
        })
        
    except Exception as e:
        logger.error(f"Error in get_user_groups: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/groups/<int:group_id>/expenses", methods=["POST"])
def create_expense(group_id):
    """Create a new expense for a specific group"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    try:
        token = auth_header.replace("Bearer ", "")
        user = extract_user_from_token(token)
        
        if not user or not user.get("id"):
            return jsonify({"error": "Invalid token"}), 401
        
        data = request.get_json()
        if not data or not data.get('description') or not data.get('amount'):
            return jsonify({"error": "Description and amount are required"}), 400
        
        # Validate amount is a number
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({"error": "Amount must be greater than 0"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Amount must be a valid number"}), 400
        
        # First, verify the user owns this group
        groups = supabase.get_groups_fast(str(user["id"]), token)
        user_group_ids = [group['id'] for group in groups]
        
        if group_id not in user_group_ids:
            return jsonify({"error": "Group not found or access denied"}), 404
        
        # Prepare expense data
        expense_data = {
            "description": data['description'].strip(),
            "amount": amount,
            "group_id": group_id,
            "created_by": str(user["id"])
        }
        
        # Create expense
        new_expense = supabase.create_expense_fast(expense_data, token)
        
        if new_expense:
            logger.info(f"✅ Expense created: {new_expense['description']} - ${new_expense['amount']}")
            return jsonify(new_expense), 201
        else:
            return jsonify({"error": "Failed to create expense"}), 500
        
    except Exception as e:
        logger.error(f"Error in create_expense: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/groups/<int:group_id>/expenses", methods=["GET"])
def get_group_expenses(group_id):
    """Get all expenses for a specific group"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    try:
        token = auth_header.replace("Bearer ", "")
        user = extract_user_from_token(token)
        
        if not user or not user.get("id"):
            return jsonify({"error": "Invalid token"}), 401
        
        # First, verify the user owns this group
        groups = supabase.get_groups_fast(str(user["id"]), token)
        user_group_ids = [group['id'] for group in groups]
        
        if group_id not in user_group_ids:
            return jsonify({"error": "Group not found or access denied"}), 404
        
        # Get expenses for the group
        expenses = supabase.get_expenses_fast(group_id, token)
        
        # Calculate total amount
        total_amount = sum(float(expense["amount"]) for expense in expenses)
        
        return jsonify({
            "expenses": expenses,
            "count": len(expenses),
            "total_amount": round(total_amount, 2),
            "group_id": group_id
        })
        
    except Exception as e:
        logger.error(f"Error in get_group_expenses: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/expenses/<int:expense_id>", methods=["GET"])
def get_expense_by_id(expense_id):
    """Get a specific expense by ID"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    try:
        token = auth_header.replace("Bearer ", "")
        user = extract_user_from_token(token)
        
        if not user or not user.get("id"):
            return jsonify({"error": "Invalid token"}), 401
        
        # Get the expense
        expense = supabase.get_expense_by_id_fast(expense_id, token)
        
        if not expense:
            return jsonify({"error": "Expense not found"}), 404
        
        # Verify the user owns the group that this expense belongs to
        groups = supabase.get_groups_fast(str(user["id"]), token)
        user_group_ids = [group['id'] for group in groups]
        
        if expense['group_id'] not in user_group_ids:
            return jsonify({"error": "Access denied - you don't own this expense's group"}), 403
        
        logger.info(f"✅ Expense retrieved: {expense['description']} - ${expense['amount']}")
        return jsonify(expense), 200
        
    except Exception as e:
        logger.error(f"Error in get_expense_by_id: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/groups/<int:group_id>", methods=["DELETE"])
def delete_group(group_id):
    """Delete a specific group"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    try:
        token = auth_header.replace("Bearer ", "")
        user = extract_user_from_token(token)
        
        if not user or not user.get("id"):
            return jsonify({"error": "Invalid token"}), 401
        
        # Verify the user owns this group
        groups = supabase.get_groups_fast(str(user["id"]), token)
        user_group_ids = [group['id'] for group in groups]
        
        if group_id not in user_group_ids:
            return jsonify({"error": "Group not found or access denied"}), 404
        
        # Delete the group
        success = supabase.delete_group_fast(group_id, token)
        
        if success:
            logger.info(f"✅ Group deleted: ID {group_id}")
            return jsonify({"message": "Group deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete group"}), 500
        
    except Exception as e:
        logger.error(f"Error in delete_group: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    """Delete a specific expense"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    try:
        token = auth_header.replace("Bearer ", "")
        user = extract_user_from_token(token)
        
        if not user or not user.get("id"):
            return jsonify({"error": "Invalid token"}), 401
        
        # Get the expense first to verify ownership
        expense = supabase.get_expense_by_id_fast(expense_id, token)
        
        if not expense:
            return jsonify({"error": "Expense not found"}), 404
        
        # Verify the user owns the group that this expense belongs to
        groups = supabase.get_groups_fast(str(user["id"]), token)
        user_group_ids = [group['id'] for group in groups]
        
        if expense['group_id'] not in user_group_ids:
            return jsonify({"error": "Access denied - you don't own this expense's group"}), 403
        
        # Delete the expense
        success = supabase.delete_expense_fast(expense_id, token)
        
        if success:
            logger.info(f"✅ Expense deleted: {expense['description']} - ${expense['amount']}")
            return jsonify({"message": "Expense deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete expense"}), 500
        
    except Exception as e:
        logger.error(f"Error in delete_expense: {e}")
        return jsonify({"error": "Internal server error"}), 500

# ================================
# MAIN EXECUTION
# ================================

if __name__ == "__main__":
    print("🚀 Fast Group Handler - Starting...")
    print("✅ No external calls during startup")
    print("🌐 Starting Flask server...")
    print("API will be available at: http://localhost:8000")
    app.run(host="0.0.0.0", port=8000, debug=True) 