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

type RepositoryError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function formatRepositoryError(error: unknown): RepositoryError | null {
  if (!error) return null;
  if (typeof error === "object") {
    const value = error as RepositoryError;
    return {
      code: value.code,
      message: value.message,
      details: value.details,
      hint: value.hint,
    };
  }

  return { message: String(error) };
}

function pageRange(page = 1, pageSize = 25) {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, pageSize);
  const from = (safePage - 1) * safeSize;
  return { from, to: from + safeSize - 1 };
}

function normalizeQueryValue(value: string | null) {
  return value?.trim() || null;
}

async function collectPages<T>(buildPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>, pageSize = 1000) {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await buildPage(from, to);
    if (error) return { data: rows, error };

    const page = data ?? [];
    rows.push(...page);

    if (page.length < pageSize) {
      return { data: rows, error: null };
    }

    from += pageSize;
  }
}

export const hltvRepository = {
  async listMatches({ page, pageSize, status, all }: { page?: number; pageSize?: number; status?: string | null; all?: boolean }) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    if (all) {
      const { data, error } = await collectPages((from, to) => {
        let query = supabase.from("matches").select("*").eq("source", "hltv").order("starts_at", { ascending: false }).range(from, to);
        if (status) query = query.eq("status", status);
        return query;
      });
      if (error) {
        console.error("[repository] listMatches failed", error);
        return [];
      }

      return data;
    }

    let query = supabase.from("matches").select("*").eq("source", "hltv").order("starts_at", { ascending: false });
    if (status) query = query.eq("status", status);
    {
      const { from, to } = pageRange(page, pageSize);
      query = query.range(from, to);
    }

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

  async listTeams({ page, pageSize, query, all }: { page?: number; pageSize?: number; query?: string | null; all?: boolean }) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const search = normalizeQueryValue(query ?? null);

    if (all) {
      const { data, error } = await collectPages((from, to) => {
        let request = supabase.from("teams").select("*").order("rank", { ascending: true, nullsFirst: false }).range(from, to);
        if (search) request = request.ilike("name", `%${search}%`);
        return request;
      });
      if (error) {
        console.error("[repository] listTeams failed", error);
        return [];
      }

      return data;
    }

    let request = supabase.from("teams").select("*").order("rank", { ascending: true, nullsFirst: false });
    if (search) request = request.ilike("name", `%${search}%`);
    {
      const { from, to } = pageRange(page, pageSize);
      request = request.range(from, to);
    }

    const { data, error } = await request;
    if (error) {
      console.error("[repository] listTeams failed", error);
      return [];
    }

    return data ?? [];
  },

  async listPlayers({ page, pageSize, query, all }: { page?: number; pageSize?: number; query?: string | null; all?: boolean }) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const search = normalizeQueryValue(query ?? null);

    if (all) {
      const { data, error } = await collectPages((from, to) => {
        let request = supabase.from("players").select("*").order("nickname", { ascending: true }).range(from, to);
        if (search) request = request.ilike("nickname", `%${search}%`);
        return request;
      });
      if (error) {
        console.error("[repository] listPlayers failed", error);
        return [];
      }

      return data;
    }

    let request = supabase.from("players").select("*").order("nickname", { ascending: true });
    if (search) request = request.ilike("nickname", `%${search}%`);
    {
      const { from, to } = pageRange(page, pageSize);
      request = request.range(from, to);
    }

    const { data, error } = await request;
    if (error) {
      console.error("[repository] listPlayers failed", error);
      return [];
    }

    return data ?? [];
  },

  async listRankings(limit?: number) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    if (!limit) {
      const { data, error } = await collectPages((from, to) =>
        supabase.from("rankings").select("*").eq("provider", "hltv").order("place", { ascending: true }).range(from, to),
      );
      if (error) {
        console.error("[repository] listRankings failed", error);
        return [];
      }

      return data;
    }

    let query = supabase.from("rankings").select("*").eq("provider", "hltv").order("place", { ascending: true });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.error("[repository] listRankings failed", error);
      return [];
    }

    return data ?? [];
  },

  async getTeam(id: number) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase.from("teams").select("*").eq("id", id).maybeSingle();
    if (error) {
      console.error("[repository] getTeam failed", error);
      return null;
    }

    return data;
  },

  async listTeamMatches(teamId: number) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("source", "hltv")
      .order("starts_at", { ascending: false });
    if (error) {
      console.error("[repository] listTeamMatches failed", error);
      return [];
    }

    return (data ?? []).filter((match) => match.team1?.id === teamId || match.team2?.id === teamId);
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

  async replaceMatches(matches: NormalizedMatch[]) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return;

    await supabase.from("matches").delete().neq("id", -1);
    await this.upsertMatches(matches);
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

  async getSyncStatus() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;

    const tables = ["matches", "live_matches", "teams", "players", "rankings", "events", "odds_history"] as const;
    const tableResults = await Promise.all(
      tables.map(async (table) => {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
        return { table, count: error ? null : count ?? 0, error: formatRepositoryError(error) };
      }),
    );
    const counts = Object.fromEntries(tableResults.map((result) => [result.table, result.count]));
    const errors = Object.fromEntries(
      tableResults.filter((result) => result.error).map((result) => [result.table, result.error]),
    );
    const [hltvMatches, hltvRankings, latestHltvMatch, latestRanking] = await Promise.all([
      supabase.from("matches").select("*", { count: "exact", head: true }).eq("source", "hltv"),
      supabase.from("rankings").select("*", { count: "exact", head: true }).eq("provider", "hltv"),
      supabase.from("matches").select("id,starts_at,event_name,updated_at").eq("source", "hltv").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("rankings").select("team_id,place,captured_at").eq("provider", "hltv").order("captured_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    const { data: logs, error } = await supabase
      .from("sync_logs")
      .select("worker,status,provider,records_processed,message,metadata,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[repository] getSyncStatus logs failed", error);
    }

    return {
      counts,
      hltvCounts: {
        matches: hltvMatches.error ? null : hltvMatches.count ?? 0,
        rankings: hltvRankings.error ? null : hltvRankings.count ?? 0,
      },
      errors: {
        ...errors,
        hltvMatches: formatRepositoryError(hltvMatches.error),
        hltvRankings: formatRepositoryError(hltvRankings.error),
        latestHltvMatch: formatRepositoryError(latestHltvMatch.error),
        latestRanking: formatRepositoryError(latestRanking.error),
        syncLogs: formatRepositoryError(error),
      },
      latest: {
        match: latestHltvMatch.error ? null : latestHltvMatch.data,
        ranking: latestRanking.error ? null : latestRanking.data,
      },
      logs: logs ?? [],
    };
  },
};
