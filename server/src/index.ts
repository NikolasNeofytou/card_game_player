import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/games';
import { setupWebSocket } from './websocket';

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
  console.log(`${req.method} ${req.path}`);
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
app.use('/api/games', gameRoutes);

// Root API info
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Card Game Player API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      games: {
        create: 'POST /api/games',
        list: 'GET /api/games/active',
        get: 'GET /api/games/:id',
        join: 'POST /api/games/:id/join',
        start: 'POST /api/games/:id/start',
        play: 'POST /api/games/:id/play'
      }
    }
  });
});

// WebSocket setup
setupWebSocket(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
