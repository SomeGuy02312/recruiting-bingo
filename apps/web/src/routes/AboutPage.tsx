import { PageShell } from "../components/layout/PageShell";
import { Link } from "react-router-dom";

const steps = [
  "Create a room with a name, color, and optional custom board.",
  "Share the invite link with up to 24 teammates—no logins or downloads required.",
  "Everyone marks squares live as real recruiting chaos unfolds.",
  "When a player calls BINGO, the server confirms it and all clients update together.",
  "Winner banners, fireworks, and the shareable winner page keep the celebration going."
];

const faqItems = [
  {
    question: "Is Recruiting Bingo really free?",
    answer:
      "Yes. It’s an open-source side project—no ads, no trackers, and no surprise paywalls. You can even self-host it from the GitHub repo."
  },
  {
    question: "Do players need accounts?",
    answer:
      "Only the host enters a name when creating a room. Everyone else joins via the shared link, picks a color, and instantly sees the synced card."
  },
  {
    question: "How many people can join a room?",
    answer:
      "We’ve tested rooms with 8–24 players. Larger groups should still work, but smaller sessions keep the conversation lively."
  },
  {
    question: "Is this safe for company events?",
    answer:
      "Yes. The host controls the room. If someone misbehaves (or the chaos gets too real), just close the tab and start a fresh room."
  },
  {
    question: "What do you track?",
    answer:
      "Only the room name, card layout, and each player’s nickname/color—nothing personally identifiable, and no analytics or ads."
  },
  {
    question: "Can I host it myself?",
    answer:
      "Absolutely. The project is Polyform-licensed. Fork it, re-theme it, or deploy it to your own Cloudflare account."
  }
];

const iconClasses = "h-4 w-4";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses} aria-hidden>
    <path d="M12 0C5.4 0 0 5.5 0 12.3c0 5.4 3.4 10 8.2 11.6.6.1.8-.3.8-.6v-2c-3.3.8-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.4 3.5 1.1.1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.4-5.5-6.2 0-1.3.5-2.5 1.3-3.3-.2-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.3.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.6 3.3-1.3 3.3-1.3.6 1.6.2 2.9.1 3.2.8.9 1.3 2 1.3 3.3 0 4.8-2.8 5.8-5.5 6.1.4.4.8 1.2.8 2.4v2.9c0 .3.2.7.8.6 4.8-1.6 8.2-6.2 8.2-11.6C24 5.5 18.6 0 12 0Z" />
  </svg>
);

const RepoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses} aria-hidden>
    <path d="M4 2.5A2.5 2.5 0 0 1 6.5 0h11A2.5 2.5 0 0 1 20 2.5v19a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 21.5Zm2.5-.5A.5.5 0 0 0 6 2.5v19a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-19a.5.5 0 0 0-.5-.5Zm2 3A.5.5 0 0 1 9 4h6a.5.5 0 0 1 0 1H9a.5.5 0 0 1-.5-.5Zm0 3A.5.5 0 0 1 9 7h6a.5.5 0 0 1 0 1H9a.5.5 0 0 1-.5-.5ZM12 19a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses} aria-hidden>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V8.99h3.42v1.56h.05c.48-.9 1.65-1.86 3.41-1.86 3.66 0 4.34 2.4 4.34 5.54v6.22ZM5.34 7.42c-1.14 0-2.07-.93-2.07-2.07 0-1.13.93-2.06 2.07-2.06s2.07.93 2.07 2.06c0 1.14-.93 2.07-2.07 2.07Zm-1.78 13.03h3.56V8.99H3.56v11.46ZM22.23 0H1.77C.79 0 0 .78 0 1.75v20.5C0 23.22.79 24 1.77 24h20.46c.97 0 1.77-.78 1.77-1.75V1.75C24 .78 23.2 0 22.23 0Z" />
  </svg>
);

const IconLink = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
  >
    {children}
    <span>{label}</span>
  </a>
);

export function AboutPage() {
  return (
    <PageShell>
      <main className="mx-auto max-w-4xl px-4 py-10 text-left text-slate-900 dark:text-slate-50">
        <section className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">About Recruiting Bingo</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">A no-BS product for talent teams and their hiring partners</h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
            Recruiting Bingo turns real hiring chaos into a playful shared experience. Hosts spin up a room, share a link, and everyone marks squares together. When someone wins, the app confirms it, triggers fireworks, and keeps the room perfectly synced.
          </p>
        </section>

        <section className="mt-12 flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-50">
            <h2 className="text-xl font-semibold">How the game works</h2>
            <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex-1 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-50">
            <h2 className="text-xl font-semibold">Tech stack & sync</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>React + TypeScript + Vite + Tailwind in a monorepo that shares logic via <code>@recruiting-bingo/shared</code>.</li>
              <li>Cloudflare Workers store the room state and card (default or custom) on creation.</li>
              <li>Each client connects to the room ID, sends mark/bingo events, and the worker broadcasts updates to everyone.</li>
              <li>Re-renders are driven by those shared updates, so the board stays in lockstep across devices.</li>
            </ul>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Who built this?</h2>
          <p className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
            I’m a Snr Product Manager (ex-recruiter!) building with a modern AI coding stack. The  project is an experiment in AI-assisted product creation:
            can a tiny team (me + GPT) ship features, design polish, and tell a compelling story?  So far, yes—and I’m sharing the results here.
          </p>
          <div className="flex flex-wrap gap-3">
            <IconLink href="https://github.com/SomeGuy02312" label="My GitHub">
              <GithubIcon />
            </IconLink>
            <IconLink href="https://github.com/SomeGuy02312/recruiting-bingo" label="Project Repo">
              <RepoIcon />
            </IconLink>
            <IconLink href="https://www.linkedin.com/in/epedini/" label="LinkedIn">
              <LinkedInIcon />
            </IconLink>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">FAQ</h2>
          <div className="space-y-6">
            {faqItems.map((item) => (
              <div key={item.question}>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.question}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-3 text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Ready to play?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Spin up a free room and drop the link in your next standup or offsite.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-400"
          >
            Start a free game
          </Link>
        </section>
      </main>
    </PageShell>
  );
}
