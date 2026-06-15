import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import { CreateOrderRequest, UpdateOrderStatusRequest, STATUS_MAP } from '../types/order.types';
import { UserRecord } from '../types/user.types';
import { ServiceResult } from '../utils/response';

function generateOrderNumber(): string {
  return `AC-${Math.floor(1000 + Math.random() * 9000)}`;
}

function normalizeStatus(rawStatus: string): string {
  const key = rawStatus.trim().toLowerCase().replace(/ /g, '_') as keyof typeof STATUS_MAP;
  const mapped = STATUS_MAP[key];
  if (!mapped) throw new Error('Invalid order status');
  return mapped;
}

export async function createOrderService(userId: string, body: CreateOrderRequest): Promise<ServiceResult> {
  console.log(`📦 Creating order for user: ${userId}`);

  // Get cart
  const { data: carts } = await supabaseAdmin.from('carts').select('id').eq('user_id', userId);
  if (!carts || carts.length === 0) {
    return { success: false, message: 'Cart is empty', errors: { cart: 'No items in cart' } };
  }

  const cartId = carts[0].id;

  // Get cart items
  const { data: cartItems } = await supabaseAdmin
    .from('cart_items')
    .select('*, products(id, name, price, farmer_id, stock_quantity, is_available)')
    .eq('cart_id', cartId);

  if (!cartItems || cartItems.length === 0) {
    return { success: false, message: 'Cart is empty', errors: { cart: 'No items in cart' } };
  }

  // Validate stock
  const stockErrors: string[] = [];
  for (const item of cartItems) {
    const product = item.products as Record<string, unknown>;
    if (!product.is_available) { stockErrors.push(`${product.name} is OUT OF STOCK`); continue; }
    if (product.stock_quantity === 0) { stockErrors.push(`${product.name} is OUT OF STOCK (0 available)`); continue; }
    if ((product.stock_quantity as number) < item.quantity) {
      stockErrors.push(`${product.name}: Only ${product.stock_quantity} available (requested ${item.quantity})`);
    }
  }

  if (stockErrors.length > 0) {
    return { success: false, message: 'Some items are out of stock or insufficient', errors: { stock: stockErrors } };
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems: Record<string, unknown>[] = [];

  for (const item of cartItems) {
    const product = item.products as Record<string, unknown>;
    const itemSubtotal = Number(product.price) * item.quantity;
    subtotal += itemSubtotal;
    orderItems.push({
      product_id: product.id,
      farmer_id: product.farmer_id,
      quantity: item.quantity,
      price_at_purchase: Number(product.price),
      subtotal: itemSubtotal,
    });
  }

  const deliveryFee = body.delivery_type === 'Delivery' ? 5.0 : 0;
  const discount = body.promo_code ? subtotal * 0.1 : 0;
  const total = subtotal + deliveryFee - discount;

  const orderId = uuidv4();
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  // Insert order
  const { data: orderData, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      id: orderId,
      order_number: orderNumber,
      consumer_id: userId,
      delivery_type: body.delivery_type,
      delivery_address_id: body.delivery_address_id ?? null,
      status: 'Pending',
      subtotal,
      delivery_fee: deliveryFee,
      promo_code: body.promo_code ?? null,
      discount,
      total,
      created_at: now,
      updated_at: now,
    })
    .select();

  if (orderError || !orderData || orderData.length === 0) {
    return { success: false, message: 'Failed to create order', errors: { server: 'Database error' } };
  }

  console.log(`✅ Order created: ${orderNumber}`);

  // Insert order items + decrement stock
  const uniqueFarmers = new Set<string>();
  for (const item of orderItems) {
    await supabaseAdmin.from('order_items').insert({
      id: uuidv4(),
      order_id: orderId,
      product_id: item.product_id,
      farmer_id: item.farmer_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
      subtotal: item.subtotal,
    });

    uniqueFarmers.add(item.farmer_id as string);

    // Decrement stock
    const { data: prod } = await supabaseAdmin
      .from('products')
      .select('stock_quantity, name')
      .eq('id', item.product_id)
      .single();

    if (prod) {
      const newStock = Math.max(0, prod.stock_quantity - (item.quantity as number));
      const stockUpdate: Record<string, unknown> = { stock_quantity: newStock };
      if (newStock === 0) {
        stockUpdate.is_available = false;
        console.log(`🚫 ${prod.name} is now OUT OF STOCK`);
      }
      await supabaseAdmin.from('products').update(stockUpdate).eq('id', item.product_id);
    }
  }

  // Clear cart
  await supabaseAdmin.from('cart_items').delete().eq('cart_id', cartId);

  // Notify farmers
  for (const farmerId of uniqueFarmers) {
    try {
      await supabaseAdmin.from('notifications').insert({
        id: uuidv4(),
        user_id: farmerId,
        type: 'order_placed',
        title: 'New Order Received!',
        message: `You have a new order #${orderNumber} worth ₹${total.toFixed(2)}`,
        is_read: false,
        created_at: now,
      });
    } catch (e) {
      console.warn(`Failed to notify farmer: ${e}`);
    }
  }

  return { success: true, message: 'Order created successfully', data: { order_id: orderId, order_number: orderNumber } };
}

