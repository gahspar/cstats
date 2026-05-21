import { csapiClient } from "@/lib/api/csapi-client";
import {
  fallbackCounts,
  fallbackMatches,
  fallbackPlayers,
  fallbackRankings,
} from "@/lib/api/mock-data";
import type {
  CsApiCounts,
  CsApiFantasy,
  CsApiItem,
  CsApiMatch,
  CsApiMatchPlayerStats,
  CsApiMatchupProbabilities,
  CsApiPlayerDetail,
  CsApiPlayerRawStats,
  CsApiPlayerStats,
  CsApiRankingTeam,
  CsApiTeam,
  CsApiTeamDetail,
  CsApiTeamMapStats,
} from "@/types/csapi";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function extractList(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);

  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function normalizeTeamRef(value: unknown) {
  const team = asRecord(value);

  return {
    id: asNumber(team.id) ?? 0,
    name: asString(team.name) ?? "TBD",
    score: asNumber(team.score),
    rank: asNumber(team.rank),
  };
}

function normalizeMatch(value: unknown): CsApiMatch | null {
  const match = asRecord(value);
  const id = asNumber(match.id);

  if (!id) {
    return null;
  }

  const bestOf = asNumber(match.best_of) ?? asNumber(match.bestOf);

  return {
    id,
    date: asString(match.date),
    event: asString(match.event),
    format: asString(match.format) ?? (bestOf ? `BO${bestOf}` : undefined),
    bestOf,
    team1: normalizeTeamRef(match.team1),
    team2: normalizeTeamRef(match.team2),
    winner: match.winner ? normalizeTeamRef(match.winner) : undefined,
    maps: extractList(match.maps, ["maps"]).map((map) => {
      const mapRecord = asRecord(map);

      return {
        id: asNumber(mapRecord.id),
        name: asString(mapRecord.name) ?? "Mapa",
        team1_score: asNumber(mapRecord.team1_score),
        team2_score: asNumber(mapRecord.team2_score),
      };
    }),
  };
}

function normalizeRanking(value: unknown): CsApiRankingTeam | null {
  const team = asRecord(value);
  const id = asNumber(team.id);
  const rank = asNumber(team.rank);
  const name = asString(team.name);

  if (!id || !rank || !name) {
    return null;
  }

  return {
    id,
    rank,
    name,
    country: asString(team.country),
    points: asNumber(team.points),
    change: asNumber(team.rank_diff) ?? asNumber(team.change),
    pointsChange: asNumber(team.points_diff),
  };
}

function normalizeTeam(value: unknown): CsApiTeam | null {
  const team = asRecord(value);
  const id = asNumber(team.id);
  const name = asString(team.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    rank: asNumber(team.rank),
    country: asString(team.country),
    points: asNumber(team.points),
    change: asNumber(team.rank_diff) ?? asNumber(team.change),
    pointsChange: asNumber(team.points_diff),
  };
}

function normalizeItem(value: unknown): CsApiItem | null {
  const item = asRecord(value);
  const id = asNumber(item.id);
  const name = asString(item.name);

  return id && name ? { id, name } : null;
}

function normalizePlayer(value: unknown): CsApiPlayerStats | null {
  const player = asRecord(value);
  const id = asNumber(player.id);
  const name = asString(player.name);

  if (!id || !name) {
    return null;
  }

  const kills = asNumber(player.k);
  const deaths = asNumber(player.d);

  return {
    id,
    name,
    rank: asNumber(player.rank),
    team: asString(player.team),
    maps: asNumber(player.maps) ?? asNumber(player.N),
    rating: asNumber(player.rating),
    adr: asNumber(player.adr),
    kast: asNumber(player.kast),
    kd: asNumber(player.kd) ?? (kills && deaths ? kills / deaths : undefined),
    hs: asNumber(player.hs),
    kills,
    deaths,
    swing: asNumber(player.swing),
  };
}

