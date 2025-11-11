import { Card } from './Card';
import { Deck } from './Deck';

export interface Player {
  id: string;
  username: string;
  hand: Card[];
  score: number;
}

export interface GameSettings {
  maxPlayers: number;
  rounds?: number;
  timeLimit?: number;
}

export interface GameState {
  currentPlayerIndex: number;
  currentRound: number;
  phase: string;
  deck: Card[];
  discardPile: Card[];
  boardCards: Card[];
  [key: string]: any;
}

export interface Move {
  type: string;
  playerId: string;
  card?: Card;
  [key: string]: any;
}

export abstract class BaseGame {
  protected players: Player[];
  protected deck: Deck;
  protected state: GameState;
  protected settings: GameSettings;
  protected gameId: string;

  constructor(gameId: string, players: Player[], settings: GameSettings) {
    this.gameId = gameId;
    this.players = players;
    this.settings = settings;
    this.deck = new Deck();
    this.state = this.initializeState();
  }

  abstract initializeState(): GameState;
  abstract validateMove(player: Player, move: Move): boolean;
  abstract executeMove(player: Player, move: Move): GameState;
  abstract checkWinCondition(): Player | null;
  abstract calculateScore(): Record<string, number>;

  dealCards(cardsPerPlayer: number): void {
    this.deck.shuffle();
    this.players.forEach(player => {
      player.hand = this.deck.deal(cardsPerPlayer);
    });
  }

  getCurrentPlayer(): Player {
    return this.players[this.state.currentPlayerIndex];
  }

  nextTurn(): void {
    this.state.currentPlayerIndex = 
      (this.state.currentPlayerIndex + 1) % this.players.length;
  }

  getState(): GameState {
    return { ...this.state };
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getGameId(): string {
    return this.gameId;
  }

  serializeState() {
    return {
      gameId: this.gameId,
      players: this.players.map(p => ({
        id: p.id,
        username: p.username,
        handCount: p.hand.length,
        score: p.score
      })),
      state: this.state,
      currentPlayer: this.getCurrentPlayer().id
    };
  }
}
