import express from 'express';
import { gameController } from '../controllers/gameController';

const router = express.Router();

// Game routes
router.post('/', gameController.createGame);
router.get('/active', gameController.listActiveGames);
router.get('/:id', gameController.getGame);
router.post('/:id/join', gameController.joinGame);
router.post('/:id/start', gameController.startGame);
router.post('/:id/play', gameController.playCard);

export default router;
