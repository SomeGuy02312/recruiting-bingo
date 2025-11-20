import type { RoomState } from "./state";

export type ClientMessage =
  | {
      type: "MARK_CELL";
      playerId: string;
      index: number;
      value: boolean;
    }
  | {
      type: "REQUEST_BINGO";
      playerId: string;
    }
  | {
      type: "PING";
      playerId: string;
    };

export type ServerMessage =
  | {
      type: "STATE_UPDATE";
      state: RoomState;
    }
  | {
      type: "PLAYER_JOINED";
      playerId: string;
      state: RoomState;
    }
  | {
      type: "PLAYER_LEFT";
      playerId: string;
      state: RoomState;
    }
  | {
      type: "BINGO_CONFIRMED";
      playerId: string;
      winnerIndex: number;
      state: RoomState;
    }
  | {
      type: "GAME_ENDED";
      endedAt: string | number;
      state: RoomState;
    }
  | {
      type: "ERROR";
      message: string;
    };
