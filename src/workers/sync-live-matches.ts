import { hltvMatchesService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { logWorker } from "./sync-context";

export async function syncLiveMatches() {
  const worker = "sync-live-matches";
  await logWorker(worker, "started");

  try {
    const matches = await hltvMatchesService.getLiveMatches();
    await hltvRepository.replaceLiveMatches(matches);
    await cacheRepository.set("hltv:live_matches", "live_matches", matches);
    await logWorker(worker, "success", matches.length);
    return matches;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logWorker(worker, "error", 0, message);
    throw error;
  }
}
