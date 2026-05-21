import type { GetMatchesArguments, GetResultsArguments } from "hltv";
import type { NormalizedMatch } from "@/types/hltv";
import { hltvClient } from "./client";
import { normalizeFullMatch, normalizeMatchPreview, normalizeResult } from "./normalizers";
import { dedupe, withRetry } from "./service-utils";

export const hltvMatchesService = {
  async getMatches(args?: GetMatchesArguments): Promise<NormalizedMatch[]> {
    return dedupe(`hltv:matches:${JSON.stringify(args ?? {})}`, () =>
      withRetry(
        async () => {
          const matches = await hltvClient.getMatches(args);
          return matches.map(normalizeMatchPreview);
        },
        { service: "matches", method: "getMatches", args },
      ),
    );
  },

  async getLiveMatches(args?: GetMatchesArguments): Promise<NormalizedMatch[]> {
    const matches = await this.getMatches(args);
    return matches.filter((match) => match.status === "live");
  },

  async getMatch(id: number): Promise<NormalizedMatch> {
    return dedupe(`hltv:match:${id}`, () =>
      withRetry(
        async () => {
          const match = await hltvClient.getMatch({ id });
          return normalizeFullMatch(match);
        },
        { service: "matches", method: "getMatch", id },
      ),
    );
  },

  async getResults(args: GetResultsArguments): Promise<NormalizedMatch[]> {
    return dedupe(`hltv:results:${JSON.stringify(args)}`, () =>
      withRetry(
        async () => {
          const results = await hltvClient.getResults(args);
          return results.map(normalizeResult);
        },
        { service: "matches", method: "getResults", args },
      ),
    );
  },
};
