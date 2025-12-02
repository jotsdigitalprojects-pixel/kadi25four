import { Card, Rank, Suit, GameMode, Player } from '../types';
import { SUIT_SYMBOLS } from '../constants';
import { shuffleDeck } from './deckService';

// Not exported, helper for this module
const areQuestionCardsAValidSet = (questionCards: Card[]): boolean => {
  if (questionCards.length <= 1) {
    return true;
  }

  const visited = new Array(questionCards.length).fill(false);
  const queue: number[] = [0]; // Start BFS from the first card
  visited[0] = true;
  let count = 1;

  while (queue.length > 0) {
    const uIndex = queue.shift()!;
    const uCard = questionCards[uIndex];

    for (let vIndex = 0; vIndex < questionCards.length; vIndex++) {
      if (!visited[vIndex]) {
        const vCard = questionCards[vIndex];
        // Check for connection (same rank or same suit)
        if (uCard.rank === vCard.rank || uCard.suit === vCard.suit) {
          visited[vIndex] = true;
          queue.push(vIndex);
          count++;
        }
      }
    }
  }

  // If all cards were visited, the graph is connected.
  return count === questionCards.length;
};

export const isCardPlayable = (card: Card, topCard: Card | null, declaredSuit: Suit | null): boolean => {
  if (declaredSuit) {
    return card.suit === declaredSuit || card.rank === Rank.Ace || card.rank === Rank.Joker;
  }
  if (!topCard) {
    return true;
  }
  if (card.rank === Rank.Ace || card.rank === Rank.Joker) {
    return true;
  }
  if (topCard.rank === Rank.Joker) {
    return true;
  }
  return card.rank === topCard.rank || card.suit === topCard.suit;
};

export const isWinningHand = (hand: Card[]): boolean => {
  if (!hand || hand.length === 0) return false;

  // RULE: A Joker can never be part of a final, winning hand.
  if (hand.some(card => card.rank === Rank.Joker)) {
    return false;
  }

  const specialRanks = [Rank.Two, Rank.Three, Rank.Ace, Rank.Jack, Rank.King, Rank.Joker, Rank.Queen, Rank.Eight];
  const questionRanks = [Rank.Queen, Rank.Eight];
  const forbiddenAnswerRanks = [Rank.Jack, Rank.King];

  const questionCards = hand.filter(c => questionRanks.includes(c.rank));

  if (questionCards.length > 0) {
    // This is a potential Question & Answer winning hand.
    const answerCards = hand.filter(c => !questionRanks.includes(c.rank));

    // A Q&A play must have at least one answer.
    if (answerCards.length === 0) return false;

    // Answers cannot be Jacks or Kings.
    if (answerCards.some(c => forbiddenAnswerRanks.includes(c.rank))) return false;

    // The question cards themselves must form a valid group.
    if (!areQuestionCardsAValidSet(questionCards)) return false;

    // An Ace is a wild answer. Any other non-Ace answer must form a valid sequence.
    const nonAceAnswers = answerCards.filter(c => c.rank !== Rank.Ace);

    // At least one non-Ace answer must link by suit to a question card.
    const potentialLinkingAnswers = nonAceAnswers.filter(answer =>
      questionCards.some(question => question.suit === answer.suit)
    );

    // If there are non-Ace answers, there must be a link. If all answers are Aces, a link is not needed but it's not a winning hand anyway.
    if (nonAceAnswers.length > 0 && potentialLinkingAnswers.length === 0) return false;

    // Check if the remaining non-Ace answers form a valid rank sequence.
    const isAValidSequencePossible = potentialLinkingAnswers.some(linkingAnswer => {
      const otherAnswers = nonAceAnswers.filter(a => a !== linkingAnswer);
      return otherAnswers.every(a => a.rank === linkingAnswer.rank);
    });

    if (nonAceAnswers.length > 1 && !isAValidSequencePossible) return false;

    // Finally, the crucial part: there must be at least one non-special answer card
    // that can be played last to win the game.
    const nonSpecialAnswers = answerCards.filter(c => !specialRanks.includes(c.rank));
    return nonSpecialAnswers.length > 0;
  }

  // This is a potential standard combo winning hand (e.g., three 4s).
  const firstRank = hand[0].rank;
  if (hand.every(card => card.rank === firstRank)) {
    // The rank must not be a special rank.
    return !specialRanks.includes(firstRank);
  }

  return false;
};

