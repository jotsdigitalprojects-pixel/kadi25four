import React from 'react';
import { Card, Rank } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface PlayingCardProps {
  card?: Card | null;
  faceUp?: boolean;
  size?: 'small' | 'medium' | 'large';
  selectionIndex?: number;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card, faceUp = false, size = 'large', selectionIndex }) => {
    const sizeClasses = {
        small: {
            container: 'w-12 h-16 rounded-md shadow-sm border',
            symbol: 'text-2xl',
            corner: 'text-xs',
            cornerPos: 'top-0.5 left-0.5',
            cornerPosRotated: 'bottom-0.5 right-0.5',
            jokerText: 'text-[8px]',
            jokerEmoji: 'text-2xl',
            badge: 'w-4 h-4 text-[10px] -top-1 -right-1 border'
        },
        medium: {
            container: 'w-20 h-28 rounded-lg shadow-md border-2',
            symbol: 'text-4xl',
            corner: 'text-lg',
            cornerPos: 'top-1 left-1',
            cornerPosRotated: 'bottom-1 right-1',
            jokerText: 'text-base',
            jokerEmoji: 'text-4xl',
            badge: 'w-6 h-6 text-sm -top-2 -right-2 border-2'
        },
        large: {
            container: 'w-24 h-36 rounded-lg shadow-lg border-2',
            symbol: 'text-5xl',
            corner: 'text-xl',
            cornerPos: 'top-1 left-2',
            cornerPosRotated: 'bottom-1 right-2',
            jokerText: 'text-xl',
            jokerEmoji: 'text-5xl',
            badge: 'w-7 h-7 text-base -top-2 -right-2 border-2'
        }
    };

  const s = sizeClasses[size] || sizeClasses.large;
  const cardBaseClasses = `${s.container} flex items-center justify-center p-1 transition-transform duration-300`;

  const renderBadge = () => {
      if (selectionIndex === undefined || selectionIndex === null) return null;
      return (
          <div className={`absolute ${s.badge} bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md z-20 border-white`}>
              {selectionIndex}
          </div>
      );
  };

  if (!faceUp) {
    return (
      <div className={`${cardBaseClasses} bg-blue-500 border-blue-700 relative`}>
        <div className="w-full h-full rounded-md border-2 border-blue-300 flex items-center justify-center">
            <div className={`text-blue-200 font-bold ${size === 'small' ? 'text-xl' : 'text-4xl'}`}>?</div>
        </div>
      </div>
    );
  }

  if (!card) {
    return <div className={`${cardBaseClasses} bg-gray-200 border-gray-300`}></div>;
  }

  if (card.rank === Rank.Joker) {
    return (
      <div className={`${cardBaseClasses} bg-white border-gray-300 relative`}>
        {renderBadge()}
        <div className={`absolute font-bold text-purple-600 ${s.cornerPos}`}>
          <div className={`transform origin-top-left ${s.jokerText}`}>JOKER</div>
        </div>
        <div className={s.jokerEmoji}>🃏</div>
        <div className={`absolute font-bold text-purple-600 transform rotate-180 ${s.cornerPosRotated}`}>
          <div className={`transform origin-top-left ${s.jokerText}`}>JOKER</div>
        </div>
      </div>
    );
  }

  const color = card.suit ? SUIT_COLORS[card.suit] : 'text-black';
  const symbol = card.suit ? SUIT_SYMBOLS[card.suit] : '';

  return (
    <div className={`${cardBaseClasses} bg-white border-gray-300 relative`}>
      {renderBadge()}
      <div className={`absolute font-bold ${color} ${s.cornerPos} ${s.corner}`}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
      <div className={`${s.symbol} ${color}`}>{symbol}</div>
      <div className={`absolute font-bold ${color} transform rotate-180 ${s.cornerPosRotated} ${s.corner}`}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
    </div>
  );
};

export default PlayingCard;