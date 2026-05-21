import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/repositories/supabase-server";

export function dataResponse<T>(data: T, metadata: Record<string, unknown> = {}) {
  return NextResponse.json({
    data,
    metadata: {
      source: "local-cache",
      supabaseConfigured: isSupabaseConfigured(),
      generatedAt: new Date().toISOString(),
      disclaimer: "Analise estatistica baseada em dados historicos.",
      ...metadata,
    },
  });
}
