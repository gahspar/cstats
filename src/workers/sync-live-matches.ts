import { hltvMatchesService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { csapiService } from "@/lib/api/csapi-service";
import { normalizeCsApiMatch } from "@/services/csapi/fallback-normalizers";
import { logWorker } from "./sync-context";

export async function syncLiveMatches() {
  const worker = "sync-live-matches";
  await logWorker(worker, "started");

  try {
    const matches = await hltvMatchesService.getLiveMatches();
    if (matches.length === 0) {
      throw new Error("HLTV returned no live matches");
    }

    await hltvRepository.replaceLiveMatches(matches);
    await cacheRepository.set("hltv:live_matches", "live_matches", matches);
    await logWorker(worker, "success", matches.length);
    return matches;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const latest = await csapiService.getLatestMatches();
    const source = latest.length > 0 ? latest : await csapiService.getMatches(10, 0);
    const fallback = source.slice(0, 10).map(normalizeCsApiMatch);
    await hltvRepository.replaceLiveMatches([]);
    await cacheRepository.set("csapi:live_matches:fallback", "live_matches", fallback);
    await logWorker(worker, "success", fallback.length, `HLTV unavailable; no live fallback source. Latest CSAPI cached. ${message}`, {}, "csapi");
    return [];
  }
}
