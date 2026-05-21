import { hltvMatchesService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { csapiService } from "@/lib/api/csapi-service";
import { normalizeCsApiMatch } from "@/services/csapi/fallback-normalizers";
import { logWorker } from "./sync-context";

export async function syncMatches() {
  const worker = "sync-matches";
  await logWorker(worker, "started");

  try {
    const matches = await hltvMatchesService.getMatches();
    if (matches.length === 0) {
      throw new Error("HLTV returned no matches");
    }

    await hltvRepository.upsertMatches(matches);
    await cacheRepository.set("hltv:matches", "matches", matches);
    await logWorker(worker, "success", matches.length);
    return matches;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const latest = await csapiService.getLatestMatches();
    const source = latest.length > 0 ? latest : await csapiService.getMatches(100, 0);
    const fallback = source.map(normalizeCsApiMatch);
    await hltvRepository.upsertMatches(fallback);
    await cacheRepository.set("csapi:matches:fallback", "matches", fallback);
    await logWorker(worker, "success", fallback.length, `HLTV unavailable; CSAPI fallback used. ${message}`, {}, "csapi");
    return fallback;
  }
}
