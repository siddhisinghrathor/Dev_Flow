import { Router } from 'express';
import { playlistController } from '../controllers/playlist.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', playlistController.createPlaylist);
router.get('/', playlistController.getPlaylists);
router.get('/:playlistId', playlistController.getPlaylistById);
router.get('/:playlistId/progress', playlistController.getProgress);
router.patch('/:playlistId', playlistController.updatePlaylist);
router.delete('/:playlistId', playlistController.deletePlaylist);

router.post('/:playlistId/tasks', playlistController.addTask);
router.delete('/:playlistId/tasks/:taskId', playlistController.removeTask);
router.post('/:playlistId/clone', playlistController.clonePlaylist);

export default router;
