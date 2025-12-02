import { useEffect } from 'react';
import { GameState } from '../state/gameReducer';
import { Card, Rank, Suit } from '../types';
import { SUITS } from '../constants';
import { isCardPlayable, isAValidCombo } from '../services/gameLogic';

type AiMove =
  | { type: 'PLAY'; indices: number[] }
  | { type: 'DRAW' }
  | { type: 'ACCEPT_DRAW' }
  | { type: 'ACCEPT_SKIP' }
  | { type: 'CHOOSE_SUIT'; suit: Suit };

export const useComputerAI = (state: GameState, dispatch: React.Dispatch<any>) => {
  const {
    gameStarted,
    players,
    currentPlayerIndex,
    isChoosingSuit,
    winner,
    gameOverPending,
    mustDrawPlayerIds,
    drawsToTake,
    turnsToSkip,
    activePile,
    declaredSuit,
    gameMode,
  } = state;
  const currentPlayer = players[currentPlayerIndex];
  const topCard = activePile.length > 0 ? activePile[activePile.length - 1] : null;

  useEffect(() => {
    if (!gameStarted || !currentPlayer?.isComputer || winner || gameOverPending || isChoosingSuit) return;

    if (mustDrawPlayerIds.includes(currentPlayer.id)) {
      const timer = setTimeout(() => {
        dispatch({ type: 'FORCE_MUST_DRAW' });
      }, 1500);
      return () => clearTimeout(timer);
    }
    
    const decideMove = (): AiMove => {
      if (drawsToTake > 0) {
        const playableAces = currentPlayer.hand
          .map((c, i) => ({ card: c, index: i }))
          .filter(item => item.card.rank === Rank.Ace && isCardPlayable(item.card, topCard, declaredSuit));
        if (playableAces.length >= 2) return { type: 'PLAY', indices: playableAces.slice(0, 2).map(a => a.index) };
        if (playableAces.length >= 1) return { type: 'PLAY', indices: [playableAces[0].index] };
        
        const playableDrawCounters = currentPlayer.hand
          .map((c, i) => ({ card: c, index: i }))
          .filter(item => [Rank.Two, Rank.Three, Rank.Joker].includes(item.card.rank) && isCardPlayable(item.card, topCard, declaredSuit));
        if (playableDrawCounters.length > 0) return { type: 'PLAY', indices: [playableDrawCounters[0].index] };
        
        return { type: 'ACCEPT_DRAW' };
      }

      if (turnsToSkip > 0) {
        const jacks = currentPlayer.hand.map((c, i) => ({ card: c, index: i })).filter(item => item.card.rank === Rank.Jack);
        if (jacks.length > 0) return { type: 'PLAY', indices: [jacks[0].index] };
        return { type: 'ACCEPT_SKIP' };
      }

      let bestPlay: number[] = [];
      const ranksInHand = new Map<Rank, number[]>();
      currentPlayer.hand.forEach((card, index) => {
        if (!ranksInHand.has(card.rank)) ranksInHand.set(card.rank, []);
        ranksInHand.get(card.rank)!.push(index);
      });

      for (const indices of ranksInHand.values()) {
        if (indices.length > bestPlay.length) {
          const comboCards = indices.map(i => currentPlayer.hand[i]);
          if (isCardPlayable(comboCards[0], topCard, declaredSuit) && isAValidCombo(comboCards, gameMode)) {
            bestPlay = indices;
          }
        }
      }
      if (bestPlay.length > 1) {
        return { type: 'PLAY', indices: bestPlay };
      }

      const singlePlays = currentPlayer.hand
        .map((card, index) => ({ card, index }))
        .filter(item => isCardPlayable(item.card, topCard, declaredSuit));
      if (singlePlays.length > 0) {
        return { type: 'PLAY', indices: [singlePlays[0].index] };
      }

      return { type: 'DRAW' };
    };
    
    const turnTimer = setTimeout(() => {
        const move = decideMove();
        switch (move.type) {
            case 'PLAY':
                dispatch({ type: 'PLAY_SELECTED_CARDS', payload: { indices: move.indices } });
                break;
            case 'DRAW':
                dispatch({ type: 'DRAW_CARD' });
                dispatch({ type: 'END_TURN' });
                break;
            case 'ACCEPT_DRAW':
                dispatch({ type: 'ACCEPT_DRAW' });
                break;
            case 'ACCEPT_SKIP':
                dispatch({ type: 'ACCEPT_SKIP' });
                break;
        }
    }, 2000);

    return () => clearTimeout(turnTimer);

  }, [
      gameStarted,
      currentPlayer,
      winner,
      gameOverPending,
      mustDrawPlayerIds,
      drawsToTake,
      turnsToSkip,
      dispatch,
      topCard,
      declaredSuit,
      gameMode,
    ]);

  // Effect for choosing a suit
  useEffect(() => {
    if (!gameStarted || !currentPlayer?.isComputer || winner || gameOverPending || !isChoosingSuit) return;

    const timer = setTimeout(() => {
        const suitCounts: Record<Suit, number> = { [Suit.Hearts]: 0, [Suit.Diamonds]: 0, [Suit.Clubs]: 0, [Suit.Spades]: 0 };
        currentPlayer.hand.forEach(c => {
          if (c.suit) suitCounts[c.suit]++;
        });
        
        const suitEntries = Object.entries(suitCounts) as [Suit, number][];
        let bestSuit: Suit = SUITS[0];

        if (suitEntries.length > 0) {
            suitEntries.sort(([, countA], [, countB]) => countB - countA);
            if(suitEntries[0][1] > 0) {
                bestSuit = suitEntries[0][0];
            } else {
                bestSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
            }
        } else {
            bestSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
        }
        dispatch({ type: 'SET_DECLARED_SUIT', payload: bestSuit });
      }, 1500);
      return () => clearTimeout(timer);
  }, [gameStarted, currentPlayer, winner, gameOverPending, isChoosingSuit, dispatch]);
};
