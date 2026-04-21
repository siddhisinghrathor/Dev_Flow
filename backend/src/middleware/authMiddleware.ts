import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorMiddleware.js';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    try {
      const decoded = verifyToken(token, process.env.JWT_SECRET!) as { id: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      // Grant access to protected route
      req.user = userWithoutPassword;
      next();
    } catch (err) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
  } catch (error) {
    next(error);
  }
};
