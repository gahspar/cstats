import { hltvRankingsService, hltvTeamsService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { cacheRepository } from "@/repositories/cache.repository";
import { csapiService } from "@/lib/api/csapi-service";
import { normalizeCsApiTeam } from "@/services/csapi/fallback-normalizers";
import { logWorker } from "./sync-context";

export async function syncTeams(limit = 30) {
  const worker = "sync-teams";
  await logWorker(worker, "started", 0, undefined, { limit });

  try {
    const rankings = await hltvRankingsService.getTeamRanking();
    const teamIds = rankings.slice(0, limit).map((entry) => entry.team.id);
    const teams = await hltvTeamsService.getTeams(teamIds);
    await hltvRepository.upsertTeams(teams);
    await cacheRepository.set(`hltv:teams:top:${limit}`, "teams", teams);
    await logWorker(worker, "success", teams.length, undefined, { limit });
    return teams;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const teams = (await csapiService.getTeams()).slice(0, limit).map(normalizeCsApiTeam);
    await hltvRepository.upsertTeams(teams);
    await cacheRepository.set(`csapi:teams:fallback:${limit}`, "teams", teams);
    await logWorker(worker, "success", teams.length, `HLTV unavailable; CSAPI fallback used. ${message}`, { limit }, "csapi");
    return teams;
  }
}
