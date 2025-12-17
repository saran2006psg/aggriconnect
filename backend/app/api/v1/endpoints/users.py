from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.user import UserUpdate, AddressCreate, AddressUpdate
from app.schemas.common import create_response
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user
from datetime import datetime
import uuid

router = APIRouter()

@router.put("/profile")
async def update_profile(
    update_data: UserUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update user profile."""
    try:
        user = await get_current_user(credentials)
        
        # Build update data
        update_fields = {k: v for k, v in update_data.dict(exclude_unset=True).items()}
        
        if not update_fields:
            return create_response(
                success=False,
                message="No fields to update",
                errors={"update": "No data provided"}
            )
        
        result = supabase_admin_client.table("users").update(update_fields).eq("id", user["id"]).execute()
        
        if result.data:
            result.data[0].pop("password_hash", None)
        
        return create_response(
            success=True,
            message="Profile updated successfully",
            data=result.data[0] if result.data else None
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to update profile",
            errors={"server": str(e)}
        )

@router.get("/addresses")
async def get_addresses(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's addresses."""
    try:
        user = await get_current_user(credentials)
        
        result = supabase_admin_client.table("addresses").select("*").eq("user_id", user["id"]).execute()
        
        return create_response(
            success=True,
            message="Addresses retrieved successfully",
            data=result.data
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to retrieve addresses",
            errors={"server": str(e)}
        )

@router.post("/addresses")
async def create_address(
    address: AddressCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add a new address."""
    try:
        user = await get_current_user(credentials)
        
        # If this is set as default, unset other defaults
        if address.is_default:
            supabase_admin_client.table("addresses").update({"is_default": False}).eq("user_id", user["id"]).execute()
        
        new_address = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            **address.dict(),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase_admin_client.table("addresses").insert(new_address).execute()
        
        return create_response(
            success=True,
            message="Address added successfully",
            data=result.data[0] if result.data else None
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to add address",
            errors={"server": str(e)}
        )

@router.put("/addresses/{address_id}")
async def update_address(
    address_id: str,
    update_data: AddressUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update an address."""
    try:
        user = await get_current_user(credentials)
        
        # Verify address belongs to user
        existing = supabase_admin_client.table("addresses").select("user_id").eq("id", address_id).execute()
        
        if not existing.data or existing.data[0]["user_id"] != user["id"]:
            return create_response(
                success=False,
                message="Address not found",
                errors={"address": "Address does not exist"}
            )
        
        # If setting as default, unset other defaults
        if update_data.is_default:
            supabase_admin_client.table("addresses").update({"is_default": False}).eq("user_id", user["id"]).execute()
        
        update_fields = {k: v for k, v in update_data.dict(exclude_unset=True).items()}
        result = supabase_admin_client.table("addresses").update(update_fields).eq("id", address_id).execute()
        
        return create_response(
            success=True,
            message="Address updated successfully",
            data=result.data[0] if result.data else None
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to update address",
            errors={"server": str(e)}
        )

@router.delete("/addresses/{address_id}")
async def delete_address(
    address_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete an address."""
    try:
        user = await get_current_user(credentials)
        
        # Verify address belongs to user
        existing = supabase_admin_client.table("addresses").select("user_id").eq("id", address_id).execute()
        
        if not existing.data or existing.data[0]["user_id"] != user["id"]:
            return create_response(
                success=False,
                message="Address not found",
                errors={"address": "Address does not exist"}
            )
        
        supabase_admin_client.table("addresses").delete().eq("id", address_id).execute()
        
        return create_response(
            success=True,
            message="Address deleted successfully"
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to delete address",
            errors={"server": str(e)}
        )
