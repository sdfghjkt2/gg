import React from 'react';
import { Settings, Play, Bot, User, RefreshCw, X, Zap, RotateCcw, Activity, Volume2, VolumeX, Ghost, Upload } from 'lucide-react';
import { GameState, BoardMode } from '../types';
import { COLOR_HEX } from '../utils/ludoEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSetup: () => void;
  onToggleAutoBotMode: () => void;
  onChangeBotSpeed: (speedMs: number) => void;
  onResetServerState: () => void;
  onTogglePlayerType: (playerIndex: number) => void;
  gameState: GameState;
  isMuted: boolean;
  onToggleMute: () => void;
  ghostImageUrl: string;
  onUploadGhostImage: (url: string) => void;
  onResetGhostImage: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenSetup,
  onToggleAutoBotMode,
  onChangeBotSpeed,
  onResetServerState,
  onTogglePlayerType,
  gameState,
  isMuted,
  onToggleMute,
  ghostImageUrl,
  onUploadGhostImage,
  onResetGhostImage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Game Settings & Controls</h2>
            <p className="text-xs text-slate-400">Firmly switch Human / AI Bot, configure rules & logs</p>
          </div>
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-3">
          {/* 1. FIRM HUMAN / BOT PLAYER SWITCHES */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" /> Active Player Bot Switches
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-time Switch</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {gameState.players.map((player, idx) => {
                const pColor = COLOR_HEX[player.color];
                const isBot = player.type === 'bot';

                return (
                  <div
                    key={`sett-p-${player.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full stroke-2 shadow"
                        style={{ backgroundColor: pColor.main, border: `1.5px solid ${pColor.dark}` }}
                      />
                      <span className="font-semibold text-xs text-white">
                        {player.name}
                      </span>
                    </div>

                    {/* Firm Switch Toggle Button */}
                    <button
                      onClick={() => onTogglePlayerType(idx)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow ${
                        isBot
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/80 hover:bg-emerald-900'
                          : 'bg-blue-950 text-blue-400 border border-blue-700/80 hover:bg-blue-900'
                      }`}
                    >
                      {isBot ? (
                        <>
                          <Bot className="w-3.5 h-3.5" /> AI Bot (Click to Human)
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5" /> Human (Click to Bot)
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. New Game Setup */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-white">Start New Game</div>
              <div className="text-xs text-slate-400">Configure player types and start new game</div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenSetup();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Setup
            </button>
          </div>

          {/* 3. Debug Auto-Bot Mode */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Auto-Bot Simulation Mode
                </div>
                <div className="text-xs text-slate-400">Bots play against themselves at custom rate</div>
              </div>

              <button
                onClick={onToggleAutoBotMode}
                className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 ${
                  gameState.isAutoBotMode
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950'
                }`}
              >
                {gameState.isAutoBotMode ? 'Stop Sim' : 'Start Auto-Bot'}
              </button>
            </div>

            {/* Speed Control */}
            {gameState.isAutoBotMode && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Simulation Delay Speed
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">{gameState.botSpeedMs}ms / turn</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="20"
                  value={gameState.botSpeedMs}
                  onChange={(e) => onChangeBotSpeed(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Fastest (10ms)</span>
                  <span>Normal (300ms)</span>
                  <span>Slow (1000ms)</span>
                </div>
              </div>
            )}
          </div>

          {/* Sound Effects Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />} Sound Effects
              </div>
              <div className="text-xs text-slate-400">Tile hopping, capture hits, rewind & dice audio</div>
            </div>

            <button
              onClick={onToggleMute}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 ${
                isMuted
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-700/80 hover:bg-emerald-900'
              }`}
            >
              {isMuted ? 'Muted' : 'Sound ON'}
            </button>
          </div>

          {/* 4. Reset Server Save File */}
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-rose-300">Reset Server State</div>
              <div className="text-xs text-rose-400/80">Wipe persisted JSON state file on server</div>
            </div>

            <button
              onClick={() => {
                if (confirm('Reset game state saved on server?')) {
                  onResetServerState();
                  onClose();
                }
              }}
              className="px-4 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear Save
            </button>
          </div>

          {/* 5. Custom Capture Ghost Image (PNG) - LAST OPTION IN SETTINGS */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <Ghost className="w-4 h-4 text-purple-400" /> Custom Capture Ghost Effect PNG
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Upload or paste a PNG image to display as a fading & zooming ghost effect when a token is captured/killed. Saved permanently until changed manually.
                </div>
              </div>
              
              {/* Checkered pattern background for transparent PNG preview */}
              <div
                className="w-14 h-14 rounded-xl border border-purple-800/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-lg relative bg-slate-900"
                style={{
                  backgroundImage: `linear-gradient(45deg, #1e1b4b 25%, transparent 25%), linear-gradient(-45deg, #1e1b4b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e1b4b 75%), linear-gradient(-45deg, transparent 75%, #1e1b4b 75%)`,
                  backgroundSize: `12px 12px`,
                  backgroundPosition: `0 0, 0 6px, 6px -6px, -6px 0px`,
                }}
              >
                <img
                  src={ghostImageUrl}
                  alt="Ghost Preview"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* URL Input field + File Upload Button */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste direct PNG image URL..."
                  value={ghostImageUrl.startsWith('data:') ? '' : ghostImageUrl}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (val) onUploadGhostImage(val);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-purple-600 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none transition font-mono placeholder:text-slate-600"
                />

                <label className="cursor-pointer py-1.5 px-3 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/80 font-bold text-xs rounded-xl transition text-center flex items-center gap-1.5 shrink-0 shadow">
                  <Upload className="w-3.5 h-3.5 text-purple-400" /> Upload PNG
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const res = evt.target?.result as string;
                          if (res) onUploadGhostImage(res);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Preset Placeholders & Reset */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="font-semibold text-slate-500">Quick Presets:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onUploadGhostImage(
                        `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 100 100'><path d='M50 10 C30 10 20 28 20 50 C20 68 18 80 25 85 C32 90 38 80 45 85 C50 88 55 85 60 85 C67 85 72 90 78 84 C82 80 80 68 80 50 C80 28 70 10 50 10 Z' fill='%23a855f7' stroke='%23ffffff' stroke-width='3'/><circle cx='38' cy='42' r='6' fill='%230f172a'/><circle cx='62' cy='42' r='6' fill='%230f172a'/><ellipse cx='50' cy='60' rx='8' ry='10' fill='%230f172a'/></svg>`
                      )
                    }
                    className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 transition font-bold"
                  >
                    👻 Purple Ghost
                  </button>
                  <button
                    onClick={() =>
                      onUploadGhostImage(
                        `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 100 100'><path d='M50 10 C30 10 20 28 20 50 C20 68 18 80 25 85 C32 90 38 80 45 85 C50 88 55 85 60 85 C67 85 72 90 78 84 C82 80 80 68 80 50 C80 28 70 10 50 10 Z' fill='%23ef4444' stroke='%23fef08a' stroke-width='4'/><circle cx='38' cy='42' r='6' fill='%23fef08a'/><circle cx='62' cy='42' r='6' fill='%23fef08a'/><path d='M35 62 Q50 78 65 62' stroke='%23fef08a' stroke-width='4' fill='none'/></svg>`
                      )
                    }
                    className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition font-bold"
                  >
                    🔥 Flame Ghost
                  </button>
                  <button
                    onClick={onResetGhostImage}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

