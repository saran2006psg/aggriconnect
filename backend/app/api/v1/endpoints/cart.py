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
    """Get user's cart - optimized single query."""
    try:
        user = await get_current_user(credentials)
        print(f"🛒 Getting cart for user: {user['id']}")
        
        # Get or create cart first
        cart_id = await get_or_create_cart(user["id"])
        print(f"📦 Cart ID: {cart_id}")
        
        # Get cart items with product details
        try:
            items_result = supabase_admin_client.table("cart_items").select(
                "id, quantity, cart_id, product_id, products(id, name, price, unit, image_url)"
            ).eq("cart_id", cart_id).execute()
            
            print(f"📊 Cart items query result: {items_result}")
            print(f"📊 Found {len(items_result.data) if items_result and items_result.data else 0} items in cart")
        except Exception as e:
            print(f"❌ Error fetching cart items: {str(e)}")
            items_result = None
        
        # Process items
        cart_items = []
        total = Decimal("0")
        
        if items_result and items_result.data:
            for item in items_result.data:
                try:
                    product = item.get("products")
                    if not product:
                        print(f"⚠️ Product not found for item: {item.get('product_id')}")
                        continue
                        
                    subtotal = Decimal(str(product["price"])) * item["quantity"]
                    
                    cart_item = {
                        "id": item["id"],
                        "product_id": product["id"],
                        "product_name": product["name"],
                        "price": Decimal(str(product["price"])),
                        "unit": product["unit"],
                        "image_url": product.get("image_url"),
                        "farmer": "",  # Removed farmer query for speed - can add back if needed
                        "quantity": item["quantity"],
                        "subtotal": subtotal
                    }
                    cart_items.append(cart_item)
                    total += subtotal
                except Exception as e:
                    print(f"⚠️ Error processing cart item: {str(e)}")
                    continue
        
        cart = {
            "id": cart_id,
            "user_id": user["id"],
            "items": cart_items,
            "total": total,
            "item_count": len(cart_items)
        }
        
        print(f"✅ Returning cart with {len(cart_items)} items, total: ${total}")
        
        return create_response(
            success=True,
            message="Cart retrieved successfully",
            data=cart
        )
    except HTTPException as e:
        print(f"❌ Auth error in get_cart: {e.detail}")
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        print(f"❌ Error in get_cart: {str(e)}")
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
    """Add item to cart - optimized for speed."""
    try:
        user = await get_current_user(credentials)
        print(f"➕ Adding product {item.product_id} to cart for user {user['id']}")
        
        cart_id = await get_or_create_cart(user["id"])
        print(f"📦 Using cart ID: {cart_id}")
        
        # Single optimized query - check product and get existing cart item
        try:
            product_result = supabase_admin_client.table("products").select(
                "id, is_available, stock_quantity"
            ).eq("id", item.product_id).execute()
            
            print(f"🔍 Product query result: {product_result}")
            
            if not product_result or not product_result.data or len(product_result.data) == 0:
                print(f"❌ Product {item.product_id} not found in database")
                return create_response(
                    success=False,
                    message="Product not found",
                    errors={"product": "Product does not exist"}
                )
            
            product = product_result.data[0]
            print(f"✅ Product found: {product}")
            
        except Exception as e:
            print(f"❌ Error querying product: {str(e)}")
            return create_response(
                success=False,
                message="Failed to query product",
                errors={"server": str(e)}
            )
        
        if not product["is_available"]:
            print(f"❌ Product {item.product_id} not available")
            return create_response(
                success=False,
                message="Product not available",
                errors={"product": "This product is currently unavailable"}
            )
        
        # Check if item already in cart
        try:
            existing = supabase_admin_client.table("cart_items").select(
                "id, quantity"
            ).eq("cart_id", cart_id).eq("product_id", item.product_id).execute()
            
            print(f"🔍 Existing cart item check: {existing.data if existing else None}")
            
            if existing and existing.data and len(existing.data) > 0:
                # Update quantity
                existing_item = existing.data[0]
                new_quantity = existing_item["quantity"] + item.quantity
                print(f"🔄 Updating existing cart item. Old: {existing_item['quantity']}, New: {new_quantity}")
                
                if product["stock_quantity"] < new_quantity:
                    return create_response(
                        success=False,
                        message="Insufficient stock",
                        errors={"product": f"Only {product['stock_quantity']} items available"}
                    )
                    
                result = supabase_admin_client.table("cart_items").update(
                    {"quantity": new_quantity}
                ).eq("id", existing_item["id"]).execute()
                
                item_data = result.data[0] if result and result.data else existing_item
                print(f"✅ Cart item updated: {item_data}")
            else:
                # Add new item
                print(f"➕ Adding new cart item. Quantity: {item.quantity}")
                
                if product["stock_quantity"] < item.quantity:
                    return create_response(
                        success=False,
                        message="Insufficient stock",
                        errors={"product": f"Only {product['stock_quantity']} items available"}
                    )
                    
                new_item = {
                    "id": str(uuid.uuid4()),
                    "cart_id": cart_id,
                    "product_id": item.product_id,
                    "quantity": item.quantity
                }
                
                result = supabase_admin_client.table("cart_items").insert(new_item).execute()
                item_data = result.data[0] if result and result.data else new_item
                print(f"✅ New cart item created: {item_data}")
                
        except Exception as e:
            print(f"❌ Error managing cart item: {str(e)}")
            import traceback
            traceback.print_exc()
            return create_response(
                success=False,
                message="Failed to manage cart item",
                errors={"server": str(e)}
            )
        
        # Return lightweight response instead of full cart
        return create_response(
            success=True,
            message="Item added to cart",
            data={"item": item_data}
        )
    except HTTPException as e:
        print(f"❌ Auth error in add_to_cart: {e.detail}")
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        print(f"❌ Error in add_to_cart: {str(e)}")
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
        
        result = supabase_admin_client.table("cart_items").update({"quantity": update.quantity}).eq("id", item_id).execute()
        
        # Return lightweight response instead of full cart
        return create_response(
            success=True,
            message="Cart updated successfully",
            data={"item": result.data[0] if result.data else None}
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
