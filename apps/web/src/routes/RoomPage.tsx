import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { hasBingo, type RoomState } from "@recruiting-bingo/shared";
import { PageShell } from "../components/layout/PageShell";
import { BingoCard } from "../components/BingoCard";
import { ColorSwatchPicker } from "../components/ColorSwatchPicker";
import { useThemeMode } from "../theme/theme-context";
import { triggerBingoFireworks } from "../effects/fireworks";
import { getRoom, joinRoom, markCell, requestBingo } from "../lib/api";
import { useStoredPlayer } from "../hooks/useStoredPlayer";
import { useRoomPolling } from "../hooks/useRoomPolling";

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
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
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [lastWinnersCount, setLastWinnersCount] = useState(0);
  const [celebrationWinner, setCelebrationWinner] = useState<{ playerName: string; winnerIndex: number } | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);
  const hasInitializedWinners = useRef(false);
  const localWinFireworksKeyRef = useRef<string | null>(null);

  const isKnownPlayer = useMemo(() => Boolean(player), [player]);
  const winnerIndexFromRoom = useMemo(() => {
    if (!player?.playerId || !room) {
      return -1;
    }
    return room.winners.indexOf(player.playerId);
  }, [player?.playerId, room]);

  const derivedWinnerIndex =
    bingoWinnerIndex != null ? bingoWinnerIndex : winnerIndexFromRoom >= 0 ? winnerIndexFromRoom : null;
  const shouldShowWinnerBanner = Boolean((bingoStatus === "success" || winnerIndexFromRoom >= 0) && player && room);

  useEffect(() => {
    if (!isKnownPlayer) {
      setShowJoinModal(true);
    } else {
      setShowJoinModal(false);
    }
  }, [isKnownPlayer]);

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

  useEffect(() => {
    localWinFireworksKeyRef.current = null;
  }, [roomId, player?.playerId]);

  useEffect(() => {
    hasInitializedWinners.current = false;
    setLastWinnersCount(0);
    setCelebrationWinner(null);
  }, [roomId]);

  const currentPlayer = player?.playerId && room ? room.players[player.playerId] : null;
  const isGameOver = Boolean(room?.endedAt) || Boolean(room?.settings.stopAtFirstWinner && room?.winners.length);
  const canInteract = Boolean(currentPlayer && !isGameOver);
  const fallbackMarked = useMemo(() => Array(25).fill(false), []);
  const inviteUrl = useMemo(() => {
    if (!roomId || typeof window === "undefined") return "";
    const origin = window.location.origin.replace(/\/$/, "");
    return `${origin}/r/${roomId}`;
  }, [roomId]);

  const sidebarCardClass = isDark
    ? "rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-md"
    : "rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm";
  const infoPanelClass = sidebarCardClass;
  const inputClass = isDark
    ? "mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-base text-slate-100 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
    : "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40";
  const mutedTextClass = isDark ? "text-xs text-slate-400" : "text-xs text-slate-500";
  const leaderboardItemClass = isDark
    ? "flex items-center justify-between rounded-xl px-3 py-2 text-slate-100 transition hover:bg-slate-800/80"
    : "flex items-center justify-between rounded-xl px-3 py-2 text-slate-700 transition hover:bg-slate-100";
  const messageTextClass = isDark ? "text-slate-400" : "text-slate-500";
  const errorCardClass = isDark
    ? "rounded-lg border border-rose-500/60 bg-rose-900/40 p-4 text-rose-100"
    : "rounded-lg border border-rose-100 bg-rose-50 p-4 text-rose-700";
  const feedbackPanelClass = isDark
    ? "rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-md text-sm text-slate-100"
    : "rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-700 shadow-sm";
  const overlayClass = isDark
    ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm"
    : "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8 backdrop-blur-sm";
  const modalPanelClass = isDark
    ? "w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 px-6 py-5 text-slate-100 shadow-2xl"
    : "w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-900 shadow-2xl";
  const modalBodyTextClass = isDark ? "mt-2 text-sm text-slate-300" : "mt-2 text-sm text-slate-600";
  const primaryButtonClass =
    "inline-flex flex-1 items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400";
  const secondaryButtonClass = isDark
    ? "inline-flex flex-1 items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
    : "inline-flex flex-1 items-center justify-center rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-300";

  const handleCopyInvite = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedInvite(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy invite URL", error);
      setCopiedInvite(false);
    }
  }, [inviteUrl]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    if (!room) return;
    const winners = room.winners ?? [];
    const winnersCount = winners.length;

    if (!hasInitializedWinners.current) {
      setLastWinnersCount(winnersCount);
      hasInitializedWinners.current = true;
      return;
    }

    if (winnersCount > lastWinnersCount) {
      const latestWinnerId = winners[winnersCount - 1];
      const latestWinner = room.players[latestWinnerId];
      if (latestWinner) {
        const latestWinnerIsCurrent = latestWinnerId === player?.playerId;
        if (!latestWinnerIsCurrent) {
          setCelebrationWinner({ playerName: latestWinner.name, winnerIndex: winnersCount });
          triggerBingoFireworks();
        } else {
          setCelebrationWinner(null);
        }
      }
      setLastWinnersCount(winnersCount);
    } else if (winnersCount < lastWinnersCount) {
      setLastWinnersCount(winnersCount);
    }
  }, [room, lastWinnersCount, player?.playerId]);

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
      setShowJoinModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCellToggle = async (index: number) => {
    if (!roomId || !currentPlayer || !canInteract) return;
    const nextValue = !currentPlayer.marked[index];
    try {
      const response = await markCell(roomId, {
        playerId: currentPlayer.playerId,
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
        const localWinKey = `${response.room.roomId}:${player.playerId}:${
          typeof response.winnerIndex === "number" && response.winnerIndex >= 0
            ? response.winnerIndex
            : response.room.winners.length
        }`;
        if (localWinFireworksKeyRef.current !== localWinKey) {
          triggerBingoFireworks();
          localWinFireworksKeyRef.current = localWinKey;
        }
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
        return null;
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
      return <p className={messageTextClass}>Loading room…</p>;
    }
    if (error) {
      return (
        <div className={`${errorCardClass} space-y-3`}>
          <p>{error}</p>
          <Link to="/" className="text-sm font-semibold text-sky-600 underline-offset-4 hover:underline">
            Go back home
          </Link>
        </div>
      );
    }
    if (!room) {
      return (
        <div className="space-y-3">
          <p className={messageTextClass}>This room could not be loaded. It may have expired.</p>
          <Link to="/" className="text-sm font-semibold text-sky-600 underline-offset-4 hover:underline">
            Create a new game
          </Link>
        </div>
      );
    }

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row md:items-start">
        <div className="flex flex-1 justify-center md:justify-start">
          <div className="flex w-full max-w-2xl flex-col gap-4">
          {shouldShowWinnerBanner && player && room ? (
            <div className="rounded-2xl bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 px-4 py-3 text-slate-50 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
                <span>
                  🎉 BINGO! You&apos;re
                  {derivedWinnerIndex != null ? ` winner #${derivedWinnerIndex + 1}` : " a confirmed winner"}.
                </span>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/w/${room.roomId}/${player.playerId}`, {
                      state: { fromGame: true },
                    })
                  }
                  className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow hover:bg-slate-100"
                >
                  View winner page
                </button>
              </div>
            </div>
          ) : null}

          {!isKnownPlayer && !showJoinModal ? (
            <div className="rounded-full border border-slate-300/60 bg-white/70 px-4 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200">
              <button type="button" onClick={() => setShowJoinModal(true)} className="w-full">
                Join this room
              </button>
            </div>
          ) : null}

          {room.card ? (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                {room.endedAt ? <span className={mutedTextClass}>Ended {new Date(room.endedAt).toLocaleString()}</span> : null}
              </div>
              {feedback ? (
                <p className={isDark ? "text-xs text-rose-300" : "text-xs text-rose-500"}>{feedback}</p>
              ) : null}
              <BingoCard
                card={room.card}
                marked={currentPlayer?.marked ?? fallbackMarked}
                playerColor={currentPlayer?.color ?? player?.color}
                interactive={canInteract}
                onToggleCell={canInteract ? handleCellToggle : undefined}
              />
              {currentPlayerHadBingo && alreadyPromptedForBingo && !showBingoModal && canInteract ? (
                <button
                  type="button"
                  onClick={() => setShowBingoModal(true)}
                  className={isDark ? "text-xs font-semibold text-sky-300 underline-offset-4 hover:underline" : "text-xs font-semibold text-sky-600 underline-offset-4 hover:underline"}
                >
                  Ready to call bingo?
                </button>
              ) : null}
              {isGameOver ? <p className={mutedTextClass}>This game is now read-only.</p> : null}
            </div>
          ) : null}

          {bingoFeedback ? (
            <p
              className={`${feedbackPanelClass} ${
                bingoStatus === "success"
                  ? isDark
                    ? "text-emerald-300"
                    : "text-emerald-600"
                  : bingoStatus === "failed-no-bingo"
                  ? isDark
                    ? "text-slate-300"
                    : "text-slate-600"
                  : bingoStatus === "checking"
                  ? "text-slate-500"
                  : isDark
                  ? "text-rose-300"
                  : "text-rose-500"
              }`}
            >
              {bingoFeedback}
            </p>
          ) : null}
          </div>
        </div>

        <aside className="flex w-full flex-shrink-0 flex-col gap-4 md:w-80">
          {inviteUrl && (!room.settings.stopAtFirstWinner || !room.endedAt) ? (
            <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">Share this room</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Send this link to invite teammates into your game.</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-white/80 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {inviteUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-sky-400"
                >
                  Copy
                </button>
              </div>
              {copiedInvite ? <p className="mt-1 text-[11px] text-emerald-500">Link copied!</p> : null}
            </div>
          ) : inviteUrl && room.settings.stopAtFirstWinner && room.endedAt ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Game finished</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">This room ended after the first winner. Want to start another round?</p>
              <Link
                to="/"
                className="mt-3 inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Create a new game
              </Link>
            </div>
          ) : null}

          <div className={infoPanelClass}>
            <h2 className={isDark ? "text-sm font-semibold text-slate-50" : "text-sm font-semibold text-slate-900"}>
              {room.roomName ? room.roomName : `Room ${room.roomId}`}
            </h2>
            <p className={isDark ? "mt-0.5 text-[11px] text-slate-400" : "mt-0.5 text-[11px] text-slate-500"}>Room ID: {room.roomId}</p>
            <p className={isDark ? "mt-1 text-xs text-slate-300" : "mt-1 text-xs text-slate-600"}>
              {room.settings.stopAtFirstWinner
                ? "Ends when the first winner is confirmed"
                : "Keeps going after the first winner"}
            </p>
            {player ? (
              <p className={isDark ? "mt-2 text-sm text-slate-200" : "mt-2 text-sm text-slate-700"}>
                You&apos;re playing as <span className="font-semibold">{player.name}</span>
              </p>
            ) : null}
            {room.endedAt ? (
              <p className={isDark ? "mt-1 text-[10px] text-slate-500" : "mt-1 text-[10px] text-slate-400"}>
                Game ended at {new Date(room.endedAt).toLocaleString()}
              </p>
            ) : (
              <p className={isDark ? "mt-1 text-[10px] text-slate-500" : "mt-1 text-[10px] text-slate-400"}>
                Live sync: polling every few seconds
                {lastUpdated ? ` · Updated ${new Date(lastUpdated).toLocaleTimeString()}` : ""}
              </p>
            )}

            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700" />
            <h3 className={isDark ? "text-xs font-semibold uppercase tracking-[0.25em] text-slate-400" : "text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"}>
              Leaderboard
            </h3>
            {leaderboard.length ? (
              <ul className="mt-2 space-y-2 text-sm">
                {leaderboard.map((entry) => {
                  const isCurrent = entry.playerId === player?.playerId;
                  const itemClass = isCurrent
                    ? `${leaderboardItemClass} ${isDark ? "bg-slate-800/70 text-sky-300" : "bg-slate-100 text-sky-600"}`
                    : leaderboardItemClass;
                  return (
                    <li key={entry.playerId} className={itemClass}>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                          aria-hidden
                        />
                        <span className="font-medium">{entry.name}</span>
                        {entry.winnerIndex >= 0 ? (
                          <span
                            className={
                              isDark
                                ? "rounded-full bg-amber-400/90 px-2 py-0.5 text-xs font-semibold text-slate-900"
                                : "rounded-full bg-amber-300 px-2 py-0.5 text-xs font-semibold text-slate-900"
                            }
                          >
                            Winner #{entry.winnerIndex + 1}
                          </span>
                        ) : null}
                      </div>
                      <span className={isDark ? "text-xs font-semibold text-slate-400" : "text-xs font-semibold text-slate-500"}>
                        {entry.markedCount}/25
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={isDark ? "mt-2 text-sm text-slate-400" : "mt-2 text-sm text-slate-600"}>No players yet.</p>
            )}
          </div>
        </aside>
      </div>
    );
  };
  return (
    <>
      {celebrationWinner ? (
        <div className={overlayClass}>
          <div className={modalPanelClass}>
            <h2 className={isDark ? "text-lg font-semibold text-slate-50" : "text-lg font-semibold text-slate-900"}>🎉 Bingo!</h2>
            <p className={`${modalBodyTextClass} mt-2`}>
              {celebrationWinner.playerName} just got bingo and is winner #{celebrationWinner.winnerIndex}.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setCelebrationWinner(null);
                }}
                className="rounded-full bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Nice! 🎉
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <PageShell>{renderContent()}</PageShell>
      {!isKnownPlayer && showJoinModal ? (
        <div className={overlayClass}>
          <div className={modalPanelClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className={isDark ? "text-xl font-semibold text-slate-50" : "text-xl font-semibold text-slate-900"}>Join this room</h2>
                <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-600"}>Pick your name and color to hop onto the shared board.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="rounded-full border border-slate-300/60 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Close join dialog"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleJoin} className="mt-4 flex flex-col gap-4">
              <label className={isDark ? "text-sm font-medium text-slate-200" : "text-sm font-medium text-slate-700"}>
                Name
                <input
                  type="text"
                  value={joinName}
                  onChange={(event) => setJoinName(event.currentTarget.value)}
                  className={inputClass}
                />
              </label>
              <ColorSwatchPicker value={joinColor} onChange={setJoinColor} label="Your color" />
              <button
                type="submit"
                disabled={isJoining}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isJoining ? "Joining…" : "Join Room"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
      {showBingoModal && canInteract && (
        <div className={overlayClass}>
          <div className={modalPanelClass}>
            <h2 className={isDark ? "text-2xl font-semibold text-slate-50" : "text-2xl font-semibold text-slate-900"}>BINGO!</h2>
            <p className={modalBodyTextClass}>Do you want to call bingo now, or go back and make changes?</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button type="button" onClick={handleModalCallBingo} className={primaryButtonClass}>
                Call Bingo
              </button>
              <button type="button" onClick={handleModalKeepPlaying} className={secondaryButtonClass}>
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
