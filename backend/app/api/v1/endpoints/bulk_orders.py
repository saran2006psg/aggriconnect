from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials
from app.schemas.order import BulkOrderCreate, BulkOrderResponseCreate
from app.schemas.common import create_response, create_paginated_response
from app.core.supabase import supabase_admin_client
from app.middleware.auth import security, get_current_user
from datetime import datetime
import uuid

router = APIRouter()

@router.post("")
async def create_bulk_order(
    bulk_order: BulkOrderCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a bulk order request."""
    try:
        user = await get_current_user(credentials)
        print(f"📦 Creating bulk order for user: {user['id']}")
        
        # Calculate estimated total from product prices
        estimated_total = 0
        for item in bulk_order.items:
            # Get product price if product_id is provided
            if hasattr(item, 'product_id') and item.product_id:
                product_result = supabase_admin_client.table("products").select("price").eq("id", item.product_id).execute()
                if product_result.data:
                    price_per_unit = float(product_result.data[0]["price"])
                    multiplier = 30 if item.frequency == "Daily" else 4 if item.frequency == "Weekly" else 1
                    estimated_total += price_per_unit * float(item.quantity) * multiplier
        
        # Create bulk order
        order_id = str(uuid.uuid4())
        new_order = {
            "id": order_id,
            "consumer_id": user["id"],
            "business_name": bulk_order.business_name,
            "business_type": bulk_order.business_type,
            "business_location": bulk_order.business_location,
            "budget_min": float(bulk_order.budget_min),
            "budget_max": float(bulk_order.budget_max),
            "estimated_total": estimated_total,
            "status": "Pending",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase_admin_client.table("bulk_orders").insert(new_order).execute()
        print(f"✅ Bulk order created: {order_id}")
        
        # Add items
        for item in bulk_order.items:
            bulk_item = {
                "id": str(uuid.uuid4()),
                "bulk_order_id": order_id,
                "product_id": getattr(item, 'product_id', None),
                "product_name": item.product_name,
                "quantity": float(item.quantity),
                "unit": item.unit,
                "frequency": item.frequency
            }
            supabase_admin_client.table("bulk_order_items").insert(bulk_item).execute()
        
        # Notify ALL farmers about new bulk order
        try:
            farmers_result = supabase_admin_client.table("users").select("id").eq("role", "farmer").execute()
            if farmers_result.data:
                print(f"📢 Notifying {len(farmers_result.data)} farmers about bulk order")
                for farmer in farmers_result.data:
                    notification_data = {
                        "id": str(uuid.uuid4()),
                        "user_id": farmer["id"],
                        "type": "bulk_order_request",
                        "title": "New Bulk Order Request!",
                        "message": f"New bulk order from {bulk_order.business_name} ({len(bulk_order.items)} products, est. ${estimated_total:.2f}/month)",
                        "is_read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    supabase_admin_client.table("notifications").insert(notification_data).execute()
        except Exception as e:
            print(f"⚠️ Failed to notify farmers: {str(e)}")
        
        return create_response(
            success=True,
            message="Bulk order request created successfully",
            data={**result.data[0], "estimated_total": estimated_total} if result.data else None
        )
    except Exception as e:
        print(f"❌ Error creating bulk order: {str(e)}")
        return create_response(
            success=False,
            message="Failed to create bulk order",
            errors={"server": str(e)}
        )

@router.get("")
async def get_bulk_orders(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    page: int = Query(1, ge=1),
    perPage: int = Query(20, ge=1, le=100)
):
    """Get bulk orders (consumers see theirs, farmers see all pending)."""
    try:
        user = await get_current_user(credentials)
        print(f"📦 Getting bulk orders for user: {user['id']}, role: {user['role']}")
        
        if user["role"] == "consumer":
            query = supabase_admin_client.table("bulk_orders").select("*, bulk_order_items(*)", count="exact").eq("consumer_id", user["id"])
        else:  # farmer - show all pending requests
            query = supabase_admin_client.table("bulk_orders").select("*, bulk_order_items(*)", count="exact").eq("status", "Pending")
        
        offset = (page - 1) * perPage
        result = query.order("created_at", desc=True).range(offset, offset + perPage - 1).execute()
        
        total = result.count if result.count else 0
        print(f"📊 Found {total} bulk orders for {user['role']}")
        
        return create_paginated_response(
            items=result.data,
            page=page,
            per_page=perPage,
            total=total,
            message="Bulk orders retrieved successfully"
        )
    except Exception as e:
        print(f"❌ Error getting bulk orders: {str(e)}")
        return create_response(
            success=False,
            message="Failed to retrieve bulk orders",
            errors={"server": str(e)}
        )

@router.get("/{bulk_order_id}")
async def get_bulk_order(
    bulk_order_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get bulk order details."""
    try:
        user = await get_current_user(credentials)
        
        order_result = supabase_admin_client.table("bulk_orders").select("*").eq("id", bulk_order_id).execute()
        
        if not order_result.data:
            return create_response(
                success=False,
                message="Bulk order not found",
                errors={"order": "Bulk order does not exist"}
            )
        
        order = order_result.data[0]
        
        # Get items
        items = supabase_admin_client.table("bulk_order_items").select("*").eq("bulk_order_id", bulk_order_id).execute()
        
        # Get responses
        responses = supabase_admin_client.table("bulk_order_responses").select("*, users(full_name, farm_name)").eq("bulk_order_id", bulk_order_id).execute()
        
        order["items"] = items.data
        order["responses"] = responses.data
        
        return create_response(
            success=True,
            message="Bulk order retrieved successfully",
            data=order
        )
    except Exception as e:
        return create_response(
            success=False,
            message="Failed to retrieve bulk order",
            errors={"server": str(e)}
        )

@router.post("/{bulk_order_id}/respond")
async def respond_to_bulk_order(
    bulk_order_id: str,
    response: BulkOrderResponseCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Farmer responds to bulk order."""
    try:
        user = await get_current_user(credentials)
        
        if user["role"] != "farmer":
            return create_response(
                success=False,
                message="Only farmers can respond to bulk orders",
                errors={"auth": "Insufficient permissions"}
            )
        
        # Get bulk order details
        order_result = supabase_admin_client.table("bulk_orders").select("*, users!bulk_orders_consumer_id_fkey(id, full_name)").eq("id", bulk_order_id).execute()
        
        if not order_result.data:
            return create_response(
                success=False,
                message="Bulk order not found",
                errors={"order": "Bulk order does not exist"}
            )
        
        order = order_result.data[0]
        
        # Create response
        new_response = {
            "id": str(uuid.uuid4()),
            "bulk_order_id": bulk_order_id,
            "farmer_id": user["id"],
            "message": response.message,
            "quoted_price": float(response.quoted_price),
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase_admin_client.table("bulk_order_responses").insert(new_response).execute()
        print(f"✅ Farmer {user['id']} responded to bulk order {bulk_order_id}")
        
        # Update bulk order status
        supabase_admin_client.table("bulk_orders").update({"status": "Responded", "updated_at": datetime.utcnow().isoformat()}).eq("id", bulk_order_id).execute()
        
        # Notify consumer
        try:
            consumer_id = order["consumer_id"]
            farmer_name = user.get("farm_name") or user.get("full_name")
            notification_data = {
                "id": str(uuid.uuid4()),
                "user_id": consumer_id,
                "type": "bulk_order_response",
                "title": "New Quote Received!",
                "message": f"{farmer_name} sent you a quote for ${float(response.quoted_price):.2f}/month for your bulk order",
                "is_read": False,
                "created_at": datetime.utcnow().isoformat()
            }
            supabase_admin_client.table("notifications").insert(notification_data).execute()
            print(f"📧 Notified consumer {consumer_id} about farmer response")
        except Exception as e:
            print(f"⚠️ Failed to notify consumer: {str(e)}")
        
        return create_response(
            success=True,
            message="Response submitted successfully",
            data=result.data[0] if result.data else None
        )
    except Exception as e:
        print(f"❌ Error submitting bulk order response: {str(e)}")
        return create_response(
            success=False,
            message="Failed to submit response",
            errors={"server": str(e)}
        )
