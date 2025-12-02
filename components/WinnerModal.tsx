import React, { useState } from 'react';
import { Player } from '../types';
import { cardToString } from '../services/gameLogic';
import { SUIT_COLORS } from '../constants';
import Confetti from './Confetti';

interface WinnerModalProps {
    winner: Player;
    players: Player[];
    onNewGame: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, players, onNewGame }) => {
    const [isMinimized, setIsMinimized] = useState(true);

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                 <div className="relative bg-white/90 p-3 rounded-lg shadow-2xl text-gray-800 flex items-center gap-4 animate-pulse overflow-hidden">
                    <Confetti />
                    <p className="font-bold text-lg z-20">Winner: {winner.name}</p>
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full shadow transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400 z-20"
                        aria-label="Maximize winner details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 0h-4v4M4 16v4h4m12 0h-4v-4" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white/90 p-6 sm:p-8 rounded-xl shadow-2xl text-center text-gray-800 max-w-lg w-full">
                <button
                    onClick={() => setIsMinimized(true)}
                    className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full shadow transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Minimize winner details"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-yellow-600 animate-pulse">WINNER!</h2>
                <p className="text-xl sm:text-2xl mb-4">{winner.name} has won the game!</p>
                <p className="text-sm sm:text-base text-gray-600 mb-2">Here's what everyone else had:</p>
                <div className="text-left text-sm sm:text-base text-gray-700 mb-6 space-y-1 max-h-48 overflow-y-auto bg-gray-100/80 rounded-lg p-3 border border-gray-200">
                    {players.filter(p => p.id !== winner.id && p.hand.length > 0).map(player => (
                        <p key={player.id}>
                            <span className="font-bold text-gray-800">{player.name}</span>
                            <span className="text-gray-600"> had ({player.hand.length} card{player.hand.length !== 1 ? 's' : ''}): </span>
                            <span className="font-mono text-gray-900">
                                {player.hand.map((card, index) => (
                                    <React.Fragment key={`${card.rank}-${card.suit}-${index}`}>
                                        <span className={card.suit ? SUIT_COLORS[card.suit] : 'text-black'}>
                                            {cardToString(card)}
                                        </span>
                                        {index < player.hand.length - 1 && ' + '}
                                    </React.Fragment>
                                ))}
                            </span>
                        </p>
                    ))}
                    {players.filter(p => p.id !== winner.id && p.hand.length > 0).length === 0 && (
                        <p className="text-center text-gray-500 italic">Everyone else also finished!</p>
                    )}
                </div>
                <button 
                    onClick={onNewGame}
                    className="w-48 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                    Play Again
                </button>
            </div>
        </div>
    );
};

export default WinnerModal;