import io, { Socket } from 'socket.io-client';
import { store } from '../../store';
import {
  addPlayer,
  removePlayer,
  updateGameState,
  setGameStatus,
  resetGame,
} from '../../store/slices/gameSlice';
import ENV from '../../config/environment';

// Event names matching backend
const SOCKET_EVENTS = {
  JOIN_SESSION: 'join_session',
  LEAVE_SESSION: 'leave_session',
  PLAY_CARD: 'play_card',
  START_GAME: 'start_game',
  
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  CARD_PLAYED: 'card_played',
  GAME_STATE_UPDATED: 'game_state_updated',
  GAME_STARTED: 'game_started',
  GAME_ENDED: 'game_ended',
  INVALID_MOVE: 'invalid_move',
  ERROR: 'error',
};

class SocketService {
  private socket: Socket | null = null;
  private currentUserId: string | null = null;

  connect(userId: string, username: string) {
    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    this.currentUserId = userId;

    this.socket = io(ENV.WEBSOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Game event listeners
    this.socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data) => {
      console.log('Player joined:', data);
      store.dispatch(addPlayer(data.player));
    });

    this.socket.on(SOCKET_EVENTS.PLAYER_LEFT, (data) => {
      console.log('Player left:', data);
      store.dispatch(removePlayer(data.playerId));
    });

    this.socket.on(SOCKET_EVENTS.GAME_STARTED, (data) => {
      console.log('Game started:', data);
      store.dispatch(setGameStatus('active'));
      store.dispatch(updateGameState({
        players: data.players,
      }));
    });

    this.socket.on(SOCKET_EVENTS.GAME_STATE_UPDATED, (data) => {
      console.log('Game state updated:', data);
      store.dispatch(updateGameState({
        currentPlayerId: data.currentPlayer,
        phase: data.phase,
        currentRound: data.currentRound,
        currentTrick: data.currentTrick || [],
        players: data.players || [],
        myHand: data.myHand || [],
        cardsRemaining: data.cardsRemaining || 0,
      }));
    });

    this.socket.on(SOCKET_EVENTS.CARD_PLAYED, (data) => {
      console.log('Card played:', data);
      // State will be updated via GAME_STATE_UPDATED event
    });

    this.socket.on(SOCKET_EVENTS.GAME_ENDED, (data) => {
      console.log('Game ended:', data);
      store.dispatch(setGameStatus('finished'));
      store.dispatch(updateGameState({
        scores: data.finalScores,
      }));
      
      // Show winner notification (would be handled by UI layer)
      console.log('Winner:', data.winner.username, 'with score:', data.winner.score);
    });

    this.socket.on(SOCKET_EVENTS.INVALID_MOVE, (data) => {
      console.error('Invalid move:', data);
      // Show error to user (would be handled by UI layer)
      alert(`Invalid move: ${data.message}`);
    });

    this.socket.on(SOCKET_EVENTS.ERROR, (data) => {
      console.error('Socket error:', data);
      // Show error to user (would be handled by UI layer)
      alert(`Error: ${data.message}`);
    });
  }

  joinSession(sessionId: string, userId: string, username: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(SOCKET_EVENTS.JOIN_SESSION, {
      sessionId,
      userId,
      username,
    });
  }

  leaveSession(sessionId: string, userId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(SOCKET_EVENTS.LEAVE_SESSION, {
      sessionId,
      userId,
    });
  }

  startGame(sessionId: string, userId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(SOCKET_EVENTS.START_GAME, {
      sessionId,
      userId,
    });
  }

  playCard(sessionId: string, userId: string, cardId: string) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(SOCKET_EVENTS.PLAY_CARD, {
      sessionId,
      userId,
      cardId,
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
    }
    store.dispatch(resetGame());
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export default new SocketService();
