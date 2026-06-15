import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createOrder, getOrders, getOrder,
  updateOrderStatus, cancelOrder,
} from '../controllers/order.controller';

const router = Router();

router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getOrders);
router.get('/:order_id', authMiddleware, getOrder);
router.patch('/:order_id/status', authMiddleware, updateOrderStatus);
router.post('/:order_id/cancel', authMiddleware, cancelOrder);

export default router;
