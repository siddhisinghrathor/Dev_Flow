import { prisma } from '../config/database';
import { CreateNotificationInput } from '../validators/schemas';
import { getWebSocketService } from '../websocket';

export class NotificationService {
    async createNotification(userId: string, data: CreateNotificationInput) {
        const notification = await prisma.notification.create({
            data: {
                ...data,
                userId,
                scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
            },
        });

        // If it's an immediate notification (no schedule or schedule is past/now), push via WebSocket
        if (!notification.scheduledFor || notification.scheduledFor <= new Date()) {
            try {
                const wsService = getWebSocketService();
                if (wsService.isUserOnline(userId)) {
                    wsService.broadcastNotification(userId, notification);
                }
            } catch (error) {
                // WebSocket service might not be initialized during tests or scripts
                // Just ignore in that case
            }
        }

        return notification;
    }

    async getUserNotifications(userId: string, unreadOnly: boolean = false, limit: number = 50) {
        const where: any = { userId };

        if (unreadOnly) {
            where.read = false;
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return notifications;
    }

    async markAsRead(userId: string, notificationIds: string[]) {
        await prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId,
            },
            data: { read: true },
        });

        return { message: 'Notifications marked as read' };
    }

    async deleteNotification(userId: string, notificationId: string) {
        await prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId,
            },
        });

        return { message: 'Notification deleted' };
    }

    // This method would be called by a cron job or scheduler
    async processScheduledNotifications() {
        const now = new Date();

        const scheduledNotifications = await prisma.notification.findMany({
            where: {
                scheduledFor: { lte: now },
                sentAt: null,
            },
        });

        const wsService = getWebSocketService();

        for (const notification of scheduledNotifications) {
            // Mark as sent
            await prisma.notification.update({
                where: { id: notification.id },
                data: { sentAt: now },
            });

            // Push to user
            if (wsService.isUserOnline(notification.userId)) {
                wsService.broadcastNotification(notification.userId, notification);
            }
        }

        return scheduledNotifications.length;
    }
}

export const notificationService = new NotificationService();
