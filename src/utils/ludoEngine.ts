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

export const TRACK_LENGTH_4P = 51; // 51 main track steps (0 to 50)
export const HOME_STRETCH_4P = 5;
export const HOME_STEP_4P = TRACK_LENGTH_4P + HOME_STRETCH_4P; // 56

// Starting offset on global main track for each player
export const START_OFFSET_4P: Record<number, number> = {
  0: 0,   // Red
  1: 13,  // Green
  2: 26,  // Yellow
  3: 39,  // Blue
};

// Safe spots relative to global main track with unique IDs
export interface SafeSquare {
  id: string;
  name: string;
  globalPos: number;
  type: 'start' | 'star';
  color: PlayerColor;
}

export const SAFE_SQUARES_4P: SafeSquare[] = [
  { id: 'SAFE_START_RED_0', name: 'Red Start Square (Tile 0)', globalPos: 0, type: 'start', color: 'red' },
  { id: 'SAFE_STAR_RED_8', name: 'Red Star Square (Tile 8)', globalPos: 8, type: 'star', color: 'red' },
  { id: 'SAFE_START_GREEN_13', name: 'Green Start Square (Tile 13)', globalPos: 13, type: 'start', color: 'green' },
  { id: 'SAFE_STAR_GREEN_21', name: 'Green Star Square (Tile 21)', globalPos: 21, type: 'star', color: 'green' },
  { id: 'SAFE_START_YELLOW_26', name: 'Yellow Start Square (Tile 26)', globalPos: 26, type: 'start', color: 'yellow' },
  { id: 'SAFE_STAR_YELLOW_34', name: 'Yellow Star Square (Tile 34)', globalPos: 34, type: 'star', color: 'yellow' },
  { id: 'SAFE_START_BLUE_39', name: 'Blue Start Square (Tile 39)', globalPos: 39, type: 'start', color: 'blue' },
  { id: 'SAFE_STAR_BLUE_47', name: 'Blue Star Square (Tile 47)', globalPos: 47, type: 'star', color: 'blue' },
];

export const SAFE_SPOTS_4P = SAFE_SQUARES_4P.map((s) => s.globalPos);

export function getSafeSquareInfo(globalPos: number): SafeSquare | undefined {
  return SAFE_SQUARES_4P.find((sq) => sq.globalPos === globalPos);
}

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
 * Main track has 52 cells (indices 0..51). Tokens spend 51 steps (0..50) on main track.
 */
export function getGlobalTrackPos(mode: BoardMode, playerIndex: number, step: number): number | null {
  if (step < 0 || step >= 51) return null;
  const offset = getStartOffset(mode, playerIndex);
  return (offset + step) % 52;
}

/**
 * Checks if a global track position is a safe spot.
 */
export function isSafeCell(mode: BoardMode, globalPos: number): boolean {
  if (mode === '4P') {
    return SAFE_SQUARES_4P.some((sq) => sq.globalPos === globalPos);
  }
  return false;
}

/**
 * Finds a captured token when `activeIdx` lands on `targetStep`.
 * Enforces strict Ludo rules:
 * 1. SAFE SQUARES RULE: On colored start tiles or star tiles, tokens CANNOT be captured under any circumstances.
 * 2. SAME-PLAYER STACK RULE: If an opponent player has 2 or more of their OWN tokens on a non-safe tile,
 *    they form a blockade/stack. An incoming opponent token CANNOT kill them and stacks alongside them instead.
 * 3. SINGLE OPPONENT CAPTURE RULE: If an opponent player has EXACTLY 1 token on a non-safe tile,
 *    that single token is captured and sent back to Yard.
 */
export function findCapturedToken(
  players: Player[],
  mode: BoardMode,
  activeIdx: number,
  targetStep: number
): { playerIdx: number; tokenId: number; startStep: number } | null {
  const globalPos = getGlobalTrackPos(mode, activeIdx, targetStep);
  if (globalPos === null || isSafeCell(mode, globalPos)) {
    return null; // On safe square or off main track -> immune to capture
  }

  for (let pIdx = 0; pIdx < players.length; pIdx++) {
    if (pIdx === activeIdx) continue;
    const opponent = players[pIdx];

    // Find all active tokens of this opponent sitting on `globalPos`
    const opponentTokensOnCell = opponent.tokens.filter((t) => {
      if (t.isFinished || t.step < 0) return false;
      const pos = getGlobalTrackPos(mode, pIdx, t.step);
      return pos === globalPos;
    });

    // If opponent has 2 or more of their own tokens stacked on this non-safe tile,
    // it forms a same-player stack -> immune from capture! Opponent token stacks alongside.
    if (opponentTokensOnCell.length === 1) {
      const capturedToken = opponentTokensOnCell[0];
      return {
        playerIdx: pIdx,
        tokenId: capturedToken.id,
        startStep: capturedToken.step,
      };
    }
  }

  return null;
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

  // Check captures if on main track using strict findCapturedToken rules
  const capturedInfo = findCapturedToken(newPlayers, state.mode, activeIdx, newStep);
  if (capturedInfo) {
    const capturedPlayer = newPlayers[capturedInfo.playerIdx];
    const capturedToken = capturedPlayer.tokens[capturedInfo.tokenId];
    capturedToken.step = -1; // Send back to Yard
    capturedTokenInfo = { playerIdx: capturedInfo.playerIdx, tokenId: capturedInfo.tokenId };
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
    const captured = findCapturedToken(state.players, state.mode, activeIdx, targetStep);
    if (captured) {
      score += 500;
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
