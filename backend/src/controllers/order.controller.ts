import { Request, Response } from 'express';
import { createResponse, createPaginatedResponse } from '../utils/response';
import {
  createOrderService,
  getOrdersService,
  getOrderService,
  updateOrderStatusService,
  cancelOrderService,
} from '../services/order.service';

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const result = await createOrderService(req.user!.id, req.body);
    res.json(createResponse(result.success, result.message, result.data ?? null, result.errors ?? null));
  } catch (e) {
    res.json(createResponse(false, `Failed to create order: ${e}`, null, { server: String(e) }));
  }
}

export async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const perPage = parseInt((req.query.perPage as string) ?? '20', 10);
    const { items, total } = await getOrdersService(req.user!, page, perPage);
    res.json(createPaginatedResponse(items, page, perPage, total, 'Orders retrieved successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve orders', null, { server: String(e) }));
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  try {
    const result = await getOrderService(req.params.order_id, req.user!);
    if (!result) {
      res.status(404).json(createResponse(false, 'Order not found', null, { order: 'Order does not exist' }));
      return;
    }
    if ('forbidden' in result && result.forbidden) {
      res.json(createResponse(false, 'Forbidden', null, { auth: 'Insufficient permissions' }));
      return;
    }
    res.json(createResponse(true, 'Order retrieved successfully', result));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve order', null, { server: String(e) }));
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const result = await updateOrderStatusService(req.params.order_id, req.body, req.user!);
    if (!result.found) {
      res.status(404).json(createResponse(false, 'Order not found', null, { order: 'Order does not exist' }));
      return;
    }
    if ('invalidStatus' in result && result.invalidStatus) {
      res.status(400).json(createResponse(false, 'Invalid order status', null, { status: 'Invalid status value' }));
      return;
    }
    if (result.forbidden) {
      res.status(403).json(createResponse(false, 'Forbidden', null, { auth: 'Insufficient permissions' }));
      return;
    }
    res.json(createResponse(true, 'Order status updated', result.data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to update order status', null, { server: String(e) }));
  }
}

export async function cancelOrder(req: Request, res: Response): Promise<void> {
  try {
    const result = await cancelOrderService(req.params.order_id, req.user!);
    if (!result.found) {
      res.status(404).json(createResponse(false, 'Order not found', null, { order: 'Order does not exist' }));
      return;
    }
    if (result.forbidden) {
      res.json(createResponse(false, 'Forbidden', null, { auth: 'You can only cancel your own orders' }));
      return;
    }
    if (result.alreadyTerminal) {
      res.json(createResponse(false, 'Cannot cancel order', null, { order: `Order is already ${result.currentStatus}` }));
      return;
    }
    res.json(createResponse(true, 'Order cancelled successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to cancel order', null, { server: String(e) }));
  }
}
