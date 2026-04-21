import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

interface AuthRequest extends Request {
  user?: any;
}

export const generatePlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    // Get recently completed tasks
    const recentlyCompleted = await prisma.task.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: 3
    });

    // Get recently planned/suggested tasks
    const suggestedTasks = await prisma.task.findMany({
      where: { userId, status: 'suggested' },
      take: 2
    });

    // Create a "smart" recommendation based on recently completed
    let recommendations = [];
    if (recentlyCompleted.length > 0) {
      const lastCategory = recentlyCompleted[0].category;
      recommendations.push({
        title: `Deep dive into ${lastCategory} (Follow-up)`,
        category: lastCategory,
        priority: 'high',
        status: 'suggested',
        description: `Based on your recent completion of "${recentlyCompleted[0].title}".`
      });
    } else {
      recommendations.push({
        title: "Start your first coding sprint",
        category: "general",
        priority: "medium",
        status: "suggested",
        description: "Consistency is key! Complete one task today."
      });
    }

    const plan = [
      ...recentlyCompleted.map((t: any) => ({ ...t, type: 'completed_today' })),
      ...suggestedTasks,
      ...recommendations
    ];

    sendSuccess(res, plan);
  } catch (error) {
    next(error);
  }
};
