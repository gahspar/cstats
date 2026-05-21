import { hltvPlayersService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { csapiService } from "@/lib/api/csapi-service";
import { normalizeCsApiPlayer } from "@/services/csapi/fallback-normalizers";
import { logWorker } from "./sync-context";

export async function syncPlayers(playerIds: number[]) {
  const worker = "sync-players";
  const uniqueIds = Array.from(new Set(playerIds)).slice(0, 100);
  await logWorker(worker, "started", 0, undefined, { count: uniqueIds.length });

  try {
    if (uniqueIds.length === 0) {
      throw new Error("No HLTV player ids supplied");
    }

    const results = await Promise.allSettled(uniqueIds.map((id) => hltvPlayersService.getPlayer(id)));
    const players = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
    await hltvRepository.upsertPlayers(players);
    await logWorker(worker, "success", players.length);
    return players;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const players = (await csapiService.getPlayerStats()).slice(0, 100).map(normalizeCsApiPlayer);
    await hltvRepository.upsertPlayers(players);
    await logWorker(worker, "success", players.length, `HLTV unavailable; CSAPI fallback used. ${message}`, {}, "csapi");
    return players;
  }
}
