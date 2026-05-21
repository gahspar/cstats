export type SearchResultType = "team" | "player" | "match";

export interface PlatformTeamRef {
  id: number;
  name: string;
  score?: number | null;
  rank?: number | null;
  logoUrl?: string | null;
  country?: string | null;
}

export interface PlatformMap {
  name: string;
  team1Rounds?: number | null;
  team2Rounds?: number | null;
}

export interface PlatformMatch {
  id: number;
  title?: string | null;
  status: string;
  startsAt?: string | null;
  event?: string | null;
  format?: string | null;
  team1: PlatformTeamRef;
  team2: PlatformTeamRef;
  maps: PlatformMap[];
  stars?: number | null;
  source: "hltv";
}

export interface PlatformRankingTeam extends PlatformTeamRef {
  rank: number;
  points?: number | null;
  change?: number | null;
  isNew?: boolean;
}

export interface PlatformTeam extends PlatformTeamRef {
  players?: PlatformPlayer[];
  rankingDevelopment?: number[];
  raw?: unknown;
}

export interface PlatformPlayer {
  id: number;
  name: string;
  fullName?: string | null;
  team?: string | null;
  rating?: number | null;
  adr?: number | null;
  kast?: number | null;
  kd?: number | null;
  hs?: number | null;
  maps?: number | null;
  rounds?: number | null;
}

export interface PlatformOdds {
  id: string;
  matchId: number;
  provider: string;
  team1?: number | null;
  team2?: number | null;
  capturedAt: string;
}

export interface BettingSuggestion {
  id: string;
  match: string;
  market: string;
  confidence: number;
  edge: string;
  rationale: string;
}

export interface GlobalSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  href: string;
}
