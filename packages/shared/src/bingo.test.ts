import { describe, expect, it } from "vitest";
import {
  ALL_BINGO_LINES,
  assertValidBoard,
  getWinningLines,
  hasBingo,
  indexFromRowCol,
  rowColFromIndex
} from "./bingo";

const emptyBoard = () => Array(25).fill(false);

describe("bingo helpers", () => {
  it("converts row/col to index and back", () => {
    ALL_BINGO_LINES.flat().forEach((index) => {
      const { row, col } = rowColFromIndex(index);
      expect(indexFromRowCol(row, col)).toBe(index);
    });
  });

  it("detects empty board as no bingo", () => {
    const board = emptyBoard();
    expect(hasBingo(board)).toBe(false);
    expect(getWinningLines(board)).toEqual([]);
  });

  it("detects a winning row", () => {
    const board = emptyBoard();
    for (let col = 0; col < 5; col += 1) {
      board[indexFromRowCol(0, col)] = true;
    }
    const winning = getWinningLines(board);
    expect(winning).toHaveLength(1);
    expect(winning[0]).toEqual([0, 1, 2, 3, 4]);
    expect(hasBingo(board)).toBe(true);
  });

  it("detects a winning column", () => {
    const board = emptyBoard();
    for (let row = 0; row < 5; row += 1) {
      board[indexFromRowCol(row, 2)] = true;
    }
    const winning = getWinningLines(board);
    expect(winning).toHaveLength(1);
    expect(winning[0]).toEqual([2, 7, 12, 17, 22]);
  });

  it("detects both diagonals", () => {
    const board = emptyBoard();
    // main diagonal
    for (let i = 0; i < 5; i += 1) {
      board[indexFromRowCol(i, i)] = true;
    }
    // secondary diagonal
    for (let i = 0; i < 5; i += 1) {
      board[indexFromRowCol(i, 4 - i)] = true;
    }
    const winning = getWinningLines(board);
    expect(winning).toEqual([
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20]
    ]);
  });

  it("returns multiple lines when present", () => {
    const board = emptyBoard();
    const indices = [0, 1, 2, 3, 4, 5, 10, 15, 20];
    indices.forEach((i) => {
      board[i] = true;
    });
    const winning = getWinningLines(board);
    expect(winning).toEqual([
      [0, 1, 2, 3, 4],
      [0, 5, 10, 15, 20]
    ]);
  });

  it("throws for invalid board sizes", () => {
    expect(() => assertValidBoard([])).toThrow();
    expect(() => getWinningLines(new Array(10).fill(false))).toThrow();
    expect(() => hasBingo(new Array(0).fill(false))).toThrow();
  });
});
