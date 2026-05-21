import type { NormalizedTeam } from "@/types/hltv";
import { hltvClient } from "./client";
import { normalizeTeam } from "./normalizers";
import { dedupe, withRetry } from "./service-utils";

export const hltvTeamsService = {
  async getTeam(id: number): Promise<NormalizedTeam> {
    return dedupe(`hltv:team:${id}`, () =>
      withRetry(
        async () => {
          const team = await hltvClient.getTeam({ id });
          return normalizeTeam(team);
        },
        { service: "teams", method: "getTeam", id },
      ),
    );
  },

  async getTeams(ids: number[]): Promise<NormalizedTeam[]> {
    const uniqueIds = Array.from(new Set(ids));
    const results = await Promise.allSettled(uniqueIds.map((id) => this.getTeam(id)));

    return results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  },
};
