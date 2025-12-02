import React from 'react';
import { GameMode } from '../types';

interface GameSetupProps {
  numberOfOpponents: number;
  gameMode: GameMode;
  onSetNumberOfOpponents: (count: number) => void;
  onSetGameMode: (mode: GameMode) => void;
  onStartGame: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({
  numberOfOpponents,
  gameMode,
  onSetNumberOfOpponents,
  onSetGameMode,
  onStartGame
}) => {
  return (
    <main className="bg-green-800 min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans select-none" style={{ backgroundImage: 'radial-gradient(circle, #388e3c, #1b5e20)' }}>
      <div className="bg-black/30 p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-yellow-200" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Kadi
        </h1>
        <div className="my-6">
          <label htmlFor="player-count" className="text-xl font-semibold text-green-200 block mb-3">
            Opponents: <span className="text-yellow-300 font-bold text-2xl">{numberOfOpponents}</span>
          </label>
          <input
            id="player-count"
            type="range"
            min="1"
            max="3"
            step="1"
            value={numberOfOpponents}
            onChange={(e) => onSetNumberOfOpponents(parseInt(e.target.value, 10))}
            className="w-64 accent-yellow-500"
          />
        </div>

        <div className="my-8">
          <h3 className="text-2xl font-semibold text-green-200 block mb-4">Game Mode</h3>
          <div className="flex justify-center items-start gap-4">
            <div className="text-center">
              <button 
                  onClick={() => onSetGameMode(GameMode.Friendly)}
                  className={`font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 ${
                      gameMode === GameMode.Friendly 
                      ? 'bg-yellow-500 text-gray-900 ring-2 ring-yellow-200' 
                      : 'bg-green-700 text-yellow-200 hover:bg-green-600'
                  }`}
              >
                  Friendly
              </button>
              <p className="text-xs text-green-200 mt-2">Classic Rules</p>
            </div>
            <div className="text-center">
              <button 
                  onClick={() => onSetGameMode(GameMode.BombNiBomb)}
                  className={`font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-110 ${
                      gameMode === GameMode.BombNiBomb 
                      ? 'bg-red-600 text-white ring-2 ring-red-200 shadow-red-500/40' 
                      : 'bg-gray-700 text-red-200 hover:bg-gray-600'
                  }`}
              >
                  Bomb ni Bomb
              </button>
              <p className="text-xs text-red-200 mt-2 font-semibold">Intense & Fast-Paced</p>
            </div>
          </div>
        </div>

        <button
          onClick={onStartGame}
          className="w-48 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          Start Game
        </button>
      </div>
    </main>
  );
};

export default GameSetup;