import { Response } from 'express';
import { timerService } from '../services/timer.service';
import { startTimerSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class TimerController {
    startTimer = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const data = startTimerSchema.parse(req.body);
        const timer = await timerService.startTimer(userId, data);

        res.status(201).json({
            success: true,
            data: timer,
        });
    });

    getActiveTimer = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const timer = await timerService.getActiveTimer(userId);

        res.status(200).json({
            success: true,
            data: timer,
        });
    });

    pauseTimer = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { timerId } = req.params;
        const timer = await timerService.pauseTimer(userId, timerId as string);

        res.status(200).json({
            success: true,
            data: timer,
        });
    });

    resumeTimer = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { timerId } = req.params;
        const timer = await timerService.resumeTimer(userId, timerId as string);

        res.status(200).json({
            success: true,
            data: timer,
        });
    });

    stopTimer = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { timerId } = req.params;
        const { completeTask } = req.body;
        const timer = await timerService.stopTimer(userId, timerId as string, completeTask);

        res.status(200).json({
            success: true,
            data: timer,
        });
    });

    getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { taskId } = req.query;
        const history = await timerService.getTimerHistory(userId, taskId as string);

        res.status(200).json({
            success: true,
            data: history,
        });
    });

    getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const { startDate, endDate } = req.query;
        const stats = await timerService.getTimerStats(
            userId,
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );

        res.status(200).json({
            success: true,
            data: stats,
        });
    });
}

export const timerController = new TimerController();
