import { supabaseAdmin } from '../lib/supabase';

export async function getPlatformStatsService() {
  const [totalUsers, totalFarmers, totalConsumers, totalProducts, totalOrders] =
    await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('role', 'farmer'),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('role', 'consumer'),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
    ]);

  return {
    total_users: totalUsers.count ?? 0,
    total_farmers: totalFarmers.count ?? 0,
    total_consumers: totalConsumers.count ?? 0,
    total_products: totalProducts.count ?? 0,
    total_orders: totalOrders.count ?? 0,
  };
}

export async function getAllFarmersService(page: number, perPage: number) {
  const offset = (page - 1) * perPage;
  const { data, count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .eq('role', 'farmer')
    .range(offset, offset + perPage - 1);

  const farmers = (data ?? []).map((f: Record<string, unknown>) => {
    delete f.password_hash;
    return f;
  });

  return { items: farmers, total: count ?? 0 };
}

export async function getAllConsumersService(page: number, perPage: number) {
  const offset = (page - 1) * perPage;
  const { data, count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .eq('role', 'consumer')
    .range(offset, offset + perPage - 1);

  const consumers = (data ?? []).map((c: Record<string, unknown>) => {
    delete c.password_hash;
    return c;
  });

  return { items: consumers, total: count ?? 0 };
}

export async function getAllOrdersService(page: number, perPage: number) {
  const offset = (page - 1) * perPage;
  const { data, count } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  return { items: data ?? [], total: count ?? 0 };
}