export const isAValidCombo = (potentialPlay: Card[], gameMode: GameMode): boolean => {
  if (potentialPlay.length <= 1) return true;

  const questionRanks = [Rank.Queen, Rank.Eight];
  const forbiddenAnswerRanks = [Rank.Jack, Rank.King];

  const questionCards = potentialPlay.filter(c => questionRanks.includes(c.rank));
  const answerCards = potentialPlay.filter(c => !questionRanks.includes(c.rank));

  // This is a potential Question & Answer play
  if (questionCards.length > 0) {
    // If there are no answer cards, it's a "questions only" play. They just need to be connected.
    if (answerCards.length === 0) {
      return areQuestionCardsAValidSet(questionCards);
    }

    // If there are answer cards, it's a full Q&A play.
    // First, the question cards must form a valid connected set on their own.
    if (!areQuestionCardsAValidSet(questionCards)) return false;

    // The first card selected must be a question card for a Q&A play.
    if (!questionRanks.includes(potentialPlay[0].rank)) {
      return false;
    }

    // Answers cannot be Jacks or Kings.
    if (answerCards.some(c => forbiddenAnswerRanks.includes(c.rank))) return false;

    const nonWildAnswers = answerCards.filter(c => c.rank !== Rank.Joker && c.rank !== Rank.Ace);
    if (nonWildAnswers.length > 0) {
      const potentialLinkingAnswers = nonWildAnswers.filter(answer =>
        questionCards.some(question => question.suit === answer.suit)
      );

      if (potentialLinkingAnswers.length === 0) return false;

      const isAValidSequencePossible = potentialLinkingAnswers.some(linkingAnswer => {
        const otherAnswers = nonWildAnswers.filter(a => a !== linkingAnswer);
        return otherAnswers.every(a => a.rank === linkingAnswer.rank);
      });

      if (!isAValidSequencePossible) return false;
    }
    return true;
  }

  // --- From here, we know there are no question cards in the play ---

  // Check if this is a "Draw Combo" (consisting ONLY of 2s, 3s, and Jokers)
  const isDrawCombo = potentialPlay.every(c => [Rank.Two, Rank.Three, Rank.Joker].includes(c.rank));

  if (isDrawCombo) {
    const nonJokers = potentialPlay.filter(c => c.rank !== Rank.Joker);

    // If it's ONLY jokers, it's valid.
    if (nonJokers.length === 0) return true;

    if (gameMode === GameMode.BombNiBomb) {
      // In BombNiBomb, mixed-rank draw cards are allowed, but non-jokers must share a suit.
      if (nonJokers.length > 1) {
        const firstSuit = nonJokers[0].suit;
        return nonJokers.every(c => c.suit === firstSuit);
      }
      return true;
    } else { // Friendly Mode
      // In Friendly mode, mixed-rank draw cards are NOT allowed. All non-jokers must be the same rank.
      const firstRank = nonJokers[0].rank;
      return nonJokers.every(c => c.rank === firstRank);
    }
  }

  // If it's not a draw combo, it must be a standard "Same Rank" combo.
  // Jokers cannot be used in standard combos (except as part of a draw combo, handled above).
  if (potentialPlay.some(c => c.rank === Rank.Joker)) return false;

  const firstRank = potentialPlay[0].rank;
  return potentialPlay.every(c => c.rank === firstRank);
};

export const cardToString = (card: Card): string => {
  if (card.rank === Rank.Joker) return 'Joker';
  if (!card.suit) return card.rank;
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
};

export const cardToLongString = (card: Card): string => {
  if (card.rank === Rank.Joker) return 'Joker';
  if (!card.suit) return card.rank;
  const suitName = card.suit.charAt(0).toUpperCase() + card.suit.slice(1).toLowerCase();
  return `${card.rank} of ${suitName}`;
};

export const drawOneCard = (deck: Card[], activePile: Card[]) => {
  let deckToDrawFrom = [...deck];
  let pileToUpdate = [...activePile];
  let didReshuffle = false;
  if (deckToDrawFrom.length === 0) {
    if (pileToUpdate.length <= 1) {
      return { drawnCard: null, newDeck: deckToDrawFrom, newPile: pileToUpdate, didReshuffle };
    }
    const topCardFromPile = pileToUpdate.pop()!;
    deckToDrawFrom = shuffleDeck(pileToUpdate.slice(0, pileToUpdate.length));
    pileToUpdate = [topCardFromPile];
    didReshuffle = true;
  }
  const drawnCard = deckToDrawFrom.pop()!;
  return { drawnCard, newDeck: deckToDrawFrom, newPile: pileToUpdate, didReshuffle };
};