import requests
import json

# Quick test
token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlN3YUg4N3FjKzZLL0IrckYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21hdHNlZG5lbHpjbmd1aWpkeXB0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmM2ZmNjhmNS1hN2Q0LTQzNTgtOGQ5Yi0xZTc5YWU1OWU5ZDQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUxMzI5MTAyLCJpYXQiOjE3NTEzMjU1MDIsImVtYWlsIjoibWFyc0Bjb3JlZWRnZXNvbHV0aW9uLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJtYXJzQGNvcmVlZGdlc29sdXRpb24uY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZjNmZjY4ZjUtYTdkNC00MzU4LThkOWItMWU3OWFlNTllOWQ0In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTEzMjU1MDJ9XSwic2Vzc2lvbl9pZCI6IjU3ZjUwOTEzLWUyYTUtNDJhNS1iMjJkLTgyODcyZjU5NjQ1YSIsImlzX2Fub255bW91cyI6ZmFsc2V9.DGvg3_w_17h7tKulPaeSa9zrvGRQdivJYuSbESv9QNQ"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

data = {"name": "mars", "description": "mars core edge solutions"}

print("Testing API...")
try:
    response = requests.post("http://localhost:8000/api/groups", headers=headers, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 201:
        print("✅ SUCCESS! Group created and saved to Supabase!")
    else:
        print("❌ Failed")
except Exception as e:
    print(f"Error: {e}") 