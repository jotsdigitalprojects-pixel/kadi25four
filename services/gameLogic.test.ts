import { describe, it, expect } from 'vitest';
import { isCardPlayable, isAValidCombo } from './gameLogic';
import { Card, Rank, Suit, GameMode } from '../types';

// Helper to create cards easily
const createCard = (rank: Rank, suit: Suit | null = null): Card => ({ rank, suit });

describe('gameLogic', () => {
    describe('isCardPlayable', () => {
        it('should allow playing a card of the same suit', () => {
            const topCard = createCard(Rank.Five, Suit.Hearts);
            const card = createCard(Rank.Nine, Suit.Hearts);
            expect(isCardPlayable(card, topCard, null)).toBe(true);
        });

        it('should allow playing a card of the same rank', () => {
            const topCard = createCard(Rank.Five, Suit.Hearts);
            const card = createCard(Rank.Five, Suit.Spades);
            expect(isCardPlayable(card, topCard, null)).toBe(true);
        });

        it('should not allow playing a card of different suit and rank', () => {
            const topCard = createCard(Rank.Five, Suit.Hearts);
            const card = createCard(Rank.Nine, Suit.Spades);
            expect(isCardPlayable(card, topCard, null)).toBe(false);
        });

        it('should always allow playing an Ace (Wild)', () => {
            const topCard = createCard(Rank.Five, Suit.Hearts);
            const card = createCard(Rank.Ace, Suit.Spades);
            expect(isCardPlayable(card, topCard, null)).toBe(true);
        });

        it('should always allow playing a Joker (Wild)', () => {
            const topCard = createCard(Rank.Five, Suit.Hearts);
            const card = createCard(Rank.Joker);
            expect(isCardPlayable(card, topCard, null)).toBe(true);
        });

        it('should allow playing any card on a Joker', () => {
            const topCard = createCard(Rank.Joker);
            const card = createCard(Rank.Two, Suit.Clubs);
            expect(isCardPlayable(card, topCard, null)).toBe(true);
        });

        it('should respect declared suit', () => {
            const topCard = createCard(Rank.Ace, Suit.Spades); // Top card doesn't matter if suit is declared
            const declaredSuit = Suit.Diamonds;

            const validCard = createCard(Rank.Nine, Suit.Diamonds);
            const invalidCard = createCard(Rank.Nine, Suit.Spades);
            const wildCard = createCard(Rank.Ace, Suit.Clubs);

            expect(isCardPlayable(validCard, topCard, declaredSuit)).toBe(true);
            expect(isCardPlayable(invalidCard, topCard, declaredSuit)).toBe(false);
            expect(isCardPlayable(wildCard, topCard, declaredSuit)).toBe(true);
        });
    });

    describe('isAValidCombo', () => {
        describe('Friendly Mode', () => {
            const mode = GameMode.Friendly;

            it('should allow multiple cards of the same rank', () => {
                const combo = [
                    createCard(Rank.Seven, Suit.Hearts),
                    createCard(Rank.Seven, Suit.Spades),
                    createCard(Rank.Seven, Suit.Clubs)
                ];
                expect(isAValidCombo(combo, mode)).toBe(true);
            });

            it('should NOT allow mixed ranks even for draw cards', () => {
                const combo = [
                    createCard(Rank.Two, Suit.Hearts),
                    createCard(Rank.Three, Suit.Hearts)
                ];
                expect(isAValidCombo(combo, mode)).toBe(false);
            });

            it('should allow Joker + same rank draw cards', () => {
                const combo = [
                    createCard(Rank.Two, Suit.Hearts),
                    createCard(Rank.Two, Suit.Spades),
                    createCard(Rank.Joker)
                ];
                expect(isAValidCombo(combo, mode)).toBe(true);
            });
        });

        describe('Bomb Ni Bomb Mode', () => {
            const mode = GameMode.BombNiBomb;

            it('should allow mixed rank draw cards if they share a suit', () => {
                const combo = [
                    createCard(Rank.Two, Suit.Hearts),
                    createCard(Rank.Three, Suit.Hearts)
                ];
                expect(isAValidCombo(combo, mode)).toBe(true);
            });

            it('should NOT allow mixed rank draw cards if they do NOT share a suit', () => {
                const combo = [
                    createCard(Rank.Two, Suit.Hearts),
                    createCard(Rank.Three, Suit.Spades)
                ];
                expect(isAValidCombo(combo, mode)).toBe(false);
            });

            it('should allow Joker + mixed rank draw cards (same suit)', () => {
                const combo = [
                    createCard(Rank.Two, Suit.Hearts),
                    createCard(Rank.Three, Suit.Hearts),
                    createCard(Rank.Joker)
                ];
                expect(isAValidCombo(combo, mode)).toBe(true);
            });
        });

        describe('Question & Answer Logic', () => {
            const mode = GameMode.Friendly; // Logic is same for both modes

            it('should allow connected Question cards (Rank match)', () => {
                const combo = [
                    createCard(Rank.Queen, Suit.Hearts),
                    createCard(Rank.Queen, Suit.Spades)
                ];
                expect(isAValidCombo(combo, mode)).toBe(true);
            });

            it('should allow connected Question cards (Suit match)', () => {
                const combo = [
                    createCard(Rank.Queen, Suit.Hearts),
                    createCard(Rank.Eight, Suit.Hearts)
                ];
                expect(isAValidCombo(combo, mode)).toBe(true);
            });

            it('should allow complex connected Question chain', () => {
                // Q♥ -> 8♥ -> 8♠
                const combo = [
                    createCard(Rank.Queen, Suit.Hearts),
                    createCard(Rank.Eight, Suit.Hearts),
                    createCard(Rank.Eight, Suit.Spades)
                ];
                expect(isAValidCombo(combo, mode)).toBe(true);
            });

            it('should REJECT disconnected Question cards', () => {
                // Q♥ and 8♠ share nothing
                const combo = [
                    createCard(Rank.Queen, Suit.Hearts),
                    createCard(Rank.Eight, Suit.Spades)
                ];
                expect(isAValidCombo(combo, mode)).toBe(false);
            });

            it('should allow Question + Answer (Suit match)', () => {
                // Q♥ -> 4♥
                const combo = [
                    createCard(Rank.Queen, Suit.Hearts),
                    createCard(Rank.Four, Suit.Hearts)
                ];
                expect(isAValidCombo(combo, mode)).toBe(true);
            });

            it('should allow Question + Multiple Answers (Rank match)', () => {
                // Q♥ -> 4♥ -> 4♠
                const combo = [
                    createCard(Rank.Queen, Suit.Hearts),
                    createCard(Rank.Four, Suit.Hearts),
                    createCard(Rank.Four, Suit.Spades)
                ];
                expect(isAValidCombo(combo, mode)).toBe(true);
            });

            it('should REJECT Question + Answer if no link', () => {
                // Q♥ -> 4♠ (No suit match)
                const combo = [
                    createCard(Rank.Queen, Suit.Hearts),
                    createCard(Rank.Four, Suit.Spades)
                ];
                expect(isAValidCombo(combo, mode)).toBe(false);
            });
        });
    });
});
