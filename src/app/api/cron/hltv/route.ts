import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function assertCronAccess(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  return token === secret;
}

export async function POST(request: NextRequest) {
  if (!assertCronAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = request.nextUrl.searchParams.get("task") ?? "all";
  const startedAt = Date.now();
  const { syncAll, syncEvents, syncLiveMatches, syncMatches, syncOdds, syncPlayers, syncRankings, syncTeams } = await import("@/workers");

  const result =
    task === "live"
      ? await syncLiveMatches()
      : task === "matches"
        ? await syncMatches()
        : task === "rankings"
          ? await syncRankings()
          : task === "teams"
            ? await syncTeams()
            : task === "events"
              ? await syncEvents()
              : task === "players"
                ? await syncPlayers([])
                : task === "odds"
                  ? await syncOdds()
                  : await syncAll();

  return NextResponse.json({
    task,
    result,
    durationMs: Date.now() - startedAt,
    disclaimer: "Analise estatistica baseada em dados historicos.",
  });
}
