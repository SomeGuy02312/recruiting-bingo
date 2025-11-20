const BOARD_SIZE = 5;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

export type BingoLine = number[];

const buildLines = (): BingoLine[] => {
  const lines: BingoLine[] = [];

  // Rows
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const start = row * BOARD_SIZE;
    lines.push(Array.from({ length: BOARD_SIZE }, (_, col) => start + col));
  }

  // Columns
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    lines.push(Array.from({ length: BOARD_SIZE }, (_, row) => row * BOARD_SIZE + col));
  }

  // Diagonals
  lines.push(Array.from({ length: BOARD_SIZE }, (_, i) => i * (BOARD_SIZE + 1)));
  lines.push(Array.from({ length: BOARD_SIZE }, (_, i) => (i + 1) * (BOARD_SIZE - 1)));

  return lines;
};

export const ALL_BINGO_LINES: BingoLine[] = buildLines();

export function indexFromRowCol(row: number, col: number): number {
  if (!Number.isInteger(row) || !Number.isInteger(col)) {
    throw new Error("Row and column must be integers");
  }

  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    throw new Error(`Row/col out of range: row=${row}, col=${col}`);
  }

  return row * BOARD_SIZE + col;
}

export function rowColFromIndex(index: number): { row: number; col: number } {
  if (!Number.isInteger(index)) {
    throw new Error("Index must be an integer");
  }

  if (index < 0 || index >= CELL_COUNT) {
    throw new Error(`Index out of range: ${index}`);
  }

  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  return { row, col };
}

export function assertValidBoard(marked: boolean[]): void {
  if (marked.length !== CELL_COUNT) {
    throw new Error(`Expected ${CELL_COUNT} cells, received ${marked.length}`);
  }
}

export function getWinningLines(marked: boolean[]): BingoLine[] {
  assertValidBoard(marked);
  return ALL_BINGO_LINES.filter((line) => line.every((index) => marked[index]));
}

export function hasBingo(marked: boolean[]): boolean {
  return getWinningLines(marked).length > 0;
}
