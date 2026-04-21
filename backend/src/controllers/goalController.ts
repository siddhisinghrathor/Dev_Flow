import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { sendSuccess } from '../utils/response.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getGoals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      include: { tasks: true },
    });

    sendSuccess(res, goals);
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, startDate, targetDate, category, type } = req.body;
    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        targetDate: new Date(targetDate),
        category,
        type,
        userId: req.user.id,
      },
    });

    sendSuccess(res, goal, 201);
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingGoal = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existingGoal) {
      return next(new AppError('Goal not found', 404));
    }

    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: req.body,
    });

    sendSuccess(res, goal);
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingGoal = await prisma.goal.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existingGoal) {
      return next(new AppError('Goal not found', 404));
    }

    await prisma.goal.delete({
      where: { id: req.params.id },
    });

    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
};
