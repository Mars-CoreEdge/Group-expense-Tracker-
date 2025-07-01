#!/usr/bin/env python3
"""
Test Expense functionality with real user token
"""

import requests
import json

def test_expenses():
    print("🧪 Testing Expense Functionality...")
    print("="*60)
    
    # Your token from the previous test
    token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlN3YUg4N3FjKzZLL0IrckYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21hdHNlZG5lbHpjbmd1aWpkeXB0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmM2ZmNjhmNS1hN2Q0LTQzNTgtOGQ5Yi0xZTc5YWU1OWU5ZDQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxMzI5MTAyLCJpYXQiOjE3NTEzMjU1MDIsImVtYWlsIjoibWFyc0Bjb3JlZWRnZXNvbHV0aW9uLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJtYXJzQGNvcmVlZGdlc29sdXRpb24uY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjNmZjY4ZjUtYTdkNC00MzU4LThkOWItMWU3OWFlNTllOWQ0In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTEzMjU1MDJ9XSwic2Vzc2lvbl9pZCI6IjU3ZjUwOTEzLWUyYTUtNDJhNS1iMjJkLTgyODcyZjU5NjQ1YSIsImlzX2Fub255bW91cyI6ZmFsc2V9.DGvg3_w_17h7tKulPaeSa9zrvGRQdivJYuSbESv9QNQ"
    
    base_url = "http://localhost:8000"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        # Step 1: Get user's groups first
        print("1. Getting user's groups...")
        response = requests.get(f"{base_url}/api/groups", headers=headers, timeout=5)
        if response.status_code == 200:
            groups_data = response.json()
            groups = groups_data.get('groups', [])
            print(f"   ✅ Found {len(groups)} groups")
            
            if not groups:
                print("   ❌ No groups found. Create a group first!")
                return False
            
            # Use the first group for testing
            test_group = groups[0]
            group_id = test_group['id']
            print(f"   Using group: {test_group['name']} (ID: {group_id})")
            
        else:
            print(f"   ❌ Failed to get groups: {response.status_code}")
            return False
        
        # Step 2: Create some test expenses
        print(f"\n2. Creating expenses for group {group_id}...")
        
        test_expenses = [
            {"description": "Coffee for the team", "amount": 25.50},
            {"description": "Office supplies", "amount": 45.75},
            {"description": "Lunch meeting", "amount": 120.00}
        ]
        
        created_expenses = []
        for expense in test_expenses:
            response = requests.post(
                f"{base_url}/api/groups/{group_id}/expenses",
                headers=headers,
                json=expense,
                timeout=5
            )
            
            if response.status_code == 201:
                created_expense = response.json()
                created_expenses.append(created_expense)
                print(f"   ✅ Created: {created_expense['description']} - ${created_expense['amount']}")
            else:
                print(f"   ❌ Failed to create expense: {response.status_code} - {response.text}")
        
        # Step 3: Get expenses for the group
        print(f"\n3. Getting expenses for group {group_id}...")
        response = requests.get(
            f"{base_url}/api/groups/{group_id}/expenses",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            expenses_data = response.json()
            expenses = expenses_data.get('expenses', [])
            total_amount = expenses_data.get('total_amount', 0)
            count = expenses_data.get('count', 0)
            
            print(f"   ✅ Retrieved {count} expenses")
            print(f"   💰 Total amount: ${total_amount}")
            print(f"   📋 Expenses:")
            
            for expense in expenses:
                print(f"      - {expense['description']}: ${expense['amount']} (ID: {expense['id']})")
            
            return True
        else:
            print(f"   ❌ Failed to get expenses: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    test_expenses() 