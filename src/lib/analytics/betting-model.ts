import type { BettingSuggestion, PlatformMatch, PlatformRankingTeam } from "@/types/platform";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function edgeLabel(confidence: number) {
  if (confidence >= 66) {
    return "Alto";
  }

  if (confidence >= 58) {
    return "Moderado";
  }

  return "Baixo";
}

export function buildBettingSuggestions(
  matches: PlatformMatch[],
  rankings: PlatformRankingTeam[],
): BettingSuggestion[] {
  const rankByTeam = new Map(rankings.map((team) => [team.id, team.rank]));

  return matches.slice(0, 8).map((match) => {
    const team1Rank = match.team1.rank ?? rankByTeam.get(match.team1.id) ?? 80;
    const team2Rank = match.team2.rank ?? rankByTeam.get(match.team2.id) ?? 80;
    const rankGap = team2Rank - team1Rank;
    const team1Maps = match.maps?.filter((map) => (map.team1Rounds ?? 0) > (map.team2Rounds ?? 0)).length ?? 0;
    const team2Maps = match.maps?.filter((map) => (map.team2Rounds ?? 0) > (map.team1Rounds ?? 0)).length ?? 0;
    const mapGap = team1Maps - team2Maps;
    const parsedBestOf = Number(match.format?.replace("BO", ""));
    const bestOf = Number.isFinite(parsedBestOf) && parsedBestOf > 0 ? parsedBestOf : 3;
    const base = 52 + clamp(rankGap, -30, 30) * 0.45 + mapGap * 4 + (bestOf >= 3 ? 3 : 0);
    const confidence = Math.round(clamp(base, 51, 74));
    const favored = confidence >= 52 ? match.team1.name : match.team2.name;
    const market = bestOf >= 3 ? `${favored} +1.5 mapas` : `${favored} vencedor`;

    return {
      id: `suggestion-${match.id}`,
      match: `${match.team1.name} vs ${match.team2.name}`,
      market,
      confidence,
      edge: edgeLabel(confidence),
      rationale: `Modelo pondera ranking atual, resultado recente, formato ${match.format ?? `BO${bestOf}`} e mapas jogados em ${match.event ?? "partida recente"}.`,
    };
  });
}
