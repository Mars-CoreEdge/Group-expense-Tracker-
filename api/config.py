import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SUPABASE_URL: str = "https://matsednelzcnguijdypt.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdHNlZG5lbHpjbmd1aWpkeXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDk4MDgsImV4cCI6MjA2NjYyNTgwOH0.HQ7WnnTCjwcBxD7pKCt1aZLrfXWORYyT5OVuhYe-Vpg"
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # CORS settings - Allow all localhost ports
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",  # Your current frontend port
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",  # Your current frontend port
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:5177",
        "http://127.0.0.1:5178",
        "*"  # Allow all origins for development
    ]

settings = Settings() 