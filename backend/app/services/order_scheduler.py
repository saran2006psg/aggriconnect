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
        
        # Find pending/confirmed orders older than 10 minutes with timeout
        orders_result = await asyncio.wait_for(
            asyncio.to_thread(
                lambda: supabase_admin_client.table("orders").select(
                    "id, order_number, consumer_id, status, created_at"
                ).in_("status", ["Pending", "Confirmed", "Out for Delivery"]).lt(
                    "created_at", ten_minutes_ago
                ).execute()
            ),
            timeout=5.0  # 5 second timeout
        )
        
        if not orders_result.data:
            return
        
        for order in orders_result.data:
            try:
                # Update order status to Delivered
                await asyncio.wait_for(
                    asyncio.to_thread(
                        lambda: supabase_admin_client.table("orders").update({
                            "status": "Delivered",
                            "updated_at": datetime.utcnow().isoformat(),
                            "delivered_at": datetime.utcnow().isoformat()
                        }).eq("id", order["id"]).execute()
                    ),
                    timeout=5.0
                )
                
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
                    await asyncio.wait_for(
                        asyncio.to_thread(
                            lambda: supabase_admin_client.table("notifications").insert(notification_data).execute()
                        ),
                        timeout=5.0
                    )
                    print(f"✅ Auto-completed order: {order['order_number']}")
                except asyncio.TimeoutError:
                    print(f"⚠️ Notification timeout for order: {order['order_number']}")
                except Exception as e:
                    print(f"⚠️ Failed to create notification: {str(e)}")
                    
            except asyncio.TimeoutError:
                print(f"⚠️ Timeout updating order: {order.get('order_number', 'unknown')}")
            except Exception as e:
                print(f"⚠️ Error updating order: {str(e)}")
                
    except asyncio.TimeoutError:
        print("⚠️ Scheduler timeout - Supabase connection slow")
    except Exception as e:
        print(f"⚠️ Scheduler error: {str(e)}")

async def order_scheduler():
    """Run the order completion check every minute."""
    while True:
        try:
            await check_and_complete_orders()
        except Exception as e:
            print(f"⚠️ Scheduler loop error: {str(e)}")
        await asyncio.sleep(60)  # Check every 60 seconds

def start_order_scheduler():
    """Start the order scheduler in the background."""
    try:
        asyncio.create_task(order_scheduler())
        print("✅ Order scheduler started successfully")
    except Exception as e:
        print(f"⚠️ Failed to start scheduler: {str(e)}")
        print("⚠️ Continuing without auto-completion scheduler")

