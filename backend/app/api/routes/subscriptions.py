from fastapi import APIRouter, HTTPException, status, Depends
from supabase import Client
from app.database import get_db
from app.models import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from app.dependencies import get_current_consumer
from app.models.schemas import TokenPayload
from typing import List
from datetime import datetime, timedelta


router = APIRouter()


def calculate_next_delivery(frequency: str) -> datetime:
    """Calculate next delivery date based on frequency"""
    now = datetime.utcnow()
    
    if frequency == "weekly":
        return now + timedelta(days=7)
    elif frequency == "biweekly":
        return now + timedelta(days=14)
    elif frequency == "monthly":
        return now + timedelta(days=30)
    
    return now


@router.get("/", response_model=List[SubscriptionResponse])
async def list_subscriptions(
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """List user's subscriptions"""
    result = db.table("subscriptions").select(
        "*, products!product_id(name, image_url, price)"
    ).eq("user_id", str(current_user.sub)).order("created_at", desc=True).execute()
    
    subscriptions = []
    for sub in result.data:
        sub_dict = dict(sub)
        product = sub_dict.get("products", {})
        
        if product:
            sub_dict["product_name"] = product.get("name")
            sub_dict["product_image"] = product.get("image_url")
            sub_dict["product_price"] = product.get("price")
        
        del sub_dict["products"]
        subscriptions.append(sub_dict)
    
    return subscriptions


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscription_id: str,
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Get subscription details"""
    result = db.table("subscriptions").select(
        "*, products!product_id(name, image_url, price)"
    ).eq("id", subscription_id).eq("user_id", str(current_user.sub)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    sub_dict = dict(result.data[0])
    product = sub_dict.get("products", {})
    
    if product:
        sub_dict["product_name"] = product.get("name")
        sub_dict["product_image"] = product.get("image_url")
        sub_dict["product_price"] = product.get("price")
    
    del sub_dict["products"]
    
    return sub_dict


@router.post("/", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Create a new subscription"""
    # Check if product exists
    product_result = db.table("products").select("*").eq("id", str(subscription_data.product_id)).execute()
    
    if not product_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product = product_result.data[0]
    
    if not product["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available for subscription"
        )
    
    # Check if user already has active subscription for this product
    existing = db.table("subscriptions").select("*").eq(
        "user_id", str(current_user.sub)
    ).eq("product_id", str(subscription_data.product_id)).eq("status", "active").execute()
    
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active subscription for this product"
        )
    
    # Create subscription
    subscription_dict = subscription_data.model_dump()
    subscription_dict["user_id"] = str(current_user.sub)
    subscription_dict["status"] = "active"
    subscription_dict["next_delivery_date"] = calculate_next_delivery(subscription_data.frequency).isoformat()
    subscription_dict["created_at"] = datetime.utcnow().isoformat()
    subscription_dict["updated_at"] = datetime.utcnow().isoformat()
    
    result = db.table("subscriptions").insert(subscription_dict).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription"
        )
    
    return await get_subscription(result.data[0]["id"], current_user, db)


@router.put("/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: str,
    update_data: SubscriptionUpdate,
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Update a subscription"""
    # Check if subscription exists and belongs to user
    existing = db.table("subscriptions").select("*").eq("id", subscription_id).eq("user_id", str(current_user.sub)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # If frequency changed, recalculate next delivery
    if "frequency" in update_dict:
        update_dict["next_delivery_date"] = calculate_next_delivery(update_dict["frequency"]).isoformat()
    
    update_dict["updated_at"] = datetime.utcnow().isoformat()
    
    db.table("subscriptions").update(update_dict).eq("id", subscription_id).execute()
    
    return await get_subscription(subscription_id, current_user, db)


@router.put("/{subscription_id}/pause", response_model=SubscriptionResponse)
async def pause_subscription(
    subscription_id: str,
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Pause a subscription"""
    existing = db.table("subscriptions").select("*").eq("id", subscription_id).eq("user_id", str(current_user.sub)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    db.table("subscriptions").update({
        "status": "paused",
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", subscription_id).execute()
    
    return await get_subscription(subscription_id, current_user, db)


@router.put("/{subscription_id}/resume", response_model=SubscriptionResponse)
async def resume_subscription(
    subscription_id: str,
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Resume a paused subscription"""
    existing = db.table("subscriptions").select("*").eq("id", subscription_id).eq("user_id", str(current_user.sub)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    subscription = existing.data[0]
    
    db.table("subscriptions").update({
        "status": "active",
        "next_delivery_date": calculate_next_delivery(subscription["frequency"]).isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", subscription_id).execute()
    
    return await get_subscription(subscription_id, current_user, db)


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_subscription(
    subscription_id: str,
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Cancel a subscription"""
    existing = db.table("subscriptions").select("*").eq("id", subscription_id).eq("user_id", str(current_user.sub)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    db.table("subscriptions").update({
        "status": "cancelled",
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", subscription_id).execute()
    
    return None
