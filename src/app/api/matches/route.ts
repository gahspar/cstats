import type { NextRequest } from "next/server";
import { getPagination } from "@/api/pagination";
import { dataResponse } from "@/api/response";
import { hltvRepository } from "@/repositories/hltv.repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { page, pageSize } = getPagination(request);
  const status = request.nextUrl.searchParams.get("status");
  const all = request.nextUrl.searchParams.get("all") === "true";
  const data = await hltvRepository.listMatches({ page, pageSize, status, all });

  return dataResponse(data, { page, pageSize, status, all });
}
