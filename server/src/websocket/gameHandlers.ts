import { Server, Socket } from 'socket.io';
import gameService from '../services/gameService';
import {
  SOCKET_EVENTS,
  JoinSessionData,
  LeaveSessionData,
  PlayCardData,
} from './types';

interface SocketData {
  userId?: string;
  username?: string;
  sessionId?: string;
}

export const setupGameHandlers = (io: Server) => {
  io.on(SOCKET_EVENTS.CONNECT, (socket: Socket<any, any, any, SocketData>) => {
    console.log('Client connected:', socket.id);

    // Join session handler
    socket.on(SOCKET_EVENTS.JOIN_SESSION, async (data: JoinSessionData) => {
      try {
        const { sessionId, userId, username } = data;
        
        // Store user data in socket
        socket.data.userId = userId;
        socket.data.username = username;
        socket.data.sessionId = sessionId;

        // Join the Socket.io room
        await socket.join(sessionId);

        // Add player to game session
        const session = await gameService.joinGame(sessionId, userId, username);

        // Notify all players in the session
        io.to(sessionId).emit(SOCKET_EVENTS.PLAYER_JOINED, {
          player: {
            id: userId,
            username,
            score: 0,
          },
          playerCount: session.players.length,
        });

        // Send current game state to the joining player
        const gameState = await gameService.getGame(sessionId, userId);
        socket.emit(SOCKET_EVENTS.GAME_STATE_UPDATED, gameState);

        console.log(`Player ${username} (${userId}) joined session ${sessionId}`);
      } catch (error: any) {
        console.error('Join session error:', error);
        socket.emit(SOCKET_EVENTS.ERROR, {
          error: 'join_failed',
          message: error.message,
        });
      }
    });

    // Leave session handler
    socket.on(SOCKET_EVENTS.LEAVE_SESSION, async (data: LeaveSessionData) => {
      try {
        const { sessionId, userId } = data;

        // Leave the Socket.io room
        await socket.leave(sessionId);

        // Notify other players
        io.to(sessionId).emit(SOCKET_EVENTS.PLAYER_LEFT, {
          playerId: userId,
        });

        console.log(`Player ${userId} left session ${sessionId}`);
      } catch (error: any) {
        console.error('Leave session error:', error);
        socket.emit(SOCKET_EVENTS.ERROR, {
          error: 'leave_failed',
          message: error.message,
        });
      }
    });

    // Start game handler
    socket.on(SOCKET_EVENTS.START_GAME, async (data: { sessionId: string; userId: string }) => {
      try {
        const { sessionId, userId } = data;

        // Start the game
        const session = await gameService.startGame(sessionId, userId);

        // Get game state for all players
        const gameStates: any = {};
        for (const player of session.players) {
          gameStates[player.id] = await gameService.getGame(sessionId, player.id);
        }

        // Notify all players that game has started
        io.to(sessionId).emit(SOCKET_EVENTS.GAME_STARTED, {
          sessionId,
          players: session.players.map(p => ({
            id: p.id,
            username: p.username,
            score: p.score,
          })),
          startedAt: new Date(),
        });

        // Send individual game states to each player (with their cards)
        for (const player of session.players) {
          const playerSocket = await io.in(sessionId).fetchSockets();
          const targetSocket = playerSocket.find(s => s.data.userId === player.id);
          if (targetSocket) {
            targetSocket.emit(SOCKET_EVENTS.GAME_STATE_UPDATED, gameStates[player.id]);
          }
        }

        console.log(`Game started in session ${sessionId}`);
      } catch (error: any) {
        console.error('Start game error:', error);
        socket.emit(SOCKET_EVENTS.ERROR, {
          error: 'start_failed',
          message: error.message,
        });
      }
    });

    // Play card handler
    socket.on(SOCKET_EVENTS.PLAY_CARD, async (data: PlayCardData) => {
      try {
        const { sessionId, userId, cardId } = data;

        // Execute the move
        const result = await gameService.playCard(sessionId, userId, cardId);

        // Broadcast card played event to all players
        io.to(sessionId).emit(SOCKET_EVENTS.CARD_PLAYED, {
          playerId: userId,
          cardId,
        });

        // Get and send updated game state to each player (with their own cards)
        const session = gameService.getSession(sessionId);
        if (session && session.players) {
          for (const player of session.players) {
            const playerState = await gameService.getGame(sessionId, player.id);
            const playerSocket = await io.in(sessionId).fetchSockets();
            const targetSocket = playerSocket.find(s => s.data.userId === player.id);
            if (targetSocket) {
              targetSocket.emit(SOCKET_EVENTS.GAME_STATE_UPDATED, playerState);
            }
          }
        }

        // Check if game ended
        if (result.winner) {
          io.to(sessionId).emit(SOCKET_EVENTS.GAME_ENDED, {
            sessionId,
            winner: {
              id: result.winner.id,
              username: result.winner.username,
              score: result.winner.score,
            },
            finalScores: result.publicState.players.reduce((acc: any, p: any) => {
              acc[p.id] = p.score;
              return acc;
            }, {}),
          });
        }

        console.log(`Card ${cardId} played by ${userId} in session ${sessionId}`);
      } catch (error: any) {
        console.error('Play card error:', error);
        socket.emit(SOCKET_EVENTS.INVALID_MOVE, {
          reason: 'invalid_move',
          message: error.message,
        });
      }
    });

    // Disconnect handler
    socket.on(SOCKET_EVENTS.DISCONNECT, async (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      
      // Notify session if user was in one
      if (socket.data.sessionId && socket.data.userId) {
        io.to(socket.data.sessionId).emit(SOCKET_EVENTS.PLAYER_LEFT, {
          playerId: socket.data.userId,
          disconnected: true,
        });
      }
    });

    // Connection error handler
    socket.on(SOCKET_EVENTS.CONNECTION_ERROR, (error) => {
      console.error('Connection error:', error);
    });
  });
};
