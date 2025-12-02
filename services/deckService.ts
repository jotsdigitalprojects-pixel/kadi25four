
import { Card, Rank } from '../types';
import { SUITS, RANKS } from '../constants';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      if (rank === Rank.Joker) continue; // Don't create suited Jokers
      deck.push({ suit, rank });
    }
  }
  // Add two suitless Jokers
  deck.push({ suit: null, rank: Rank.Joker });
  deck.push({ suit: null, rank: Rank.Joker });
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
};