# Technical Architecture

## System Overview

The Card Game Player application follows a modern client-server architecture with real-time communication capabilities. This document details the technical architecture, component interactions, and implementation patterns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MOBILE CLIENT LAYER                          │
│                      (React Native Application)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │  Presentation  │  │     Game       │  │   Tournament   │        │
│  │     Layer      │  │     Views      │  │     Views      │        │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘        │
│           │                   │                   │                  │
│  ┌────────▼───────────────────▼───────────────────▼───────┐        │
│  │            State Management Layer                       │        │
│  │              (Redux Toolkit / Zustand)                  │        │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────────┐  │        │
│  │  │  Game   │  │  User    │  │  Tournament          │  │        │
│  │  │  State  │  │  State   │  │  State               │  │        │
│  │  └─────────┘  └──────────┘  └──────────────────────┘  │        │
│  └──────────────────────┬──────────────────────────────────┘        │
│                         │                                            │
│  ┌──────────────────────▼──────────────────────────────────┐        │
│  │               API & Service Layer                        │        │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │        │
│  │  │  WebSocket  │  │  REST API   │  │  Local Storage │  │        │
│  │  │  Client     │  │  Client     │  │  Service       │  │        │
│  │  └─────────────┘  └─────────────┘  └────────────────┘  │        │
│  └──────────────────────┬──────────────────────────────────┘        │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
                ┌─────────┴────────────┐
                │                      │
        ┌───────▼────────┐    ┌───────▼────────┐
        │   WebSocket    │    │   HTTP/HTTPS   │
        │   (Real-time)  │    │   (REST API)   │
        └───────┬────────┘    └───────┬────────┘
                │                      │
┌───────────────┴──────────────────────┴───────────────────────────────┐
│                         SERVER LAYER                                  │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      API Gateway / Load Balancer              │   │
│  │                         (NGINX / AWS ALB)                     │   │
│  └──────────────────────────┬────────────────────────────────────┘   │
│                             │                                         │
│           ┌─────────────────┼─────────────────┐                      │
│           │                 │                 │                      │
│  ┌────────▼────────┐ ┌─────▼──────┐ ┌────────▼────────┐            │
│  │   REST API      │ │ WebSocket  │ │  Auth Service   │            │
│  │   Server        │ │  Server    │ │                 │            │
│  │  (Express.js)   │ │ (Socket.io)│ │  (Firebase)     │            │
│  │                 │ │            │ │                 │            │
│  │  • User API     │ │ • Game     │ │  • JWT          │            │
│  │  • Game API     │ │   Events   │ │    Validation   │            │
│  │  • Tournament   │ │ • Room     │ │  • OAuth        │            │
│  │    API          │ │   Mgmt     │ │  • Sessions     │            │
│  └────────┬────────┘ └─────┬──────┘ └────────┬────────┘            │
│           │                 │                 │                      │
│  ┌────────▼─────────────────▼─────────────────▼────────┐            │
│  │              Business Logic Layer                     │            │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │            │
│  │  │   Game      │  │  Tournament  │  │  Matchmaking│ │            │
│  │  │   Engine    │  │   Manager    │  │  Service    │ │            │
│  │  └─────────────┘  └──────────────┘  └─────────────┘ │            │
│  └──────────────────────┬──────────────────────────────┘            │
│                         │                                            │
│  ┌──────────────────────▼──────────────────────────────────────┐   │
│  │                    Data Access Layer                         │   │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐   │   │
│  │  │  PostgreSQL  │  │    Redis    │  │   File Storage   │   │   │
│  │  │   Gateway    │  │   Gateway   │  │   (S3 Client)    │   │   │
│  │  └──────────────┘  └─────────────┘  └──────────────────┘   │   │
│  └──────────────────────┬──────────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│                    DATA LAYER                                         │
├─────────────────────────┼───────────────────────────────────────────┤
│                         │                                             │
│  ┌──────────────────────┼──────────────────────────────┐            │
│  │                      │                               │            │
│  │  ┌───────▼────────┐ ┌▼──────────┐ ┌────────▼─────┐ │            │
│  │  │  PostgreSQL    │ │   Redis   │ │      S3      │ │            │
│  │  │                │ │           │ │              │ │            │
│  │  │ • Users        │ │ • Sessions│ │ • Avatars    │ │            │
│  │  │ • Games        │ │ • Cache   │ │ • Assets     │ │            │
│  │  │ • Tournaments  │ │ • Pubsub  │ │ • Uploads    │ │            │
│  │  │ • Leaderboard  │ │ • Queues  │ │              │ │            │
│  │  └────────────────┘ └───────────┘ └──────────────┘ │            │
│  └─────────────────────────────────────────────────────┘            │
└───────────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (React Native)

