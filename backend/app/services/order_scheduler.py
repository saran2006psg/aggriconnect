"""Order auto-completion scheduler."""
import asyncio
from datetime import datetime, timedelta
from app.core.supabase import supabase_admin_client
import uuid

async def check_and_complete_orders():
    """Check for orders older than 10 minutes and auto-complete them."""
    try:
        # Calculate 10 minutes ago
        ten_minutes_ago = (datetime.utcnow() - timedelta(minutes=10)).isoformat()
        
        # Find pending/confirmed orders older than 10 minutes
        orders_result = supabase_admin_client.table("orders").select(
            "id, order_number, consumer_id, status, created_at"
        ).in_("status", ["Pending", "Confirmed", "Out for Delivery"]).lt(
            "created_at", ten_minutes_ago
        ).execute()
        
        for order in orders_result.data:
            # Update order status to Delivered
            supabase_admin_client.table("orders").update({
                "status": "Delivered",
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", order["id"]).execute()
            
            # Send notification to consumer
            try:
                notification_data = {
                    "id": str(uuid.uuid4()),
                    "user_id": order["consumer_id"],
                    "type": "order_delivered",
                    "title": "Order Delivered! 🎉",
                    "message": f"Your order #{order['order_number']} has been delivered successfully!",
                    "is_read": False,
                    "created_at": datetime.utcnow().isoformat()
                }
                supabase_admin_client.table("notifications").insert(notification_data).execute()
                print(f"Auto-completed order: {order['order_number']}")
            except Exception as e:
                print(f"Failed to create notification: {str(e)}")
                
    except Exception as e:
        print(f"Error in order auto-completion: {str(e)}")

async def order_scheduler():
    """Run the order completion check every minute."""
    while True:
        await check_and_complete_orders()
        await asyncio.sleep(60)  # Check every 60 seconds

def start_order_scheduler():
    """Start the order scheduler in the background."""
    asyncio.create_task(order_scheduler())
