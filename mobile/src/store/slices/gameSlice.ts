import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Card {
  id: string;
  suit: string;
  rank: string;
  value: number;
}

export interface Player {
  id: string;
  username: string;
  handCount: number;
  score: number;
  tricksWon?: number;
}

export interface GameState {
  sessionId: string | null;
  gameType: string | null;
  players: Player[];
  currentPlayerId: string | null;
  status: 'waiting' | 'active' | 'finished';
  myHand: Card[];
  currentTrick: any[];
  phase: string;
  currentRound: number;
  cardsRemaining: number;
  scores: Record<string, number>;
}

const initialState: GameState = {
  sessionId: null,
  gameType: null,
  players: [],
  currentPlayerId: null,
  status: 'waiting',
  myHand: [],
  currentTrick: [],
  phase: 'waiting',
  currentRound: 1,
  cardsRemaining: 0,
  scores: {},
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    setGameType: (state, action: PayloadAction<string>) => {
      state.gameType = action.payload;
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
    setMyHand: (state, action: PayloadAction<Card[]>) => {
      state.myHand = action.payload;
    },
    playCard: (state, action: PayloadAction<string>) => {
      state.myHand = state.myHand.filter(c => c.id !== action.payload);
    },
    updateGameState: (state, action: PayloadAction<Partial<GameState>>) => {
      return { ...state, ...action.payload };
    },
    setCurrentTrick: (state, action: PayloadAction<any[]>) => {
      state.currentTrick = action.payload;
    },
    updateScores: (state, action: PayloadAction<Record<string, number>>) => {
      state.scores = action.payload;
    },
    setCurrentPlayer: (state, action: PayloadAction<string>) => {
      state.currentPlayerId = action.payload;
    },
    resetGame: () => initialState,
  },
});

export const {
  setSession,
  setGameType,
  setPlayers,
  addPlayer,
  removePlayer,
  setGameStatus,
  setMyHand,
  playCard,
  updateGameState,
  setCurrentTrick,
  updateScores,
  setCurrentPlayer,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
