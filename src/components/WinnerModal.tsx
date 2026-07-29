import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { GameState } from '../types';
import { COLOR_HEX, getColorHex } from '../utils/ludoEngine';

interface WinnerModalProps {
  gameState: GameState;
  onNewGame: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ gameState, onNewGame }) => {
  useEffect(() => {
    // Fire confetti on mount safely with custom canvas instance to avoid missing getBoundingClientRect in iframes
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const myCanvas = document.createElement('canvas');
        myCanvas.style.position = 'fixed';
        myCanvas.style.top = '0';
        myCanvas.style.left = '0';
        myCanvas.style.width = '100vw';
        myCanvas.style.height = '100vh';
        myCanvas.style.pointerEvents = 'none';
        myCanvas.style.zIndex = '99999';

        if (typeof myCanvas.getBoundingClientRect !== 'function') {
          (myCanvas as any).getBoundingClientRect = () => ({
            top: 0,
            left: 0,
            right: window.innerWidth || 1200,
            bottom: window.innerHeight || 800,
            width: window.innerWidth || 1200,
            height: window.innerHeight || 800,
            x: 0,
            y: 0,
            toJSON: () => {},
          });
        }

        document.body.appendChild(myCanvas);

        const myConfetti = (confetti as any).create(myCanvas, { resize: true, useWorker: false });
        myConfetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          disableForReducedMotion: true,
        }).finally(() => {
          try {
            myCanvas.remove();
          } catch (_) {}
        });
      }
    } catch (e) {
      console.warn('Confetti effect bypassed:', e);
    }
  }, []);

  if (gameState.turnPhase !== 'game_over') return null;

  const winnerIdx = gameState.rankings[0] ?? 0;
  const winnerPlayer = gameState.players[winnerIdx];
  const winnerColor = getColorHex(winnerPlayer?.color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center text-slate-100 flex flex-col items-center gap-5">
        {/* Trophy Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4"
          style={{ backgroundColor: winnerColor.main, borderColor: winnerColor.dark }}
        >
          <Trophy className="w-10 h-10 text-amber-300 drop-shadow" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Victory Complete
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">{winnerPlayer?.name} WINS!</h2>
          <p className="text-xs text-slate-400 mt-1">Successfully got all 4 tokens Home 🎯</p>
        </div>

        {/* Rankings Breakdown */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left mb-1">
            Final Standings
          </div>
          {gameState.rankings.map((pIdx, rank) => {
            const p = gameState.players[pIdx];
            const pC = COLOR_HEX[p.color];
            return (
              <div
                key={`rank-${pIdx}`}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs text-amber-400">#{rank + 1}</span>
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: pC.main }}
                  />
                  <span className="font-semibold text-sm text-white">{p.name}</span>
                </div>
                <span className="text-xs font-medium text-emerald-400">Finished All Tokens</span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={onNewGame}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition"
        >
          <RotateCcw className="w-4 h-4" /> Start New Game
        </button>
      </div>
    </div>
  );
};

