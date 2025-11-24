import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { hasBingo, type RoomState } from "@recruiting-bingo/shared";
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
  const [bingoStatus, setBingoStatus] = useState<
    "idle" | "checking" | "success" | "failed-no-bingo" | "error"
  >("idle");
  const [bingoWinnerIndex, setBingoWinnerIndex] = useState<number | null>(null);
  const [showBingoModal, setShowBingoModal] = useState(false);
  const [alreadyPromptedForBingo, setAlreadyPromptedForBingo] = useState(false);
  const [currentPlayerHadBingo, setCurrentPlayerHadBingo] = useState(false);

  const isKnownPlayer = useMemo(() => Boolean(player), [player]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getRoom(roomId)
      .then((response) => {
        if (!cancelled) {
          setInitialRoom(response.room);
          setRoom(response.room);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load room");
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
  }, [roomId]);

  useEffect(() => {
    setAlreadyPromptedForBingo(false);
    setShowBingoModal(false);
    setCurrentPlayerHadBingo(false);
  }, [player?.playerId, roomId]);

  const currentPlayerState = player && room ? room.players[player.playerId] : null;
  const isGameOver = Boolean(room?.endedAt) || Boolean(room?.settings.stopAtFirstWinner && room?.winners.length);
  const canInteract = Boolean(player && !isGameOver);

  useEffect(() => {
    if (!player?.playerId || !room) {
      setCurrentPlayerHadBingo(false);
      setShowBingoModal(false);
      return;
    }
    const current = room.players[player.playerId];
    if (!current || isGameOver) {
      setCurrentPlayerHadBingo(false);
      setShowBingoModal(false);
      return;
    }
    const nowHasBingo = hasBingo(current.marked);
    if (nowHasBingo && !currentPlayerHadBingo && !alreadyPromptedForBingo) {
      setShowBingoModal(true);
      setAlreadyPromptedForBingo(true);
    } else if (!nowHasBingo && currentPlayerHadBingo) {
      setAlreadyPromptedForBingo(false);
      setShowBingoModal(false);
    }
    setCurrentPlayerHadBingo(nowHasBingo);
  }, [room, player?.playerId, currentPlayerHadBingo, alreadyPromptedForBingo, isGameOver]);

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

  const handleCellToggle = async (index: number) => {
    if (!roomId || !player || !currentPlayerState || !canInteract) return;
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
    if (!roomId || !player || !canInteract) return;
    setBingoStatus("checking");
    setBingoWinnerIndex(null);
    try {
      const response = await requestBingo(roomId, { playerId: player.playerId });
      setRoom(response.room);
      if (response.winnerConfirmed) {
        setBingoStatus("success");
        setBingoWinnerIndex(
          typeof response.winnerIndex === "number" && response.winnerIndex >= 0 ? response.winnerIndex : null
        );
      } else {
        setBingoStatus("failed-no-bingo");
      }
    } catch (err) {
      setBingoStatus("error");
      setFeedback(err instanceof Error ? err.message : "Unable to submit bingo");
    }
  };

  const handleModalCallBingo = () => {
    setShowBingoModal(false);
    handleBingo();
  };

  const handleModalKeepPlaying = () => {
    setShowBingoModal(false);
  };

  const leaderboard = useMemo(() => {
    if (!room) return [];
    return Object.values(room.players)
      .map((p) => ({
        ...p,
        markedCount: p.marked.filter(Boolean).length,
        winnerIndex: room.winners.indexOf(p.playerId)
      }))
      .sort((a, b) => {
        if (b.markedCount !== a.markedCount) {
          return b.markedCount - a.markedCount;
        }
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      });
  }, [room]);

  const bingoFeedback = (() => {
    switch (bingoStatus) {
      case "success":
        return bingoWinnerIndex != null ? `BINGO! You're winner #${bingoWinnerIndex + 1}.` : "BINGO!";
      case "failed-no-bingo":
        return "Not a valid bingo yet.";
      case "error":
        return "Something went wrong calling bingo.";
      case "checking":
        return "Checking your board…";
      default:
        return null;
    }
  })();

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
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Recruiting Bingo</p>
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              {room.roomName ? room.roomName : `Room ${room.roomId}`}
            </h2>
            {room.roomName ? (
              <p className="text-xs text-slate-400">Room ID: {room.roomId}</p>
            ) : null}
          </div>
          {player ? (
            <p className="text-sm text-slate-600">
              You are playing as <span className="font-semibold text-slate-900">{player.name}</span>
            </p>
          ) : null}
          {room.endedAt ? (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {room.settings.stopAtFirstWinner
                ? `This game ended when the first winner was confirmed (${new Date(room.endedAt).toLocaleString()}).`
                : `This game has ended (${new Date(room.endedAt).toLocaleString()}).`}
            </div>
          ) : null}
          <p className="text-xs text-slate-400">
            Live sync: polling every few seconds{lastUpdated ? ` · Updated ${new Date(lastUpdated).toLocaleTimeString()}` : ""}
          </p>
          {feedback ? <p className="text-sm text-rose-600">{feedback}</p> : null}
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {bingoFeedback && (
              <p
                className={`rounded-2xl border border-slate-200 bg-white p-4 text-sm ${
                  bingoStatus === "success"
                    ? "text-emerald-600"
                    : bingoStatus === "failed-no-bingo"
                    ? "text-slate-600"
                    : bingoStatus === "checking"
                    ? "text-slate-500"
                    : "text-rose-600"
                }`}
              >
                {bingoFeedback}
              </p>
            )}

            {room.card ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Your card</h3>
                <div className="mt-4 grid grid-cols-5 gap-2 text-center text-sm font-medium text-slate-700">
                  {"BINGO".split("").map((letter) => (
                    <div key={letter} className="rounded-lg bg-slate-800 py-3 text-lg font-bold text-white">
                      {letter}
                    </div>
                  ))}
                  {room.card.map((entry, index) => {
                    const marked = currentPlayerState?.marked[index] ?? false;
                    return (
                      <button
                        key={entry + index}
                        type="button"
                        disabled={!canInteract}
                        onClick={() => handleCellToggle(index)}
                        className={`rounded-lg border px-2 py-4 transition text-xs sm:text-sm ${
                          marked
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        } ${
                          !canInteract ? "cursor-not-allowed opacity-60" : "hover:border-indigo-300"
                        }`}
                      >
                        {entry}
                      </button>
                    );
                  })}
                </div>
                {currentPlayerHadBingo && alreadyPromptedForBingo && !showBingoModal && canInteract ? (
                  <button
                    type="button"
                    onClick={() => setShowBingoModal(true)}
                    className="mt-4 text-xs font-semibold text-indigo-600 underline-offset-4 hover:underline"
                  >
                    Ready to call bingo?
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className="flex flex-col gap-6">
            {leaderboard.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Leaderboard</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {leaderboard.map((entry) => {
                    const isCurrent = entry.playerId === player?.playerId;
                    return (
                      <li
                        key={entry.playerId}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                          isCurrent ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                            aria-hidden
                          />
                          <span className="font-medium">{entry.name}</span>
                          {entry.winnerIndex >= 0 ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              Winner #{entry.winnerIndex + 1}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{entry.markedCount}/25</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageShell>{renderContent()}</PageShell>
      {showBingoModal && canInteract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-slate-900">You&apos;ve got bingo!</h2>
            <p className="mt-2 text-sm text-slate-600">
              Do you want to call bingo now, or keep playing to see if you can grab another line?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={handleModalCallBingo}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                Call Bingo
              </button>
              <button
                type="button"
                onClick={handleModalKeepPlaying}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Keep playing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
