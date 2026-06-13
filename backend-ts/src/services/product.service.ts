import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import {
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductListQuery,
} from '../types/product.types';

const DELETED_MARKER = '[DELETED]';

export async function listProductsService(query: ProductListQuery) {
  const { search, category, farmer, sortBy = 'recent', page = 1, perPage = 20 } = query;

  let q = supabaseAdmin
    .from('products')
    .select('*, users!products_farmer_id_fkey(full_name, farm_name)', { count: 'exact' });

  // consumers only see available products; farmer listing shows all
  if (!farmer) {
    q = q.eq('is_available', true);
  }

  if (search) {
    q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (category) {
    q = q.eq('category', category);
  }
  if (farmer) {
    q = q.eq('farmer_id', farmer);
  }

  if (sortBy === 'price_asc') q = q.order('price', { ascending: true });
  else if (sortBy === 'price_desc') q = q.order('price', { ascending: false });
  else if (sortBy === 'rating') q = q.order('rating', { ascending: false });
  else q = q.order('created_at', { ascending: false });

  const offset = (page - 1) * perPage;
  q = q.range(offset, offset + perPage - 1);

  const { data, count, error } = await q;

  if (error) throw new Error(error.message);

  const products = (data ?? [])
    .filter((item: Record<string, unknown>) => {
      if (item.deleted_at) return false;
      if (typeof item.description === 'string' && item.description.startsWith(DELETED_MARKER)) return false;
      return true;
    })
    .map((item: Record<string, unknown>) => {
      const farmerInfo = (item.users ?? {}) as { farm_name?: string; full_name?: string };
      delete item.users;
      item.farmer = farmerInfo.farm_name || farmerInfo.full_name || null;
      return item;
    });

  return { products, total: count ?? 0 };
}

export async function getProductService(productId: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, users!products_farmer_id_fkey(full_name, farm_name, farm_location)')
    .eq('id', productId)
    .single();

  if (
    error ||
    !data ||
    data.deleted_at ||
    (typeof data.description === 'string' && data.description.startsWith(DELETED_MARKER))
  ) {
    return null;
  }

  const farmerInfo = (data.users ?? {}) as { farm_name?: string; full_name?: string; farm_location?: string };
  delete data.users;
  data.farmer = farmerInfo.farm_name || farmerInfo.full_name || null;
  data.farmer_location = farmerInfo.farm_location || null;

  return data;
}

export async function createProductService(
  body: ProductCreateRequest,
  userId: string,
  farmLocation?: string | null
) {
  const now = new Date().toISOString();
  const newProduct = {
    id: uuidv4(),
    farmer_id: userId,
    name: body.name,
    price: Number(body.price),
    unit: body.unit,
    category: body.category,
    description: body.description ?? null,
    location: body.location ?? farmLocation ?? null,
    image_url: body.image_url ?? null,
    stock_quantity: body.stock_quantity,
    is_available: body.is_available ?? true,
    harvest_date: body.harvest_date ?? null,
    rating: 0.0,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabaseAdmin.from('products').insert(newProduct).select();
  if (error || !data || data.length === 0) throw new Error(error?.message ?? 'Database error');
  return data[0];
}

export async function updateProductService(
  productId: string,
  body: ProductUpdateRequest,
  userId: string
) {
  // Check ownership
  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('farmer_id')
    .eq('id', productId)
    .single();

  if (!existing) return { found: false };
  if (existing.farmer_id !== userId) return { found: true, forbidden: true };

  const updateData: Record<string, unknown> = { ...body };

  if (updateData.price !== undefined) updateData.price = Number(updateData.price);
  if (updateData.harvest_date !== undefined && updateData.harvest_date) {
    updateData.harvest_date = String(updateData.harvest_date);
  }

  // Auto-toggle availability based on stock
  if (updateData.stock_quantity !== undefined) {
    const qty = Number(updateData.stock_quantity);
    updateData.is_available = qty > 0;
    if (qty > 0) console.log(`✅ Product ${productId} restocked to ${qty} - now AVAILABLE`);
    else console.log(`🚫 Product ${productId} stock is 0 - marked OUT OF STOCK`);
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updateData)
    .eq('id', productId)
    .select();

  if (error) throw new Error(error.message);
  return { found: true, forbidden: false, data: data?.[0] ?? null };
}

export async function deleteProductService(productId: string, userId: string) {
  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('farmer_id')
    .eq('id', productId)
    .single();

  if (!existing) return { found: false };
  if (existing.farmer_id !== userId) return { found: true, forbidden: true };

  const now = new Date().toISOString();

  try {
    // Try hard delete
    const { error } = await supabaseAdmin.from('products').delete().eq('id', productId);
    if (error) throw error;
  } catch {
    // Fallback: soft delete
    try {
      await supabaseAdmin.from('products').update({
        deleted_at: now,
        is_available: false,
        stock_quantity: 0,
        description: DELETED_MARKER,
        updated_at: now,
      }).eq('id', productId);
    } catch {
      // Final fallback without deleted_at (pre-migration envs)
      await supabaseAdmin.from('products').update({
        is_available: false,
        stock_quantity: 0,
        description: DELETED_MARKER,
        updated_at: now,
      }).eq('id', productId);
    }
  }

  return { found: true, forbidden: false };
}
