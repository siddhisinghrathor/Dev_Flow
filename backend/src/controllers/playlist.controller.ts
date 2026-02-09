import { Response, NextFunction } from 'express';
import { playlistService } from '../services/playlist.service';
import { createPlaylistSchema, updatePlaylistSchema, createTaskSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class PlaylistController {
    createPlaylist = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const data = createPlaylistSchema.parse(req.body);
        const playlist = await playlistService.createPlaylist(userId, data);

        res.status(201).json({
            success: true,
            message: 'Playlist created successfully',
            data: playlist,
        });
    });

    getPlaylists = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const playlists = await playlistService.getPlaylists(userId);

        res.status(200).json({
            success: true,
            data: playlists,
        });
    });

    getPlaylistById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { playlistId } = req.params;
        const playlist = await playlistService.getPlaylistById(userId, playlistId);

        res.status(200).json({
            success: true,
            data: playlist,
        });
    });

    updatePlaylist = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { playlistId } = req.params;
        const data = updatePlaylistSchema.parse(req.body);
        const playlist = await playlistService.updatePlaylist(userId, playlistId, data);

        res.status(200).json({
            success: true,
            data: playlist,
        });
    });

    deletePlaylist = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { playlistId } = req.params;
        await playlistService.deletePlaylist(userId, playlistId);

        res.status(200).json({
            success: true,
            message: 'Playlist deleted successfully',
        });
    });

    addTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { playlistId } = req.params;
        const data = createTaskSchema.parse(req.body);
        const task = await playlistService.addTaskToPlaylist(userId, playlistId, data);

        res.status(201).json({
            success: true,
            data: task,
        });
    });

    removeTask = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { playlistId, taskId } = req.params;
        await playlistService.removeTaskFromPlaylist(userId, playlistId, taskId);

        res.status(200).json({
            success: true,
            message: 'Task removed from playlist',
        });
    });

    clonePlaylist = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { playlistId } = req.params;
        const { newTitle } = req.body;
        const playlist = await playlistService.clonePlaylist(userId, playlistId, newTitle);

        res.status(201).json({
            success: true,
            data: playlist,
        });
    });

    getProgress = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.userId!;
        const { playlistId } = req.params;
        const progress = await playlistService.getPlaylistProgress(userId, playlistId);

        res.status(200).json({
            success: true,
            data: progress,
        });
    });
}

export const playlistController = new PlaylistController();
