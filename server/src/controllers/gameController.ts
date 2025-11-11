import { Request, Response } from 'express';
import gameService from '../services/gameService';

export const gameController = {
  // POST /api/games - Create a new game
  createGame: async (req: Request, res: Response) => {
    try {
      const { gameType, settings } = req.body;
      const hostId = req.body.userId || 'test-user-1'; // TODO: Get from auth

      if (!gameType) {
        return res.status(400).json({ error: 'gameType is required' });
      }

      const game = await gameService.createGame(hostId, gameType, settings || {});

      res.status(201).json({
        success: true,
        data: game
      });
    } catch (error: any) {
      console.error('Create game error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/games/:id - Get game details
  getGame: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string;

      const game = await gameService.getGame(id, userId);

      res.json({
        success: true,
        data: game
      });
    } catch (error: any) {
      console.error('Get game error:', error);
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // POST /api/games/:id/join - Join a game
  joinGame: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, username } = req.body;

      if (!userId || !username) {
        return res.status(400).json({ error: 'userId and username are required' });
      }

      const session = await gameService.joinGame(id, userId, username);

      res.json({
        success: true,
        data: {
          gameId: session.gameId,
          playerCount: session.players.length,
          status: session.status
        }
      });
    } catch (error: any) {
      console.error('Join game error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // POST /api/games/:id/start - Start a game
  startGame: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const session = await gameService.startGame(id, userId);

      res.json({
        success: true,
        data: {
          gameId: session.gameId,
          status: session.status,
          playerCount: session.players.length
        }
      });
    } catch (error: any) {
      console.error('Start game error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // POST /api/games/:id/play - Play a card
  playCard: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, cardId } = req.body;

      if (!userId || !cardId) {
        return res.status(400).json({ error: 'userId and cardId are required' });
      }

      const result = await gameService.playCard(id, userId, cardId);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Play card error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/games/active - List active games
  listActiveGames: async (req: Request, res: Response) => {
    try {
      const games = await gameService.listActiveGames();

      res.json({
        success: true,
        data: games
      });
    } catch (error: any) {
      console.error('List games error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};
