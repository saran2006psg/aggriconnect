from fastapi import APIRouter, HTTPException, status, Depends, Query
from supabase import Client
from app.database import get_db
from app.models import OrderCreate, OrderUpdate, OrderResponse, OrderListResponse
from app.dependencies import get_current_user, get_current_farmer
from app.models.schemas import TokenPayload
from app.config import settings
from typing import List, Optional
from datetime import datetime, timedelta
import uuid


router = APIRouter()


def generate_order_number() -> str:
    """Generate unique order number"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_part = str(uuid.uuid4())[:8].upper()
    return f"ORD-{timestamp}-{random_part}"


@router.get("/", response_model=OrderListResponse)
async def list_orders(
    status_filter: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: TokenPayload = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """List user's orders (consumer) or farmer's orders"""
    query = db.table("orders").select("*, users!user_id(name), farmer:users!farmer_id(name)")
    
    if current_user.role == "consumer":
        query = query.eq("user_id", str(current_user.sub))
    elif current_user.role == "farmer":
        query = query.eq("farmer_id", str(current_user.sub))
    
    if status_filter:
        query = query.eq("status", status_filter)
    
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    
    result = query.execute()
    
    orders = []
    for order in result.data:
        order_dict = dict(order)
        
        # Get order items
        items_result = db.table("order_items").select(
            "*, products!product_id(name, image_url)"
        ).eq("order_id", order["id"]).execute()
        
        items = []
        for item in items_result.data:
            item_dict = dict(item)
            product = item_dict.get("products", {})
            if product:
                item_dict["product_name"] = product.get("name")
                item_dict["product_image"] = product.get("image_url")
            del item_dict["products"]
            items.append(item_dict)
        
        order_dict["items"] = items
        
        # Add user and farmer names
        if "users" in order_dict and order_dict["users"]:
            order_dict["user_name"] = order_dict["users"].get("name")
        if "farmer" in order_dict and order_dict["farmer"]:
            order_dict["farmer_name"] = order_dict["farmer"].get("name")
        
        # Clean up
        order_dict.pop("users", None)
        order_dict.pop("farmer", None)
        
        orders.append(order_dict)
    
    return OrderListResponse(
        orders=orders,
        total=len(result.data),
        limit=limit,
        offset=offset
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Get order details"""
    result = db.table("orders").select(
        "*, users!user_id(name), farmer:users!farmer_id(name)"
    ).eq("id", order_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order = dict(result.data[0])
    
    # Check access permission
    if current_user.role == "consumer" and order["user_id"] != str(current_user.sub):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if current_user.role == "farmer" and order["farmer_id"] != str(current_user.sub):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get order items
    items_result = db.table("order_items").select(
        "*, products!product_id(name, image_url)"
    ).eq("order_id", order_id).execute()
    
    items = []
    for item in items_result.data:
        item_dict = dict(item)
        product = item_dict.get("products", {})
        if product:
            item_dict["product_name"] = product.get("name")
            item_dict["product_image"] = product.get("image_url")
        del item_dict["products"]
        items.append(item_dict)
    
    order["items"] = items
    
    # Add names
    if "users" in order and order["users"]:
        order["user_name"] = order["users"].get("name")
    if "farmer" in order and order["farmer"]:
        order["farmer_name"] = order["farmer"].get("name")
    
    order.pop("users", None)
    order.pop("farmer", None)
    
    return order


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order_from_cart(
    order_data: OrderCreate,
    current_user: TokenPayload = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Create order from cart items"""
    # Get user's cart
    cart_result = db.table("carts").select("*").eq("user_id", str(current_user.sub)).execute()
    
    if not cart_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    cart = cart_result.data[0]
    
    # Get cart items
    items_result = db.table("cart_items").select(
        "*, products!product_id(name, price, farmer_id, stock_quantity, is_active)"
    ).eq("cart_id", cart["id"]).execute()
    
    if not items_result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Group items by farmer
    items_by_farmer = {}
    for item in items_result.data:
        product = item["products"]
        farmer_id = product["farmer_id"]
        
        if not product["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product['name']}' is no longer available"
            )
        
        if product["stock_quantity"] < item["quantity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product['name']}'"
            )
        
        if farmer_id not in items_by_farmer:
            items_by_farmer[farmer_id] = []
        
        items_by_farmer[farmer_id].append(item)
    
    # Create separate order for each farmer
    created_orders = []
    
    for farmer_id, items in items_by_farmer.items():
        total_amount = sum(item["price_at_time"] * item["quantity"] for item in items)
        
        # Create order
        order = {
            "order_number": generate_order_number(),
            "user_id": str(current_user.sub),
            "farmer_id": farmer_id,
            "status": "pending",
            "total_amount": total_amount,
            "shipping_address": order_data.shipping_address,
            "order_date": datetime.utcnow().isoformat(),
            "delivery_date": (datetime.utcnow() + timedelta(days=3)).isoformat()
        }
        
        order_result = db.table("orders").insert(order).execute()
        
        if not order_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create order"
            )
        
        created_order = order_result.data[0]
        
        # Create order items
        for item in items:
            product = item["products"]
            order_item = {
                "order_id": created_order["id"],
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "unit_price": item["price_at_time"],
                "subtotal": item["price_at_time"] * item["quantity"]
            }
            db.table("order_items").insert(order_item).execute()
            
            # Update product stock
            new_stock = product["stock_quantity"] - item["quantity"]
            db.table("products").update({"stock_quantity": new_stock}).eq("id", item["product_id"]).execute()
        
        created_orders.append(created_order)
    
    # Clear cart
    db.table("cart_items").delete().eq("cart_id", cart["id"]).execute()
    
    # Return first order (in real app, you'd return all)
    return await get_order(created_orders[0]["id"], current_user, db)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    update_data: OrderUpdate,
    current_user: TokenPayload = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Update order status (farmer/admin only)"""
    # Get order
    order_result = db.table("orders").select("*").eq("id", order_id).execute()
    
    if not order_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order = order_result.data[0]
    
    # Check permission
    if current_user.role == "farmer" and order["farmer_id"] != str(current_user.sub):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if current_user.role not in ["farmer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers and admins can update order status"
        )
    
    # Update order
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow().isoformat()
    
    # If status is delivered, process payment to farmer's wallet
    if update_data.status == "delivered" and order["status"] != "delivered":
        # Calculate commission
        total_amount = order["total_amount"]
        commission = total_amount * (settings.PLATFORM_COMMISSION_RATE / 100)
        farmer_earnings = total_amount - commission
        
        # Get or create farmer wallet
        wallet_result = db.table("wallets").select("*").eq("user_id", order["farmer_id"]).execute()
        
        if wallet_result.data:
            wallet = wallet_result.data[0]
            
            # Update wallet balance
            new_balance = wallet["balance"] + farmer_earnings
            new_total_earned = wallet["total_earned"] + farmer_earnings
            
            db.table("wallets").update({
                "balance": new_balance,
                "total_earned": new_total_earned,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", wallet["id"]).execute()
            
            # Create transaction record
            transaction = {
                "wallet_id": wallet["id"],
                "type": "credit",
                "amount": farmer_earnings,
                "description": f"Payment for order {order['order_number']}",
                "order_id": order_id,
                "status": "completed",
                "created_at": datetime.utcnow().isoformat()
            }
            db.table("wallet_transactions").insert(transaction).execute()
    
    result = db.table("orders").update(update_dict).eq("id", order_id).execute()
    
    return await get_order(order_id, current_user, db)
