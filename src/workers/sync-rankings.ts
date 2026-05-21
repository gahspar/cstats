import { hltvRankingsService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { logWorker } from "./sync-context";

export async function syncRankings() {
  const worker = "sync-rankings";
  await logWorker(worker, "started");

  try {
    const rankings = await hltvRankingsService.getTeamRanking();
    await hltvRepository.replaceRankings(rankings);
    await cacheRepository.set("hltv:rankings", "rankings", rankings);
    await logWorker(worker, "success", rankings.length);
    return rankings;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logWorker(worker, "error", 0, message);
    throw error;
  }
}
