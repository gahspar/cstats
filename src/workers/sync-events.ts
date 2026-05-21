import { hltvEventsService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { logWorker } from "./sync-context";

export async function syncEvents() {
  const worker = "sync-events";
  await logWorker(worker, "started");

  try {
    const events = await hltvEventsService.getEvents();
    await hltvRepository.upsertEvents(events);
    await cacheRepository.set("hltv:events", "events", events);
    await logWorker(worker, "success", events.length);
    return events;
  } catch (error) {
    await logWorker(worker, "error", 0, error instanceof Error ? error.message : String(error));
    throw error;
  }
}
