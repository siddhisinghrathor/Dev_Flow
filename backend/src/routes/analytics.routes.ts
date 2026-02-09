import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/heatmap', analyticsController.getHeatmapData);
router.get('/trends', analyticsController.getProductivityTrends);
router.get('/category-breakdown', analyticsController.getCategoryBreakdown);
router.get('/weekly-summary', analyticsController.getWeeklySummary);

export default router;
