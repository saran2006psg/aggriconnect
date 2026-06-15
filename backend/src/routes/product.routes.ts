import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct,
} from '../controllers/product.controller';

const router = Router();

router.get('/', getProducts);
router.get('/:product_id', getProduct);
router.post('/', authMiddleware, requireRole('farmer'), createProduct);
router.put('/:product_id', authMiddleware, requireRole('farmer'), updateProduct);
router.delete('/:product_id', authMiddleware, requireRole('farmer'), deleteProduct);

export default router;
