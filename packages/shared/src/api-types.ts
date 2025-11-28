import type { RoomState } from "./state";

export interface CreateRoomRequest {
  creatorName: string;
  creatorColor: string;
  roomName?: string;
  customEntries?: (string | null | undefined)[];
  customSquares?: string[];
  stopAtFirstWinner?: boolean;
}

export interface CreateRoomResponse {
  room: RoomState;
  playerId: string;
}

export interface JoinRoomRequest {
  name: string;
  color: string;
  rejoin?: boolean;
}

export interface JoinRoomResponse {
  room: RoomState;
  playerId: string;
}

export interface GetRoomResponse {
  room: RoomState;
}

export interface MarkCellRequest {
  playerId: string;
  index: number;
  value: boolean;
}

export interface MarkCellResponse {
  room: RoomState;
}

export interface RequestBingoRequest {
  playerId: string;
}

export interface RequestBingoResponse {
  room: RoomState;
  winnerConfirmed: boolean;
  winnerIndex?: number;
}
