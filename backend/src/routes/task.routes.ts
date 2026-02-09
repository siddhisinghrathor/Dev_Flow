import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(authenticate);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/today', taskController.getTodayTasks);
router.get('/active', taskController.getActiveTask);
router.get('/stats', taskController.getTaskStats);
router.get('/:taskId', taskController.getTaskById);
router.patch('/:taskId', taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);
router.post('/bulk-update', taskController.bulkUpdateStatus);

export default router;
