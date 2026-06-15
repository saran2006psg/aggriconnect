import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import { SubscriptionCreateRequest } from '../types/order.types';

function calculateNextDelivery(frequency: string): string {
  const now = new Date();
  if (frequency === 'Weekly') now.setDate(now.getDate() + 7);
  else if (frequency === 'Monthly') now.setDate(now.getDate() + 30);
  return now.toISOString();
}

export async function getSubscriptionsService(userId: string) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId);
  return data ?? [];
}

export async function getSubscriptionByIdService(subscriptionId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*, subscription_items(*)')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .single();
  return data ?? null;
}

export async function createSubscriptionService(userId: string, body: SubscriptionCreateRequest) {
  let total = 0;
  for (const item of body.items) {
    const { data: prod } = await supabaseAdmin
      .from('products')
      .select('price')
      .eq('id', item.product_id)
      .single();
    if (prod) total += Number(prod.price) * item.quantity;
  }

  const subId = uuidv4();
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      id: subId,
      user_id: userId,
      frequency: body.frequency,
      status: 'Active',
      next_delivery_date: calculateNextDelivery(body.frequency),
      total_amount: total,
      created_at: now,
      updated_at: now,
    })
    .select();

  if (error) throw new Error(error.message);

  for (const item of body.items) {
    await supabaseAdmin.from('subscription_items').insert({
      id: uuidv4(),
      subscription_id: subId,
      product_id: item.product_id,
      quantity: item.quantity,
    });
  }

  return data?.[0] ?? null;
}

export async function pauseSubscriptionService(subscriptionId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'Paused' })
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .select();
  return data?.[0] ?? null;
}

export async function resumeSubscriptionService(subscriptionId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'Active' })
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .select();
  return data?.[0] ?? null;
}

export async function cancelSubscriptionService(subscriptionId: string, userId: string) {
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'Cancelled' })
    .eq('id', subscriptionId)
    .eq('user_id', userId);
}
