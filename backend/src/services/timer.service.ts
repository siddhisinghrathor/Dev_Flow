import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { StartTimerInput, UpdateTimerInput } from '../validators/schemas';
import { activityLogService } from './activityLog.service';

export class TimerService {
    async startTimer(userId: string, data: StartTimerInput) {
        // Check if there's already an active timer
        const activeTimer = await prisma.timerSession.findFirst({
            where: {
                userId,
                isRunning: true,
            },
        });

        if (activeTimer) {
            throw new AppError('You already have an active timer. Please stop it first.', 400);
        }

        // Verify task exists and belongs to user
        const task = await prisma.task.findFirst({
            where: {
                id: data.taskId,
                userId,
                deletedAt: null,
            },
        });

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        // Create timer session
        const timer = await prisma.timerSession.create({
            data: {
                userId,
                taskId: data.taskId,
                startTime: new Date(),
                durationLimit: data.durationLimit,
                isRunning: true,
            },
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        priority: true,
                    },
                },
            },
        });

        await activityLogService.log({
            userId,
            action: 'timer_started',
            entityType: 'timer',
            entityId: timer.id,
            taskId: data.taskId,
        });

        return timer;
    }

    async getActiveTimer(userId: string) {
        const timer = await prisma.timerSession.findFirst({
            where: {
                userId,
                isRunning: true,
            },
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        priority: true,
                        duration: true,
                    },
                },
            },
        });

        if (!timer) {
            return null;
        }

        // Calculate current elapsed time
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - timer.startTime.getTime()) / 1000) + timer.elapsedAtPause;

        return {
            ...timer,
            currentElapsed: elapsed,
        };
    }

    async pauseTimer(userId: string, timerId: string) {
        const timer = await prisma.timerSession.findFirst({
            where: {
                id: timerId,
                userId,
                isRunning: true,
            },
        });

        if (!timer) {
            throw new AppError('Active timer not found', 404);
        }

        const now = new Date();
        const sessionDuration = Math.floor((now.getTime() - timer.startTime.getTime()) / 1000);
        const totalElapsed = timer.elapsedAtPause + sessionDuration;

        const updatedTimer = await prisma.timerSession.update({
            where: { id: timerId },
            data: {
                isRunning: false,
                elapsedAtPause: totalElapsed,
            },
            include: {
                task: true,
            },
        });

        await activityLogService.log({
            userId,
            action: 'timer_paused',
            entityType: 'timer',
            entityId: timerId,
            taskId: timer.taskId,
            metadata: { elapsedSeconds: totalElapsed },
        });

        return updatedTimer;
    }

    async resumeTimer(userId: string, timerId: string) {
        const timer = await prisma.timerSession.findFirst({
            where: {
                id: timerId,
                userId,
                isRunning: false,
                endTime: null,
            },
        });

        if (!timer) {
            throw new AppError('Paused timer not found', 404);
        }

        const updatedTimer = await prisma.timerSession.update({
            where: { id: timerId },
            data: {
                isRunning: true,
                startTime: new Date(),
            },
            include: {
                task: true,
            },
        });

        await activityLogService.log({
            userId,
            action: 'timer_resumed',
            entityType: 'timer',
            entityId: timerId,
            taskId: timer.taskId,
        });

        return updatedTimer;
    }

    async stopTimer(userId: string, timerId: string, completeTask: boolean = false) {
        const timer = await prisma.timerSession.findFirst({
            where: {
                id: timerId,
                userId,
            },
        });

        if (!timer) {
            throw new AppError('Timer not found', 404);
        }

        const now = new Date();
        let totalDuration = timer.elapsedAtPause;

        if (timer.isRunning) {
            const sessionDuration = Math.floor((now.getTime() - timer.startTime.getTime()) / 1000);
            totalDuration += sessionDuration;
        }

        // Update timer
        const updatedTimer = await prisma.timerSession.update({
            where: { id: timerId },
            data: {
                isRunning: false,
                endTime: now,
                totalDuration,
            },
            include: {
                task: true,
            },
        });

        // Update task time spent
        await prisma.task.update({
            where: { id: timer.taskId },
            data: {
                timeSpent: {
                    increment: totalDuration,
                },
                ...(completeTask ? { status: 'completed', completedAt: now } : {}),
            },
        });

        await activityLogService.log({
            userId,
            action: 'timer_stopped',
            entityType: 'timer',
            entityId: timerId,
            taskId: timer.taskId,
            metadata: { totalDuration, taskCompleted: completeTask },
        });

        return updatedTimer;
    }

    async getTimerHistory(userId: string, taskId?: string, limit: number = 20) {
        const where: any = {
            userId,
            endTime: { not: null },
        };

        if (taskId) {
            where.taskId = taskId;
        }

        const sessions = await prisma.timerSession.findMany({
            where,
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                    },
                },
            },
            orderBy: { startTime: 'desc' },
            take: limit,
        });

        return sessions;
    }

    async getTimerStats(userId: string, startDate?: Date, endDate?: Date) {
        const where: any = {
            userId,
            endTime: { not: null },
        };

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = startDate;
            if (endDate) where.startTime.lte = endDate;
        }

        const sessions = await prisma.timerSession.findMany({
            where,
            select: {
                totalDuration: true,
                task: {
                    select: {
                        category: true,
                    },
                },
            },
        });

        const totalTime = sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
        const sessionCount = sessions.length;
        const avgSessionDuration = sessionCount > 0 ? Math.round(totalTime / sessionCount) : 0;

        // Group by category
        const byCategory: Record<string, number> = {};
        sessions.forEach(s => {
            const cat = s.task.category;
            byCategory[cat] = (byCategory[cat] || 0) + (s.totalDuration || 0);
        });

        return {
            totalTime,
            sessionCount,
            avgSessionDuration,
            byCategory,
        };
    }
}

export const timerService = new TimerService();
