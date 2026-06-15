import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createReview, getProductReviews } from '../controllers/review.controller';

const router = Router();

router.post('/', authMiddleware, createReview);
router.get('/product/:product_id', getProductReviews);

export default router;
