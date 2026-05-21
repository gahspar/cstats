export type DataProvider = "hltv" | "cache";

export type MatchLifecycle = "scheduled" | "live" | "finished" | "postponed" | "deleted";

export type CacheDomain =
  | "rankings"
  | "teams"
  | "players"
  | "live_matches"
  | "odds"
  | "events"
  | "matches"
  | "results";

export interface CachePolicy {
  domain: CacheDomain;
  ttlSeconds: number;
  staleWhileRevalidateSeconds: number;
}

export interface NormalizedTeamRef {
  id: number;
  name: string;
  logoUrl?: string | null;
  country?: string | null;
  rank?: number | null;
}

export interface NormalizedPlayerRef {
  id: number;
  nickname: string;
  name?: string | null;
  imageUrl?: string | null;
  country?: string | null;
  team?: NormalizedTeamRef | null;
}

export interface NormalizedEvent {
  id: number;
  name: string;
  startsAt?: string | null;
  endsAt?: string | null;
  location?: string | null;
  country?: string | null;
  prizePool?: string | null;
  numberOfTeams?: number | null;
  featured?: boolean;
  provider: DataProvider;
  raw: unknown;
}

export interface NormalizedOdd {
  provider: string;
  team1: number | null;
  team2: number | null;
  capturedAt: string;
}

export interface NormalizedMapResult {
  name: string;
  statsId?: number | null;
  team1Rounds?: number | null;
  team2Rounds?: number | null;
}

export interface NormalizedMatch {
  id: number;
  title?: string | null;
  status: MatchLifecycle;
  startsAt?: string | null;
  event?: NormalizedEvent | null;
  team1?: NormalizedTeamRef | null;
  team2?: NormalizedTeamRef | null;
  format?: string | null;
  maps: NormalizedMapResult[];
  odds: NormalizedOdd[];
  stars?: number | null;
  source: DataProvider;
  raw: unknown;
}

export interface NormalizedTeam extends NormalizedTeamRef {
  players: NormalizedPlayerRef[];
  rankingDevelopment: number[];
  overview?: Record<string, number>;
  mapStats?: Record<string, unknown>;
  recentMatches?: unknown[];
  events?: unknown[];
  social?: Record<string, string | null | undefined>;
  raw: unknown;
}

export interface NormalizedPlayer extends NormalizedPlayerRef {
  age?: number | null;
  statistics?: {
    rating?: number | null;
    killsPerRound?: number | null;
    headshots?: number | null;
    mapsPlayed?: number | null;
    deathsPerRound?: number | null;
    roundsContributed?: number | null;
    kd?: number | null;
  };
  achievements?: unknown[];
  raw: unknown;
}

export interface NormalizedRankingEntry {
  place: number;
  team: NormalizedTeamRef;
  points: number;
  change: number;
  isNew: boolean;
  capturedAt: string;
  provider: DataProvider;
  raw: unknown;
}

export interface ProcessedPrediction {
  matchId: number;
  team1Probability: number;
  team2Probability: number;
  confidence: number;
  rationale: string[];
  disclaimer: "Analise estatistica baseada em dados historicos.";
}

export interface SyncLogEntry {
  id?: string;
  worker: string;
  status: "started" | "success" | "error";
  provider: DataProvider;
  recordsProcessed?: number;
  message?: string | null;
  metadata?: Record<string, unknown>;
}
