import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { sendSuccess } from '../utils/response.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Get the active playlist for the user
    const activePlaylist = await prisma.playlist.findFirst({
      where: { userId: req.user.id, isActive: true },
      include: { tasks: true }
    });

    let currentDay = 0;
    if (activePlaylist && activePlaylist.startDate) {
      const start = new Date(activePlaylist.startDate);
      const today = new Date();
      currentDay = Math.floor(Math.abs(today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    // 2. Fetch all tasks for the user
    const allTasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Separate them
    // Normal tasks: Either have no playlistId OR belong to a non-active playlist
    const tasks = allTasks.filter((t: { playlistId: any; }) => !t.playlistId || t.playlistId !== activePlaylist?.id);

    // Playlist tasks: Belong to active playlist AND match currentDay
    const playlistTasks = allTasks
      .filter((t: { playlistId: any; playlistDayIndex: number; }) => t.playlistId === activePlaylist?.id && t.playlistDayIndex === currentDay)
      .map((t: any) => ({ ...t, isFromPlaylist: true }));

    sendSuccess(res, {
      tasks,
      playlistTasks,
      activePlaylist: activePlaylist ? {
        id: activePlaylist.id,
        title: activePlaylist.title,
        currentDay,
        durationDays: activePlaylist.durationDays
      } : null
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, priority, status, dueDate, duration, recurrence, timeSpent, playlistId, goalId } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        category,
        priority,
        status: status || 'planned',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        duration,
        recurrence: recurrence || 'none',
        timeSpent: timeSpent || 0,
        userId: req.user.id,
        playlistId,
        goalId
      },
    });

    sendSuccess(res, task, 201);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return next(new AppError('No task found with that ID', 404));
    }

    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if task belongs to user first
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingTask) {
      return next(new AppError('No task found with that ID', 404));
    }

    const task = await prisma.task.update({
      where: {
        id: req.params.id,
      },
      data: req.body,
    });

    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingTask) {
      return next(new AppError('No task found with that ID', 404));
    }

    await prisma.task.delete({
      where: {
        id: req.params.id,
      },
    });

    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
};
