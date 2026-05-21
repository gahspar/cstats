import type { NextRequest } from "next/server";

export function getPagination(request: NextRequest, defaultPageSize = 25) {
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? String(defaultPageSize));

  return {
    page: Number.isFinite(page) ? Math.max(1, page) : 1,
    pageSize: Number.isFinite(pageSize) ? Math.min(Math.max(1, pageSize), 100) : defaultPageSize,
  };
}
