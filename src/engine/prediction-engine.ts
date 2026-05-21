import type { NormalizedMatch, NormalizedRankingEntry, ProcessedPrediction } from "@/types/hltv";

function rankingScore(teamId: number | undefined, rankings: NormalizedRankingEntry[]) {
  if (!teamId) return 50;

  const entry = rankings.find((ranking) => ranking.team.id === teamId);
  if (!entry) return 50;

  return Math.max(5, 100 - entry.place * 2 + Math.max(-10, Math.min(10, entry.change)));
}

export function buildInitialPrediction(
  match: NormalizedMatch,
  rankings: NormalizedRankingEntry[],
): ProcessedPrediction | null {
  if (!match.team1 || !match.team2) {
    return null;
  }

  const team1Score = rankingScore(match.team1.id, rankings);
  const team2Score = rankingScore(match.team2.id, rankings);
  const total = team1Score + team2Score || 1;
  const team1Probability = Math.round((team1Score / total) * 100);
  const team2Probability = 100 - team1Probability;
  const favorite = team1Probability >= team2Probability ? match.team1.name : match.team2.name;

  return {
    matchId: match.id,
    team1Probability,
    team2Probability,
    confidence: Math.min(85, Math.max(45, Math.abs(team1Probability - team2Probability) + 50)),
    rationale: [
      `Modelo inicial ponderado por ranking HLTV e variacao recente de posicao.`,
      `Favorito estatistico: ${favorite}.`,
      `Mercados de mapas, CT/TR e BO1/BO3 ainda dependem de historico processado.`,
    ],
    disclaimer: "Analise estatistica baseada em dados historicos.",
  };
}
