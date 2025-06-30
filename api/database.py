# import os
# from supabase import create_client, Client
# url: str = os.environ.get("SUPABASE_URL")
# key: str = os.environ.get("SUPABASE_KEY")
# supabase: Client = create_client(url, key)


# client.table("expenses").insert({
#     "amount": 100,
#     "description": "Test expense",
#     "date": "2021-01-01"
# }).execute()




import os
from supabase import create_client, Client
from typing import Dict, Any, List, Optional
from config import settings

# Initialize Supabase client
url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY
supabase: Client = create_client(url, key)

class DatabaseClient:
    def __init__(self):
        self.client = supabase

    def insert(self, table: str, data: Dict[Any, Any]) -> List[Dict[Any, Any]]:
        """Insert data into a table"""
        try:
            result = self.client.table(table).insert(data).execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Database insert failed: {e}")
            raise e

    def select(self, table: str, columns: str = "*", filters: Dict[str, Any] = None, order: str = None) -> List[Dict[Any, Any]]:
        """Select data from a table"""
        try:
            query = self.client.table(table).select(columns)
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
                    
            if order:
                # Parse order string (e.g., "created_at.desc" or "name.asc")
                if "." in order:
                    column, direction = order.split(".")
                    ascending = direction.lower() == "asc"
                else:
                    column = order
                    ascending = True
                query = query.order(column, desc=not ascending)
                
            result = query.execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Database select failed: {e}")
            return []

    def verify_user_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token with Supabase Auth"""
        try:
            # Get user from token using Supabase auth
            user_response = self.client.auth.get_user(token)
            if user_response.user:
                user = user_response.user
                return {
                    "id": user.id,
                    "email": user.email,
                    "user_metadata": user.user_metadata or {}
                }
            else:
                print("No user found for token")
                return None
                
        except Exception as e:
            print(f"Error verifying token: {e}")
            return None

# Global instance
db_client = DatabaseClient() 