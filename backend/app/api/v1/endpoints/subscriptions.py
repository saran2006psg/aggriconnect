from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.order import SubscriptionCreate, SubscriptionResponse
from app.schemas.common import create_response
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

router = APIRouter()

def calculate_next_delivery(frequency: str) -> datetime:
    """Calculate next delivery date based on frequency."""
    now = datetime.utcnow()
    if frequency == "Weekly":
        return now + timedelta(days=7)
    elif frequency == "Monthly":
        return now + timedelta(days=30)
    return now

@router.get("")
async def get_subscriptions(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's subscriptions."""
    try:
        user = await get_current_user(credentials)
        
        result = supabase_admin_client.table("subscriptions").select("*").eq("user_id", user["id"]).execute()
        
        return create_response(
            success=True,
            message="Subscriptions retrieved successfully",
            data=result.data
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to retrieve subscriptions",
            errors={"server": str(e)}
        )

@router.post("")
async def create_subscription(
    subscription: SubscriptionCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new subscription."""
    try:
        user = await get_current_user(credentials)
        
        # Calculate total
        total = Decimal("0")
        for item in subscription.items:
            product = supabase_admin_client.table("products").select("price").eq("id", item.product_id).execute()
            if product.data:
                total += Decimal(str(product.data[0]["price"])) * item.quantity
        
        # Create subscription
        sub_id = str(uuid.uuid4())
        new_sub = {
            "id": sub_id,
            "user_id": user["id"],
            "frequency": subscription.frequency,
            "status": "Active",
            "next_delivery_date": calculate_next_delivery(subscription.frequency).isoformat(),
            "total_amount": float(total),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase_admin_client.table("subscriptions").insert(new_sub).execute()
        
        # Add subscription items
        for item in subscription.items:
            sub_item = {
                "id": str(uuid.uuid4()),
                "subscription_id": sub_id,
                "product_id": item.product_id,
                "quantity": item.quantity
            }
            supabase_admin_client.table("subscription_items").insert(sub_item).execute()
        
        return create_response(
            success=True,
            message="Subscription created successfully",
            data=result.data[0] if result.data else None
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to create subscription",
            errors={"server": str(e)}
        )

@router.patch("/{subscription_id}/pause")
async def pause_subscription(
    subscription_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Pause a subscription."""
    try:
        user = await get_current_user(credentials)
        
        result = supabase_admin_client.table("subscriptions").update({"status": "Paused"}).eq("id", subscription_id).eq("user_id", user["id"]).execute()
        
        return create_response(
            success=True,
            message="Subscription paused",
            data=result.data[0] if result.data else None
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to pause subscription",
            errors={"server": str(e)}
        )

@router.patch("/{subscription_id}/resume")
async def resume_subscription(
    subscription_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Resume a paused subscription."""
    try:
        user = await get_current_user(credentials)
        
        result = supabase_admin_client.table("subscriptions").update({"status": "Active"}).eq("id", subscription_id).eq("user_id", user["id"]).execute()
        
        return create_response(
            success=True,
            message="Subscription resumed",
            data=result.data[0] if result.data else None
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to resume subscription",
            errors={"server": str(e)}
        )

@router.delete("/{subscription_id}")
async def cancel_subscription(
    subscription_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Cancel a subscription."""
    try:
        user = await get_current_user(credentials)
        
        supabase_admin_client.table("subscriptions").update({"status": "Cancelled"}).eq("id", subscription_id).eq("user_id", user["id"]).execute()
        
        return create_response(
            success=True,
            message="Subscription cancelled"
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to cancel subscription",
            errors={"server": str(e)}
        )
