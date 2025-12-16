from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from supabase import Client
from app.database import get_db
from pydantic import BaseModel


# Security scheme
security = HTTPBearer()


class CurrentUser(BaseModel):
    id: str
    email: str
    role: str
    name: str


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db)
) -> CurrentUser:
    """Get current authenticated user from Supabase OAuth token"""
    token = credentials.credentials
    
    try:
        # Verify token with Supabase
        user_response = db.auth.get_user(token)
        
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = user_response.user.id
        
        # Get user profile from database
        user_result = db.table("users").select("*").eq("id", user_id).execute()
        
        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        user = user_result.data[0]
        
        return CurrentUser(
            id=user["id"],
            email=user["email"],
            role=user["role"],
            name=user["name"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_consumer(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """Ensure current user is a consumer"""
    if current_user.role != "consumer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only consumers can access this resource"
        )
    return current_user


async def get_current_farmer(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """Ensure current user is a farmer"""
    if current_user.role != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can access this resource"
        )
    return current_user


async def get_current_admin(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """Ensure current user is an admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access this resource"
        )
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Client = Depends(get_db)
) -> Optional[CurrentUser]:
    """Get current user if token is provided, otherwise None (for public endpoints)"""
    if not credentials:
        return None
    
    token = credentials.credentials
    
    try:
        user_response = db.auth.get_user(token)
        
        if not user_response.user:
            return None
        
        user_result = db.table("users").select("*").eq("id", user_response.user.id).execute()
        
        if not user_result.data:
            return None
        
        user = user_result.data[0]
        
        return CurrentUser(
            id=user["id"],
            email=user["email"],
            role=user["role"],
            name=user["name"]
        )
    except:
        return None
