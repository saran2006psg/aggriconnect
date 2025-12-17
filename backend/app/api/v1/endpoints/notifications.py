from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.common import create_response
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user
from datetime import datetime

router = APIRouter()

@router.get("")
async def get_notifications(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    unread: bool = Query(False),
    limit: int = Query(50, ge=1, le=100)
):
    """Get user's notifications."""
    try:
        user = await get_current_user(credentials)
        
        query = supabase_admin_client.table("notifications").select("*").eq("user_id", user["id"])
        
        if unread:
            query = query.eq("is_read", False)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        return create_response(
            success=True,
            message="Notifications retrieved successfully",
            data=result.data
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to retrieve notifications",
            errors={"server": str(e)}
        )

@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Mark notification as read."""
    try:
        user = await get_current_user(credentials)
        
        result = supabase_admin_client.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user["id"]).execute()
        
        return create_response(
            success=True,
            message="Notification marked as read",
            data=result.data[0] if result.data else None
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to mark notification as read",
            errors={"server": str(e)}
        )

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete a notification."""
    try:
        user = await get_current_user(credentials)
        
        supabase_admin_client.table("notifications").delete().eq("id", notification_id).eq("user_id", user["id"]).execute()
        
        return create_response(
            success=True,
            message="Notification deleted successfully"
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to delete notification",
            errors={"server": str(e)}
        )
