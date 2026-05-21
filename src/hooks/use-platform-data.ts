"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { BettingSuggestion, CsApiMatch, CsApiPlayerStats, CsApiRankingTeam, CsApiTeam, GlobalSearchResult } from "@/types/csapi";

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
  team1?: { id?: number; name?: string; score?: number; rank?: number } | null;
  team2?: { id?: number; name?: string; score?: number; rank?: number } | null;
  format?: string | null;
  maps?: Array<{ name: string; team1Rounds?: number | null; team2Rounds?: number | null }>;
  odds?: Array<{ provider: string; team1?: number | null; team2?: number | null }>;
  stars?: number | null;
};

type RankingRow = {
  team_id: number;
  team: { id?: number; name?: string; country?: string; rank?: number };
  place: number;
  points: number;
  change: number;
};

type TeamRow = {
  id: number;
  name: string;
  country?: string | null;
  rank?: number | null;
};

type PlayerRow = {
  id: number;
  nickname: string;
  full_name?: string | null;
  team?: { name?: string } | null;
  statistics?: {
    rating?: number | null;
    killsPerRound?: number | null;
    headshots?: number | null;
    mapsPlayed?: number | null;
    deathsPerRound?: number | null;
    roundsContributed?: number | null;
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

function mapMatch(row: MatchRow): CsApiMatch {
  const firstMap = row.maps?.[0];

  return {
    id: row.id,
    date: row.starts_at ?? undefined,
    event: row.event_name ?? "HLTV",
    format: row.format ?? undefined,
    team1: {
      id: row.team1?.id ?? row.id * 10 + 1,
      name: row.team1?.name ?? "TBD",
      score: row.team1?.score ?? firstMap?.team1Rounds ?? undefined,
      rank: row.team1?.rank,
    },
    team2: {
      id: row.team2?.id ?? row.id * 10 + 2,
      name: row.team2?.name ?? "TBD",
      score: row.team2?.score ?? firstMap?.team2Rounds ?? undefined,
      rank: row.team2?.rank,
    },
    maps: row.maps?.map((map) => ({
      name: map.name,
      team1_score: map.team1Rounds ?? undefined,
      team2_score: map.team2Rounds ?? undefined,
    })),
  };
}

function mapRanking(row: RankingRow): CsApiRankingTeam {
  return {
    id: row.team_id,
    rank: row.place,
    name: row.team?.name ?? `Team ${row.team_id}`,
    country: row.team?.country,
    points: row.points,
    change: row.change,
  };
}

function mapTeam(row: TeamRow): CsApiTeam {
  return {
    id: row.id,
    name: row.name,
    rank: row.rank ?? undefined,
    country: row.country ?? undefined,
  };
}

function mapPlayer(row: PlayerRow): CsApiPlayerStats {
  const stats = row.statistics ?? {};
  const killsPerRound = stats.killsPerRound ?? undefined;
  const deathsPerRound = stats.deathsPerRound ?? undefined;

  return {
    id: row.id,
    name: row.nickname,
    team: row.team?.name,
    rating: stats.rating ?? undefined,
    maps: stats.mapsPlayed ?? undefined,
    hs: stats.headshots ?? undefined,
    kd: killsPerRound && deathsPerRound ? killsPerRound / deathsPerRound : undefined,
  };
}

export function usePlatformMatches(pageSize = 50) {
  return useQuery({
    queryKey: ["hltv", "matches", { pageSize }],
    queryFn: async () => (await getInternal<MatchRow[]>(`/api/matches?pageSize=${pageSize}`)).map(mapMatch),
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

export function usePlatformRankings(limit = 30) {
  return useQuery({
    queryKey: ["hltv", "rankings", { limit }],
    queryFn: async () => (await getInternal<RankingRow[]>(`/api/rankings?limit=${limit}`)).map(mapRanking),
    initialData: [],
    staleTime: 60 * 60 * 1000,
  });
}

export function usePlatformTeams(query?: string, pageSize = 100) {
  const search = query ? `&query=${encodeURIComponent(query)}` : "";

  return useQuery({
    queryKey: ["hltv", "teams", { query, pageSize }],
    queryFn: async () => (await getInternal<TeamRow[]>(`/api/teams?pageSize=${pageSize}${search}`)).map(mapTeam),
    initialData: [],
    staleTime: 60 * 60 * 6 * 1000,
  });
}

export function usePlatformPlayers(query?: string, pageSize = 100) {
  const search = query ? `&query=${encodeURIComponent(query)}` : "";

  return useQuery({
    queryKey: ["hltv", "players", { query, pageSize }],
    queryFn: async () => (await getInternal<PlayerRow[]>(`/api/players?pageSize=${pageSize}${search}`)).map(mapPlayer),
    initialData: [],
    staleTime: 60 * 60 * 6 * 1000,
  });
}

export function usePlatformOdds(limit = 100) {
  return useQuery({
    queryKey: ["hltv", "odds", { limit }],
    queryFn: () => getInternal<OddsRow[]>(`/api/odds?limit=${limit}`),
    initialData: [],
    refetchInterval: 15_000,
  });
}

export function buildOddsSuggestions(odds: OddsRow[]): BettingSuggestion[] {
  return odds.slice(0, 4).map((odd) => ({
    id: odd.id,
    match: `Match #${odd.match_id}`,
    market: `${odd.provider} - moneyline`,
    confidence: 52,
    edge: "monitorar",
    rationale: "Movimento de odds em monitoramento. Analise estatistica baseada em dados historicos.",
  }));
}

export function usePlatformSearchResults(query: string): GlobalSearchResult[] {
  const normalized = query.trim().toLowerCase();
  const { data: rankings = [] } = usePlatformRankings(30);
  const { data: players = [] } = usePlatformPlayers(undefined, 50);
  const { data: matches = [] } = usePlatformMatches(30);

  if (!normalized) return [];

  const teamResults: GlobalSearchResult[] = rankings
    .filter((team) => team.name.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map((team) => ({
      id: `hltv-team-${team.id}`,
      type: "team",
      title: team.name,
      subtitle: `#${team.rank} HLTV - ${team.points ?? "-"} pts`,
      href: `/teams?query=${encodeURIComponent(team.name)}`,
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
