export type CsApiTeamRef = {
  id: number;
  name: string;
  score?: number;
  rank?: number;
};

export type CsApiMap = {
  id?: number;
  name: string;
  team1_score?: number;
  team2_score?: number;
};

export type CsApiItem = {
  id: number;
  name: string;
};

export type CsApiMatch = {
  id: number;
  date?: string;
  event?: string;
  format?: string;
  bestOf?: number;
  team1: CsApiTeamRef;
  team2: CsApiTeamRef;
  maps?: CsApiMap[];
  winner?: CsApiTeamRef;
};

export type CsApiRankingTeam = {
  id: number;
  rank: number;
  name: string;
  country?: string;
  points?: number;
  change?: number;
  pointsChange?: number;
};

export type CsApiTeam = {
  id: number;
  name: string;
  rank?: number;
  country?: string;
  points?: number;
  change?: number;
  pointsChange?: number;
};

export type CsApiPlayerStats = {
  id: number;
  name: string;
  rank?: number;
  team?: string;
  maps?: number;
  rating?: number;
  adr?: number;
  kast?: number;
  kd?: number;
  hs?: number;
  kills?: number;
  deaths?: number;
  swing?: number;
};

export type CsApiPlayerRawStats = CsApiPlayerStats & {
  teamId?: number;
  teamName?: string;
  outcome?: string;
  mapId?: number;
  sideId?: number;
};

export type CsApiPlayerDetail = {
  id: number;
  name: string;
  team?: CsApiItem;
  stats?: CsApiPlayerStats;
};

export type CsApiTeamDetail = {
  id: number;
  name: string;
  streak: number;
  roster: CsApiItem[];
};

export type CsApiTeamMapStats = {
  id: number;
  name: string;
  n: number;
  nWins: number;
  winRate: number;
};

export type CsApiMatchTeamStats = {
  id: number;
  name: string;
  players: CsApiPlayerStats[];
};

export type CsApiMatchPlayerStats = {
  id: number;
  name: string;
  team1: CsApiMatchTeamStats;
  team2: CsApiMatchTeamStats;
};

export type CsApiFantasyPlayer = {
  id: number;
  name: string;
  cost: number;
};

export type CsApiFantasyTeam = {
  id: number;
  name: string;
  players: CsApiFantasyPlayer[];
};

export type CsApiFantasy = {
  id: number;
  name: string;
  salaryCap: number;
  currency: string;
  teams: CsApiFantasyTeam[];
};

export type CsApiMatchupProbabilities = {
  mapWinProbs: Record<string, number>;
  rankingWinProb: number;
};

export type CsApiCounts = {
  matches?: number;
  teams?: number;
  players?: number;
  maps?: number;
};

export type TeamInsight = {
  id: number;
  name: string;
  rank: number;
  winRate: number;
  streak: string;
  mapPool: string;
  form: number[];
};

export type BettingSuggestion = {
  id: string;
  match: string;
  market: string;
  confidence: number;
  edge: string;
  rationale: string;
};

export type GlobalSearchResult = {
  id: string;
  type: "team" | "player" | "match";
  title: string;
  subtitle: string;
  href: string;
};
