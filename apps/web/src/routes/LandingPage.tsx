import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createRoom } from "../lib/api";
import { savePlayer } from "../lib/storage";
import { PageShell } from "../components/layout/PageShell";
import { ColorSwatchPicker } from "../components/ColorSwatchPicker";
import { darkTheme } from "../theme/colors";
import { useThemeMode } from "../theme/theme-context";
import { getDefaultRecruitingLibrary } from "@recruiting-bingo/shared";

export function LandingPage() {
  const navigate = useNavigate();
  const [creatorName, setCreatorName] = useState("");
  const [creatorColor, setCreatorColor] = useState<string>(darkTheme.playerSwatches[0] ?? "#38BDF8");
  const [roomName, setRoomName] = useState("");
  const [stopAtFirstWinner, setStopAtFirstWinner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomSquares, setUseCustomSquares] = useState(false);
  const [customSquares, setCustomSquares] = useState<string[]>(() => Array(25).fill(""));
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    if (!useCustomSquares) {
      setCustomError(null);
    }
  }, [useCustomSquares]);

  const defaultLibrary = useMemo(() => getDefaultRecruitingLibrary(), []);

  const handleCustomSquareChange = (index: number, value: string) => {
    setCustomSquares((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleFillRemainingSquares = () => {
    setCustomSquares((prev) => {
      const next = [...prev];
      const used = new Set(
        next
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0)
      );
      const pool = defaultLibrary.filter((entry) => !used.has(entry));
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      let poolIndex = 0;
      for (let i = 0; i < next.length && poolIndex < pool.length; i += 1) {
        if (next[i].trim().length === 0) {
          next[i] = pool[poolIndex];
          poolIndex += 1;
        }
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = creatorName.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    let trimmedCustomSquares: string[] | undefined;
    if (useCustomSquares) {
      const trimmed = customSquares.map((entry) => entry.trim());
      if (trimmed.some((entry) => entry.length === 0)) {
        setCustomError("Please fill in all 25 squares.");
        return;
      }
      trimmedCustomSquares = trimmed;
      setCustomError(null);
    }

    setIsSubmitting(true);
    try {
      const response = await createRoom({
        creatorName: trimmedName,
        creatorColor,
        roomName: roomName.trim() || undefined,
        stopAtFirstWinner,
        customSquares: trimmedCustomSquares
      });

      savePlayer(response.room.roomId, {
        playerId: response.playerId,
        name: trimmedName,
        color: creatorColor
      });

      navigate(`/r/${response.room.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  const heroTextClass = isDark ? "text-lg text-slate-300" : "text-lg text-slate-600";
  const heroTitleClass = "text-4xl font-bold leading-tight md:text-5xl";
  const heroSubtitleClass = isDark
    ? "text-sm font-semibold uppercase tracking-[0.3em] text-slate-400"
    : "text-sm font-semibold uppercase tracking-[0.3em] text-slate-500";
  const cardClass = isDark
    ? "rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-left shadow-xl"
    : "rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-md";
  const labelClass = isDark ? "text-sm font-medium text-slate-200" : "text-sm font-medium text-slate-700";
  const inputClass = isDark
    ? "mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-base text-slate-100 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
    : "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40";
  const checkboxLabelClass = isDark ? "flex items-start gap-3 text-sm font-medium text-slate-200" : "flex items-start gap-3 text-sm font-medium text-slate-700";
  const checkboxTextClass = isDark ? "text-sm font-medium text-slate-300" : "text-sm font-medium text-slate-600";
  const errorTextClass = isDark ? "text-sm text-rose-300" : "text-sm text-rose-600";

  return (
    <PageShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-6 text-center">
        <section className="flex flex-col gap-4">
          <p className={heroSubtitleClass}>Live bingo for talent teams</p>
          <h1 className={heroTitleClass}>
            <span className="bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">Recruiting Bingo</span>{" "}
            — a <span className="font-semibold text-sky-500 dark:text-sky-300">free</span>, browser-based game for{" "}
            <span className="font-semibold text-pink-500 dark:text-pink-300">burned-out recruiting teams</span>
          </h1>
          <p className={heroTextClass}>
            Play a live bingo game with your recruiting or hiring team based on the real chaos of reqs, interviews, and offers.{" "}
            <span className="font-semibold text-emerald-500 dark:text-emerald-300">Free & open source</span>,{" "}
            <span className="font-semibold text-sky-500 dark:text-sky-300">no ads</span>,{" "}
            <span className="font-semibold text-violet-500 dark:text-violet-300">no logins</span>, no BS.
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white/90 px-6 py-5 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900/70" id="create-game">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Start a game</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">Ready to play?</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Spin up a free game for yourself or invite your team. Each room supports up to 24 players with a single link.
            </p>
          </div>
          <form onSubmit={handleSubmit} className={`${cardClass} mt-6`}>
            <div className="flex flex-col gap-4">
              <label className={`${labelClass} flex flex-col gap-1 text-left sm:flex-row sm:items-center sm:gap-3`}>
                <span className="min-w-[150px]">Room name (optional)</span>
                <input
                  type="text"
                  value={roomName}
                  onChange={(event) => setRoomName(event.currentTarget.value)}
                  placeholder="Friday Sourcing Standup"
                  className={`${inputClass} flex-1`}
                />
              </label>

              <label className={`${labelClass} flex flex-col gap-1 text-left sm:flex-row sm:items-center sm:gap-3`}>
                <span className="min-w-[150px]">Your name</span>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(event) => setCreatorName(event.currentTarget.value)}
                  className={`${inputClass} flex-1`}
                />
              </label>

            <ColorSwatchPicker value={creatorColor} onChange={setCreatorColor} label="Your color" />

            <div className="flex flex-col gap-3 text-left sm:flex-row sm:items-start sm:gap-6">
              <label className="flex flex-wrap items-center gap-2 text-left">
                <input
                  type="checkbox"
                  className={`h-4 w-4 rounded ${isDark ? "border-slate-600 text-sky-400" : "border-slate-300 text-sky-500"} focus:ring-sky-500`}
                  checked={useCustomSquares}
                  onChange={(event) => setUseCustomSquares(event.currentTarget.checked)}
                />
                <span className={isDark ? "text-sm font-semibold text-slate-100" : "text-sm font-semibold text-slate-900"}>
                  Create custom game
                </span>
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold text-slate-500 dark:border-slate-500 dark:text-slate-300"
                  title="Name your own bingo squares for this game only."
                  role="img"
                  aria-label="Name your own bingo squares for this game only."
                >
                  i
                </span>
                <span className="sr-only">Name your own bingo squares for this game only.</span>
              </label>

              <label className={checkboxLabelClass}>
                <input
                  type="checkbox"
                  checked={stopAtFirstWinner}
                  onChange={(event) => setStopAtFirstWinner(event.currentTarget.checked)}
                  className={`mt-1 h-4 w-4 rounded ${isDark ? "border-slate-600 text-sky-400" : "border-slate-300 text-sky-500"} focus:ring-sky-500`}
                />
                <span className={checkboxTextClass}>End the game when the first player gets bingo</span>
              </label>
            </div>

            {useCustomSquares ? (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-left text-sm dark:border-slate-700 dark:bg-slate-900/70">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Custom card squares</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enter up to 50 characters per square. All 25 are required.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillRemainingSquares}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Fill remaining squares
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {customSquares.map((value, index) => (
                    <div key={`square-${index}`} className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Square {index + 1}</label>
                      <input
                        type="text"
                        maxLength={50}
                        value={value}
                        onChange={(event) => handleCustomSquareChange(index, event.currentTarget.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-sm outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  ))}
                </div>
                {customError ? (
                  <p className="mt-2 text-xs text-rose-600 dark:text-rose-400" role="alert">
                    {customError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <p className={errorTextClass} role="alert">
                {error}
              </p>
            ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating..." : "Create Game"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 flex flex-col gap-10 text-left">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Why Recruiting Bingo works so well</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Real recruiting chaos",
                  body: "Cards are filled with the moments your team knows too well — late offers, ghosted interviews, impossible reqs."
                },
                {
                  title: "Shared laughs, lower stress",
                  body: "Turn the rollercoaster into something playful during standups, offsites, or remote happy hours."
                },
                {
                  title: "Zero onboarding",
                  body: "Hosts create a room, everyone else joins via a link in seconds. Works great for hybrid or remote teams."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="how-it-works" className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">How to play Recruiting Bingo</h2>
            <ol className="space-y-4 text-left">
              <li className="flex flex-col gap-1 text-lg font-semibold text-slate-900 dark:text-white">
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-500 dark:text-sky-300">Step 1</span>
                <span className="text-2xl text-sky-600 dark:text-sky-300">Host creates a room</span>
                <p className="text-base font-normal text-slate-700 dark:text-slate-300">
                  Name the room, pick your color, decide whether to end at the first winner or keep rolling—then hit create.
                </p>
              </li>
              <li className="flex flex-col gap-1 text-lg font-semibold text-slate-900 dark:text-white">
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-violet-500 dark:text-violet-300">Step 2</span>
                <span className="text-2xl text-violet-500 dark:text-violet-300">Share the link</span>
                <p className="text-base font-normal text-slate-700 dark:text-slate-300">
                  Drop the invite URL in Slack or Zoom. Teammates join from any modern browser—no logins, no installs.
                </p>
              </li>
              <li className="flex flex-col gap-1 text-lg font-semibold text-slate-900 dark:text-white">
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-pink-500 dark:text-pink-300">Step 3</span>
                <span className="text-2xl text-pink-500 dark:text-pink-300">Play live</span>
                <p className="text-base font-normal text-slate-700 dark:text-slate-300">
                  Mark squares as real recruiting highs and lows happen. Celebrate the first person to call bingo—or keep going for more winners.
                </p>
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">What makes Recruiting Bingo different</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Free & open source",
                  body: "No dark patterns, no surprise paywalls. Review or fork the code whenever you want."
                },
                {
                  title: "No logins for players",
                  body: "Only the host creates a room. Everyone else just clicks a link and picks a color."
                },
                {
                  title: "No ads or tracking",
                  body: "We don’t sell your data or inject ads into your team’s meetings."
                },
                {
                  title: "Built for TA pros",
                  body: "Designed by people who live in recruiting. Every square is sourced from real-life chaos."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-3xl text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Want the details?</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Learn how the game works, max players, and what we do (and don’t) track.</p>
          <Link
            to="/about"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Read the FAQ & details
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
