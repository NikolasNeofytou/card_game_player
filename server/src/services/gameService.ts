import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import redis from '../config/redis';
import { HighCard } from '../game-engine/games/HighCard';
import { Player } from '../game-engine/BaseGame';

interface GameSession {
  gameId: string;
  gameType: string;
  hostId: string;
  players: Player[];
  status: 'waiting' | 'active' | 'completed';
  game?: HighCard;
}

class GameService {
  private activeSessions: Map<string, GameSession> = new Map();

  async createGame(hostId: string, gameType: string, settings: any) {
    const gameId = uuidv4();
    
    // Create game in database
    const result = await query(
      `INSERT INTO games (id, game_type, host_id, status, settings, state)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [gameId, gameType, hostId, 'waiting', JSON.stringify(settings), JSON.stringify({})]
    );

    // Create session
    const session: GameSession = {
      gameId,
      gameType,
      hostId,
      players: [],
      status: 'waiting'
    };

    this.activeSessions.set(gameId, session);

    // Cache in Redis
    await redis.setex(
      `game:${gameId}`,
      3600,
      JSON.stringify(session)
    );

    console.log('Game created:', { gameId, hostId, gameType });
    return { gameId, ...session };
  }

  async joinGame(gameId: string, userId: string, username: string) {
    const session = this.activeSessions.get(gameId);
    
    if (!session) {
      throw new Error('Game not found');
    }

    if (session.status !== 'waiting') {
      throw new Error('Game already started');
    }

    if (session.players.some(p => p.id === userId)) {
      throw new Error('Already in game');
    }

    // Add player to session
    const player: Player = {
      id: userId,
      username,
      hand: [],
      score: 0
    };

    session.players.push(player);

    // Add to database
    await query(
      `INSERT INTO game_players (game_id, user_id, position, score)
       VALUES ($1, $2, $3, $4)`,
      [gameId, userId, session.players.length - 1, 0]
    );

    // Update cache
    await redis.setex(
      `game:${gameId}`,
      3600,
      JSON.stringify(session)
    );

    console.log('Player joined game:', { gameId, userId, username });
    return session;
  }

  async startGame(gameId: string, userId: string) {
    const session = this.activeSessions.get(gameId);
    
    if (!session) {
      throw new Error('Game not found');
    }

    if (session.hostId !== userId) {
      throw new Error('Only host can start game');
    }

    if (session.players.length < 2) {
      throw new Error('Need at least 2 players');
    }

    if (session.status !== 'waiting') {
      throw new Error('Game already started');
    }

    // Create game instance
    const game = new HighCard(gameId, session.players, {
      maxPlayers: 4
    });

    game.startGame();
    session.game = game;
    session.status = 'active';

    // Update database
    await query(
      `UPDATE games SET status = $1, started_at = NOW(), state = $2 WHERE id = $3`,
      ['active', JSON.stringify(game.getState()), gameId]
    );

    // Update cache
    await redis.setex(
      `game:${gameId}`,
      3600,
      JSON.stringify({
        ...session,
        game: undefined // Don't serialize game instance
      })
    );

    console.log('Game started:', { gameId, playerCount: session.players.length });
    return session;
  }

  async playCard(gameId: string, userId: string, cardId: string) {
    const session = this.activeSessions.get(gameId);
    
    if (!session || !session.game) {
      throw new Error('Game not found');
    }

    const player = session.players.find(p => p.id === userId);
    if (!player) {
      throw new Error('Player not in game');
    }

    const card = player.hand.find(c => c.id === cardId);
    if (!card) {
      throw new Error('Card not in hand');
    }

    // Execute move
    const newState = session.game.executeMove(player, {
      type: 'play_card',
      playerId: userId,
      card
    });

    // Update database
    await query(
      `UPDATE games SET state = $1 WHERE id = $2`,
      [JSON.stringify(newState), gameId]
    );

    // Check win condition
    const winner = session.game.checkWinCondition();
    if (winner) {
      session.status = 'completed';
      await query(
        `UPDATE games SET status = $1, ended_at = NOW() WHERE id = $2`,
        ['completed', gameId]
      );
    }

    console.log('Card played:', { gameId, userId, cardId });
    return {
      state: newState,
      publicState: session.game.getPublicState(userId),
      winner
    };
  }

  async getGame(gameId: string, userId?: string) {
    let session = this.activeSessions.get(gameId);
    
    if (!session) {
      // Try to load from cache
      const cached = await redis.get(`game:${gameId}`);
      if (cached) {
        session = JSON.parse(cached);
        this.activeSessions.set(gameId, session!);
      }
    }

    if (!session) {
      throw new Error('Game not found');
    }

    if (userId && session.game) {
      return session.game.getPublicState(userId);
    }

    return {
      gameId: session.gameId,
      gameType: session.gameType,
      hostId: session.hostId,
      status: session.status,
      players: session.players.map(p => ({
        id: p.id,
        username: p.username,
        score: p.score
      }))
    };
  }

  async listActiveGames() {
    const games: any[] = [];
    
    for (const [gameId, session] of this.activeSessions.entries()) {
      if (session.status === 'waiting' || session.status === 'active') {
        games.push({
          gameId,
          gameType: session.gameType,
          hostId: session.hostId,
          status: session.status,
          playerCount: session.players.length,
          maxPlayers: 4
        });
      }
    }

    return games;
  }

  getSession(gameId: string): GameSession | undefined {
    return this.activeSessions.get(gameId);
  }
}

export default new GameService();
