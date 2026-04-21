import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { sendSuccess } from '../utils/response.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { preferences: true },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const { password, ...userWithoutPassword } = user;

    sendSuccess(res, userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username, persona, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { username, persona, avatar },
    });

    const { password, ...userWithoutPassword } = user;

    sendSuccess(res, userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const getPreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: req.user.id },
    });

    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: { userId: req.user.id },
      });
    }

    sendSuccess(res, preferences);
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: req.user.id },
      update: req.body,
      create: { ...req.body, userId: req.user.id },
    });

    sendSuccess(res, preferences);
  } catch (error) {
    next(error);
  }
};
