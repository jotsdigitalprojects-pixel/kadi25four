import React from 'react';

interface PlayerActionsProps {
  turnsToSkip: number;
  canCounterSkip: boolean;
  drawsToTake: number;
  canCounterDraw: boolean;
  selectedCardIndices: number[];
  isUIBlocked: boolean;
  onAcceptSkip: () => void;
  onAcceptDraw: () => void;
  onPlaySelected: () => void;
}

const PlayerActions: React.FC<PlayerActionsProps> = ({
  turnsToSkip,
  canCounterSkip,
  drawsToTake,
  canCounterDraw,
  selectedCardIndices,
  isUIBlocked,
  onAcceptSkip,
  onAcceptDraw,
  onPlaySelected,
}) => {
  const hasActions = turnsToSkip > 0 || canCounterDraw || selectedCardIndices.length > 0;

  if (isUIBlocked || !hasActions) {
    return <div className="h-12" />; // Reserve space
  }

  return (
    <div className="h-12 flex items-center justify-center gap-4 my-2 flex-wrap">
      {turnsToSkip > 0 && (
        <button
          onClick={onAcceptSkip}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform hover:scale-105 text-sm"
          aria-label="Accept the skip and end your turn"
        >
          Accept Skip
        </button>
      )}
      {canCounterDraw && (
        <button
          onClick={onAcceptDraw}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform hover:scale-105 text-sm"
          aria-label={`Accept and draw ${drawsToTake} cards`}
        >
          Accept Draw ({drawsToTake})
        </button>
      )}
      {selectedCardIndices.length > 0 && (
        <button
          onClick={onPlaySelected}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg shadow-lg transition-transform hover:scale-105 text-sm"
          aria-label={`Play ${selectedCardIndices.length} selected cards`}
        >
          Play Selected ({selectedCardIndices.length})
        </button>
      )}
    </div>
  );
};

export default PlayerActions;