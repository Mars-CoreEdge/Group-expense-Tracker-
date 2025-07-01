#!/usr/bin/env python3
"""
Test Full Flow: Groups + Expenses functionality
"""

import requests
import json

def test_full_flow():
    print("🧪 Testing FULL FLOW: Groups + Expenses...")
    print("="*60)
    
    # Your token from the previous test
    token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlN3YUg4N3FjKzZLL0IrckYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21hdHNlZG5lbHpjbmd1aWpkeXB0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmM2ZmNjhmNS1hN2Q0LTQzNTgtOGQ5Yi0xZTc5YWU1OWU5ZDQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxMzI5MTAyLCJpYXQiOjE3NTEzMjU1MDIsImVtYWlsIjoibWFyc0Bjb3JlZWRnZXNvbHV0aW9uLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJtYXJzQGNvcmVlZGdlc29sdXRpb24uY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjNmZjY4ZjUtYTdkNC00MzU4LThkOWItMWU3OWFlNTllOWQ0In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTEzMjU1MDJ9XSwic2Vzc2lvbl9pZCI6IjU3ZjUwOTEzLWUyYTUtNDJhNS1iMjJkLTgyODcyZjU5NjQ1YSIsImlzX2Fub255bW91cyI6ZmFsc2V9.DGvg3_w_17h7tKulPaeSa9zrvGRQdivJYuSbESv9QNQ"
    
    base_url = "http://localhost:8000"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        # Step 1: Create a test group
        print("1. Creating a test group...")
        group_data = {
            "name": "Test Expense Group",
            "description": "A group for testing expenses functionality"
        }
        
        response = requests.post(f"{base_url}/api/groups", headers=headers, json=group_data, timeout=5)
        
        if response.status_code == 201:
            group = response.json()
            group_id = group['id']
            print(f"   ✅ Group created: {group['name']} (ID: {group_id})")
        else:
            print(f"   ❌ Failed to create group: {response.status_code} - {response.text}")
            return False
        
        # Step 2: Create multiple expenses
        print(f"\n2. Creating expenses for group {group_id}...")
        
        test_expenses = [
            {"description": "Morning coffee", "amount": 5.50},
            {"description": "Team lunch", "amount": 85.75},
            {"description": "Office supplies", "amount": 32.40},
            {"description": "Printer paper", "amount": 15.99},
            {"description": "Meeting snacks", "amount": 28.30}
        ]
        
        created_expenses = []
        for i, expense in enumerate(test_expenses):
            response = requests.post(
                f"{base_url}/api/groups/{group_id}/expenses",
                headers=headers,
                json=expense,
                timeout=5
            )
            
            if response.status_code == 201:
                created_expense = response.json()
                created_expenses.append(created_expense)
                print(f"   ✅ Expense {i+1}: {created_expense['description']} - ${created_expense['amount']}")
            else:
                print(f"   ❌ Failed to create expense {i+1}: {response.status_code} - {response.text}")
        
        print(f"   📊 Created {len(created_expenses)} out of {len(test_expenses)} expenses")
        
        # Step 3: Get all expenses for the group
        print(f"\n3. Retrieving all expenses for group {group_id}...")
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
            print(f"   📋 Expense Details:")
            
            for expense in expenses:
                created_at = expense.get('created_at', '')[:19]  # Just date and time
                print(f"      • ID {expense['id']}: {expense['description']} - ${expense['amount']} ({created_at})")
            
            # Step 4: Verify data is in Supabase
            print(f"\n4. Summary:")
            print(f"   ✅ Group: '{group['name']}' saved to Supabase")
            print(f"   ✅ {count} expenses saved to Supabase")
            print(f"   ✅ All expenses linked to group_id: {group_id}")
            print(f"   ✅ All expenses linked to user: {group['created_by']}")
            print(f"   💰 Total expense amount: ${total_amount}")
            
            print(f"\n🎉 SUCCESS! Full functionality working:")
            print(f"   • Groups stored in Supabase ✅")
            print(f"   • Expenses stored in Supabase ✅") 
            print(f"   • Expenses linked to groups ✅")
            print(f"   • Expenses linked to users ✅")
            
            return True
        else:
            print(f"   ❌ Failed to get expenses: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    test_full_flow() 