### 1. Component Structure

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── game/                # Game-specific components
│   │   ├── GameBoard.tsx
│   │   ├── PlayerHand.tsx
│   │   ├── ScoreBoard.tsx
│   │   └── CardPile.tsx
│   └── tournament/          # Tournament components
│       ├── Bracket.tsx
│       ├── TournamentCard.tsx
│       └── MatchSchedule.tsx
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── game/
│   │   ├── LobbyScreen.tsx
│   │   ├── GameScreen.tsx
│   │   └── GameOverScreen.tsx
│   ├── tournament/
│   │   ├── TournamentListScreen.tsx
│   │   ├── TournamentDetailScreen.tsx
│   │   └── CreateTournamentScreen.tsx
│   └── profile/
│       ├── ProfileScreen.tsx
│       └── StatsScreen.tsx
├── store/                   # State management
│   ├── slices/
│   │   ├── gameSlice.ts
│   │   ├── userSlice.ts
│   │   ├── tournamentSlice.ts
│   │   └── lobbySlice.ts
│   └── index.ts
├── services/                # API & external services
│   ├── api/
│   │   ├── gameApi.ts
│   │   ├── userApi.ts
│   │   └── tournamentApi.ts
│   ├── websocket/
│   │   └── socketService.ts
│   └── storage/
│       └── localStorageService.ts
├── hooks/                   # Custom React hooks
│   ├── useGame.ts
│   ├── useSocket.ts
│   └── useAuth.ts
├── utils/                   # Utility functions
│   ├── validation.ts
│   ├── formatters.ts
│   └── constants.ts
├── animations/              # Animation configurations
│   ├── cardAnimations.ts
│   └── transitionAnimations.ts
└── types/                   # TypeScript type definitions
    ├── game.ts
    ├── user.ts
    └── tournament.ts
```

### 2. State Management Pattern

Using Redux Toolkit with RTK Query for API calls:

```typescript
// gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  sessionId: string | null;
  players: Player[];
  currentTurn: string;
  gameState: 'waiting' | 'active' | 'finished';
  myCards: Card[];
  boardCards: Card[];
  scores: Record<string, number>;
}

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    sessionId: null,
    players: [],
    currentTurn: '',
    gameState: 'waiting',
    myCards: [],
    boardCards: [],
    scores: {}
  } as GameState,
  reducers: {
    setSession: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    updateGameState: (state, action: PayloadAction<Partial<GameState>>) => {
      return { ...state, ...action.payload };
    },
    playCard: (state, action: PayloadAction<Card>) => {
      state.myCards = state.myCards.filter(c => c.id !== action.payload.id);
      state.boardCards.push(action.payload);
    }
  }
});

