import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadProductImage, uploadProfileImage } from '../controllers/upload.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = Router();

router.post('/product-image', authMiddleware, upload.single('file'), uploadProductImage);
router.post('/profile-image', authMiddleware, upload.single('file'), uploadProfileImage);

export default router;
