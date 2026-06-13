import { Request, Response } from 'express';
import { createResponse } from '../utils/response';
import {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from '../services/cart.service';

export async function getCart(req: Request, res: Response): Promise<void> {
  try {
    const cart = await getCartService(req.user!.id);
    res.json(createResponse(true, 'Cart retrieved successfully', cart));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve cart', null, { server: String(e) }));
  }
}

export async function addToCart(req: Request, res: Response): Promise<void> {
  try {
    const result = await addToCartService(req.user!.id, req.body);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Failed to add item to cart', null, { server: String(e) }));
  }
}

export async function updateCartItem(req: Request, res: Response): Promise<void> {
  try {
    const result = await updateCartItemService(req.user!.id, req.params.item_id, req.body);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Failed to update cart item', null, { server: String(e) }));
  }
}

export async function removeCartItem(req: Request, res: Response): Promise<void> {
  try {
    const result = await removeCartItemService(req.user!.id, req.params.item_id);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Failed to remove cart item', null, { server: String(e) }));
  }
}

export async function clearCart(req: Request, res: Response): Promise<void> {
  try {
    const result = await clearCartService(req.user!.id);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Failed to clear cart', null, { server: String(e) }));
  }
}
