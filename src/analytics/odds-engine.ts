import type { NormalizedOdd } from "@/types/hltv";

export interface OddsMovement {
  provider: string;
  team: "team1" | "team2";
  from: number;
  to: number;
  delta: number;
}

export function detectOddsMovements(previous: NormalizedOdd[], current: NormalizedOdd[]): OddsMovement[] {
  return current.flatMap((odd) => {
    const last = previous.find((item) => item.provider === odd.provider);
    if (!last) return [];

    const movements: OddsMovement[] = [];
    if (last.team1 && odd.team1 && last.team1 !== odd.team1) {
      movements.push({ provider: odd.provider, team: "team1", from: last.team1, to: odd.team1, delta: odd.team1 - last.team1 });
    }

    if (last.team2 && odd.team2 && last.team2 !== odd.team2) {
      movements.push({ provider: odd.provider, team: "team2", from: last.team2, to: odd.team2, delta: odd.team2 - last.team2 });
    }

    return movements;
  });
}
