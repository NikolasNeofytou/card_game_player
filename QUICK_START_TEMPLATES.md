# Quick Start Template

This template provides ready-to-use code snippets to help developers start implementing the Card Game Player application immediately after setting up their environment.

## Prerequisites

Ensure you've completed the setup in `GETTING_STARTED.md` before using these templates.

## Backend Templates

### 1. Basic Express Server (src/index.ts)

```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { gameRouter } from './routes/games';
import { errorHandler } from './middleware/errorHandler';
import { setupWebSocket } from './websocket';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/games', gameRouter);

// WebSocket setup
setupWebSocket(io);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

export { io };
```

### 2. Database Connection (src/config/database.ts)

```typescript
import { Pool } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('Database connected');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', err);
});

// Helper function for queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error', { text, error });
    throw error;
  }
};

export default pool;
```

### 3. Redis Connection (src/config/redis.ts)

```typescript
import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis error', err);
});

export default redis;
```

### 4. Authentication Middleware (src/middleware/auth.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface UserPayload {
  id: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload;

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 5. Game Service Template (src/services/gameService.ts)

```typescript
import { query } from '../config/database';
import redis from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface Game {
  id: string;
  gameType: string;
  hostId: string;
  status: 'waiting' | 'active' | 'completed';
  settings: any;
  state: any;
  createdAt: Date;
}

export const gameService = {
  async createGame(hostId: string, gameType: string, settings: any): Promise<Game> {
    const gameId = uuidv4();
    
    const result = await query(
      `INSERT INTO games (id, game_type, host_id, status, settings, state)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [gameId, gameType, hostId, 'waiting', JSON.stringify(settings), JSON.stringify({})]
    );

    const game = result.rows[0];
    
    // Cache in Redis
    await redis.setex(
      `game:${gameId}`,
      3600,
      JSON.stringify(game)
    );

    logger.info('Game created', { gameId, hostId, gameType });
    return game;
  },

  async getGame(gameId: string): Promise<Game | null> {
    // Try cache first
    const cached = await redis.get(`game:${gameId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const result = await query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const game = result.rows[0];
    
    // Cache for future requests
    await redis.setex(
      `game:${gameId}`,
      3600,
      JSON.stringify(game)
    );

    return game;
  },

  async updateGameState(gameId: string, newState: any): Promise<void> {
    await query(
      'UPDATE games SET state = $1 WHERE id = $2',
      [JSON.stringify(newState), gameId]
    );

    // Update cache
    const game = await this.getGame(gameId);
    if (game) {
      await redis.setex(
        `game:${gameId}`,
        3600,
        JSON.stringify({ ...game, state: newState })
      );
    }

    logger.debug('Game state updated', { gameId });
  }
};
```

### 6. WebSocket Setup (src/websocket/index.ts)

```typescript
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { gameHandlers } from './gameHandlers';

interface SocketData {
  user: {
    id: string;
    username: string;
  };
}

export const setupWebSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;

      socket.data.user = decoded;
      next();
    } catch (error) {
      logger.error('WebSocket auth error', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket<any, any, any, SocketData>) => {
    logger.info('Client connected', {
      socketId: socket.id,
      userId: socket.data.user?.id
    });

    // Register game event handlers
    gameHandlers.register(socket, io);

    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected', {
        socketId: socket.id,
        userId: socket.data.user?.id,
        reason
      });
    });

    socket.on('error', (error) => {
      logger.error('Socket error', { socketId: socket.id, error });
    });
  });
};
```

## Frontend Templates

### 1. Redux Store Setup (src/store/index.ts)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import userReducer from './slices/userSlice';
import lobbyReducer from './slices/lobbySlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    user: userReducer,
    lobby: lobbyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### 2. Game Slice (src/store/slices/gameSlice.ts)

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Card {
  id: string;
  suit: string;
  rank: string;
}

interface Player {
  id: string;
  username: string;
  avatar?: string;
  score: number;
}

interface GameState {
  sessionId: string | null;
  players: Player[];
  currentTurn: string;
  status: 'waiting' | 'active' | 'finished';
  myCards: Card[];
  boardCards: Card[];
  scores: Record<string, number>;
}

const initialState: GameState = {
  sessionId: null,
  players: [],
  currentTurn: '',
  status: 'waiting',
  myCards: [],
  boardCards: [],
  scores: {},
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    setPlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
    },
    addPlayer: (state, action: PayloadAction<Player>) => {
      state.players.push(action.payload);
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.id !== action.payload);
    },
    setGameStatus: (state, action: PayloadAction<GameState['status']>) => {
      state.status = action.payload;
    },
    setMyCards: (state, action: PayloadAction<Card[]>) => {
      state.myCards = action.payload;
    },
    playCard: (state, action: PayloadAction<Card>) => {
      state.myCards = state.myCards.filter(c => c.id !== action.payload.id);
      state.boardCards.push(action.payload);
    },
    updateScores: (state, action: PayloadAction<Record<string, number>>) => {
      state.scores = action.payload;
    },
    setCurrentTurn: (state, action: PayloadAction<string>) => {
      state.currentTurn = action.payload;
    },
    resetGame: () => initialState,
  },
});

