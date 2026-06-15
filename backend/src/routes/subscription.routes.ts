import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getSubscriptions, getSubscription, createSubscription,
  pauseSubscription, resumeSubscription,
  cancelSubscription,
} from '../controllers/subscription.controller';

const router = Router();

router.get('/', authMiddleware, getSubscriptions);
router.post('/', authMiddleware, createSubscription);
router.get('/:subscription_id', authMiddleware, getSubscription);
router.patch('/:subscription_id/pause', authMiddleware, pauseSubscription);
router.patch('/:subscription_id/resume', authMiddleware, resumeSubscription);
router.delete('/:subscription_id', authMiddleware, cancelSubscription);

export default router;
