import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
    userId?: string;
    user?: any;
}

export const authenticate = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };

            // Attach user ID to request
            req.userId = decoded.userId;

            // Optionally fetch user data
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    avatar: true,
                    persona: true,
                },
            });

            if (!user) {
                throw new AppError('User not found', 401);
            }

            req.user = user;
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AppError('Token expired', 401);
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError('Invalid token', 401);
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

export const optionalAuth = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            try {
                const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
                req.userId = decoded.userId;
            } catch (error) {
                // Ignore errors for optional auth
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};