function normalizeRawPlayerStats(value: unknown): CsApiPlayerRawStats | null {
  const player = normalizePlayer(value);
  const record = asRecord(value);

  if (!player) {
    return null;
  }

  return {
    ...player,
    teamId: asNumber(record.team_id),
    teamName: asString(record.team_name),
    outcome: asString(record.outcome),
    mapId: asNumber(record.map_id),
    sideId: asNumber(record.side_id),
  };
}

function normalizeTeamDetail(value: unknown): CsApiTeamDetail | null {
  const team = asRecord(value);
  const id = asNumber(team.id);
  const name = asString(team.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    streak: asNumber(team.streak) ?? 0,
    roster: extractList(team.roster, ["value", "data"])
      .map(normalizeItem)
      .filter((item): item is CsApiItem => Boolean(item)),
  };
}

function normalizeTeamMapStats(value: unknown): CsApiTeamMapStats | null {
  const map = asRecord(value);
  const id = asNumber(map.id);
  const name = asString(map.name);
  const n = asNumber(map.n);
  const nWins = asNumber(map.n_wins);

  if (!id || !name || n === undefined || nWins === undefined) {
    return null;
  }

  return {
    id,
    name,
    n,
    nWins,
    winRate: n > 0 ? Math.round((nWins / n) * 100) : 0,
  };
}

function normalizePlayerDetail(value: unknown): CsApiPlayerDetail | null {
  const player = asRecord(value);
  const id = asNumber(player.id);
  const name = asString(player.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    team: normalizeItem(player.team) ?? undefined,
    stats: normalizePlayer({ id, name, ...asRecord(player.stats) }) ?? undefined,
  };
}

function normalizeMatchPlayerStats(value: unknown): CsApiMatchPlayerStats | null {
  const match = asRecord(value);
  const id = asNumber(match.id);
  const name = asString(match.name) ?? `Match ${id ?? ""}`;
  const normalizeTeamStats = (teamValue: unknown) => {
    const team = asRecord(teamValue);

    return {
      id: asNumber(team.id) ?? 0,
      name: asString(team.name) ?? "Team",
      players: extractList(team.players, ["value", "data"])
        .map(normalizePlayer)
        .filter((player): player is CsApiPlayerStats => Boolean(player)),
    };
  };

  if (!id) {
    return null;
  }

  return {
    id,
    name,
    team1: normalizeTeamStats(match.team1),
    team2: normalizeTeamStats(match.team2),
  };
}

function normalizeFantasy(value: unknown): CsApiFantasy | null {
  const fantasy = asRecord(value);
  const id = asNumber(fantasy.id);
  const name = asString(fantasy.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    salaryCap: asNumber(fantasy.salary_cap) ?? 0,
    currency: asString(fantasy.currency) ?? "",
    teams: extractList(fantasy.teams, ["value", "data"]).map((teamValue) => {
      const team = asRecord(teamValue);

      return {
        id: asNumber(team.id) ?? 0,
        name: asString(team.name) ?? "Team",
        players: extractList(team.players, ["value", "data"]).map((playerValue) => {
          const player = asRecord(playerValue);

          return {
            id: asNumber(player.id) ?? 0,
            name: asString(player.name) ?? "Player",
            cost: asNumber(player.cost) ?? 0,
          };
        }),
      };
    }),
  };
}

function normalizePrediction(value: unknown): CsApiMatchupProbabilities {
  const prediction = asRecord(value);
  const rawMapWinProbs = asRecord(prediction.map_win_probs);
  const mapWinProbs = Object.fromEntries(
    Object.entries(rawMapWinProbs)
      .map(([key, mapValue]) => [key, asNumber(mapValue)])
      .filter((entry): entry is [string, number] => entry[1] !== undefined),
  );

  return {
    mapWinProbs,
    rankingWinProb: asNumber(prediction.ranking_win_prob) ?? 0,
  };
}

function normalizeCounts(payload: unknown): CsApiCounts {
  const counts = asRecord(payload);

  return {
    matches: asNumber(counts.matches),
    teams: asNumber(counts.teams),
    players: asNumber(counts.players),
    maps: asNumber(counts.maps),
  };
}

