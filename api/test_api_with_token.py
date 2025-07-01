#!/usr/bin/env python3
"""
Test API with real user token and data
"""

import requests
import json

def test_api():
    print("🧪 Testing API with your token and data...")
    print("="*60)
    
    # Your token from the curl request
    token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlN3YUg4N3FjKzZLL0IrckYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21hdHNlZG5lbHpjbmd1aWpkeXB0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmM2ZmNjhmNS1hN2Q0LTQzNTgtOGQ5Yi0xZTc5YWU1OWU5ZDQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxMzI5MTAyLCJpYXQiOjE3NTEzMjU1MDIsImVtYWlsIjoibWFyc0Bjb3JlZWRnZXNvbHV0aW9uLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJtYXJzQGNvcmVlZGdlc29sdXRpb24uY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjNmZjY4ZjUtYTdkNC00MzU4LThkOWItMWU3OWFlNTllOWQ0In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTEzMjU1MDJ9XSwic2Vzc2lvbl9pZCI6IjU3ZjUwOTEzLWUyYTUtNDJhNS1iMjJkLTgyODcyZjU5NjQ1YSIsImlzX2Fub255bW91cyI6ZmFsc2V9.DGvg3_w_17h7tKulPaeSa9zrvGRQdivJYuSbESv9QNQ"
    
    # API URL
    url = "http://localhost:8000/api/groups"
    
    # Headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    # Your data
    data = {
        "name": "mars", 
        "description": "mars core edge solutions"
    }
    
    try:
        print("1. Testing health endpoint...")
        health_response = requests.get("http://localhost:8000/health")
        if health_response.status_code == 200:
            print(f"   ✅ Server is running: {health_response.json()}")
        else:
            print(f"   ❌ Server not responding: {health_response.status_code}")
            return False
            
        print("\n2. Testing group creation...")
        print(f"   URL: {url}")
        print(f"   Data: {data}")
        print(f"   Token: {token[:50]}...")
        
        response = requests.post(url, headers=headers, json=data)
        
        print(f"\n3. Response:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Text: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            print(f"\n✅ SUCCESS! Group created:")
            print(f"   - ID: {result.get('id')}")
            print(f"   - Name: {result.get('name')}")
            print(f"   - Description: {result.get('description')}")
            print(f"   - Created By: {result.get('created_by')}")
            print(f"   - Created At: {result.get('created_at')}")
            return True
        else:
            print(f"\n❌ FAILED! Status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Raw response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_api() 