from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.user import (
    LoginRequest, UserCreate, GoogleAuthRequest,
    TokenResponse, AuthResponse, RefreshTokenRequest,
    EmailVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest,
    UserResponse
)
from app.schemas.common import create_response
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token,
    decode_token, verify_google_token
)
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/login")
async def login(credentials: LoginRequest):
    """Login with email and password."""
    try:
        # Get user from database
        result = supabase_admin_client.table("users").select("*").eq("email", credentials.email).execute()
        
        if not result.data:
            return create_response(
                success=False,
                message="Invalid email or password",
                errors={"email": "User not found"}
            )
        
        user = result.data[0]
        
        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            return create_response(
                success=False,
                message="Invalid email or password",
                errors={"password": "Incorrect password"}
            )
        
        # Create tokens
        access_token = create_access_token({"sub": user["id"], "role": user["role"]})
        refresh_token = create_refresh_token({"sub": user["id"]})
        
        # Remove password hash from response
        user.pop("password_hash", None)
        
        return create_response(
            success=True,
            message="Login successful",
            data={
                "user": user,
                "accessToken": access_token,
                "refreshToken": refresh_token
            }
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Login failed",
            errors={"server": str(e)}
        )

@router.post("/register")
async def register(user_data: UserCreate):
    """Register a new user."""
    try:
        # Check if user already exists
        existing = supabase_admin_client.table("users").select("id").eq("email", user_data.email).execute()
        
        if existing.data:
            return create_response(
                success=False,
                message="Registration failed",
                errors={"email": "Email already registered"}
            )
        
        # Hash password
        password_hash = get_password_hash(user_data.password)
        
        # Prepare user data
        new_user = {
            "id": str(uuid.uuid4()),
            "email": user_data.email,
            "password_hash": password_hash,
            "full_name": user_data.full_name,
            "role": user_data.role,
            "phone_number": user_data.phone_number,
            "farm_name": user_data.farm_name if user_data.role == "farmer" else None,
            "farm_location": user_data.farm_location if user_data.role == "farmer" else None,
            "farm_description": user_data.farm_description if user_data.role == "farmer" else None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Insert user
        result = supabase_admin_client.table("users").insert(new_user).execute()
        
        if not result.data:
            return create_response(
                success=False,
                message="Registration failed",
                errors={"server": "Failed to create user"}
            )
        
        user = result.data[0]
        
        # Create tokens
        access_token = create_access_token({"sub": user["id"], "role": user["role"]})
        refresh_token = create_refresh_token({"sub": user["id"]})
        
        # Remove password hash from response
        user.pop("password_hash", None)
        
        return create_response(
            success=True,
            message="Registration successful",
            data={
                "user": user,
                "accessToken": access_token,
                "refreshToken": refresh_token
            }
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Registration failed",
            errors={"server": str(e)}
        )

@router.post("/google")
async def google_auth(auth_data: GoogleAuthRequest):
    """Authenticate with Google OAuth."""
    try:
        # Verify Google token
        google_user = verify_google_token(auth_data.token)
        
        if not google_user:
            return create_response(
                success=False,
                message="Invalid Google token",
                errors={"token": "Failed to verify Google token"}
            )
        
        # Check if user exists
        result = supabase_admin_client.table("users").select("*").eq("email", google_user["email"]).execute()
        
        if result.data:
            # Existing user
            user = result.data[0]
        else:
            # Create new user
            new_user = {
                "id": str(uuid.uuid4()),
                "email": google_user["email"],
                "full_name": google_user["name"],
                "role": auth_data.role,
                "profile_image_url": google_user.get("picture"),
                "password_hash": "",  # No password for OAuth users
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = supabase_admin_client.table("users").insert(new_user).execute()
            
            if not result.data:
                return create_response(
                    success=False,
                    message="Failed to create user",
                    errors={"server": "Database error"}
                )
            
            user = result.data[0]
        
        # Create tokens
        access_token = create_access_token({"sub": user["id"], "role": user["role"]})
        refresh_token = create_refresh_token({"sub": user["id"]})
        
        # Remove password hash from response
        user.pop("password_hash", None)
        
        return create_response(
            success=True,
            message="Google authentication successful",
            data={
                "user": user,
                "accessToken": access_token,
                "refreshToken": refresh_token
            }
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Google authentication failed",
            errors={"server": str(e)}
        )

@router.get("/me")
async def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get current authenticated user."""
    try:
        user = await get_current_user(credentials)
        user.pop("password_hash", None)
        
        return create_response(
            success=True,
            message="User retrieved successfully",
            data={"user": user}
        )
    except HTTPException as e:
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )

@router.post("/refresh")
async def refresh_token(token_data: RefreshTokenRequest):
    """Refresh access token using refresh token."""
    try:
        payload = decode_token(token_data.refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            return create_response(
                success=False,
                message="Invalid refresh token",
                errors={"token": "Invalid or expired refresh token"}
            )
        
        user_id = payload.get("sub")
        
        # Get user to include role in new token
        result = supabase_admin_client.table("users").select("id, role").eq("id", user_id).execute()
        
        if not result.data:
            return create_response(
                success=False,
                message="User not found",
                errors={"user": "User no longer exists"}
            )
        
        user = result.data[0]
        
        # Create new access token
        access_token = create_access_token({"sub": user["id"], "role": user["role"]})
        
        return create_response(
            success=True,
            message="Token refreshed successfully",
            data={
                "accessToken": access_token
            }
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Token refresh failed",
            errors={"server": str(e)}
        )

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset (Not implemented - OAuth login recommended)."""
    try:
        # Note: Email functionality not implemented
        # Use Google OAuth for password recovery
        
        return create_response(
            success=False,
            message="Password reset via email is not available. Please use Google OAuth to login.",
            errors={"feature": "Email password reset not implemented. Use OAuth login."}
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to process request",
            errors={"server": str(e)}
        )

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token (Not implemented - OAuth login recommended)."""
    try:
        # Note: Email functionality not implemented
        # Use Google OAuth for password recovery
        
        return create_response(
            success=False,
            message="Password reset via email is not available. Please use Google OAuth to login.",
            errors={"feature": "Email password reset not implemented. Use OAuth login."}
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to reset password",
            errors={"server": str(e)}
        )
