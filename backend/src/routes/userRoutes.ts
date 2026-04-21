import express from 'express';
import { getMe, updateMe, getPreferences, updatePreferences } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Aligned with frontend expectations
router.get('/profile', getMe);
router.patch('/profile', updateMe);
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);

// Keeping /me for compatibility
router.get('/me', getMe);

export default router;