export async function getOrdersService(user: UserRecord, page: number, perPage: number) {
  const offset = (page - 1) * perPage;

  if (user.role === 'consumer') {
    const { data, count } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, image_url, category))', { count: 'exact' })
      .eq('consumer_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    return { items: data ?? [], total: count ?? 0 };
  }

  if (user.role === 'farmer') {
    const { data: allOrders } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, image_url, category))')
      .order('created_at', { ascending: false });

    const farmerOrders = (allOrders ?? [])
      .map((order: Record<string, unknown>) => {
        const farmerItems = ((order.order_items as Record<string, unknown>[]) ?? []).filter(
          (item) => item.farmer_id === user.id
        );
        if (farmerItems.length === 0) return null;
        return {
          ...order,
          order_items: farmerItems,
          item_count: farmerItems.length,
          farmer_earning: farmerItems.reduce((sum, i) => sum + Number(i.subtotal ?? 0), 0),
        };
      })
      .filter(Boolean);

    const total = farmerOrders.length;
    const paginated = farmerOrders.slice(offset, offset + perPage);
    return { items: paginated, total };
  }

  // admin
  const { data, count } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(name, image_url, category))', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  return { items: data ?? [], total: count ?? 0 };
}

export async function getOrderService(orderId: string, user: UserRecord) {
  const { data: orderRes } = await supabaseAdmin
    .from('orders')
    .select('*, users!orders_consumer_id_fkey(full_name, phone_number, email), addresses(*)')
    .eq('id', orderId)
    .single();

  if (!orderRes) return null;

  if (user.role === 'consumer' && orderRes.consumer_id !== user.id) {
    return { forbidden: true };
  }

  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('*, products(name, image_url, category), users!order_items_farmer_id_fkey(id, full_name, farm_name, phone_number)')
    .eq('order_id', orderId);

  if (user.role === 'farmer' && !(items ?? []).some((i: Record<string, unknown>) => i.farmer_id === user.id)) {
    return { forbidden: true };
  }

  const orderItems: unknown[] = [];
  const farmerContacts: unknown[] = [];

  for (const item of items ?? []) {
    if (user.role === 'farmer' && item.farmer_id !== user.id) continue;
    const product = item.products as Record<string, unknown> ?? {};
    const farmerInfo = item.users as Record<string, unknown> ?? {};
    delete item.products;
    delete item.users;

    orderItems.push({
      id: item.id,
      product_id: item.product_id,
      product_name: product.name,
      product_image_url: product.image_url,
      product_category: product.category,
      farmer_id: item.farmer_id,
      farmer_name: farmerInfo.farm_name || farmerInfo.full_name,
      quantity: item.quantity,
      price_at_purchase: Number(item.price_at_purchase),
      subtotal: Number(item.subtotal),
    });

    if (farmerInfo.phone_number && !(farmerContacts as Record<string, unknown>[]).some((f) => (f as Record<string, unknown>).farmer_id === item.farmer_id)) {
      farmerContacts.push({
        farmer_id: item.farmer_id,
        farmer_name: farmerInfo.farm_name || farmerInfo.full_name,
        phone_number: farmerInfo.phone_number,
      });
    }
  }

  let statusHistory: unknown[] = [];
  try {
    const { data: hist } = await supabaseAdmin
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    statusHistory = hist ?? [];
  } catch { /* ignore */ }

  const consumerInfo = orderRes.users ?? {};
  const addressInfo = orderRes.addresses ?? null;
  delete orderRes.users;
  delete orderRes.addresses;

  return {
    ...orderRes,
    consumer_name: consumerInfo.full_name,
    consumer_phone: consumerInfo.phone_number,
    consumer_email: consumerInfo.email,
    delivery_address: addressInfo,
    items: orderItems,
    farmer_contacts: farmerContacts,
    status_history: statusHistory,
  };
}