export const csapiService = {
  async getSides(): Promise<CsApiItem[]> {
    try {
      const { data } = await csapiClient.get("/sides");
      return extractList(data, ["value", "data"]).map(normalizeItem).filter((item): item is CsApiItem => Boolean(item));
    } catch {
      return [];
    }
  },

  async getMaps(): Promise<CsApiItem[]> {
    try {
      const { data } = await csapiClient.get("/maps");
      return extractList(data, ["value", "data"]).map(normalizeItem).filter((item): item is CsApiItem => Boolean(item));
    } catch {
      return [];
    }
  },

  async getFantasyList(): Promise<CsApiItem[]> {
    try {
      const { data } = await csapiClient.get("/fantasy");
      return extractList(data, ["value", "data"]).map(normalizeItem).filter((item): item is CsApiItem => Boolean(item));
    } catch {
      return [];
    }
  },

  async getFantasy(id: number): Promise<CsApiFantasy | null> {
    try {
      const { data } = await csapiClient.get(`/fantasy/${id}`);
      return normalizeFantasy(data);
    } catch {
      return null;
    }
  },

  async getMatches(limit = 100, offset = 0): Promise<CsApiMatch[]> {
    try {
      const { data } = await csapiClient.get("/matches", {
        params: { limit, offset },
      });
      const matches = extractList(data, ["value", "data", "matches"])
        .map(normalizeMatch)
        .filter((match): match is CsApiMatch => Boolean(match));

      return matches.length ? matches : fallbackMatches;
    } catch {
      return fallbackMatches;
    }
  },

  async getLatestMatches(): Promise<CsApiMatch[]> {
    try {
      const { data } = await csapiClient.get("/matches/latest", {
        params: { limit: 100 },
      });
      const matches = extractList(data, ["value", "data", "matches"])
        .map(normalizeMatch)
        .filter((match): match is CsApiMatch => Boolean(match));

      return matches.length ? matches : fallbackMatches;
    } catch {
      return fallbackMatches;
    }
  },

  async getMatch(matchId: number): Promise<CsApiMatch | null> {
    try {
      const { data } = await csapiClient.get(`/matches/${matchId}`);
      return normalizeMatch(data);
    } catch {
      return null;
    }
  },

  async getMatchStats(matchId: number, byMap = false): Promise<CsApiMatchPlayerStats | null> {
    try {
      const { data } = await csapiClient.get(`/matches/${matchId}/stats`, {
        params: { by_map: byMap },
      });
      return normalizeMatchPlayerStats(data);
    } catch {
      return null;
    }
  },

  async getRankings(): Promise<CsApiRankingTeam[]> {
    try {
      const { data } = await csapiClient.get("/rankings");
      const rankings = extractList(data, ["rankings", "value", "data"])
        .map(normalizeRanking)
        .filter((team): team is CsApiRankingTeam => Boolean(team));

      return rankings.length ? rankings : fallbackRankings;
    } catch {
      return fallbackRankings;
    }
  },

  async getRankingsByDate(date: string): Promise<CsApiRankingTeam[]> {
    try {
      const { data } = await csapiClient.get("/rankings", {
        params: { date },
      });
      const rankings = extractList(data, ["rankings", "value", "data"])
        .map(normalizeRanking)
        .filter((team): team is CsApiRankingTeam => Boolean(team));

      return rankings.length ? rankings : fallbackRankings;
    } catch {
      return fallbackRankings;
    }
  },

  async getTeams(): Promise<CsApiTeam[]> {
    try {
      const { data } = await csapiClient.get("/teams", {
        params: { limit: 500 },
      });
      const teams = extractList(data, ["teams", "value", "data"])
        .map(normalizeTeam)
        .filter((team): team is CsApiTeam => Boolean(team));

      return teams.length ? teams : fallbackRankings;
    } catch {
      return fallbackRankings;
    }
  },

  async getTeam(teamId: number, startDate?: string, endDate?: string): Promise<CsApiTeamDetail | null> {
    try {
      const { data } = await csapiClient.get(`/teams/${teamId}`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return normalizeTeamDetail(data);
    } catch {
      return null;
    }
  },

  async getTeamMatchHistory(teamId: number, limit = 50, offset = 0): Promise<CsApiMatch[]> {
    try {
      const { data } = await csapiClient.get(`/teams/${teamId}/matchhistory`, {
        params: { limit, offset },
      });
      const matches = extractList(data, ["value", "data", "matches"])
        .map(normalizeMatch)
        .filter((match): match is CsApiMatch => Boolean(match));

      return matches;
    } catch {
      return [];
    }
  },

  async getTeamStats(teamId: number, startDate?: string, endDate?: string): Promise<CsApiTeamMapStats[]> {
    try {
      const { data } = await csapiClient.get(`/teams/${teamId}/stats`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return extractList(data, ["value", "data", "maps"])
        .map(normalizeTeamMapStats)
        .filter((map): map is CsApiTeamMapStats => Boolean(map));
    } catch {
      return [];
    }
  },

  async getPlayers(name?: string, limit = 100, offset = 0): Promise<CsApiItem[]> {
    try {
      const { data } = await csapiClient.get("/players/", {
        params: { name, limit, offset },
      });
      return extractList(data, ["value", "players", "data"])
        .map(normalizeItem)
        .filter((player): player is CsApiItem => Boolean(player));
    } catch {
      return [];
    }
  },

  async getPlayerStats(): Promise<CsApiPlayerStats[]> {
    try {
      const { data } = await csapiClient.get("/players/stats", {
        params: { limit: 100 },
      });
      const players = extractList(data, ["value", "players", "data"])
        .map(normalizePlayer)
        .filter((player): player is CsApiPlayerStats => Boolean(player));

      return players.length ? players : fallbackPlayers;
    } catch {
      return fallbackPlayers;
    }
  },

  async getPlayerRawStats(limit = 100, offset = 0, mapId?: number, sideId?: number): Promise<CsApiPlayerRawStats[]> {
    try {
      const { data } = await csapiClient.get("/players/stats/raw", {
        params: { limit, offset, mapid: mapId, sideid: sideId },
      });
      return extractList(data, ["value", "players", "data"])
        .map(normalizeRawPlayerStats)
        .filter((player): player is CsApiPlayerRawStats => Boolean(player));
    } catch {
      return [];
    }
  },

  async getPlayerRawStatsByOutcome(outcome: string, limit = 100, offset = 0, mapId?: number): Promise<CsApiPlayerRawStats[]> {
    try {
      const { data } = await csapiClient.get(`/players/stats/raw/${outcome}`, {
        params: { limit, offset, mapid: mapId },
      });
      return extractList(data, ["value", "players", "data"])
        .map(normalizeRawPlayerStats)
        .filter((player): player is CsApiPlayerRawStats => Boolean(player));
    } catch {
      return [];
    }
  },

  async getPlayer(playerId: number, startDate?: string, endDate?: string): Promise<CsApiPlayerDetail | null> {
    try {
      const { data } = await csapiClient.get(`/players/${playerId}`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return normalizePlayerDetail(data);
    } catch {
      return null;
    }
  },

  async getPlayerStatsByGroup(
    playerId: number,
    group: string,
    mapId?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<CsApiPlayerStats[]> {
    try {
      const { data } = await csapiClient.get(`/players/${playerId}/stats/${group}`, {
        params: { mapid: mapId, start_date: startDate, end_date: endDate },
      });
      return extractList(data, ["value", "players", "data"])
        .map(normalizePlayer)
        .filter((player): player is CsApiPlayerStats => Boolean(player));
    } catch {
      return [];
    }
  },

  async getMatchupProbabilities(
    teamIdA: number,
    teamIdB: number,
    startDate?: string,
    endDate?: string,
  ): Promise<CsApiMatchupProbabilities> {
    try {
      const { data } = await csapiClient.get(`/predict/${teamIdA}/${teamIdB}`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return normalizePrediction(data);
    } catch {
      return {
        mapWinProbs: {},
        rankingWinProb: 0,
      };
    }
  },

  async getCounts(): Promise<CsApiCounts> {
    try {
      const { data } = await csapiClient.get("/counts");
      return normalizeCounts(data);
    } catch {
      return fallbackCounts;
    }
  },
};
