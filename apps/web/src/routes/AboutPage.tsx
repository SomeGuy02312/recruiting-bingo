import { Link } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";

const steps = [
  {
    title: "Create a room",
    body: "Pick a room name, your color, and decide if you want the default bingo library or your own custom squares."
  },
  {
    title: "Share the invite link",
    body: "Drop the link in Slack or Zoom chat. Teammates join instantly in their browser—no logins or installs."
  },
  {
    title: "Play in sync",
    body: "Everyone marks squares as real recruiting chaos unfolds. The room keeps every player in sync in real time."
  },
  {
    title: "Call BINGO",
    body: "When someone hits a line, they tap Call Bingo. The room validates the win, fireworks fire off, and winner pages unlock."
  }
];

const faqItems = [
  {
    q: "Is Recruiting Bingo really free?",
    a: "Yes. It’s open source, MIT-licensed, and has zero ads, trackers, or surprise paywalls."
  },
  {
    q: "Do players need accounts?",
    a: "Only the host types a name when creating a room. Everyone else just clicks the invite link and picks a color."
  },
  {
    q: "How many people can join a room?",
    a: "We’ve run sessions with 8–24 players comfortably. Bigger teams work too, but keep the banter manageable."
  },
  {
    q: "What gets stored or tracked?",
    a: "Room name, player display names/colors, winners, and square states. That’s it. There’s no analytics overlay or data resale."
  },
  {
    q: "Can I self-host it?",
    a: "Absolutely. Grab the repo, deploy it wherever you want, and customize the card library for your team."
  }
];

const iconClasses = "h-4 w-4";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses} aria-hidden>
    <path d="M12 0C5.37 0 0 5.46 0 12.2c0 5.39 3.44 9.95 8.21 11.57.6.12.82-.27.82-.59 0-.29-.01-1.05-.02-2.06-3.34.74-4.05-1.64-4.05-1.64-.55-1.42-1.34-1.8-1.34-1.8-1.1-.77.08-.75.08-.75 1.22.09 1.87 1.28 1.87 1.28 1.08 1.9 2.83 1.35 3.52 1.03.11-.8.42-1.35.76-1.66-2.67-.31-5.48-1.37-5.48-6.1 0-1.35.47-2.45 1.25-3.31-.13-.31-.54-1.55.12-3.22 0 0 1.01-.33 3.3 1.26.96-.27 1.98-.41 3-.41s2.05.14 3 .41c2.29-1.59 3.3-1.26 3.3-1.26.66 1.67.25 2.91.12 3.22.78.86 1.25 1.96 1.25 3.31 0 4.74-2.81 5.78-5.49 6.09.43.39.81 1.16.81 2.35 0 1.7-.02 3.07-.02 3.49 0 .32.21.71.83.59C20.56 22.14 24 17.58 24 12.2 24 5.46 18.63 0 12 0Z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses} aria-hidden>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V8.99h3.42v1.56h.05c.48-.91 1.66-1.87 3.42-1.87 3.66 0 4.34 2.41 4.34 5.55v6.22ZM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.13.92-2.05 2.06-2.05s2.06.92 2.06 2.05c0 1.14-.92 2.06-2.06 2.06Zm-1.78 13.02h3.56V8.99H3.56v11.46ZM22.23 0H1.77C.79 0 0 .78 0 1.75v20.5C0 23.22.79 24 1.77 24h20.46c.97 0 1.77-.78 1.77-1.75V1.75C24 .78 23.2 0 22.23 0Z" />
  </svg>
);

const RepoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={iconClasses} aria-hidden>
    <path d="M4 2.5A2.5 2.5 0 0 1 6.5 0h11A2.5 2.5 0 0 1 20 2.5v19a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 21.5Zm2.5-.5A.5.5 0 0 0 6 2.5v19a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-19a.5.5 0 0 0-.5-.5Zm2 3A.5.5 0 0 1 9 4h6a.5.5 0 0 1 0 1H9a.5.5 0 0 1-.5-.5Zm0 3A.5.5 0 0 1 9 7h6a.5.5 0 0 1 0 1H9a.5.5 0 0 1-.5-.5ZM12 19a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
  </svg>
);

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
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
}

export function AboutPage() {
  return (
    <PageShell>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 text-slate-800 dark:text-slate-200">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">About Recruiting Bingo</p>
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">A no-BS mini product for talent teams</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Recruiting Bingo is a browser-based game that turns real hiring chaos into a shared laugh. One person creates a room, everyone else joins
            from a link, and the card syncs live as interviews reschedule, offers spin, and someone inevitably says “this should only take 10 minutes.”
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">How the game works</h2>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Step {index + 1}</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Tech stack & sync model</h2>
          <p>
            Built with <strong>React, TypeScript, Vite, and Tailwind</strong> inside a monorepo that shares room logic under <code>@recruiting-bingo/shared</code>.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Room creation hits a worker API that stores the card (default or custom) plus room metadata.</li>
            <li>Clients connect via room ID and emit events for marking squares or calling BINGO.</li>
            <li>The server broadcasts each update so the card, winner banner, and fireworks stay perfectly in sync.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Who built this?</h2>
          <p>
            I’m a product nerd and recovering recruiter, experimenting with how far an AI-assisted build can go. Every pixel, state update, and
            celebratory animation was built in public with ChatGPT riding shotgun. The goal: see what happens when shipping something useful matters more than pitching decks.
          </p>
          <div className="flex flex-wrap gap-3">
            <IconLink href="https://github.com/SomeGuy02312" label="My GitHub">
              <GithubIcon />
            </IconLink>
            <IconLink href="https://github.com/SomeGuy02312/recruiting-bingo" label="Project repo">
              <RepoIcon />
            </IconLink>
            <IconLink href="https://www.linkedin.com" label="LinkedIn">
              <LinkedInIcon />
            </IconLink>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">FAQ</h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details key={item.q} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Ready to play?</h2>
          <p className="text-slate-600 dark:text-slate-300">Spin up a free room in under two minutes and invite your crew.</p>
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-400 sm:w-auto"
          >
            Start a free game
          </Link>
        </section>
      </main>
    </PageShell>
  );
}

export default AboutPage;
