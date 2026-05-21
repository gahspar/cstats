import { hltvMatchesService, hltvOddsService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { logWorker } from "./sync-context";

export async function syncOdds(limit?: number) {
  const worker = "sync-odds";
  await logWorker(worker, "started", 0, undefined, { limit });

  try {
    const source = await hltvMatchesService.getMatches();
    const matches = limit ? source.slice(0, limit) : source;
    let oddsCount = 0;

    for (const match of matches) {
      const odds = await hltvOddsService.getMatchOdds(match.id);
      oddsCount += odds.length;
      await hltvRepository.insertOdds(match.id, odds);
    }

    await logWorker(worker, "success", oddsCount, undefined, { matches: matches.length });
    return { matches: matches.length, odds: oddsCount };
  } catch (error) {
    await logWorker(worker, "error", 0, error instanceof Error ? error.message : String(error), { limit });
    throw error;
  }
}
