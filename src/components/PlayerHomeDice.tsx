import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Dices, Sparkles } from 'lucide-react';
import { Player } from '../types';
import { getColorHex } from '../utils/ludoEngine';

interface PlayerHomeDiceProps {
  playerIndex: number;
  player: Player;
  isActiveTurn: boolean;
  currentRoll: number | null;
  lastRoll: number | null;
  hasRolled: boolean;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
}

export const PlayerHomeDice: React.FC<PlayerHomeDiceProps> = ({
  playerIndex,
  player,
  isActiveTurn,
  currentRoll,
  lastRoll,
  hasRolled,
  isRolling,
  disabled,
  onRoll,
}) => {
  const [rollingVal, setRollingVal] = useState<number>(1);
  const pColor = getColorHex(player?.color);

  // Rapidly shuffle dice dots during rolling animation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActiveTurn && isRolling) {
      interval = setInterval(() => {
        setRollingVal(Math.floor(Math.random() * 6) + 1);
      }, 40);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActiveTurn, isRolling]);

  // Determine displayed face value
  let displayVal = 0;
  if (isActiveTurn && isRolling) {
    displayVal = rollingVal;
  } else if (isActiveTurn && currentRoll !== null) {
    displayVal = currentRoll;
  } else if (lastRoll !== null && lastRoll !== undefined) {
    displayVal = lastRoll;
  } else {
    displayVal = 0;
  }

  const isClickable = isActiveTurn && !hasRolled && !isRolling && !disabled && player?.type !== 'bot';

  // Position off the 600x600 board:
  // 0: Red (Top-Left, above board)
  // 1: Green (Top-Right, above board)
  // 2: Yellow (Bottom-Right, below board)
  // 3: Blue (Bottom-Left, below board)
  const positionClasses: Record<number, string> = {
    0: '-top-2 sm:-top-3 left-[20%]',
    1: '-top-2 sm:-top-3 left-[80%]',
    2: '-bottom-24 sm:-bottom-28 left-[80%]',
    3: '-bottom-24 sm:-bottom-28 left-[20%]',
  };

  const posClass = positionClasses[playerIndex] || 'top-[20%] left-[20%]';

  // Render high-quality 3D dot patterns
  const renderDotPattern = (value: number) => {
    const dotClass =
      'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5)] border border-black/20';
    const centerDotClass =
      'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5)] border border-black/20';

    switch (value) {
      case 1:
        return <div className={`${centerDotClass} col-start-2 row-start-2 m-auto`} />;
      case 2:
        return (
          <>
            <div className={`${dotClass} col-start-1 row-start-1 m-auto`} />
            <div className={`${dotClass} col-start-3 row-start-3 m-auto`} />
          </>
        );
      case 3:
        return (
          <>
            <div className={`${dotClass} col-start-1 row-start-1 m-auto`} />
            <div className={`${dotClass} col-start-2 row-start-2 m-auto`} />
            <div className={`${dotClass} col-start-3 row-start-3 m-auto`} />
          </>
        );
      case 4:
        return (
          <>
            <div className={`${dotClass} col-start-1 row-start-1 m-auto`} />
            <div className={`${dotClass} col-start-3 row-start-1 m-auto`} />
            <div className={`${dotClass} col-start-1 row-start-3 m-auto`} />
            <div className={`${dotClass} col-start-3 row-start-3 m-auto`} />
          </>
        );
      case 5:
        return (
          <>
            <div className={`${dotClass} col-start-1 row-start-1 m-auto`} />
            <div className={`${dotClass} col-start-3 row-start-1 m-auto`} />
            <div className={`${centerDotClass} col-start-2 row-start-2 m-auto`} />
            <div className={`${dotClass} col-start-1 row-start-3 m-auto`} />
            <div className={`${dotClass} col-start-3 row-start-3 m-auto`} />
          </>
        );
      case 6:
        return (
          <>
            <div className={`${dotClass} col-start-1 row-start-1 m-auto`} />
            <div className={`${dotClass} col-start-3 row-start-1 m-auto`} />
            <div className={`${dotClass} col-start-1 row-start-2 m-auto`} />
            <div className={`${dotClass} col-start-3 row-start-2 m-auto`} />
            <div className={`${dotClass} col-start-1 row-start-3 m-auto`} />
            <div className={`${dotClass} col-start-3 row-start-3 m-auto`} />
          </>
        );
      default:
        return (
          <Dices
            className={`w-5 h-5 text-white/90 m-auto col-span-3 row-span-3 drop-shadow ${
              isActiveTurn ? 'animate-pulse' : ''
            }`}
          />
        );
    }
  };

  const defaultAvatars = ['🦊', '🐉', '⚡', '🚀'];
  const avatar = player?.avatar || defaultAvatars[playerIndex] || '🎲';

  return (
    <div
      className={`absolute ${posClass} -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center pointer-events-auto transition-all duration-300`}
    >
      {/* Active Turn Glowing Aura Ring */}
      {isActiveTurn && (
        <motion.div
          animate={
            isClickable
              ? { scale: [1, 1.22, 1], opacity: [0.85, 0.4, 0.85] }
              : { scale: 1.05, opacity: 0.6 }
          }
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 -m-2 rounded-2xl pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${pColor.main}, inset 0 0 10px ${pColor.main}`,
          }}
        />
      )}

      {/* Main Player Home Dice Button */}
      <motion.button
        onClick={() => {
          if (isClickable) onRoll();
        }}
        disabled={!isClickable && !isRolling}
        whileHover={isClickable ? { scale: 1.15, y: -2 } : {}}
        whileTap={isClickable ? { scale: 0.9, y: 1 } : {}}
        animate={
          isActiveTurn && isRolling
            ? {
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.25, 0.85, 1.15, 1],
                borderRadius: ['14px', '20px', '10px', '18px', '14px'],
              }
            : {
                rotate: 0,
                scale: isActiveTurn ? 1.05 : 0.92,
                borderRadius: '14px',
              }
        }
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl p-1.5 flex flex-col items-center justify-center shadow-2xl border-2 transition-all select-none ${
          isClickable
            ? 'cursor-pointer hover:scale-110 active:scale-95 ring-2 ring-white/80'
            : isActiveTurn
            ? 'cursor-default ring-2 ring-white/60 opacity-100'
            : 'cursor-not-allowed opacity-75 grayscale-[20%]'
        }`}
        style={{
          backgroundColor: pColor.main,
          borderColor: isActiveTurn ? '#ffffff' : pColor.light,
          boxShadow: isActiveTurn
            ? `0 6px 20px ${pColor.main}aa, inset 0 2px 4px rgba(255,255,255,0.5)`
            : `0 3px 10px rgba(0,0,0,0.3)`,
        }}
        title={`${player?.name || 'Player'} (${isActiveTurn ? 'Active Turn' : 'Waiting'})`}
      >
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 items-center justify-items-center">
          {renderDotPattern(displayVal)}
        </div>
      </motion.button>

      {/* Turn Action Badge Below Player Home Dice */}
      <div
        className={`mt-1 px-2 py-0.5 rounded-full text-[9px] font-black shadow-lg flex items-center gap-1 whitespace-nowrap backdrop-blur-md transition-all duration-300 border ${
          isActiveTurn
            ? 'bg-slate-950/95 text-white border-white/40 scale-105'
            : 'bg-slate-900/80 text-slate-400 border-slate-700/60'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isActiveTurn ? 'animate-ping' : ''}`}
          style={{ backgroundColor: pColor.main }}
        />
        <span style={{ color: isActiveTurn ? pColor.light : undefined }} className="uppercase tracking-tight">
          {isActiveTurn
            ? isRolling
              ? 'Rolling...'
              : hasRolled
              ? `Rolled ${currentRoll}`
              : player?.type === 'bot'
              ? 'Bot Turn'
              : 'ROLL!'
            : `${avatar} ${player?.name || 'Player'}`}
        </span>
      </div>
    </div>
  );
};
