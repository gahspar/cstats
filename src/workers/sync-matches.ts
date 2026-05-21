import { hltvMatchesService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { logWorker } from "./sync-context";

export async function syncMatches() {
  const worker = "sync-matches";
  await logWorker(worker, "started");

  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 14);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 1);
    const date = (value: Date) => value.toISOString().slice(0, 10);
    const settled = await Promise.allSettled([
      hltvMatchesService.getMatches(),
      hltvMatchesService.getResults({ startDate: date(startDate), endDate: date(endDate) }),
    ]);
    const matches = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
    if (matches.length === 0) {
      const messages = settled.map((result) => (result.status === "rejected" ? String(result.reason) : "empty")).join(" | ");
      throw new Error(`HLTV returned no matches: ${messages}`);
    }

    await hltvRepository.replaceMatches(matches);
    await cacheRepository.set("hltv:matches", "matches", matches);
    await logWorker(worker, "success", matches.length);
    return matches;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logWorker(worker, "error", 0, message);
    throw error;
  }
}
