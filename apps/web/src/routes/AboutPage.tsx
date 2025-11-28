import { PageShell } from "../components/layout/PageShell";
import { Link } from "react-router-dom";

const faqItems = [
  {
    question: "Is Recruiting Bingo really free?",
    answer:
      "Yes. The game is open source and hosted as a hobby project. There are no ads, upsells, or surprise paywalls, and you can self-host it if you prefer."
  },
  {
    question: "Do players need an account to join?",
    answer:
      "Only the host enters a name when creating a room. Everyone else just clicks the invite link, picks a color, and starts marking squares. No logins or downloads required."
  },
  {
    question: "How many people can join a room?",
    answer:
      "We have tested rooms with small to medium recruiting teams (8–20 people) without issues. For best results, keep it to a size where the facilitator can still keep things lively."
  },
  {
    question: "Is this safe to run at a company event?",
    answer:
      "Yes. The game runs entirely in the browser, and the host controls the room. If someone misbehaves, the host can close the room and start a fresh one instantly."
  },
  {
    question: "What data do you track?",
    answer:
      "Aside from the room name you provide and the color/name each player chooses, we do not collect personal data. There are no analytics beacons or ad trackers embedded in the experience."
  },
  {
    question: "Can I host it myself?",
    answer:
      "Absolutely. The project is open source, so you can review the code, fork it, and deploy it wherever you like."
  }
];

export function AboutPage() {
  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="space-y-3 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">About Recruiting Bingo</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50">Built for talent teams who live the chaos every day</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Recruiting Bingo is a free, browser-based game designed for recruiting, talent acquisition, and hiring teams. It was built by folks who have lived in TA, and it works for weekly standups, offsites, remote happy hours, or any time you need a morale boost.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">How the game works</h2>
          <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
              <span className="font-semibold text-slate-900 dark:text-slate-50">1. Host spins up a room.</span> Enter a name, choose whether to stop at the first winner, and copy the invite link.
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
              <span className="font-semibold text-slate-900 dark:text-slate-50">2. Teammates join via link.</span> They open the link on any modern browser, pick a color, and they’re immediately on the shared board.
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
              <span className="font-semibold text-slate-900 dark:text-slate-50">3. Mark recruiting events live.</span> As real events happen—ghosted candidates, surprise offers, impossible reqs—players tap the squares and race to bingo.
            </li>
          </ol>
          <p className="text-xs text-slate-500 dark:text-slate-400">Most teams run a round in 15–30 minutes, but you can play longer if you keep adding winners.</p>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Game limits & details</h2>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Best for small to medium teams (8–20 players), but we’ve tested larger rooms too.</li>
            <li>Works on modern desktop browsers (Chrome, Edge, Firefox, Safari) and recent mobile browsers.</li>
            <li>You decide whether to end at the first winner or keep confirming additional winners.</li>
            <li>Rooms stay active while your browser tab is open; close the tab to retire the room.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Free, open source, no BS</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Recruiting Bingo is open source and maintained in public. You can audit, fork, or contribute to the project anytime.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            There are no ads, no trackers, and no surprise billing. Hosts provide a room name and that’s it; players pick a nickname and color so you know who’s who on the board.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <a
              href="https://github.com/thiskevinwang/recruiting-bingo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-600 underline-offset-2 hover:underline"
            >
              See the source on GitHub
            </a>
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">FAQ</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.question}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-3 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Ready to try it?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Spin up a free room and drop the link in your next team meeting.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-400"
          >
            Start a free game
          </Link>
        </section>
      </main>
    </PageShell>
  );
}

export default AboutPage;
