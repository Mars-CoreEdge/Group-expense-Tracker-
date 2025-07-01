#!/usr/bin/env python3
import requests
import json

def diagnose_api():
    print("🔍 DIAGNOSING API ENDPOINT...")
    print("="*50)
    
    base_url = "http://localhost:8000"
    token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlN3YUg4N3FjKzZLL0IrckYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21hdHNlZG5lbHpjbmd1aWpkeXB0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmM2ZmNjhmNS1hN2Q0LTQzNTgtOGQ5Yi0xZTc5YWU1OWU5ZDQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxMzI5MTAyLCJpYXQiOjE3NTEzMjU1MDIsImVtYWlsIjoibWFyc0Bjb3JlZWRnZXNvbHV0aW9uLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJtYXJzQGNvcmVlZGdlc29sdXRpb24uY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjNmZjY4ZjUtYTdkNC00MzU4LThkOWItMWU3OWFlNTllOWQ0In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTEzMjU1MDJ9XSwic2Vzc2lvbl9pZCI6IjU3ZjUwOTEzLWUyYTUtNDJhNS1iMjJkLTgyODcyZjU5NjQ1YSIsImlzX2Fub255bW91cyI6ZmFsc2V9.DGvg3_w_17h7tKulPaeSa9zrvGRQdivJYuSbESv9QNQ"
    
    # Test 1: Health check
    try:
        print("1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"   ✅ Health: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ❌ Health failed: {e}")
        return
    
    # Test 2: Root endpoint
    try:
        print("\n2. Testing root endpoint...")
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"   ✅ Root: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Root failed: {e}")
    
    # Test 3: GET /api/groups (should fail without auth)
    try:
        print("\n3. Testing GET /api/groups without auth...")
        response = requests.get(f"{base_url}/api/groups", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ GET groups failed: {e}")
    
    # Test 4: POST /api/groups with auth
    try:
        print("\n4. Testing POST /api/groups with auth...")
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        data = {"name": "mars", "description": "mars core edge solutions"}
        
        response = requests.post(f"{base_url}/api/groups", 
                               headers=headers, 
                               json=data, 
                               timeout=10)
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 201:
            print("   ✅ SUCCESS! Group created!")
        elif response.status_code == 401:
            print("   ⚠️ Authentication issue")
        elif response.status_code == 500:
            print("   ⚠️ Server error")
        else:
            print(f"   ⚠️ Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ POST groups failed: {e}")

if __name__ == "__main__":
    diagnose_api() 