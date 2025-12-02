import React from 'react';
import { Player } from '../types';
import PlayingCard from './PlayingCard';

interface OpponentStubProps {
  player: Player;
  isActive: boolean;
  isInWinningState: boolean;
  isWinner?: boolean;
}

const OpponentStub: React.FC<OpponentStubProps> = ({ player, isActive, isInWinningState, isWinner }) => {
  const baseClasses = 'relative p-2 bg-black/30 rounded-lg flex flex-col items-center gap-1 transition-all duration-300';
  
  let dynamicClasses = '';
  if (isWinner) {
      dynamicClasses = 'ring-4 ring-yellow-300 shadow-lg shadow-yellow-300/70 animate-pulse';
  } else if (isInWinningState) {
      dynamicClasses = 'ring-4 ring-red-500 animate-pulse';
  } else if (isActive) {
      dynamicClasses = 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50';
  } else {
      dynamicClasses = 'opacity-70';
  }

  return (
    <div className={`${baseClasses} ${dynamicClasses}`}>
      {/* Video Placeholder / Avatar */}
      <div className="w-14 h-14 bg-black/40 rounded-full flex items-center justify-center border-2 border-gray-500">
          <span className="text-2xl font-bold text-gray-200 select-none">
              {player.name.charAt(0).toUpperCase()}
          </span>
      </div>

      <div className="text-center">
          <h3 className="text-sm font-bold text-yellow-200 truncate max-w-[80px]">{player.name}</h3>
          <div className="flex items-center justify-center -mt-1">
              <div className="transform scale-50 -mr-2">
                  <PlayingCard faceUp={false} size="small" />
              </div>
              <span className="text-lg font-bold text-white">{player.hand.length}</span>
          </div>
      </div>
      
       {isInWinningState && !isWinner && (
         <div className="absolute top-full mt-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
           NIKO KADI
         </div>
       )}
    </div>
  );
};

export default OpponentStub;