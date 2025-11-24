import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { RoomState } from "@recruiting-bingo/shared";
import { PageShell } from "../components/layout/PageShell";
import { getRoom } from "../lib/api";

export function WinnerPage() {
  const { roomId, playerId } = useParams<{ roomId: string; playerId: string }>();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !playerId) {
      setError("Missing room or player information.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getRoom(roomId)
      .then((response) => {
        if (!cancelled) {
          setRoom(response.room);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("We couldn't load this game. It may have expired.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [roomId, playerId]);

  const player = useMemo(() => {
    if (!room || !playerId) return null;
    return room.players[playerId] ?? null;
  }, [room, playerId]);

  const winnerIndex = useMemo(() => {
    if (!room || !playerId) return -1;
    return room.winners.indexOf(playerId);
  }, [room, playerId]);

  const isWinner = winnerIndex >= 0;

  const renderCardGrid = () => {
    if (!room || !player) return null;
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Winning card</h3>
        <div className="mt-4 grid grid-cols-5 gap-2 text-center text-sm font-medium text-slate-700">
          {"BINGO".split("").map((letter) => (
            <div key={letter} className="rounded-lg bg-slate-800 py-3 text-lg font-bold text-white">
              {letter}
            </div>
          ))}
          {room.card.map((entry, index) => {
            const marked = player.marked[index];
            return (
              <div
                key={`${entry}-${index}`}
                className={`rounded-lg border px-2 py-4 transition ${
                  marked ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50"
                }`}
              >
                {entry}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <PageShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {isLoading ? (
          <p className="text-slate-500">Loading winner details…</p>
        ) : error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
        ) : !room ? (
          <p className="text-slate-500">No room data available.</p>
        ) : !player ? (
          <p className="text-slate-600">This player is not part of this game.</p>
        ) : (
          <>
            <header className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recruiting Bingo</p>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {room.roomName ? room.roomName : `Room ${room.roomId}`}
                </h1>
                {room.roomName ? (
                  <p className="text-xs text-slate-400">Room ID: {room.roomId}</p>
                ) : null}
              </div>
              <p className="text-lg text-slate-600">
                Winner: <span style={{ color: player.color }}>{player.name}</span>
              </p>
              {isWinner ? (
                <p className="text-sm font-semibold text-emerald-600">Winner #{winnerIndex + 1}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  This player has not been marked as a winner yet, but here's their card snapshot.
                </p>
              )}
              {room.endedAt ? (
                <p className="text-xs text-slate-400">Game ended at {new Date(room.endedAt).toLocaleString()}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Room created {new Date(room.createdAt).toLocaleString()}
                </p>
              )}
            </header>
            {renderCardGrid()}
          </>
        )}
      </div>
    </PageShell>
  );
}

export default WinnerPage;
