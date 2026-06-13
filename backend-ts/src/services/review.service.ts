import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import { ReviewCreateRequest } from '../types/product.types';

export async function createReviewService(userId: string, body: ReviewCreateRequest) {
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('id', body.product_id)
    .single();

  if (!product) {
    return { success: false, message: 'Product not found', errors: { product: 'Product does not exist' } };
  }

  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('product_id', body.product_id)
    .eq('user_id', userId);

  if (existing && existing.length > 0) {
    return { success: false, message: 'Review already exists', errors: { review: 'You have already reviewed this product' } };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      id: uuidv4(),
      product_id: body.product_id,
      user_id: userId,
      rating: body.rating,
      comment: body.comment ?? null,
      created_at: now,
      updated_at: now,
    })
    .select();

  if (error) throw new Error(error.message);
  return { success: true, message: 'Review created successfully', data: data?.[0] ?? null };
}

export async function getProductReviewsService(productId: string) {
  const { data } = await supabaseAdmin
    .from('reviews')
    .select('*, users(full_name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  return (data ?? []).map((item: Record<string, unknown>) => {
    const userInfo = (item.users ?? {}) as { full_name?: string };
    delete item.users;
    return { ...item, user_name: userInfo.full_name ?? 'Anonymous' };
  });
}
