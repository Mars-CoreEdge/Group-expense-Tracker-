from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from decimal import Decimal
import json

from config import settings
from database import db_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Enable CORS
CORS(app, origins=settings.CORS_ORIGINS)

# Helper function to get current user from authorization header
def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        logger.warning("No Authorization header provided")
        return None, {"error": "Authorization header missing"}, 401
    
    try:
        # Extract the token from "Bearer <token>"
        token = auth_header.replace("Bearer ", "")
        logger.info(f"Attempting to verify token: {token[:20]}...")
        
        # Use simplified token verification
        user = db_client.verify_user_token(token)
        if not user:
            logger.warning("Token verification failed - no user returned")
            return None, {"error": "Invalid token"}, 401
        
        logger.info(f"User authenticated successfully: {user.get('email', 'Unknown')}")
        return user, None, None
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return None, {"error": "Invalid authentication"}, 401

# Custom JSON encoder to handle Decimal
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

app.json_encoder = DecimalEncoder

# Root endpoint
@app.route("/")
def root():
    return jsonify({"message": "ExpenseTracker API", "version": "1.0.0"})

# Health check endpoint
@app.route("/health")
def health_check():
    return jsonify({"status": "healthy", "service": "ExpenseTracker API"})

# API Routes

@app.route("/api/groups", methods=["POST"])
def create_group():
    """Create a new group for the authenticated user."""
    user, error, status_code = get_current_user()
    if error:
        return jsonify(error), status_code
    
    try:
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({"error": "Group name is required"}), 400
        
        # Insert group into Supabase - match exact schema fields
        group_data = {
            "name": data['name'],
            "description": data.get('description') if data.get('description') and data.get('description').strip() else None,
            "created_by": str(user["id"])
        }
        
        logger.info(f"Sending group data to DB: {group_data}")
        result = db_client.insert("groups", group_data)
        logger.info(f"DB insert result: {result}")
        
        if not result:
            return jsonify({"error": "Failed to create group"}), 400
        
        return jsonify(result[0]), 201
        
    except Exception as e:
        logger.error(f"Error creating group: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/expenses/<int:group_id>", methods=["GET"])
def get_expenses_for_group(group_id):
    """Get all expenses for a specific group."""
    user, error, status_code = get_current_user()
    if error:
        return jsonify(error), status_code
    
    try:
        # First, verify the user owns this group
        groups = db_client.select("groups", filters={"id": group_id, "created_by": str(user["id"])})
        
        if not groups:
            return jsonify({"error": "Group not found or access denied"}), 404
        
        # Get expenses for the group
        expenses = db_client.select("expenses", filters={"group_id": group_id}, order="created_at.desc")
        
        # Calculate total amount
        total_amount = sum(Decimal(str(expense["amount"])) for expense in expenses)
        
        return jsonify({
            "expenses": expenses,
            "count": len(expenses),
            "total_amount": float(total_amount)
        })
        
    except Exception as e:
        logger.error(f"Error getting expenses for group {group_id}: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/expenses/<int:group_id>", methods=["POST"])
def add_expense_to_group(group_id):
    """Add a new expense to a specific group."""
    user, error, status_code = get_current_user()
    if error:
        return jsonify(error), status_code
    
    try:
        data = request.get_json()
        if not data or not data.get('description') or not data.get('amount'):
            return jsonify({"error": "Description and amount are required"}), 400
        
        # First, verify the user owns this group
        groups = db_client.select("groups", filters={"id": group_id, "created_by": str(user["id"])})
        
        if not groups:
            return jsonify({"error": "Group not found or access denied"}), 404
        
        # Insert expense into Supabase
        expense_data = {
            "description": data['description'],
            "amount": data['amount'],
            "group_id": group_id,
            "created_by": str(user["id"])
        }
        
        result = db_client.insert("expenses", expense_data)
        
        if not result:
            return jsonify({"error": "Failed to create expense"}), 400
        
        return jsonify(result[0]), 201
        
    except Exception as e:
        logger.error(f"Error adding expense to group {group_id}: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/groups/<int:group_id>", methods=["DELETE"])
def delete_group(group_id):
    """Delete a group and all its expenses."""
    user, error, status_code = get_current_user()
    if error:
        return jsonify(error), status_code
    
    try:
        # First, verify the user owns this group
        groups = db_client.select("groups", filters={"id": group_id, "created_by": str(user["id"])})
        
        if not groups:
            return jsonify({"error": "Group not found or access denied"}), 404
        
        # Delete all expenses for this group first
        db_client.delete("expenses", filters={"group_id": group_id})
        
        # Delete the group
        result = db_client.delete("groups", filters={"id": group_id, "created_by": str(user["id"])})
        
        return jsonify({"message": "Group deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error deleting group {group_id}: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    """Delete a specific expense."""
    user, error, status_code = get_current_user()
    if error:
        return jsonify(error), status_code
    
    try:
        # First, verify the user owns this expense
        expenses = db_client.select("expenses", filters={"id": expense_id, "created_by": str(user["id"])})
        
        if not expenses:
            return jsonify({"error": "Expense not found or access denied"}), 404
        
        # Delete the expense
        result = db_client.delete("expenses", filters={"id": expense_id, "created_by": str(user["id"])})
        
        return jsonify({"message": "Expense deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error deleting expense {expense_id}: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/api/groups", methods=["GET"])
def get_user_groups():
    """Get all groups for the authenticated user."""
    user, error, status_code = get_current_user()
    if error:
        return jsonify(error), status_code
    
    try:
        groups = db_client.select("groups", filters={"created_by": str(user["id"])}, order="created_at.desc")
        
        # Calculate expense count and total amount for each group
        for group in groups:
            expenses = db_client.select("expenses", filters={"group_id": group["id"]})
            group["expense_count"] = len(expenses)
            group["total_amount"] = float(sum(Decimal(str(expense["amount"])) for expense in expenses))
        
        return jsonify({
            "groups": groups,
            "count": len(groups)
        })
        
    except Exception as e:
        logger.error(f"Error getting user groups: {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 