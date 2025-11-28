import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../lib/api";
import { savePlayer } from "../lib/storage";
import { PageShell } from "../components/layout/PageShell";
import { ColorSwatchPicker } from "../components/ColorSwatchPicker";
import { darkTheme } from "../theme/colors";
import { useThemeMode } from "../theme/theme-context";

export function LandingPage() {
  const navigate = useNavigate();
  const [creatorName, setCreatorName] = useState("");
  const [creatorColor, setCreatorColor] = useState(darkTheme.playerSwatches[0] ?? "#38BDF8");
  const [roomName, setRoomName] = useState("");
  const [stopAtFirstWinner, setStopAtFirstWinner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = creatorName.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createRoom({
        creatorName: trimmedName,
        creatorColor,
        roomName: roomName.trim() || undefined,
        stopAtFirstWinner
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
  const heroTitleClass = isDark ? "text-4xl font-bold text-slate-50 md:text-5xl" : "text-4xl font-bold text-slate-900 md:text-5xl";
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
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-6 text-center">
        <div className="flex flex-col gap-4">
          <p className={heroSubtitleClass}>Multiplayer Recruiting Fun</p>
          <h1 className={heroTitleClass}>Recruiting Bingo</h1>
          <p className={heroTextClass}>
            Spin up a shared bingo board for your recruiting team. Mark the wild moments, celebrate wins, and
            keep the energy high during every search.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={cardClass}>
          <div className="flex flex-col gap-4">
            <label className={labelClass}>
              Room name (optional)
              <input
                type="text"
                value={roomName}
                onChange={(event) => setRoomName(event.currentTarget.value)}
                placeholder="Friday Sourcing Standup"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Your name
              <input
                type="text"
                value={creatorName}
                onChange={(event) => setCreatorName(event.currentTarget.value)}
                className={inputClass}
              />
            </label>

            <ColorSwatchPicker value={creatorColor} onChange={setCreatorColor} label="Your color" />

            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={stopAtFirstWinner}
                onChange={(event) => setStopAtFirstWinner(event.currentTarget.checked)}
                className={`mt-1 h-4 w-4 rounded ${isDark ? "border-slate-600 text-sky-400" : "border-slate-300 text-sky-500"} focus:ring-sky-500`}
              />
              <span className={checkboxTextClass}>End the game when the first player gets bingo</span>
            </label>

            {error ? <p className={errorTextClass}>{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
