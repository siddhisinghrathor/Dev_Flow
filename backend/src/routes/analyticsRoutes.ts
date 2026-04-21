import express from 'express';
import { getDashboardStats, getHeatmapData, getActivePlaylistDashboard } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/heatmap', getHeatmapData);
router.get('/active-playlist', getActivePlaylistDashboard);

export default router;
