from fastapi import APIRouter, HTTPException, status, Depends
from supabase import Client
from app.database import get_db
from app.models import ReviewCreate, ReviewUpdate, ReviewResponse
from app.dependencies import get_current_user
from app.models.schemas import TokenPayload
from typing import List
from datetime import datetime


router = APIRouter()


@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: str,
    db: Client = Depends(get_db)
):
    """Get all reviews for a product"""
    result = db.table("reviews").select("*, users!user_id(name)").eq("product_id", product_id).order("created_at", desc=True).execute()
    
    reviews = []
    for review in result.data:
        review_dict = dict(review)
        if "users" in review_dict and review_dict["users"]:
            review_dict["user_name"] = review_dict["users"]["name"]
        del review_dict["users"]
        reviews.append(review_dict)
    
    return reviews


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: TokenPayload = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Create a review for a product"""
    # Check if product exists
    product_result = db.table("products").select("*").eq("id", str(review_data.product_id)).execute()
    
    if not product_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product = product_result.data[0]
    
    # Check if user already reviewed this product
    existing = db.table("reviews").select("*").eq("product_id", str(review_data.product_id)).eq("user_id", str(current_user.sub)).execute()
    
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    # Create review
    review_dict = review_data.model_dump()
    review_dict["user_id"] = str(current_user.sub)
    review_dict["created_at"] = datetime.utcnow().isoformat()
    
    result = db.table("reviews").insert(review_dict).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create review"
        )
    
    # Update product rating
    all_reviews = db.table("reviews").select("rating").eq("product_id", str(review_data.product_id)).execute()
    
    total_rating = sum(r["rating"] for r in all_reviews.data)
    rating_count = len(all_reviews.data)
    avg_rating = round(total_rating / rating_count, 2)
    
    db.table("products").update({
        "rating": avg_rating,
        "rating_count": rating_count
    }).eq("id", str(review_data.product_id)).execute()
    
    # Update farmer rating
    farmer_products = db.table("products").select("rating, rating_count").eq("farmer_id", product["farmer_id"]).execute()
    
    total_farmer_rating = sum(p["rating"] * p["rating_count"] for p in farmer_products.data)
    total_farmer_count = sum(p["rating_count"] for p in farmer_products.data)
    
    if total_farmer_count > 0:
        farmer_avg_rating = round(total_farmer_rating / total_farmer_count, 2)
        db.table("farmer_profiles").update({
            "total_rating": farmer_avg_rating,
            "rating_count": total_farmer_count
        }).eq("user_id", product["farmer_id"]).execute()
    
    return result.data[0]


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Delete a review (only by the user who created it)"""
    # Check if review exists and belongs to user
    existing = db.table("reviews").select("*").eq("id", review_id).eq("user_id", str(current_user.sub)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found or you don't have permission to delete it"
        )
    
    review = existing.data[0]
    product_id = review["product_id"]
    
    # Delete review
    db.table("reviews").delete().eq("id", review_id).execute()
    
    # Recalculate product rating
    all_reviews = db.table("reviews").select("rating").eq("product_id", product_id).execute()
    
    if all_reviews.data:
        total_rating = sum(r["rating"] for r in all_reviews.data)
        rating_count = len(all_reviews.data)
        avg_rating = round(total_rating / rating_count, 2)
        
        db.table("products").update({
            "rating": avg_rating,
            "rating_count": rating_count
        }).eq("id", product_id).execute()
    else:
        db.table("products").update({
            "rating": 0.0,
            "rating_count": 0
        }).eq("id", product_id).execute()
    
    return None
