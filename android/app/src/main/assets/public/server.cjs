var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");

// src/utils/ludoEngine.ts
var PLAYER_COLORS_4P = ["red", "green", "yellow", "blue"];
var TRACK_LENGTH_4P = 51;
var HOME_STRETCH_4P = 5;
var HOME_STEP_4P = TRACK_LENGTH_4P + HOME_STRETCH_4P;
var SAFE_SQUARES_4P = [
  { id: "SAFE_START_RED_0", name: "Red Start Square (Tile 0)", globalPos: 0, type: "start", color: "red" },
  { id: "SAFE_STAR_RED_8", name: "Red Star Square (Tile 8)", globalPos: 8, type: "star", color: "red" },
  { id: "SAFE_START_GREEN_13", name: "Green Start Square (Tile 13)", globalPos: 13, type: "start", color: "green" },
  { id: "SAFE_STAR_GREEN_21", name: "Green Star Square (Tile 21)", globalPos: 21, type: "star", color: "green" },
  { id: "SAFE_START_YELLOW_26", name: "Yellow Start Square (Tile 26)", globalPos: 26, type: "start", color: "yellow" },
  { id: "SAFE_STAR_YELLOW_34", name: "Yellow Star Square (Tile 34)", globalPos: 34, type: "star", color: "yellow" },
  { id: "SAFE_START_BLUE_39", name: "Blue Start Square (Tile 39)", globalPos: 39, type: "start", color: "blue" },
  { id: "SAFE_STAR_BLUE_47", name: "Blue Star Square (Tile 47)", globalPos: 47, type: "star", color: "blue" }
];
var SAFE_SPOTS_4P = SAFE_SQUARES_4P.map((s) => s.globalPos);
var DEFAULT_PLAYER_AVATARS = ["\u{1F98A}", "\u{1F409}", "\u26A1", "\u{1F680}"];
function createInitialGameState(mode = "4P", playerTypes, playerAvatars, playerNames) {
  const colors = PLAYER_COLORS_4P;
  const defaultTypes = playerTypes || ["human", "bot", "bot", "bot"];
  const players = colors.map((color, idx) => ({
    id: idx,
    name: playerNames?.[idx]?.trim() || (defaultTypes[idx] === "human" ? `Player ${idx + 1} (${color.toUpperCase()})` : `Bot ${idx + 1} (${color.toUpperCase()})`),
    color,
    type: defaultTypes[idx],
    avatar: playerAvatars?.[idx] || DEFAULT_PLAYER_AVATARS[idx] || "\u{1F3B2}",
    tokens: [0, 1, 2, 3].map((tokenId) => ({
      id: tokenId,
      playerIndex: idx,
      step: -1,
      isFinished: false
    })),
    hasFinished: false
  }));
  const initialLog = {
    id: "log-init-" + Date.now(),
    timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
    type: "info",
    message: `New Ludo game initialized. Player 1 (${players[0].name})'s turn to roll!`
  };
  return {
    mode,
    players,
    activePlayerIndex: 0,
    currentRoll: null,
    hasRolled: false,
    consecutiveSixes: 0,
    turnPhase: "roll",
    status: "playing",
    isAutoBotMode: false,
    botSpeedMs: 300,
    rankings: [],
    logs: [initialLog],
    diceStats: {
      counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      totalRolls: 0
    },
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var STATE_FILE = import_path.default.join(DATA_DIR, "game_state.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var currentGameState;
function loadGameState() {
  try {
    if (import_fs.default.existsSync(STATE_FILE)) {
      const data = import_fs.default.readFileSync(STATE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && parsed.mode === "4P" && Array.isArray(parsed.players) && parsed.players.length === 4) {
        currentGameState = parsed;
        console.log("[Server] Loaded persisted game state from disk.");
        return currentGameState;
      }
    }
  } catch (err) {
    console.error("[Server] Error reading game state file:", err);
  }
  currentGameState = createInitialGameState("4P");
  saveGameState(currentGameState);
  return currentGameState;
}
function saveGameState(state) {
  try {
    currentGameState = { ...state, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() };
    import_fs.default.writeFile(STATE_FILE, JSON.stringify(currentGameState, null, 2), "utf-8", (err) => {
      if (err) {
        console.error("[Server] Error saving game state to disk:", err);
      }
    });
    return true;
  } catch (err) {
    console.error("[Server] Error saving game state:", err);
    return false;
  }
}
loadGameState();
app.get("/api/game/state", (req, res) => {
  res.json({ success: true, state: currentGameState });
});
app.post("/api/game/state", (req, res) => {
  const { state } = req.body;
  if (!state) {
    return res.status(400).json({ success: false, error: "Missing game state payload" });
  }
  const saved = saveGameState(state);
  res.json({ success: saved, state: currentGameState });
});
app.post("/api/game/reset", (req, res) => {
  const {
    mode,
    playerTypes,
    playerAvatars,
    playerNames
  } = req.body;
  const newMode = mode || "4P";
  const newState = createInitialGameState(newMode, playerTypes, playerAvatars, playerNames);
  saveGameState(newState);
  res.json({ success: true, state: newState });
});
app.get("/api/logs", (req, res) => {
  res.json({ success: true, logs: currentGameState?.logs || [] });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Ludo Server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
