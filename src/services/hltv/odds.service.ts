import type { NormalizedOdd } from "@/types/hltv";
import { hltvMatchesService } from "./matches.service";

export const hltvOddsService = {
  async getMatchOdds(matchId: number): Promise<NormalizedOdd[]> {
    const match = await hltvMatchesService.getMatch(matchId);
    return match.odds;
  },

  async getUpcomingOdds(limit = 20) {
    const matches = await hltvMatchesService.getMatches();
    const upcoming = matches.slice(0, limit);

    return Promise.all(
      upcoming.map(async (match) => ({
        matchId: match.id,
        odds: await this.getMatchOdds(match.id),
      })),
    );
  },
};
