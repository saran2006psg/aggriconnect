import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import bulkOrderRoutes from './bulkOrder.routes';
import subscriptionRoutes from './subscription.routes';
import reviewRoutes from './review.routes';
import notificationRoutes from './notification.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/bulk-orders', bulkOrderRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
