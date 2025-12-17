from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.product import CartItemAdd, CartItemUpdate, CartResponse, CartItemResponse
from app.schemas.common import create_response
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user
from decimal import Decimal
import uuid

router = APIRouter()

async def get_or_create_cart(user_id: str) -> str:
    """Get or create cart for user."""
    result = supabase_admin_client.table("carts").select("id").eq("user_id", user_id).execute()
    
    if result.data:
        return result.data[0]["id"]
    
    # Create new cart
    new_cart = {
        "id": str(uuid.uuid4()),
        "user_id": user_id
    }
    result = supabase_admin_client.table("carts").insert(new_cart).execute()
    return result.data[0]["id"]

async def get_cart_with_items(cart_id: str, user_id: str):
    """Get cart with all items."""
    items_result = supabase_admin_client.table("cart_items").select(
        "*, products(*, users!products_farmer_id_fkey(full_name, farm_name))"
    ).eq("cart_id", cart_id).execute()
    
    cart_items = []
    total = Decimal("0")
    
    for item in items_result.data:
        product = item["products"]
        farmer_info = product.pop("users", {})
        
        subtotal = Decimal(str(product["price"])) * item["quantity"]
        
        cart_item = {
            "id": item["id"],
            "product_id": product["id"],
            "product_name": product["name"],
            "price": Decimal(str(product["price"])),
            "unit": product["unit"],
            "image_url": product.get("image_url"),
            "farmer": farmer_info.get("farm_name") or farmer_info.get("full_name"),
            "quantity": item["quantity"],
            "subtotal": subtotal
        }
        cart_items.append(cart_item)
        total += subtotal
    
    return {
        "id": cart_id,
        "user_id": user_id,
        "items": cart_items,
        "total": total,
        "item_count": len(cart_items)
    }

@router.get("")
async def get_cart(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's cart."""
    try:
        user = await get_current_user(credentials)
        cart_id = await get_or_create_cart(user["id"])
        cart = await get_cart_with_items(cart_id, user["id"])
        
        return create_response(
            success=True,
            message="Cart retrieved successfully",
            data=cart
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
            message="Failed to retrieve cart",
            errors={"server": str(e)}
        )

@router.post("/items")
async def add_to_cart(
    item: CartItemAdd,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add item to cart."""
    try:
        user = await get_current_user(credentials)
        cart_id = await get_or_create_cart(user["id"])
        
        # Check if product exists and is available
        product_result = supabase_admin_client.table("products").select("id, is_available, stock_quantity").eq("id", item.product_id).execute()
        
        if not product_result.data:
            return create_response(
                success=False,
                message="Product not found",
                errors={"product": "Product does not exist"}
            )
        
        product = product_result.data[0]
        
        if not product["is_available"]:
            return create_response(
                success=False,
                message="Product not available",
                errors={"product": "This product is currently unavailable"}
            )
        
        if product["stock_quantity"] < item.quantity:
            return create_response(
                success=False,
                message="Insufficient stock",
                errors={"product": f"Only {product['stock_quantity']} items available"}
            )
        
        # Check if item already in cart
        existing = supabase_admin_client.table("cart_items").select("id, quantity").eq("cart_id", cart_id).eq("product_id", item.product_id).execute()
        
        if existing.data:
            # Update quantity
            new_quantity = existing.data[0]["quantity"] + item.quantity
            supabase_admin_client.table("cart_items").update({"quantity": new_quantity}).eq("id", existing.data[0]["id"]).execute()
        else:
            # Add new item
            new_item = {
                "id": str(uuid.uuid4()),
                "cart_id": cart_id,
                "product_id": item.product_id,
                "quantity": item.quantity
            }
            supabase_admin_client.table("cart_items").insert(new_item).execute()
        
        cart = await get_cart_with_items(cart_id, user["id"])
        
        return create_response(
            success=True,
            message="Item added to cart",
            data=cart
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
            message="Failed to add item to cart",
            errors={"server": str(e)}
        )

@router.put("/items/{item_id}")
async def update_cart_item(
    item_id: str,
    update: CartItemUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update cart item quantity."""
    try:
        user = await get_current_user(credentials)
        cart_id = await get_or_create_cart(user["id"])
        
        # Verify item belongs to user's cart
        item_result = supabase_admin_client.table("cart_items").select("product_id").eq("id", item_id).eq("cart_id", cart_id).execute()
        
        if not item_result.data:
            return create_response(
                success=False,
                message="Cart item not found",
                errors={"item": "Item not in your cart"}
            )
        
        # Check stock availability
        product_result = supabase_admin_client.table("products").select("stock_quantity").eq("id", item_result.data[0]["product_id"]).execute()
        
        if product_result.data and product_result.data[0]["stock_quantity"] < update.quantity:
            return create_response(
                success=False,
                message="Insufficient stock",
                errors={"product": f"Only {product_result.data[0]['stock_quantity']} items available"}
            )
        
        supabase_admin_client.table("cart_items").update({"quantity": update.quantity}).eq("id", item_id).execute()
        
        cart = await get_cart_with_items(cart_id, user["id"])
        
        return create_response(
            success=True,
            message="Cart item updated",
            data=cart
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
            message="Failed to update cart item",
            errors={"server": str(e)}
        )

@router.delete("/items/{item_id}")
async def remove_from_cart(
    item_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Remove item from cart."""
    try:
        user = await get_current_user(credentials)
        cart_id = await get_or_create_cart(user["id"])
        
        # Verify item belongs to user's cart
        item_result = supabase_admin_client.table("cart_items").select("id").eq("id", item_id).eq("cart_id", cart_id).execute()
        
        if not item_result.data:
            return create_response(
                success=False,
                message="Cart item not found",
                errors={"item": "Item not in your cart"}
            )
        
        supabase_admin_client.table("cart_items").delete().eq("id", item_id).execute()
        
        cart = await get_cart_with_items(cart_id, user["id"])
        
        return create_response(
            success=True,
            message="Item removed from cart",
            data=cart
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
            message="Failed to remove item from cart",
            errors={"server": str(e)}
        )

@router.delete("/clear")
async def clear_cart(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Clear entire cart."""
    try:
        user = await get_current_user(credentials)
        cart_id = await get_or_create_cart(user["id"])
        
        supabase_admin_client.table("cart_items").delete().eq("cart_id", cart_id).execute()
        
        cart = await get_cart_with_items(cart_id, user["id"])
        
        return create_response(
            success=True,
            message="Cart cleared",
            data=cart
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
            message="Failed to clear cart",
            errors={"server": str(e)}
        )