export async function updateOrderStatusService(
  orderId: string,
  body: UpdateOrderStatusRequest,
  user: UserRecord
) {
  const { data: orderRes } = await supabaseAdmin
    .from('orders')
    .select('consumer_id, status, order_number')
    .eq('id', orderId)
    .single();

  if (!orderRes) return { found: false };

  const oldStatus = orderRes.status;
  let newStatus: string;
  try {
    newStatus = normalizeStatus(body.status);
  } catch {
    return { found: true, invalidStatus: true };
  }

  if (!['admin', 'farmer'].includes(user.role) && orderRes.consumer_id !== user.id) {
    return { found: true, forbidden: true };
  }

  if (user.role === 'farmer') {
    const { data: hasItem } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('order_id', orderId)
      .eq('farmer_id', user.id)
      .limit(1);

    if (!hasItem || hasItem.length === 0) return { found: true, forbidden: true };
  }

  const now = new Date().toISOString();
  const updateData: Record<string, unknown> = { status: newStatus, updated_at: now };

  if (newStatus === 'Confirmed') updateData.estimated_delivery = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  else if (newStatus === 'Processing') updateData.estimated_delivery = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
  else if (newStatus === 'Out for Delivery') updateData.estimated_delivery = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
  else if (newStatus === 'Delivered') { updateData.estimated_delivery = now; updateData.delivered_at = now; }

  const { data: updated } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select();

  // Status history
  try {
    await supabaseAdmin.from('order_status_history').insert({
      id: uuidv4(),
      order_id: orderId,
      status: newStatus,
      changed_by: user.id,
      changed_by_name: user.full_name ?? 'System',
      notes: `Status changed from ${oldStatus} to ${newStatus}`,
      created_at: now,
    });
  } catch (e) { console.warn('Failed to create status history:', e); }

  // Credit farmers on Delivered
  if (oldStatus !== 'Delivered' && newStatus === 'Delivered') {
    try {
      const { data: deliveredItems } = await supabaseAdmin
        .from('order_items')
        .select('farmer_id, subtotal')
        .eq('order_id', orderId);

      const farmerTotals: Record<string, number> = {};
      for (const item of deliveredItems ?? []) {
        farmerTotals[item.farmer_id] = (farmerTotals[item.farmer_id] ?? 0) + Number(item.subtotal ?? 0);
      }

      for (const [fid, amount] of Object.entries(farmerTotals)) {
        try {
          const { data: curr } = await supabaseAdmin
            .from('users')
            .select('wallet_balance, total_earnings')
            .eq('id', fid)
            .limit(1)
            .single();

          const currentWallet = Number(curr?.wallet_balance ?? 0);
          const currentEarned = Number(curr?.total_earnings ?? 0);

          await supabaseAdmin.from('users').update({
            wallet_balance: currentWallet + amount,
            total_earnings: currentEarned + amount,
            updated_at: now,
          }).eq('id', fid);

          await supabaseAdmin.from('notifications').insert({
            id: uuidv4(),
            user_id: fid,
            type: 'order_earning',
            title: 'Payment Credited',
            message: `INR ${amount.toFixed(2)} credited for delivered order #${orderRes.order_number}`,
            is_read: false,
            created_at: now,
          });
        } catch (e) { console.warn(`Failed to credit farmer ${fid}:`, e); }
      }
    } catch (e) { console.warn('Failed to distribute earnings:', e); }
  }

  // Notify consumer
  try {
    const msgs: Record<string, string> = {
      Confirmed: `Your order #${orderRes.order_number} has been confirmed and will be delivered within 24 hours!`,
      Processing: `Your order #${orderRes.order_number} is being prepared by the farmer.`,
      'Out for Delivery': `Your order #${orderRes.order_number} is out for delivery! Expected within 2 hours.`,
      Delivered: `Your order #${orderRes.order_number} has been delivered! Enjoy your fresh produce!`,
      Cancelled: `Your order #${orderRes.order_number} has been cancelled.`,
    };
    await supabaseAdmin.from('notifications').insert({
      id: uuidv4(),
      user_id: orderRes.consumer_id,
      type: `order_${newStatus.toLowerCase().replace(/ /g, '_')}`,
      title: '📦 Order Status Update',
      message: msgs[newStatus] ?? `Order status changed to ${newStatus}`,
      is_read: false,
      created_at: now,
    });
  } catch (e) { console.warn('Failed to notify consumer:', e); }

  return { found: true, forbidden: false, data: updated?.[0] ?? null };
}

export async function cancelOrderService(orderId: string, user: UserRecord) {
  const { data: orderRes } = await supabaseAdmin
    .from('orders')
    .select('consumer_id, status')
    .eq('id', orderId)
    .single();

  if (!orderRes) return { found: false };
  if (orderRes.consumer_id !== user.id && user.role !== 'admin') return { found: true, forbidden: true };
  if (['Delivered', 'Cancelled'].includes(orderRes.status)) {
    return { found: true, forbidden: false, alreadyTerminal: true, currentStatus: orderRes.status };
  }

  await supabaseAdmin.from('orders').update({ status: 'Cancelled' }).eq('id', orderId);
  return { found: true, forbidden: false, alreadyTerminal: false };
}
