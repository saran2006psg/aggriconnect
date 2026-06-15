import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createBulkOrder, getBulkOrders,
  getBulkOrder, respondToBulkOrder,
} from '../controllers/bulkOrder.controller';

const router = Router();

router.post('/', authMiddleware, createBulkOrder);
router.get('/', authMiddleware, getBulkOrders);
router.get('/:bulk_order_id', authMiddleware, getBulkOrder);
router.post('/:bulk_order_id/respond', authMiddleware, respondToBulkOrder);

export default router;
