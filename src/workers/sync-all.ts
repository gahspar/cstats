import { syncEvents } from "./sync-events";
import { syncLiveMatches } from "./sync-live-matches";
import { syncMatches } from "./sync-matches";
import { syncRankings } from "./sync-rankings";
import { syncTeams } from "./sync-teams";

export async function syncAll() {
  const [rankings, matches, liveMatches, events] = await Promise.all([
    syncRankings(),
    syncMatches(),
    syncLiveMatches(),
    syncEvents(),
  ]);

  const teams = await syncTeams(false);

  return {
    rankings: rankings.length,
    matches: matches.length,
    liveMatches: liveMatches.length,
    events: events.length,
    teams: teams.length,
  };
}
