import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../validators/schemas';
import { activityLogService } from './activityLog.service';

export class TaskService {
    async createTask(userId: string, data: CreateTaskInput) {
        const task = await prisma.task.create({
            data: {
                ...data,
                userId,
                status: 'planned',
            },
            include: {
                goal: true,
                playlist: true,
            },
        });

        // Log activity
        await activityLogService.log({
            userId,
            action: 'task_created',
            entityType: 'task',
            entityId: task.id,
            taskId: task.id,
            metadata: { title: task.title, category: task.category },
        });

        return task;
    }

    async getTasks(userId: string, query: TaskQueryInput = {}) {
        const {
            status,
            category,
            priority,
            goalId,
            playlistId,
            startDate,
            endDate,
            page = 1,
            limit = 50,
        } = query;

        const where: any = {
            userId,
            deletedAt: null,
        };

        if (status) where.status = status;
        if (category) where.category = category;
        if (priority) where.priority = priority;
        if (goalId) where.goalId = goalId;
        if (playlistId) where.playlistId = playlistId;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                include: {
                    goal: { select: { id: true, title: true } },
                    playlist: { select: { id: true, title: true } },
                },
                orderBy: [
                    { status: 'asc' },
                    { priority: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.task.count({ where }),
        ]);

        return {
            tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getTaskById(userId: string, taskId: string) {
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId,
                deletedAt: null,
            },
            include: {
                goal: true,
                playlist: true,
                timerSessions: {
                    orderBy: { startTime: 'desc' },
                    take: 10,
                },
            },
        });

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        return task;
    }

    async getTodayTasks(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                OR: [
                    {
                        scheduledFor: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                    {
                        scheduledFor: null,
                        createdAt: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                ],
            },
            include: {
                goal: { select: { id: true, title: true } },
            },
            orderBy: [
                { status: 'asc' },
                { priority: 'desc' },
            ],
        });

        return tasks;
    }

    async getActiveTask(userId: string) {
        const activeTimer = await prisma.timerSession.findFirst({
            where: {
                userId,
                isRunning: true,
            },
            include: {
                task: {
                    include: {
                        goal: { select: { id: true, title: true } },
                    },
                },
            },
        });

        return activeTimer;
    }

    async updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
        const existingTask = await this.getTaskById(userId, taskId);

        const task = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...data,
                ...(data.status === 'completed' && !existingTask.completedAt
                    ? { completedAt: new Date() }
                    : {}),
            },
            include: {
                goal: true,
                playlist: true,
            },
        });

        // Log status changes
        if (data.status && data.status !== existingTask.status) {
            await activityLogService.log({
                userId,
                action: `task_${data.status}`,
                entityType: 'task',
                entityId: task.id,
                taskId: task.id,
                metadata: {
                    previousStatus: existingTask.status,
                    newStatus: data.status,
                },
            });

            // Update goal progress if task is completed
            if (data.status === 'completed' && task.goalId) {
                await this.updateGoalProgress(task.goalId);
            }
        }

        return task;
    }

    async deleteTask(userId: string, taskId: string) {
        await this.getTaskById(userId, taskId); // Verify ownership

        // Soft delete
        await prisma.task.update({
            where: { id: taskId },
            data: { deletedAt: new Date() },
        });

        await activityLogService.log({
            userId,
            action: 'task_deleted',
            entityType: 'task',
            entityId: taskId,
        });

        return { message: 'Task deleted successfully' };
    }

    async bulkUpdateStatus(userId: string, taskIds: string[], status: string) {
        const tasks = await prisma.task.updateMany({
            where: {
                id: { in: taskIds },
                userId,
                deletedAt: null,
            },
            data: {
                status,
                ...(status === 'completed' ? { completedAt: new Date() } : {}),
            },
        });

        // Update goal progress for affected goals
        const affectedTasks = await prisma.task.findMany({
            where: { id: { in: taskIds } },
            select: { goalId: true },
        });

        const goalIds = [...new Set(affectedTasks.map(t => t.goalId).filter(Boolean))] as string[];

        for (const goalId of goalIds) {
            await this.updateGoalProgress(goalId);
        }

        return { updated: tasks.count };
    }

    private async updateGoalProgress(goalId: string) {
        const goal = await prisma.goal.findUnique({
            where: { id: goalId },
            include: {
                tasks: {
                    where: { deletedAt: null },
                },
            },
        });

        if (!goal || goal.tasks.length === 0) return;

        const completedTasks = goal.tasks.filter(t => t.status === 'completed').length;
        const progress = Math.round((completedTasks / goal.tasks.length) * 100);

        await prisma.goal.update({
            where: { id: goalId },
            data: {
                progress,
                isCompleted: progress === 100,
                ...(progress === 100 && !goal.completedAt ? { completedAt: new Date() } : {}),
            },
        });
    }

    async getTaskStats(userId: string, startDate?: Date, endDate?: Date) {
        const where: any = {
            userId,
            deletedAt: null,
        };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const [total, completed, failed, skipped, planned] = await Promise.all([
            prisma.task.count({ where }),
            prisma.task.count({ where: { ...where, status: 'completed' } }),
            prisma.task.count({ where: { ...where, status: 'failed' } }),
            prisma.task.count({ where: { ...where, status: 'skipped' } }),
            prisma.task.count({ where: { ...where, status: 'planned' } }),
        ]);

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            failed,
            skipped,
            planned,
            completionRate,
        };
    }
}

export const taskService = new TaskService();
