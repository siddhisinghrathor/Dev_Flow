import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorMiddleware.js';

interface AuthRequest extends Request {
  user?: any;
}

export const createPlaylist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tasks, ...playlistData } = req.body;
    const userId = req.user.id;

    const playlist = await prisma.playlist.create({
      data: {
        ...playlistData,
        userId,
        tasks: tasks ? {
          create: tasks.map((task: any) => {
            const { dayIndex, ...rest } = task;
            return {
              ...rest,
              playlistDayIndex: dayIndex,
              userId,
              status: 'planned' // Ensure status is set if not provided
            };
          })
        } : undefined
      },
      include: { tasks: true }
    });
    sendSuccess(res, playlist, 201);
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const playlist = await prisma.playlist.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!playlist) {
      return next(new AppError('Playlist not found', 404));
    }

    await prisma.playlist.delete({
      where: { id: req.params.id }
    });

    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
};

export const setActivePlaylist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { active } = req.body; // true to activate, false to deactivate

    if (!id || id === 'undefined') {
      return next(new AppError('Invalid playlist ID', 400));
    }

    if (active) {
      // 1. Deactivate all other playlists
      await prisma.playlist.updateMany({
        where: { userId: req.user.id },
        data: { 
          isActive: false,
          status: 'draft' 
        }
      });

      // 2. Activate this one
      const playlist = await prisma.playlist.update({
        where: { id, userId: req.user.id },
        data: {
          isActive: true,
          status: 'active',
          startDate: new Date(),
          currentDay: 0
        }
      });
      sendSuccess(res, playlist);
    } else {
      // Deactivate
      const playlist = await prisma.playlist.update({
        where: { id, userId: req.user.id },
        data: {
          isActive: false,
          status: 'draft',
          startDate: null,
          currentDay: 0
        }
      });
      sendSuccess(res, playlist);
    }
  } catch (error) {
    next(error);
  }
};

export const getPlaylists = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId: req.user.id },
      include: { tasks: true },
      orderBy: { createdAt: 'desc' }
    });

    // Update currentDay for active playlists
    const updatedPlaylists = playlists.map((playlist: { status: string; startDate: string | number | Date; durationDays: number; isActive: boolean; currentDay: number; }) => {
      if (playlist.status === 'active' && playlist.startDate) {
        const start = new Date(playlist.startDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - start.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // If we've passed the duration, we could auto-complete
        if (diffDays >= playlist.durationDays) {
          playlist.status = 'completed';
          playlist.isActive = false;
        } else {
          playlist.currentDay = diffDays;
        }
      }
      return playlist;
    });

    sendSuccess(res, updatedPlaylists);
  } catch (error) {
    next(error);
  }
};
