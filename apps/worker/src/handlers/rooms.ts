import type { Env } from "../env";

export async function handleRooms(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  return new Response(
    JSON.stringify({ message: `Rooms handler placeholder for ${pathname}` }),
    {
      headers: {
        "content-type": "application/json"
      }
    }
  );
}
