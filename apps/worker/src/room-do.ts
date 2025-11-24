import {
  buildCardFromCustomInputs,
  generateRandomCard,
  getDefaultRecruitingLibrary,
  hasBingo,
  type CreateRoomRequest,
  type JoinRoomRequest,
  type MarkCellRequest,
  type PlayerState,
  type RequestBingoRequest,
  type RoomState
} from "@recruiting-bingo/shared";
import type { Env } from "./env";

const STORAGE_KEY = "room";
const CARD_SIZE = 25;
// TODO(v2): Reintroduce WebSockets once local dev is stable.
// For v1 we rely on HTTP polling for simplicity/reliability.

export class RoomDurableObject {
  private state: DurableObjectState;
  private env: Env;
  private roomCache: RoomState | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/create" && request.method === "POST") {
        const body = await this.parseJson<{ roomId: string; payload: CreateRoomRequest }>(request);
        if (!body.roomId) {
          throw new Error("roomId is required to create a room.");
        }
        const result = await this.createRoom(body.payload, body.roomId);
        return this.jsonResponse(result, { status: 201 });
      }

      if (url.pathname === "/get" && request.method === "GET") {
        const room = await this.getRoom();
        if (!room) {
          return this.jsonResponse({ error: "Room not found." }, { status: 404 });
        }
        return this.jsonResponse({ room });
      }

      if (url.pathname === "/join" && request.method === "POST") {
        const body = await this.parseJson<{ payload: JoinRoomRequest }>(request);
        const result = await this.joinRoom(body.payload);
        return this.jsonResponse(result);
      }

      if (url.pathname === "/mark" && request.method === "POST") {
        const body = await this.parseJson<MarkCellRequest>(request);
        const room = await this.markCell(body);
        return this.jsonResponse({ room });
      }

      if (url.pathname === "/bingo" && request.method === "POST") {
        const body = await this.parseJson<RequestBingoRequest>(request);
        const result = await this.requestBingo(body);
        return this.jsonResponse(result);
      }

      return new Response("Not Found", { status: 404 });
    } catch (error) {
      return this.jsonResponse(
        {
          error: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 400 }
      );
    }
  }

  private async parseJson<T>(request: Request): Promise<T> {
    const text = await request.text();
    if (!text) {
      throw new Error("Missing JSON body.");
    }
    return JSON.parse(text) as T;
  }

  private jsonResponse(data: unknown, init: ResponseInit = {}): Response {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init.headers ?? {})
      }
    });
  }

  private createEmptyMarked(): boolean[] {
    return new Array(CARD_SIZE).fill(false);
  }

  private normalizeName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Name is required.");
    }
    return trimmed;
  }

  private generatePlayerId(): string {
    return crypto.randomUUID();
  }

  private findPlayerByName(name: string, players: Record<string, PlayerState>): PlayerState | undefined {
    const normalized = name.toLowerCase();
    return Object.values(players).find((player) => player.name.toLowerCase() === normalized);
  }

  private makeUniquePlayerName(baseName: string, players: Record<string, PlayerState>): string {
    const names = new Set(Object.values(players).map((p) => p.name));
    if (!names.has(baseName)) {
      return baseName;
    }
    let suffix = 2;
    let candidate = `${baseName} (${suffix})`;
    while (names.has(candidate)) {
      suffix += 1;
      candidate = `${baseName} (${suffix})`;
    }
    return candidate;
  }

  private async loadRoom(): Promise<RoomState | null> {
    if (this.roomCache) {
      return this.roomCache;
    }
    const stored = await this.state.storage.get<RoomState>(STORAGE_KEY);
    if (stored) {
      this.roomCache = stored;
      return stored;
    }
    return null;
  }

  private async saveRoom(room: RoomState): Promise<void> {
    this.roomCache = room;
    await this.state.storage.put(STORAGE_KEY, room);
  }

  async createRoom(request: CreateRoomRequest, roomId: string): Promise<{ room: RoomState; playerId: string }> {
    const creatorName = this.normalizeName(request.creatorName);
    const creatorColor = request.creatorColor.trim();
    const library = getDefaultRecruitingLibrary();
    const hasCustomEntries = (request.customEntries ?? []).some(
      (entry) => typeof entry === "string" && entry.trim().length > 0
    );

    const card = hasCustomEntries
      ? buildCardFromCustomInputs(request.customEntries ?? [], library)
      : generateRandomCard(library, CARD_SIZE);

    const now = new Date().toISOString();
    const playerId = this.generatePlayerId();
    const creator: PlayerState = {
      playerId,
      name: creatorName,
      color: creatorColor,
      marked: this.createEmptyMarked(),
      joinedAt: now,
      isHost: true
    };

    const room: RoomState = {
      roomId,
      card,
      createdAt: now,
      lastActivityAt: now,
      endedAt: null,
      settings: {
        stopAtFirstWinner: request.stopAtFirstWinner ?? false
      },
      players: {
        [playerId]: creator
      },
      winners: []
    };

    await this.saveRoom(room);
    return { room, playerId };
  }

  async getRoom(): Promise<RoomState | null> {
    return this.loadRoom();
  }

  async joinRoom(request: JoinRoomRequest): Promise<{ room: RoomState; playerId: string }> {
    const room = await this.loadRoom();
    if (!room) {
      throw new Error("Room not found.");
    }
    if (room.endedAt) {
      throw new Error("Room has already ended.");
    }

    const name = this.normalizeName(request.name);
    const color = request.color.trim();
    const now = new Date().toISOString();
    const existingPlayer = this.findPlayerByName(name, room.players);

    if (existingPlayer) {
      if (request.rejoin) {
        room.lastActivityAt = now;
        await this.saveRoom(room);
        return { room, playerId: existingPlayer.playerId };
      }
    }

    const playerId = this.generatePlayerId();
    const playerName = existingPlayer && !request.rejoin ? this.makeUniquePlayerName(name, room.players) : name;

    const newPlayer: PlayerState = {
      playerId,
      name: playerName,
      color,
      marked: this.createEmptyMarked(),
      joinedAt: now,
      isHost: false
    };

    room.players[playerId] = newPlayer;
    room.lastActivityAt = now;

    await this.saveRoom(room);
    return { room, playerId };
  }

  async markCell(request: MarkCellRequest): Promise<RoomState> {
    const room = await this.loadRoom();
    if (!room) {
      throw new Error("Room not found.");
    }
    if (room.endedAt) {
      throw new Error("Room has already ended.");
    }

    const player = room.players[request.playerId];
    if (!player) {
      throw new Error("Player not found.");
    }

    if (request.index < 0 || request.index >= CARD_SIZE) {
      throw new Error("Cell index out of range.");
    }

    player.marked[request.index] = request.value;
    room.lastActivityAt = new Date().toISOString();
    await this.saveRoom(room);
    return room;
  }

  async requestBingo(
    request: RequestBingoRequest
  ): Promise<{ room: RoomState; winnerConfirmed: boolean; winnerIndex?: number }> {
    const room = await this.loadRoom();
    if (!room) {
      throw new Error("Room not found.");
    }

    const player = room.players[request.playerId];
    if (!player) {
      throw new Error("Player not found.");
    }

    const hasWinningBoard = hasBingo(player.marked);
    if (!hasWinningBoard) {
      return { room, winnerConfirmed: false };
    }

    let winnerIndex = room.winners.indexOf(player.playerId);
    if (winnerIndex === -1) {
      room.winners.push(player.playerId);
      winnerIndex = room.winners.length - 1;
    }

    if (room.settings.stopAtFirstWinner && winnerIndex === 0 && !room.endedAt) {
      room.endedAt = new Date().toISOString();
    }

    room.lastActivityAt = new Date().toISOString();
    await this.saveRoom(room);

    return { room, winnerConfirmed: true, winnerIndex };
  }
}
