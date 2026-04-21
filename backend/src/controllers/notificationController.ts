import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorMiddleware.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' }
    });
    sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, message, type } = req.body;
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: req.user.id
      }
    });
    sendSuccess(res, notification, 201);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const clearNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id }
    });
    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
};
