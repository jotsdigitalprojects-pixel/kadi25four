import React, { useEffect, useMemo, useRef } from 'react';
import { GameState } from '../state/gameReducer';
import { isCardPlayable, isWinningHand, isAValidCombo } from '../services/gameLogic';
import { ActionFeedbackData } from '../components/ActionFeedback';
import { Card, Rank, GameMode } from '../types';

export const useGameEffects = (state: GameState, dispatch: React.Dispatch<any>) => {
  const {
    gameStarted,
    players,
    currentPlayerIndex,
    drawsToTake,
    turnsToSkip,
    winner,
    gameOverPending,
    mustDrawPlayerIds,
    activePile,
    declaredSuit,
    isChoosingSuit,
    gameMode,
    skipInitiatorId,
  } = state;
  const currentPlayer = players[currentPlayerIndex];
  const topCard = useMemo(() => activePile.length > 0 ? activePile[activePile.length - 1] : null, [activePile]);

  const winningPlayerIds = useMemo(() => {
    return players
        .filter(player => isWinningHand(player.hand))
        .map(player => player.id);
  }, [players]);

  const isCardPlayableOnPile = React.useCallback((card: Card): boolean => {
    return isCardPlayable(card, topCard, declaredSuit);
  }, [topCard, declaredSuit]);

  // Handle forced "must draw" state for players who won on a special card
  useEffect(() => {
    if (!gameStarted || winner || gameOverPending) return;

    if (currentPlayer && mustDrawPlayerIds.includes(currentPlayer.id)) {
      if (!currentPlayer.isComputer) {
        dispatch({ type: 'SET_PROMPT_MESSAGE', payload: `${currentPlayer.name} must draw a card.` });
      }
      const timer = setTimeout(() => {
        dispatch({ type: 'FORCE_MUST_DRAW' });
        dispatch({ type: 'END_TURN' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, mustDrawPlayerIds, gameStarted, winner, gameOverPending, dispatch]);
  
  // Handle forced draws (e.g., from a 2, 3, or Joker)
  useEffect(() => {
    if (drawsToTake <= 0 || !gameStarted || !currentPlayer || winner || gameOverPending) return;

    const canCounter = currentPlayer.hand.some(c => 
      [Rank.Two, Rank.Three, Rank.Joker, Rank.Ace].includes(c.rank) && isCardPlayableOnPile(c)
    );

    if (canCounter) {
      if (!currentPlayer.isComputer) {
        dispatch({ type: 'SET_PROMPT_MESSAGE', payload: `Draw ${drawsToTake} cards or play a valid counter!` });
      }
    } else {
      dispatch({ type: 'SET_PROMPT_MESSAGE', payload: `${currentPlayer.name} must draw ${drawsToTake} cards!` });
      const timer = setTimeout(() => {
        dispatch({ type: 'FORCE_DRAW' });
        dispatch({ type: 'END_TURN' });
        dispatch({ type: 'INTERNAL_STATE_UPDATE', payload: { actionFeedback: { key: Math.random(), text: `Draw +${drawsToTake}`, type: 'penalty' } } });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, drawsToTake, gameStarted, winner, gameOverPending, isCardPlayableOnPile, dispatch]);

  // Handle skips
  useEffect(() => {
    if (turnsToSkip <= 0 || !gameStarted || !currentPlayer || winner || gameOverPending) return;

    // IMMUNITY CHECK: The player who played the Jacks is immune.
    if (currentPlayer.id === skipInitiatorId) {
        dispatch({ type: 'PASS_IMMUNE_SKIP' });
        return;
    }

    const canCounter = currentPlayer.hand.some(c => c.rank === Rank.Jack);

    if (canCounter) {
      if (!currentPlayer.isComputer) {
        dispatch({ type: 'SET_PROMPT_MESSAGE', payload: 'Play a Jack to counter or accept the skip!' });
      }
    } else {
      dispatch({ type: 'INTERNAL_STATE_UPDATE', payload: { actionFeedback: { key: Math.random(), text: `Skipped`, type: 'special' } } });
      const timer = setTimeout(() => {
        dispatch({ type: 'ACCEPT_SKIP' });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, turnsToSkip, skipInitiatorId, gameStarted, winner, gameOverPending, dispatch]);
  
  // Handle auto-draw for human player with no valid moves
  const currentPlayerHasValidMoves = useMemo(() => {
    if (!currentPlayer) return false;
    if (drawsToTake > 0) return currentPlayer.hand.some(c => [Rank.Two, Rank.Three, Rank.Joker, Rank.Ace].includes(c.rank) && isCardPlayableOnPile(c));
    if (turnsToSkip > 0) return currentPlayer.hand.some(c => c.rank === Rank.Jack);
    if (currentPlayer.hand.some(isCardPlayableOnPile)) return true;

    const ranksInHand = new Map<Rank, Card[]>();
    currentPlayer.hand.forEach(card => {
        if (!ranksInHand.has(card.rank)) ranksInHand.set(card.rank, []);
        ranksInHand.get(card.rank)!.push(card);
    });

    for (const combo of ranksInHand.values()) {
        if (combo.length > 1 && isCardPlayableOnPile(combo[0]) && isAValidCombo(combo, gameMode)) return true;
    }
    return false;
  }, [currentPlayer, drawsToTake, turnsToSkip, isCardPlayableOnPile, gameMode]);

  useEffect(() => {
    if (!gameStarted || winner || gameOverPending || !currentPlayer || currentPlayer.isComputer || isChoosingSuit || drawsToTake > 0 || turnsToSkip > 0 || mustDrawPlayerIds.includes(currentPlayer.id)) return;
    if (!currentPlayerHasValidMoves) {
      dispatch({ type: 'SET_PROMPT_MESSAGE', payload: `${currentPlayer.name} has no valid moves. Drawing...` });
      const timer = setTimeout(() => {
        if (state.players[state.currentPlayerIndex]?.id === currentPlayer.id) {
            dispatch({ type: 'DRAW_CARD' });
            dispatch({ type: 'END_TURN' });
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, winner, isChoosingSuit, currentPlayer, drawsToTake, turnsToSkip, mustDrawPlayerIds, currentPlayerHasValidMoves, gameOverPending, dispatch, state.players, state.currentPlayerIndex]);

  return { winningPlayerIds, isCardPlayableOnPile };
};