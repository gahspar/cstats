import { NextResponse, type NextRequest } from "next/server";
import { dataResponse } from "@/api/response";
import { hltvRepository } from "@/repositories/hltv.repository";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teamId = Number(id);

  if (!Number.isFinite(teamId)) {
    return NextResponse.json({ error: "Invalid team id" }, { status: 400 });
  }

  const data = await hltvRepository.getTeam(teamId);
  const hasDetailedStats = Boolean((data?.raw as { stats?: unknown } | null)?.stats);

  if (!data || !hasDetailedStats) {
    try {
      const { syncTeamDetail } = await import("@/workers");
      const synced = await syncTeamDetail(teamId);
      return dataResponse({
        id: synced.id,
        name: synced.name,
        logo_url: synced.logoUrl,
        country: synced.country,
        rank: synced.rank,
        players: synced.players,
        ranking_development: synced.rankingDevelopment,
        raw: synced.raw,
      });
    } catch (error) {
      if (data) {
        return dataResponse(data, {
          syncWarning: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  if (!data) {
    return NextResponse.json({ error: "Team not found in local HLTV cache" }, { status: 404 });
  }

  return dataResponse(data);
}
