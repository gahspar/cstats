import { hltvRankingsService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { csapiService } from "@/lib/api/csapi-service";
import { normalizeCsApiRanking } from "@/services/csapi/fallback-normalizers";
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
    const fallback = (await csapiService.getRankings()).map(normalizeCsApiRanking);
    await hltvRepository.replaceRankings(fallback);
    await cacheRepository.set("csapi:rankings:fallback", "rankings", fallback);
    await logWorker(worker, "success", fallback.length, `HLTV unavailable; CSAPI fallback used. ${message}`, {}, "csapi");
    return fallback;
  }
}
