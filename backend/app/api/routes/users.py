from fastapi import APIRouter, HTTPException, status, Depends
from supabase import Client
from app.database import get_db
from app.models import UserResponse, UserUpdate, FarmerProfileResponse, FarmerProfileUpdate
from app.dependencies import get_current_user, get_current_farmer, CurrentUser
from datetime import datetime


router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Get current user's profile"""
    result = db.table("users").select("*").eq("id", current_user.id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return result.data[0]


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: UserUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Update current user's profile"""
    update_dict = update_data.model_dump(exclude_unset=True)
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_dict["updated_at"] = datetime.utcnow().isoformat()
    
    result = db.table("users").update(update_dict).eq("id", current_user.id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return result.data[0]


@router.get("/farmer-profile", response_model=FarmerProfileResponse)
async def get_farmer_profile(
    current_user: CurrentUser = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Get current farmer's profile"""
    result = db.table("farmer_profiles").select("*").eq("user_id", current_user.id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found"
        )
    
    return result.data[0]


@router.put("/farmer-profile", response_model=FarmerProfileResponse)
async def update_farmer_profile(
    update_data: FarmerProfileUpdate,
    current_user: CurrentUser = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Update current farmer's profile"""
    update_dict = update_data.model_dump(exclude_unset=True)
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    result = db.table("farmer_profiles").update(update_dict).eq("user_id", current_user.id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found"
        )
    
    return result.data[0]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    db: Client = Depends(get_db)
):
    """Get user by ID (public)"""
    result = db.table("users").select("id, email, name, role, profile_image_url, is_verified, created_at").eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return result.data[0]
