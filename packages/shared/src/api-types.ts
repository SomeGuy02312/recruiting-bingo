import type { RoomState } from "./state";

export interface CreateRoomRequest {
  creatorName: string;
  creatorColor: string;
  customEntries?: (string | null | undefined)[];
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
