import React from 'react';

interface PlayerStats {
    wins: number;
    played: number;
}

interface PlayerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: PlayerStats;
    onResetStats: () => void;
}

const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ isOpen, onClose, stats, onResetStats }) => {
    if (!isOpen) {
        return null;
    }

    const winRate = stats.played > 0 ? ((stats.wins / stats.played) * 100).toFixed(0) : 0;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 p-6 sm:p-8 rounded-xl shadow-2xl text-center text-gray-800 max-w-md w-full relative">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Your Profile</h2>

                <div className="flex items-center justify-center mb-6">
                    <div className="w-24 h-24 bg-black/40 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-lg">
                        <span className="text-5xl font-bold text-gray-200 select-none">Y</span>
                    </div>
                </div>

                <div className="space-y-4 text-left bg-gray-100/80 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600">Games Played:</span>
                        <span className="font-bold text-lg text-gray-900">{stats.played}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600">Games Won:</span>
                        <span className="font-bold text-lg text-green-600">{stats.wins}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-600">Win Rate:</span>
                        <span className="font-bold text-lg text-yellow-700">{winRate}%</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="w-32 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                    >
                        Close
                    </button>
                    <button
                        onClick={onResetStats}
                        className="w-32 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-transform hover:scale-105"
                    >
                        Reset Stats
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayerProfileModal;