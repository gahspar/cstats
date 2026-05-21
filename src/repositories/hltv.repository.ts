import type {
  NormalizedEvent,
  NormalizedMatch,
  NormalizedOdd,
  NormalizedPlayer,
  NormalizedRankingEntry,
  NormalizedTeam,
  SyncLogEntry,
} from "@/types/hltv";
import { createSupabaseServerClient } from "./supabase-server";

function pageRange(page = 1, pageSize = 25) {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(Math.max(1, pageSize), 100);
  const from = (safePage - 1) * safeSize;
  return { from, to: from + safeSize - 1 };
}

function normalizeQueryValue(value: string | null) {
  return value?.trim() || null;
}

export const hltvRepository = {
  async listMatches({ page, pageSize, status }: { page?: number; pageSize?: number; status?: string | null }) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const { from, to } = pageRange(page, pageSize);
    let query = supabase.from("matches").select("*").order("starts_at", { ascending: false }).range(from, to);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      console.error("[repository] listMatches failed", error);
      return [];
    }

    return data ?? [];
  },

  async listLiveMatches() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase.from("live_matches").select("*").order("starts_at", { ascending: true });
    if (error) {
      console.error("[repository] listLiveMatches failed", error);
      return [];
    }

    return data ?? [];
  },

  async listTeams({ page, pageSize, query }: { page?: number; pageSize?: number; query?: string | null }) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const { from, to } = pageRange(page, pageSize);
    let request = supabase.from("teams").select("*").order("rank", { ascending: true, nullsFirst: false }).range(from, to);
    const search = normalizeQueryValue(query ?? null);
    if (search) request = request.ilike("name", `%${search}%`);

    const { data, error } = await request;
    if (error) {
      console.error("[repository] listTeams failed", error);
      return [];
    }

    return data ?? [];
  },

  async listPlayers({ page, pageSize, query }: { page?: number; pageSize?: number; query?: string | null }) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const { from, to } = pageRange(page, pageSize);
    let request = supabase.from("players").select("*").order("nickname", { ascending: true }).range(from, to);
    const search = normalizeQueryValue(query ?? null);
    if (search) request = request.ilike("nickname", `%${search}%`);

    const { data, error } = await request;
    if (error) {
      console.error("[repository] listPlayers failed", error);
      return [];
    }

    return data ?? [];
  },

  async listRankings(limit = 30) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase.from("rankings").select("*").order("place", { ascending: true }).limit(limit);
    if (error) {
      console.error("[repository] listRankings failed", error);
      return [];
    }

    return data ?? [];
  },

  async listEvents(limit = 40) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: true }).limit(limit);
    if (error) {
      console.error("[repository] listEvents failed", error);
      return [];
    }

    return data ?? [];
  },

  async listOdds(limit = 100) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("odds_history")
      .select("*")
      .order("captured_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[repository] listOdds failed", error);
      return [];
    }

    return data ?? [];
  },

  async upsertMatches(matches: NormalizedMatch[]) {
    const supabase = createSupabaseServerClient();
    if (!supabase || matches.length === 0) return;

    const rows = matches.map((match) => ({
      id: match.id,
      title: match.title,
      status: match.status,
      starts_at: match.startsAt,
      event_id: match.event?.id ?? null,
      event_name: match.event?.name ?? null,
      team1: match.team1 ?? null,
      team2: match.team2 ?? null,
      format: match.format,
      maps: match.maps,
      odds: match.odds,
      stars: match.stars ?? null,
      source: match.source,
      raw: match.raw,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("matches").upsert(rows);
    if (error) console.error("[repository] upsertMatches failed", error);
  },

  async replaceLiveMatches(matches: NormalizedMatch[]) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return;

    await supabase.from("live_matches").delete().neq("id", -1);
    if (matches.length === 0) return;

    const rows = matches.map((match) => ({
      id: match.id,
      title: match.title,
      status: match.status,
      starts_at: match.startsAt,
      event_name: match.event?.name ?? null,
      team1: match.team1 ?? null,
      team2: match.team2 ?? null,
      format: match.format,
      maps: match.maps,
      odds: match.odds,
      raw: match.raw,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("live_matches").upsert(rows);
    if (error) console.error("[repository] replaceLiveMatches failed", error);
  },

  async upsertTeams(teams: NormalizedTeam[]) {
    const supabase = createSupabaseServerClient();
    if (!supabase || teams.length === 0) return;

    const rows = teams.map((team) => ({
      id: team.id,
      name: team.name,
      logo_url: team.logoUrl ?? null,
      country: team.country ?? null,
      rank: team.rank ?? null,
      players: team.players,
      ranking_development: team.rankingDevelopment,
      social: team.social ?? {},
      raw: team.raw,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("teams").upsert(rows);
    if (error) console.error("[repository] upsertTeams failed", error);
  },

  async upsertPlayers(players: NormalizedPlayer[]) {
    const supabase = createSupabaseServerClient();
    if (!supabase || players.length === 0) return;

    const rows = players.map((player) => ({
      id: player.id,
      nickname: player.nickname,
      full_name: player.name ?? null,
      image_url: player.imageUrl ?? null,
      age: player.age ?? null,
      country: player.country ?? null,
      team: player.team ?? null,
      statistics: player.statistics ?? {},
      achievements: player.achievements ?? [],
      raw: player.raw,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("players").upsert(rows);
    if (error) console.error("[repository] upsertPlayers failed", error);
  },

  async replaceRankings(rankings: NormalizedRankingEntry[]) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return;

    await supabase.from("rankings").delete().neq("team_id", -1);
    if (rankings.length === 0) return;

    const rows = rankings.map((entry) => ({
      team_id: entry.team.id,
      team: entry.team,
      place: entry.place,
      points: entry.points,
      change: entry.change,
      is_new: entry.isNew,
      provider: entry.provider,
      raw: entry.raw,
      captured_at: entry.capturedAt,
    }));

    const { error } = await supabase.from("rankings").insert(rows);
    if (error) console.error("[repository] replaceRankings failed", error);
  },

  async upsertEvents(events: NormalizedEvent[]) {
    const supabase = createSupabaseServerClient();
    if (!supabase || events.length === 0) return;

    const rows = events.map((event) => ({
      id: event.id,
      name: event.name,
      starts_at: event.startsAt,
      ends_at: event.endsAt,
      location: event.location,
      country: event.country,
      prize_pool: event.prizePool,
      number_of_teams: event.numberOfTeams,
      featured: event.featured ?? false,
      provider: event.provider,
      raw: event.raw,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("events").upsert(rows);
    if (error) console.error("[repository] upsertEvents failed", error);
  },

  async insertOdds(matchId: number, odds: NormalizedOdd[]) {
    const supabase = createSupabaseServerClient();
    if (!supabase || odds.length === 0) return;

    const rows = odds.map((odd) => ({
      match_id: matchId,
      provider: odd.provider,
      team1: odd.team1,
      team2: odd.team2,
      captured_at: odd.capturedAt,
    }));

    const { error } = await supabase.from("odds_history").insert(rows);
    if (error) console.error("[repository] insertOdds failed", error);
  },

  async insertSyncLog(log: SyncLogEntry) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return;

    const { error } = await supabase.from("sync_logs").insert({
      worker: log.worker,
      status: log.status,
      provider: log.provider,
      records_processed: log.recordsProcessed ?? 0,
      message: log.message ?? null,
      metadata: log.metadata ?? {},
    });

    if (error) console.error("[repository] insertSyncLog failed", error);
  },
};
