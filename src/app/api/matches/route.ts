import type { NextRequest } from "next/server";
import { getPagination } from "@/api/pagination";
import { dataResponse } from "@/api/response";
import { hltvRepository } from "@/repositories/hltv.repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { page, pageSize } = getPagination(request);
  const status = request.nextUrl.searchParams.get("status");
  const data = await hltvRepository.listMatches({ page, pageSize, status });

  return dataResponse(data, { page, pageSize, status });
}
