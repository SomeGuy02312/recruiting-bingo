/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ROOM_DO: DurableObjectNamespace;
  STATS_KV: KVNamespace;
}
