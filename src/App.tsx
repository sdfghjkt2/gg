import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, BoardMode, PlayerType } from './types';
import {
  createInitialGameState,
  rollFairDice,
  getValidMoveTokenIds,
  executeMove,
  selectBestBotMove,
  COLOR_HEX,
  getHomeStep,
  getGlobalTrackPos,
  isSafeCell,
} from './utils/ludoEngine';
import { get4PTokenCenter } from './utils/boardCoords';
import { soundFx } from './utils/soundEffects';
import defaultGhostImg from './assets/images/ghost_capture_effect_1785335938319.jpg';
import { Board4P } from './components/Board4P';
import { SetupModal } from './components/SetupModal';
import { SettingsModal } from './components/SettingsModal';
import { WinnerModal } from './components/WinnerModal';
import { Settings, Play, Bot, RefreshCw, Sparkles, Dices, Volume2, VolumeX } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Step-by-step animation & sound states
  const [overrideTokenPos, setOverrideTokenPos] = useState<{ playerIndex: number; tokenId: number; step: number } | null>(null);
  const [captureEffectCell, setCaptureEffectCell] = useState<{ x: number; y: number } | null>(null);
  const [isAnimatingMove, setIsAnimatingMove] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getMuted());

  // Custom PNG Ghost Image state stored permanently in localStorage
  const [ghostImageUrl, setGhostImageUrl] = useState<string>(
    () => localStorage.getItem('ludo_custom_ghost_image') || defaultGhostImg
  );

  // Custom Capture Sound effect state stored permanently in localStorage
  const [customCaptureSoundUrl, setCustomCaptureSoundUrl] = useState<string | null>(
    () => {
      const stored = localStorage.getItem('ludo_custom_capture_sound');
      if (stored) {
        soundFx.setCustomCaptureSoundUrl(stored);
        return stored;
      }
      return null;
    }
  );

  const handleUploadGhostImage = useCallback((url: string) => {
    setGhostImageUrl(url);
    try {
      localStorage.setItem('ludo_custom_ghost_image', url);
    } catch (e) {
      console.error('Failed to store ghost image in localStorage', e);
    }
  }, []);

  const handleResetGhostImage = useCallback(() => {
    setGhostImageUrl(defaultGhostImg);
    localStorage.removeItem('ludo_custom_ghost_image');
  }, []);

  const handleUploadCaptureSound = useCallback((url: string) => {
    setCustomCaptureSoundUrl(url);
    soundFx.setCustomCaptureSoundUrl(url);
    try {
      localStorage.setItem('ludo_custom_capture_sound', url);
    } catch (e) {
      console.error('Failed to store custom capture sound in localStorage', e);
    }
  }, []);

  const handleResetCaptureSound = useCallback(() => {
    setCustomCaptureSoundUrl(null);
    soundFx.setCustomCaptureSoundUrl(null);
    localStorage.removeItem('ludo_custom_capture_sound');
  }, []);

  const handleTestCaptureSound = useCallback(() => {
    soundFx.testCaptureSound();
  }, []);

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleToggleMute = useCallback(() => {
    const next = soundFx.toggleMute();
    setIsMuted(next);
  }, []);

  // Load initial persisted game state from server
  useEffect(() => {
    fetch('/api/game/state')
      .then((res) => res.json())
      .then((data) => {
        if (
          data.success &&
          data.state &&
          data.state.mode === '4P' &&
          Array.isArray(data.state.players) &&
          data.state.players.length === 4
        ) {
          setGameState(data.state);
        } else {
          setGameState(createInitialGameState('4P'));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch game state from server:', err);
        setGameState(createInitialGameState('4P'));
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Save game state to server whenever it changes
  const saveStateToServer = useCallback((newState: GameState) => {
    fetch('/api/game/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: newState }),
    }).catch((err) => console.error('Error saving game state to server:', err));
  }, []);

  // Helper to update state and sync to server
  const updateStateAndSync = useCallback(
    (updater: (prev: GameState) => GameState) => {
      setGameState((prev) => {
        if (!prev) return prev;
        const updated = updater(prev);
        saveStateToServer(updated);
        return updated;
      });
    },
    [saveStateToServer]
  );

  // Dice roll action handler
  const handleRollDice = useCallback(() => {
    if (!gameState || gameState.hasRolled || gameState.turnPhase === 'game_over' || isAnimatingMove) return;

    soundFx.playDiceRoll();
    setIsRolling(true);

    setTimeout(() => {
      setIsRolling(false);

      const roll = rollFairDice();

      updateStateAndSync((prev) => {
        const activeIdx = prev.activePlayerIndex;
        const activePlayer = prev.players[activeIdx];
        const newConsecutiveSixes = roll === 6 ? prev.consecutiveSixes + 1 : 0;

        // Check 3 consecutive 6s penalty
        let nextPhase: GameState['turnPhase'] = 'move';
        let forcedNextPlayer = activeIdx;
        let penaltyLog: string | null = null;

        if (roll === 6 && newConsecutiveSixes >= 3) {
          penaltyLog = `⚠️ ${activePlayer.name} rolled THREE SIXES in a row! Turn forfeited!`;
          // Find next player
          let candidate = (activeIdx + 1) % prev.players.length;
          while (prev.players[candidate].hasFinished) {
            candidate = (candidate + 1) % prev.players.length;
          }
          forcedNextPlayer = candidate;
          nextPhase = 'roll';
        }

        // Update probability stats
        const newCounts = { ...prev.diceStats.counts, [roll]: (prev.diceStats.counts[roll] || 0) + 1 };
        const newStats = {
          counts: newCounts,
          totalRolls: prev.diceStats.totalRolls + 1,
        };

        // Check valid moves
        const validIds = getValidMoveTokenIds(prev, activeIdx, roll);
        const hasNoMoves = validIds.length === 0 && !penaltyLog;

        const newLogs = [...prev.logs];
        const now = new Date().toLocaleTimeString();

        newLogs.unshift({
          id: `log-roll-${Date.now()}-${Math.random()}`,
          timestamp: now,
          type: 'info',
          message: `${activePlayer.name} rolled a ${roll}!`,
        });

        if (penaltyLog) {
          newLogs.unshift({
            id: `log-pen-${Date.now()}-${Math.random()}`,
            timestamp: now,
            type: 'error',
            message: penaltyLog,
          });
        } else if (hasNoMoves) {
          soundFx.playNoMove();
          newLogs.unshift({
            id: `log-nomove-${Date.now()}-${Math.random()}`,
            timestamp: now,
            type: 'info',
            message: `No valid moves available for ${activePlayer.name} with roll ${roll}. Passing turn.`,
          });
        }

        // If no moves or 3-six penalty, automatically pass turn to next player
        if (hasNoMoves) {
          let candidate = (activeIdx + 1) % prev.players.length;
          while (prev.players[candidate].hasFinished) {
            candidate = (candidate + 1) % prev.players.length;
          }

          return {
            ...prev,
            currentRoll: roll,
            hasRolled: false,
            consecutiveSixes: 0,
            activePlayerIndex: candidate,
            turnPhase: 'roll',
            logs: newLogs.slice(0, 100),
            diceStats: newStats,
          };
        }

        return {
          ...prev,
          currentRoll: roll,
          hasRolled: true,
          consecutiveSixes: penaltyLog ? 0 : newConsecutiveSixes,
          activePlayerIndex: penaltyLog ? forcedNextPlayer : activeIdx,
          turnPhase: penaltyLog ? 'roll' : 'move',
          logs: newLogs.slice(0, 100),
          diceStats: newStats,
        };
      });
    }, 280);
  }, [gameState, isAnimatingMove, updateStateAndSync]);

  // Token move action handler with step-by-step tile hopping & capture rewind path
  const handleSelectToken = useCallback(
    async (tokenId: number) => {
      if (!gameState || !gameState.hasRolled || gameState.currentRoll === null || isAnimatingMove) return;

      const roll = gameState.currentRoll;
      const activeIdx = gameState.activePlayerIndex;
      const player = gameState.players[activeIdx];
      if (!player) return;

      const token = player.tokens[tokenId];
      if (!token || token.isFinished) return;

      const homeStep = getHomeStep(gameState.mode);

      // 1. Calculate step-by-step forward path across every tile
      const forwardSteps: number[] = [];
      if (token.step === -1) {
        if (roll === 6) forwardSteps.push(0);
        else return;
      } else {
        for (let s = token.step + 1; s <= Math.min(token.step + roll, homeStep); s++) {
          forwardSteps.push(s);
        }
      }

      if (forwardSteps.length === 0) return;

      const finalStep = forwardSteps[forwardSteps.length - 1];

      // 2. Check if a token will be captured
      let capturedInfo: { playerIndex: number; tokenId: number; startStep: number } | null = null;
      const targetGlobalPos = getGlobalTrackPos(gameState.mode, activeIdx, finalStep);

      if (targetGlobalPos !== null && !isSafeCell(gameState.mode, targetGlobalPos)) {
        gameState.players.forEach((p, pIdx) => {
          if (pIdx === activeIdx) return;
          p.tokens.forEach((otherToken) => {
            if (!otherToken.isFinished && otherToken.step >= 0) {
              const otherGlobalPos = getGlobalTrackPos(gameState.mode, pIdx, otherToken.step);
              if (otherGlobalPos === targetGlobalPos) {
                capturedInfo = { playerIndex: pIdx, tokenId: otherToken.id, startStep: otherToken.step };
              }
            }
          });
        });
      }

      // 3. Calculate reverse path for captured token back to home yard
      const reverseSteps: number[] = [];
      if (capturedInfo) {
        for (let s = capturedInfo.startStep - 1; s >= 0; s--) {
          reverseSteps.push(s);
        }
        reverseSteps.push(-1); // Back to Yard
      }

      setIsAnimatingMove(true);

      const isBot = player.type === 'bot' || gameState.isAutoBotMode;
      // Human-friendly slower tile hopping (~260ms per tile for human, ~180ms for bot)
      const hopDelayMs = isBot ? Math.max(140, Math.min(gameState.botSpeedMs / 2, 220)) : 260;

      // 4. Step-by-step tile hopping forward animation
      for (let i = 0; i < forwardSteps.length; i++) {
        const currentStep = forwardSteps[i];
        setOverrideTokenPos({ playerIndex: activeIdx, tokenId, step: currentStep });

        if (token.step === -1) {
          soundFx.playYardExit();
        } else {
          soundFx.playStepHop(i);
        }

        await new Promise((resolve) => setTimeout(resolve, hopDelayMs));
      }

      if (finalStep === homeStep) {
        soundFx.playHomeFinish();
      }

      // 5. Capture hit & step-by-step reverse path rewind animation
      if (capturedInfo) {
        soundFx.playCaptureHit();
        const capCenter = get4PTokenCenter(activeIdx, finalStep, tokenId);
        setCaptureEffectCell(capCenter);

        // Keep capture ghost effect displayed so it finishes zooming out and fading
        setTimeout(() => {
          setCaptureEffectCell(null);
        }, 2200);

        const totalRev = reverseSteps.length;
        // Smooth bell curve trajectory: slow at start, quick in middle, slow at end
        for (let j = 0; j < totalRev; j++) {
          const revStep = reverseSteps[j];
          setOverrideTokenPos({
            playerIndex: capturedInfo.playerIndex,
            tokenId: capturedInfo.tokenId,
            step: revStep,
          });

          // Normalized progress t between 0 and 1
          const progress = totalRev > 1 ? j / (totalRev - 1) : 0.5;
          // sin(PI * progress): 0 at start, 1 in middle, 0 at end
          const speedFactor = Math.sin(Math.PI * progress);

          // Human-friendly smooth timing: start/end ~250ms delay, middle ~45ms delay
          const maxDelay = 250;
          const minDelay = 45;
          const currentDelay = maxDelay - (maxDelay - minDelay) * speedFactor;

          // Sound effect paced with movement
          if (j % Math.max(1, Math.floor(1 / (speedFactor + 0.35))) === 0 || j === totalRev - 1) {
            soundFx.playRewindStep();
          }

          await new Promise((resolve) => setTimeout(resolve, currentDelay));
        }
      }

      // 6. Finalize canonical game state & sync server
      setOverrideTokenPos(null);
      updateStateAndSync((prev) => {
        const nextState = executeMove(prev, tokenId);
        if (nextState.status === 'ended') {
          soundFx.playVictoryFanfare();
        }
        return nextState;
      });

      setIsAnimatingMove(false);
    },
    [gameState, isAnimatingMove, updateStateAndSync]
  );

  // Auto-Bot / Bot Turn AI loop
  useEffect(() => {
    if (!gameState || gameState.turnPhase === 'game_over' || isRolling || isAnimatingMove) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    const isBotTurn = activePlayer?.type === 'bot' || gameState.isAutoBotMode;

    if (!isBotTurn) return;

    const speed = gameState.isAutoBotMode ? gameState.botSpeedMs : 400;

    const timer = setTimeout(() => {
      if (!gameState.hasRolled) {
        // Bot Rolls Dice
        handleRollDice();
      } else if (gameState.currentRoll !== null) {
        // Bot Moves Token
        const bestTokenId = selectBestBotMove(gameState, gameState.currentRoll);
        if (bestTokenId !== null) {
          handleSelectToken(bestTokenId);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [gameState, isRolling, isAnimatingMove, handleRollDice, handleSelectToken]);

  // Start new game setup
  const handleStartNewGame = (
    mode: BoardMode,
    playerTypes: PlayerType[],
    playerAvatars?: string[],
    playerNames?: string[]
  ) => {
    fetch('/api/game/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, playerTypes, playerAvatars, playerNames }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.state) {
          setGameState(data.state);
        }
      })
      .catch((err) => console.error('Error resetting game state:', err))
      .finally(() => setIsSetupOpen(false));
  };

  // Reset server state
  const handleResetServerState = () => {
    handleStartNewGame(gameState?.mode || '4P', ['human', 'bot', 'bot', 'bot']);
  };

  // Toggle single player type (Human / Bot)
  const handleTogglePlayerType = useCallback(
    (playerIndex: number) => {
      if (!gameState) return;
      updateStateAndSync((prev) => {
        const updatedPlayers = prev.players.map((p, idx) => {
          if (idx !== playerIndex) return p;
          const nextType: PlayerType = p.type === 'human' ? 'bot' : 'human';
          return { ...p, type: nextType };
        });

        const playerChanged = prev.players[playerIndex];
        const newTypeStr = playerChanged.type === 'human' ? 'AI Bot' : 'Human';
        const now = new Date().toLocaleTimeString();

        const newLogs = [...prev.logs];
        newLogs.unshift({
          id: `log-type-${Date.now()}`,
          timestamp: now,
          type: 'info',
          message: `🔄 ${playerChanged.name} switched to ${newTypeStr}`,
        });

        return {
          ...prev,
          players: updatedPlayers,
          logs: newLogs,
        };
      });
    },
    [gameState, updateStateAndSync]
  );

  // Toggle Auto-Bot mode
  const handleToggleAutoBotMode = () => {
    if (!gameState) return;
    updateStateAndSync((prev) => {
      const nextAuto = !prev.isAutoBotMode;
      const now = new Date().toLocaleTimeString();

      // Convert all player slots to bot if enabling auto-bot
      const updatedPlayers = prev.players.map((p) => ({
        ...p,
        type: nextAuto ? ('bot' as PlayerType) : p.id === 0 ? ('human' as PlayerType) : ('bot' as PlayerType),
      }));

      const newLogs = [...prev.logs];
      newLogs.unshift({
        id: `log-autobot-${Date.now()}`,
        timestamp: now,
        type: 'debug',
        message: nextAuto
          ? '🤖 AUTO-BOT DEMO MODE STARTED! All slots playing automatically.'
          : '⏹️ Auto-Bot Mode stopped.',
      });

      return {
        ...prev,
        isAutoBotMode: nextAuto,
        players: updatedPlayers,
        logs: newLogs,
      };
    });
  };

  // Change Bot speed
  const handleChangeBotSpeed = (speedMs: number) => {
    updateStateAndSync((prev) => ({
      ...prev,
      botSpeedMs: speedMs,
    }));
  };

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Dices className="w-12 h-12 text-emerald-400 animate-spin mb-3" />
        <span className="font-semibold text-sm">Loading Ludo Engine & Server State...</span>
      </div>
    );
  }

  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const activeColor = COLOR_HEX[activePlayer?.color || 'red'];
  const validTokenIds = gameState.hasRolled && gameState.currentRoll !== null
    ? getValidMoveTokenIds(gameState, gameState.activePlayerIndex, gameState.currentRoll)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Deep Blue Textured Wallpaper with translucent dice pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-slate-950">
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Crect x='10' y='10' width='24' height='24' rx='5' stroke='%23ffffff' stroke-width='2' fill='none'/%3E%3Ccircle cx='22' cy='22' r='2.5'/%3E%3Crect x='46' y='46' width='24' height='24' rx='5' stroke='%23ffffff' stroke-width='2' fill='none'/%3E%3Ccircle cx='52' cy='52' r='2'/%3E%3Ccircle cx='64' cy='64' r='2'/%3E%3Cpath d='M10 50 L26 50 L26 66 L10 66 Z' stroke='%23ffffff' stroke-width='1.5' fill='none'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }}
        />
        <div className="absolute inset-0 bg-radial from-blue-600/10 via-transparent to-slate-950/80" />
      </div>
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl shadow-md text-white">
              <Dices className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">Ludo Web App</h1>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  {gameState.mode} Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Fair Dice • Live Server Sync • Auto-Bot Debug</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className={`p-2.5 rounded-xl transition border flex items-center gap-1.5 ${
                isMuted
                  ? 'bg-slate-800/80 text-slate-500 border-slate-700 hover:text-slate-300'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsSetupOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> New Game
            </button>

            <button
              onClick={handleToggleAutoBotMode}
              className={`px-3 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 ${
                gameState.isAutoBotMode
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50'
              }`}
              title="Fastest Bot Simulation Mode"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">{gameState.isAutoBotMode ? 'Stop Auto-Bot' : 'Auto-Bot Mode'}</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
              title="Game Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAME CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col items-center gap-5">
        {/* Ludo Board */}
        <Board4P
          gameState={gameState}
          validTokenIds={validTokenIds}
          onTokenClick={handleSelectToken}
          onRollDice={handleRollDice}
          isRolling={isRolling}
          overrideTokenPos={overrideTokenPos}
          captureEffectCell={captureEffectCell}
          isAnimating={isAnimatingMove}
          ghostImageUrl={ghostImageUrl}
        />
      </main>

      {/* MODALS */}
      <SetupModal
        isOpen={isSetupOpen}
        onStartGame={handleStartNewGame}
        onClose={() => setIsSetupOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenSetup={() => setIsSetupOpen(true)}
        onToggleAutoBotMode={handleToggleAutoBotMode}
        onChangeBotSpeed={handleChangeBotSpeed}
        onResetServerState={handleResetServerState}
        onTogglePlayerType={handleTogglePlayerType}
        gameState={gameState}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        ghostImageUrl={ghostImageUrl}
        onUploadGhostImage={handleUploadGhostImage}
        onResetGhostImage={handleResetGhostImage}
        customCaptureSoundUrl={customCaptureSoundUrl}
        onUploadCaptureSound={handleUploadCaptureSound}
        onResetCaptureSound={handleResetCaptureSound}
        onTestCaptureSound={handleTestCaptureSound}
      />

      <WinnerModal
        gameState={gameState}
        onNewGame={() => setIsSetupOpen(true)}
      />
    </div>
  );
}
