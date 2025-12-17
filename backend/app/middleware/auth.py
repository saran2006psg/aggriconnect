from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.core.security import decode_token
from app.core.supabase import supabase_admin_client

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials) -> dict:
    """Get current authenticated user from token."""
    token = credentials.credentials
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Fetch user from database
    result = supabase_admin_client.table("users").select("*").eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return result.data[0]

async def get_current_active_user(credentials: HTTPAuthorizationCredentials) -> dict:
    """Get current active user."""
    user = await get_current_user(credentials)
    return user

async def require_role(user: dict, allowed_roles: list):
    """Check if user has required role."""
    if user.get("role") not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return user
