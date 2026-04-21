import express from 'express';
import { generatePlan } from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/generate', generatePlan);

export default router;
