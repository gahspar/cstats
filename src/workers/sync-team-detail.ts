import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { hltvTeamsService } from "@/services/hltv";
import { logWorker } from "./sync-context";

export async function syncTeamDetail(teamId: number) {
  const worker = "sync-team-detail";
  await logWorker(worker, "started", 0, undefined, { teamId });

  try {
    const team = await hltvTeamsService.getTeamStats(teamId);
    await hltvRepository.upsertTeams([team]);
    await cacheRepository.set(`hltv:team:${teamId}`, "teams", team);
    await logWorker(worker, "success", 1, undefined, { teamId });
    return team;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logWorker(worker, "error", 0, message, { teamId });
    throw error;
  }
}
