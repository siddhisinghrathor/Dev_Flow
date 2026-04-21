import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorMiddleware.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getActiveTimer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('$')));
    const timer = await prisma.timer.findFirst({
      where: { 
        userId: req.user.id,
        isRunning: true 
      }
    });

    sendSuccess(res, timer);
  } catch (error) {
    next(error);
  }
};

export const startTimer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskId, durationMinutes } = req.body;

    // Pause any existing running timer for this user
    await prisma.timer.updateMany({
      where: { userId: req.user.id, isRunning: true },
      data: { isRunning: false, updatedAt: new Date() }
    });

    const timer = await prisma.timer.create({
      data: {
        userId: req.user.id,
        taskId,
        durationLimit: durationMinutes,
        isRunning: true,
        startTime: new Date()
      }
    });

    sendSuccess(res, timer);
  } catch (error) {
    next(error);
  }
};

export const pauseTimer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const timer = await prisma.timer.findUnique({
      where: { id: req.params.id }
    });

    if (!timer || timer.userId !== req.user.id) {
      return next(new AppError('Timer not found', 404));
    }

    const now = new Date();
    const elapsedSinceStart = Math.floor((now.getTime() - new Date(timer.startTime).getTime()) / 1000);
    const newElapsed = timer.elapsedAtPause + elapsedSinceStart;

    const updatedTimer = await prisma.timer.update({
      where: { id: req.params.id },
      data: {
        isRunning: false,
        elapsedAtPause: newElapsed,
        updatedAt: now
      }
    });

    sendSuccess(res, updatedTimer);
  } catch (error) {
    next(error);
  }
};

export const resumeTimer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const timer = await prisma.timer.findUnique({
      where: { id: req.params.id }
    });

    if (!timer || timer.userId !== req.user.id) {
      return next(new AppError('Timer not found', 404));
    }

    const updatedTimer = await prisma.timer.update({
      where: { id: req.params.id },
      data: {
        isRunning: true,
        startTime: new Date(),
        updatedAt: new Date()
      }
    });

    sendSuccess(res, updatedTimer);
  } catch (error) {
    next(error);
  }
};

export const stopTimer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { completeTask } = req.body;
    const timer = await prisma.timer.findUnique({
      where: { id: req.params.id }
    });

    if (!timer || timer.userId !== req.user.id) {
      return next(new AppError('Timer not found', 404));
    }

    let finalElapsed = timer.elapsedAtPause;
    if (timer.isRunning) {
      const elapsedSinceStart = Math.floor((new Date().getTime() - new Date(timer.startTime).getTime()) / 1000);
      finalElapsed += elapsedSinceStart;
    }

    // Update task time spent
    await prisma.task.update({
      where: { id: timer.taskId },
      data: {
        timeSpent: { increment: finalElapsed },
        status: completeTask ? 'completed' : undefined,
        completedAt: completeTask ? new Date() : undefined
      }
    });

    // Delete timer
    await prisma.timer.delete({
      where: { id: req.params.id }
    });

    sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};