export const { setSession, updateGameState, playCard } = gameSlice.actions;
export default gameSlice.reducer;
```

### 3. WebSocket Integration

```typescript
// socketService.ts
import io, { Socket } from 'socket.io-client';
import { store } from '../store';
import { updateGameState } from '../store/slices/gameSlice';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.WEBSOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('game_state_updated', (data) => {
      store.dispatch(updateGameState(data));
    });

    this.socket.on('player_joined', (player) => {
      // Handle player joined
    });

    this.socket.on('card_played', (data) => {
      // Handle card played with animation
    });
  }

  joinSession(sessionId: string) {
    this.socket?.emit('join_session', { sessionId });
  }

  playCard(card: Card) {
    this.socket?.emit('play_card', { card });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export default new SocketService();
```

### 4. Animation Architecture

Using React Native Reanimated 2:

```typescript
// cardAnimations.ts
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

export const useCardAnimation = (onComplete?: () => void) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ]
  }));

  const playCard = (targetX: number, targetY: number) => {
    translateX.value = withTiming(targetX, { duration: 300 });
    translateY.value = withTiming(targetY, { duration: 300 }, () => {
      if (onComplete) {
        runOnJS(onComplete)();
      }
    });
    scale.value = withSpring(1.2);
  };

  const dealCard = (delay: number) => {
    translateY.value = withTiming(0, {
      duration: 400,
      delay
    });
    rotate.value = withSpring(0);
  };

  return { animatedStyle, playCard, dealCard };
};
```

## Backend Architecture (Node.js)

### 1. Server Structure

```
server/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── environment.ts
│   ├── controllers/         # Route controllers
│   │   ├── authController.ts
│   │   ├── gameController.ts
│   │   ├── userController.ts
│   │   └── tournamentController.ts
│   ├── services/            # Business logic
│   │   ├── gameService.ts
│   │   ├── matchmakingService.ts
│   │   ├── tournamentService.ts
│   │   └── notificationService.ts
│   ├── models/              # Data models
│   │   ├── User.ts
│   │   ├── Game.ts
│   │   ├── Tournament.ts
│   │   └── Session.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimit.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── games.ts
│   │   ├── users.ts
│   │   └── tournaments.ts
│   ├── websocket/           # WebSocket handlers
│   │   ├── gameHandlers.ts
│   │   ├── lobbyHandlers.ts
│   │   └── tournamentHandlers.ts
│   ├── utils/               # Utilities
│   │   ├── validation.ts
│   │   ├── logger.ts
│   │   └── helpers.ts
│   ├── game-engine/         # Game logic
│   │   ├── cardGames/
│   │   │   ├── BaseGame.ts
│   │   │   ├── Rummy.ts
│   │   │   └── Hearts.ts
│   │   ├── deck.ts
│   │   └── rules.ts
│   └── index.ts             # Entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json
```

### 2. API Architecture

#### RESTful API Design

```typescript
// Express routes
import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { gameController } from '../controllers/gameController';

const router = express.Router();

// Game routes
router.post('/games', authMiddleware, gameController.createGame);
router.get('/games/:id', authMiddleware, gameController.getGame);
router.post('/games/:id/join', authMiddleware, gameController.joinGame);
router.delete('/games/:id/leave', authMiddleware, gameController.leaveGame);

// Lobby routes
router.get('/lobby', authMiddleware, gameController.getActiveLobby);
router.post('/lobby/search', authMiddleware, gameController.searchGames);

export default router;
```

#### Controller Pattern

```typescript
// gameController.ts
import { Request, Response } from 'express';
import { gameService } from '../services/gameService';

