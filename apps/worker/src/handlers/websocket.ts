import type { Env } from "../env";

export async function handleWebsocket(_request: Request, _env: Env): Promise<Response> {
  return new Response("WebSocket placeholder", { status: 501 });
}
