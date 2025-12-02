import { Card, Player, Suit, GameMode, Rank } from '../types';
import { createDeck, shuffleDeck } from '../services/deckService';
import { drawOneCard, isAValidCombo, isCardPlayable, cardToString } from '../services/gameLogic';
import { ActionFeedbackData } from '../components/ActionFeedback';

export interface GameState {
  gameStarted: boolean;
  numberOfOpponents: number;
  players: Player[];
  deck: Card[];
  activePile: Card[];
  currentPlayerIndex: number;
  selectedCardIndices: number[];
  turnsToSkip: number;
  drawsToTake: number;
  promptMessage: string | null;
  lastMove: string | null;
  playDirection: 1 | -1;
  isChoosingSuit: boolean;
  declaredSuit: Suit | null;
  winner: Player | null;
  mustDrawPlayerIds: number[];
  gameMode: GameMode;
  gameOverPending: boolean;
  actionFeedback: ActionFeedbackData | null;
  skipInitiatorId: number | null;
}

let feedbackKey = 0;

export const initialState: GameState = {
  gameStarted: false,
  numberOfOpponents: 1,
  players: [],
  deck: [],
  activePile: [],
  currentPlayerIndex: 0,
  selectedCardIndices: [],
  turnsToSkip: 0,
  drawsToTake: 0,
  promptMessage: null,
  lastMove: null,
  playDirection: 1,
  isChoosingSuit: false,
  declaredSuit: null,
  winner: null,
  mustDrawPlayerIds: [],
  gameMode: GameMode.BombNiBomb,
  gameOverPending: false,
  actionFeedback: null,
  skipInitiatorId: null,
};

type Action =
  | { type: 'SET_NUMBER_OF_OPPONENTS'; payload: number }
  | { type: 'SET_GAME_MODE'; payload: GameMode }
  | { type: 'START_GAME' }
  | { type: 'NEW_GAME' }
  | { type: 'SELECT_CARD'; payload: number }
  | { type: 'PLAY_SELECTED_CARDS'; payload?: { indices: number[] } }
  | { type: 'DRAW_CARD' }
  | { type: 'ACCEPT_SKIP' }
  | { type: 'PASS_IMMUNE_SKIP' }
  | { type: 'ACCEPT_DRAW' }
  | { type: 'SET_DECLARED_SUIT'; payload: Suit }
  | { type: 'END_TURN'; payload?: { jacksPlayed?: number; drawsToAdd?: number; direction?: 1 | -1 } }
  | { type: 'FORCE_DRAW' }
  | { type: 'FORCE_MUST_DRAW' }
  | { type: 'SET_WINNER'; payload: Player | null }
  | { type: 'SET_PROMPT_MESSAGE'; payload: string | null }
  | { type: 'INTERNAL_STATE_UPDATE'; payload: Partial<GameState> };

