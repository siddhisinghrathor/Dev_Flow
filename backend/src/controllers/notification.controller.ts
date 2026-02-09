import { Response } from 'express';
import { notificationService } from '../services/notification.service';
import { createNotificationSchema, markNotificationReadSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
    createNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const data = createNotificationSchema.parse(req.body);
        const notification = await notificationService.createNotification(userId, data);

        res.status(201).json({
            success: true,
            data: notification,
        });
    });

    getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const unreadOnly = req.query.unread === 'true';
        const limit = req.query.limit ? Number(req.query.limit) : 50;

        const notifications = await notificationService.getUserNotifications(userId, unreadOnly, limit);

        res.status(200).json({
            success: true,
            data: notifications,
        });
    });

    markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { notificationIds } = markNotificationReadSchema.parse(req.body);
        const result = await notificationService.markAsRead(userId, notificationIds);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    });

    deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { notificationId } = req.params;
        const result = await notificationService.deleteNotification(userId, notificationId as string);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    });
}

export const notificationController = new NotificationController();
