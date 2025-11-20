# Recruiting Bingo – Agent Notes

## Project Summary
- Building “Recruiting Bingo”: a multiplayer (or solo) web-based bingo game for recruiters.
- Hosted at bingo.hiregear.us as a portfolio-quality app.
- Flow: one user creates a room URL; up to 24 players join via that URL, pick a name and color, and mark squares on a shared 5x5 card as funny recruiting events happen.
- No signup/accounts/auth—just URLs, names, and server-stored state.
- Supports solo play with the same flow.

## Key Constraints & Architecture
- Frontend: React + TypeScript + Vite.
- Styling: Tailwind CSS (light, polished SaaS feel; fun but not cartoony).
- Backend: Cloudflare Worker with one Durable Object per room (free tier).
- Persistent room state (cards, players, winners) lives in the Durable Object.
- Simple global stats (e.g., “games created in last 24 hours”) stored in Cloudflare KV.
- Real-time updates via WebSockets between the frontend and the Worker.
- No other external backend services.

## High-Level Features
- Rooms: up to 24 players, or 1 for solo play.
- Card: 5x5, no free center; entries are humorous recruiting events.
- Default card generated randomly from a static library; room creator can instead define 25 custom entries with an option to “fill in the rest for me” from the library.
- Player identity: unique name within room + dab color.
- Interactions: marking/unmarking uses a dab animation in the player’s color.
- Bingo detection: standard rows, columns, and both diagonals (no free space).
- Winner flow: celebration screen, highlighted winning lines, downloadable personalized card image, LinkedIn share button.
- LinkedIn share opens a dialog with a winner URL that ultimately routes new visitors to the main landing page to start their own game.
- Room expiry: 7 days of inactivity; expired rooms show “game ended” + “start a new game” CTA; expired winner URLs redirect immediately to the landing page.

## Dev Workflow & Testing
- Monorepo layout:
  - `apps/web` for React + Vite frontend.
  - `apps/worker` for Cloudflare Worker + Durable Object backend.
  - `packages/shared` for shared TypeScript types/logic (e.g., bingo detection).
- Use npm workspaces across the three packages.
- Add a devcontainer for GitHub Codespaces with Node and Wrangler.
- Testing (Vitest) focus:
  - Bingo detection logic.
  - Card generation logic.
  - Critical pure functions (e.g., room/player joining rules).
- Heavier UI and real-time behavior: manual testing with multiple tabs/devices.

## Instructions for the AI in This Repo
- Always assume this context when making changes or scaffolding.
- Prefer simple, readable TypeScript and React.
- Use Tailwind CSS for styling; keep it polished and professional.
- Respect Cloudflare free-tier constraints; avoid new external services.
- When uncertain, align with the Recruiting Bingo PRD: bingo rules, room behavior, LinkedIn sharing, etc.
- Keep the project small, clean, and maintainable as a portfolio piece.
