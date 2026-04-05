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

STATUS_MAP = {
    "pending": "Pending",
    "confirmed": "Confirmed",
    "processing": "Processing",
    "out_for_delivery": "Out for Delivery",
    "delivered": "Delivered",
    "cancelled": "Cancelled",
}

def generate_order_number() -> str:
    """Generate unique order number."""
    return f"AC-{random.randint(1000, 9999)}"


def normalize_status(status: str) -> str:
    """Accept snake_case/lowercase and normalize to DB status format."""
    key = (status or "").strip().lower().replace(" ", "_")
    if key not in STATUS_MAP:
        raise HTTPException(status_code=400, detail="Invalid order status")
    return STATUS_MAP[key]

@router.post("")
async def create_order(
    order_data: CreateOrderRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create order from cart."""
    try:
        user = await get_current_user(credentials)
        print(f"📦 Creating order for user: {user['id']}")
        
        # Get user's cart
        cart_result = supabase_admin_client.table("carts").select("id").eq("user_id", user["id"]).execute()
        
        if not cart_result.data:
            print(f"❌ No cart found for user {user['id']}")
            return create_response(
                success=False,
                message="Cart is empty",
                errors={"cart": "No items in cart"}
            )
        
        cart_id = cart_result.data[0]["id"]
        print(f"🛒 Found cart: {cart_id}")
        
        # Get cart items
        items_result = supabase_admin_client.table("cart_items").select(
            "*, products(id, name, price, farmer_id, stock_quantity, is_available)"
        ).eq("cart_id", cart_id).execute()
        
        print(f"📊 Found {len(items_result.data) if items_result.data else 0} items in cart")
        
        if not items_result.data:
            print(f"❌ Cart {cart_id} has no items")
            return create_response(
                success=False,
                message="Cart is empty",
                errors={"cart": "No items in cart"}
            )
        
        # Calculate totals and validate stock
        subtotal = Decimal("0")
        order_items = []
        stock_errors = []
        
        for item in items_result.data:
            product = item["products"]
            
            # Comprehensive stock validation
            if not product.get("is_available", True):
                stock_errors.append(f"{product['name']} is OUT OF STOCK")
                continue
                
            if product["stock_quantity"] == 0:
                stock_errors.append(f"{product['name']} is OUT OF STOCK (0 available)")
                continue
                
            if product["stock_quantity"] < item["quantity"]:
                stock_errors.append(f"{product['name']}: Only {product['stock_quantity']} available (requested {item['quantity']})")
                continue
        
        # Return all stock errors if any
        if stock_errors:
            print(f"❌ Stock validation failed: {stock_errors}")
            return create_response(
                success=False,
                message="Some items are out of stock or insufficient",
                errors={"stock": stock_errors}
            )
        
        # Calculate totals (validation passed)
        for item in items_result.data:
            product = item["products"]
            
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
            print(f"❌ Failed to insert order into database")
            return create_response(
                success=False,
                message="Failed to create order",
                errors={"server": "Database error"}
            )
        
        print(f"✅ Order created: {order_number} (ID: {order_id})")
        
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
            
            # Decrement product stock and update availability
            product_id = item["product_id"]
            product_result = supabase_admin_client.table("products").select("stock_quantity, name").eq("id", product_id).execute()
            if product_result.data:
                current_stock = product_result.data[0]["stock_quantity"]
                product_name = product_result.data[0]["name"]
                new_stock = max(0, current_stock - item["quantity"])
                
                # Prepare update data
                update_data = {"stock_quantity": new_stock}
                
                # Mark as unavailable if stock reaches 0
                if new_stock == 0:
                    update_data["is_available"] = False
                    print(f"🚫 {product_name} is now OUT OF STOCK (stock reduced from {current_stock} to 0)")
                elif new_stock <= 5:
                    print(f"⚠️ {product_name} stock is LOW: {new_stock} remaining (reduced from {current_stock})")
                else:
                    print(f"📉 {product_name} stock reduced: {current_stock} → {new_stock}")
                
                # Update product
                supabase_admin_client.table("products").update(update_data).eq("id", product_id).execute()
        
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
                    "message": f"You have a new order #{order_number} worth ₹{total:.2f}",
                    "is_read": False,
                    "created_at": datetime.utcnow().isoformat()
                }
                supabase_admin_client.table("notifications").insert(notification_data).execute()
            except Exception as e:
                print(f"Failed to create notification: {str(e)}")
        
        # TODO: Generate QR code
        
        print(f"✅ Order {order_number} completed successfully. Returning response.")
        return create_response(
            success=True,
            message="Order created successfully",
            data={"order_id": order_id, "order_number": order_number}
        )
    except HTTPException as e:
        print(f"❌ Auth error in create_order: {e.detail}")
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        print(f"❌ Error creating order: {str(e)}")  # Log the error
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
        print(f"📦 Getting orders for user: {user['id']}, role: {user['role']}")
        
        # Build query based on role - include order items and products
        if user["role"] == "consumer":
            query = supabase_admin_client.table("orders").select(
                "*, order_items(*, products(name, image_url, category))", 
                count="exact"
            ).eq("consumer_id", user["id"])
            
            # Apply pagination
            offset = (page - 1) * perPage
            result = query.order("created_at", desc=True).range(offset, offset + perPage - 1).execute()
            
            total = result.count if result.count else 0
            print(f"📊 Found {total} total orders, returning {len(result.data) if result.data else 0} orders for page {page}")
            
        elif user["role"] == "farmer":
            # For farmers, fetch all orders and filter in Python (Supabase nested filtering limitation)
            all_orders_result = supabase_admin_client.table("orders").select(
                "*, order_items(*, products(name, image_url, category))"
            ).order("created_at", desc=True).execute()
            
            # Filter orders containing farmer's products
            farmer_orders = []
            for order in all_orders_result.data:
                farmer_items = [
                    item for item in order.get("order_items", [])
                    if item.get("farmer_id") == user["id"]
                ]
                if farmer_items:
                    order["order_items"] = farmer_items
                    order["item_count"] = len(farmer_items)
                    order["farmer_earning"] = float(sum(
                        Decimal(str(item.get("subtotal") or 0)) for item in farmer_items
                    ))
                    farmer_orders.append(order)
            
            total = len(farmer_orders)
            
            # Apply pagination manually
            offset = (page - 1) * perPage
            paginated_orders = farmer_orders[offset:offset + perPage]
            
            print(f"📊 Found {total} total orders for farmer, returning {len(paginated_orders)} orders for page {page}")
            
            result = type('obj', (object,), {'data': paginated_orders, 'count': total})()
            
        else:  # admin
            query = supabase_admin_client.table("orders").select(
                "*, order_items(*, products(name, image_url, category))", 
                count="exact"
            )
            
            # Apply pagination
            offset = (page - 1) * perPage
            result = query.order("created_at", desc=True).range(offset, offset + perPage - 1).execute()
            
            total = result.count if result.count else 0
            print(f"📊 Found {total} total orders, returning {len(result.data) if result.data else 0} orders for page {page}")
        
        return create_paginated_response(
            items=result.data,
            page=page,
            per_page=perPage,
            total=total,
            message="Orders retrieved successfully"
        )
    except HTTPException as e:
        print(f"❌ Auth error in get_orders: {e.detail}")
        return create_response(
            success=False,
            message=e.detail,
            errors={"auth": e.detail}
        )
    except Exception as e:
        print(f"❌ Error in get_orders: {str(e)}")
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
            "*, products(name, image_url, category), users!order_items_farmer_id_fkey(id, full_name, farm_name, phone_number)"
        ).eq("order_id", order_id).execute()

        # Farmer can only view orders that contain their items.
        if user["role"] == "farmer" and not any(item.get("farmer_id") == user["id"] for item in items_result.data):
            return create_response(
                success=False,
                message="Forbidden",
                errors={"auth": "You can only view orders that include your products"}
            )
        
        # Format order items and collect farmer contact
        order_items = []
        farmer_contacts = []
        for item in items_result.data:
            if user["role"] == "farmer" and item.get("farmer_id") != user["id"]:
                continue
            product = item.pop("products", {})
            farmer_info = item.pop("users", {})
            
            order_item = {
                "id": item["id"],
                "product_id": item["product_id"],
                "product_name": product.get("name"),
                "product_image_url": product.get("image_url"),
                "product_category": product.get("category"),
                "farmer_id": item["farmer_id"],
                "farmer_name": farmer_info.get("farm_name") or farmer_info.get("full_name"),
                "quantity": item["quantity"],
                "price_at_purchase": Decimal(str(item["price_at_purchase"])),
                "subtotal": Decimal(str(item["subtotal"]))
            }
            order_items.append(order_item)
            
            # Collect unique farmer contacts
            if farmer_info and farmer_info.get("phone_number") and item["farmer_id"] not in [f["farmer_id"] for f in farmer_contacts]:
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
        new_status = normalize_status(status_update.status)
        
        # Check permissions
        if user["role"] not in ["admin", "farmer"] and order["consumer_id"] != user["id"]:
            return create_response(
                success=False,
                message="Forbidden",
                errors={"auth": "Insufficient permissions"}
            )

        if user["role"] == "farmer":
            farmer_has_item = supabase_admin_client.table("order_items").select("id").eq("order_id", order_id).eq("farmer_id", user["id"]).limit(1).execute()
            if not farmer_has_item.data:
                return create_response(
                    success=False,
                    message="Forbidden",
                    errors={"auth": "You can only update orders that include your products"}
                )
        
        # Calculate estimated delivery time
        from datetime import timedelta
        estimated_delivery = None
        if new_status == "Confirmed":
            estimated_delivery = (datetime.utcnow() + timedelta(hours=24)).isoformat()
        elif new_status == "Processing":
            estimated_delivery = (datetime.utcnow() + timedelta(hours=12)).isoformat()
        elif new_status == "Out for Delivery":
            estimated_delivery = (datetime.utcnow() + timedelta(hours=2)).isoformat()
        elif new_status == "Delivered":
            estimated_delivery = datetime.utcnow().isoformat()
        
        # Update status and estimated delivery
        update_data = {"status": new_status, "updated_at": datetime.utcnow().isoformat()}
        if estimated_delivery:
            update_data["estimated_delivery"] = estimated_delivery
        if new_status == "Delivered":
            update_data["delivered_at"] = datetime.utcnow().isoformat()
        
        result = supabase_admin_client.table("orders").update(update_data).eq("id", order_id).execute()
        
        # Create status history entry
        try:
            history_entry = {
                "id": str(uuid.uuid4()),
                "order_id": order_id,
                "status": new_status,
                "changed_by": user["id"],
                "changed_by_name": user.get("full_name", "System"),
                "notes": f"Status changed from {old_status} to {new_status}",
                "created_at": datetime.utcnow().isoformat()
            }
            supabase_admin_client.table("order_status_history").insert(history_entry).execute()
        except Exception as e:
            print(f"Failed to create status history: {str(e)}")

        # Credit farmers when order is marked as Delivered (idempotent guard).
        if old_status != "Delivered" and new_status == "Delivered":
            try:
                delivered_items = supabase_admin_client.table("order_items").select("farmer_id, subtotal").eq("order_id", order_id).execute()
                farmer_totals = {}
                for item in delivered_items.data or []:
                    fid = item.get("farmer_id")
                    farmer_totals[fid] = farmer_totals.get(fid, Decimal("0")) + Decimal(str(item.get("subtotal") or 0))

                for fid, amount in farmer_totals.items():
                    try:
                        current = supabase_admin_client.table("users").select("wallet_balance, total_earnings").eq("id", fid).limit(1).execute()
                        current_wallet = Decimal(str((current.data[0].get("wallet_balance") if current.data else 0) or 0))
                        current_earned = Decimal(str((current.data[0].get("total_earnings") if current.data else 0) or 0))

                        supabase_admin_client.table("users").update({
                            "wallet_balance": float(current_wallet + amount),
                            "total_earnings": float(current_earned + amount),
                            "updated_at": datetime.utcnow().isoformat(),
                        }).eq("id", fid).execute()

                        # Optional farmer notification about earnings.
                        supabase_admin_client.table("notifications").insert({
                            "id": str(uuid.uuid4()),
                            "user_id": fid,
                            "type": "order_earning",
                            "title": "Payment Credited",
                            "message": f"INR {amount:.2f} credited for delivered order #{order['order_number']}",
                            "is_read": False,
                            "created_at": datetime.utcnow().isoformat(),
                        }).execute()
                    except Exception as wallet_error:
                        print(f"Failed to credit farmer {fid}: {str(wallet_error)}")
            except Exception as e:
                print(f"Failed to distribute delivered earnings: {str(e)}")
        
        # Send notification to consumer
        try:
            status_messages = {
                "Confirmed": f"Your order #{order['order_number']} has been confirmed and will be delivered within 24 hours!",
                "Processing": f"Your order #{order['order_number']} is being prepared by the farmer.",
                "Out for Delivery": f"Your order #{order['order_number']} is out for delivery! Expected within 2 hours.",
                "Delivered": f"Your order #{order['order_number']} has been delivered! Enjoy your fresh produce!",
                "Cancelled": f"Your order #{order['order_number']} has been cancelled."
            }
            
            notification_data = {
                "id": str(uuid.uuid4()),
                "user_id": order["consumer_id"],
                "type": f"order_{new_status.lower().replace(' ', '_')}",
                "title": "📦 Order Status Update",
                "message": status_messages.get(new_status, f"Order status changed to {new_status}"),
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
