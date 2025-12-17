from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.other import ReviewCreate
from app.schemas.common import create_response
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user
from datetime import datetime
import uuid

router = APIRouter()

@router.post("")
async def create_review(
    review: ReviewCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a product review."""
    try:
        user = await get_current_user(credentials)
        
        # Check if product exists
        product = supabase_admin_client.table("products").select("id").eq("id", review.product_id).execute()
        
        if not product.data:
            return create_response(
                success=False,
                message="Product not found",
                errors={"product": "Product does not exist"}
            )
        
        # Check if user already reviewed this product
        existing = supabase_admin_client.table("reviews").select("id").eq("product_id", review.product_id).eq("user_id", user["id"]).execute()
        
        if existing.data:
            return create_response(
                success=False,
                message="Review already exists",
                errors={"review": "You have already reviewed this product"}
            )
        
        # Create review
        new_review = {
            "id": str(uuid.uuid4()),
            "product_id": review.product_id,
            "user_id": user["id"],
            "rating": review.rating,
            "comment": review.comment,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase_admin_client.table("reviews").insert(new_review).execute()
        
        return create_response(
            success=True,
            message="Review created successfully",
            data=result.data[0] if result.data else None
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to create review",
            errors={"server": str(e)}
        )

@router.get("/product/{product_id}")
async def get_product_reviews(product_id: str):
    """Get reviews for a product."""
    try:
        result = supabase_admin_client.table("reviews").select("*, users(full_name)").eq("product_id", product_id).order("created_at", desc=True).execute()
        
        # Format reviews
        reviews = []
        for item in result.data:
            user_info = item.pop("users", {})
            item["user_name"] = user_info.get("full_name", "Anonymous")
            reviews.append(item)
        
        return create_response(
            success=True,
            message="Reviews retrieved successfully",
            data=reviews
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to retrieve reviews",
            errors={"server": str(e)}
        )