export const gameController = {
  createGame: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { gameType, settings } = req.body;
      
      const game = await gameService.createGame(userId, gameType, settings);
      
      res.status(201).json({
        success: true,
        data: game
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Other methods...
};
```

### 3. WebSocket Architecture

```typescript
// WebSocket server setup
import { Server } from 'socket.io';
import { authMiddleware } from './middleware/auth';
import { gameHandlers } from './websocket/gameHandlers';

export const setupWebSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const user = await authMiddleware.verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.id}`);

    // Register event handlers
    gameHandlers.register(socket, io);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
      // Handle cleanup
    });
  });
};
```

#### Game Event Handlers

```typescript
// gameHandlers.ts
import { Socket, Server } from 'socket.io';
import { gameService } from '../services/gameService';

export const gameHandlers = {
  register: (socket: Socket, io: Server) => {
    socket.on('join_session', async (data) => {
      const { sessionId } = data;
      
      // Join socket room
      socket.join(sessionId);
      
      // Get current game state
      const gameState = await gameService.getGameState(sessionId);
      
      // Send current state to new player
      socket.emit('game_state', gameState);
      
      // Notify other players
      socket.to(sessionId).emit('player_joined', {
        player: socket.data.user
      });
    });

    socket.on('play_card', async (data) => {
      const { sessionId, card } = data;
      const userId = socket.data.user.id;
      
      try {
        // Validate move
        const isValid = await gameService.validateMove(
          sessionId, 
          userId, 
          card
        );
        
        if (!isValid) {
          socket.emit('invalid_move', { 
            reason: 'Invalid card play' 
          });
          return;
        }
        
        // Update game state
        const newState = await gameService.playCard(
          sessionId, 
          userId, 
          card
        );
        
        // Broadcast to all players in session
        io.to(sessionId).emit('card_played', {
          player: userId,
          card,
          newState
        });
        
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    socket.on('end_turn', async (data) => {
      const { sessionId } = data;
      const userId = socket.data.user.id;
      
      const newState = await gameService.endTurn(sessionId, userId);
      
      io.to(sessionId).emit('turn_ended', newState);
    });
  }
};
```

### 4. Game Engine Architecture

```typescript
// BaseGame.ts - Abstract base class for card games
export abstract class BaseGame {
  protected players: Player[];
  protected deck: Deck;
  protected state: GameState;
  
  constructor(players: Player[], settings: GameSettings) {
    this.players = players;
    this.deck = new Deck();
    this.state = this.initializeState(settings);
  }
  
  abstract initializeState(settings: GameSettings): GameState;
  abstract validateMove(player: Player, move: Move): boolean;
  abstract executeMove(player: Player, move: Move): GameState;
  abstract checkWinCondition(): Player | null;
  abstract calculateScore(): Record<string, number>;
  
  dealCards(cardsPerPlayer: number) {
    this.deck.shuffle();
    this.players.forEach(player => {
      player.hand = this.deck.deal(cardsPerPlayer);
    });
  }
  
  getCurrentPlayer(): Player {
    return this.players[this.state.currentPlayerIndex];
  }
  
  nextTurn() {
    this.state.currentPlayerIndex = 
      (this.state.currentPlayerIndex + 1) % this.players.length;
  }
}

// Rummy.ts - Specific game implementation
export class Rummy extends BaseGame {
  initializeState(settings: GameSettings): GameState {
    return {
      currentPlayerIndex: 0,
      discardPile: [],
      round: 1,
      phase: 'drawing'
    };
  }
  
  validateMove(player: Player, move: Move): boolean {
    // Implement Rummy-specific validation
    if (move.type === 'draw') {
      return this.state.phase === 'drawing';
    }
    if (move.type === 'discard') {
      return this.state.phase === 'discarding' && 
             player.hand.some(c => c.id === move.card.id);
    }
    return false;
  }
  
  executeMove(player: Player, move: Move): GameState {
    // Implement Rummy-specific move execution
    // Update state and return new state
  }
  
  // Other Rummy-specific methods...
}
```

### 5. Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- User stats table
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    ranking INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type VARCHAR(50) NOT NULL,
    host_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    settings JSONB,
    state JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

-- Game players table
CREATE TABLE game_players (
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    position INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, user_id)
);

-- Tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organizer_id UUID REFERENCES users(id),
    tournament_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    max_players INTEGER NOT NULL,
    bracket JSONB,
    schedule JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP,
    end_date TIMESTAMP
);

-- Tournament registrations table
CREATE TABLE tournament_registrations (
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seed INTEGER,
    PRIMARY KEY (tournament_id, user_id)
);

-- Friendships table
CREATE TABLE friendships (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id < friend_id)
);

-- Create indexes for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_host ON games(host_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_user_stats_ranking ON user_stats(ranking);
```

### 6. Caching Strategy (Redis)

```typescript
// Redis usage patterns
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// 1. Session caching
export const cacheSession = async (sessionId: string, data: any) => {
  await redis.setex(
    `session:${sessionId}`, 
    3600, // 1 hour TTL
    JSON.stringify(data)
  );
};

// 2. Game state caching
export const cacheGameState = async (gameId: string, state: any) => {
  await redis.setex(
    `game:${gameId}:state`,
    7200, // 2 hours
    JSON.stringify(state)
  );
};

// 3. Leaderboard (sorted sets)
export const updateLeaderboard = async (userId: string, score: number) => {
  await redis.zadd('leaderboard:global', score, userId);
};

export const getLeaderboard = async (start: number, end: number) => {
  return redis.zrevrange('leaderboard:global', start, end, 'WITHSCORES');
};

// 4. Matchmaking queue
export const joinMatchmakingQueue = async (userId: string, gameType: string) => {
  await redis.lpush(`queue:${gameType}`, userId);
};

export const getNextFromQueue = async (gameType: string) => {
  return redis.rpop(`queue:${gameType}`);
};

// 5. Pub/Sub for real-time events
export const publishGameEvent = async (channel: string, event: any) => {
  await redis.publish(channel, JSON.stringify(event));
};
```

## Security Architecture

### 1. Authentication Flow

```typescript
// JWT-based authentication
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const authService = {
  async register(username: string, email: string, password: string) {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await db.users.create({
      username,
      email,
      passwordHash: hashedPassword
    });
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    return { user, accessToken, refreshToken };
  },
  
  generateAccessToken(user: User) {
    return jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  },
  
  generateRefreshToken(user: User) {
    return jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
  }
};
```

### 2. Input Validation

```typescript
import Joi from 'joi';

export const schemas = {
  createGame: Joi.object({
    gameType: Joi.string().valid('rummy', 'hearts', 'poker').required(),
    maxPlayers: Joi.number().integer().min(2).max(8).required(),
    settings: Joi.object({
      rounds: Joi.number().integer().min(1).max(10),
      timeLimit: Joi.number().integer().min(60)
    })
  }),
  
  playCard: Joi.object({
    sessionId: Joi.string().uuid().required(),
    cardId: Joi.string().required()
  })
};

// Validation middleware
export const validate = (schema: Joi.Schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }
    next();
  };
};
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Strict limit for auth endpoints
  message: 'Too many authentication attempts'
});
```

## Deployment Architecture

### 1. Container Architecture (Docker)

```dockerfile
# Dockerfile for Node.js backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml for local development
version: '3.8'

