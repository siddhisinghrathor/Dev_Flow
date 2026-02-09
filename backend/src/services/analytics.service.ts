import { prisma } from '../config/database';

export class AnalyticsService {
    async getDashboardStats(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        // Today's stats
        const [todayTotal, todayCompleted, todayFailed] = await Promise.all([
            prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    createdAt: { gte: today, lt: tomorrow },
                },
            }),
            prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    status: 'completed',
                    completedAt: { gte: today, lt: tomorrow },
                },
            }),
            prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    status: 'failed',
                    createdAt: { gte: today, lt: tomorrow },
                },
            }),
        ]);

        // Week stats
        const [weekTotal, weekCompleted] = await Promise.all([
            prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    createdAt: { gte: weekStart },
                },
            }),
            prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    status: 'completed',
                    completedAt: { gte: weekStart },
                },
            }),
        ]);

        // Month stats
        const [monthTotal, monthCompleted] = await Promise.all([
            prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    createdAt: { gte: monthStart },
                },
            }),
            prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    status: 'completed',
                    completedAt: { gte: monthStart },
                },
            }),
        ]);

        // Active goals
        const activeGoals = await prisma.goal.count({
            where: {
                userId,
                isCompleted: false,
            },
        });

        // Current streak
        const streak = await this.calculateStreak(userId);

        // Productivity score (0-100)
        const productivityScore = await this.calculateProductivityScore(userId);

        return {
            today: {
                total: todayTotal,
                completed: todayCompleted,
                failed: todayFailed,
                completionRate: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0,
            },
            week: {
                total: weekTotal,
                completed: weekCompleted,
                completionRate: weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0,
            },
            month: {
                total: monthTotal,
                completed: monthCompleted,
                completionRate: monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0,
            },
            activeGoals,
            streak,
            productivityScore,
        };
    }

    async getHeatmapData(userId: string, year: number) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                status: 'completed',
                completedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                completedAt: true,
            },
        });

        // Group by date
        const heatmap: Record<string, number> = {};

        tasks.forEach(task => {
            if (task.completedAt) {
                const date = task.completedAt.toISOString().split('T')[0];
                heatmap[date] = (heatmap[date] || 0) + 1;
            }
        });

        return heatmap;
    }

    async getProductivityTrends(userId: string, days: number = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                deletedAt: null,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                createdAt: true,
                completedAt: true,
                status: true,
            },
        });

        // Group by date
        const trends: Array<{
            date: string;
            created: number;
            completed: number;
            failed: number;
        }> = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const dayTasks = tasks.filter(t => {
                const createdDate = new Date(t.createdAt);
                return createdDate >= dayStart && createdDate <= dayEnd;
            });

            trends.push({
                date: dateStr,
                created: dayTasks.length,
                completed: dayTasks.filter(t => t.status === 'completed').length,
                failed: dayTasks.filter(t => t.status === 'failed').length,
            });
        }

        return trends;
    }

    async getCategoryBreakdown(userId: string, startDate?: Date, endDate?: Date) {
        const where: any = {
            userId,
            deletedAt: null,
            status: 'completed',
        };

        if (startDate || endDate) {
            where.completedAt = {};
            if (startDate) where.completedAt.gte = startDate;
            if (endDate) where.completedAt.lte = endDate;
        }

        const tasks = await prisma.task.findMany({
            where,
            select: {
                category: true,
                timeSpent: true,
            },
        });

        const breakdown: Record<string, { count: number; timeSpent: number }> = {};

        tasks.forEach(task => {
            if (!breakdown[task.category]) {
                breakdown[task.category] = { count: 0, timeSpent: 0 };
            }
            breakdown[task.category].count++;
            breakdown[task.category].timeSpent += task.timeSpent;
        });

        return breakdown;
    }

    private async calculateStreak(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let currentDate = new Date(today);

        while (true) {
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const completedTasks = await prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    status: 'completed',
                    completedAt: {
                        gte: currentDate,
                        lt: nextDay,
                    },
                },
            });

            if (completedTasks > 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }

            // Prevent infinite loop
            if (streak > 365) break;
        }

        return streak;
    }

    private async calculateProductivityScore(userId: string): Promise<number> {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const [totalTasks, completedTasks, timerSessions, goals] = await Promise.all([
            prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    createdAt: { gte: weekStart },
                },
            }),
            prisma.task.count({
                where: {
                    userId,
                    deletedAt: null,
                    status: 'completed',
                    completedAt: { gte: weekStart },
                },
            }),
            prisma.timerSession.count({
                where: {
                    userId,
                    startTime: { gte: weekStart },
                },
            }),
            prisma.goal.count({
                where: {
                    userId,
                    isCompleted: true,
                    completedAt: { gte: weekStart },
                },
            }),
        ]);

        // Weighted scoring
        const completionScore = totalTasks > 0 ? (completedTasks / totalTasks) * 40 : 0;
        const timerScore = Math.min(timerSessions * 2, 30);
        const goalScore = goals * 10;
        const streakScore = Math.min(await this.calculateStreak(userId) * 2, 20);

        const score = Math.min(Math.round(completionScore + timerScore + goalScore + streakScore), 100);

        return score;
    }

    async getWeeklySummary(userId: string) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        const [tasks, timerStats, goals] = await Promise.all([
            prisma.task.findMany({
                where: {
                    userId,
                    deletedAt: null,
                    createdAt: { gte: weekStart },
                },
                select: {
                    status: true,
                    category: true,
                    timeSpent: true,
                },
            }),
            prisma.timerSession.aggregate({
                where: {
                    userId,
                    startTime: { gte: weekStart },
                    endTime: { not: null },
                },
                _sum: {
                    totalDuration: true,
                },
                _count: true,
            }),
            prisma.goal.findMany({
                where: {
                    userId,
                    updatedAt: { gte: weekStart },
                },
                select: {
                    title: true,
                    progress: true,
                    isCompleted: true,
                },
            }),
        ]);

        const completed = tasks.filter(t => t.status === 'completed').length;
        const failed = tasks.filter(t => t.status === 'failed').length;
        const totalTime = timerStats._sum.totalDuration || 0;

        return {
            tasks: {
                total: tasks.length,
                completed,
                failed,
                completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
            },
            time: {
                totalSeconds: totalTime,
                totalHours: Math.round((totalTime / 3600) * 10) / 10,
                sessions: timerStats._count,
            },
            goals: {
                total: goals.length,
                completed: goals.filter(g => g.isCompleted).length,
                inProgress: goals.filter(g => !g.isCompleted).length,
            },
        };
    }
}

export const analyticsService = new AnalyticsService();
