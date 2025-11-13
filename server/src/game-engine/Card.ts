export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export class Card {
  constructor(
    public readonly suit: Suit,
    public readonly rank: Rank,
    public readonly id: string
  ) {}

  getValue(): number {
    const rankValues: Record<Rank, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return rankValues[this.rank];
  }

  toString(): string {
    return `${this.rank}${this.getSuitSymbol()}`;
  }

  getSuitSymbol(): string {
    const symbols: Record<Suit, string> = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return symbols[this.suit];
  }

  toJSON() {
    return {
      id: this.id,
      suit: this.suit,
      rank: this.rank,
      value: this.getValue()
    };
  }
}
