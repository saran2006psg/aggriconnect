from fastapi import APIRouter, HTTPException, status, Depends, Query
from supabase import Client
from app.database import get_db
from app.models import ProductCreate, ProductUpdate, ProductResponse, ProductSearchParams
from app.dependencies import get_current_user, get_current_farmer, get_optional_user
from app.models.schemas import TokenPayload
from typing import List, Optional
from datetime import datetime


router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    farmer_id: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Client = Depends(get_db)
):
    """List all active products with optional filters"""
    query = db.table("products").select("*, users!farmer_id(name)")
    
    # Filter by active products
    query = query.eq("is_active", True)
    
    # Apply filters
    if category:
        query = query.eq("category", category)
    
    if farmer_id:
        query = query.eq("farmer_id", farmer_id)
    
    if min_price is not None:
        query = query.gte("price", min_price)
    
    if max_price is not None:
        query = query.lte("price", max_price)
    
    if search:
        query = query.ilike("name", f"%{search}%")
    
    # Order by created_at descending
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    result = query.execute()
    
    # Format response
    products = []
    for product in result.data:
        product_dict = dict(product)
        if "users" in product_dict and product_dict["users"]:
            product_dict["farmer_name"] = product_dict["users"]["name"]
        del product_dict["users"]
        products.append(product_dict)
    
    return products


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    db: Client = Depends(get_db)
):
    """Get product details by ID"""
    result = db.table("products").select("*, users!farmer_id(name)").eq("id", product_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product = dict(result.data[0])
    if "users" in product and product["users"]:
        product["farmer_name"] = product["users"]["name"]
    del product["users"]
    
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: TokenPayload = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Create a new product (farmer only)"""
    product_dict = product_data.model_dump()
    product_dict["farmer_id"] = str(current_user.sub)
    product_dict["rating"] = 0.0
    product_dict["rating_count"] = 0
    product_dict["is_active"] = True
    product_dict["created_at"] = datetime.utcnow().isoformat()
    product_dict["updated_at"] = datetime.utcnow().isoformat()
    
    result = db.table("products").insert(product_dict).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product"
        )
    
    # Update farmer's product count
    db.rpc("increment", {
        "table_name": "farmer_profiles",
        "column_name": "products_count",
        "row_id": str(current_user.sub)
    })
    
    return result.data[0]


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: TokenPayload = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Update a product (farmer only, own products)"""
    # Check if product exists and belongs to farmer
    existing = db.table("products").select("*").eq("id", product_id).eq("farmer_id", str(current_user.sub)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to update it"
        )
    
    update_dict = product_data.model_dump(exclude_unset=True)
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_dict["updated_at"] = datetime.utcnow().isoformat()
    
    result = db.table("products").update(update_dict).eq("id", product_id).execute()
    
    return result.data[0]


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: TokenPayload = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Delete a product (farmer only, own products)"""
    # Check if product exists and belongs to farmer
    existing = db.table("products").select("*").eq("id", product_id).eq("farmer_id", str(current_user.sub)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to delete it"
        )
    
    # Soft delete by setting is_active to False
    db.table("products").update({"is_active": False, "updated_at": datetime.utcnow().isoformat()}).eq("id", product_id).execute()
    
    return None


@router.get("/farmer/my-products", response_model=List[ProductResponse])
async def get_my_products(
    current_user: TokenPayload = Depends(get_current_farmer),
    db: Client = Depends(get_db)
):
    """Get current farmer's products"""
    result = db.table("products").select("*").eq("farmer_id", str(current_user.sub)).order("created_at", desc=True).execute()
    
    return result.data
