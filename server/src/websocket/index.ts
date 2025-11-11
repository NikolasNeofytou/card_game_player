import { Server } from 'socket.io';
import { setupGameHandlers } from './gameHandlers';

export const setupWebSocket = (io: Server) => {
  console.log('Setting up WebSocket handlers...');
  
  // Middleware for connection logging
  io.use((socket, next) => {
    console.log('New connection attempt:', socket.id);
    next();
  });

  // Set up game event handlers
  setupGameHandlers(io);

  console.log('WebSocket handlers initialized');
};

export * from './types';
