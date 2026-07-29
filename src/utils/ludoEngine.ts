import { GameState, Player, Token, BoardMode, LogEntry, PlayerColor, PlayerType } from '../types';

export const PLAYER_COLORS_4P: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export const COLOR_HEX: Record<string, { main: string; light: string; dark: string; border: string }> = {
  red: { main: '#dc2626', light: '#fca5a5', dark: '#991b1b', border: '#7f1d1d' },
  green: { main: '#16a34a', light: '#86efac', dark: '#15803d', border: '#14532d' },
  yellow: { main: '#eab308', light: '#fde047', dark: '#a16207', border: '#713f12' },
  blue: { main: '#2563eb', light: '#93c5fd', dark: '#1d4ed8', border: '#1e3a8a' },
  orange: { main: '#ea580c', light: '#ffedd5', dark: '#c2410c', border: '#7c2d12' },
  purple: { main: '#a855f7', light: '#d8b4fe', dark: '#7e22ce', border: '#581c87' },
};

export function getColorHex(color?: string) {
  if (color && COLOR_HEX[color]) {
    return COLOR_HEX[color];
  }
  return COLOR_HEX.red;
}

export const TRACK_LENGTH_4P = 52;
export const HOME_STRETCH_4P = 5;
export const HOME_STEP_4P = TRACK_LENGTH_4P + HOME_STRETCH_4P; // 57

// Starting offset on global main track for each player
export const START_OFFSET_4P: Record<number, number> = {
  0: 0,   // Red
  1: 13,  // Green
  2: 26,  // Yellow
  3: 39,  // Blue
};

// Safe spots relative to global main track
export const SAFE_SPOTS_4P = [0, 8, 13, 21, 26, 34, 39, 47];

export function getTrackLength(_mode?: BoardMode): number {
  return TRACK_LENGTH_4P;
}

export function getHomeStep(_mode?: BoardMode): number {
  return HOME_STEP_4P;
}

export function getStartOffset(_mode: BoardMode | undefined, playerIndex: number): number {
  return START_OFFSET_4P[playerIndex] ?? 0;
}

export function getSafeSpots(_mode?: BoardMode): number[] {
  return SAFE_SPOTS_4P;
}

/**
 * Maps a token's internal step to global main track cell index (if on main track).
 * Returns null if token is in yard or in home stretch.
 */
export function getGlobalTrackPos(mode: BoardMode, playerIndex: number, step: number): number | null {
  const trackLen = getTrackLength(mode);
  if (step < 0 || step >= trackLen) return null;
  const offset = getStartOffset(mode, playerIndex);
  return (offset + step) % trackLen;
}

/**
 * Checks if a global track position is a safe spot.
 */
export function isSafeCell(mode: BoardMode, globalPos: number): boolean {
  return getSafeSpots(mode).includes(globalPos);
}

export const DEFAULT_PLAYER_AVATARS: string[] = ['🦊', '🐉', '⚡', '🚀'];

export const AVATAR_OPTIONS: string[] = [
  '🦊', '🐉', '⚡', '🚀', '👑', '🦁', '🤖', '👾',
  '🐯', '🐼', '🦅', '🐺', '🛡️', '🎯', '🎲', '🧙', '🔥', '💎', '⭐', '🦄'
];

/**
 * Generates an initial clean game state.
 */
