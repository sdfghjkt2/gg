import React from 'react';
import { motion } from 'motion/react';
import { GameState, Token } from '../types';
import { COLOR_HEX, getColorHex, isSafeCell, getGlobalTrackPos, getStartOffset } from '../utils/ludoEngine';
import {
  CELL_SIZE_4P,
  MAIN_TRACK_4P_GRID,
  YARD_POSITIONS_4P,
  HOME_STRETCH_4P_GRID,
  HOME_FINISH_4P,
  get4PTokenCenter,
} from '../utils/boardCoords';
import { Star } from 'lucide-react';
import { CenterDice } from './CenterDice';

import defaultGhostImg from '../assets/images/ghost_capture_effect_1785335938319.jpg';

interface Board4PProps {
  gameState: GameState;
  validTokenIds: number[];
  onTokenClick: (tokenId: number) => void;
  onRollDice: () => void;
  isRolling: boolean;
  overrideTokenPos?: { playerIndex: number; tokenId: number; step: number } | null;
  captureEffectCell?: { x: number; y: number } | null;
  isAnimating?: boolean;
  ghostImageUrl?: string;
}

export const Board4P: React.FC<Board4PProps> = ({
  gameState,
  validTokenIds,
  onTokenClick,
  onRollDice,
  isRolling,
  overrideTokenPos,
  captureEffectCell,
  isAnimating = false,
  ghostImageUrl,
}) => {
  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const activeColor = getColorHex(activePlayer?.color);

  // Helper to render yard square
  const renderYard = (
    x: number,
    y: number,
    size: number,
    mainColor: string,
    lightColor: string,
    darkColor: string,
    label: string,
    pIdx: number
  ) => {
    const player = gameState.players[pIdx];
    const avatar = player?.avatar || ['🦊', '🐉', '⚡', '🚀'][pIdx] || '🎲';

    return (
      <g key={`yard-g-${pIdx}`}>
        {/* Outer Yard Background */}
        <rect x={x} y={y} width={size} height={size} fill={mainColor} rx={16} stroke={darkColor} strokeWidth={3} />
        {/* Inner White Box */}
        <rect
          x={x + 30}
          y={y + 30}
          width={size - 60}
          height={size - 60}
          fill="#ffffff"
          rx={12}
          stroke={mainColor}
          strokeWidth={2}
          className="shadow-inner"
        />
        {/* Yard Header Text & Avatar */}
        <text
          x={x + size / 2}
          y={y + 24}
          fill="#ffffff"
          fontSize={13}
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="0.5px"
        >
          {avatar} {player?.name || label.toUpperCase()}
        </text>
      </g>
    );
  };

  // Safe spot indices on global main track
  const starGlobalIndices = [8, 21, 34, 47];

  return (
    <div className="relative w-full max-w-[620px] aspect-square mx-auto rounded-3xl bg-slate-900/80 p-3 backdrop-blur-md shadow-2xl border border-slate-700/60 flex items-center justify-center">
      <svg viewBox="0 0 600 600" className="w-full h-full rounded-2xl select-none overflow-visible">
        <defs>
          <filter id="tokenShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Board Background */}
        <rect x="0" y="0" width="600" height="600" fill="#f8fafc" rx="16" />

        {/* 1. YARDS */}
        {renderYard(0, 0, 240, COLOR_HEX.red.main, COLOR_HEX.red.light, COLOR_HEX.red.dark, 'Red', 0)}
        {renderYard(360, 0, 240, COLOR_HEX.green.main, COLOR_HEX.green.light, COLOR_HEX.green.dark, 'Green', 1)}
        {renderYard(360, 360, 240, COLOR_HEX.yellow.main, COLOR_HEX.yellow.light, COLOR_HEX.yellow.dark, 'Yellow', 2)}
        {renderYard(0, 360, 240, COLOR_HEX.blue.main, COLOR_HEX.blue.light, COLOR_HEX.blue.dark, 'Blue', 3)}

        {/* Yard Token Bases (White Circles) */}
        {([0, 1, 2, 3] as const).map((pIdx) =>
          YARD_POSITIONS_4P[pIdx].map((pos, tIdx) => (
            <circle
              key={`yard-base-${pIdx}-${tIdx}`}
              cx={pos.x}
              cy={pos.y}
              r={20}
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth={2}
            />
          ))
        )}

        {/* 2. MAIN TRACK CELLS */}
        {MAIN_TRACK_4P_GRID.map((pt, idx) => {
          const x = pt.x * CELL_SIZE_4P;
          const y = pt.y * CELL_SIZE_4P;

          let cellFill = '#ffffff';
          let isStart = false;
          let isStar = starGlobalIndices.includes(idx);

          if (idx === 0) {
            cellFill = COLOR_HEX.red.light;
            isStart = true;
          } else if (idx === 13) {
            cellFill = COLOR_HEX.green.light;
            isStart = true;
          } else if (idx === 26) {
            cellFill = COLOR_HEX.yellow.light;
            isStart = true;
          } else if (idx === 39) {
            cellFill = COLOR_HEX.blue.light;
            isStart = true;
          }

          return (
            <g key={`track-cell-${idx}`}>
              <rect
                x={x}
                y={y}
                width={CELL_SIZE_4P}
                height={CELL_SIZE_4P}
                fill={cellFill}
                stroke="#94a3b8"
                strokeWidth={1}
              />
              {isStar && (
                <polygon
                  points={`${x + 20},${y + 6} ${x + 24},${y + 15} ${x + 34},${y + 15} ${x + 26},${y + 21} ${x + 29},${y + 31} ${x + 20},${y + 25} ${x + 11},${y + 31} ${x + 14},${y + 21} ${x + 6},${y + 15} ${x + 16},${y + 15}`}
                  fill="#f59e0b"
                  stroke="#b45309"
                  strokeWidth={1}
                />
              )}
              {isStart && (
                <circle
                  cx={x + 20}
                  cy={y + 20}
                  r={8}
                  fill={
                    idx === 0
                      ? COLOR_HEX.red.main
                      : idx === 13
                      ? COLOR_HEX.green.main
                      : idx === 26
                      ? COLOR_HEX.yellow.main
                      : COLOR_HEX.blue.main
                  }
                  opacity={0.7}
                />
              )}
            </g>
          );
        })}

        {/* 3. HOME STRETCH CORRIDORS */}
        {HOME_STRETCH_4P_GRID[0].map((pt, i) => (
          <rect
            key={`home-red-${i}`}
            x={pt.x * CELL_SIZE_4P}
            y={pt.y * CELL_SIZE_4P}
            width={CELL_SIZE_4P}
            height={CELL_SIZE_4P}
            fill={COLOR_HEX.red.main}
            stroke="#7f1d1d"
            strokeWidth={1}
          />
        ))}
        {HOME_STRETCH_4P_GRID[1].map((pt, i) => (
          <rect
            key={`home-green-${i}`}
            x={pt.x * CELL_SIZE_4P}
            y={pt.y * CELL_SIZE_4P}
            width={CELL_SIZE_4P}
            height={CELL_SIZE_4P}
            fill={COLOR_HEX.green.main}
            stroke="#14532d"
            strokeWidth={1}
          />
        ))}
        {HOME_STRETCH_4P_GRID[2].map((pt, i) => (
          <rect
            key={`home-yellow-${i}`}
            x={pt.x * CELL_SIZE_4P}
            y={pt.y * CELL_SIZE_4P}
            width={CELL_SIZE_4P}
            height={CELL_SIZE_4P}
            fill={COLOR_HEX.yellow.main}
            stroke="#713f12"
            strokeWidth={1}
          />
        ))}
        {HOME_STRETCH_4P_GRID[3].map((pt, i) => (
          <rect
            key={`home-blue-${i}`}
            x={pt.x * CELL_SIZE_4P}
            y={pt.y * CELL_SIZE_4P}
            width={CELL_SIZE_4P}
            height={CELL_SIZE_4P}
            fill={COLOR_HEX.blue.main}
            stroke="#1e3a8a"
            strokeWidth={1}
          />
        ))}

        {/* 4. CENTRAL HOME TRIANGLES */}
        {/* Red Home Triangle */}
        <polygon points="240,240 300,300 240,360" fill={COLOR_HEX.red.main} stroke="#991b1b" strokeWidth={2} />
        {/* Green Home Triangle */}
        <polygon points="240,240 300,300 360,240" fill={COLOR_HEX.green.main} stroke="#166534" strokeWidth={2} />
        {/* Yellow Home Triangle */}
        <polygon points="360,240 300,300 360,360" fill={COLOR_HEX.yellow.main} stroke="#854d0e" strokeWidth={2} />
        {/* Blue Home Triangle */}
        <polygon points="240,360 300,300 360,360" fill={COLOR_HEX.blue.main} stroke="#1e40af" strokeWidth={2} />

        {/* Center cutout background circle for Center Dice */}
        <circle cx="300" cy="300" r="48" fill="#0f172a" stroke="#334155" strokeWidth={3} />

        {/* Capture Ghost & Explosion Effect */}
        {captureEffectCell && (
          <g key={`ghost-effect-${captureEffectCell.x}-${captureEffectCell.y}`}>
            <motion.circle
              cx={captureEffectCell.x}
              cy={captureEffectCell.y}
              initial={{ r: 10, opacity: 1 }}
              animate={{ r: 80, opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              fill="none"
              stroke="#ec4899"
              strokeWidth={4}
            />
            <motion.circle
              cx={captureEffectCell.x}
              cy={captureEffectCell.y}
              initial={{ r: 5, opacity: 0.8 }}
              animate={{ r: 45, opacity: 0 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
              fill="#38bdf8"
            />
            {/* Ghost Image Steady Clean Rise & Fade Out */}
            <motion.image
              href={ghostImageUrl || defaultGhostImg}
              x={captureEffectCell.x - 40}
              y={captureEffectCell.y - 40}
              width={80}
              height={80}
              initial={{ scale: 0.6, opacity: 1, y: 0, rotate: 0 }}
              animate={{
                scale: 3.5,
                opacity: 0,
                y: -95,
                rotate: 0,
              }}
              transition={{ duration: 2.0, ease: 'easeOut' }}
              style={{
                transformOrigin: `${captureEffectCell.x}px ${captureEffectCell.y}px`,
                pointerEvents: 'none',
              }}
            />
            <motion.text
              x={captureEffectCell.x}
              y={captureEffectCell.y - 45}
              initial={{ opacity: 1, scale: 0.8, y: 0 }}
              animate={{ opacity: 0, scale: 1.5, y: -65 }}
              transition={{ duration: 1.8, ease: 'easeOut', delay: 0.1 }}
              fill="#f43f5e"
              fontSize={17}
              fontWeight="900"
              textAnchor="middle"
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            >
              CAPTURED! 💥
            </motion.text>
          </g>
        )}

        {/* 5. PLAYER TOKENS */}
        {(() => {
          // Pre-calculate tile occupancy map for tokens on main track and home stretch
          const tileTokenMap = new Map<string, Array<{ playerIndex: number; tokenId: number }>>();

          gameState.players.forEach((p) => {
            p.tokens.forEach((t) => {
              const isOverridden =
                overrideTokenPos &&
                overrideTokenPos.playerIndex === p.id &&
                overrideTokenPos.tokenId === t.id;

              const displayStep = isOverridden ? overrideTokenPos.step : t.step;

              if (displayStep >= 0 && displayStep < 57) {
                let tileKey = '';
                if (displayStep >= 52) {
                  tileKey = `home_${p.id}_${displayStep}`;
                } else {
                  const offset = getStartOffset(gameState.mode, p.id);
                  const globalPos = (offset + displayStep) % 52;
                  tileKey = `main_${globalPos}`;
                }

                const existing = tileTokenMap.get(tileKey) || [];
                existing.push({ playerIndex: p.id, tokenId: t.id });
                tileTokenMap.set(tileKey, existing);
              }
            });
          });

          return gameState.players.map((player) => {
            const pColor = getColorHex(player.color);

            return player.tokens.map((token) => {
              const isCurrentPlayer = player.id === gameState.activePlayerIndex;
              const isMoveable = isCurrentPlayer && validTokenIds.includes(token.id) && gameState.hasRolled && !isAnimating;

              const isOverridden =
                overrideTokenPos &&
                overrideTokenPos.playerIndex === player.id &&
                overrideTokenPos.tokenId === token.id;

              const displayStep = isOverridden ? overrideTokenPos.step : token.step;
              const baseCenter = get4PTokenCenter(player.id, displayStep, token.id);

              let tileKey = '';
              if (displayStep >= 0 && displayStep < 52) {
                const offset = getStartOffset(gameState.mode, player.id);
                const globalPos = (offset + displayStep) % 52;
                tileKey = `main_${globalPos}`;
              } else if (displayStep >= 52 && displayStep < 57) {
                tileKey = `home_${player.id}_${displayStep}`;
              }

              const stackedTokens = tileKey ? tileTokenMap.get(tileKey) || [] : [];
              const stackCount = stackedTokens.length;
              const stackedIndex = stackedTokens.findIndex(
                (st) => st.playerIndex === player.id && st.tokenId === token.id
              );

              let dx = 0;
              let dy = 0;
              let scaleFactor = 1.0;

              if (stackCount > 1 && stackedIndex !== -1) {
                if (stackCount === 2) {
                  scaleFactor = 0.72;
                  dx = stackedIndex === 0 ? -7 : 7;
                  dy = 0;
                } else if (stackCount === 3) {
                  scaleFactor = 0.64;
                  const offsets = [{ dx: 0, dy: -7 }, { dx: -7, dy: 6 }, { dx: 7, dy: 6 }];
                  dx = offsets[stackedIndex]?.dx || 0;
                  dy = offsets[stackedIndex]?.dy || 0;
                } else if (stackCount === 4) {
                  scaleFactor = 0.58;
                  const offsets = [
                    { dx: -7, dy: -7 },
                    { dx: 7, dy: -7 },
                    { dx: -7, dy: 7 },
                    { dx: 7, dy: 7 },
                  ];
                  dx = offsets[stackedIndex]?.dx || 0;
                  dy = offsets[stackedIndex]?.dy || 0;
                } else {
                  const cols = Math.ceil(Math.sqrt(stackCount));
                  const rows = Math.ceil(stackCount / cols);
                  const col = stackedIndex % cols;
                  const row = Math.floor(stackedIndex / cols);
                  const spacing = Math.min(16, 26 / Math.max(cols - 1, 1));
                  dx = (col - (cols - 1) / 2) * spacing;
                  dy = (row - (rows - 1) / 2) * spacing;
                  scaleFactor = Math.max(0.38, 1 / (1 + (stackCount - 1) * 0.25));
                }
              }

              const x = baseCenter.x + dx;
              const y = baseCenter.y + dy;

              return (
                <motion.g
                  key={`token-${player.id}-${token.id}`}
                  animate={{
                    x,
                    y,
                  }}
                  transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                  className={isMoveable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
                  onClick={() => {
                    if (isMoveable) onTokenClick(token.id);
                  }}
                >
                  {/* Invisible enlarged hit target for mobile touch support */}
                  <circle
                    cx={0}
                    cy={-5}
                    r={Math.max(20, 26 * scaleFactor)}
                    fill="transparent"
                    pointerEvents="all"
                  />

                  {/* Active Pulsing Ring */}
                  {isMoveable && (
                    <motion.circle
                      cx={0}
                      cy={0}
                      r={24 * scaleFactor}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth={3.5}
                      animate={{ r: [20 * scaleFactor, 26 * scaleFactor, 20 * scaleFactor], opacity: [0.9, 0.4, 0.9] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                  )}

                  {/* 3D Teardrop Token Pin with Wobbly Tile Jump Effect */}
                  <motion.g
                    animate={
                      isOverridden
                        ? {
                            y: [0, -20, -5, 0],
                            rotate: [0, -16, 14, -6, 0],
                            scaleX: [scaleFactor, scaleFactor * 0.78, scaleFactor * 1.28, scaleFactor * 0.88, scaleFactor],
                            scaleY: [scaleFactor, scaleFactor * 1.35, scaleFactor * 0.78, scaleFactor * 1.15, scaleFactor],
                          }
                        : {
                            y: 0,
                            rotate: 0,
                            scaleX: (isMoveable ? 1.18 : 1) * scaleFactor,
                            scaleY: (isMoveable ? 1.18 : 1) * scaleFactor,
                          }
                    }
                    transition={
                      isOverridden
                        ? { duration: 0.22, ease: 'easeOut' }
                        : { type: 'spring', stiffness: 450, damping: 25 }
                    }
                  >
                    {/* Dynamic Shadow on Tile while jumping */}
                    {isOverridden && (
                      <motion.ellipse
                        cx={0}
                        cy={15}
                        rx={10 * scaleFactor}
                        ry={4 * scaleFactor}
                        fill="#000000"
                        animate={{ opacity: [0.4, 0.12, 0.4], scale: [1, 0.5, 1] }}
                        transition={{ duration: 0.22 }}
                      />
                    )}

                    <path
                      d="M 0 -18 C 13 -18 15 -2 0 15 C -15 -2 -13 -18 0 -18 Z"
                      fill={pColor.main}
                      stroke="#ffffff"
                      strokeWidth={2.5}
                      filter="url(#tokenShadow)"
                    />
                    <circle cx={0} cy={-5} r={7} fill="#ffffff" />
                    <circle cx={0} cy={-5} r={4.5} fill={pColor.dark} />
                  </motion.g>
                </motion.g>
              );
            });
          });
        })()}
      </svg>

      {/* Interactive Dice mounted right in center of board */}
      <CenterDice
        currentRoll={gameState.currentRoll}
        hasRolled={gameState.hasRolled}
        isRolling={isRolling}
        disabled={gameState.turnPhase === 'game_over'}
        activeColor={activeColor.main}
        activePlayerName={activePlayer?.name || ''}
        isBot={activePlayer?.type === 'bot' || gameState.isAutoBotMode}
        onRoll={onRollDice}
      />
    </div>
  );
};

