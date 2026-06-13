import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import { BulkOrderCreateRequest, BulkOrderRespondRequest } from '../types/order.types';
import { UserRecord } from '../types/user.types';

export async function createBulkOrderService(userId: string, body: BulkOrderCreateRequest) {
  // Estimate total
  let estimatedTotal = 0;
  for (const item of body.items) {
    if (item.product_id) {
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('price')
        .eq('id', item.product_id)
        .single();
      if (prod) {
        const multiplier = item.frequency === 'Daily' ? 30 : item.frequency === 'Weekly' ? 4 : 1;
        estimatedTotal += Number(prod.price) * Number(item.quantity) * multiplier;
      }
    }
  }

  const orderId = uuidv4();
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('bulk_orders')
    .insert({
      id: orderId,
      consumer_id: userId,
      business_name: body.business_name,
      business_type: body.business_type,
      business_location: body.business_location,
      budget_min: Number(body.budget_min),
      budget_max: Number(body.budget_max),
      estimated_total: estimatedTotal,
      status: 'Pending',
      created_at: now,
      updated_at: now,
    })
    .select();

  if (error || !data || data.length === 0) throw new Error(error?.message ?? 'Database error');

  // Insert items
  for (const item of body.items) {
    await supabaseAdmin.from('bulk_order_items').insert({
      id: uuidv4(),
      bulk_order_id: orderId,
      product_id: item.product_id ?? null,
      product_name: item.product_name,
      quantity: Number(item.quantity),
      unit: item.unit,
      frequency: item.frequency,
    });
  }

  // Notify all farmers
  try {
    const { data: farmers } = await supabaseAdmin.from('users').select('id').eq('role', 'farmer');
    for (const farmer of farmers ?? []) {
      await supabaseAdmin.from('notifications').insert({
        id: uuidv4(),
        user_id: farmer.id,
        type: 'bulk_order_request',
        title: 'New Bulk Order Request!',
        message: `New bulk order from ${body.business_name} (${body.items.length} products, est. ₹${estimatedTotal.toFixed(2)}/month)`,
        is_read: false,
        created_at: now,
      });
    }
  } catch (e) { console.warn('Failed to notify farmers:', e); }

  return { ...data[0], estimated_total: estimatedTotal };
}

export async function getBulkOrdersService(user: UserRecord, page: number, perPage: number) {
  const offset = (page - 1) * perPage;

  let q = supabaseAdmin
    .from('bulk_orders')
    .select('*, bulk_order_items(*)', { count: 'exact' });

  if (user.role === 'consumer') {
    q = q.eq('consumer_id', user.id);
  } else {
    q = q.eq('status', 'Pending');
  }

  const { data, count } = await q
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  return { items: data ?? [], total: count ?? 0 };
}

export async function getBulkOrderService(bulkOrderId: string) {
  const { data: order } = await supabaseAdmin
    .from('bulk_orders')
    .select('*')
    .eq('id', bulkOrderId)
    .single();

  if (!order) return null;

  const { data: items } = await supabaseAdmin
    .from('bulk_order_items')
    .select('*')
    .eq('bulk_order_id', bulkOrderId);

  const { data: responses } = await supabaseAdmin
    .from('bulk_order_responses')
    .select('*, users(full_name, farm_name)')
    .eq('bulk_order_id', bulkOrderId);

  return { ...order, items: items ?? [], responses: responses ?? [] };
}

export async function respondToBulkOrderService(
  bulkOrderId: string,
  body: BulkOrderRespondRequest,
  user: UserRecord
) {
  if (user.role !== 'farmer') {
    return { success: false, message: 'Only farmers can respond to bulk orders', errors: { auth: 'Insufficient permissions' } };
  }

  const { data: orderData } = await supabaseAdmin
    .from('bulk_orders')
    .select('*, users!bulk_orders_consumer_id_fkey(id, full_name)')
    .eq('id', bulkOrderId)
    .single();

  if (!orderData) {
    return { success: false, message: 'Bulk order not found', errors: { order: 'Bulk order does not exist' } };
  }

  const now = new Date().toISOString();
  const { data: resp, error } = await supabaseAdmin
    .from('bulk_order_responses')
    .insert({
      id: uuidv4(),
      bulk_order_id: bulkOrderId,
      farmer_id: user.id,
      message: body.message,
      quoted_price: Number(body.quoted_price),
      created_at: now,
    })
    .select();

  if (error) throw new Error(error.message);

  // Mark bulk order as responded
  await supabaseAdmin
    .from('bulk_orders')
    .update({ status: 'Responded', updated_at: now })
    .eq('id', bulkOrderId);

  // Notify consumer
  try {
    const farmerName = user.farm_name || user.full_name;
    await supabaseAdmin.from('notifications').insert({
      id: uuidv4(),
      user_id: orderData.consumer_id,
      type: 'bulk_order_response',
      title: 'New Quote Received!',
      message: `${farmerName} sent you a quote for ₹${Number(body.quoted_price).toFixed(2)}/month for your bulk order`,
      is_read: false,
      created_at: now,
    });
  } catch (e) { console.warn('Failed to notify consumer:', e); }

  return { success: true, message: 'Response submitted successfully', data: resp?.[0] ?? null };
}
