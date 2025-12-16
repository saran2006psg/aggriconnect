from supabase import create_client, Client
from app.config import settings
from typing import Optional


class Database:
    """Supabase database client wrapper"""
    
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client instance (singleton)"""
        if cls._instance is None:
            cls._instance = create_client(
                supabase_url=settings.SUPABASE_URL,
                supabase_key=settings.SUPABASE_KEY
            )
        return cls._instance
    
    @classmethod
    def get_service_client(cls) -> Client:
        """Get Supabase client with service role key (admin access)"""
        return create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
        )


# Dependency for FastAPI routes
def get_db() -> Client:
    """FastAPI dependency to get database client"""
    return Database.get_client()


# Export for convenience
supabase = Database.get_client()
