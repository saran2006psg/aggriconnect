import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../lib/supabase';
import { CartItemAddRequest, CartItemUpdateRequest } from '../types/product.types';
import { ServiceResult } from '../utils/response';

// ─── Shared helpers ───────────────────────────────────────────────────────────

export async function getOrCreateCart(userId: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from('carts')
    .select('id')
    .eq('user_id', userId);

  if (data && data.length > 0) return data[0].id;

  const newCart = { id: uuidv4(), user_id: userId };
  const { data: created } = await supabaseAdmin
    .from('carts')
    .insert(newCart)
    .select();
  return created![0].id;
}

export async function getCartWithItems(cartId: string, userId: string) {
  const { data: items } = await supabaseAdmin
    .from('cart_items')
    .select(
      '*, products(*, users!products_farmer_id_fkey(full_name, farm_name))'
    )
    .eq('cart_id', cartId);

  let total = 0;
  const cartItems = (items ?? []).map(
    (item: Record<string, unknown>) => {
      const product = item.products as Record<string, unknown>;
      const farmerInfo = (product?.users ?? {}) as {
        farm_name?: string;
        full_name?: string;
      };
      if (product) delete product.users;

      const price = Number(product?.price ?? 0);
      const qty = Number(item.quantity ?? 0);
      const subtotal = price * qty;
      total += subtotal;

      return {
        id: item.id,
        product_id: product?.id,
        product_name: product?.name,
        price,
        unit: product?.unit,
        image_url: product?.image_url ?? null,
        farmer: farmerInfo.farm_name || farmerInfo.full_name || '',
        quantity: qty,
        subtotal,
      };
    }
  );

  return {
    id: cartId,
    user_id: userId,
    items: cartItems,
    total,
    item_count: cartItems.length,
  };
}

// ─── Endpoint handlers ────────────────────────────────────────────────────────

export async function getCartService(userId: string) {
  console.log(`🛒 Getting cart for user: ${userId}`);
  const cartId = await getOrCreateCart(userId);
  console.log(`📦 Cart ID: ${cartId}`);

  const { data: itemsData } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity, cart_id, product_id, products(id, name, price, unit, image_url)')
    .eq('cart_id', cartId);

  let total = 0;
  const cartItems = (itemsData ?? [])
    .map((item: Record<string, unknown>) => {
      const product = item.products as Record<string, unknown> | null;
      if (!product) return null;
      const price = Number(product.price ?? 0);
      const qty = Number(item.quantity ?? 0);
      const subtotal = price * qty;
      total += subtotal;
      return {
        id: item.id,
        product_id: product.id,
        product_name: product.name,
        price,
        unit: product.unit,
        image_url: product.image_url ?? null,
        farmer: '',
        quantity: qty,
        subtotal,
      };
    })
    .filter(Boolean);

  return {
    id: cartId,
    user_id: userId,
    items: cartItems,
    total,
    item_count: cartItems.length,
  };
}

export async function addToCartService(userId: string, body: CartItemAddRequest): Promise<ServiceResult> {
  const cartId = await getOrCreateCart(userId);

  // Check product
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, is_available, stock_quantity')
    .eq('id', body.product_id);

  if (!products || products.length === 0) {
    return { success: false, message: 'Product not found', errors: { product: 'Product does not exist' } };
  }

  const product = products[0];

  if (!product.is_available) {
    return { success: false, message: 'Product not available', errors: { product: 'This product is currently unavailable' } };
  }

  // Check existing cart item
  const { data: existing } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', body.product_id);

  let itemData: Record<string, unknown>;

  if (existing && existing.length > 0) {
    const existingItem = existing[0];
    const newQty = existingItem.quantity + body.quantity;

    if (product.stock_quantity < newQty) {
      return { success: false, message: 'Insufficient stock', errors: { product: `Only ${product.stock_quantity} items available` } };
    }

    const { data: updated } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', existingItem.id)
      .select();

    itemData = updated?.[0] ?? existingItem;
  } else {
    if (product.stock_quantity < body.quantity) {
      return { success: false, message: 'Insufficient stock', errors: { product: `Only ${product.stock_quantity} items available` } };
    }

    const newItem = {
      id: uuidv4(),
      cart_id: cartId,
      product_id: body.product_id,
      quantity: body.quantity,
    };

    const { data: created } = await supabaseAdmin.from('cart_items').insert(newItem).select();
    itemData = created?.[0] ?? newItem;
  }

  return { success: true, message: 'Item added to cart', data: { item: itemData } };
}

export async function updateCartItemService(
  userId: string,
  itemId: string,
  body: CartItemUpdateRequest
): Promise<ServiceResult> {
  const cartId = await getOrCreateCart(userId);

  const { data: itemRes } = await supabaseAdmin
    .from('cart_items')
    .select('product_id')
    .eq('id', itemId)
    .eq('cart_id', cartId);

  if (!itemRes || itemRes.length === 0) {
    return { success: false, message: 'Cart item not found', errors: { item: 'Item not in your cart' } };
  }

  const { data: prodRes } = await supabaseAdmin
    .from('products')
    .select('stock_quantity')
    .eq('id', itemRes[0].product_id);

  if (prodRes && prodRes.length > 0 && prodRes[0].stock_quantity < body.quantity) {
    return { success: false, message: 'Insufficient stock', errors: { product: `Only ${prodRes[0].stock_quantity} items available` } };
  }

  const { data: updated } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity: body.quantity })
    .eq('id', itemId)
    .select();

  return { success: true, message: 'Cart updated successfully', data: { item: updated?.[0] ?? null } };
}

export async function removeCartItemService(userId: string, itemId: string): Promise<ServiceResult> {
  const cartId = await getOrCreateCart(userId);

  const { data: itemRes } = await supabaseAdmin
    .from('cart_items')
    .select('id')
    .eq('id', itemId)
    .eq('cart_id', cartId);

  if (!itemRes || itemRes.length === 0) {
    return { success: false, message: 'Cart item not found', errors: { item: 'Item not in your cart' } };
  }

  await supabaseAdmin.from('cart_items').delete().eq('id', itemId);
  const cart = await getCartWithItems(cartId, userId);
  return { success: true, message: 'Item removed from cart', data: cart };
}

export async function clearCartService(userId: string): Promise<ServiceResult> {
  const cartId = await getOrCreateCart(userId);
  await supabaseAdmin.from('cart_items').delete().eq('cart_id', cartId);
  const cart = await getCartWithItems(cartId, userId);
  return { success: true, message: 'Cart cleared', data: cart };
}
