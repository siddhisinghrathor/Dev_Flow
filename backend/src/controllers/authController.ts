import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { sendSuccess } from '../utils/response.js';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, persona } = req.body;

    if (!username || !email || !password) {
      return next(new AppError('Please provide username, email and password', 400));
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        persona: persona || 'developer',
      },
    });

    // Create default preferences
    await prisma.userPreferences.create({
      data: { userId: user.id }
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    try {
      const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(new AppError('User no longer exists', 401));
      }

      const accessToken = generateAccessToken(user.id);

      sendSuccess(res, {
        accessToken,
      });
    } catch (err) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  sendSuccess(res, null);
};
