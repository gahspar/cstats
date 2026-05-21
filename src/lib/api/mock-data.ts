import type {
  BettingSuggestion,
  CsApiCounts,
  CsApiMatch,
  CsApiPlayerStats,
  CsApiRankingTeam,
  TeamInsight,
} from "@/types/csapi";

export const fallbackCounts: CsApiCounts = {
  matches: 18420,
  teams: 100,
  players: 642,
  maps: 52710,
};

export const fallbackRankings: CsApiRankingTeam[] = [
  { id: 9565, rank: 1, name: "Vitality", country: "FR", points: 963, change: 0 },
  { id: 8297, rank: 2, name: "FURIA", country: "BR", points: 884, change: 2 },
  { id: 6667, rank: 3, name: "FaZe", country: "EU", points: 861, change: -1 },
  { id: 4608, rank: 4, name: "Natus Vincere", country: "UA", points: 829, change: 1 },
  { id: 5995, rank: 5, name: "G2", country: "EU", points: 802, change: -1 },
];

export const fallbackMatches: CsApiMatch[] = [
  {
    id: 2389666,
    date: new Date().toISOString(),
    event: "Premier Circuit",
    format: "BO3",
    team1: { id: 8297, name: "FURIA", score: 2 },
    team2: { id: 9565, name: "Vitality", score: 1 },
    maps: [
      { name: "Nuke", team1_score: 13, team2_score: 9 },
      { name: "Inferno", team1_score: 8, team2_score: 13 },
      { name: "Mirage", team1_score: 13, team2_score: 10 },
    ],
  },
  {
    id: 2389667,
    date: new Date().toISOString(),
    event: "Regional Masters",
    format: "BO1",
    team1: { id: 4608, name: "Natus Vincere", score: 13 },
    team2: { id: 5995, name: "G2", score: 11 },
    maps: [{ name: "Ancient", team1_score: 13, team2_score: 11 }],
  },
  {
    id: 2389668,
    date: new Date().toISOString(),
    event: "Elite Cup",
    format: "BO3",
    team1: { id: 6667, name: "FaZe", score: 0 },
    team2: { id: 4494, name: "MOUZ", score: 2 },
    maps: [
      { name: "Dust2", team1_score: 7, team2_score: 13 },
      { name: "Anubis", team1_score: 10, team2_score: 13 },
    ],
  },
];

export const fallbackPlayers: CsApiPlayerStats[] = [
  { id: 21167, name: "ZywOo", team: "Vitality", maps: 48, rating: 1.34, adr: 86.4, kast: 78.1, kd: 1.42, hs: 41.2 },
  { id: 7998, name: "KSCERATO", team: "FURIA", maps: 44, rating: 1.19, adr: 82.7, kast: 74.4, kd: 1.21, hs: 49.8 },
  { id: 11893, name: "m0NESY", team: "G2", maps: 51, rating: 1.27, adr: 79.8, kast: 75.5, kd: 1.31, hs: 36.9 },
  { id: 7592, name: "ropz", team: "FaZe", maps: 46, rating: 1.14, adr: 76.5, kast: 73.2, kd: 1.15, hs: 55.1 },
];

export const teamInsights: TeamInsight[] = [
  { id: 9565, name: "Vitality", rank: 1, winRate: 72, streak: "W4", mapPool: "Nuke, Mirage", form: [62, 68, 71, 74, 72] },
  { id: 8297, name: "FURIA", rank: 2, winRate: 67, streak: "W2", mapPool: "Mirage, Inferno", form: [54, 61, 59, 65, 67] },
  { id: 6667, name: "FaZe", rank: 3, winRate: 61, streak: "L1", mapPool: "Ancient, Dust2", form: [70, 64, 62, 60, 61] },
  { id: 4608, name: "Natus Vincere", rank: 4, winRate: 59, streak: "W1", mapPool: "Ancient, Nuke", form: [48, 52, 55, 57, 59] },
];

export const bettingSuggestions: BettingSuggestion[] = [
  {
    id: "furia-map-plus",
    match: "FURIA vs Vitality",
    market: "FURIA +1.5 mapas",
    confidence: 64,
    edge: "Moderado",
    rationale: "Forma recente positiva, bom aproveitamento em Mirage e historico competitivo em BO3.",
  },
  {
    id: "navi-ml",
    match: "Natus Vincere vs G2",
    market: "Natus Vincere vencedor",
    confidence: 58,
    edge: "Baixo",
    rationale: "Modelo favorece consistencia defensiva e vantagem em Ancient, mas margem e curta.",
  },
  {
    id: "fazemouz-over",
    match: "FaZe vs MOUZ",
    market: "Over 2.5 mapas",
    confidence: 61,
    edge: "Moderado",
    rationale: "Map pools complementares e historico recente com decisivos em BO3.",
  },
];
