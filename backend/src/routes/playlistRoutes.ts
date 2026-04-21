import express from 'express';
import { getPlaylists, createPlaylist, deletePlaylist, setActivePlaylist } from '../controllers/playlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getPlaylists);
router.post('/', createPlaylist);
router.delete('/:id', deletePlaylist);
router.patch('/:id/active', setActivePlaylist);

export default router;
