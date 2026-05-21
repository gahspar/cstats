import { hltvRankingsService, hltvTeamsService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { hltvMatchesService } from "@/services/hltv/matches.service";
import type { NormalizedTeam } from "@/types/hltv";
import { logWorker } from "./sync-context";

function uniqueById<T extends { id: number }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export async function syncTeams(enrichDetails = false) {
  const worker = "sync-teams";
  await logWorker(worker, "started", 0, undefined, { enrichDetails });

  try {
    const [rankingResult, matchesResult] = await Promise.allSettled([
      hltvRankingsService.getTeamRanking(),
      hltvMatchesService.getMatches(),
    ]);
    const rankings = rankingResult.status === "fulfilled" ? rankingResult.value : [];
    const matches = matchesResult.status === "fulfilled" ? matchesResult.value : [];
    const rankingTeams: NormalizedTeam[] = rankings.map((entry) => ({
      ...entry.team,
      rank: entry.place,
      players: [],
      rankingDevelopment: [],
      raw: entry.raw,
    }));
    const matchTeams: NormalizedTeam[] = matches
      .flatMap((match) => [match.team1, match.team2])
      .filter((team): team is NonNullable<typeof team> => Boolean(team?.id))
      .map((team) => ({
        ...team,
        players: [],
        rankingDevelopment: [],
        raw: { source: "hltv.getMatches" },
      }));
    const baseTeams = uniqueById([...rankingTeams, ...matchTeams]);

    if (baseTeams.length === 0) {
      const messages = [rankingResult, matchesResult]
        .map((result) => (result.status === "rejected" ? String(result.reason) : "empty"))
        .join(" | ");
      throw new Error(`HLTV returned no teams: ${messages}`);
    }

    await hltvRepository.upsertTeams(baseTeams);

    const teams = enrichDetails
      ? await hltvTeamsService.getTeams(baseTeams.map((entry) => entry.id))
      : baseTeams;
    await hltvRepository.upsertTeams(teams);
    await cacheRepository.set("hltv:teams:ranking", "teams", teams);
    await logWorker(worker, "success", teams.length, undefined, { enrichDetails });
    return teams;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logWorker(worker, "error", 0, message, { enrichDetails });
    throw error;
  }
}
