import type { CsApiMatch, CsApiPlayerStats, CsApiRankingTeam, CsApiTeam } from "@/types/csapi";
import type {
  NormalizedMatch,
  NormalizedPlayer,
  NormalizedRankingEntry,
  NormalizedTeam,
  NormalizedTeamRef,
} from "@/types/hltv";

function teamRef(team: CsApiTeam | CsApiRankingTeam): NormalizedTeamRef {
  return {
    id: team.id,
    name: team.name,
    country: team.country ?? null,
    rank: team.rank ?? null,
  };
}

export function normalizeCsApiRanking(team: CsApiRankingTeam): NormalizedRankingEntry {
  return {
    place: team.rank,
    team: teamRef(team),
    points: team.points ?? 0,
    change: team.change ?? team.pointsChange ?? 0,
    isNew: false,
    capturedAt: new Date().toISOString(),
    provider: "csapi",
    raw: team,
  };
}

export function normalizeCsApiMatch(match: CsApiMatch): NormalizedMatch {
  return {
    id: match.id,
    status: match.winner ? "finished" : "scheduled",
    startsAt: match.date ?? null,
    event: match.event
      ? {
          id: match.id,
          name: match.event,
          provider: "csapi",
          raw: { name: match.event },
        }
      : null,
    team1: match.team1,
    team2: match.team2,
    format: match.format ?? (match.bestOf ? `BO${match.bestOf}` : null),
    maps:
      match.maps?.map((map) => ({
        name: map.name,
        team1Rounds: map.team1_score ?? null,
        team2Rounds: map.team2_score ?? null,
      })) ?? [],
    odds: [],
    source: "csapi",
    raw: match,
  };
}

export function normalizeCsApiTeam(team: CsApiTeam): NormalizedTeam {
  return {
    ...teamRef(team),
    players: [],
    rankingDevelopment: [],
    raw: team,
  };
}

export function normalizeCsApiPlayer(player: CsApiPlayerStats): NormalizedPlayer {
  return {
    id: player.id,
    nickname: player.name,
    team: player.team ? { id: player.id, name: player.team } : null,
    statistics: {
      rating: player.rating ?? null,
      headshots: player.hs ?? null,
      mapsPlayed: player.maps ?? null,
    },
    raw: player,
  };
}
