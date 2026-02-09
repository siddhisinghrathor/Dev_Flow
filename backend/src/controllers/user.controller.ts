import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { updatePreferencesSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class UserController {
    getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const profile = await userService.getUserProfile(userId);

        res.status(200).json({
            success: true,
            data: profile,
        });
    });

    updatePreferences = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const data = updatePreferencesSchema.parse(req.body);
        const user = await userService.updatePreferences(userId, data);

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: user,
        });
    });

    getStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const stats = await userService.getUserStats(userId);

        res.status(200).json({
            success: true,
            data: stats,
        });
    });
}

export const userController = new UserController();
