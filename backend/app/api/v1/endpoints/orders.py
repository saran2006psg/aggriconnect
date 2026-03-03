from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional, List
from app.schemas.order import CreateOrderRequest, UpdateOrderStatusRequest, OrderResponse, OrderItemResponse
from app.schemas.common import create_response, create_paginated_response
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user
from decimal import Decimal
from datetime import datetime
import uuid
import random

router = APIRouter()

def generate_order_number() -> str:
    """Generate unique order number."""
    return f"AC-{random.randint(1000, 9999)}"

@router.post("")
async def create_order(
    order_data: CreateOrderRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create order from cart."""
    try:
        user = await get_current_user(credentials)
        
        # Get user's cart
        cart_result = supabase_admin_client.table("carts").select("id").eq("user_id", user["id"]).execute()
        
        if not cart_result.data:
            return create_response(
                success=False,
                message="Cart is empty",
                errors={"cart": "No items in cart"}
            )
        
        cart_id = cart_result.data[0]["id"]
        
        # Get cart items
        items_result = supabase_admin_client.table("cart_items").select(
            "*, products(id, name, price, farmer_id, stock_quantity)"
        ).eq("cart_id", cart_id).execute()
        
        if not items_result.data:
            return create_response(
                success=False,
                message="Cart is empty",
                errors={"cart": "No items in cart"}
            )
        
        # Calculate totals
        subtotal = Decimal("0")
        order_items = []
        
        for item in items_result.data:
            product = item["products"]
            
            # Check stock
            if product["stock_quantity"] < item["quantity"]:
                return create_response(
                    success=False,
                    message="Insufficient stock",
                    errors={"product": f"{product['name']} has insufficient stock"}
                )
            
            item_subtotal = Decimal(str(product["price"])) * item["quantity"]
            subtotal += item_subtotal
            
            order_items.append({
                "product_id": product["id"],
                "farmer_id": product["farmer_id"],
                "quantity": item["quantity"],
                "price_at_purchase": Decimal(str(product["price"])),
                "subtotal": item_subtotal
            })
        
        # Calculate delivery fee
        delivery_fee = Decimal("5.00") if order_data.delivery_type == "Delivery" else Decimal("0")
        
        # Apply promo code discount (simplified)
        discount = Decimal("0")
        if order_data.promo_code:
            discount = subtotal * Decimal("0.1")  # 10% discount
        
        total = subtotal + delivery_fee - discount
        
        # Create order
        order_id = str(uuid.uuid4())
        order_number = generate_order_number()
        
        new_order = {
            "id": order_id,
            "order_number": order_number,
            "consumer_id": user["id"],
            "delivery_type": order_data.delivery_type,
            "delivery_address_id": order_data.delivery_address_id,
            "status": "Pending",
            "subtotal": float(subtotal),
            "delivery_fee": float(delivery_fee),
            "promo_code": order_data.promo_code,
            "discount": float(discount),
            "total": float(total),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        order_result = supabase_admin_client.table("orders").insert(new_order).execute()
        
        if not order_result.data:
            return create_response(
                success=False,
                message="Failed to create order",
                errors={"server": "Database error"}
            )
        
        # Create order items
        for item in order_items:
            order_item = {
                "id": str(uuid.uuid4()),
                "order_id": order_id,
                "product_id": item["product_id"],
                "farmer_id": item["farmer_id"],
                "quantity": item["quantity"],
                "price_at_purchase": float(item["price_at_purchase"]),
                "subtotal": float(item["subtotal"])
            }
            supabase_admin_client.table("order_items").insert(order_item).execute()
            
            # Decrement product stock - update directly instead of using RPC
            product_id = item["product_id"]
            product_result = supabase_admin_client.table("products").select("stock_quantity").eq("id", product_id).execute()
            if product_result.data:
                current_stock = product_result.data[0]["stock_quantity"]
                new_stock = max(0, current_stock - item["quantity"])
                supabase_admin_client.table("products").update({"stock_quantity": new_stock}).eq("id", product_id).execute()
        
        # Clear cart
        supabase_admin_client.table("cart_items").delete().eq("cart_id", cart_id).execute()
        
        # Send notifications to farmers
        unique_farmers = set(item["farmer_id"] for item in order_items)
        for farmer_id in unique_farmers:
            try:
                notification_data = {
                    "id": str(uuid.uuid4()),
                    "user_id": farmer_id,
                    "type": "order_placed",
                    "title": "New Order Received!",
                    "message": f"You have a new order #{order_number} worth ${total:.2f}",
                    "is_read": False,
                    "created_at": datetime.utcnow().isoformat()
                }
                supabase_admin_client.table("notifications").insert(notification_data).execute()
            except Exception as e:
                print(f"Failed to create notification: {str(e)}")
        
        # TODO: Generate QR code
        
        return create_response(
            success=True,
            message="Order created successfully",
            data={"order_id": order_id, "order_number": order_number}
        )
    except HTTPException as e:
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        print(f"Order creation error: {str(e)}")  # Log the error
        return create_response(
            success=False,
            message=f"Failed to create order: {str(e)}",
            errors={"server": str(e)}
        )

@router.get("")
async def get_orders(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    page: int = Query(1, ge=1),
    perPage: int = Query(20, ge=1, le=100)
):
    """Get user's orders with items."""
    try:
        user = await get_current_user(credentials)
        
        # Build query based on role - include order items and products
        if user["role"] == "consumer":
            query = supabase_admin_client.table("orders").select(
                "*, order_items(*, products(name, image_url, category))", 
                count="exact"
            ).eq("consumer_id", user["id"])
        elif user["role"] == "farmer":
            # Get orders containing farmer's products
            query = supabase_admin_client.table("orders").select(
                "*, order_items!inner(*, products(name, image_url, category))", 
                count="exact"
            ).eq("order_items.farmer_id", user["id"])
        else:  # admin
            query = supabase_admin_client.table("orders").select(
                "*, order_items(*, products(name, image_url, category))", 
                count="exact"
            )
        
        # Apply pagination
        offset = (page - 1) * perPage
        result = query.order("created_at", desc=True).range(offset, offset + perPage - 1).execute()
        
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

@router.get("/{order_id}")
async def get_order(
    order_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get order details with tracking history."""
    try:
        user = await get_current_user(credentials)
        
        # Get order
        order_result = supabase_admin_client.table("orders").select(
            "*, users!orders_consumer_id_fkey(full_name, phone_number, email), addresses(*)"
        ).eq("id", order_id).execute()
        
        if not order_result.data:
            return create_response(
                success=False,
                message="Order not found",
                errors={"order": "Order does not exist"}
            )
        
        order = order_result.data[0]
        
        # Check permissions
        if user["role"] == "consumer" and order["consumer_id"] != user["id"]:
            return create_response(
                success=False,
                message="Forbidden",
                errors={"auth": "You can only view your own orders"}
            )
        
        # Get order items with farmer contact info
        items_result = supabase_admin_client.table("order_items").select(
            "*, products(name), users!order_items_farmer_id_fkey(full_name, farm_name, phone_number)"
        ).eq("order_id", order_id).execute()
        
        # Format order items and collect farmer contact
        order_items = []
        farmer_contacts = []
        for item in items_result.data:
            product = item.pop("products", {})
            farmer_info = item.pop("users", {})
            
            order_item = {
                "id": item["id"],
                "product_id": item["product_id"],
                "product_name": product.get("name"),
                "farmer_id": item["farmer_id"],
                "farmer_name": farmer_info.get("farm_name") or farmer_info.get("full_name"),
                "quantity": item["quantity"],
                "price_at_purchase": Decimal(str(item["price_at_purchase"])),
                "subtotal": Decimal(str(item["subtotal"]))
            }
            order_items.append(order_item)
            
            # Collect unique farmer contacts
            if farmer_info and farmer_info.get("phone_number") and farmer_info["id"] not in [f["farmer_id"] for f in farmer_contacts]:
                farmer_contacts.append({
                    "farmer_id": item["farmer_id"],
                    "farmer_name": farmer_info.get("farm_name") or farmer_info.get("full_name"),
                    "phone_number": farmer_info.get("phone_number")
                })
        
        # Get order status history
        try:
            history_result = supabase_admin_client.table("order_status_history").select("*").eq("order_id", order_id).order("created_at", desc=False).execute()
            status_history = history_result.data if history_result.data else []
        except Exception as e:
            print(f"Failed to get status history: {str(e)}")
            status_history = []
        
        # Format response
        consumer_info = order.pop("users", {})
        address_info = order.pop("addresses", None)
        
        order_response = {
            **order,
            "consumer_name": consumer_info.get("full_name"),
            "consumer_phone": consumer_info.get("phone_number"),
            "consumer_email": consumer_info.get("email"),
            "delivery_address": address_info,
            "items": order_items,
            "farmer_contacts": farmer_contacts,
            "status_history": status_history
        }
        
        return create_response(
            success=True,
            message="Order retrieved successfully",
            data=order_response
        )
    except HTTPException as e:
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        print(f"❌ Get order error: {str(e)}")
        return create_response(
            success=False,
            message="Failed to retrieve order",
            errors={"server": str(e)}
        )

@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: UpdateOrderStatusRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update order status with tracking history."""
    try:
        user = await get_current_user(credentials)
        
        # Get order with order number
        order_result = supabase_admin_client.table("orders").select("consumer_id, status, order_number").eq("id", order_id).execute()
        
        if not order_result.data:
            return create_response(
                success=False,
                message="Order not found",
                errors={"order": "Order does not exist"}
            )
        
        order = order_result.data[0]
        old_status = order["status"]
        
        # Check permissions
        if user["role"] not in ["admin", "farmer"] and order["consumer_id"] != user["id"]:
            return create_response(
                success=False,
                message="Forbidden",
                errors={"auth": "Insufficient permissions"}
            )
        
        # Calculate estimated delivery time
        from datetime import timedelta
        estimated_delivery = None
        if status_update.status == "confirmed":
            estimated_delivery = (datetime.utcnow() + timedelta(hours=24)).isoformat()
        elif status_update.status == "processing":
            estimated_delivery = (datetime.utcnow() + timedelta(hours=12)).isoformat()
        elif status_update.status == "out_for_delivery":
            estimated_delivery = (datetime.utcnow() + timedelta(hours=2)).isoformat()
        elif status_update.status == "delivered":
            estimated_delivery = datetime.utcnow().isoformat()
        
        # Update status and estimated delivery
        update_data = {"status": status_update.status, "updated_at": datetime.utcnow().isoformat()}
        if estimated_delivery:
            update_data["estimated_delivery"] = estimated_delivery
        if status_update.status == "delivered":
            update_data["delivered_at"] = datetime.utcnow().isoformat()
        
        result = supabase_admin_client.table("orders").update(update_data).eq("id", order_id).execute()
        
        # Create status history entry
        try:
            history_entry = {
                "id": str(uuid.uuid4()),
                "order_id": order_id,
                "status": status_update.status,
                "changed_by": user["id"],
                "changed_by_name": user.get("full_name", "System"),
                "notes": f"Status changed from {old_status} to {status_update.status}",
                "created_at": datetime.utcnow().isoformat()
            }
            supabase_admin_client.table("order_status_history").insert(history_entry).execute()
        except Exception as e:
            print(f"Failed to create status history: {str(e)}")
        
        # Send notification to consumer
        try:
            status_messages = {
                "confirmed": f"Your order #{order['order_number']} has been confirmed and will be delivered within 24 hours!",
                "processing": f"Your order #{order['order_number']} is being prepared by the farmer.",
                "out_for_delivery": f"Your order #{order['order_number']} is out for delivery! Expected within 2 hours.",
                "delivered": f"Your order #{order['order_number']} has been delivered! Enjoy your fresh produce!",
                "cancelled": f"Your order #{order['order_number']} has been cancelled."
            }
            
            notification_data = {
                "id": str(uuid.uuid4()),
                "user_id": order["consumer_id"],
                "type": f"order_{status_update.status}",
                "title": "📦 Order Status Update",
                "message": status_messages.get(status_update.status, f"Order status changed to {status_update.status}"),
                "is_read": False,
                "created_at": datetime.utcnow().isoformat()
            }
            supabase_admin_client.table("notifications").insert(notification_data).execute()
        except Exception as e:
            print(f"Failed to create notification: {str(e)}")
        
        return create_response(
            success=True,
            message="Order status updated",
            data=result.data[0] if result.data else None
        )
    except HTTPException as e:
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        print(f"❌ Update status error: {str(e)}")
        return create_response(
            success=False,
            message="Failed to update order status",
            errors={"server": str(e)}
        )

@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Cancel an order."""
    try:
        user = await get_current_user(credentials)
        
        # Get order
        order_result = supabase_admin_client.table("orders").select("consumer_id, status").eq("id", order_id).execute()
        
        if not order_result.data:
            return create_response(
                success=False,
                message="Order not found",
                errors={"order": "Order does not exist"}
            )
        
        order = order_result.data[0]
        
        # Check permissions
        if order["consumer_id"] != user["id"] and user["role"] != "admin":
            return create_response(
                success=False,
                message="Forbidden",
                errors={"auth": "You can only cancel your own orders"}
            )
        
        # Check if order can be cancelled
        if order["status"] in ["Delivered", "Cancelled"]:
            return create_response(
                success=False,
                message="Cannot cancel order",
                errors={"order": f"Order is already {order['status']}"}
            )
        
        # Update status
        supabase_admin_client.table("orders").update({"status": "Cancelled"}).eq("id", order_id).execute()
        
        # TODO: Restore product stock
        # TODO: Send notification
        
        return create_response(
            success=True,
            message="Order cancelled successfully"
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
            message="Failed to cancel order",
            errors={"server": str(e)}
        )
