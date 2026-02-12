import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updatePreferences);
router.patch('/preferences', userController.updatePreferences);
router.get('/stats', userController.getStats);

export default router;
