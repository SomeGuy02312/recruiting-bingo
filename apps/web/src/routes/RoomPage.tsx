import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { RoomState } from "@recruiting-bingo/shared";
import { PageShell } from "../components/layout/PageShell";
import { getRoom, joinRoom, markCell, requestBingo } from "../lib/api";
import { useStoredPlayer } from "../hooks/useStoredPlayer";
import { useRoomPolling } from "../hooks/useRoomPolling";

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { player, setPlayer } = useStoredPlayer(roomId);
  const [initialRoom, setInitialRoom] = useState<RoomState | null>(null);
  const { room, setRoom, lastUpdated } = useRoomPolling(roomId, initialRoom);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinName, setJoinName] = useState("");
  const [joinColor, setJoinColor] = useState("#22c55e");
  const [isJoining, setIsJoining] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isKnownPlayer = useMemo(() => Boolean(player), [player]);

  useEffect(() => {
    if (!roomId) return;
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    getRoom(roomId)
      .then((response) => {
        if (!isCancelled) {
          setInitialRoom(response.room);
          setRoom(response.room);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load room");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [roomId]);

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId) return;

    const trimmed = joinName.trim();
    if (!trimmed) {
      setError("Please enter your name to join.");
      return;
    }

    setIsJoining(true);
    setError(null);
    try {
      const response = await joinRoom(roomId, {
        name: trimmed,
        color: joinColor,
        rejoin: false
      });

      setPlayer({
        playerId: response.playerId,
        name: trimmed,
        color: joinColor
      });
      setRoom(response.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  const currentPlayerState = player && room ? room.players[player.playerId] : null;

  const handleCellToggle = async (index: number) => {
    if (!roomId || !player || !currentPlayerState) return;
    const nextValue = !currentPlayerState.marked[index];
    try {
      const response = await markCell(roomId, {
        playerId: player.playerId,
        index,
        value: nextValue
      });
      setRoom(response.room);
      setFeedback(null);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to update cell");
    }
  };

  const handleBingo = async () => {
    if (!roomId || !player) return;
    try {
      const response = await requestBingo(roomId, { playerId: player.playerId });
      setRoom(response.room);
      if (response.winnerConfirmed) {
        setFeedback("Bingo confirmed!");
      } else {
        setFeedback("No bingo detected yet. Keep dabbin'.");
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Unable to submit bingo");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-slate-500">Loading room…</p>;
    }
    if (error) {
      return (
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-rose-700">
          <p>{error}</p>
        </div>
      );
    }
    if (!room) {
      return <p className="text-slate-500">This room could not be loaded. It may have expired.</p>;
    }

    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Recruiting Bingo</p>
          <h2 className="text-3xl font-semibold text-slate-900">Room {room.roomId}</h2>
          {player ? (
            <p className="text-sm text-slate-600">
              You are playing as <span className="font-semibold text-slate-900">{player.name}</span>
            </p>
          ) : null}
          {room.endedAt ? (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This game ended at {new Date(room.endedAt).toLocaleString()}.
            </div>
          ) : null}
          <p className="text-xs text-slate-400">
            Live sync: polling every few seconds{lastUpdated ? ` · Updated ${new Date(lastUpdated).toLocaleTimeString()}` : ""}
          </p>
          {feedback ? <p className="text-sm text-indigo-600">{feedback}</p> : null}
        </div>

        {!isKnownPlayer && (
          <form
            onSubmit={handleJoin}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-slate-900">Join this room</h3>
            <p className="text-sm text-slate-500">Pick your name and dab color to hop onto the shared board.</p>
            <div className="mt-4 flex flex-col gap-4">
              <label className="text-sm font-medium text-slate-700">
                Name
                <input
                  type="text"
                  value={joinName}
                  onChange={(event) => setJoinName(event.currentTarget.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Dab color
                <input
                  type="color"
                  value={joinColor}
                  onChange={(event) => setJoinColor(event.currentTarget.value)}
                  className="mt-2 h-12 w-20 cursor-pointer rounded border border-slate-300"
                />
              </label>
              <button
                type="submit"
                disabled={isJoining}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isJoining ? "Joining…" : "Join Room"}
              </button>
            </div>
          </form>
        )}
        {player ? (
          <button
            type="button"
            onClick={handleBingo}
            className="inline-flex w-fit items-center justify-center rounded-full bg-indigo-600 px-4 py-1.5 text-sm text-white shadow-sm transition hover:bg-indigo-500"
          >
            Call Bingo
          </button>
        ) : null}

        {room.players ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Players</h3>
            <ul className="mt-3 space-y-2">
              {Object.values(room.players).map((p) => (
                <li key={p.playerId} className="flex items-center gap-3 text-slate-700">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: p.color }}
                    aria-hidden
                  />
                  <span>{p.name}</span>
                  {p.isHost ? <span className="text-xs uppercase tracking-wide text-slate-400">Host</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {room.card ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Card preview</h3>
            <div className="mt-4 grid grid-cols-5 gap-2 text-center text-sm font-medium text-slate-700">
              {room.card.map((entry, index) => {
                const marked = currentPlayerState?.marked[index] ?? false;
                const isClickable = Boolean(player);
                return (
                  <button
                    key={entry + index}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => handleCellToggle(index)}
                    className={`rounded-lg border px-2 py-4 transition ${
                      marked
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    } ${!isClickable ? "cursor-not-allowed opacity-60" : "hover:border-indigo-300"}`}
                  >
                    {entry}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return <PageShell>{renderContent()}</PageShell>;
}
