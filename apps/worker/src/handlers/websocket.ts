import type { Env } from "../env";

export async function handleWebsocket(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length !== 3 || segments[0] !== "ws" || segments[1] !== "rooms") {
    return new Response("Not Found", { status: 404 });
  }

  const roomId = segments[2];
  const pair = new WebSocketPair();

  const id = env.ROOM_DO.idFromName(roomId);
  const stub = env.ROOM_DO.get(id);
  const response = await stub.fetch("https://room/ws", {
    headers: request.headers,
    webSocket: pair[1]
  });

  if (!response.webSocket || response.status !== 101) {
    return response;
  }

  return new Response(null, {
    status: 101,
    webSocket: pair[0]
  });
}
