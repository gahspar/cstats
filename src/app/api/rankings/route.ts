import type { NextRequest } from "next/server";
import { dataResponse } from "@/api/response";
import { hltvRepository } from "@/repositories/hltv.repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "30");
  const data = await hltvRepository.listRankings(Number.isFinite(limit) ? limit : 30);

  return dataResponse(data, { limit });
}
