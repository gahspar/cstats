import type { CacheDomain } from "@/types/hltv";
import { getCachePolicy } from "@/services/hltv";
import { createSupabaseServerClient } from "./supabase-server";

export interface CacheEnvelope<T> {
  key: string;
  domain: CacheDomain;
  payload: T;
  expiresAt: string;
  staleAt: string;
}

export const cacheRepository = {
  async get<T>(key: string): Promise<CacheEnvelope<T> | null> {
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase.from("hltv_cache").select("*").eq("cache_key", key).maybeSingle();
    if (error || !data) {
      if (error) console.error("[cache] read failed", { key, error });
      return null;
    }

    return {
      key: data.cache_key,
      domain: data.domain,
      payload: data.payload as T,
      expiresAt: data.expires_at,
      staleAt: data.stale_at,
    };
  },

  async set<T>(key: string, domain: CacheDomain, payload: T) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return;

    const policy = getCachePolicy(domain);
    const now = Date.now();
    const expiresAt = new Date(now + policy.ttlSeconds * 1000).toISOString();
    const staleAt = new Date(now + (policy.ttlSeconds + policy.staleWhileRevalidateSeconds) * 1000).toISOString();

    const { error } = await supabase.from("hltv_cache").upsert({
      cache_key: key,
      domain,
      payload,
      expires_at: expiresAt,
      stale_at: staleAt,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[cache] write failed", { key, domain, error });
    }
  },
};
