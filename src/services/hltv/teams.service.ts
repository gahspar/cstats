import type { NormalizedTeam } from "@/types/hltv";
import { hltvClient } from "./client";
import { normalizeTeam, normalizeTeamStats } from "./normalizers";
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

  async getTeamStats(id: number): Promise<NormalizedTeam> {
    return dedupe(`hltv:team-stats:${id}`, () =>
      withRetry(
        async () => {
          const [profileResult, stats] = await Promise.allSettled([
            hltvClient.getTeam({ id }).then(normalizeTeam),
            hltvClient.getTeamStats({ id }),
          ]);
          const profile = profileResult.status === "fulfilled" ? profileResult.value : undefined;

          if (stats.status === "rejected") {
            if (profile) return profile;
            throw stats.reason;
          }

          return normalizeTeamStats(stats.value, profile);
        },
        { service: "teams", method: "getTeamStats", id },
      ),
    );
  },
};
