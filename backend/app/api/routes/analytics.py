from fastapi import APIRouter, HTTPException, status, Depends
from supabase import Client
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.schemas import TokenPayload
from datetime import datetime, timedelta
from typing import Dict, Any


router = APIRouter()


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_analytics(
    current_user: TokenPayload = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """Get admin dashboard analytics"""
    
    # Total users
    users_result = db.table("users").select("role", count="exact").execute()
    total_users = users_result.count if hasattr(users_result, 'count') else len(users_result.data)
    
    # Users by role
    consumers_result = db.table("users").select("*", count="exact").eq("role", "consumer").execute()
    farmers_result = db.table("users").select("*", count="exact").eq("role", "farmer").execute()
    
    total_consumers = consumers_result.count if hasattr(consumers_result, 'count') else len(consumers_result.data)
    total_farmers = farmers_result.count if hasattr(farmers_result, 'count') else len(farmers_result.data)
    
    # Total products
    products_result = db.table("products").select("*", count="exact").eq("is_active", True).execute()
    total_products = products_result.count if hasattr(products_result, 'count') else len(products_result.data)
    
    # Total orders
    orders_result = db.table("orders").select("*").execute()
    total_orders = len(orders_result.data)
    
    # Calculate revenue
    total_revenue = sum(order.get("total_amount", 0) for order in orders_result.data if order.get("status") == "delivered")
    
    # Platform commission (12.5% of delivered orders)
    platform_commission = total_revenue * 0.125
    
    # Orders by status
    orders_by_status = {}
    for order in orders_result.data:
        status = order.get("status", "unknown")
        orders_by_status[status] = orders_by_status.get(status, 0) + 1
    
    # Recent orders (last 7 days)
    seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
    recent_orders_result = db.table("orders").select("*").gte("created_at", seven_days_ago).execute()
    recent_orders_count = len(recent_orders_result.data)
    
    # Top products (by order count)
    order_items_result = db.table("order_items").select("product_id, products!product_id(name)").execute()
    
    product_order_count = {}
    for item in order_items_result.data:
        product_id = item.get("product_id")
        product_name = item.get("products", {}).get("name", "Unknown")
        
        if product_id not in product_order_count:
            product_order_count[product_id] = {"name": product_name, "count": 0}
        product_order_count[product_id]["count"] += 1
    
    top_products = sorted(
        [{"product_id": k, "name": v["name"], "order_count": v["count"]} for k, v in product_order_count.items()],
        key=lambda x: x["order_count"],
        reverse=True
    )[:10]
    
    # Top farmers (by revenue)
    farmer_revenue = {}
    for order in orders_result.data:
        if order.get("status") == "delivered":
            farmer_id = order.get("farmer_id")
            amount = order.get("total_amount", 0)
            farmer_revenue[farmer_id] = farmer_revenue.get(farmer_id, 0) + amount
    
    # Get farmer details
    top_farmers = []
    for farmer_id, revenue in sorted(farmer_revenue.items(), key=lambda x: x[1], reverse=True)[:10]:
        farmer_result = db.table("users").select("name, email").eq("id", farmer_id).execute()
        if farmer_result.data:
            top_farmers.append({
                "farmer_id": farmer_id,
                "name": farmer_result.data[0].get("name"),
                "revenue": revenue
            })
    
    return {
        "overview": {
            "total_users": total_users,
            "total_consumers": total_consumers,
            "total_farmers": total_farmers,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "platform_commission": round(platform_commission, 2)
        },
        "orders": {
            "total": total_orders,
            "by_status": orders_by_status,
            "recent_7_days": recent_orders_count
        },
        "top_products": top_products,
        "top_farmers": top_farmers
    }


@router.get("/users", response_model=Dict[str, Any])
async def get_user_analytics(
    current_user: TokenPayload = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """Get user statistics"""
    
    # Get all users
    users_result = db.table("users").select("*").execute()
    
    total_users = len(users_result.data)
    verified_users = sum(1 for u in users_result.data if u.get("is_verified"))
    
    # Users by role
    users_by_role = {}
    for user in users_result.data:
        role = user.get("role", "unknown")
        users_by_role[role] = users_by_role.get(role, 0) + 1
    
    # Recent registrations (last 30 days)
    thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
    recent_users = [u for u in users_result.data if u.get("created_at", "") >= thirty_days_ago]
    
    return {
        "total_users": total_users,
        "verified_users": verified_users,
        "users_by_role": users_by_role,
        "recent_registrations": len(recent_users)
    }


@router.get("/sales", response_model=Dict[str, Any])
async def get_sales_analytics(
    current_user: TokenPayload = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """Get sales analytics"""
    
    # Get all orders
    orders_result = db.table("orders").select("*").execute()
    
    total_orders = len(orders_result.data)
    
    # Revenue by status
    revenue_by_status = {}
    for order in orders_result.data:
        status = order.get("status", "unknown")
        amount = order.get("total_amount", 0)
        
        if status not in revenue_by_status:
            revenue_by_status[status] = 0
        revenue_by_status[status] += amount
    
    # Monthly revenue (last 12 months)
    monthly_revenue = {}
    for order in orders_result.data:
        if order.get("status") == "delivered":
            created_at = order.get("created_at", "")
            if created_at:
                try:
                    month_key = created_at[:7]  # YYYY-MM
                    amount = order.get("total_amount", 0)
                    monthly_revenue[month_key] = monthly_revenue.get(month_key, 0) + amount
                except:
                    pass
    
    return {
        "total_orders": total_orders,
        "revenue_by_status": revenue_by_status,
        "monthly_revenue": monthly_revenue
    }


@router.get("/products", response_model=Dict[str, Any])
async def get_product_analytics(
    current_user: TokenPayload = Depends(get_current_admin),
    db: Client = Depends(get_db)
):
    """Get product analytics"""
    
    # Get all products
    products_result = db.table("products").select("*").execute()
    
    total_products = len(products_result.data)
    active_products = sum(1 for p in products_result.data if p.get("is_active"))
    
    # Products by category
    products_by_category = {}
    for product in products_result.data:
        category = product.get("category", "unknown")
        products_by_category[category] = products_by_category.get(category, 0) + 1
    
    # Average product rating
    rated_products = [p for p in products_result.data if p.get("rating_count", 0) > 0]
    avg_rating = sum(p.get("rating", 0) for p in rated_products) / len(rated_products) if rated_products else 0
    
    return {
        "total_products": total_products,
        "active_products": active_products,
        "products_by_category": products_by_category,
        "average_rating": round(avg_rating, 2)
    }
