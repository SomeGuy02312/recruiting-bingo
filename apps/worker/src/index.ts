import type { Env } from "./env";
import { handleRooms } from "./handlers/rooms";
import { handleStats } from "./handlers/stats";
export { RoomDurableObject } from "./room-do";

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname.startsWith("/api/rooms")) {
      return handleRooms(request, env);
    }

    if (pathname === "/api/stats") {
      return handleStats(request, env);
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        await env.STATS_KV.put("last-cron-run", new Date(event.scheduledTime).toISOString());
      })()
    );
  }
};

export default worker;
