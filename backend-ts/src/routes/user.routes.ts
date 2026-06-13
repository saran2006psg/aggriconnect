import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  updateProfile,
  getAddresses, createAddress,
  updateAddress, deleteAddress,
} from '../controllers/user.controller';

const router = Router();

router.put('/profile', authMiddleware, updateProfile);
router.get('/addresses', authMiddleware, getAddresses);
router.post('/addresses', authMiddleware, createAddress);
router.put('/addresses/:address_id', authMiddleware, updateAddress);
router.delete('/addresses/:address_id', authMiddleware, deleteAddress);

export default router;
