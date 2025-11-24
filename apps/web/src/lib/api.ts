import type {
  CreateRoomRequest,
  CreateRoomResponse,
  GetRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  MarkCellRequest,
  MarkCellResponse,
  RequestBingoRequest,
  RequestBingoResponse
} from "@recruiting-bingo/shared";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function createRoom(payload: CreateRoomRequest): Promise<CreateRoomResponse> {
  const response = await fetch("/api/rooms", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse<CreateRoomResponse>(response);
}

export async function getRoom(roomId: string): Promise<GetRoomResponse> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, {
    method: "GET",
    credentials: "same-origin"
  });

  return handleResponse<GetRoomResponse>(response);
}

export async function joinRoom(roomId: string, payload: JoinRoomRequest): Promise<JoinRoomResponse> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/join`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse<JoinRoomResponse>(response);
}

export async function markCell(roomId: string, payload: MarkCellRequest): Promise<MarkCellResponse> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/mark`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse<MarkCellResponse>(response);
}

export async function requestBingo(
  roomId: string,
  payload: RequestBingoRequest
): Promise<RequestBingoResponse> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/bingo`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse<RequestBingoResponse>(response);
}
