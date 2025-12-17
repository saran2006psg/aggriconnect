from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.common import create_response, create_paginated_response
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user, require_role

router = APIRouter()

@router.get("/stats")
async def get_platform_stats(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get platform statistics (Admin only)."""
    try:
        user = await get_current_user(credentials)
        await require_role(user, ["admin"])
        
        # Get counts
        total_users = supabase_admin_client.table("users").select("id", count="exact").execute()
        total_farmers = supabase_admin_client.table("users").select("id", count="exact").eq("role", "farmer").execute()
        total_consumers = supabase_admin_client.table("users").select("id", count="exact").eq("role", "consumer").execute()
        total_products = supabase_admin_client.table("products").select("id", count="exact").execute()
        total_orders = supabase_admin_client.table("orders").select("id", count="exact").execute()
        
        stats = {
            "total_users": total_users.count or 0,
            "total_farmers": total_farmers.count or 0,
            "total_consumers": total_consumers.count or 0,
            "total_products": total_products.count or 0,
            "total_orders": total_orders.count or 0
        }
        
        return create_response(
            success=True,
            message="Statistics retrieved successfully",
            data=stats
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
            message="Failed to retrieve statistics",
            errors={"server": str(e)}
        )

@router.get("/farmers")
async def get_all_farmers(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    page: int = Query(1, ge=1),
    perPage: int = Query(20, ge=1, le=100)
):
    """Get all farmers (Admin only)."""
    try:
        user = await get_current_user(credentials)
        await require_role(user, ["admin"])
        
        offset = (page - 1) * perPage
        result = supabase_admin_client.table("users").select("*", count="exact").eq("role", "farmer").range(offset, offset + perPage - 1).execute()
        
        # Remove password hashes
        for farmer in result.data:
            farmer.pop("password_hash", None)
        
        total = result.count if result.count else 0
        
        return create_paginated_response(
            items=result.data,
            page=page,
            per_page=perPage,
            total=total,
            message="Farmers retrieved successfully"
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
            message="Failed to retrieve farmers",
            errors={"server": str(e)}
        )

@router.get("/consumers")
async def get_all_consumers(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    page: int = Query(1, ge=1),
    perPage: int = Query(20, ge=1, le=100)
):
    """Get all consumers (Admin only)."""
    try:
        user = await get_current_user(credentials)
        await require_role(user, ["admin"])
        
        offset = (page - 1) * perPage
        result = supabase_admin_client.table("users").select("*", count="exact").eq("role", "consumer").range(offset, offset + perPage - 1).execute()
        
        # Remove password hashes
        for consumer in result.data:
            consumer.pop("password_hash", None)
        
        total = result.count if result.count else 0
        
        return create_paginated_response(
            items=result.data,
            page=page,
            per_page=perPage,
            total=total,
            message="Consumers retrieved successfully"
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
            message="Failed to retrieve consumers",
            errors={"server": str(e)}
        )

@router.get("/orders")
async def get_all_orders(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    page: int = Query(1, ge=1),
    perPage: int = Query(20, ge=1, le=100)
):
    """Get all orders (Admin only)."""
    try:
        user = await get_current_user(credentials)
        await require_role(user, ["admin"])
        
        offset = (page - 1) * perPage
        result = supabase_admin_client.table("orders").select("*", count="exact").order("created_at", desc=True).range(offset, offset + perPage - 1).execute()
        
        total = result.count if result.count else 0
        
        return create_paginated_response(
            items=result.data,
            page=page,
            per_page=perPage,
            total=total,
            message="Orders retrieved successfully"
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
            message="Failed to retrieve orders",
            errors={"server": str(e)}
        )
