import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { activityLogService } from './activityLog.service';
import { CreateTaskInput } from '../validators/schemas';

export class PlaylistService {
    async createPlaylist(userId: string, data: any) {
        const { tasks, ...playlistData } = data;
        const playlist = await prisma.playlist.create({
            data: {
                ...playlistData,
                userId,
                tasks: tasks ? {
                    create: tasks.map((t: any) => ({
                        title: t.title,
                        description: t.description,
                        category: t.category,
                        priority: t.priority || 'medium',
                        duration: t.duration,
                        playlistDayIndex: t.dayIndex,
                        userId,
                        status: 'planned'
                    }))
                } : undefined
            },
            include: {
                tasks: true
            }
        });

        await activityLogService.log({
            userId,
            action: 'playlist_created',
            entityType: 'playlist',
            entityId: playlist.id,
            metadata: { title: playlist.title },
        });

        return playlist;
    }

    async getPlaylists(userId: string) {
        const playlists = await prisma.playlist.findMany({
            where: { userId },
            include: {
                tasks: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        category: true,
                        priority: true,
                        duration: true,
                        playlistDayIndex: true,
                    } as any,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return playlists;
    }

    async getPlaylistById(userId: string, playlistId: string) {
        const playlist = await prisma.playlist.findFirst({
            where: {
                id: playlistId,
                userId,
            },
            include: {
                tasks: {
                    where: { deletedAt: null },
                    orderBy: [
                        { status: 'asc' },
                        { priority: 'desc' },
                    ],
                },
            },
        });

        if (!playlist) {
            throw new AppError('Playlist not found', 404);
        }

        return playlist;
    }

    async updatePlaylist(userId: string, playlistId: string, data: any) {
        await this.getPlaylistById(userId, playlistId); // Verify ownership

        const { tasks, ...playlistData } = data;

        const playlist = await prisma.playlist.update({
            where: { id: playlistId },
            data: playlistData,
            include: {
                tasks: {
                    where: { deletedAt: null },
                },
            },
        });

        return playlist;
    }

    async deletePlaylist(userId: string, playlistId: string) {
        await this.getPlaylistById(userId, playlistId); // Verify ownership

        // Unlink tasks from playlist
        await prisma.task.updateMany({
            where: { playlistId },
            data: { playlistId: null },
        });

        // Delete playlist
        await prisma.playlist.delete({
            where: { id: playlistId },
        });

        await activityLogService.log({
            userId,
            action: 'playlist_deleted',
            entityType: 'playlist',
            entityId: playlistId,
        });

        return { message: 'Playlist deleted successfully' };
    }

    async addTaskToPlaylist(userId: string, playlistId: string, taskData: CreateTaskInput) {
        await this.getPlaylistById(userId, playlistId); // Verify ownership

        const task = await prisma.task.create({
            data: {
                ...taskData,
                userId,
                playlistId,
                status: 'planned',
            },
        });

        return task;
    }

    async removeTaskFromPlaylist(userId: string, playlistId: string, taskId: string) {
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId,
                playlistId,
            },
        });

        if (!task) {
            throw new AppError('Task not found in this playlist', 404);
        }

        await prisma.task.update({
            where: { id: taskId },
            data: { playlistId: null },
        });

        return { message: 'Task removed from playlist' };
    }

    async clonePlaylist(userId: string, playlistId: string, newTitle?: string) {
        const originalPlaylist = await this.getPlaylistById(userId, playlistId);

        // Create new playlist
        const newPlaylist = await prisma.playlist.create({
            data: {
                userId,
                title: newTitle || `${originalPlaylist.title} (Copy)`,
                description: originalPlaylist.description,
                category: originalPlaylist.category,
            },
        });

        // Clone tasks
        const tasksToClone = originalPlaylist.tasks.map(task => ({
            userId,
            playlistId: newPlaylist.id,
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            duration: task.duration,
            recurrence: task.recurrence,
            status: 'planned',
        }));

        await prisma.task.createMany({
            data: tasksToClone,
        });

        await activityLogService.log({
            userId,
            action: 'playlist_cloned',
            entityType: 'playlist',
            entityId: newPlaylist.id,
            metadata: { originalId: playlistId },
        });

        return await this.getPlaylistById(userId, newPlaylist.id);
    }

    async getPlaylistProgress(userId: string, playlistId: string) {
        const playlist = await this.getPlaylistById(userId, playlistId);

        const totalTasks = playlist.tasks.length;
        const completedTasks = playlist.tasks.filter(t => t.status === 'completed').length;
        const failedTasks = playlist.tasks.filter(t => t.status === 'failed').length;
        const pendingTasks = playlist.tasks.filter(t => t.status === 'planned').length;

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            playlistId: playlist.id,
            title: playlist.title,
            progress,
            totalTasks,
            completedTasks,
            failedTasks,
            pendingTasks,
        };
    }
}

export const playlistService = new PlaylistService();
