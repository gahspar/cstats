import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function assertCronAccess(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const querySecret = request.nextUrl.searchParams.get("secret");
  return token === secret || querySecret === secret;
}

async function runCronTask(request: NextRequest) {
  if (!assertCronAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = request.nextUrl.searchParams.get("task") ?? "all";
  const startedAt = Date.now();
  const { syncAll, syncEvents, syncLiveMatches, syncMatches, syncOdds, syncPlayers, syncRankings, syncTeamDetail, syncTeams } = await import("@/workers");
  const id = Number(request.nextUrl.searchParams.get("id"));

  if (task === "team" && !Number.isFinite(id)) {
    return NextResponse.json({ error: "Missing team id" }, { status: 400 });
  }

  try {
    const result =
      task === "live"
        ? await syncLiveMatches()
        : task === "matches"
          ? await syncMatches()
          : task === "rankings"
            ? await syncRankings()
            : task === "teams"
              ? await syncTeams(request.nextUrl.searchParams.get("details") === "true")
              : task === "team"
                ? await syncTeamDetail(id)
              : task === "events"
                ? await syncEvents()
                : task === "players"
                  ? await syncPlayers([])
                  : task === "odds"
                    ? await syncOdds(Number.isFinite(id) ? id : undefined)
                    : await syncAll();

    return NextResponse.json({
      ok: true,
      task,
      result,
      durationMs: Date.now() - startedAt,
      disclaimer: "Analise estatistica baseada em dados historicos.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        task,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return runCronTask(request);
}

export async function POST(request: NextRequest) {
  return runCronTask(request);
}
