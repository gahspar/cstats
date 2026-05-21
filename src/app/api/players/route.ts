import type { NextRequest } from "next/server";
import { getPagination } from "@/api/pagination";
import { dataResponse } from "@/api/response";
import { hltvRepository } from "@/repositories/hltv.repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { page, pageSize } = getPagination(request, 50);
  const query = request.nextUrl.searchParams.get("query");
  const all = request.nextUrl.searchParams.get("all") === "true";
  const data = await hltvRepository.listPlayers({ page, pageSize, query, all });

  return dataResponse(data, { page, pageSize, query, all });
}
