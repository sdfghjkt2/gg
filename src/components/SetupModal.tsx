import React, { useState } from 'react';
import { BoardMode, PlayerType } from '../types';
import { Bot, User, Play, Sparkles, Smile } from 'lucide-react';
import { COLOR_HEX, DEFAULT_PLAYER_AVATARS, AVATAR_OPTIONS } from '../utils/ludoEngine';

interface SetupModalProps {
  isOpen: boolean;
  onStartGame: (mode: BoardMode, playerTypes: PlayerType[], playerAvatars?: string[], playerNames?: string[]) => void;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onStartGame, onClose }) => {
  const [playerTypes4P, setPlayerTypes4P] = useState<PlayerType[]>(['human', 'bot', 'bot', 'bot']);
  const [playerAvatars, setPlayerAvatars] = useState<string[]>([...DEFAULT_PLAYER_AVATARS]);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Player 1 (RED)',
    'Bot 2 (GREEN)',
    'Bot 3 (YELLOW)',
    'Bot 4 (BLUE)',
  ]);
  const [editingAvatarIndex, setEditingAvatarIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const colors4P = ['red', 'green', 'yellow', 'blue'] as const;

  const handleTogglePlayerType = (index: number) => {
    const copy = [...playerTypes4P];
    const newType: PlayerType = copy[index] === 'human' ? 'bot' : 'human';
    copy[index] = newType;
    setPlayerTypes4P(copy);

    // Update default name if not manually modified
    const namesCopy = [...playerNames];
    const colorKey = colors4P[index].toUpperCase();
    if (newType === 'human' && namesCopy[index].startsWith('Bot')) {
      namesCopy[index] = `Player ${index + 1} (${colorKey})`;
    } else if (newType === 'bot' && namesCopy[index].startsWith('Player')) {
      namesCopy[index] = `Bot ${index + 1} (${colorKey})`;
    }
    setPlayerNames(namesCopy);
  };

  const handleSelectAvatar = (playerIndex: number, avatar: string) => {
    const copy = [...playerAvatars];
    copy[playerIndex] = avatar;
    setPlayerAvatars(copy);
    setEditingAvatarIndex(null);
  };

  const handleNameChange = (index: number, name: string) => {
    const copy = [...playerNames];
    copy[index] = name;
    setPlayerNames(copy);
  };

  const handleStart = () => {
    onStartGame('4P', playerTypes4P, playerAvatars, playerNames);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Ludo Game Setup
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Select Game Setup</h2>
          <p className="text-xs text-slate-400 mt-1">Assign player types & color-coded avatars for each slot</p>
        </div>

        {/* Player Slot Configuration */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Configure Players & Avatars</span>
            <span className="text-[10px] text-slate-500">Click avatar to customize</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {colors4P.map((colorKey, idx) => {
              const pType = playerTypes4P[idx];
              const pColor = COLOR_HEX[colorKey];
              const pAvatar = playerAvatars[idx] || DEFAULT_PLAYER_AVATARS[idx];
              const isPickingAvatar = editingAvatarIndex === idx;

              return (
                <div
                  key={`slot-cfg-${colorKey}`}
                  className="flex flex-col rounded-2xl bg-slate-950/90 border border-slate-800 p-3 gap-2 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Color-coded Avatar Badge */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => setEditingAvatarIndex(isPickingAvatar ? null : idx)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border-2 shadow-lg transition transform hover:scale-105 relative group"
                        style={{
                          backgroundColor: `${pColor.dark}bb`,
                          borderColor: pColor.main,
                          boxShadow: `0 0 12px ${pColor.main}44`,
                        }}
                        title="Click to change avatar icon"
                      >
                        {pAvatar}
                        <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition">
                          <Smile className="w-4 h-4" />
                        </div>
                      </button>

                      <div className="flex flex-col flex-1 min-w-0">
                        <input
                          type="text"
                          value={playerNames[idx]}
                          onChange={(e) => handleNameChange(idx, e.target.value)}
                          className="bg-transparent font-bold text-sm text-white focus:outline-none border-b border-transparent focus:border-slate-600 px-1 py-0.5 truncate"
                          placeholder={`Player ${idx + 1}`}
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                          {colorKey} Slot
                        </span>
                      </div>
                    </div>

                    {/* Type Selector (Human vs AI Bot) */}
                    <button
                      onClick={() => handleTogglePlayerType(idx)}
                      className="shrink-0 transition transform active:scale-95"
                    >
                      {pType === 'human' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/90 text-blue-400 border border-blue-800 font-bold text-xs shadow">
                          <User className="w-3.5 h-3.5" /> Human
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/90 text-emerald-400 border border-emerald-800 font-bold text-xs shadow">
                          <Bot className="w-3.5 h-3.5" /> AI Bot
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Avatar Picker Palette */}
                  {isPickingAvatar && (
                    <div className="mt-1 p-2 bg-slate-900 border border-slate-700/80 rounded-xl flex flex-col gap-1.5 animate-fade-in">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Choose {colorKey.toUpperCase()} Avatar:
                      </div>
                      <div className="grid grid-cols-10 gap-1.5">
                        {AVATAR_OPTIONS.map((av) => (
                          <button
                            key={`av-${idx}-${av}`}
                            onClick={() => handleSelectAvatar(idx, av)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:scale-110 transition border ${
                              pAvatar === av
                                ? 'border-white bg-slate-800 ring-2 ring-emerald-400'
                                : 'border-slate-800 bg-slate-950 hover:bg-slate-800'
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleStart}
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-white" /> Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
