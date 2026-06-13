import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getCart, addToCart, updateCartItem,
  removeCartItem, clearCart,
} from '../controllers/cart.controller';

const router = Router();

router.get('/', authMiddleware, getCart);
router.post('/items', authMiddleware, addToCart);
router.put('/items/:item_id', authMiddleware, updateCartItem);
router.delete('/clear', authMiddleware, clearCart);
router.delete('/items/:item_id', authMiddleware, removeCartItem);

export default router;
