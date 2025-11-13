import { BaseGame, Player, GameSettings, GameState, Move } from '../BaseGame';
import { Card } from '../Card';

/**
 * HighCard - A simple trick-taking card game
 * 
 * Rules:
 * - 2-4 players
 * - Each player gets 7 cards
 * - Players take turns playing one card
 * - Highest card wins the trick
 * - Winner of trick plays first next round
 * - 1 point per trick won
 * - Game ends after all cards are played
 */
export class HighCard extends BaseGame {
  initializeState(): GameState {
    return {
      currentPlayerIndex: 0,
      currentRound: 1,
      phase: 'playing',
      deck: [],
      discardPile: [],
      boardCards: [],
      currentTrick: [],
      tricksWon: this.players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
    };
  }

  startGame(): void {
    this.dealCards(7);
    this.state.phase = 'playing';
  }

  validateMove(player: Player, move: Move): boolean {
    // Check if it's the player's turn
    if (this.getCurrentPlayer().id !== player.id) {
      return false;
    }

    // Check if move type is valid
    if (move.type !== 'play_card') {
      return false;
    }

    // Check if player has the card
    if (!move.card) {
      return false;
    }

    const hasCard = player.hand.some(c => c.id === move.card!.id);
    if (!hasCard) {
      return false;
    }

    // Check if game is in playing phase
    if (this.state.phase !== 'playing') {
      return false;
    }

    return true;
  }

  executeMove(player: Player, move: Move): GameState {
    if (!this.validateMove(player, move)) {
      throw new Error('Invalid move');
    }

    // Remove card from player's hand
    const cardIndex = player.hand.findIndex(c => c.id === move.card!.id);
    const playedCard = player.hand.splice(cardIndex, 1)[0];

    // Add card to current trick
    this.state.currentTrick.push({
      playerId: player.id,
      card: playedCard
    });

    // Move to next player
    this.nextTurn();

    // Check if trick is complete
    if (this.state.currentTrick.length === this.players.length) {
      this.completeTrick();
    }

    // Check if round is complete (all cards played)
    if (this.players.every(p => p.hand.length === 0)) {
      this.state.phase = 'finished';
    }

    return this.getState();
  }

  private completeTrick(): void {
    // Find the highest card
    let highestPlay = this.state.currentTrick[0];
    for (const play of this.state.currentTrick) {
      if (play.card.getValue() > highestPlay.card.getValue()) {
        highestPlay = play;
      }
    }

    // Award point to winner
    this.state.tricksWon[highestPlay.playerId]++;

    // Update scores
    const winner = this.players.find(p => p.id === highestPlay.playerId);
    if (winner) {
      winner.score++;
    }

    // Move cards to discard pile
    this.state.discardPile.push(...this.state.currentTrick.map((p: any) => p.card));

    // Clear current trick
    this.state.currentTrick = [];

    // Winner plays first in next trick
    const winnerIndex = this.players.findIndex(p => p.id === highestPlay.playerId);
    this.state.currentPlayerIndex = winnerIndex;

    this.state.currentRound++;
  }

  checkWinCondition(): Player | null {
    if (this.state.phase !== 'finished') {
      return null;
    }

    // Find player with most tricks won
    let winner = this.players[0];
    for (const player of this.players) {
      if (player.score > winner.score) {
        winner = player;
      }
    }

    return winner;
  }

  calculateScore(): Record<string, number> {
    return this.players.reduce((acc, p) => {
      acc[p.id] = p.score;
      return acc;
    }, {} as Record<string, number>);
  }

  getPublicState(playerId: string) {
    const player = this.players.find(p => p.id === playerId);
    return {
      gameId: this.gameId,
      currentPlayer: this.getCurrentPlayer().id,
      phase: this.state.phase,
      currentRound: this.state.currentRound,
      currentTrick: this.state.currentTrick,
      players: this.players.map(p => ({
        id: p.id,
        username: p.username,
        handCount: p.hand.length,
        score: p.score,
        tricksWon: this.state.tricksWon[p.id]
      })),
      myHand: player ? player.hand.map(c => c.toJSON()) : [],
      cardsRemaining: this.players[0]?.hand.length || 0
    };
  }
}
