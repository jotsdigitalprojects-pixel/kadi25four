import React from 'react';
import { Card, Suit } from '../types';
import PlayingCard from './PlayingCard';
import { SUIT_COLORS, SUIT_SYMBOLS } from '../constants';

interface GameTableProps {
  deck: Card[];
  activePile: Card[];
  currentActiveSuit: Suit | null;
  onDrawCard: () => void;
  canDrawCard: boolean;
}

const GameTable: React.FC<GameTableProps> = ({ deck, activePile, currentActiveSuit, onDrawCard, canDrawCard }) => {
  const visibleActiveCards = activePile.slice(Math.max(activePile.length - 4, 0));

  return (
    <div className="w-full flex-grow flex items-center justify-center relative">
      {currentActiveSuit && (
        <div 
            className={`absolute text-8xl font-bold opacity-20 transition-opacity duration-500 ${SUIT_COLORS[currentActiveSuit]}`}
            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}
            aria-hidden="true"
        >
            {SUIT_SYMBOLS[currentActiveSuit]}
        </div>
      )}
      <div className="flex items-center justify-center gap-8 z-10">
        {/* Draw Deck */}
        <div className="flex flex-col items-center">
          <button
            className={`relative ${canDrawCard ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : 'cursor-not-allowed opacity-70'}`}
            title={canDrawCard ? "Draw a card" : "Cannot draw a card right now"}
            aria-label="Draw deck"
            onClick={canDrawCard ? onDrawCard : undefined}
            disabled={!canDrawCard}
          >
            {deck.length > 0 ? <PlayingCard faceUp={false} size="medium" /> : <PlayingCard size="medium" />}
          </button>
          <p className="mt-2 font-semibold text-base">Deck ({deck.length})</p>
        </div>
        
        {/* Discard Pile */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-28">
            {visibleActiveCards.length === 0 ? (
              <PlayingCard size="medium" />
            ) : (
              visibleActiveCards.map((card, index) => (
                <div
                  key={`${card.rank}-${card.suit}-${index}`}
                  className="absolute top-0 left-0"
                  style={{
                    transform: `translateX(${index * 15}px) rotate(${index * 2 - 3}deg)`,
                    zIndex: index,
                  }}
                >
                  <PlayingCard card={card} faceUp={true} size="medium" />
                </div>
              ))
            )}
          </div>
          <p className="mt-2 font-semibold text-base">Pile</p>
        </div>
      </div>
    </div>
  );
};

export default GameTable;