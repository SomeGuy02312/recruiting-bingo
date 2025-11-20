import type { Env } from "../env";

export async function handleStats(_request: Request, env: Env): Promise<Response> {
  const placeholder = await env.STATS_KV.get("stats-placeholder");
  return new Response(
    JSON.stringify({ message: "Stats handler placeholder", value: placeholder ?? null }),
    {
      headers: {
        "content-type": "application/json"
      }
    }
  );
}