const showFeedback = (text: string, type: ActionFeedbackData['type'], suit?: Suit, persistent?: boolean): ActionFeedbackData => {
    feedbackKey += 1;
    return { key: feedbackKey, text, type, suit, persistent };
};

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_NUMBER_OF_OPPONENTS':
      return { ...state, numberOfOpponents: action.payload };
    
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };

    case 'NEW_GAME':
      return { ...initialState };

    case 'START_GAME': {
      const totalPlayers = state.numberOfOpponents + 1;
      const fullDeck = shuffleDeck(createDeck());
      const allowedRanks: Rank[] = [Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Nine, Rank.Ten];
      const firstActiveCardIndex = fullDeck.findIndex(card => allowedRanks.includes(card.rank));
      let startingCard: Card | undefined = fullDeck.splice(firstActiveCardIndex !== -1 ? firstActiveCardIndex : fullDeck.length - 1, 1)[0];

      const newDeck = fullDeck;
      const initialPlayers: Player[] = [];
      const computerNames = ['Byte', 'Glitch', 'Pixel', 'Vector', 'Matrix', 'Chip', 'Rogue AI', 'Cosmo'];
      const shuffledNames = computerNames.sort(() => 0.5 - Math.random());

      for (let i = 0; i < totalPlayers; i++) {
        const playerName = i === 0 ? 'You' : shuffledNames[i - 1] || `Computer ${i}`;
        initialPlayers.push({ id: i, name: playerName, hand: [], isComputer: i !== 0 });
      }

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < totalPlayers; j++) {
          const card = newDeck.pop();
          if (card) initialPlayers[j].hand.push(card);
        }
      }

      return {
        ...initialState,
        gameStarted: true,
        gameMode: state.gameMode,
        players: initialPlayers,
        deck: newDeck,
        activePile: startingCard ? [startingCard] : [],
        lastMove: `Game started. ${initialPlayers[0].name} to play.`,
        actionFeedback: showFeedback(state.gameMode === 'FRIENDLY' ? 'Friendly Mode' : 'Bomb ni Bomb', 'special'),
      };
    }
    
    case 'SELECT_CARD': {
      const index = action.payload;
      const newSelected = state.selectedCardIndices.includes(index)
        ? state.selectedCardIndices.filter(i => i !== index)
        : [...state.selectedCardIndices, index];
      return { ...state, selectedCardIndices: newSelected };
    }
    
    case 'PLAY_SELECTED_CARDS': {
        const player = state.players[state.currentPlayerIndex];
        if (!player) return state;

        const indicesToPlay = action.payload?.indices ?? state.selectedCardIndices;
        const selectedCards = indicesToPlay.map(index => player.hand[index]);
        if (selectedCards.length === 0) return state;

        const sortedIndices = [...indicesToPlay].sort((a, b) => a - b);
        const topCard = state.activePile.length > 0 ? state.activePile[state.activePile.length - 1] : null;
        const isCardPlayableOnPile = (card: Card): boolean => isCardPlayable(card, topCard, state.declaredSuit);
        
        // --- VALIDATION ---
        if (selectedCards.length > 1 && !isAValidCombo(selectedCards, state.gameMode)) {
            return { ...state, actionFeedback: showFeedback("Invalid Combo", "penalty"), selectedCardIndices: [] };
        }
        if (!isCardPlayableOnPile(selectedCards[0])) {
            const errorMsg = state.declaredSuit ? `Must match ${state.declaredSuit}` : "Invalid Move";
            return { ...state, actionFeedback: showFeedback(errorMsg, "penalty"), selectedCardIndices: [] };
        }
        if (state.turnsToSkip > 0 && selectedCards.some(c => c.rank !== Rank.Jack)) {
            return { ...state, actionFeedback: showFeedback("Must play a Jack", "penalty"), selectedCardIndices: [] };
        }
        if (state.drawsToTake > 0) {
            const isValidCounter = selectedCards.every(c => [Rank.Two, Rank.Three, Rank.Joker, Rank.Ace].includes(c.rank));
            if (!isValidCounter) return { ...state, actionFeedback: showFeedback("Invalid Counter", "penalty"), selectedCardIndices: [] };
            if (selectedCards.some(c => c.rank === Rank.Ace) && (selectedCards.some(c => c.rank !== Rank.Ace) || selectedCards.length > 2)) {
                return { ...state, actionFeedback: showFeedback("Invalid Ace Play", "penalty"), selectedCardIndices: [] };
            }
        }

        // --- APPLY PLAY ---
        let intermediateState = { ...state };
        const newHand = player.hand.filter((_, index) => !sortedIndices.includes(index));
        let updatedPlayers = state.players.map(p => p.id === player.id ? { ...p, hand: newHand } : p);
        let pileAfterPlay = [...state.activePile, ...selectedCards];
        let newDeck = [...state.deck];

        intermediateState = {
            ...intermediateState,
            declaredSuit: null,
            selectedCardIndices: [],
            lastMove: `${player.name} played ${selectedCards.map(cardToString).join(' + ')}.`,
        };

        // --- WIN CONDITION CHECK ---
        if (newHand.length === 0) {
            const lastCardPlayed = selectedCards[selectedCards.length - 1];
            const specialRanks = [Rank.Two, Rank.Three, Rank.Ace, Rank.Jack, Rank.King, Rank.Joker, Rank.Queen, Rank.Eight];
            if (specialRanks.includes(lastCardPlayed.rank)) {
                return {
                    ...intermediateState,
                    players: updatedPlayers,
                    activePile: pileAfterPlay,
                    mustDrawPlayerIds: [...state.mustDrawPlayerIds, player.id],
                    actionFeedback: showFeedback("Must Draw Next Turn", "penalty"),
                };
            } else {
                return {
                    ...intermediateState,
                    players: updatedPlayers,
                    activePile: pileAfterPlay,
                    gameOverPending: true,
                    actionFeedback: showFeedback("Winner!", "special"),
                    winner: player,
                };
            }
        }

        // --- SPECIAL CARD EFFECTS ---
        const questionCardsPlayed = selectedCards.filter(c => [Rank.Queen, Rank.Eight].includes(c.rank));
        const answerCardsPlayed = selectedCards.filter(c => ![Rank.Queen, Rank.Eight].includes(c.rank));
        if (questionCardsPlayed.length > 0 && answerCardsPlayed.length === 0) {
            const { drawnCard, newDeck: d, newPile } = drawOneCard(newDeck, pileAfterPlay);
            newDeck = d;
            pileAfterPlay = newPile;
            if (drawnCard) {
                updatedPlayers = updatedPlayers.map(p => p.id === player.id ? { ...p, hand: [...p.hand, drawnCard] } : p);
            }
        }

        const acesPlayed = selectedCards.filter(card => card.rank === Rank.Ace);
        const jacksPlayed = selectedCards.filter(card => card.rank === Rank.Jack).length;
        const kingsPlayed = selectedCards.filter(card => card.rank === Rank.King).length;

        let finalDrawsToApply: number | undefined = undefined;

        if (acesPlayed.length > 0 && state.drawsToTake > 0) {
            finalDrawsToApply = 0;
            intermediateState = { ...intermediateState, actionFeedback: showFeedback("Draw Cancelled!", "special") };
            if (acesPlayed.length === 2) {
                return { ...intermediateState, isChoosingSuit: true, players: updatedPlayers, activePile: pileAfterPlay, deck: newDeck };
            } else if (acesPlayed[0]?.suit) {
                intermediateState = { ...intermediateState, declaredSuit: acesPlayed[0].suit, actionFeedback: showFeedback(acesPlayed[0].suit, 'suit', acesPlayed[0].suit) };
            }
        } else {
            let playedDrawValue = 0;
            if (state.gameMode === GameMode.BombNiBomb) {
                playedDrawValue = selectedCards.reduce((sum, card) => {
                    if (card.rank === Rank.Two) return sum + 2;
                    if (card.rank === Rank.Three) return sum + 3;
                    if (card.rank === Rank.Joker) return sum + 5;
                    return sum;
                }, 0);
            } else { // Friendly Mode
                const topPlayedCard = selectedCards[selectedCards.length - 1];
                switch (topPlayedCard?.rank) {
                    case Rank.Two: playedDrawValue = 2; break;
                    case Rank.Three: playedDrawValue = 3; break;
                    case Rank.Joker: playedDrawValue = 5; break;
                }
            }

            if (playedDrawValue > 0 || (state.drawsToTake > 0 && acesPlayed.length === 0) ) {
                if (state.gameMode === GameMode.BombNiBomb) {
                    finalDrawsToApply = state.drawsToTake + playedDrawValue;
                } else { // Friendly Mode
                    finalDrawsToApply = playedDrawValue > 0 ? playedDrawValue : state.drawsToTake;
                }
            }
        }
        
        if (acesPlayed.length > 0 && state.drawsToTake <= 0) {
            return { ...intermediateState, isChoosingSuit: true, players: updatedPlayers, activePile: pileAfterPlay, deck: newDeck };
        }

        let nextDirection = state.playDirection;
        if (kingsPlayed > 0 && kingsPlayed % 2 === 1) {
            nextDirection = state.playDirection === 1 ? -1 : 1;
            intermediateState = { ...intermediateState, actionFeedback: showFeedback("Reverse!", "special") };
        }
        
        const nextTurnState = gameReducer(
            { ...intermediateState, players: updatedPlayers, activePile: pileAfterPlay, deck: newDeck, playDirection: nextDirection },
            { type: 'END_TURN', payload: { jacksPlayed, direction: nextDirection, drawsToAdd: finalDrawsToApply } }
        );
        return nextTurnState;
    }

    case 'DRAW_CARD': {
        const player = state.players[state.currentPlayerIndex];
        if (!player) return state;

        const { drawnCard, newDeck, newPile } = drawOneCard(state.deck, state.activePile);
        if (!drawnCard) return state;

        const updatedPlayers = state.players.map(p =>
            p.id === player.id ? { ...p, hand: [...p.hand, drawnCard] } : p
        );

        return {
            ...state,
            players: updatedPlayers,
            deck: newDeck,
            activePile: newPile,
            lastMove: `${player.name} drew a card.`,
            selectedCardIndices: [],
        };
    }

    case 'END_TURN': {
      const { jacksPlayed = 0, direction = state.playDirection, drawsToAdd } = action.payload || {};
      const totalPlayers = state.players.length;
      if (totalPlayers === 0) return state;
      
      let newTurnsToSkip = state.turnsToSkip;
      let newSkipInitiatorId = state.skipInitiatorId;

      if (jacksPlayed > 0) {
        // A counter-play of Jacks REPLACES the current skip count.
        // A new play of Jacks sets the skip count.
        newTurnsToSkip = jacksPlayed;
        newSkipInitiatorId = state.players[state.currentPlayerIndex].id;
      }

      let newDrawsToTake = state.drawsToTake;
      // If a draw value was calculated (e.g. from a '2' or '3'), we update the state.
      // A draw play should clear any pending skips.
      if (drawsToAdd !== undefined) {
        newDrawsToTake = drawsToAdd;
        newTurnsToSkip = 0;
        newSkipInitiatorId = null;
      }
      
      const nextPlayerIndex = (state.currentPlayerIndex + direction + totalPlayers) % totalPlayers;

      return {
        ...state,
        currentPlayerIndex: nextPlayerIndex,
        turnsToSkip: newTurnsToSkip,
        skipInitiatorId: newSkipInitiatorId,
        drawsToTake: newDrawsToTake,
        selectedCardIndices: [],
        promptMessage: null,
        playDirection: direction,
      };
    }

    case 'FORCE_DRAW': {
      let deckToDrawFrom = [...state.deck];
      let pileToUpdate = [...state.activePile];
      const drawnCards: Card[] = [];
      const player = state.players[state.currentPlayerIndex];

      for (let i = 0; i < state.drawsToTake; i++) {
        if (deckToDrawFrom.length === 0) {
          if (pileToUpdate.length <= 1) break;
          const topCardFromPile = pileToUpdate.pop()!;
          deckToDrawFrom = shuffleDeck(pileToUpdate);
          pileToUpdate = [topCardFromPile];
        }
        drawnCards.push(deckToDrawFrom.pop()!);
      }

      const updatedPlayers = state.players.map((p, index) =>
        index === state.currentPlayerIndex ? { ...p, hand: [...p.hand, ...drawnCards] } : p
      );
      
      return {
        ...state,
        players: updatedPlayers,
        deck: deckToDrawFrom,
        activePile: pileToUpdate,
        drawsToTake: 0,
        lastMove: `${player.name} drew ${drawnCards.length} card${drawnCards.length !== 1 ? 's' : ''}.`,
      };
    }

    case 'FORCE_MUST_DRAW': {
      const player = state.players[state.currentPlayerIndex];
      if (!player) return state;

      const { drawnCard, newDeck, newPile } = drawOneCard(state.deck, state.activePile);
      const updatedPlayers = state.players.map((p, index) =>
        index === state.currentPlayerIndex ? { ...p, hand: drawnCard ? [drawnCard] : [] } : p
      );

      return {
        ...state,
        players: updatedPlayers,
        deck: newDeck,
        activePile: newPile,
        lastMove: `${player.name} was forced to draw a card.`,
        mustDrawPlayerIds: state.mustDrawPlayerIds.filter(id => id !== player.id),
      };
    }

    case 'ACCEPT_SKIP': {
      const totalPlayers = state.players.length;
      if (totalPlayers === 0 || state.turnsToSkip <= 0) return state;
      
      const nextPlayerIndex = (state.currentPlayerIndex + state.playDirection + totalPlayers) % totalPlayers;
      const newTurnsToSkip = state.turnsToSkip - 1;

      return {
        ...state,
        lastMove: `${state.players[state.currentPlayerIndex].name} was skipped.`,
        turnsToSkip: newTurnsToSkip,
        skipInitiatorId: newTurnsToSkip === 0 ? null : state.skipInitiatorId,
        currentPlayerIndex: nextPlayerIndex,
        selectedCardIndices: [],
      };
    }

    case 'PASS_IMMUNE_SKIP': {
        const totalPlayers = state.players.length;
        const nextPlayerIndex = (state.currentPlayerIndex + state.playDirection + totalPlayers) % totalPlayers;
        return {
            ...state,
            currentPlayerIndex: nextPlayerIndex,
            lastMove: `${state.players[state.currentPlayerIndex].name} is immune to skip.`,
        };
    }

    case 'ACCEPT_DRAW': {
        const player = state.players[state.currentPlayerIndex];
        if (!player || state.drawsToTake <= 0) return state;

        let deckToDrawFrom = [...state.deck];
        let pileToUpdate = [...state.activePile];
        const drawnCards: Card[] = [];

        for (let i = 0; i < state.drawsToTake; i++) {
            if (deckToDrawFrom.length === 0) {
                if (pileToUpdate.length <= 1) break;
                const topCardFromPile = pileToUpdate.pop()!;
                deckToDrawFrom = shuffleDeck(pileToUpdate);
                pileToUpdate = [topCardFromPile];
            }
            const card = deckToDrawFrom.pop();
            if(card) drawnCards.push(card);
        }

        const updatedPlayers = state.players.map((p, index) =>
            index === state.currentPlayerIndex ? { ...p, hand: [...p.hand, ...drawnCards] } : p
        );

        const intermediateState: GameState = {
            ...state,
            players: updatedPlayers,
            deck: deckToDrawFrom,
            activePile: pileToUpdate,
            drawsToTake: 0,
            lastMove: `${player.name} drew ${drawnCards.length} card${drawnCards.length !== 1 ? 's' : ''}.`,
            promptMessage: null,
            actionFeedback: showFeedback(`Draw +${drawnCards.length}`, 'penalty')
        };

        return gameReducer(intermediateState, { type: 'END_TURN' });
    }
      
    case 'SET_DECLARED_SUIT': {
      const updatedState = {
        ...state,
        declaredSuit: action.payload,
        isChoosingSuit: false,
        lastMove: `${state.players[state.currentPlayerIndex].name} chose ${action.payload}!`,
        actionFeedback: showFeedback(action.payload, 'suit', action.payload),
      };
      return gameReducer(updatedState, { type: 'END_TURN' });
    }

    case 'SET_WINNER':
      return { ...state, winner: action.payload };

    case 'SET_PROMPT_MESSAGE':
      return { ...state, promptMessage: action.payload };

    case 'INTERNAL_STATE_UPDATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}