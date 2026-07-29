import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GameState, BoardMode, PlayerType } from './src/types';
import { createInitialGameState } from './src/utils/ludoEngine';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'game_state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + file sync helper
let currentGameState: GameState;

function loadGameState(): GameState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (
        parsed &&
        parsed.mode === '4P' &&
        Array.isArray(parsed.players) &&
        parsed.players.length === 4
      ) {
        currentGameState = parsed;
        console.log('[Server] Loaded persisted game state from disk.');
        return currentGameState;
      }
    }
  } catch (err) {
    console.error('[Server] Error reading game state file:', err);
  }

  // Fallback: create fresh 4P game
  currentGameState = createInitialGameState('4P');
  saveGameState(currentGameState);
  return currentGameState;
}

function saveGameState(state: GameState): boolean {
  try {
    currentGameState = { ...state, lastUpdated: new Date().toISOString() };
    fs.writeFileSync(STATE_FILE, JSON.stringify(currentGameState, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Server] Error saving game state to disk:', err);
    return false;
  }
}

// Initialize state on server startup
loadGameState();

// API Routes
app.get('/api/game/state', (req, res) => {
  res.json({ success: true, state: currentGameState });
});

app.post('/api/game/state', (req, res) => {
  const { state } = req.body;
  if (!state) {
    return res.status(400).json({ success: false, error: 'Missing game state payload' });
  }

  const saved = saveGameState(state);
  res.json({ success: saved, state: currentGameState });
});

app.post('/api/game/reset', (req, res) => {
  const {
    mode,
    playerTypes,
    playerAvatars,
    playerNames,
  }: {
    mode?: BoardMode;
    playerTypes?: PlayerType[];
    playerAvatars?: string[];
    playerNames?: string[];
  } = req.body;
  const newMode: BoardMode = mode || '4P';
  const newState = createInitialGameState(newMode, playerTypes, playerAvatars, playerNames);
  saveGameState(newState);
  res.json({ success: true, state: newState });
});

app.get('/api/logs', (req, res) => {
  res.json({ success: true, logs: currentGameState?.logs || [] });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Ludo Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
