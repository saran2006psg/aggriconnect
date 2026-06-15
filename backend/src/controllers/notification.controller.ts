import { Request, Response } from 'express';
import { createResponse } from '../utils/response';
import {
  getNotificationsService,
  markNotificationReadService,
  deleteNotificationService,
  markAllNotificationsReadService,
} from '../services/notification.service';

export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const unread = req.query.unread === 'true';
    const limit = parseInt((req.query.limit as string) ?? '50', 10);
    const data = await getNotificationsService(req.user!.id, unread, limit);
    res.json(createResponse(true, 'Notifications retrieved successfully', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to retrieve notifications', null, { server: String(e) }));
  }
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  try {
    const data = await markNotificationReadService(req.params.notification_id, req.user!.id);
    res.json(createResponse(true, 'Notification marked as read', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to mark notification as read', null, { server: String(e) }));
  }
}

export async function deleteNotification(req: Request, res: Response): Promise<void> {
  try {
    await deleteNotificationService(req.params.notification_id, req.user!.id);
    res.json(createResponse(true, 'Notification deleted successfully'));
  } catch (e) {
    res.json(createResponse(false, 'Failed to delete notification', null, { server: String(e) }));
  }
}

export async function markAllNotificationsRead(req: Request, res: Response): Promise<void> {
  try {
    const data = await markAllNotificationsReadService(req.user!.id);
    res.json(createResponse(true, 'All notifications marked as read', data));
  } catch (e) {
    res.json(createResponse(false, 'Failed to mark all notifications as read', null, { server: String(e) }));
  }
}
