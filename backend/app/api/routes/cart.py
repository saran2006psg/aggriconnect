from fastapi import APIRouter, HTTPException, status, Depends
from supabase import Client
from app.database import get_db
from app.models import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse
from app.dependencies import get_current_consumer
from app.models.schemas import TokenPayload
from datetime import datetime


router = APIRouter()


@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Get user's cart with items"""
    # Get or create cart
    cart_result = db.table("carts").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not cart_result.data:
        # Create cart if doesn't exist
        new_cart = {"user_id": str(current_user.sub)}
        cart_result = db.table("carts").insert(new_cart).execute()
    
    cart = cart_result.data[0]
    
    # Get cart items with product details
    items_result = db.table("cart_items").select(
        "*, products!product_id(name, image_url, price, farmer_id, is_active, stock_quantity)"
    ).eq("cart_id", cart["id"]).execute()
    
    cart_items = []
    total_price = 0.0
    
    for item in items_result.data:
        item_dict = dict(item)
        product = item_dict.get("products", {})
        
        if product:
            item_dict["product_name"] = product.get("name")
            item_dict["product_image"] = product.get("image_url")
            item_dict["current_price"] = product.get("price")
            item_dict["farmer_id"] = product.get("farmer_id")
            
            # Calculate total
            total_price += item_dict["price_at_time"] * item_dict["quantity"]
        
        del item_dict["products"]
        cart_items.append(item_dict)
    
    return CartResponse(
        id=cart["id"],
        user_id=cart["user_id"],
        items=cart_items,
        total_items=len(cart_items),
        total_price=total_price,
        created_at=cart["created_at"],
        updated_at=cart["updated_at"]
    )


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Add item to cart"""
    # Get or create cart
    cart_result = db.table("carts").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not cart_result.data:
        new_cart = {"user_id": str(current_user.sub)}
        cart_result = db.table("carts").insert(new_cart).execute()
    
    cart = cart_result.data[0]
    
    # Get product details
    product_result = db.table("products").select("*").eq("id", str(item_data.product_id)).execute()
    
    if not product_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product = product_result.data[0]
    
    if not product["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available"
        )
    
    if product["stock_quantity"] < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product['stock_quantity']} items available"
        )
    
    # Check if item already in cart
    existing = db.table("cart_items").select("*").eq("cart_id", cart["id"]).eq("product_id", str(item_data.product_id)).execute()
    
    if existing.data:
        # Update quantity
        new_quantity = existing.data[0]["quantity"] + item_data.quantity
        
        if product["stock_quantity"] < new_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product['stock_quantity']} items available"
            )
        
        result = db.table("cart_items").update({
            "quantity": new_quantity
        }).eq("id", existing.data[0]["id"]).execute()
    else:
        # Add new item
        cart_item = {
            "cart_id": cart["id"],
            "product_id": str(item_data.product_id),
            "quantity": item_data.quantity,
            "price_at_time": product["price"],
            "added_at": datetime.utcnow().isoformat()
        }
        result = db.table("cart_items").insert(cart_item).execute()
    
    # Update cart timestamp
    db.table("carts").update({"updated_at": datetime.utcnow().isoformat()}).eq("id", cart["id"]).execute()
    
    return result.data[0]


@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: str,
    update_data: CartItemUpdate,
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Update cart item quantity"""
    # Get user's cart
    cart_result = db.table("carts").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not cart_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    cart = cart_result.data[0]
    
    # Check if item exists in user's cart
    item_result = db.table("cart_items").select("*, products!product_id(stock_quantity)").eq("id", item_id).eq("cart_id", cart["id"]).execute()
    
    if not item_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    item = item_result.data[0]
    product = item.get("products", {})
    
    if product and product["stock_quantity"] < update_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product['stock_quantity']} items available"
        )
    
    # Update quantity
    result = db.table("cart_items").update({
        "quantity": update_data.quantity
    }).eq("id", item_id).execute()
    
    # Update cart timestamp
    db.table("carts").update({"updated_at": datetime.utcnow().isoformat()}).eq("id", cart["id"]).execute()
    
    return result.data[0]


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: str,
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Remove item from cart"""
    # Get user's cart
    cart_result = db.table("carts").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not cart_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    cart = cart_result.data[0]
    
    # Delete item
    result = db.table("cart_items").delete().eq("id", item_id).eq("cart_id", cart["id"]).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    # Update cart timestamp
    db.table("carts").update({"updated_at": datetime.utcnow().isoformat()}).eq("id", cart["id"]).execute()
    
    return None


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user: TokenPayload = Depends(get_current_consumer),
    db: Client = Depends(get_db)
):
    """Clear all items from cart"""
    # Get user's cart
    cart_result = db.table("carts").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not cart_result.data:
        return None
    
    cart = cart_result.data[0]
    
    # Delete all items
    db.table("cart_items").delete().eq("cart_id", cart["id"]).execute()
    
    # Update cart timestamp
    db.table("carts").update({"updated_at": datetime.utcnow().isoformat()}).eq("id", cart["id"]).execute()
    
    return None
