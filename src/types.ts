export type BoardMode = '4P';

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'bot';

export interface Token {
  id: number; // 0..3 per player
  playerIndex: number;
  step: number; // -1: in yard, 0: at start space, 1..trackLength-1: on main track, trackLength..trackLength+4: in home stretch, trackLength+5: FINISHED (Home)
  isFinished: boolean;
}

export interface Player {
  id: number;
  name: string;
  color: PlayerColor;
  type: PlayerType;
  avatar?: string;
  tokens: Token[];
  hasFinished: boolean;
  finishRank?: number; // 1st, 2nd, 3rd, etc.
}

export interface DiceStats {
  counts: Record<number, number>; // {1: x, 2: y, ...}
  totalRolls: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'action' | 'capture' | 'win' | 'debug' | 'error';
  message: string;
  details?: Record<string, any>;
}

export interface GameState {
  mode: BoardMode;
  players: Player[];
  activePlayerIndex: number;
  currentRoll: number | null;
  hasRolled: boolean;
  consecutiveSixes: number;
  turnPhase: 'roll' | 'move' | 'turn_end' | 'game_over';
  status: 'playing' | 'paused' | 'ended';
  isAutoBotMode: boolean;
  botSpeedMs: number; // Delay between bot steps (e.g. 50ms, 200ms, 500ms)
  rankings: number[]; // Player indices in order of finishing
  logs: LogEntry[];
  diceStats: DiceStats;
  lastUpdated: string;
}

export interface CellCoord {
  x: number;
  y: number;
  isSafe?: boolean;
  isStart?: boolean;
  color?: PlayerColor;
  label?: string;
}
