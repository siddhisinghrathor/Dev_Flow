import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.post('/mark-read', notificationController.markAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
