# 🎉 Recruiting Bingo

_A lightweight, real-time, multiplayer bingo game for recruiters, sourcers, hiring teams, and anyone who lives in the madness of talent acquisition._

<p align="center">
  <img src="https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Hosted%20on-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
  <img src="https://img.shields.io/badge/License-Polyform%20Non--Commercial-blue?style=for-the-badge" />
</p>

---

## 📌 Overview

**Recruiting Bingo** is a modern web app built for fun team moments, offsites, training sessions, and live meetings. Create a room in seconds, share a link, and watch everyone sync up in real time as they click squares like:

- “Can we push this to next quarter?”
- “What’s the budget for this role?”
- “We need someone with 10 years of experience in a 3-year-old technology.”

Players get automatic Bingo detection, real-time winner announcements, and fireworks 🔥🎆

No accounts. No logins. No tracking. Just a delightful little game.

**Try it at [https://bingo.hiregear.us](https://bingo.hiregear.us)**

---

## 🚀 Features

- **Real-time multiplayer rooms** — everyone sees the same card instantly.
- **Multiple card libraries** built for TA, sourcing, hiring managers, and more.
- **Custom games** — enter your own 25 custom squares.
- **Winner flow + fireworks** — shared celebrations across all players.
- **Modern UI with dark mode** — crisp, polished, and readable.
- **Open Graph preview integration** for social sharing.

---

## 🧰 Tech Stack

### **Frontend**

- React + TypeScript
- Vite
- Tailwind CSS
- Zustand (or similar) for local state
- A shared logic package for bingo validation

### **Architecture**

- Monorepo structure (`apps/`, `packages/`)
- `apps/web` — main application
- `packages/` — shared state + game logic

**Real-time sync model:**

- Each room has a unique ID
- Clients subscribe on join
- Actions emit small events (mark square, call Bingo)
- Canonical room state updates and re-broadcasts
- UI re-renders from shared snapshot

### **Styling**

- Tailwind `dark:` variants
- Glassy white + dark cards
- Responsive grid layout for the board

### **Build & Deploy**

- Vite build
- Cloudflare Pages hosting
- GitHub Pages support included

---

## 📦 Installation & Local Development

```bash
git clone https://github.com/SomeGuy02312/recruiting-bingo
cd recruiting-bingo
npm install
npm run dev
```

Local dev server: `http://localhost:5173`

---

## 🚀 Deployment (Cloudflare Pages)

1. Create a Cloudflare Pages project
2. Connect your GitHub repo
3. Settings:

   - **Build command:** `npm run build`
   - **Output directory:** `dist`

4. Deploy 🎉

Production URL: **[https://bingo.hiregear.us](https://bingo.hiregear.us)**

---

## 📄 Project Structure

```
recruiting-bingo/
│
├─ apps/
│   └─ web/                # React app
│       ├─ src/routes/     # Pages
│       ├─ src/components/ # UI components
│       └─ index.html      # OG metadata
│
├─ packages/
│   ├─ game-logic/         # Bingo rules + validation
│   └─ types/              # Shared TS types
│
└─ README.md
```

---

## ⭐ About the Creator

**Hi, I’m Ed — a product nerd, ex-recruiter, and Director of Product in TA Tech.**

I build tools for recruiters and hiring teams. I love polished, delightful side projects — especially ones that blend UX, product thinking, and modern development.

This project is part of **HireGear**, a collection of experimental tools for the recruiting world.

### 🔗 Links

- GitHub: [https://github.com/SomeGuy02312](https://github.com/SomeGuy02312)
- HireGear: [https://www.hiregear.us](https://www.hiregear.us)
- LinkedIn: [https://www.linkedin.com/in/epedini/](https://www.linkedin.com/in/epedini/)

---

## 🤝 How This Project Was Built (Human + AI Collaboration)

This app was built through a tight iterative loop between:

### **🧠 Ed (Human)**

- Drove product vision & UX
- Designed game mechanics and flows
- Set polish standards (layout, spacing, animation)
- Debugged issues and integrated code

### **🤖 ChatGPT (AI Coding Partner)**

- Wrote major React + TS components
- Debugged live errors
- Refactored layout and winner flow
- Generated copy, UI patterns, and Tailwind structures
- Produced specs, PRDs, and documentation

This wasn’t “AI-built software.”
It was **human-led product development with AI as a high-speed engineering copilot**.

---

## 📣 Contributing

Contributions welcome! Open an issue or PR.

---

## 🛡 License

Licensed under the **Polyform Non-Commercial License**.

---

## 🎆 Final Notes

Recruiting is chaotic, funny, and endlessly human.

This project is a small celebration of that energy — with fireworks.
