"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type {
  BettingSuggestion,
  GlobalSearchResult,
  PlatformMatch,
  PlatformOdds,
  PlatformPlayer,
  PlatformRankingTeam,
  PlatformTeam,
  PlatformTeamRef,
} from "@/types/platform";

type ApiEnvelope<T> = {
  data: T;
  metadata: {
    source: string;
    generatedAt: string;
    disclaimer: string;
    [key: string]: unknown;
  };
};

type MatchRow = {
  id: number;
  title?: string | null;
  status: string;
  starts_at?: string | null;
  event_name?: string | null;
  team1?: PlatformTeamRef | null;
  team2?: PlatformTeamRef | null;
  format?: string | null;
  maps?: Array<{ name: string; team1Rounds?: number | null; team2Rounds?: number | null }>;
  stars?: number | null;
  source?: string;
};

type RankingRow = {
  team_id: number;
  team: PlatformTeamRef;
  place: number;
  points: number;
  change: number;
  is_new?: boolean;
};

type TeamRow = {
  id: number;
  name: string;
  logo_url?: string | null;
  country?: string | null;
  rank?: number | null;
  players?: PlatformPlayer[];
  ranking_development?: number[];
  raw?: unknown;
};

type PlayerRow = {
  id: number;
  nickname: string;
  full_name?: string | null;
  team?: { name?: string } | null;
  statistics?: {
    rating?: number | null;
    rating1?: number | null;
    rating2?: number | null;
    kd?: number | null;
    headshots?: number | null;
    mapsPlayed?: number | null;
    maps?: number | null;
    rounds?: number | null;
  };
};

type OddsRow = {
  id: string;
  match_id: number;
  provider: string;
  team1?: number | null;
  team2?: number | null;
  captured_at: string;
};

async function getInternal<T>(url: string): Promise<T> {
  const { data } = await axios.get<ApiEnvelope<T>>(url);
  return data.data;
}

function mapMatch(row: MatchRow): PlatformMatch {
  return {
    id: row.id,
    title: row.title ?? null,
    status: row.status,
    startsAt: row.starts_at ?? null,
    event: row.event_name ?? "HLTV",
    format: row.format ?? null,
    team1: row.team1 ?? { id: row.id * 10 + 1, name: "TBD" },
    team2: row.team2 ?? { id: row.id * 10 + 2, name: "TBD" },
    maps: row.maps ?? [],
    stars: row.stars ?? null,
    source: "hltv",
  };
}

function mapRanking(row: RankingRow): PlatformRankingTeam {
  return {
    id: row.team_id,
    rank: row.place,
    name: row.team?.name ?? `Team ${row.team_id}`,
    country: row.team?.country ?? null,
    logoUrl: row.team?.logoUrl ?? null,
    points: row.points,
    change: row.change,
    isNew: row.is_new ?? false,
  };
}

function mapTeam(row: TeamRow): PlatformTeam {
  return {
    id: row.id,
    name: row.name,
    rank: row.rank ?? null,
    country: row.country ?? null,
    logoUrl: row.logo_url ?? null,
    players:
      row.players?.map((player) => ({
        ...player,
        name: player.name ?? (player as unknown as { nickname?: string }).nickname ?? `Player ${player.id}`,
      })) ?? [],
    rankingDevelopment: row.ranking_development ?? [],
    raw: row.raw,
  };
}

function mapPlayer(row: PlayerRow): PlatformPlayer {
  const stats = row.statistics ?? {};

  return {
    id: row.id,
    name: row.nickname,
    fullName: row.full_name ?? null,
    team: row.team?.name ?? null,
    rating: stats.rating2 ?? stats.rating ?? stats.rating1 ?? null,
    kd: stats.kd ?? null,
    hs: stats.headshots ?? null,
    maps: stats.mapsPlayed ?? stats.maps ?? null,
    rounds: stats.rounds ?? null,
  };
}

export function usePlatformMatches(pageSize?: number | "all", status?: string) {
  const params = new URLSearchParams();
  if (pageSize && pageSize !== "all") params.set("pageSize", String(pageSize));
  if (pageSize === "all") params.set("all", "true");
  if (status) params.set("status", status);

  return useQuery({
    queryKey: ["hltv", "matches", { pageSize, status }],
    queryFn: async () => (await getInternal<MatchRow[]>(`/api/matches?${params.toString()}`)).map(mapMatch),
    initialData: [],
  });
}

export function usePlatformLiveMatches() {
  return useQuery({
    queryKey: ["hltv", "live"],
    queryFn: async () => (await getInternal<MatchRow[]>("/api/live")).map(mapMatch),
    initialData: [],
    refetchInterval: 30_000,
  });
}

export function usePlatformRankings(limit?: number | "all") {
  const suffix = limit === "all" ? "?all=true" : limit ? `?limit=${limit}` : "";

  return useQuery({
    queryKey: ["hltv", "rankings", { limit }],
    queryFn: async () => (await getInternal<RankingRow[]>(`/api/rankings${suffix}`)).map(mapRanking),
    initialData: [],
    staleTime: 60 * 60 * 1000,
  });
}

