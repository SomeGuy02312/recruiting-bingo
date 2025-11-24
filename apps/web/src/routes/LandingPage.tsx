import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../lib/api";
import { savePlayer } from "../lib/storage";
import { PageShell } from "../components/layout/PageShell";

export function LandingPage() {
  const navigate = useNavigate();
  const [creatorName, setCreatorName] = useState("");
  const [creatorColor, setCreatorColor] = useState("#6366f1"); // indigo
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

  return (
    <PageShell>
      <div className="mx-auto flex max-w-xl flex-col gap-8 text-center">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Multiplayer Recruiting Fun
          </p>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">Recruiting Bingo</h1>
          <p className="text-lg text-slate-600">
            Spin up a shared bingo board for your recruiting team. Mark the wild moments, celebrate wins, and
            keep the energy high during every search.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm"
        >
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-700">
              Room name (optional)
              <input
                type="text"
                value={roomName}
                onChange={(event) => setRoomName(event.currentTarget.value)}
                placeholder="Friday Sourcing Standup"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Your name
              <input
                type="text"
                value={creatorName}
                onChange={(event) => setCreatorName(event.currentTarget.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Dab color
              <input
                type="color"
                value={creatorColor}
                onChange={(event) => setCreatorColor(event.currentTarget.value)}
                className="mt-2 h-12 w-20 cursor-pointer rounded border border-slate-300"
              />
            </label>

            <label className="flex items-start gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={stopAtFirstWinner}
                onChange={(event) => setStopAtFirstWinner(event.currentTarget.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-600">
                End the game when the first player gets bingo
              </span>
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
