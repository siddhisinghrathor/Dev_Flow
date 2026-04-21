import express from 'express';
import { getDailyLogs } from '../controllers/logController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getDailyLogs);

export default router;
