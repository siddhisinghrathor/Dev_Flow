import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { UpdatePreferencesInput } from '../validators/schemas';

export class UserService {
    async getUserProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                persona: true,
                dailyTarget: true,
                weeklyTarget: true,
                theme: true,
                notificationsEnabled: true,
                autoCompleteOnTimerEnd: true,
                soundEnabled: true,
                quietHoursStart: true,
                quietHoursEnd: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    async updatePreferences(userId: string, data: UpdatePreferencesInput) {
        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                username: true,
                avatar: true,
                persona: true,
                dailyTarget: true,
                weeklyTarget: true,
                theme: true,
                notificationsEnabled: true,
                autoCompleteOnTimerEnd: true,
                soundEnabled: true,
                quietHoursStart: true,
                quietHoursEnd: true,
            },
        });

        return user;
    }

    async getUserStats(userId: string) {
        const [totalTasks, completedTasks, activeGoals, totalPlaylists, achievements] = await Promise.all([
            prisma.task.count({
                where: { userId, deletedAt: null },
            }),
            prisma.task.count({
                where: { userId, deletedAt: null, status: 'completed' },
            }),
            prisma.goal.count({
                where: { userId, isCompleted: false },
            }),
            prisma.playlist.count({
                where: { userId },
            }),
            prisma.achievement.count({
                where: { userId },
            }),
        ]);

        const timerStats = await prisma.timerSession.aggregate({
            where: {
                userId,
                endTime: { not: null },
            },
            _sum: {
                totalDuration: true,
            },
        });

        const totalTimeSpent = timerStats._sum.totalDuration || 0;

        return {
            totalTasks,
            completedTasks,
            activeGoals,
            totalPlaylists,
            achievements,
            totalTimeSpent,
            totalHours: Math.round((totalTimeSpent / 3600) * 10) / 10,
        };
    }
}

export const userService = new UserService();