export const {
  setSession,
  setPlayers,
  addPlayer,
  removePlayer,
  setGameStatus,
  setMyCards,
  playCard,
  updateScores,
  setCurrentTurn,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
```

### 3. Socket Service (src/services/websocket/socketService.ts)

```typescript
import io, { Socket } from 'socket.io-client';
import { store } from '../../store';
import { addPlayer, removePlayer, updateScores, setCurrentTurn } from '../../store/slices/gameSlice';
import ENV from '../../config/environment';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(ENV.WEBSOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });

    this.socket.on('player_joined', (player) => {
      store.dispatch(addPlayer(player));
    });

    this.socket.on('player_left', (playerId) => {
      store.dispatch(removePlayer(playerId));
    });

    this.socket.on('game_state_updated', (data) => {
      store.dispatch(updateScores(data.scores));
      store.dispatch(setCurrentTurn(data.currentTurn));
    });

    this.socket.on('card_played', (data) => {
      // Handle card play animation
      console.log('Card played:', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  joinSession(sessionId: string) {
    this.socket?.emit('join_session', { sessionId });
  }

  leaveSession(sessionId: string) {
    this.socket?.emit('leave_session', { sessionId });
  }

  playCard(card: any) {
    this.socket?.emit('play_card', { card });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
```

### 4. Card Component (src/components/game/Card.tsx)

```typescript
import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface CardProps {
  id: string;
  suit: string;
  rank: string;
  onPress?: () => void;
  selected?: boolean;
}

const Card: React.FC<CardProps> = ({ suit, rank, onPress, selected }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  React.useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.1);
      translateY.value = withSpring(-20);
    } else {
      scale.value = withSpring(1);
      translateY.value = withSpring(0);
    }
  }, [selected]);

  const handlePress = () => {
    scale.value = withTiming(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1);
    });
    onPress?.();
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={[styles.card, selected && styles.cardSelected]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Text style={styles.suit}>{suit}</Text>
        <Text style={styles.rank}>{rank}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 5,
  },
  card: {
    width: 80,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardSelected: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  suit: {
    fontSize: 32,
  },
  rank: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default Card;
```

### 5. Game Screen (src/screens/game/GameScreen.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store';
import Card from '../../components/game/Card';
import socketService from '../../services/websocket/socketService';
import { playCard as playCardAction } from '../../store/slices/gameSlice';

const GameScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myCards, players, currentTurn, scores } = useAppSelector(state => state.game);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardPress = (card: any) => {
    setSelectedCard(card.id);
  };

  const handlePlayCard = () => {
    if (!selectedCard) return;

    const card = myCards.find(c => c.id === selectedCard);
    if (card) {
      socketService.playCard(card);
      dispatch(playCardAction(card));
      setSelectedCard(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        {players.map(player => (
          <View key={player.id} style={styles.playerScore}>
            <Text style={styles.playerName}>{player.username}</Text>
            <Text style={styles.score}>{scores[player.id] || 0}</Text>
          </View>
        ))}
      </View>

      {/* Game board */}
      <View style={styles.board}>
        <Text style={styles.turnText}>
          {currentTurn === 'YOUR_ID' ? 'Your turn!' : 'Waiting...'}
        </Text>
      </View>

      {/* Player hand */}
      <View style={styles.hand}>
        {myCards.map(card => (
          <Card
            key={card.id}
            id={card.id}
            suit={card.suit}
            rank={card.rank}
            selected={selectedCard === card.id}
            onPress={() => handleCardPress(card)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d5a2d',
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#1a3a1a',
  },
  playerScore: {
    alignItems: 'center',
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
  },
  score: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  board: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  turnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  hand: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
});

export default GameScreen;
```

## Database Migration Template

```sql
-- migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User stats
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    ranking INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_type VARCHAR(50) NOT NULL,
    host_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('waiting', 'active', 'completed')),
    settings JSONB DEFAULT '{}',
    state JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

-- Game players
CREATE TABLE IF NOT EXISTS game_players (
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    position INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, user_id)
);

-- Indexes
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_host ON games(host_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_stats_ranking ON user_stats(ranking);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Testing Templates

### Backend Test (tests/game.test.ts)

```typescript
import request from 'supertest';
import app from '../src/index';

describe('Game API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = response.body.token;
  });

  test('Create game', async () => {
    const response = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        gameType: 'rummy',
        maxPlayers: 4
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.gameType).toBe('rummy');
  });

  test('Get game by ID', async () => {
    // First create a game
    const createResponse = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ gameType: 'rummy', maxPlayers: 4 });

    const gameId = createResponse.body.data.id;

    // Then fetch it
    const response = await request(app)
      .get(`/api/games/${gameId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(gameId);
  });
});
```

### Frontend Test (tests/Card.test.tsx)

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Card from '../src/components/game/Card';

describe('Card Component', () => {
  test('renders correctly', () => {
    const { getByText } = render(
      <Card id="1" suit="♠" rank="A" />
    );

    expect(getByText('♠')).toBeTruthy();
    expect(getByText('A')).toBeTruthy();
  });

  test('calls onPress when tapped', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Card id="1" suit="♠" rank="A" onPress={onPressMock} />
    );

    fireEvent.press(getByText('A'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
```

## Environment Variables Template

```env
# Server Configuration
NODE_ENV=development
PORT=3000
WEBSOCKET_PORT=3001
CLIENT_URL=http://localhost:8081

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cardgame
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=cardgame

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Firebase
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Features
ENABLE_DEBUG_LOGGING=true
ENABLE_METRICS=false
```

## Docker Compose Template

```yaml
version: '3.8'

services:
  api:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@postgres:5432/cardgame
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret
    depends_on:
      - postgres
      - redis
    volumes:
      - ./server:/app
      - /app/node_modules
    command: npm run dev

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cardgame
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  redis-data:
```

## Usage

1. Copy relevant templates to your project
2. Replace placeholder values with actual configuration
3. Install dependencies listed in GETTING_STARTED.md
4. Run development servers
5. Begin implementing features following IMPLEMENTATION_CHECKLIST.md

## Next Steps

- Set up your development environment using GETTING_STARTED.md
- Review ARCHITECTURE.md for system design
- Follow IMPLEMENTATION_CHECKLIST.md for feature development
- Refer to DEVELOPMENT_PLAN.md for overall strategy

Happy coding! 🚀
