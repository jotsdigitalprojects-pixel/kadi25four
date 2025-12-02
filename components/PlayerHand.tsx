import React from 'react';
import { Player, Card, Rank } from '../types';
import PlayingCard from './PlayingCard';

interface PlayerHandProps {
  player: Player;
  onCardSelect: (cardIndex: number) => void;
  selectedIndices: number[];
  isUIBlocked: boolean;
  isAValidCombo: (cards: Card[]) => boolean;
  isCardPlayable: (card: Card) => boolean;
  turnsToSkip: number;
  drawsToTake: number;
  isInWinningState: boolean;
  isModalOpen: boolean;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  onCardSelect,
  selectedIndices = [],
  isUIBlocked = false,
  isAValidCombo,
  isCardPlayable,
  turnsToSkip,
  drawsToTake,
  isInWinningState,
  isModalOpen,
}) => {
  const hand = player.hand;
  const numCards = hand.length;
  const canPlayerInteract = !isUIBlocked;

  const getCardStyle = (index: number): React.CSSProperties => {
    if (numCards <= 1) {
      return {
        transform: 'translateY(0px) rotate(0deg)',
        transformOrigin: 'bottom center',
        zIndex: 0,
        position: 'absolute',
        bottom: 0,
        transition: 'transform 0.2s ease-out',
      };
    }

    // --- Dynamic layout adjustments for better spacing with more cards ---
    const baseSpacing = 40;
    const baseArc = 25;
    const baseTranslateY = 8;
    
    // As card count increases, decrease horizontal spacing to fit them.
    const compressionThreshold = 7; // Start compressing after this many cards
    const compressionFactor = numCards > compressionThreshold 
      ? 1 - (numCards - compressionThreshold) * 0.055 // Decrease spacing for each card over threshold
      : 1;
      
    const horizontalSpacing = Math.max(20, baseSpacing * compressionFactor); // Enforce a minimum spacing

    // With more cards, a wider arc helps distinguish them.
    const totalArcDegrees = Math.min(60, baseArc + numCards * 1.5);
    
    // With a wider arc, adjust vertical lift to maintain a gentle curve.
    const translateYMultiplier = Math.max(4, baseTranslateY - numCards / 5);

    // --- Calculation ---
    const baseRotation = -totalArcDegrees / 2;
    const rotationPerCard = totalArcDegrees / (numCards - 1);
    const rotation = baseRotation + (index * rotationPerCard);

    const centerIndex = (numCards - 1) / 2;
    const distanceFromCenter = index - centerIndex;
    
    const translateY = Math.abs(distanceFromCenter) * translateYMultiplier;

    const translateX = distanceFromCenter * horizontalSpacing;

    return {
      transform: `translateX(${translateX}px) rotate(${rotation}deg) translateY(${translateY}px)`,
      transformOrigin: 'bottom center',
      zIndex: index,
      position: 'absolute',
      bottom: 0,
      transition: 'transform 0.2s ease-out',
    };
  };


  return (
    <div className="w-full flex justify-center items-end h-48 relative">
      {isInWinningState && !isModalOpen && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-600 text-white text-lg font-bold px-4 py-1 rounded-full animate-pulse z-50">
          NIKO KADI
        </div>
      )}
      {hand.map((card, index) => {
        const isSelected = selectedIndices.includes(index);
        
        // Calculate selection order (1-based)
        const selectionOrderIndex = selectedIndices.indexOf(index);
        const selectionBadge = selectionOrderIndex !== -1 ? selectionOrderIndex + 1 : undefined;

        const isCardCurrentlySelectable = (() => {
            if (!canPlayerInteract) return false;
            if (isSelected) return true;

            const selectedCards = selectedIndices.map(i => player.hand[i]);
            const potentialPlay = [...selectedCards, card];

            if (drawsToTake > 0) {
                const isCounterCard = [Rank.Two, Rank.Three, Rank.Joker, Rank.Ace].includes(card.rank);
                if (!isCounterCard) return false;
                if (selectedIndices.length === 0) return isCardPlayable(card);
                const selectedContainsAce = selectedCards.some(c => c.rank === Rank.Ace);
                if (selectedContainsAce) {
                  return card.rank === Rank.Ace && selectedCards.length < 2;
                }
                if (card.rank === Rank.Ace) return false;
                return isAValidCombo(potentialPlay);
            }

            if (turnsToSkip > 0) {
                return card.rank === Rank.Jack;
            }
            
            if (!isAValidCombo(potentialPlay)) return false;
            
            return selectedIndices.length === 0 ? isCardPlayable(card) : true;
        })();
        
        const cardStyle = getCardStyle(index);
        const selectedStyle: React.CSSProperties = isSelected ? { transform: `${cardStyle.transform} translateY(-20px)` } : {};

        return (
          <div
            key={`${card.rank}-${card.suit}-${index}`}
            className={`
              ${isCardCurrentlySelectable ? 'cursor-pointer' : ''} 
              ${canPlayerInteract && !isCardCurrentlySelectable ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ ...cardStyle, ...selectedStyle }}
            onClick={() => canPlayerInteract && isCardCurrentlySelectable && onCardSelect(index)}
            onKeyDown={(e) => { if (e.key === 'Enter' && canPlayerInteract && isCardCurrentlySelectable) onCardSelect(index); }}
            role={canPlayerInteract ? "button" : undefined}
            tabIndex={canPlayerInteract && isCardCurrentlySelectable ? 0 : -1}
            aria-pressed={isSelected}
            aria-disabled={!isCardCurrentlySelectable}
          >
            <div className="hover:!translate-y-[-10px] transition-transform duration-200">
               <PlayingCard 
                    card={card} 
                    faceUp={true} 
                    size="large" 
                    selectionIndex={selectionBadge}
               />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerHand;