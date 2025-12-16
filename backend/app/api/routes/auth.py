from fastapi import APIRouter, HTTPException, status, Depends, Request
from supabase import Client
from app.database import get_db
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


router = APIRouter()


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "consumer"  # consumer, farmer, admin


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class OAuthSignInRequest(BaseModel):
    provider: str  # google, github, facebook, twitter, discord
    redirect_url: Optional[str] = None


@router.post("/signup")
async def signup(signup_data: SignUpRequest, db: Client = Depends(get_db)):
    """Sign up with email and password using Supabase Auth"""
    try:
        # Sign up with Supabase Auth
        auth_response = db.auth.sign_up({
            "email": signup_data.email,
            "password": signup_data.password,
            "options": {
                "data": {
                    "name": signup_data.name,
                    "role": signup_data.role
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create account"
            )
        
        user_id = auth_response.user.id
        
        # Create user profile in our database
        user_profile = {
            "id": user_id,
            "email": signup_data.email,
            "name": signup_data.name,
            "role": signup_data.role,
            "is_verified": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        db.table("users").insert(user_profile).execute()
        
        # If farmer, create farmer profile and wallet
        if signup_data.role == "farmer":
            farmer_profile = {
                "user_id": user_id,
                "farm_name": f"{signup_data.name}'s Farm",
                "wallet_balance": 0.0,
                "total_rating": 0.0,
                "rating_count": 0,
                "products_count": 0,
                "total_sales": 0.0
            }
            db.table("farmer_profiles").insert(farmer_profile).execute()
            
            wallet = {
                "user_id": user_id,
                "balance": 0.0,
                "total_earned": 0.0,
                "total_withdrawn": 0.0
            }
            db.table("wallets").insert(wallet).execute()
        
        # Create cart for consumer
        if signup_data.role == "consumer":
            cart = {"user_id": user_id}
            db.table("carts").insert(cart).execute()
        
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": signup_data.email,
                "name": signup_data.name,
                "role": signup_data.role
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/signin")
async def signin(credentials: SignInRequest, db: Client = Depends(get_db)):
    """Sign in with email and password using Supabase Auth"""
    try:
        # Sign in with Supabase Auth
        auth_response = db.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Get user profile from database
        user_result = db.table("users").select("*").eq("id", auth_response.user.id).execute()
        
        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        user = user_result.data[0]
        
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "profile_image_url": user.get("profile_image_url")
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


@router.post("/oauth/{provider}")
async def oauth_signin(provider: str, db: Client = Depends(get_db)):
    """
    Get OAuth URL for social login
    Supported providers: google, github, facebook, twitter, discord, azure, apple
    """
    try:
        redirect_url = "http://localhost:5173/auth/callback"  # Frontend callback URL
        
        auth_response = db.auth.sign_in_with_oauth({
            "provider": provider,
            "options": {
                "redirect_to": redirect_url
            }
        })
        
        return {
            "url": auth_response.url,
            "provider": provider
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth provider '{provider}' not supported or error: {str(e)}"
        )


@router.post("/callback")
async def oauth_callback(request: Request, db: Client = Depends(get_db)):
    """Handle OAuth callback and create user profile if needed"""
    try:
        # Get the session from Supabase
        body = await request.json()
        access_token = body.get("access_token")
        refresh_token = body.get("refresh_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token provided"
            )
        
        # Get user from Supabase
        user_response = db.auth.get_user(access_token)
        
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user_id = user_response.user.id
        email = user_response.user.email
        
        # Check if user exists in our database
        existing_user = db.table("users").select("*").eq("id", user_id).execute()
        
        if not existing_user.data:
            # Create new user profile
            user_metadata = user_response.user.user_metadata or {}
            name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]
            
            user_profile = {
                "id": user_id,
                "email": email,
                "name": name,
                "role": "consumer",  # Default role for OAuth users
                "profile_image_url": user_metadata.get("avatar_url") or user_metadata.get("picture"),
                "is_verified": True,  # OAuth users are pre-verified
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            db.table("users").insert(user_profile).execute()
            
            # Create cart for new consumer
            cart = {"user_id": user_id}
            db.table("carts").insert(cart).execute()
            
            user = user_profile
        else:
            user = existing_user.data[0]
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "profile_image_url": user.get("profile_image_url")
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/signout")
async def signout(db: Client = Depends(get_db)):
    """Sign out user"""
    try:
        db.auth.sign_out()
        return {"message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/refresh")
async def refresh_token(refresh_token: str, db: Client = Depends(get_db)):
    """Refresh access token"""
    try:
        auth_response = db.auth.refresh_session(refresh_token)
        
        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh token"
        )
