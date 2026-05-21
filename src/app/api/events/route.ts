import type { NextRequest } from "next/server";
import { dataResponse } from "@/api/response";
import { hltvRepository } from "@/repositories/hltv.repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "40");
  const data = await hltvRepository.listEvents(Number.isFinite(limit) ? limit : 40);

  return dataResponse(data, { limit });
}
