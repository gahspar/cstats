"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { usePlayerStats } from "@/hooks/use-csapi";
import { usePlatformPlayers } from "@/hooks/use-platform-data";

export function PlayersView() {
  const searchParams = useSearchParams();
  const { data: fallbackPlayers = [] } = usePlayerStats();
  const { data: platformPlayers = [] } = usePlatformPlayers(undefined, 100);
  const players = platformPlayers.length > 0 ? platformPlayers : fallbackPlayers;
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const filteredPlayers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return players;
    }

    return players.filter((player) => {
      return player.name.toLowerCase().includes(normalized) || (player.team ?? "").toLowerCase().includes(normalized);
    });
  }, [players, query]);

  return (
    <div className="space-y-4">
      <section>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Jogadores</div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50">Performance individual</h1>
      </section>

      <Card>
        <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <CardTitle>Rating, ADR, KAST, HS% e KD ({filteredPlayers.length})</CardTitle>
          <Input
            className="w-full md:w-80"
            placeholder="Buscar jogador ou time"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Jogador</Th>
                <Th>Time</Th>
                <Th>Rating</Th>
                <Th>ADR</Th>
                <Th>KAST</Th>
                <Th>HS%</Th>
                <Th>KD</Th>
                <Th>Mapas</Th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <Td className="font-medium text-slate-100">{player.name}</Td>
                  <Td>{player.team ?? "-"}</Td>
                  <Td><Badge variant={(player.rating ?? 0) >= 1.2 ? "success" : "muted"}>{player.rating?.toFixed(2) ?? "-"}</Badge></Td>
                  <Td className="font-mono">{player.adr?.toFixed(1) ?? "-"}</Td>
                  <Td className="font-mono">{player.kast?.toFixed(1) ?? "-"}%</Td>
                  <Td className="font-mono">{player.hs?.toFixed(1) ?? "-"}%</Td>
                  <Td className="font-mono">{player.kd?.toFixed(2) ?? "-"}</Td>
                  <Td className="font-mono">{player.maps ?? "-"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
