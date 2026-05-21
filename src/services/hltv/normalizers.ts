import type {
  Event,
  EventPreview,
  FullMatchResult,
  FullPlayer,
  FullTeam,
  Match,
  MatchPreview,
  Player,
  ProviderOdds,
  Team,
  TeamRanking,
} from "hltv";
import type {
  MatchLifecycle,
  NormalizedEvent,
  NormalizedMatch,
  NormalizedOdd,
  NormalizedPlayer,
  NormalizedPlayerRef,
  NormalizedRankingEntry,
  NormalizedTeam,
  NormalizedTeamRef,
} from "@/types/hltv";
import { toIsoDate } from "./service-utils";

function normalizeCountry(country?: { name?: string; code?: string } | null) {
  return country?.name ?? country?.code ?? null;
}

export function normalizeTeamRef(team?: Team | null, rank?: number | null): NormalizedTeamRef | null {
  if (!team?.id) {
    return null;
  }

  return {
    id: team.id,
    name: team.name,
    logoUrl: "logo" in team ? (team.logo as string | undefined) ?? null : null,
    rank: rank ?? null,
  };
}

export function normalizePlayerRef(player?: Player | null): NormalizedPlayerRef | null {
  if (!player?.id) {
    return null;
  }

  return {
    id: player.id,
    nickname: player.name,
  };
}

function normalizeStatus(status?: string, isLive?: boolean): MatchLifecycle {
  if (isLive || status === "Live") return "live";
  if (status === "Over") return "finished";
  if (status === "Postponed") return "postponed";
  if (status === "Deleted") return "deleted";
  return "scheduled";
}

export function normalizeEvent(event?: Event | EventPreview | null): NormalizedEvent | null {
  if (!event || typeof event.id !== "number") {
    return null;
  }

  return {
    id: event.id,
    name: event.name,
    startsAt: "dateStart" in event ? toIsoDate(event.dateStart) : null,
    endsAt: "dateEnd" in event ? toIsoDate(event.dateEnd) : null,
    location: "location" in event ? normalizeCountry(event.location) : null,
    country: "location" in event ? event.location?.code ?? null : null,
    prizePool: "prizePool" in event ? event.prizePool ?? null : null,
    numberOfTeams: "numberOfTeams" in event ? event.numberOfTeams ?? null : null,
    featured: "featured" in event ? event.featured : false,
    provider: "hltv",
    raw: event,
  };
}

export function normalizeOdds(odds: ProviderOdds[] = []): NormalizedOdd[] {
  const capturedAt = new Date().toISOString();

  return odds.map((odd) => ({
    provider: odd.provider,
    team1: Number.isFinite(odd.team1) ? odd.team1 : null,
    team2: Number.isFinite(odd.team2) ? odd.team2 : null,
    capturedAt,
  }));
}

export function normalizeMatchPreview(match: MatchPreview): NormalizedMatch {
  return {
    id: match.id,
    title: match.title ?? null,
    status: normalizeStatus(undefined, match.live),
    startsAt: toIsoDate(match.date),
    event: normalizeEvent(match.event),
    team1: normalizeTeamRef(match.team1),
    team2: normalizeTeamRef(match.team2),
    format: match.format ?? null,
    maps: [],
    odds: [],
    stars: match.stars,
    source: "hltv",
    raw: match,
  };
}

export function normalizeFullMatch(match: Match): NormalizedMatch {
  return {
    id: match.id,
    title: match.title ?? null,
    status: normalizeStatus(match.status),
    startsAt: toIsoDate(match.date),
    event: normalizeEvent(match.event),
    team1: normalizeTeamRef(match.team1, match.team1?.rank),
    team2: normalizeTeamRef(match.team2, match.team2?.rank),
    format: match.format?.type ?? null,
    maps: match.maps.map((map) => ({
      name: map.name,
      statsId: map.statsId ?? null,
      team1Rounds: map.result?.team1TotalRounds ?? null,
      team2Rounds: map.result?.team2TotalRounds ?? null,
    })),
    odds: normalizeOdds(match.odds),
    source: "hltv",
    raw: match,
  };
}

export function normalizeResult(match: FullMatchResult): NormalizedMatch {
  return {
    id: match.id,
    status: "finished",
    startsAt: toIsoDate(match.date),
    team1: { id: match.id * 10 + 1, name: match.team1.name, logoUrl: match.team1.logo },
    team2: { id: match.id * 10 + 2, name: match.team2.name, logoUrl: match.team2.logo },
    format: match.format,
    maps: [
      {
        name: match.map ?? "unknown",
        team1Rounds: match.result.team1,
        team2Rounds: match.result.team2,
      },
    ],
    odds: [],
    stars: match.stars,
    source: "hltv",
    raw: match,
  };
}

export function normalizeTeam(team: FullTeam): NormalizedTeam {
  return {
    id: team.id,
    name: team.name,
    logoUrl: team.logo ?? null,
    country: normalizeCountry(team.country),
    rank: team.rank ?? null,
    players: team.players.flatMap((player) => {
      const normalized = normalizePlayerRef(player);
      return normalized ? [{ ...normalized, country: null }] : [];
    }),
    rankingDevelopment: team.rankingDevelopment,
    social: {
      facebook: team.facebook,
      twitter: team.twitter,
      instagram: team.instagram,
    },
    raw: team,
  };
}

export function normalizePlayer(player: FullPlayer): NormalizedPlayer {
  return {
    id: player.id,
    nickname: player.ign,
    name: player.name ?? null,
    imageUrl: player.image ?? null,
    age: player.age ?? null,
    country: normalizeCountry(player.country),
    team: normalizeTeamRef(player.team),
    statistics: player.statistics ?? undefined,
    achievements: player.achievements,
    raw: player,
  };
}

export function normalizeRanking(entry: TeamRanking): NormalizedRankingEntry {
  const team = normalizeTeamRef(entry.team);

  if (!team) {
    throw new Error("Ranking entry without team id");
  }

  return {
    place: entry.place,
    team,
    points: entry.points,
    change: entry.change,
    isNew: entry.isNew,
    capturedAt: new Date().toISOString(),
    provider: "hltv",
    raw: entry,
  };
}
