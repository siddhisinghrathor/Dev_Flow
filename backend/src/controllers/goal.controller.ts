import { Response } from 'express';
import { goalService } from '../services/goal.service';
import { createGoalSchema, updateGoalSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class GoalController {
    createGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const data = createGoalSchema.parse(req.body);
        const goal = await goalService.createGoal(userId, data);

        res.status(201).json({
            success: true,
            message: 'Goal created successfully',
            data: goal,
        });
    });

    getGoals = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const includeCompleted = req.query.includeCompleted === 'true';
        const goals = await goalService.getGoals(userId, includeCompleted);

        res.status(200).json({
            success: true,
            data: goals,
        });
    });

    getGoalById = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { goalId } = req.params;
        const goal = await goalService.getGoalById(userId, goalId as string);

        res.status(200).json({
            success: true,
            data: goal,
        });
    });

    updateGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { goalId } = req.params;
        const data = updateGoalSchema.parse(req.body);
        const goal = await goalService.updateGoal(userId, goalId as string, data);

        res.status(200).json({
            success: true,
            message: 'Goal updated successfully',
            data: goal,
        });
    });

    deleteGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { goalId } = req.params;
        await goalService.deleteGoal(userId, goalId as string);

        res.status(200).json({
            success: true,
            message: 'Goal deleted successfully',
        });
    });

    getGoalProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { goalId } = req.params;
        const progress = await goalService.getGoalProgress(userId, goalId as string);

        res.status(200).json({
            success: true,
            data: progress,
        });
    });
}

export const goalController = new GoalController();
