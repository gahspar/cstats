import type { GetPlayerRankingOptions } from "hltv";
import type { NormalizedPlayer } from "@/types/hltv";
import { hltvClient } from "./client";
import { normalizePlayer } from "./normalizers";
import { dedupe, withRetry } from "./service-utils";

export const hltvPlayersService = {
  async getPlayer(id: number): Promise<NormalizedPlayer> {
    return dedupe(`hltv:player:${id}`, () =>
      withRetry(
        async () => {
          const player = await hltvClient.getPlayer({ id });
          return normalizePlayer(player);
        },
        { service: "players", method: "getPlayer", id },
      ),
    );
  },

  async getPlayerRanking(args?: GetPlayerRankingOptions) {
    return dedupe(`hltv:player-ranking:${JSON.stringify(args ?? {})}`, () =>
      withRetry(
        () => hltvClient.getPlayerRanking(args),
        { service: "players", method: "getPlayerRanking", args },
      ),
    );
  },
};
