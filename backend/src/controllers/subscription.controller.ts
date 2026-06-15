import { Request, Response } from 'express';
import { createResponse } from '../utils/response';
import {
  getSubscriptionsService,
  getSubscriptionByIdService,
  createSubscriptionService,
  pauseSubscriptionService,
  resumeSubscriptionService,
  cancelSubscriptionService,
} from '../services/subscription.service';

export async function getSubscriptions(req: Request, res: Response): Promise<void> {
  try {
    const data = await getSubscriptionsService(req.user!.id);
    res.json(createResponse(true, 'Subscriptions retrieved successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve subscriptions', null, { server: String(e) }));
  }
}

export async function getSubscription(req: Request, res: Response): Promise<void> {
  try {
    const data = await getSubscriptionByIdService(req.params.subscription_id, req.user!.id);
    if (!data) {
      res.status(404).json(createResponse(false, 'Subscription not found', null, { id: 'Not found' }));
      return;
    }
    res.json(createResponse(true, 'Subscription retrieved successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve subscription', null, { server: String(e) }));
  }
}

export async function createSubscription(req: Request, res: Response): Promise<void> {
  try {
    const data = await createSubscriptionService(req.user!.id, req.body);
    res.json(createResponse(true, 'Subscription created successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to create subscription', null, { server: String(e) }));
  }
}

export async function pauseSubscription(req: Request, res: Response): Promise<void> {
  try {
    const data = await pauseSubscriptionService(req.params.subscription_id, req.user!.id);
    res.json(createResponse(true, 'Subscription paused', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to pause subscription', null, { server: String(e) }));
  }
}

export async function resumeSubscription(req: Request, res: Response): Promise<void> {
  try {
    const data = await resumeSubscriptionService(req.params.subscription_id, req.user!.id);
    res.json(createResponse(true, 'Subscription resumed', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to resume subscription', null, { server: String(e) }));
  }
}

export async function cancelSubscription(req: Request, res: Response): Promise<void> {
  try {
    await cancelSubscriptionService(req.params.subscription_id, req.user!.id);
    res.json(createResponse(true, 'Subscription cancelled'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to cancel subscription', null, { server: String(e) }));
  }
}
