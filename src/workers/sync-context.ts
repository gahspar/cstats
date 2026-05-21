import { hltvRepository } from "@/repositories/hltv.repository";
import type { DataProvider } from "@/types/hltv";

export async function logWorker(
  worker: string,
  status: "started" | "success" | "error",
  recordsProcessed = 0,
  message?: string,
  metadata: Record<string, unknown> = {},
  provider: DataProvider = "hltv",
) {
  await hltvRepository.insertSyncLog({
    worker,
    status,
    provider,
    recordsProcessed,
    message,
    metadata,
  });
}
