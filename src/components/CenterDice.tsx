import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Dices } from 'lucide-react';

interface CenterDiceProps {
  currentRoll: number | null;
  hasRolled: boolean;
  isRolling: boolean;
  disabled: boolean;
  activeColor: string;
  activePlayerName: string;
  isBot: boolean;
  onRoll: () => void;
}

export const CenterDice: React.FC<CenterDiceProps> = ({
  currentRoll,
  hasRolled,
  isRolling,
  disabled,
  activeColor,
  activePlayerName,
  isBot,
  onRoll,
}) => {
  const [rollingVal, setRollingVal] = useState<number>(1);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRolling) {
      interval = setInterval(() => {
        setRollingVal(Math.floor(Math.random() * 6) + 1);
      }, 40);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRolling]);

  const displayValue = isRolling ? rollingVal : currentRoll || 0;
  const isClickable = !disabled && !hasRolled && !isRolling && !isBot;

  // Render high quality dot patterns for dice face
  const renderDots = (value: number) => {
    const dotClass = "w-2.5 h-2.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.4)] border border-black/10";
    const centerDotClass = "w-2.5 h-2.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.4)] border border-black/10";

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
        return <Dices className="w-6 h-6 text-white m-auto col-span-3 row-span-3 animate-pulse drop-shadow" />;
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center pointer-events-auto">
      {/* Active player color aura glow ring */}
      <motion.div
        animate={
          isClickable
            ? { scale: [1, 1.15, 1], opacity: [0.7, 0.35, 0.7] }
            : { scale: 1, opacity: 0.5 }
        }
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        className="absolute inset-0 -m-1.5 rounded-2xl pointer-events-none"
        style={{
          boxShadow: `0 0 16px ${activeColor}, inset 0 0 8px ${activeColor}`,
        }}
      />

      {/* Main Center Dice Button - Always rounded corners */}
      <motion.button
        onClick={() => {
          if (isClickable) onRoll();
        }}
        disabled={disabled || hasRolled || isRolling}
        whileHover={isClickable ? { scale: 1.1, y: -2 } : {}}
        whileTap={isClickable ? { scale: 0.9, y: 1 } : {}}
        animate={
          isRolling
            ? {
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.25, 0.85, 1.15, 1],
                y: [0, -10, 0],
                borderRadius: ['16px', '22px', '12px', '20px', '16px'],
              }
            : {
                rotate: 0,
                scale: 1,
                y: 0,
                borderRadius: '16px',
              }
        }
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl p-1.5 flex flex-col items-center justify-center shadow-2xl border-2 transition-all select-none ${
          isClickable ? 'cursor-pointer hover:scale-110 active:scale-90 ring-2 ring-white/60' : 'cursor-default'
        }`}
        style={{
          backgroundColor: activeColor,
          borderColor: '#ffffff',
          boxShadow: `0 8px 24px ${activeColor}80, inset 0 2px 4px rgba(255,255,255,0.4)`
        }}
        title={isClickable ? 'Click center dice to roll!' : activePlayerName}
      >
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 items-center justify-items-center">
          {renderDots(displayValue)}
        </div>
      </motion.button>

      {/* Compact Turn Action Badge Below Center Dice */}
      <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-slate-700/80 text-[9px] font-black shadow-lg flex items-center gap-1 whitespace-nowrap backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeColor }} />
        <span style={{ color: activeColor }} className="uppercase tracking-tight">
          {isRolling
            ? 'Rolling...'
            : hasRolled
            ? `Rolled ${currentRoll}`
            : isBot
            ? `${activePlayerName}`
            : 'Roll'}
        </span>
      </div>
    </div>
  );
};
