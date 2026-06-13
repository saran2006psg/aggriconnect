import { Request, Response } from 'express';
import { createResponse, createPaginatedResponse } from '../utils/response';
import {
  createBulkOrderService,
  getBulkOrdersService,
  getBulkOrderService,
  respondToBulkOrderService,
} from '../services/bulkOrder.service';

export async function createBulkOrder(req: Request, res: Response): Promise<void> {
  try {
    const data = await createBulkOrderService(req.user!.id, req.body);
    res.json(createResponse(true, 'Bulk order request created successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to create bulk order', null, { server: String(e) }));
  }
}

export async function getBulkOrders(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const perPage = parseInt((req.query.perPage as string) ?? '20', 10);
    const { items, total } = await getBulkOrdersService(req.user!, page, perPage);
    res.json(createPaginatedResponse(items, page, perPage, total, 'Bulk orders retrieved successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve bulk orders', null, { server: String(e) }));
  }
}

export async function getBulkOrder(req: Request, res: Response): Promise<void> {
  try {
    const data = await getBulkOrderService(req.params.bulk_order_id);
    if (!data) {
      res.json(createResponse(false, 'Bulk order not found', null, { order: 'Bulk order does not exist' }));
      return;
    }
    res.json(createResponse(true, 'Bulk order retrieved successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve bulk order', null, { server: String(e) }));
  }
}

export async function respondToBulkOrder(req: Request, res: Response): Promise<void> {
  try {
    const result = await respondToBulkOrderService(req.params.bulk_order_id, req.body, req.user!);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, 'Failed to submit response', null, { server: String(e) }));
  }
}
