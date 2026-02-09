import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
    register = asyncHandler(async (req: Request, res: Response) => {
        const data = registerSchema.parse(req.body);
        const result = await authService.register(data);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result,
        });
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const data = loginSchema.parse(req.body);
        const result = await authService.login(data);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    });

    refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = refreshTokenSchema.parse(req.body);
        const result = await authService.refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: result,
        });
    });

    logout = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const refreshToken = req.body.refreshToken;

        await authService.logout(userId, refreshToken);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    });

    getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.userId!;
        const user = await authService.getCurrentUser(userId);

        res.status(200).json({
            success: true,
            data: user,
        });
    });
}

export const authController = new AuthController();