export function usePlatformTeams(query?: string, pageSize?: number | "all") {
  const params = new URLSearchParams();
  if (pageSize && pageSize !== "all") params.set("pageSize", String(pageSize));
  if (pageSize === "all") params.set("all", "true");
  if (query) params.set("query", query);

  return useQuery({
    queryKey: ["hltv", "teams", { query, pageSize }],
    queryFn: async () => (await getInternal<TeamRow[]>(`/api/teams?${params.toString()}`)).map(mapTeam),
    initialData: [],
    staleTime: 60 * 60 * 6 * 1000,
  });
}

export function usePlatformTeam(teamId?: number) {
  return useQuery({
    queryKey: ["hltv", "team", teamId],
    queryFn: async () => mapTeam(await getInternal<TeamRow>(`/api/teams/${teamId}`)),
    enabled: Boolean(teamId),
  });
}

export function usePlatformTeamMatches(teamId?: number) {
  return useQuery({
    queryKey: ["hltv", "team", teamId, "matches"],
    queryFn: async () => (await getInternal<MatchRow[]>(`/api/teams/${teamId}/matches`)).map(mapMatch),
    enabled: Boolean(teamId),
    initialData: [],
  });
}

export function usePlatformPlayers(query?: string, pageSize?: number | "all") {
  const params = new URLSearchParams();
  if (pageSize && pageSize !== "all") params.set("pageSize", String(pageSize));
  if (pageSize === "all") params.set("all", "true");
  if (query) params.set("query", query);

  return useQuery({
    queryKey: ["hltv", "players", { query, pageSize }],
    queryFn: async () => (await getInternal<PlayerRow[]>(`/api/players?${params.toString()}`)).map(mapPlayer),
    initialData: [],
    staleTime: 60 * 60 * 6 * 1000,
  });
}

export function usePlatformOdds(limit = 100) {
  return useQuery({
    queryKey: ["hltv", "odds", { limit }],
    queryFn: async () =>
      (await getInternal<OddsRow[]>(`/api/odds?limit=${limit}`)).map((odd): PlatformOdds => ({
        id: odd.id,
        matchId: odd.match_id,
        provider: odd.provider,
        team1: odd.team1 ?? null,
        team2: odd.team2 ?? null,
        capturedAt: odd.captured_at,
      })),
    initialData: [],
    refetchInterval: 15_000,
  });
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ["hltv", "sync-status"],
    queryFn: () =>
      getInternal<{
        counts: Record<string, number | null>;
        hltvCounts: Record<string, number | null>;
        latest: Record<string, unknown>;
        logs: Array<{
          worker: string;
          status: string;
          records_processed: number;
          message?: string | null;
          created_at: string;
        }>;
      }>("/api/sync/status"),
    initialData: {
      counts: {},
      hltvCounts: {},
      latest: {},
      logs: [],
    },
  });
}

export function buildOddsSuggestions(odds: PlatformOdds[]): BettingSuggestion[] {
  return odds.slice(0, 4).map((odd) => ({
    id: odd.id,
    match: `Match #${odd.matchId}`,
    market: `${odd.provider} - moneyline`,
    confidence: 52,
    edge: "monitorar",
    rationale: "Movimento de odds em monitoramento. Analise estatistica baseada em dados historicos.",
  }));
}

export function usePlatformSearchResults(query: string): GlobalSearchResult[] {
  const normalized = query.trim().toLowerCase();
  const { data: rankings = [] } = usePlatformRankings("all");
  const { data: players = [] } = usePlatformPlayers(undefined, "all");
  const { data: matches = [] } = usePlatformMatches("all");

  if (!normalized) return [];

  const teamResults: GlobalSearchResult[] = rankings
    .filter((team) => team.name.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map((team) => ({
      id: `hltv-team-${team.id}`,
      type: "team",
      title: team.name,
      subtitle: `#${team.rank} HLTV - ${team.points ?? "-"} pts`,
      href: `/teams/${team.id}`,
    }));

  const playerResults: GlobalSearchResult[] = players
    .filter((player) => player.name.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map((player) => ({
      id: `hltv-player-${player.id}`,
      type: "player",
      title: player.name,
      subtitle: `${player.team ?? "Sem time"} - HLTV`,
      href: `/players?query=${encodeURIComponent(player.name)}`,
    }));

  const matchResults: GlobalSearchResult[] = matches
    .filter((match) => `${match.team1.name} ${match.team2.name} ${match.event ?? ""}`.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map((match) => ({
      id: `hltv-match-${match.id}`,
      type: "match",
      title: `${match.team1.name} vs ${match.team2.name}`,
      subtitle: `${match.event ?? "HLTV"} - ${match.format ?? "BO"}`,
      href: `/matches?query=${encodeURIComponent(match.team1.name)}`,
    }));

  return [...teamResults, ...playerResults, ...matchResults].slice(0, 8);
}
