import { Request, Response } from 'express';
import { createResponse } from '../utils/response';
import { uploadProductImageService, uploadProfileImageService } from '../services/upload.service';

export async function uploadProductImage(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'farmer') {
      res.json(createResponse(false, 'Only farmers can upload product images', null, { auth: 'Insufficient permissions' }));
      return;
    }

    if (!req.file) {
      res.json(createResponse(false, 'No file provided', null, { file: 'File is required' }));
      return;
    }

    const result = await uploadProductImageService(req.user!.id, req.file);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Failed to upload image', null, { server: String(e) }));
  }
}

export async function uploadProfileImage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.json(createResponse(false, 'No file provided', null, { file: 'File is required' }));
      return;
    }

    const result = await uploadProfileImageService(req.user!.id, req.file);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Failed to upload profile image', null, { server: String(e) }));
  }
}
