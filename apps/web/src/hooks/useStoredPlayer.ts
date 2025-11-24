import { useCallback, useEffect, useState } from "react";
import { getPlayer, savePlayer, type StoredPlayer } from "../lib/storage";

export function useStoredPlayer(roomId?: string) {
  const [player, setPlayerState] = useState<StoredPlayer | null>(null);

  useEffect(() => {
    if (!roomId) return;
    setPlayerState(getPlayer(roomId));
  }, [roomId]);

  const setPlayer = useCallback(
    (next: StoredPlayer) => {
      if (!roomId) return;
      savePlayer(roomId, next);
      setPlayerState(next);
    },
    [roomId]
  );

  return { player, setPlayer };
}
