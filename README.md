# recruiting-bingo

Open source multiplayer web-based bingo

🎉 Recruiting Bingo

A lightweight, real-time, multiplayer bingo game for recruiters, sourcers, hiring teams, and anyone who lives in the madness of talent acquisition.

📌 Overview

Recruiting Bingo is a modern web app built for fun team moments, offsites, training sessions, and live meetings. Create a room in seconds, share a link, and watch everyone sync up in real time as they click squares like:

“Can we push this to next quarter?”

“What’s the budget for this role?”

“We need someone with 10 years of experience in a 3-year-old technology.”

Players get automatic Bingo detection, real-time winner announcements, and fireworks 🔥🎆

No accounts. No logins. No tracking. Just a delightful little game.

🚀 Features

Real-time multiplayer rooms
Everyone sees the same card. Taps, marks, and Bingo calls sync instantly.

Multiple card libraries
Packs for the recruiting world: TA, sourcing, hiring managers, etc.

Custom games
Create your own 25-square custom card set with built-in random fill.

Winner flow + fireworks
The moment someone calls Bingo, the room celebrates together.

Modern UI with dark mode
A clean, themed interface designed for low effort, maximum delight.

Open Graph preview integration
Designed for clean sharing on social platforms.

🧰 Tech Stack
Frontend

React + TypeScript (Vite-powered)

Tailwind CSS for styling and theming

ShadCN / Headless UI patterns for consistent components

Zustand (or similar) for local UI state management

Custom game logic package shared inside the monorepo

Architecture

Monorepo structure (apps/, packages/)

apps/web – the main Recruiting Bingo front-end

packages/types & utils – shared logic, bingo validation, state modeling

Real-time state sync:

Each room has a unique ID

Clients subscribe to room state

Actions are sent as events (mark square, call bingo, join room)

The state system produces a canonical representation of the game

Clients re-render UI from the shared state snapshot

(Note: Replace this with the exact mechanism if SyncEngine/WebSocket/SignalR/Liveblocks/etc. is added later.)

Styling

Tailwind dark: variants

Glassy white/dark cards with soft borders

Layout grid designed for crisp, readable bingo cards

Build & Deploy

Vite for blazing-fast dev server + optimized production builds

Cloudflare Pages for deployment (recommended)

Optional GitHub Pages setup included in repo history

📦 Installation & Local Development

# Clone the repo

git clone https://github.com/SomeGuy02312/recruiting-bingo
cd recruiting-bingo

# Install dependencies

npm install

# or

pnpm install

# Run local dev server

npm run dev

The app will boot at:

http://localhost:5173

🚀 Deployment Instructions (Cloudflare Pages)

In Cloudflare, create a new Pages project.

Connect to this GitHub repo.

Use the following config:

Build command

npm run build

Output directory

dist

Environment:

Node 18+

No special variables needed

Deploy → Done.

Your app becomes available at:

https://bingo.hiregear.us

📄 Project Structure
recruiting-bingo/
│
├─ apps/
│ └─ web/ # main React application
│ ├─ src/routes/ # pages (GameRoom, WinnerPage, AboutPage)
│ ├─ src/components/ # shared UI components
│ └─ index.html # where OG tags live
│
├─ packages/
│ ├─ game-logic/ # bingo validation, state modeling
│ └─ types/ # shared TypeScript types
│
└─ README.md # this file

⭐ About the Creator

Hi, I’m Ed — a product nerd, ex-recruiter, and Director of Product at SeekOut.

I spend my career building tools for recruiters and hiring teams.
I love playful, polished, purpose-built apps… and also exploring how AI can actually accelerate real product work.

This project combines all of that:
a tiny, opinionated B2B-ish game for the TA world, built collaboratively with AI.

🔗 Links

GitHub: https://github.com/SomeGuy02312

HireGear (side projects hub): https://hiregear.us

LinkedIn: https://www.linkedin.com

🤝 How This Project Was Built (Human + AI Collaboration)

This app was created through a highly iterative workflow between:

🧠 Ed (human)

Driving product direction

Defining UX and flows

Designing the game mechanics

Setting standards for polish, interactions, animations

Making structural architectural decisions

Implementing, debugging, and shaping the final product

🤖 ChatGPT (AI coding partner)

Writing React, TypeScript, and UI components

Debugging live errors (Vite, JSX, build configs)

Refactoring state management

Designing visual layouts (Bingo board spacing, Winner flow, About page)

Generating icons, animations, and polished UX copy

Helping modernize styling and dark mode support

Drafting PRDs, specs, README content, prompts, and code snippets

This wasn’t “AI-built software.”
It was a product-driven, human-led process, with ChatGPT acting like:

a full-stack assistant

a UI copilot

a teammate who can instantly prototype, rewrite, or fix code

a creative partner in tiny UI flourishes (fireworks, hover states, card spacing)

Together, we built something simple, delightful, and nerdy — fast.

📣 Contributing

PRs, ideas, and issue reports are welcome.
Fork it, remix it, or submit bug fixes and enhancements.

If you build your own themed Bingo version… please share it!

🛡 License

This project uses the Polyform Non-Commercial License.
You can remix, modify, and build upon it — but not for commercial use.

See the LICENSE file for details.

🎆 Final Notes

Recruiting is chaotic, funny, and endlessly human.
This game is a small celebration of that spirit.

If you enjoy it — share it, fork it, or make your own version.

And if your team gets Bingo…
enjoy the fireworks.
