import { prisma } from '../config/database';

interface LogActivityInput {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    taskId?: string;
    metadata?: any;
}

export class ActivityLogService {
    async log(data: LogActivityInput) {
        return await prisma.activityLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                taskId: data.taskId,
                metadata: data.metadata,
            },
        });
    }

    async getUserActivity(userId: string, limit: number = 50) {
        return await prisma.activityLog.findMany({
            where: { userId },
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}

export const activityLogService = new ActivityLogService();
