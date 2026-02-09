import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class AnalyticsController {
    getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const stats = await analyticsService.getDashboardStats(userId);

        res.status(200).json({
            success: true,
            data: stats,
        });
    });

    getHeatmapData = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const year = parseInt(req.query.year as string) || new Date().getFullYear();
        const heatmap = await analyticsService.getHeatmapData(userId, year);

        res.status(200).json({
            success: true,
            data: heatmap,
        });
    });

    getProductivityTrends = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const days = parseInt(req.query.days as string) || 30;
        const trends = await analyticsService.getProductivityTrends(userId, days);

        res.status(200).json({
            success: true,
            data: trends,
        });
    });

    getCategoryBreakdown = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { startDate, endDate } = req.query;

        const breakdown = await analyticsService.getCategoryBreakdown(
            userId,
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );

        res.status(200).json({
            success: true,
            data: breakdown,
        });
    });

    getWeeklySummary = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const summary = await analyticsService.getWeeklySummary(userId);

        res.status(200).json({
            success: true,
            data: summary,
        });
    });
}

export const analyticsController = new AnalyticsController();
