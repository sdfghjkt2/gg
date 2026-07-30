import React from 'react';
import { Shield, CheckCircle2, X, AlertTriangle, Layers, Zap } from 'lucide-react';
import { SAFE_SQUARES_4P, COLOR_HEX } from '../utils/ludoEngine';

interface SafeSquaresModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafeSquaresModal: React.FC<SafeSquaresModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-2xl shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Safe Squares & Ludo Rules
              </h2>
              <p className="text-xs text-slate-400">Strictly enforced tile rules and capture logic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar text-sm text-slate-300">
          {/* Section 1: Official Rules */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Enforced Capture & Stacking Rules
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-sm">1. Safe Squares Protection</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tokens on any of the 8 safe squares (4 colored start tiles and 4 star tiles) <strong className="text-amber-300">can never be killed</strong>. Multiple tokens (friendly or enemy) coexist and stack on safe tiles.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                <Layers className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-sm">2. Same-Player Stack Protection</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    If 2 or more tokens belonging to the <strong className="text-indigo-300">same player</strong> occupy a non-safe square, they form a same-player blockade/stack. An opponent token landing on this tile <strong className="text-slate-200">cannot kill them</strong> and stacks alongside them.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-sm">3. Exact-Landing Single Opponent Kill</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    A capture occurs <strong className="text-emerald-300">ONLY</strong> when your token lands on the exact same non-safe tile occupied by a <strong className="text-slate-200">single opponent token</strong>. Tokens a tile ahead or behind are never killed.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-sm">4. Fixed Landing Stationing</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    When capturing an opponent token, your token stays stationed on its landing tile throughout the rewind animation while the captured token traces back to its home yard.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Safe Squares Identification Table */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Identified Safe Squares Registry ({SAFE_SQUARES_4P.length} Squares)
            </h3>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-800/60 px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-5">Square Name</div>
                <div className="col-span-4">Unique ID</div>
                <div className="col-span-3 text-right">Global Pos</div>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {SAFE_SQUARES_4P.map((sq) => {
                  const colorObj = COLOR_HEX[sq.color];
                  return (
                    <div key={sq.id} className="grid grid-cols-12 px-3 py-2.5 items-center hover:bg-slate-800/30 transition">
                      <div className="col-span-5 flex items-center gap-2 font-semibold text-slate-200">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: colorObj.main }}
                        />
                        {sq.name}
                      </div>
                      <div className="col-span-4 font-mono text-[11px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40 w-fit">
                        {sq.id}
                      </div>
                      <div className="col-span-3 text-right font-bold text-slate-400">
                        Tile #{sq.globalPos}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
