import {
  buildCardFromCustomInputs,
  generateRandomCard,
  getDefaultRecruitingLibrary,
  getWinningLines,
  hasBingo,
  type ClientMessage,
  type CreateRoomRequest,
  type JoinRoomRequest,
  type PlayerState,
  type RoomState,
  type ServerMessage
} from "@recruiting-bingo/shared";
import type { Env } from "./env";
import type { MessageEvent } from "@cloudflare/workers-types";

const STORAGE_KEY = "room";
const CARD_SIZE = 25;
const textDecoder = new TextDecoder();

export class RoomDurableObject {
  private state: DurableObjectState;
  private env: Env;
  private roomCache: RoomState | null = null;
  private sockets: Set<WebSocket> = new Set();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/ws") {
        return this.handleWebSocketUpgrade(request);
      }

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

  private handleWebSocketUpgrade(request: Request): Response {
    const webSocket = request.webSocket;
    if (!webSocket) {
      return new Response("Expected WebSocket", { status: 426 });
    }

    webSocket.accept();
    this.sockets.add(webSocket);

    webSocket.addEventListener("message", (event) => {
      void this.handleSocketMessage(webSocket, event).catch((error) => {
        this.sendToSocket(webSocket, {
          type: "ERROR",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      });
    });

    const cleanup = () => {
      this.sockets.delete(webSocket);
    };

    webSocket.addEventListener("close", cleanup);
    webSocket.addEventListener("error", cleanup);

    void this.loadRoom().then((room) => {
      if (room) {
        this.sendToSocket(webSocket, {
          type: "STATE_UPDATE",
          state: room
        });
      }
    });

    return new Response(null, { status: 101, webSocket });
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

  private async handleSocketMessage(socket: WebSocket, event: MessageEvent): Promise<void> {
    const raw =
      typeof event.data === "string"
        ? event.data
        : event.data instanceof ArrayBuffer
        ? textDecoder.decode(event.data)
        : null;

    if (!raw) {
      this.sendToSocket(socket, { type: "ERROR", message: "Unsupported message payload." });
      return;
    }

    let message: ClientMessage;
    try {
      message = JSON.parse(raw) as ClientMessage;
    } catch {
      this.sendToSocket(socket, { type: "ERROR", message: "Invalid message JSON." });
      return;
    }

    switch (message.type) {
      case "MARK_CELL":
        await this.handleMarkCell(message);
        break;
      case "REQUEST_BINGO":
        await this.handleRequestBingo(socket, message);
        break;
      case "PING":
        await this.handlePing(socket);
        break;
      default:
        this.sendToSocket(socket, { type: "ERROR", message: "Unknown message type." });
        break;
    }
  }

  private async handleMarkCell(message: Extract<ClientMessage, { type: "MARK_CELL" }>): Promise<void> {
    const room = await this.loadRoom();
    if (!room) {
      throw new Error("Room not initialized.");
    }

    const player = room.players[message.playerId];
    if (!player) {
      throw new Error("Player not found.");
    }

    if (message.index < 0 || message.index >= CARD_SIZE) {
      throw new Error("Cell index out of range.");
    }

    player.marked[message.index] = message.value;
    room.lastActivityAt = new Date().toISOString();
    await this.saveRoom(room);

    this.broadcast({
      type: "STATE_UPDATE",
      state: room
    });
  }

  private async handleRequestBingo(
    socket: WebSocket,
    message: Extract<ClientMessage, { type: "REQUEST_BINGO" }>
  ): Promise<void> {
    const room = await this.loadRoom();
    if (!room) {
      throw new Error("Room not initialized.");
    }

    const player = room.players[message.playerId];
    if (!player) {
      throw new Error("Player not found.");
    }

    const winningLines = getWinningLines(player.marked);
    if (!hasBingo(player.marked) || winningLines.length === 0) {
      this.sendToSocket(socket, {
        type: "ERROR",
        message: "No bingo detected for this player."
      });
      return;
    }

    let winnerIndex = room.winners.indexOf(player.playerId);
    if (winnerIndex === -1) {
      room.winners.push(player.playerId);
      winnerIndex = room.winners.length - 1;
    }

    room.lastActivityAt = new Date().toISOString();
    await this.saveRoom(room);

    this.broadcast({
      type: "BINGO_CONFIRMED",
      playerId: player.playerId,
      winnerIndex,
      state: room
    });
  }

  private async handlePing(socket: WebSocket): Promise<void> {
    const room = await this.loadRoom();
    if (!room) {
      return;
    }
    this.sendToSocket(socket, {
      type: "STATE_UPDATE",
      state: room
    });
  }

  private sendToSocket(socket: WebSocket, message: ServerMessage): void {
    try {
      socket.send(JSON.stringify(message));
    } catch {
      this.sockets.delete(socket);
      try {
        socket.close(1011, "Connection error");
      } catch {
        // ignore
      }
    }
  }

  private broadcast(message: ServerMessage): void {
    const payload = JSON.stringify(message);
    for (const socket of this.sockets) {
      try {
        socket.send(payload);
      } catch {
        this.sockets.delete(socket);
        try {
          socket.close(1011, "Broadcast failed");
        } catch {
          // ignore
        }
      }
    }
  }
}
