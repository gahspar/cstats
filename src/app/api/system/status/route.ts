import { NextResponse } from "next/server";
import { getSupabaseStatus } from "@/lib/supabase/status";

export function GET() {
  return NextResponse.json({
    supabase: getSupabaseStatus(),
    hltv: {
      primary: true,
      package: "hltv",
      ingestion: "/api/cron/hltv",
      routes: ["/api/matches", "/api/live", "/api/teams", "/api/players", "/api/rankings", "/api/events", "/api/odds"],
    },
    csApi: {
      baseUrl: process.env.CS_API_BASE_URL ?? "https://api.csapi.de",
      fallback: true,
      proxy: "/api/cs/*",
    },
  });
}
