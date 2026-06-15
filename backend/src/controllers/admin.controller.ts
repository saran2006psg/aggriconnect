import { Request, Response } from 'express';
import { createResponse, createPaginatedResponse } from '../utils/response';
import {
  getPlatformStatsService,
  getAllFarmersService,
  getAllConsumersService,
  getAllOrdersService,
} from '../services/admin.service';

export async function getPlatformStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await getPlatformStatsService();
    res.json(createResponse(true, 'Statistics retrieved successfully', stats));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve statistics', null, { server: String(e) }));
  }
}

export async function getAllFarmers(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const perPage = parseInt((req.query.perPage as string) ?? '20', 10);
    const { items, total } = await getAllFarmersService(page, perPage);
    res.json(createPaginatedResponse(items, page, perPage, total, 'Farmers retrieved successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve farmers', null, { server: String(e) }));
  }
}

export async function getAllConsumers(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const perPage = parseInt((req.query.perPage as string) ?? '20', 10);
    const { items, total } = await getAllConsumersService(page, perPage);
    res.json(createPaginatedResponse(items, page, perPage, total, 'Consumers retrieved successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve consumers', null, { server: String(e) }));
  }
}

export async function getAllOrders(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const perPage = parseInt((req.query.perPage as string) ?? '20', 10);
    const { items, total } = await getAllOrdersService(page, perPage);
    res.json(createPaginatedResponse(items, page, perPage, total, 'Orders retrieved successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve orders', null, { server: String(e) }));
  }
}
