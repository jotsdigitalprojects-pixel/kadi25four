import React from 'react';
import { GameMode } from '../types';

interface RulesModalProps {
    onClose: () => void;
    gameMode: GameMode;
}

const RulesModal: React.FC<RulesModalProps> = ({ onClose, gameMode }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/95 p-4 sm:p-6 rounded-xl shadow-2xl text-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto font-sans">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-green-800" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
          Game Rules! ({gameMode === GameMode.Friendly ? 'Friendly Mode' : 'Bomb ni Bomb Mode'})
        </h2>
        <div className="space-y-4 text-sm sm:text-base">
          <div>
            <h3 className="text-xl font-bold text-yellow-700">🎯 The Goal</h3>
            <p>Be the first player to empty your hand! But watch out - your <strong>very last card</strong> played must be a "normal" number card (4, 5, 6, 7, 9, 10). If you go out on a special card, you'll have to draw a new card when your turn comes back around.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-yellow-700">🎮 How to Play</h3>
            <p>On your turn, you can:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
              <li><strong>Play a card:</strong> Match the top card on the pile by its <strong>suit</strong> or <strong>rank</strong>.</li>
              <li><strong>Play a combo:</strong> Play multiple cards of the same rank together!</li>
              <li><strong>Draw a card:</strong> If you can't play, you must draw one card. Your turn ends immediately.</li>
            </ul>
            <p className="mt-2 text-xs sm:text-sm bg-green-100 p-2 rounded-lg">
              <strong>Key Combo Rule:</strong> The <strong>first card</strong> you select *must* be a valid move. The <strong>last card</strong> you select is what goes on top and its special power is used!
              {gameMode === GameMode.BombNiBomb && (
                  <span className="block mt-1"><strong>Bomb ni Bomb Rule:</strong> You can combine different draw cards (2s, 3s, Jokers) in one play. Any non-Jokers in the combo must share the same suit.</span>
              )}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-yellow-700">✨ Special Cards (The Chaos Creators!)</h3>
            <ul className="list-none space-y-2 mt-2">
              <li><strong>2️⃣ & 3️⃣:</strong> Make the next player draw 2 or 3 cards.
                {gameMode === GameMode.Friendly ? (
                    <span className="block text-gray-600 text-xs sm:text-sm pl-4">When a player counters, the penalty is <strong>replaced</strong> by the new card's value.</span>
                ) : (
                    <span className="block text-gray-600 text-xs sm:text-sm pl-4">Penalties are <strong>cumulative</strong>! If you counter a "Draw 2" with a "Draw 3", the next player must draw 5!</span>
                )}
              </li>
              <li><strong>🃏 Joker:</strong> A wild card that makes the next player draw 5!</li>
              <li><strong>🅰️ Ace (The Ultimate Wild Card):</strong> The most flexible card!
                <ul className="list-disc list-inside ml-4 mt-1">
                    <li><strong>Play it normally?</strong> You get to choose the next suit.</li>
                    <li><strong>Facing a draw?</strong> A single Ace <strong>cancels the penalty</strong>, and its suit becomes the new active suit.</li>
                    <li><strong>Facing a draw with TWO Aces?</strong> Play them both to <strong>cancel the penalty AND choose the next suit!</strong></li>
                </ul>
              </li>
              <li><strong>👑 King (Kickback!):</strong> Reverses the direction of play. Two Kings cancel each other out.</li>
              <li><strong>J️⃣ Jack (Skip!):</strong> Skips the next player's turn. They can play their own Jack to counter you!</li>
              <li><strong>Q & 8 (Question Cards 🤔):</strong>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Play it alone?</strong> You must draw one card.</li>
                    <li><strong>Play with an "Answer"?</strong> Combine it with other cards (Jacks & Kings are not allowed as answers).
                        <ul className="list-['-_'] list-inside ml-5 mt-1 text-gray-600 text-xs sm:text-sm">
                            <li>The first non-Joker answer must match the Question card's suit.</li>
                            <li>All other non-Joker answers must match the first answer's rank.</li>
                            <li>If the <strong>last card</strong> you play is a special card (like a 2, Ace, or Joker), its power takes effect, but you can't win the game with that play.</li>
                        </ul>
                    </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="w-40 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
