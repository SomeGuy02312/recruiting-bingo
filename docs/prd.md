# Recruiting Bingo – Product Requirements & Technical Architecture (v1)

**URL:** [https://bingo.hiregear.us](https://bingo.hiregear.us)
**Document Purpose:** Define V1 functional + technical spec for implementation.
**Last Updated:** v1.1 (includes 1‑player games + LI share flow updates)

---

# 1. Product Summary

Recruiting Bingo is a polished, web‑based, multiplayer (or solo) bingo game themed around the everyday life of recruiters. One user creates a room; they and others join via an unguessable URL. Everyone shares the same bingo card and marks squares as real‑world events happen. The game includes delightful UI touches, real‑time sync, leaderboards, and strong social sharing—especially LinkedIn.

Optimized for:

* Desktop browser play (primary)
* Excellent mobile experience (secondary)
* Zero friction: no signup, no email, no auth

Runs on **Cloudflare free tier**: Cloudflare Pages + Workers + Durable Objects + KV.

---

# 2. Goals & Non‑Goals

### **Goals**

* Provide a delightful, funny, professional‑feeling bingo game for recruiters & TA teams.
* Enable 1–24 players per room, including **solo play**.
* Support real‑time multiplayer via WebSockets with ~1–2 sec tolerance.
* Generate personalized, shareable winner images.
* Provide a top‑tier LinkedIn sharing experience that drives new players.
* Keep infrastructure extremely simple (Cloudflare only, free tier only).

### **Non‑Goals**

* No chat, no global lobbies, no account system.
* No moderation tools.
* No public room directory.
* No multi‑language support (English only).

---

# 3. Personas

### **1. Team Lead / Meeting Host**

Wants something fun, shareable, and immediate for team sessions.

### **2. Individual Recruiter / Player**

Engages casually; wants the experience to feel fun, clever, and frictionless.

### **3. Curious TA / HR Tech Onlooker**

Arrives via LinkedIn post → wants to try it themselves.

---

# 4. User Flows

## **4.1 Create Room**

* Visit landing page.
* Click **Create a Game**.
* Enter name + choose color.
* Optional: toggle **Custom Card (25 squares)**.
* Optional: choose behavior (Stop at first winner / Continue).
* Confirm → Worker creates the room → redirect to `/r/{roomId}`.
* Host can share URL.
* Supports **solo** play (creator is the only player).

## **4.2 Join Room**

* Click or type room URL.
* Enter name (must be unique per room) + color.
* If the chosen name **already exists in the room**:

  * Prompt: **“Do you want to rejoin as this user, or create a new player?”**
  * **Rejoin:** attach this browser session to the existing player record (same board, **same color**), and disconnect any older session using that player.
  * **Create New:** auto-suggest a new variant (e.g., “Ed P. (2)”) and create a fresh player.
* Join and see:

  * Bingo card.
  * Leaderboard.
  * Option to view other players’ cards.

## **4.3 Play Game**

* Tap/click squares to mark/unmark.
* Dabbing uses user’s color + animated ink effect.
* Leaderboard updates as players progress.
* All state mirrored between client + DO.

## **4.4 Bingo & Winning**

* Client detects bingo.
* Sends bingo claim.
* Server validates against stored card + marked array.
* Winner gets:

  * Full-screen celebration.
  * Time to win.
  * **Winning line(s) visually highlighted** (rows/columns/diagonals that completed).
  * **Download personalized card image**.
  * **Share on LinkedIn**.
* Others see announcement plus highlighted winning line(s) on that player’s card when inspecting it.
* If game behavior is **Stop at first winner**:

  * Host can end game; once ended, no further marking is allowed, but players can still inspect cards.
* If behavior is **Continue**:

  * Additional winners can be recorded and ranked.

## **4.5 Sharing Flow (Important)**

* Winner uses **Share on LinkedIn** button.
* It opens LinkedIn’s share-offsite dialog with URL:

  * `/w/{roomId}/{playerId}`
* Clicking this link on LinkedIn brings users to the **landing page**, not the room:

  * Winner page content is used primarily for OG preview & in-app experience.
  * If the winner page is expired, it **immediately redirects** to the landing page.
  * Landing page includes a clear CTA: **“Start your own game”**.

## **4.6 Room Expiry**

* After **7 days** of inactivity, room enters `expired` state.
* Visiting `/r/{roomId}` for an expired room shows a friendly “This game has ended” message with **Start a new game**.
* Visiting `/w/{roomId}/{playerId}` for an expired winner page immediately redirects to the landing page.

---

# 5. Functional Requirements

## **5.1 Rooms**

* Up to 24 concurrent players.
* Unique display names enforced.
* Solo play is valid and supported.
* Rooms have:

  * Room ID
  * Created timestamp
  * Last activity timestamp
  * Settings
  * Card definition (25 items)
  * Player list + board states
  * Winners list

## **5.2 Card Generation**

* Default: Random 25-item draw from static library.
* Optional: Creator supplies exactly **25 custom entries** via a 25-field UI (grid or list).
* While entering custom entries, provide a control to **“Fill in the rest for me”** that auto-fills any remaining empty slots from the default library.
* Card layout shared by all players.
* Card entries:

  * Plain text with optional emojis allowed.
  * Length constrained so they visually fit the square; UI should enforce a reasonable max length and auto-wrap.
* Marking a cell:

  * Toggles on/off.
  * Updates DO.
  * Broadcast to all.

## **5.3 Bingo Rules**

* Standard 5×5 bingo (no free center unless we choose to include it).
* Valid lines: 5 rows, 5 columns, 2 diagonals.
* Multiple winners allowed if game continues.

## **5.4 Leaderboard**

* Per‑room only.
* Shows:

  * Name
  * Color
  * Marked count
  * Bingo count / winner rank
* Tap player → View their card (read‑only).

## **5.5 Sharing & Social**

* Winner page at `/w/{roomId}/{playerId}` displays:

  * Their name
  * Time to win
  * Their marked card
  * CTA: **Start your own game** → landing page
* Personalized image generation (client-side via html2canvas).
* LinkedIn share button:

  * Opens share dialog with winner URL.
* Clicking a shared LI post always routes users to the **landing page**.

## **5.6 Landing Page**

* Clear value proposition.
* Prominent “Create a game”.
* Showcase sample card.
* Show stats: **Games created in last 24 hours**.
* SEO optimized.

## **5.7 Persistence & Cleanup**

* Room DO stores all room data.
* Player name uniqueness enforced on join.
* Room expires after 7 days without activity.
* Expired rooms reject operations and show “game ended”.
* Stats stored in KV (rooms created in last 24h).

---

# 6. Non‑Functional Requirements

* **Primary platform:** desktop browser
* **Secondary:** mobile browser (must feel GREAT)
* **Performance:** small, fast bundle; minimal deps
* **Availability:** small‑scale, casual usage
* **Accessibility:** ARIA, keyboard nav, contrast
* **Privacy:** no auth, no PII
* **Cost:** Cloudflare free tier only

---

# 7. Technical Architecture

## **7.1 Frontend**

* **React + TypeScript + Vite**
* Hosted on **Cloudflare Pages**
* Responsibilities:

  * UI & animations
  * WebSocket client
  * Bingo detection
  * Rendering cards & winner page
  * LinkedIn sharing
  * Image generation via html2canvas

## **7.2 Backend**

* **Cloudflare Workers** (main API + WebSocket upgrade)
* **Durable Objects** (one per room)
* **Cloudflare KV** (stats only)
* **Cron Triggers** (pruning 24h stats entries)

## **7.3 Key DO Responsibilities**

* Store room state
* Handle WebSocket connections
* Process join/leave
* Enforce uniqueness of names
* Handle mark/unmark events
* Validate bingo claims
* Broadcast updates
* Enforce 7‑day TTL

## **7.4 HTTP API**

* `POST /api/rooms` → create room
* `POST /api/rooms/:roomId/join` → join room
* `GET /api/rooms/:roomId` → load snapshot
* `POST /api/rooms/:roomId/end` → end game
* `GET /api/stats` → landing page stats

## **7.5 WebSocket Messages**

Client → Server:

* `MARK_CELL { playerId, index, value }`
* `REQUEST_BINGO { playerId }`
* `PING`

Server → Client:

* `STATE_UPDATE` (snapshot or diff)
* `PLAYER_JOINED`
* `PLAYER_LEFT`
* `BINGO_CONFIRMED`
* `GAME_ENDED`

---

# 8. Data Models

## **RoomState**

```ts
{
  roomId: string,
  createdAt: number,
  lastActivityAt: number,
  settings: {
    stopAtFirstWinner: boolean,
    customCard?: string[]
  },
  card: string[25],
  players: Record<string, PlayerState>,
  winners: string[],
  endedAt?: number
}
```

## **PlayerState**

```ts
{
  playerId: string,
  name: string,
  color: string,
  joinedAt: number,
  lastSeenAt: number,
  marked: boolean[25],
  isHost: boolean
}
```

---

# 9. Open Questions / Backlog

*All V1 identity decisions are now final.*

* Winner pages **should expire** after room expiry and redirect to landing page.
* **No free center cell**.
* **No rejoin codes** — name uniqueness per room is sufficient.

---
