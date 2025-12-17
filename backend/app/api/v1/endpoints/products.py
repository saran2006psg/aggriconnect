from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional, List
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.common import create_response, create_paginated_response
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user, require_role
from datetime import datetime
import uuid

router = APIRouter()

@router.get("")
async def get_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    farmer: Optional[str] = Query(None),
    sortBy: Optional[str] = Query("recent"),
    page: int = Query(1, ge=1),
    perPage: int = Query(20, ge=1, le=100)
):
    """Get all products with filtering and pagination."""
    try:
        # Build query
        query = supabase_admin_client.table("products").select("*, users!products_farmer_id_fkey(full_name, farm_name)", count="exact")
        
        # Apply filters
        query = query.eq("is_available", True)
        
        if search:
            query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")
        
        if category:
            query = query.eq("category", category)
        
        if farmer:
            query = query.eq("farmer_id", farmer)
        
        # Apply sorting
        if sortBy == "price_asc":
            query = query.order("price", desc=False)
        elif sortBy == "price_desc":
            query = query.order("price", desc=True)
        elif sortBy == "rating":
            query = query.order("rating", desc=True)
        else:  # recent
            query = query.order("created_at", desc=True)
        
        # Apply pagination
        offset = (page - 1) * perPage
        query = query.range(offset, offset + perPage - 1)
        
        result = query.execute()
        
        # Format products
        products = []
        for item in result.data:
            farmer_info = item.pop("users", {})
            item["farmer"] = farmer_info.get("farm_name") or farmer_info.get("full_name")
            products.append(item)
        
        total = result.count if result.count else 0
        
        return create_paginated_response(
            items=products,
            page=page,
            per_page=perPage,
            total=total,
            message="Products retrieved successfully"
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to retrieve products",
            errors={"server": str(e)}
        )

@router.get("/{product_id}")
async def get_product(product_id: str):
    """Get single product by ID."""
    try:
        result = supabase_admin_client.table("products").select("*, users!products_farmer_id_fkey(full_name, farm_name, farm_location)").eq("id", product_id).execute()
        
        if not result.data:
            return create_response(
                success=False,
                message="Product not found",
                errors={"product": "Product does not exist"}
            )
        
        product = result.data[0]
        farmer_info = product.pop("users", {})
        product["farmer"] = farmer_info.get("farm_name") or farmer_info.get("full_name")
        product["farmer_location"] = farmer_info.get("farm_location")
        
        return create_response(
            success=True,
            message="Product retrieved successfully",
            data=product
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to retrieve product",
            errors={"server": str(e)}
        )

@router.post("")
async def create_product(
    product: ProductCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new product (Farmer only)."""
    try:
        user = await get_current_user(credentials)
        await require_role(user, ["farmer"])
        
        new_product = {
            "id": str(uuid.uuid4()),
            "farmer_id": user["id"],
            "name": product.name,
            "price": float(product.price),
            "unit": product.unit,
            "category": product.category,
            "description": product.description,
            "location": product.location or user.get("farm_location"),
            "image_url": product.image_url,
            "stock_quantity": product.stock_quantity,
            "is_available": product.is_available,
            "harvest_date": product.harvest_date.isoformat() if product.harvest_date else None,
            "rating": 0.0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase_admin_client.table("products").insert(new_product).execute()
        
        if not result.data:
            return create_response(
                success=False,
                message="Failed to create product",
                errors={"server": "Database error"}
            )
        
        return create_response(
            success=True,
            message="Product created successfully",
            data=result.data[0]
        )
    except HTTPException as e:
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to create product",
            errors={"server": str(e)}
        )

@router.put("/{product_id}")
async def update_product(
    product_id: str,
    product: ProductUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update a product (Farmer only - own products)."""
    try:
        user = await get_current_user(credentials)
        await require_role(user, ["farmer"])
        
        # Check if product exists and belongs to user
        existing = supabase_admin_client.table("products").select("farmer_id").eq("id", product_id).execute()
        
        if not existing.data:
            return create_response(
                success=False,
                message="Product not found",
                errors={"product": "Product does not exist"}
            )
        
        if existing.data[0]["farmer_id"] != user["id"]:
            return create_response(
                success=False,
                message="Forbidden",
                errors={"auth": "You can only update your own products"}
            )
        
        # Build update data
        update_data = {k: v for k, v in product.dict(exclude_unset=True).items()}
        if "price" in update_data:
            update_data["price"] = float(update_data["price"])
        if "harvest_date" in update_data and update_data["harvest_date"]:
            update_data["harvest_date"] = update_data["harvest_date"].isoformat()
        
        result = supabase_admin_client.table("products").update(update_data).eq("id", product_id).execute()
        
        return create_response(
            success=True,
            message="Product updated successfully",
            data=result.data[0] if result.data else None
        )
    except HTTPException as e:
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to update product",
            errors={"server": str(e)}
        )

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete a product (Farmer only - own products)."""
    try:
        user = await get_current_user(credentials)
        await require_role(user, ["farmer"])
        
        # Check if product exists and belongs to user
        existing = supabase_admin_client.table("products").select("farmer_id").eq("id", product_id).execute()
        
        if not existing.data:
            return create_response(
                success=False,
                message="Product not found",
                errors={"product": "Product does not exist"}
            )
        
        if existing.data[0]["farmer_id"] != user["id"]:
            return create_response(
                success=False,
                message="Forbidden",
                errors={"auth": "You can only delete your own products"}
            )
        
        supabase_admin_client.table("products").delete().eq("id", product_id).execute()
        
        return create_response(
            success=True,
            message="Product deleted successfully"
        )
    except HTTPException as e:
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to delete product",
            errors={"server": str(e)}
        )
