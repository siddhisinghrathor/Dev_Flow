import express from 'express';
import { getActiveTimer, startTimer, pauseTimer, resumeTimer, stopTimer } from '../controllers/timerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveTimer);
router.post('/start', startTimer);
router.post('/pause/:id', pauseTimer);
router.post('/resume/:id', resumeTimer);
router.post('/stop/:id', stopTimer);

export default router;
