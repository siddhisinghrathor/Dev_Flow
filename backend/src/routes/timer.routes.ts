import { Router } from 'express';
import { timerController } from '../controllers/timer.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/start', timerController.startTimer);
router.get('/active', timerController.getActiveTimer);
router.post('/:timerId/pause', timerController.pauseTimer);
router.post('/:timerId/resume', timerController.resumeTimer);
router.post('/:timerId/stop', timerController.stopTimer);
router.get('/history', timerController.getHistory);
router.get('/stats', timerController.getStats);

export default router;
