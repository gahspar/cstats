import { NextResponse } from "next/server";
import { getSupabaseStatus } from "@/lib/supabase/status";

export function GET() {
  return NextResponse.json({
    supabase: getSupabaseStatus(),
    csApi: {
      baseUrl: process.env.CS_API_BASE_URL ?? "https://api.csapi.de",
      proxy: "/api/cs/*",
    },
  });
}
