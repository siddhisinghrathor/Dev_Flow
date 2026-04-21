import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getDailyLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      take: 7
    });
    sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
};
