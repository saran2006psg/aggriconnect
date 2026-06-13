import { Request, Response } from 'express';
import { createResponse } from '../utils/response';
import { createReviewService, getProductReviewsService } from '../services/review.service';

export async function createReview(req: Request, res: Response): Promise<void> {
  try {
    const result = await createReviewService(req.user!.id, req.body);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Failed to create review', null, { server: String(e) }));
  }
}

export async function getProductReviews(req: Request, res: Response): Promise<void> {
  try {
    const data = await getProductReviewsService(req.params.product_id);
    res.json(createResponse(true, 'Reviews retrieved successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve reviews', null, { server: String(e) }));
  }
}
