import { hltvPlayersService } from "@/services/hltv";
import { hltvRepository } from "@/repositories/hltv.repository";
import { GameMap } from "hltv";
import { logWorker } from "./sync-context";

const ACTIVE_MAPS = [
  GameMap.Ancient,
  GameMap.Anubis,
  GameMap.Dust2,
  GameMap.Inferno,
  GameMap.Mirage,
  GameMap.Nuke,
  GameMap.Train,
];

function uniqueById<T extends { id: number }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export async function syncPlayers(playerIds: number[] = []) {
  const worker = "sync-players";
  const uniqueIds = Array.from(new Set(playerIds));
  await logWorker(worker, "started", 0, undefined, { count: uniqueIds.length });

  try {
    const players =
      uniqueIds.length > 0
        ? (await Promise.allSettled(uniqueIds.map((id) => hltvPlayersService.getPlayer(id)))).flatMap((result) =>
            result.status === "fulfilled" ? [result.value] : [],
          )
        : uniqueById(
            (
              await Promise.allSettled([
                hltvPlayersService.getPlayerRanking(),
                ...ACTIVE_MAPS.map((map) => hltvPlayersService.getPlayerRanking({ maps: [map], minMapCount: 1 })),
              ])
            ).flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
          );
    if (players.length === 0) {
      throw new Error("HLTV returned no players");
    }
    await hltvRepository.upsertPlayers(players);
    await logWorker(worker, "success", players.length);
    return players;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logWorker(worker, "error", 0, message);
    throw error;
  }
}
