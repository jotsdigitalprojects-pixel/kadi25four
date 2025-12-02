import React, { useReducer, useMemo, useState, useEffect } from 'react';
import { Rank, Suit } from './types';
import PlayerHand from './components/PlayerHand';
import OpponentStub from './components/OpponentStub';
import GameTable from './components/GameTable';
import PlayerActions from './components/PlayerActions';
import ActionFeedback from './components/ActionFeedback';
import GameSetup from './components/GameSetup';
import WinnerModal from './components/WinnerModal';
import RulesModal from './components/RulesModal';
import SuitSelectionModal from './components/SuitSelectionModal';
import ConfirmationModal from './components/ConfirmationModal';
import PlayerProfileModal from './components/PlayerProfileModal';
import LoginScreen from './components/auth/LoginScreen';
import { gameReducer, initialState } from './state/gameReducer';
import { useGameEffects } from './hooks/useGameEffects';
import { useComputerAI } from './hooks/useComputerAI';
import { isAValidCombo } from './services/gameLogic';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [playerStats, setPlayerStats] = useState({ wins: 0, played: 0 });

  const { winningPlayerIds, isCardPlayableOnPile } = useGameEffects(state, dispatch);

  useComputerAI(state, dispatch);

  const {
    gameStarted,
    players,
    deck,
    activePile,
    currentPlayerIndex,
    selectedCardIndices,
    turnsToSkip,
    drawsToTake,
    promptMessage,
    lastMove,
    isChoosingSuit,
    declaredSuit,
    winner,
    mustDrawPlayerIds,
    gameMode,
    gameOverPending,
    actionFeedback,
  } = state;

  const currentPlayer = players[currentPlayerIndex];
  const humanPlayer = useMemo(() => players.find(p => !p.isComputer), [players]);
  const computerPlayers = useMemo(() => players.filter(p => p.isComputer), [players]);
  const isHumanInWinningState = useMemo(() => humanPlayer && winningPlayerIds.includes(humanPlayer.id), [humanPlayer, winningPlayerIds]);
  const isHumanPlayersTurn = humanPlayer?.id === currentPlayer?.id && !winner;
  const isHumanWinner = winner?.id === humanPlayer?.id;
  const isAnyModalOpen = isRulesModalOpen || isNewGameConfirmOpen || isProfileModalOpen;

  const topCard = useMemo(() => activePile.length > 0 ? activePile[activePile.length - 1] : null, [activePile]);
  const currentActiveSuit = declaredSuit || (topCard?.rank !== Rank.Joker ? topCard?.suit : null);

  const canCounterSkip = useMemo(() => currentPlayer && !currentPlayer.isComputer && currentPlayer.hand.some(c => c.rank === Rank.Jack), [currentPlayer]);
  const canCounterDraw = useMemo(() => {
    if (!humanPlayer || humanPlayer.id !== currentPlayer?.id || drawsToTake <= 0) return false;
    return humanPlayer.hand.some(card =>
      [Rank.Two, Rank.Three, Rank.Joker, Rank.Ace].includes(card.rank) && isCardPlayableOnPile(card)
    );
  }, [humanPlayer, currentPlayer, drawsToTake, isCardPlayableOnPile]);

  useEffect(() => {
    if (winner) {
      setPlayerStats(prevStats => ({
        played: prevStats.played + 1,
        wins: winner.id === humanPlayer?.id ? prevStats.wins + 1 : prevStats.wins,
      }));
    }
  }, [winner, humanPlayer?.id]);

  const isUIBlocked = isChoosingSuit || !!winner || gameOverPending || (currentPlayer && mustDrawPlayerIds.includes(currentPlayer.id)) || isAnyModalOpen || (currentPlayer?.isComputer && gameStarted);
  const canDrawCard = !isUIBlocked && turnsToSkip <= 0 && drawsToTake <= 0 && currentPlayer?.id === humanPlayer?.id;

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="bg-green-800 h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  if (!gameStarted) {
    return (
      <GameSetup
        numberOfOpponents={state.numberOfOpponents}
        gameMode={state.gameMode}
        onSetNumberOfOpponents={(count) => dispatch({ type: 'SET_NUMBER_OF_OPPONENTS', payload: count })}
        onSetGameMode={(mode) => dispatch({ type: 'SET_GAME_MODE', payload: mode })}
        onStartGame={() => dispatch({ type: 'START_GAME' })}
      />
    );
  }

  let humanPlayerGlowClasses = '';
  if (isHumanWinner) {
    humanPlayerGlowClasses = 'ring-4 ring-yellow-300 shadow-lg shadow-yellow-300/70 animate-pulse';
  } else if (isHumanPlayersTurn) {
    humanPlayerGlowClasses = 'ring-4 ring-yellow-400 shadow-yellow-400/50';
  }

  return (
    <main className="bg-green-800 h-screen text-white flex flex-col p-2 font-sans select-none overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle, #388e3c, #1b5e20)' }}>
      {winner && <WinnerModal winner={winner} players={players} onNewGame={() => dispatch({ type: 'NEW_GAME' })} />}
      {isChoosingSuit && humanPlayer?.id === currentPlayerIndex && (
        <SuitSelectionModal onSelectSuit={(suit: Suit) => dispatch({ type: 'SET_DECLARED_SUIT', payload: suit })} />
      )}
      {isRulesModalOpen && <RulesModal onClose={() => setIsRulesModalOpen(false)} gameMode={gameMode} />}
      {isNewGameConfirmOpen && (
        <ConfirmationModal
          isOpen={isNewGameConfirmOpen}
          onClose={() => setIsNewGameConfirmOpen(false)}
          onConfirm={() => {
            dispatch({ type: 'NEW_GAME' });
            setIsNewGameConfirmOpen(false);
          }}
          title="Start New Game?"
          message="This will end your current game. Are you sure?"
          confirmText="Yes, Start New"
          cancelText="Cancel"
        />
      )}
      {isProfileModalOpen && (
        <PlayerProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          stats={playerStats}
          onResetStats={() => {
            setPlayerStats({ wins: 0, played: 0 });
            setIsProfileModalOpen(false);
          }}
        />
      )}

      <header className="w-full flex justify-between items-center px-2 py-1 flex-shrink-0 relative">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsProfileModalOpen(true)} title="Player Profile" className="bg-black/30 p-2 rounded-full shadow-lg transition-transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button onClick={() => setIsNewGameConfirmOpen(true)} className="bg-black/30 p-2 rounded-full shadow-lg transition-transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0114.65-5.65L20 5M20 15a9 9 0 01-14.65 5.65L4 19" />
            </svg>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 p-2 rounded-full shadow-lg">
          <button className="p-1 rounded-full bg-gray-600 cursor-not-allowed" title="Mute/Unmute Mic (coming soon)" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button className="p-1 rounded-full bg-gray-600 cursor-not-allowed" title="Turn Camera On/Off (coming soon)" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="bg-black/30 px-3 py-1 rounded-lg shadow-lg text-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="View game rules"
          >
            <p className="font-semibold text-yellow-200 text-sm">{gameMode === 'FRIENDLY' ? 'Friendly' : 'Bomb ni Bomb'}</p>
          </button>
        </div>
      </header>

      <div className="w-full flex justify-around items-start py-2 flex-shrink-0 gap-2">
        {computerPlayers.map(player => (
          <OpponentStub
            key={player.id}
            player={player}
            isActive={player.id === currentPlayer?.id && !winner}
            isInWinningState={winningPlayerIds.includes(player.id)}
            isWinner={winner?.id === player.id}
          />
        ))}
      </div>

      <div className="flex-grow w-full flex flex-col justify-center items-center relative">
        <ActionFeedback feedback={actionFeedback} />
        <GameTable
          deck={deck}
          activePile={activePile}
          currentActiveSuit={currentActiveSuit}
          onDrawCard={() => {
            dispatch({ type: 'DRAW_CARD' });
            dispatch({ type: 'END_TURN' });
          }}
          canDrawCard={canDrawCard}
        />
        <div className="absolute top-0 w-full h-10 text-center my-1 pointer-events-none">
          {promptMessage && (
            <div className="inline-block bg-black/50 text-yellow-200 font-bold py-2 px-4 rounded-full shadow-lg text-sm">
              {promptMessage}
            </div>
          )}
        </div>
      </div>

      <div className="w-full text-center mb-1 flex-shrink-0">
        {lastMove ? (
          <div className="inline-block bg-black/40 text-sm font-semibold py-1 px-3 rounded-full shadow-md transition-opacity duration-300">
            <span className="text-gray-300 mr-2">Last:</span>
            <span className="text-white font-bold">{lastMove}</span>
          </div>
        ) : <div className="h-[28px]" />}
      </div>

      <div className="w-full flex flex-col items-center justify-center gap-2 mt-auto flex-shrink-0 pb-2">
        {humanPlayer && (
          <>
            <PlayerActions
              turnsToSkip={turnsToSkip}
              canCounterSkip={canCounterSkip}
              drawsToTake={drawsToTake}
              canCounterDraw={canCounterDraw}
              selectedCardIndices={selectedCardIndices}
              isUIBlocked={isUIBlocked}
              onAcceptSkip={() => dispatch({ type: 'ACCEPT_SKIP' })}
              onAcceptDraw={() => dispatch({ type: 'ACCEPT_DRAW' })}
              onPlaySelected={() => dispatch({ type: 'PLAY_SELECTED_CARDS' })}
            />
            <PlayerHand
              player={humanPlayer}
              onCardSelect={(index) => dispatch({ type: 'SELECT_CARD', payload: index })}
              selectedIndices={selectedCardIndices}
              isUIBlocked={isUIBlocked}
              isAValidCombo={(cards) => isAValidCombo(cards, gameMode)}
              isCardPlayable={isCardPlayableOnPile}
              turnsToSkip={turnsToSkip}
              drawsToTake={drawsToTake}
              isInWinningState={isHumanInWinningState}
              isModalOpen={isAnyModalOpen}
            />
          </>
        )}
      </div>

      {humanPlayer && (
        <div className={`fixed bottom-32 left-2 z-30 flex flex-col items-center gap-1 pointer-events-none transition-opacity duration-300 ${!isHumanPlayersTurn && !isHumanWinner ? 'opacity-70' : ''}`}>
          <div className={`w-24 h-24 bg-black/40 rounded-full flex items-center justify-center border-2 border-gray-500 shadow-lg transition-all duration-300 ${humanPlayerGlowClasses}`}>
            <span className="text-5xl font-bold text-gray-200 select-none">
              {humanPlayer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="bg-black/50 px-3 py-1 rounded-full">
            <p className="font-bold text-yellow-200">{humanPlayer.name}</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default App;