import { Card, Suit, Rank } from './Card';

export class Deck {
  private cards: Card[] = [];
  private readonly suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  private readonly ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.cards = [];
    let cardId = 1;
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        this.cards.push(new Card(suit, rank, `card-${cardId++}`));
      }
    }
  }

  shuffle(): void {
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(count: number): Card[] {
    if (count > this.cards.length) {
      throw new Error(`Not enough cards to deal. Requested: ${count}, Available: ${this.cards.length}`);
    }
    return this.cards.splice(0, count);
  }

  draw(): Card | null {
    return this.cards.shift() || null;
  }

  getRemaining(): number {
    return this.cards.length;
  }

  reset(): void {
    this.initialize();
  }

  getCards(): Card[] {
    return [...this.cards];
  }
}
