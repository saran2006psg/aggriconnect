import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from '../controllers/notification.controller';

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.patch('/:notification_id/read', authMiddleware, markNotificationRead);
router.delete('/:notification_id', authMiddleware, deleteNotification);

export default router;
