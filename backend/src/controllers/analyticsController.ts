import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

interface AuthRequest extends Request {
  user?: any;
}

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Today stats
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const todayTasks = await prisma.task.findMany({
      where: { userId, createdAt: { gte: todayStart, lte: todayEnd } }
    });
    const todayCompleted = todayTasks.filter((t: { status: string; }) => t.status === 'completed').length;
    const todayFailed = todayTasks.filter((t: { status: string; }) => t.status === 'failed').length;
    const todayTotal = todayTasks.length;
    const todayRate = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;

    // Week stats
    const weekStart = startOfWeek(now);
    const weekTasks = await prisma.task.findMany({
      where: { userId, createdAt: { gte: weekStart } }
    });
    const weekCompleted = weekTasks.filter((t: { status: string; }) => t.status === 'completed').length;
    const weekTotal = weekTasks.length;
    const weekRate = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;

    // Month stats
    const monthStart = startOfMonth(now);
    const monthTasks = await prisma.task.findMany({
      where: { userId, createdAt: { gte: monthStart } }
    });
    const monthCompleted = monthTasks.filter((t: { status: string; }) => t.status === 'completed').length;
    const monthTotal = monthTasks.length;
    const monthRate = monthTotal > 0 ? (monthCompleted / monthTotal) * 100 : 0;

    // Productivity Score (All time)
    const allTasksCount = await prisma.task.count({ where: { userId } });
    const allCompletedCount = await prisma.task.count({ where: { userId, status: 'completed' } });
    const productivityScore = allTasksCount > 0 ? (allCompletedCount / allTasksCount) * 100 : 0;

    // Streak calculation (simple version based on daily logs)
    const logs = await prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30
    });
    
    let streak = 0;
    let current = startOfDay(now);
    for (const log of logs) {
      const logDate = startOfDay(new Date(log.date));
      if (logDate.getTime() === current.getTime() || logDate.getTime() === subDays(current, 1).getTime()) {
        if (log.completedTaskIds.length > 0) {
          streak++;
          current = logDate;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    sendSuccess(res, {
      today: { total: todayTotal, completed: todayCompleted, failed: todayFailed, completionRate: todayRate },
      week: { total: weekTotal, completed: weekCompleted, completionRate: weekRate },
      month: { total: monthTotal, completed: monthCompleted, completionRate: monthRate },
      streak,
      productivityScore
    });
  } catch (error) {
    next(error);
  }
};

export const getHeatmapData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const logs = await prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    const heatmap: Record<string, number> = {};
    logs.forEach((log: { date: { toISOString: () => string; }; completedTaskIds: string | any[]; }) => {
      const dateStr = log.date.toISOString().split('T')[0];
      heatmap[dateStr] = (heatmap[dateStr] || 0) + log.completedTaskIds.length;
    });

    sendSuccess(res, heatmap);
  } catch (error) {
    next(error);
  }
};

export const getActivePlaylistDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const activePlaylist = await prisma.playlist.findFirst({
      where: { userId, isActive: true },
      include: { tasks: true }
    });

    if (!activePlaylist) {
      return sendSuccess(res, null);
    }

    let currentDay = 0;
    if (activePlaylist.startDate) {
      const start = new Date(activePlaylist.startDate);
      const today = new Date();
      currentDay = Math.floor(Math.abs(today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    const todayTasks = activePlaylist.tasks.filter((t: { playlistDayIndex: number; }) => t.playlistDayIndex === currentDay);
    const progressPercentage = (currentDay / activePlaylist.durationDays) * 100;
    const daysRemaining = activePlaylist.durationDays - currentDay;

    sendSuccess(res, {
      playlist: {
        id: activePlaylist.id,
        title: activePlaylist.title,
        durationDays: activePlaylist.durationDays,
        currentDay,
        progressPercentage,
        daysRemaining
      },
      todayTasks
    });
  } catch (error) {
    next(error);
  }
};
