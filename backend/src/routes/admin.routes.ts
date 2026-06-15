import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  getPlatformStats,
  getAllFarmers,
  getAllConsumers,
  getAllOrders,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication + admin role
router.use(authMiddleware, requireRole('admin'));

router.get('/stats', getPlatformStats);
router.get('/farmers', getAllFarmers);
router.get('/consumers', getAllConsumers);
router.get('/orders', getAllOrders);

export default router;
