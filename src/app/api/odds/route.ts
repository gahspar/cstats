import type { NextRequest } from "next/server";
import { dataResponse } from "@/api/response";
import { hltvRepository } from "@/repositories/hltv.repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "100");
  const data = await hltvRepository.listOdds(Number.isFinite(limit) ? limit : 100);

  return dataResponse(data, { limit, refreshIntervalSeconds: 15 });
}
