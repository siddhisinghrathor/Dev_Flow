import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CreateGoalInput, UpdateGoalInput } from '../validators/schemas';
import { activityLogService } from './activityLog.service';

export class GoalService {
    async createGoal(userId: string, data: CreateGoalInput) {
        const goal = await prisma.goal.create({
            data: {
                ...data,
                userId,
                startDate: new Date(data.startDate),
                targetDate: new Date(data.targetDate),
            },
            include: {
                tasks: true,
            },
        });

        await activityLogService.log({
            userId,
            action: 'goal_created',
            entityType: 'goal',
            entityId: goal.id,
            metadata: { title: goal.title, type: goal.type },
        });

        return goal;
    }

    async getGoals(userId: string, includeCompleted: boolean = false) {
        const where: any = { userId };

        if (!includeCompleted) {
            where.isCompleted = false;
        }

        const goals = await prisma.goal.findMany({
            where,
            include: {
                tasks: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true,
                        category: true,
                    },
                },
            },
            orderBy: [
                { isCompleted: 'asc' },
                { targetDate: 'asc' },
            ],
        });

        return goals;
    }

    async getGoalById(userId: string, goalId: string) {
        const goal = await prisma.goal.findFirst({
            where: {
                id: goalId,
                userId,
            },
            include: {
                tasks: {
                    where: { deletedAt: null },
                    orderBy: [
                        { status: 'asc' },
                        { priority: 'desc' },
                    ],
                },
            },
        });

        if (!goal) {
            throw new AppError('Goal not found', 404);
        }

        return goal;
    }

    async updateGoal(userId: string, goalId: string, data: UpdateGoalInput) {
        await this.getGoalById(userId, goalId); // Verify ownership

        const updateData: any = { ...data };

        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.targetDate) updateData.targetDate = new Date(data.targetDate);

        const goal = await prisma.goal.update({
            where: { id: goalId },
            data: updateData,
            include: {
                tasks: {
                    where: { deletedAt: null },
                },
            },
        });

        if (data.isCompleted && !goal.completedAt) {
            await prisma.goal.update({
                where: { id: goalId },
                data: { completedAt: new Date() },
            });

            await activityLogService.log({
                userId,
                action: 'goal_completed',
                entityType: 'goal',
                entityId: goalId,
            });
        }

        return goal;
    }

    async deleteGoal(userId: string, goalId: string) {
        await this.getGoalById(userId, goalId); // Verify ownership

        // Unlink tasks from goal
        await prisma.task.updateMany({
            where: { goalId },
            data: { goalId: null },
        });

        // Delete goal
        await prisma.goal.delete({
            where: { id: goalId },
        });

        await activityLogService.log({
            userId,
            action: 'goal_deleted',
            entityType: 'goal',
            entityId: goalId,
        });

        return { message: 'Goal deleted successfully' };
    }

    async getGoalProgress(userId: string, goalId: string) {
        const goal = await this.getGoalById(userId, goalId);

        const totalTasks = goal.tasks.length;
        const completedTasks = goal.tasks.filter(t => t.status === 'completed').length;
        const failedTasks = goal.tasks.filter(t => t.status === 'failed').length;
        const pendingTasks = goal.tasks.filter(t => t.status === 'planned').length;

        const daysRemaining = Math.ceil(
            (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
            goalId: goal.id,
            title: goal.title,
            progress: goal.progress,
            totalTasks,
            completedTasks,
            failedTasks,
            pendingTasks,
            daysRemaining,
            isCompleted: goal.isCompleted,
        };
    }
}

export const goalService = new GoalService();
