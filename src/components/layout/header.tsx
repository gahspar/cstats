"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, RefreshCw, Search, Settings2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePlatformSearchResults } from "@/hooks/use-platform-data";

export function Header() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"notifications" | "settings" | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const results = usePlatformSearchResults(query);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const first = results[0];

    if (first) {
      router.push(first.href);
      setOpen(false);
      return;
    }

    if (query.trim()) {
      router.push(`/teams?query=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-800 bg-[#080b10]/90 px-4 backdrop-blur">
      <form className="relative hidden min-w-0 flex-1 md:block" onSubmit={submitSearch}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          className="max-w-xl pl-9"
          placeholder="Buscar time, jogador, partida ou mapa"
          aria-label="Buscar"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {open && results.length > 0 ? (
          <div className="absolute left-0 top-11 z-50 w-full max-w-xl overflow-hidden rounded-lg border border-slate-800 bg-[#0d1219] shadow-2xl">
            {results.map((result) => (
              <Link
                key={result.id}
                href={result.href}
                className="block border-b border-slate-900 px-3 py-2 last:border-b-0 hover:bg-slate-800/70"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-100">{result.title}</span>
                  <Badge variant="muted">{result.type}</Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500">{result.subtitle}</div>
              </Link>
            ))}
          </div>
        ) : null}
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Badge variant="success" className="hidden sm:inline-flex">
          HLTV cache
        </Badge>
        <Button
          variant="ghost"
          className="h-9 w-9 px-0"
          aria-label="Atualizar dados"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["hltv"] });
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="h-9 w-9 px-0"
          aria-label="Notificacoes"
          onClick={() => setPanel((current) => (current === "notifications" ? null : "notifications"))}
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="h-9 w-9 px-0"
          aria-label="Preferencias"
          onClick={() => setPanel((current) => (current === "settings" ? null : "settings"))}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
        {panel ? (
          <div className="absolute right-4 top-12 z-50 w-80 rounded-lg border border-slate-800 bg-[#0d1219] p-3 shadow-2xl">
            {panel === "notifications" ? (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-100">Notificacoes</div>
                <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-400">
                  Dados HLTV sincronizados via cache local e rotas internas.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-100">Preferencias</div>
                <label className="flex items-center justify-between gap-3 text-sm text-slate-400">
                  Atualizacao automatica
                  <input className="h-4 w-4 accent-sky-400" type="checkbox" defaultChecked />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm text-slate-400">
                  Modo compacto
                  <input className="h-4 w-4 accent-sky-400" type="checkbox" defaultChecked />
                </label>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