services:
  api:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/cardgame
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cardgame
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  redis-data:
```

### 2. Cloud Infrastructure (AWS)

```
┌────────────────────────────────────────────────────────────┐
│                     Route 53 (DNS)                         │
└────────────────────┬───────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│              CloudFront (CDN)                              │
│            - Static asset delivery                         │
│            - SSL termination                               │
└────────────────────┬───────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│         Application Load Balancer (ALB)                    │
│         - Health checks                                    │
│         - SSL termination                                  │
│         - WebSocket support                                │
└────────────────────┬───────────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
┌────────▼────────┐    ┌───────▼─────────┐
│   ECS Cluster   │    │   ECS Cluster   │
│   (API Server)  │    │  (WebSocket)    │
│                 │    │                 │
│   Auto-scaling  │    │   Auto-scaling  │
└────────┬────────┘    └───────┬─────────┘
         │                      │
         └───────────┬──────────┘
                     │
         ┌───────────┼──────────┐
         │           │          │
┌────────▼──┐  ┌────▼────┐  ┌──▼────────┐
│    RDS    │  │ ElastiC │  │    S3     │
│PostgreSQL │  │  ache   │  │  Storage  │
│Multi-AZ   │  │ (Redis) │  │           │
└───────────┘  └─────────┘  └───────────┘
```

## Monitoring & Observability

### 1. Logging Strategy

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
});

// Add console in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. Metrics Collection

```typescript
import { Counter, Histogram, register } from 'prom-client';

// Define metrics
export const metrics = {
  httpRequests: new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status']
  }),
  
  httpDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route']
  }),
  
  activeGames: new Counter({
    name: 'active_games_total',
    help: 'Total active game sessions'
  }),
  
  wsConnections: new Counter({
    name: 'websocket_connections_total',
    help: 'Total WebSocket connections'
  })
};

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

## Performance Optimization

### 1. Database Query Optimization

```typescript
// Use indexes effectively
// Batch operations where possible
// Implement connection pooling

import { Pool } from 'pg';

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Prepared statements for frequently used queries
const getGameStateQuery = {
  name: 'get-game-state',
  text: 'SELECT * FROM games WHERE id = $1',
  values: []
};
```

### 2. WebSocket Optimization

```typescript
// Use binary protocol where possible
// Implement message compression
// Batch state updates

io.on('connection', (socket) => {
  // Enable compression
  socket.compress(true);
  
  // Batch state updates
  let stateUpdateQueue = [];
  const flushInterval = 100; // ms
  
  setInterval(() => {
    if (stateUpdateQueue.length > 0) {
      socket.emit('batch_update', stateUpdateQueue);
      stateUpdateQueue = [];
    }
  }, flushInterval);
});
```

## Conclusion

This architecture provides a solid foundation for building a scalable, real-time multiplayer card game application. Key architectural decisions:

1. **Separation of Concerns**: Clear boundaries between frontend, backend, and data layers
2. **Real-time First**: WebSocket-based architecture for instant synchronization
3. **Scalability**: Stateless servers, caching, and cloud-native deployment
4. **Security**: JWT authentication, input validation, rate limiting
5. **Monitoring**: Comprehensive logging and metrics collection
6. **Maintainability**: Modular structure, TypeScript for type safety

The architecture can be implemented incrementally, starting with the MVP features and scaling up as needed.
