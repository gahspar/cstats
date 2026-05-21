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

  const data = await hltvRepository.listTeamMatches(teamId);

  return dataResponse(data);
}
