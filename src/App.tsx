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
  findCapturedToken,
} from './utils/ludoEngine';
import { get4PTokenCenter } from './utils/boardCoords';
import { soundFx } from './utils/soundEffects';
import defaultGhostImg from './assets/images/ghost_capture_effect_1785335938319.jpg';
import { Board4P } from './components/Board4P';
import { SetupModal } from './components/SetupModal';
import { SettingsModal } from './components/SettingsModal';
import { WinnerModal } from './components/WinnerModal';
import { SafeSquaresModal } from './components/SafeSquaresModal';
import { Settings, Play, Bot, RefreshCw, Sparkles, Dices, Volume2, VolumeX, Shield, ChevronUp, ChevronDown } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [playerLastRolls, setPlayerLastRolls] = useState<Record<number, number | null>>({});
  const [boardOffsetY, setBoardOffsetY] = useState<number>(() => {
    const saved = localStorage.getItem('ludo_board_offset_y');
    return saved !== null ? parseInt(saved, 10) : 40;
  });

  // Direct Y-axis position shift for the entire board group (keeping dice, tokens & board 100% aligned)
  const handleShiftY = (direction: 'up' | 'down') => {
    setBoardOffsetY((prev) => {
      const step = 40;
      const next = direction === 'up' ? prev - step : prev + step;
      // Allow fluid range between -300px and 600px
      const clamped = Math.max(-300, Math.min(600, next));
      localStorage.setItem('ludo_board_offset_y', clamped.toString());
      return clamped;
    });
  };

  const handleResetY = () => {
    setBoardOffsetY(40);
    localStorage.setItem('ludo_board_offset_y', '40');
  };

  // Track each player's individual last roll for turn-based home dice
  useEffect(() => {
    if (gameState?.currentRoll !== null && gameState?.currentRoll !== undefined) {
      setPlayerLastRolls((prev) => ({
        ...prev,
        [gameState.activePlayerIndex]: gameState.currentRoll,
      }));
    }
  }, [gameState?.currentRoll, gameState?.activePlayerIndex]);

  // Step-by-step animation & sound states
  const [overrideTokenPos, setOverrideTokenPos] = useState<
    Array<{ playerIndex: number; tokenId: number; step: number }>
  >([]);
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
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  const handleToggleMute = useCallback(() => {
    const next = soundFx.toggleMute();
    setIsMuted(next);
  }, []);

  // Load initial persisted game state from server / localStorage fallback
  useEffect(() => {
    let localState: GameState | null = null;
    try {
      const stored = localStorage.getItem('ludo_game_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.mode === '4P' && Array.isArray(parsed.players) && parsed.players.length === 4) {
          localState = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse localStorage game state:', e);
    }

    fetch('/api/game/state')
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (
          data &&
          data.success &&
          data.state &&
          data.state.mode === '4P' &&
          Array.isArray(data.state.players) &&
          data.state.players.length === 4
        ) {
          setGameState(data.state);
        } else if (localState) {
          setGameState(localState);
        } else {
          setGameState(createInitialGameState('4P'));
        }
      })
      .catch((err) => {
        console.warn('Could not connect to backend server, loaded state from local storage / fallback:', err);
        setGameState(localState || createInitialGameState('4P'));
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Save game state to server & localStorage whenever it changes
  const saveStateToServer = useCallback((newState: GameState) => {
    try {
      localStorage.setItem('ludo_game_state', JSON.stringify(newState));
    } catch (e) {
      console.warn('Failed to save state to local storage:', e);
    }

    fetch('/api/game/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: newState }),
    }).catch((err) => {
      console.warn('Backend server offline or unreachable (game state saved locally):', err?.message || err);
    });
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
          // Find next player
          let candidate = (activeIdx + 1) % prev.players.length;
          while (prev.players[candidate].hasFinished) {
            candidate = (candidate + 1) % prev.players.length;
          }
          const nextPlayer = prev.players[candidate];
          penaltyLog = `🚫 3 SIXES IN A ROW! ${activePlayer.name}'s 3rd six is killed and turn is forfeited! Turn passed to ${nextPlayer.name}.`;
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
          hasRolled: penaltyLog ? false : true,
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

      // 2. Check if one OR MORE tokens will be captured (an opponent may have several
      //    tokens stacked on the same cell — every one of them must be captured & animated)
      const capturedList: Array<{ playerIndex: number; tokenId: number; startStep: number }> = [];
      const targetGlobalPos = getGlobalTrackPos(gameState.mode, activeIdx, finalStep);

      if (targetGlobalPos !== null && !isSafeCell(gameState.mode, targetGlobalPos)) {
        gameState.players.forEach((p, pIdx) => {
          if (pIdx === activeIdx) return;
          p.tokens.forEach((otherToken) => {
            if (!otherToken.isFinished && otherToken.step >= 0) {
              const otherGlobalPos = getGlobalTrackPos(gameState.mode, pIdx, otherToken.step);
              if (otherGlobalPos === targetGlobalPos) {
                capturedList.push({ playerIndex: pIdx, tokenId: otherToken.id, startStep: otherToken.step });
              }
            }
          });
        });
      }

      // 3. Calculate reverse path back to yard for EACH captured token
      const captureAnimations = capturedList.map((info) => {
        const revSteps: number[] = [];
        for (let s = info.startStep - 1; s >= 0; s--) {
          revSteps.push(s);
        }
        revSteps.push(-1); // Back to Yard
        return { info, revSteps };
      });

      setIsAnimatingMove(true);

      const isBot = player.type === 'bot' || gameState.isAutoBotMode;
      // Human-friendly slower tile hopping (~260ms per tile for human, ~180ms for bot)
      const hopDelayMs = isBot ? Math.max(140, Math.min(gameState.botSpeedMs / 2, 220)) : 260;

      // 4. Step-by-step tile hopping forward animation
      for (let i = 0; i < forwardSteps.length; i++) {
        const currentStep = forwardSteps[i];
        setOverrideTokenPos([{ playerIndex: activeIdx, tokenId, step: currentStep }]);

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

      // 5. Capture hit & step-by-step reverse path rewind animation — every captured
      //    token rewinds home in parallel, so nothing is ever left stranded on the board
      if (capturedList.length > 0) {
        soundFx.playCaptureHit();
        const capCenter = get4PTokenCenter(activeIdx, finalStep, tokenId);
        setCaptureEffectCell(capCenter);

        // Keep capture ghost effect displayed so it finishes zooming out and fading
        setTimeout(() => {
          setCaptureEffectCell(null);
        }, 2200);

        await Promise.all(
          captureAnimations.map(async ({ info, revSteps }) => {
            const totalRev = revSteps.length;
            for (let j = 0; j < totalRev; j++) {
              const revStep = revSteps[j];
              setOverrideTokenPos((prevOv) => {
                const withoutThis = prevOv.filter(
                  (o) => !(o.playerIndex === info.playerIndex && o.tokenId === info.tokenId)
                );
                return [...withoutThis, { playerIndex: info.playerIndex, tokenId: info.tokenId, step: revStep }];
              });

              const progress = totalRev > 1 ? j / (totalRev - 1) : 0.5;
              const speedFactor = Math.sin(Math.PI * progress);

              const maxDelay = 250;
              const minDelay = 45;
              const currentDelay = maxDelay - (maxDelay - minDelay) * speedFactor;

              if (j % Math.max(1, Math.floor(1 / (speedFactor + 0.35))) === 0 || j === totalRev - 1) {
                soundFx.playRewindStep();
              }

              await new Promise((resolve) => setTimeout(resolve, currentDelay));
            }
          })
        );
      }

      // 6. Finalize canonical game state FIRST before clearing override so active token stays fixed on finalStep
      updateStateAndSync((prev) => {
        const nextState = executeMove(prev, tokenId);
        if (nextState.status === 'ended') {
          soundFx.playVictoryFanfare();
        }
        return nextState;
      });

      // Micro-tick delay to allow React state transition to complete before removing override
      await new Promise((resolve) => setTimeout(resolve, 50));
      setOverrideTokenPos([]);
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
    setIsRolling(false);
    setIsAnimatingMove(false);
    setOverrideTokenPos(null);
    setCaptureEffectCell(null);
    setPlayerLastRolls({});
    setIsSetupOpen(false);
    setIsSettingsOpen(false);

    const localNewState = createInitialGameState(mode, playerTypes, playerAvatars, playerNames);
    setGameState(localNewState);
    try {
      localStorage.setItem('ludo_game_state', JSON.stringify(localNewState));
    } catch (e) {
      console.warn('Failed to save reset game state to localStorage:', e);
    }

    fetch('/api/game/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, playerTypes, playerAvatars, playerNames }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.state) {
          setGameState(data.state);
        }
      })
      .catch((err) => console.warn('Could not reset state on server (using local state):', err))
      .finally(() => {
        setIsSetupOpen(false);
        setIsSettingsOpen(false);
      });
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
      {/* MAIN GAME CONTENT - Header buttons, board, home dice buttons all grouped together */}
      <main className="flex-1 w-full overflow-hidden relative z-10 flex flex-col items-center">
        {/* The entire grouped unit (New Game, Mute, Settings buttons, board, tokens, home dice buttons) shifts smoothly along the Y-axis */}
        <div
          className="max-w-6xl w-full mx-auto px-3 sm:px-6 pt-3 flex flex-col items-center gap-4 transition-transform duration-300 ease-out"
          style={{ transform: `translateY(${boardOffsetY}px)` }}
        >
          {/* Top Control Bar (New Game, Sound, Auto-bot, Settings) aligned right above the board */}
          <div className="w-full max-w-[620px] flex items-center justify-end gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800/80 shadow-lg backdrop-blur-md">
            <button
              onClick={handleToggleMute}
              className={`p-2.5 rounded-xl transition border flex items-center gap-1.5 ${
                isMuted
                  ? 'bg-slate-800/80 text-slate-500 border-slate-700 hover:text-slate-300'
                  : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/60'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Ludo Board with completely unified buttons and layout */}
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
            playerLastRolls={playerLastRolls}
          />
        </div>
      </main>

      {/* Floating Small Up and Down Arrow Signs in Bottom Right Corner */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl backdrop-blur-md">
        <button
          onClick={() => handleShiftY('up')}
          className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition shadow border border-slate-700/50 flex items-center justify-center group"
          title="Move Board Group Up"
          aria-label="Move Board Group Up"
        >
          <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform text-slate-200" />
        </button>
        <button
          onClick={handleResetY}
          className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          title="Reset Board Position"
        >
          {boardOffsetY}px
        </button>
        <button
          onClick={() => handleShiftY('down')}
          className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition shadow border border-slate-700/50 flex items-center justify-center group"
          title="Move Board Group Down"
          aria-label="Move Board Group Down"
        >
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform text-slate-200" />
        </button>
      </div>

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
        onNewGame={() => {
          handleStartNewGame(
            gameState?.mode || '4P',
            gameState?.players?.map((p) => p.type) || ['human', 'bot', 'bot', 'bot'],
            gameState?.players?.map((p) => p.avatar),
            gameState?.players?.map((p) => p.name)
          );
        }}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      <SafeSquaresModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}