export function createInitialGameState(
  mode: BoardMode = '4P',
  playerTypes?: PlayerType[],
  playerAvatars?: string[],
  playerNames?: string[]
): GameState {
  const colors = PLAYER_COLORS_4P;
  const defaultTypes: PlayerType[] = playerTypes || ['human', 'bot', 'bot', 'bot'];

  const players: Player[] = colors.map((color, idx) => ({
    id: idx,
    name:
      playerNames?.[idx]?.trim() ||
      (defaultTypes[idx] === 'human'
        ? `Player ${idx + 1} (${color.toUpperCase()})`
        : `Bot ${idx + 1} (${color.toUpperCase()})`),
    color,
    type: defaultTypes[idx],
    avatar: playerAvatars?.[idx] || DEFAULT_PLAYER_AVATARS[idx] || '🎲',
    tokens: [0, 1, 2, 3].map((tokenId) => ({
      id: tokenId,
      playerIndex: idx,
      step: -1,
      isFinished: false,
    })),
    hasFinished: false,
  }));

  const initialLog: LogEntry = {
    id: 'log-init-' + Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    type: 'info',
    message: `New Ludo game initialized. Player 1 (${players[0].name})'s turn to roll!`,
  };

  return {
    mode,
    players,
    activePlayerIndex: 0,
    currentRoll: null,
    hasRolled: false,
    consecutiveSixes: 0,
    turnPhase: 'roll',
    status: 'playing',
    isAutoBotMode: false,
    botSpeedMs: 300,
    rankings: [],
    logs: [initialLog],
    diceStats: {
      counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      totalRolls: 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Fair, mathematically even 6-sided dice roll.
 */
export function rollFairDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Calculates legally movable token IDs for a given player and dice roll.
 */
export function getValidMoveTokenIds(state: GameState, playerIndex: number, roll: number): number[] {
  const player = state.players[playerIndex];
  if (!player || player.hasFinished) return [];

  const homeStep = getHomeStep(state.mode);
  const validIds: number[] = [];

  player.tokens.forEach((token) => {
    if (token.isFinished) return;

    if (token.step === -1) {
      // Must roll a 6 to exit Yard to step 0
      if (roll === 6) {
        validIds.push(token.id);
      }
    } else {
      // Must not overshoot Home
      if (token.step + roll <= homeStep) {
        validIds.push(token.id);
      }
    }
  });

  return validIds;
}

/**
 * Moves a token and evaluates captures, home completions, extra rolls, and turn switching.
 */
export function executeMove(state: GameState, tokenId: number): GameState {
  if (state.currentRoll === null || !state.hasRolled) return state;

  const roll = state.currentRoll;
  const activeIdx = state.activePlayerIndex;
  const player = state.players[activeIdx];
  const token = player.tokens[tokenId];

  if (!token || token.isFinished) return state;

  const newPlayers = JSON.parse(JSON.stringify(state.players)) as Player[];
  const activePlayer = newPlayers[activeIdx];
  const targetToken = activePlayer.tokens[tokenId];
  const homeStep = getHomeStep(state.mode);

  let newStep = targetToken.step;
  if (targetToken.step === -1) {
    if (roll === 6) newStep = 0;
  } else {
    newStep += roll;
  }

  targetToken.step = newStep;
  let capturedTokenInfo: { playerIdx: number; tokenId: number } | null = null;
  let newlyFinished = false;

  // Check home finish
  if (newStep === homeStep) {
    targetToken.isFinished = true;
    newlyFinished = true;
  }

  // Check captures if on main track
  const globalPos = getGlobalTrackPos(state.mode, activeIdx, newStep);
  if (globalPos !== null && !isSafeCell(state.mode, globalPos)) {
    newPlayers.forEach((p, pIdx) => {
      if (pIdx === activeIdx) return;
      p.tokens.forEach((otherToken) => {
        if (otherToken.isFinished || otherToken.step < 0) return;
        const otherGlobalPos = getGlobalTrackPos(state.mode, pIdx, otherToken.step);
        if (otherGlobalPos === globalPos) {
          // CAPTURE!
          otherToken.step = -1; // back to Yard
          capturedTokenInfo = { playerIdx: pIdx, tokenId: otherToken.id };
        }
      });
    });
  }

  // Check if active player finished all 4 tokens
  const newRankings = [...state.rankings];
  const allFinished = activePlayer.tokens.every((t) => t.isFinished);
  if (allFinished && !activePlayer.hasFinished) {
    activePlayer.hasFinished = true;
    newRankings.push(activeIdx);
  }

  // Check game over
  const activePlayersRemaining = newPlayers.filter((p) => !p.hasFinished);
  const isGameOver = activePlayersRemaining.length <= 1;

  // Determine turn bonus
  const extraTurnGranted = (roll === 6 && state.consecutiveSixes < 3) || capturedTokenInfo !== null || newlyFinished;

  let nextActiveIdx = activeIdx;
  let nextConsecutiveSixes = roll === 6 ? state.consecutiveSixes : 0;

  if (isGameOver) {
    // Add remaining player to rankings if any
    if (activePlayersRemaining.length === 1 && !newRankings.includes(activePlayersRemaining[0].id)) {
      newRankings.push(activePlayersRemaining[0].id);
      newPlayers[activePlayersRemaining[0].id].hasFinished = true;
    }
  } else if (!extraTurnGranted || (roll === 6 && state.consecutiveSixes >= 3)) {
    // Pass turn to next non-finished player
    nextConsecutiveSixes = 0;
    let nextCandidate = (activeIdx + 1) % newPlayers.length;
    while (newPlayers[nextCandidate].hasFinished) {
      nextCandidate = (nextCandidate + 1) % newPlayers.length;
    }
    nextActiveIdx = nextCandidate;
  }

  // Log entries
  const newLogs = [...state.logs];
  const now = new Date().toLocaleTimeString();

  if (targetToken.step === 0 && token.step === -1) {
    newLogs.unshift({
      id: `log-move-${Date.now()}-${Math.random()}`,
      timestamp: now,
      type: 'action',
      message: `${activePlayer.name} moved Token #${tokenId + 1} out of Yard onto Starting cell!`,
    });
  } else if (newlyFinished) {
    newLogs.unshift({
      id: `log-finish-${Date.now()}-${Math.random()}`,
      timestamp: now,
      type: 'win',
      message: `${activePlayer.name}'s Token #${tokenId + 1} REACHED HOME! 🎯`,
    });
  } else {
    newLogs.unshift({
      id: `log-move-${Date.now()}-${Math.random()}`,
      timestamp: now,
      type: 'action',
      message: `${activePlayer.name} moved Token #${tokenId + 1} by ${roll} spaces to step ${newStep}.`,
    });
  }

  if (capturedTokenInfo) {
    const oppName = newPlayers[capturedTokenInfo.playerIdx].name;
    newLogs.unshift({
      id: `log-cap-${Date.now()}-${Math.random()}`,
      timestamp: now,
      type: 'capture',
      message: `💥 CAPTURE! ${activePlayer.name} captured ${oppName}'s Token #${capturedTokenInfo.tokenId + 1} and sent it back to Yard! Bonus turn awarded!`,
    });
  }

  if (extraTurnGranted && !isGameOver) {
    newLogs.unshift({
      id: `log-extra-${Date.now()}-${Math.random()}`,
      timestamp: now,
      type: 'info',
      message: `✨ ${activePlayer.name} gets a BONUS ROLL!`,
    });
  }

  if (isGameOver) {
    const winnerName = newPlayers[newRankings[0]]?.name || 'Winner';
    newLogs.unshift({
      id: `log-over-${Date.now()}-${Math.random()}`,
      timestamp: now,
      type: 'win',
      message: `🏆 GAME OVER! ${winnerName} takes 1st Place!`,
    });
  }

  return {
    ...state,
    players: newPlayers,
    activePlayerIndex: isGameOver ? activeIdx : nextActiveIdx,
    currentRoll: null,
    hasRolled: false,
    consecutiveSixes: nextConsecutiveSixes,
    turnPhase: isGameOver ? 'game_over' : 'roll',
    status: isGameOver ? 'ended' : 'playing',
    rankings: newRankings,
    logs: newLogs.slice(0, 100), // maintain last 100 logs
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Intelligent Bot decision heuristic.
 */
export function selectBestBotMove(state: GameState, roll: number): number | null {
  const activeIdx = state.activePlayerIndex;
  const validIds = getValidMoveTokenIds(state, activeIdx, roll);
  if (validIds.length === 0) return null;
  if (validIds.length === 1) return validIds[0];

  const player = state.players[activeIdx];
  const homeStep = getHomeStep(state.mode);

  // Score each valid move candidate
  let bestScore = -9999;
  let bestTokenId = validIds[0];

  validIds.forEach((tokenId) => {
    const token = player.tokens[tokenId];
    let score = 0;

    let targetStep = token.step === -1 ? (roll === 6 ? 0 : -1) : token.step + roll;

    // 1. Reaching home
    if (targetStep === homeStep) {
      score += 1000;
    }

    // 2. Capturing an opponent token
    const globalPos = getGlobalTrackPos(state.mode, activeIdx, targetStep);
    if (globalPos !== null && !isSafeCell(state.mode, globalPos)) {
      let causesCapture = false;
      state.players.forEach((p, pIdx) => {
        if (pIdx === activeIdx) return;
        p.tokens.forEach((other) => {
          if (!other.isFinished && other.step >= 0) {
            const otherGlobalPos = getGlobalTrackPos(state.mode, pIdx, other.step);
            if (otherGlobalPos === globalPos) {
              causesCapture = true;
            }
          }
        });
      });
      if (causesCapture) score += 500;
    }

    // 3. Exiting Yard on a 6
    if (token.step === -1 && roll === 6) {
      score += 300;
    }

    // 4. Landing on a safe spot
    if (globalPos !== null && isSafeCell(state.mode, globalPos)) {
      score += 150;
    }

    // 5. Prefer advancing tokens closer to home
    score += targetStep * 2;

    if (score > bestScore) {
      bestScore = score;
      bestTokenId = tokenId;
    }
  });

  return bestTokenId;
}
