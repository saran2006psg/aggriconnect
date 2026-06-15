/**
 * Order auto-completion scheduler.
 * Replaces Python asyncio scheduler with node-cron.
 * Runs every 60 seconds; marks orders older than 10 minutes as Delivered.
 */
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';

async function checkAndCompleteOrders(): Promise<void> {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, consumer_id, status, created_at')
      .in('status', ['Pending', 'Confirmed', 'Out for Delivery'])
      .lt('created_at', tenMinutesAgo);

    if (!orders || orders.length === 0) return;

    const now = new Date().toISOString();

    for (const order of orders) {
      try {
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'Delivered',
            updated_at: now,
            delivered_at: now,
          })
          .eq('id', order.id);

        try {
          await supabaseAdmin.from('notifications').insert({
            id: uuidv4(),
            user_id: order.consumer_id,
            type: 'order_delivered',
            title: 'Order Delivered! 🎉',
            message: `Your order #${order.order_number} has been delivered successfully!`,
            is_read: false,
            created_at: now,
          });
          console.log(`✅ Auto-completed order: ${order.order_number}`);
        } catch (e) {
          console.warn(`⚠️ Failed to create notification for order ${order.order_number}:`, e);
        }
      } catch (e) {
        console.warn(`⚠️ Error updating order ${order.order_number}:`, e);
      }
    }
  } catch (e) {
    console.warn('⚠️ Scheduler error:', e);
  }
}

export function startOrderScheduler(): void {
  // Run every minute: "* * * * *"
  cron.schedule('* * * * *', () => {
    checkAndCompleteOrders().catch((e) =>
      console.warn('⚠️ Scheduler loop error:', e)
    );
  });
  console.log('✅ Order auto-completion scheduler started');
}
