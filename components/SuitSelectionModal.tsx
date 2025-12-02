import React from 'react';
import { Suit } from '../types';
import { SUITS, SUIT_COLORS, SUIT_SYMBOLS } from '../constants';

interface SuitSelectionModalProps {
    onSelectSuit: (suit: Suit) => void;
}

const SuitSelectionModal: React.FC<SuitSelectionModalProps> = ({ onSelectSuit }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 p-6 sm:p-8 rounded-xl shadow-2xl text-center text-gray-800">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">Choose the next suit</h2>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    {SUITS.map(suit => (
                        <button 
                            key={suit}
                            onClick={() => onSelectSuit(suit)}
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full text-4xl sm:text-5xl flex items-center justify-center transition-transform hover:scale-110 shadow-lg ${SUIT_COLORS[suit]}`}
                            style={{ backgroundColor: 'white' }}
                            aria-label={`Choose ${suit}`}
                        >
                            {SUIT_SYMBOLS[suit]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SuitSelectionModal;
