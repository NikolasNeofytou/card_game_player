// WebSocket event types for real-time game communication

export interface SocketUser {
  id: string;
  username: string;
  socketId: string;
}

export interface JoinSessionData {
  sessionId: string;
  userId: string;
  username: string;
}

export interface LeaveSessionData {
  sessionId: string;
  userId: string;
}

export interface PlayCardData {
  sessionId: string;
  userId: string;
  cardId: string;
}

export interface GameStateUpdate {
  sessionId: string;
  currentPlayer: string;
  phase: string;
  currentRound: number;
  currentTrick: any[];
  players: any[];
  cardsRemaining: number;
}

export interface PlayerJoinedEvent {
  player: {
    id: string;
    username: string;
    score: number;
  };
  playerCount: number;
}

export interface PlayerLeftEvent {
  playerId: string;
  playerCount: number;
}

export interface CardPlayedEvent {
  playerId: string;
  cardId: string;
  newState: GameStateUpdate;
}

export interface GameStartedEvent {
  sessionId: string;
  players: any[];
  startedAt: Date;
}

export interface GameEndedEvent {
  sessionId: string;
  winner: {
    id: string;
    username: string;
    score: number;
  };
  finalScores: Record<string, number>;
}

export interface InvalidMoveEvent {
  reason: string;
  message: string;
}

export interface ErrorEvent {
  error: string;
  message: string;
}

// Event names as constants
export const SOCKET_EVENTS = {
  // Client to Server
  JOIN_SESSION: 'join_session',
  LEAVE_SESSION: 'leave_session',
  PLAY_CARD: 'play_card',
  START_GAME: 'start_game',
  
  // Server to Client
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  CARD_PLAYED: 'card_played',
  GAME_STATE_UPDATED: 'game_state_updated',
  GAME_STARTED: 'game_started',
  GAME_ENDED: 'game_ended',
  INVALID_MOVE: 'invalid_move',
  ERROR: 'error',
  
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECTION_ERROR: 'connect_error',
} as const;
