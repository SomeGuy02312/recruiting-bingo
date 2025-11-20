import type { Env } from "./env";

export class RoomDurableObject {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    return new Response(`RoomDurableObject placeholder for ${url.pathname}`);
  }
}
