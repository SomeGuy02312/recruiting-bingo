const PREFIX = "recruiting-bingo:player";

const storage = typeof window !== "undefined" ? window.localStorage : undefined;

export interface StoredPlayer {
  playerId: string;
  name: string;
  color: string;
}

export function savePlayer(roomId: string, player: StoredPlayer) {
  if (!storage) return;
  storage.setItem(`${PREFIX}:${roomId}`, JSON.stringify(player));
}

export function getPlayer(roomId: string): StoredPlayer | null {
  if (!storage) return null;
  const raw = storage.getItem(`${PREFIX}:${roomId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPlayer;
  } catch {
    return null;
  }
}
