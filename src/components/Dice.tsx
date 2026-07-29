import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Dices, BarChart2 } from 'lucide-react';
import { DiceStats } from '../types';

interface DiceProps {
  currentRoll: number | null;
  hasRolled: boolean;
  isRolling: boolean;
  disabled: boolean;
  activeColor: string;
  activePlayerName: string;
  isBot: boolean;
  onRoll: () => void;
  diceStats: DiceStats;
}

export const Dice: React.FC<DiceProps> = ({
  currentRoll,
  hasRolled,
  isRolling,
  disabled,
  activeColor,
  activePlayerName,
  isBot,
  onRoll,
  diceStats,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [rollingVal, setRollingVal] = useState<number>(1);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRolling) {
      interval = setInterval(() => {
        setRollingVal(Math.floor(Math.random() * 6) + 1);
      }, 45);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRolling]);

  const displayVal = isRolling ? rollingVal : currentRoll || 0;

  // Render 3D dot patterns on 2D die face
  const renderDotPattern = (value: number) => {
    const dotStyle = "w-3 h-3 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.4)] border border-black/10";
    const centerDotStyle = "w-3.5 h-3.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.4)] border border-black/10";

    switch (value) {
      case 1:
        return <div className={`col-start-2 row-start-2 m-auto ${centerDotStyle}`} />;
      case 2:
        return (
          <>
            <div className={`col-start-1 row-start-1 m-auto ${dotStyle}`} />
            <div className={`col-start-3 row-start-3 m-auto ${dotStyle}`} />
          </>
        );
      case 3:
        return (
          <>
            <div className={`col-start-1 row-start-1 m-auto ${dotStyle}`} />
            <div className={`col-start-2 row-start-2 m-auto ${dotStyle}`} />
            <div className={`col-start-3 row-start-3 m-auto ${dotStyle}`} />
          </>
        );
      case 4:
        return (
          <>
            <div className={`col-start-1 row-start-1 m-auto ${dotStyle}`} />
            <div className={`col-start-3 row-start-1 m-auto ${dotStyle}`} />
            <div className={`col-start-1 row-start-3 m-auto ${dotStyle}`} />
            <div className={`col-start-3 row-start-3 m-auto ${dotStyle}`} />
          </>
        );
      case 5:
        return (
          <>
            <div className={`col-start-1 row-start-1 m-auto ${dotStyle}`} />
            <div className={`col-start-3 row-start-1 m-auto ${dotStyle}`} />
            <div className={`col-start-2 row-start-2 m-auto ${centerDotStyle}`} />
            <div className={`col-start-1 row-start-3 m-auto ${dotStyle}`} />
            <div className={`col-start-3 row-start-3 m-auto ${dotStyle}`} />
          </>
        );
      case 6:
        return (
          <>
            <div className={`col-start-1 row-start-1 m-auto ${dotStyle}`} />
            <div className={`col-start-3 row-start-1 m-auto ${dotStyle}`} />
            <div className={`col-start-1 row-start-2 m-auto ${dotStyle}`} />
            <div className={`col-start-3 row-start-2 m-auto ${dotStyle}`} />
            <div className={`col-start-1 row-start-3 m-auto ${dotStyle}`} />
            <div className={`col-start-3 row-start-3 m-auto ${dotStyle}`} />
          </>
        );
      default:
        return <Dices className="w-8 h-8 text-white m-auto col-span-3 row-span-3 drop-shadow animate-pulse" />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4 bg-slate-800/90 border border-slate-700 p-3.5 rounded-2xl shadow-xl backdrop-blur-md">
        {/* Dice Face Button - Always rounded corners */}
        <motion.button
          onClick={onRoll}
          disabled={disabled || hasRolled || isRolling}
          whileHover={!disabled && !hasRolled ? { scale: 1.08 } : {}}
          whileTap={!disabled && !hasRolled ? { scale: 0.92 } : {}}
          animate={
            isRolling
              ? {
                  rotate: [0, 90, 180, 270, 360],
                  scale: [1, 1.2, 0.85, 1.15, 1],
                  borderRadius: ['16px', '24px', '12px', '20px', '16px'],
                }
              : {
                  rotate: 0,
                  scale: 1,
                  borderRadius: '16px',
                }
          }
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className={`w-20 h-20 rounded-2xl p-2.5 flex items-center justify-center shadow-2xl border-2 transition-all duration-300 ${
            hasRolled
              ? 'cursor-default ring-4 ring-white/50'
              : disabled
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:shadow-2xl active:scale-95'
          }`}
          style={{
            backgroundColor: activeColor,
            borderColor: '#ffffff',
            boxShadow: `0 8px 24px ${activeColor}80, inset 0 2px 4px rgba(255,255,255,0.4)`
          }}
        >
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 items-center justify-items-center">
            {renderDotPattern(displayVal)}
          </div>
        </motion.button>

        {/* Action Info / Status */}
        <div className="flex flex-col items-start min-w-[140px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: activeColor }} />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Turn</span>
          </div>
          <span className="text-base font-bold text-white truncate max-w-[160px]">{activePlayerName}</span>

          <div className="mt-1 flex items-center gap-2">
            {!hasRolled ? (
              <button
                onClick={onRoll}
                disabled={disabled || isRolling}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-md transition disabled:opacity-50"
              >
                {isBot ? 'Bot Rolling...' : 'Click to Roll'}
              </button>
            ) : (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60">
                Rolled {currentRoll}! Select Token
              </span>
            )}
          </div>
        </div>

        {/* Probability Stats Toggle */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-600/50"
          title="Dice Probability Distribution"
        >
          <BarChart2 className="w-5 h-5" />
        </button>
      </div>

      {/* Probability Stats Popover */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs text-slate-300"
        >
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-800">
            <span className="font-semibold text-emerald-400">Uniform Dice Probability Check</span>
            <span className="text-slate-500">Total Rolls: {diceStats.totalRolls}</span>
          </div>
          <div className="grid grid-cols-6 gap-1 text-center">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const count = diceStats.counts[num] || 0;
              const pct = diceStats.totalRolls > 0 ? Math.round((count / diceStats.totalRolls) * 100) : 16;
              return (
                <div key={`stat-${num}`} className="bg-slate-800 p-1.5 rounded-lg border border-slate-700/50">
                  <div className="font-bold text-white mb-0.5">{num}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">{count}</div>
                  <div className="text-[9px] text-slate-400">{pct}%</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
