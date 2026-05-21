export function getSupabaseStatus() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return {
    configured,
    mode: configured ? "supabase" : "local-storage",
  } as const;
}
