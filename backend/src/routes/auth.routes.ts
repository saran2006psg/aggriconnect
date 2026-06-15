import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  login, register, googleAuth, getMe,
  refreshToken, forgotPassword, resetPassword,
} from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleAuth);
router.get('/me', authMiddleware, getMe);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
