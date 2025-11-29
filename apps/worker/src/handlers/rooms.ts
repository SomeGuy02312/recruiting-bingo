import {
  type CreateRoomRequest,
  type CreateRoomResponse,
  type GetRoomResponse,
  type JoinRoomRequest,
  type JoinRoomResponse,
  type MarkCellRequest,
  type MarkCellResponse,
  type RequestBingoRequest,
  type RequestBingoResponse
} from "@recruiting-bingo/shared";
import type { Env } from "../env";

const JSON_HEADERS = { "content-type": "application/json" };

const jsonResponse = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...init.headers
    }
  });

async function parseJson<T>(request: Request): Promise<T> {
  const text = await request.text();
  if (!text) {
    throw new Error("Request body required.");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

const createRoomId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

async function callRoomDurableObject(env: Env, roomId: string, path: string, init?: RequestInit) {
  const id = env.ROOMS.idFromName(roomId);
  const stub = env.ROOMS.get(id);
  const target = new URL(`https://room${path}`);
  return stub.fetch(
    new Request(target.toString(), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {})
      }
    })
  );
}

export async function handleRooms(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    if (segments[0] !== "api" || segments[1] !== "rooms") {
      return jsonResponse({ error: "Not Found" }, { status: 404 });
    }

    if (segments.length === 2 && request.method === "POST") {
      const payload = await parseJson<CreateRoomRequest>(request);
      const roomId = createRoomId();
      const response = await callRoomDurableObject(env, roomId, "/create", {
        method: "POST",
        body: JSON.stringify({ roomId, payload })
      });
      if (!response.ok) {
        return response;
      }
      const data = (await response.json()) as CreateRoomResponse;
      return jsonResponse(data);
    }

    const roomId = segments[2];
    if (!roomId) {
      return jsonResponse({ error: "Missing roomId." }, { status: 400 });
    }

    if (segments.length === 3 && request.method === "GET") {
      const response = await callRoomDurableObject(env, roomId, "/get", { method: "GET" });
      if (response.status === 404) {
        return response;
      }
      if (!response.ok) {
        return response;
      }
      const data = (await response.json()) as GetRoomResponse;
      return jsonResponse(data);
    }

    if (segments.length === 4 && segments[3] === "join" && request.method === "POST") {
      const payload = await parseJson<JoinRoomRequest>(request);
      const response = await callRoomDurableObject(env, roomId, "/join", {
        method: "POST",
        body: JSON.stringify({ payload })
      });
      if (!response.ok) {
        return response;
      }
      const data = (await response.json()) as JoinRoomResponse;
      return jsonResponse(data);
    }

    if (segments.length === 4 && segments[3] === "mark" && request.method === "POST") {
      const payload = await parseJson<MarkCellRequest>(request);
      const response = await callRoomDurableObject(env, roomId, "/mark", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        return response;
      }
      const data = (await response.json()) as MarkCellResponse;
      return jsonResponse(data);
    }

    if (segments.length === 4 && segments[3] === "bingo" && request.method === "POST") {
      const payload = await parseJson<RequestBingoRequest>(request);
      const response = await callRoomDurableObject(env, roomId, "/bingo", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        return response;
      }
      const data = (await response.json()) as RequestBingoResponse;
      return jsonResponse(data);
    }

    return jsonResponse({ error: "Not Found" }, { status: 404 });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}
