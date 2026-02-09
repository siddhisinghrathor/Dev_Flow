import { Router } from 'express';
import { goalController } from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', goalController.createGoal);
router.get('/', goalController.getGoals);
router.get('/:goalId', goalController.getGoalById);
router.get('/:goalId/progress', goalController.getGoalProgress);
router.patch('/:goalId', goalController.updateGoal);
router.delete('/:goalId', goalController.deleteGoal);

export default router;
