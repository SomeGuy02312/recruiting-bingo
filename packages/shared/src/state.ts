export interface PlayerState {
  playerId: string;
  name: string;
  color: string;
  marked: boolean[];
  joinedAt: string;
  isHost: boolean;
}

export interface RoomSettings {
  stopAtFirstWinner: boolean;
}

export interface RoomState {
  roomId: string;
  roomName?: string | null;
  card: string[];
  createdAt: string;
  lastActivityAt: string;
  endedAt?: string | null;
  settings: RoomSettings;
  players: Record<string, PlayerState>;
  winners: string[];
}
