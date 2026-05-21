"use client";

import { useQuery } from "@tanstack/react-query";
import { csapiService } from "@/lib/api/csapi-service";
import {
  fallbackCounts,
  fallbackMatches,
  fallbackPlayers,
  fallbackRankings,
} from "@/lib/api/mock-data";
import type { GlobalSearchResult } from "@/types/csapi";

export function useLatestMatches() {
  return useQuery({
    queryKey: ["csapi", "matches", "latest"],
    queryFn: csapiService.getLatestMatches,
    initialData: fallbackMatches,
  });
}

export function useMatches(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ["csapi", "matches", { limit, offset }],
    queryFn: () => csapiService.getMatches(limit, offset),
    initialData: fallbackMatches,
  });
}

export function useMatch(matchId?: number) {
  return useQuery({
    queryKey: ["csapi", "matches", matchId],
    queryFn: () => csapiService.getMatch(matchId as number),
    enabled: Boolean(matchId),
  });
}

export function useMatchStats(matchId?: number, byMap = false) {
  return useQuery({
    queryKey: ["csapi", "matches", matchId, "stats", { byMap }],
    queryFn: () => csapiService.getMatchStats(matchId as number, byMap),
    enabled: Boolean(matchId),
  });
}

export function useRankings() {
  return useQuery({
    queryKey: ["csapi", "rankings"],
    queryFn: csapiService.getRankings,
    initialData: fallbackRankings,
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ["csapi", "teams"],
    queryFn: csapiService.getTeams,
    initialData: fallbackRankings,
  });
}

export function useTeam(teamId?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["csapi", "teams", teamId, { startDate, endDate }],
    queryFn: () => csapiService.getTeam(teamId as number, startDate, endDate),
    enabled: Boolean(teamId),
  });
}

export function useTeamMatchHistory(teamId?: number, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["csapi", "teams", teamId, "matchhistory", { limit, offset }],
    queryFn: () => csapiService.getTeamMatchHistory(teamId as number, limit, offset),
    enabled: Boolean(teamId),
    initialData: [],
  });
}

export function useTeamStats(teamId?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["csapi", "teams", teamId, "stats", { startDate, endDate }],
    queryFn: () => csapiService.getTeamStats(teamId as number, startDate, endDate),
    enabled: Boolean(teamId),
    initialData: [],
  });
}

export function usePlayerStats() {
  return useQuery({
    queryKey: ["csapi", "players", "stats"],
    queryFn: csapiService.getPlayerStats,
    initialData: fallbackPlayers,
  });
}

export function usePlayers(name?: string, limit = 100, offset = 0) {
  return useQuery({
    queryKey: ["csapi", "players", { name, limit, offset }],
    queryFn: () => csapiService.getPlayers(name, limit, offset),
    initialData: [],
  });
}

export function usePlayer(playerId?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["csapi", "players", playerId, { startDate, endDate }],
    queryFn: () => csapiService.getPlayer(playerId as number, startDate, endDate),
    enabled: Boolean(playerId),
  });
}

export function usePlayerRawStats(limit = 100, offset = 0, mapId?: number, sideId?: number) {
  return useQuery({
    queryKey: ["csapi", "players", "stats", "raw", { limit, offset, mapId, sideId }],
    queryFn: () => csapiService.getPlayerRawStats(limit, offset, mapId, sideId),
    initialData: [],
  });
}

export function usePlayerStatsByGroup(playerId?: number, group = "map", mapId?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["csapi", "players", playerId, "stats", group, { mapId, startDate, endDate }],
    queryFn: () => csapiService.getPlayerStatsByGroup(playerId as number, group, mapId, startDate, endDate),
    enabled: Boolean(playerId),
    initialData: [],
  });
}

export function useDatasetCounts() {
  return useQuery({
    queryKey: ["csapi", "counts"],
    queryFn: csapiService.getCounts,
    initialData: fallbackCounts,
  });
}

export function useMaps() {
  return useQuery({
    queryKey: ["csapi", "maps"],
    queryFn: csapiService.getMaps,
    initialData: [],
  });
}

export function useSides() {
  return useQuery({
    queryKey: ["csapi", "sides"],
    queryFn: csapiService.getSides,
    initialData: [],
  });
}

export function useFantasyList() {
  return useQuery({
    queryKey: ["csapi", "fantasy"],
    queryFn: csapiService.getFantasyList,
    initialData: [],
  });
}

export function useFantasy(fantasyId?: number) {
  return useQuery({
    queryKey: ["csapi", "fantasy", fantasyId],
    queryFn: () => csapiService.getFantasy(fantasyId as number),
    enabled: Boolean(fantasyId),
  });
}

export function useMatchupProbabilities(teamIdA?: number, teamIdB?: number, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["csapi", "predict", teamIdA, teamIdB, { startDate, endDate }],
    queryFn: () => csapiService.getMatchupProbabilities(teamIdA as number, teamIdB as number, startDate, endDate),
    enabled: Boolean(teamIdA && teamIdB),
  });
}

export function useGlobalSearchResults(query: string): GlobalSearchResult[] {
  const normalized = query.trim().toLowerCase();
  const { data: rankings = [] } = useRankings();
  const { data: players = [] } = usePlayerStats();
  const { data: matches = [] } = useLatestMatches();

  if (!normalized) {
    return [];
  }

  const teamResults: GlobalSearchResult[] = rankings
    .filter((team) => team.name.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map((team) => ({
      id: `team-${team.id}`,
      type: "team",
      title: team.name,
      subtitle: `#${team.rank} ranking mundial · ${team.points ?? "-"} pts`,
      href: `/teams?query=${encodeURIComponent(team.name)}`,
    }));

  const playerResults: GlobalSearchResult[] = players
    .filter((player) => player.name.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map((player) => ({
      id: `player-${player.id}`,
      type: "player",
      title: player.name,
      subtitle: `Rating ${player.rating?.toFixed(2) ?? "-"} · ADR ${player.adr?.toFixed(1) ?? "-"}`,
      href: `/players?query=${encodeURIComponent(player.name)}`,
    }));

  const matchResults: GlobalSearchResult[] = matches
    .filter((match) => `${match.team1.name} ${match.team2.name} ${match.event ?? ""}`.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map((match) => ({
      id: `match-${match.id}`,
      type: "match",
      title: `${match.team1.name} vs ${match.team2.name}`,
      subtitle: `${match.event ?? "CS API"} · ${match.format ?? "BO3"}`,
      href: `/matches?query=${encodeURIComponent(match.team1.name)}`,
    }));

  return [...teamResults, ...playerResults, ...matchResults].slice(0, 8);
}
