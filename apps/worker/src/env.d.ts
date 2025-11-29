/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ROOMS: DurableObjectNamespace;
  STATS_KV: KVNamespace;
  ASSETS: Fetcher;
}
