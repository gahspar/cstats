import type { CacheDomain, CachePolicy } from "@/types/hltv";

export const HLTV_CACHE_POLICIES: Record<CacheDomain, CachePolicy> = {
  rankings: { domain: "rankings", ttlSeconds: 60 * 60, staleWhileRevalidateSeconds: 60 * 15 },
  teams: { domain: "teams", ttlSeconds: 60 * 60 * 6, staleWhileRevalidateSeconds: 60 * 60 },
  players: { domain: "players", ttlSeconds: 60 * 60 * 6, staleWhileRevalidateSeconds: 60 * 60 },
  live_matches: { domain: "live_matches", ttlSeconds: 30, staleWhileRevalidateSeconds: 60 },
  odds: { domain: "odds", ttlSeconds: 15, staleWhileRevalidateSeconds: 60 },
  events: { domain: "events", ttlSeconds: 60 * 10, staleWhileRevalidateSeconds: 60 * 5 },
  matches: { domain: "matches", ttlSeconds: 60 * 5, staleWhileRevalidateSeconds: 60 * 3 },
  results: { domain: "results", ttlSeconds: 60 * 10, staleWhileRevalidateSeconds: 60 * 10 },
};

export function getCachePolicy(domain: CacheDomain) {
  return HLTV_CACHE_POLICIES[domain];
}
