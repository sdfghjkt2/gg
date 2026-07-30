export interface Point {
  x: number;
  y: number;
}

/**
 * 4P Board grid mapping: 15x15 grid, viewBox 600x600, cell size = 40px
 */
export const GRID_SIZE_4P = 15;
export const CELL_SIZE_4P = 40; // 600 / 15

// Standard 52-cell main track coordinates (col, row)
export const MAIN_TRACK_4P_GRID: Point[] = [
  // Red side (col 0..5, row 6..8)
  { x: 1, y: 6 }, // 0: Red Start
  { x: 2, y: 6 }, // 1
  { x: 3, y: 6 }, // 2
  { x: 4, y: 6 }, // 3
  { x: 5, y: 6 }, // 4
  { x: 6, y: 5 }, // 5
  { x: 6, y: 4 }, // 6
  { x: 6, y: 3 }, // 7
  { x: 6, y: 2 }, // 8: Green star
  { x: 6, y: 1 }, // 9
  { x: 6, y: 0 }, // 10
  { x: 7, y: 0 }, // 11
  { x: 8, y: 0 }, // 12
  { x: 8, y: 1 }, // 13: Green Start
  { x: 8, y: 2 }, // 14
  { x: 8, y: 3 }, // 15
  { x: 8, y: 4 }, // 16
  { x: 8, y: 5 }, // 17
  { x: 9, y: 6 }, // 18
  { x: 10, y: 6 }, // 19
  { x: 11, y: 6 }, // 20
  { x: 12, y: 6 }, // 21: Yellow star
  { x: 13, y: 6 }, // 22
  { x: 14, y: 6 }, // 23
  { x: 14, y: 7 }, // 24
  { x: 14, y: 8 }, // 25
  { x: 13, y: 8 }, // 26: Yellow Start
  { x: 12, y: 8 }, // 27
  { x: 11, y: 8 }, // 28
  { x: 10, y: 8 }, // 29
  { x: 9, y: 8 }, // 30
  { x: 8, y: 9 }, // 31
  { x: 8, y: 10 }, // 32
  { x: 8, y: 11 }, // 33
  { x: 8, y: 12 }, // 34: Blue star
  { x: 8, y: 13 }, // 35
  { x: 8, y: 14 }, // 36
  { x: 7, y: 14 }, // 37
  { x: 6, y: 14 }, // 38
  { x: 6, y: 13 }, // 39: Blue Start
  { x: 6, y: 12 }, // 40
  { x: 6, y: 11 }, // 41
  { x: 6, y: 10 }, // 42
  { x: 6, y: 9 }, // 43
  { x: 5, y: 8 }, // 44
  { x: 4, y: 8 }, // 45
  { x: 3, y: 8 }, // 46
  { x: 2, y: 8 }, // 47: Red star
  { x: 1, y: 8 }, // 48
  { x: 0, y: 8 }, // 49
  { x: 0, y: 7 }, // 50
  { x: 0, y: 6 }, // 51
];

// Yard token positions (4 slots each corner) in 600x600 viewBox
export const YARD_POSITIONS_4P: Record<number, Point[]> = {
  0: [{ x: 80, y: 80 }, { x: 160, y: 80 }, { x: 80, y: 160 }, { x: 160, y: 160 }],     // Red (Top-Left)
  1: [{ x: 440, y: 80 }, { x: 520, y: 80 }, { x: 440, y: 160 }, { x: 520, y: 160 }],   // Green (Top-Right)
  2: [{ x: 440, y: 440 }, { x: 520, y: 440 }, { x: 440, y: 520 }, { x: 520, y: 520 }], // Yellow (Bottom-Right)
  3: [{ x: 80, y: 440 }, { x: 160, y: 440 }, { x: 80, y: 520 }, { x: 160, y: 520 }],   // Blue (Bottom-Left)
};

// Home stretch grids for 4P (5 steps each)
export const HOME_STRETCH_4P_GRID: Record<number, Point[]> = {
  0: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }], // Red
  1: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }], // Green
  2: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }], // Yellow
  3: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }], // Blue
};

// Home finish center triangles
export const HOME_FINISH_4P: Record<number, Point> = {
  0: { x: 260, y: 300 },
  1: { x: 300, y: 260 },
  2: { x: 340, y: 300 },
  3: { x: 300, y: 340 },
};

export function get4PTokenCenter(playerIndex: number, step: number, tokenId: number = 0): Point {
  if (step === -1) {
    const slots = YARD_POSITIONS_4P[playerIndex];
    return slots[tokenId % slots.length] || slots[0];
  }
  if (step >= 56) {
    return HOME_FINISH_4P[playerIndex];
  }
  if (step >= 51) {
    const stretchIdx = step - 51;
    const gridPt = HOME_STRETCH_4P_GRID[playerIndex][stretchIdx];
    return {
      x: gridPt.x * CELL_SIZE_4P + CELL_SIZE_4P / 2,
      y: gridPt.y * CELL_SIZE_4P + CELL_SIZE_4P / 2,
    };
  }
  const offsets = [0, 13, 26, 39];
  const globalIdx = (offsets[playerIndex] + step) % 52;
  const gridPt = MAIN_TRACK_4P_GRID[globalIdx];
  return {
    x: gridPt.x * CELL_SIZE_4P + CELL_SIZE_4P / 2,
    y: gridPt.y * CELL_SIZE_4P + CELL_SIZE_4P / 2,
  };
}




