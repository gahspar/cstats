import type { GetTeamArguments } from "hltv";
import type { NormalizedRankingEntry } from "@/types/hltv";
import { hltvClient } from "./client";
import { normalizeRanking } from "./normalizers";
import { dedupe, withRetry } from "./service-utils";

export const hltvRankingsService = {
  async getTeamRanking(args?: GetTeamArguments): Promise<NormalizedRankingEntry[]> {
    return dedupe(`hltv:rankings:${JSON.stringify(args ?? {})}`, () =>
      withRetry(
        async () => {
          const ranking = await hltvClient.getTeamRanking(args);
          return ranking.map(normalizeRanking);
        },
        { service: "rankings", method: "getTeamRanking", args },
      ),
    );
  },
};
