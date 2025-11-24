import { useEffect, useState } from "react";
import type { RoomState } from "@recruiting-bingo/shared";
import { getRoom } from "../lib/api";

export function useRoomPolling(roomId: string | undefined, initialRoom: RoomState | null) {
  const [room, setRoom] = useState<RoomState | null>(initialRoom);
  const [lastUpdated, setLastUpdated] = useState<number | null>(initialRoom ? Date.now() : null);

  useEffect(() => {
    if (initialRoom) {
      setRoom(initialRoom);
      setLastUpdated(Date.now());
    }
  }, [initialRoom]);

  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(() => {
      getRoom(roomId)
        .then((response) => {
          setRoom(response.room);
          setLastUpdated(Date.now());
        })
        .catch((error) => {
          console.warn("Room polling failed", error);
        });
    }, 1500);

    return () => clearInterval(interval);
  }, [roomId]);

  return { room, setRoom, lastUpdated } as const;
}
