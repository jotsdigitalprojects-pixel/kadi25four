export enum Suit {
  Hearts = 'HEARTS',
  Diamonds = 'DIAMONDS',
  Clubs = 'CLUBS',
  Spades = 'SPADES',
}

export enum Rank {
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
  Ace = 'A',
  Joker = 'JOKER',
}

export interface Card {
  suit: Suit | null;
  rank: Rank;
}

export interface Player {
  id: number;
  name: string;
  hand: Card[];
  isComputer: boolean;
}

export enum GameMode {
  Friendly = 'FRIENDLY',
  BombNiBomb = 'BOMB_NI_BOMB',
}