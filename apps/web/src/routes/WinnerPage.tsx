import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { RoomState } from "@recruiting-bingo/shared";
import { PageShell } from "../components/layout/PageShell";
import { useThemeMode } from "../theme/theme-context";
import { BingoCard } from "../components/BingoCard";
import { getRoom } from "../lib/api";
import html2canvas from "html2canvas";
import { getRandomCertificateSummary } from "../utils/certificateCopy";
import { Download } from "lucide-react";
import { WinnerCertificate } from "../components/WinnerCertificate";

function formatDuration(ms: number) {
  if (Number.isNaN(ms) || ms <= 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

function formatDateWithOrdinal(date: Date) {
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  const suffix = (() => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  })();
  return `${month} ${day}${suffix}, ${year}`;
}

export function WinnerPage() {
  const { roomId, playerId } = useParams<{ roomId: string; playerId: string }>();
  const location = useLocation();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const [room, setRoom] = useState<RoomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);

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
  const currentWinnerPageUrl = typeof window !== "undefined" ? window.location.href : "https://bingo.hiregear.us";
  const baseLinkedInShareUrl = "https://www.linkedin.com/sharing/share-offsite/?url=";
  const winnerShareUrl = (() => {
    try {
      const url = new URL(currentWinnerPageUrl);
      url.searchParams.set("utm_source", "recruiting-bingo");
      url.searchParams.set("utm_medium", "winner-share");
      return url.toString();
    } catch (err) {
      console.error("Unable to construct winner share URL", err);
      return "https://bingo.hiregear.us/?utm_source=recruiting-bingo&utm_medium=winner-share";
    }
  })();
  const linkedInShareUrl = `${baseLinkedInShareUrl}${encodeURIComponent(winnerShareUrl)}`;
  const fromGameFlow = Boolean((location.state as { fromGame?: boolean } | null)?.fromGame);
  const canShare = Boolean(isWinner && player && room && fromGameFlow);
  const leaderboardCardClass = [
    "rounded-3xl p-3 text-left shadow-lg",
    isDark ? "border border-slate-700 bg-slate-900/70 text-slate-100" : "border border-slate-200 bg-white text-slate-900",
  ].join(" ");
  const leaderboardHeaderClass = isDark ? "text-lg font-semibold text-slate-100" : "text-lg font-semibold text-slate-900";
  const [copiedShare, setCopiedShare] = useState(false);
  const messageTextClass = isDark ? "text-slate-400" : "text-slate-500";

  const leaderboard = useMemo(() => {
    if (!room) return [];
    return Object.values(room.players)
      .map((p) => ({
        ...p,
        winnerIndex: room.winners.indexOf(p.playerId),
      }))
      .sort((a, b) => {
        if (a.winnerIndex >= 0 && b.winnerIndex >= 0) {
          return a.winnerIndex - b.winnerIndex;
        }
        if (a.winnerIndex >= 0) return -1;
        if (b.winnerIndex >= 0) return 1;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      });
  }, [room]);

  const createdAt = room?.createdAt ? new Date(room.createdAt) : null;
  const endedAt = room?.endedAt ? new Date(room.endedAt) : null;
  const completionDate = endedAt ?? createdAt ?? null;
  const duration = createdAt ? (endedAt ? endedAt.getTime() : Date.now()) - createdAt.getTime() : null;
  const formattedNaturalDate = completionDate ? formatDateWithOrdinal(completionDate) : "an unknown date";
  const completionSummaryTimestamp = completionDate
    ? `${completionDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })} on ${formattedNaturalDate}`
    : null;
  const durationLabel = duration != null ? formatDuration(duration) : null;
  const summaryLine = useMemo(() => {
    if (!player) return "";
    return getRandomCertificateSummary({
      winnerName: player.name,
      formattedDuration: durationLabel ?? "—",
      formattedEndTime: completionSummaryTimestamp ?? "—",
      formattedNaturalDate,
      customRoomName: room?.roomName?.trim() || undefined,
    });
  }, [player, durationLabel, completionSummaryTimestamp, formattedNaturalDate, room?.roomName]);

  useEffect(() => {
    if (!captureRef.current || !player || !room || cardImageUrl) {
      return;
    }
    html2canvas(captureRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    })
      .then((canvas) => {
        setCardImageUrl(canvas.toDataURL("image/png"));
      })
      .catch((err) => {
        console.error("Unable to capture card image", err);
      });
  }, [player, room, cardImageUrl]);

  const handleCopyShare = async () => {
    if (!currentWinnerPageUrl) return;
    try {
      await navigator.clipboard.writeText(currentWinnerPageUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.error("Unable to copy share link", err);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const safeName = (player?.name?.trim().toLowerCase().replace(/\s+/g, "-") || "winner").slice(0, 50);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `recruiting-bingo-certificate-${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Unable to download certificate", err);
    }
  };

  const shareOnLinkedIn = () => {
    if (!linkedInShareUrl) return;
    // Share the exact winner page URL so LinkedIn posts point to this game instance.
    window.open(linkedInShareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <PageShell>
      <div className="w-full bg-[#f7f1e9]/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          {isLoading ? (
            <p className={messageTextClass}>Loading winner details…</p>
          ) : error ? (
            <div className={`${isDark ? "rounded-lg border border-rose-500/60 bg-rose-900/40 p-4 text-rose-100" : "rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700"} space-y-3`}>
              <p>{error}</p>
              <Link to="/" className="text-sm font-semibold text-sky-600 underline-offset-4 hover:underline">
                Return to the landing page
              </Link>
            </div>
          ) : !room ? (
            <div className="space-y-3">
              <p className={messageTextClass}>No room data available.</p>
              <Link to="/" className="text-sm font-semibold text-sky-600 underline-offset-4 hover:underline">
                Start a new game
              </Link>
            </div>
          ) : !player ? (
            <p className={isDark ? "text-slate-300" : "text-slate-600"}>This player is not part of this game.</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div
                ref={captureRef}
                style={{
                  position: "absolute",
                  left: "-9999px",
                  top: "-9999px",
                }}
                aria-hidden="true"
              >
                <BingoCard card={room.card} marked={player.marked} playerColor={player.color} interactive={false} />
              </div>
              {canShare ? (
                <div className="rounded-3xl bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 px-4 py-1 text-white shadow-lg">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.4em]">Share your win</p>
                      <p className="text-sm font-semibold">Let everyone know you just claimed Recruiting Bingo glory.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleCopyShare}
                        className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
                      >
                        {copiedShare ? "Copied!" : "Copy link"}
                      </button>
                      <button
                        type="button"
                        onClick={shareOnLinkedIn}
                        className="rounded-full border border-white/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Share on LinkedIn
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadCertificate}
                        className="rounded-full border border-white/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        <span className="flex items-center gap-1.5">
                          <Download className="h-4 w-4" />
                          Download
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : player && room ? (
                <div className="rounded-3xl bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 px-4 py-1 text-white shadow-lg">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.4em]">Start your own game</p>
                      <p className="text-sm font-semibold">
                        Want your own moment of Recruiting Bingo glory? Spin up a free game in seconds.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/"
                        className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
                      >
                        Start a free game
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-1 mx-auto flex max-w-6xl items-start gap-6">
                <section className="flex-1">
                  <WinnerCertificate
                    winnerName={player.name}
                    summaryLine={summaryLine}
                    cardImageUrl={cardImageUrl}
                    certificateRef={certificateRef}
                  />
                </section>
                <aside className="w-72 shrink-0">
                  <div className={leaderboardCardClass}>
                    <h3 className={leaderboardHeaderClass}>Leaderboard</h3>
                    {leaderboard.length ? (
                      <ul className="mt-3 space-y-1.5 text-sm">
                        {leaderboard.map((entry, index) => {
                          const isCurrentWinner = entry.playerId === player.playerId;
                          const itemClass = isCurrentWinner
                            ? isDark
                              ? "bg-amber-500/25 font-semibold text-amber-100"
                              : "bg-amber-200/50 font-semibold text-slate-900"
                            : isDark
                            ? "bg-slate-800/80 text-slate-200"
                            : "bg-slate-100/70 text-slate-700";
                          return (
                            <li
                              key={entry.playerId}
                              className={`flex items-center justify-between rounded-xl px-3 py-2 ${itemClass}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">{index + 1}.</span>
                                <span className="font-medium">{entry.name}</span>
                              </div>
                              {entry.winnerIndex >= 0 ? (
                                <span className="text-xs font-semibold text-emerald-600">Winner #{entry.winnerIndex + 1}</span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">No players logged.</p>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default WinnerPage;
