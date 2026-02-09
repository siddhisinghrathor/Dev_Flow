import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class TaskController {
    createTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const data = createTaskSchema.parse(req.body);
        const task = await taskService.createTask(userId, data);

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task,
        });
    });

    getTasks = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const query = taskQuerySchema.parse(req.query);
        const result = await taskService.getTasks(userId, query);

        res.status(200).json({
            success: true,
            data: result,
        });
    });

    getTaskById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { taskId } = req.params;
        const task = await taskService.getTaskById(userId, taskId);

        res.status(200).json({
            success: true,
            data: task,
        });
    });

    getTodayTasks = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const tasks = await taskService.getTodayTasks(userId);

        res.status(200).json({
            success: true,
            data: tasks,
        });
    });

    getActiveTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const activeTask = await taskService.getActiveTask(userId);

        res.status(200).json({
            success: true,
            data: activeTask,
        });
    });

    updateTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { taskId } = req.params;
        const data = updateTaskSchema.parse(req.body);
        const task = await taskService.updateTask(userId, taskId, data);

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    });

    deleteTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { taskId } = req.params;
        const result = await taskService.deleteTask(userId, taskId);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    });

    bulkUpdateStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { taskIds, status } = req.body;
        const result = await taskService.bulkUpdateStatus(userId, taskIds, status);

        res.status(200).json({
            success: true,
            message: 'Tasks updated successfully',
            data: result,
        });
    });

    getTaskStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { startDate, endDate } = req.query;

        const stats = await taskService.getTaskStats(
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

export const taskController = new TaskController();
