import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import goalRoutes from './goal.routes';
import playlistRoutes from './playlist.routes';
import timerRoutes from './timer.routes';
import analyticsRoutes from './analytics.routes';
import userRoutes from './user.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/goals', goalRoutes);
router.use('/playlists', playlistRoutes);
router.use('/timers', timerRoutes);
router.use('/timer', timerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/user', userRoutes);
router.use('/notifications', notificationRoutes);

// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

export default router;
