import type { Env } from "./env";
import { handleRooms } from "./handlers/rooms";
import { handleStats } from "./handlers/stats";
export { RoomDurableObject } from "./room-do";

const ASSET_PREFIXES = ["/assets/"];
const ASSET_PATHS = new Set(["/vite.svg"]);
const STATIC_EXTENSION_REGEX = /\.[a-zA-Z0-9]+$/;

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

    const isAssetRequest =
      ASSET_PATHS.has(pathname) ||
      ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
      STATIC_EXTENSION_REGEX.test(pathname);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return env.ASSETS.fetch(request);
    }

    if (isAssetRequest) {
      return env.ASSETS.fetch(request);
    }

    const indexUrl = new URL("/", request.url);
    const indexRequest = new Request(indexUrl.toString(), {
      method: request.method,
      headers: request.headers
    });
    return env.ASSETS.fetch(indexRequest);
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
