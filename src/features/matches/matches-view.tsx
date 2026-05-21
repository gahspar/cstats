"use client";

import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { usePlatformMatches } from "@/hooks/use-platform-data";

export function MatchesView() {
  const searchParams = useSearchParams();
  const { data: matches = [] } = usePlatformMatches("all");
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [formatFilter, setFormatFilter] = useState<"all" | "bo1" | "bo3" | "bo5">("all");

  const filteredMatches = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return matches.filter((match) => {
      const format = (match.format ?? "").toLowerCase();
      const matchesFormat = formatFilter === "all" || format === formatFilter;
      const haystack = `${match.team1.name} ${match.team2.name} ${match.event ?? ""} ${match.maps?.map((map) => map.name).join(" ") ?? ""}`.toLowerCase();

      return matchesFormat && (!normalized || haystack.includes(normalized));
    });
  }, [formatFilter, matches, query]);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Partidas</div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50">Proximos jogos, ao vivo e historico</h1>
        </div>
        <div className="flex gap-2">
          {(["all", "bo1", "bo3", "bo5"] as const).map((filter) => (
            <Button
              key={filter}
              variant={formatFilter === filter ? "primary" : "secondary"}
              onClick={() => setFormatFilter(filter)}
            >
              {filter === "all" ? "Todos" : filter.toUpperCase()}
            </Button>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <CardTitle>Calendario e resultados recentes ({filteredMatches.length})</CardTitle>
          <Input
            className="w-full md:w-80"
            placeholder="Filtrar por time, evento ou mapa"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Horario</Th>
                <Th>Partida</Th>
                <Th>Evento</Th>
                <Th>Formato</Th>
                <Th>Mapa inicial</Th>
                <Th>Probabilidade</Th>
                <Th>Score</Th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match, index) => (
                <tr key={match.id}>
                  <Td className="font-mono">{match.startsAt ? format(new Date(match.startsAt), "dd/MM HH:mm") : "--:--"}</Td>
                  <Td className="font-medium text-slate-100">{match.team1.name} vs {match.team2.name}</Td>
                  <Td>{match.event ?? "HLTV"}</Td>
                  <Td><Badge variant="muted">{match.format ?? "BO3"}</Badge></Td>
                  <Td>{match.maps?.[0]?.name ?? "-"}</Td>
                  <Td><Badge variant={index === 0 ? "success" : "default"}>{Math.max(50, 68 - index * 3)}%</Badge></Td>
                  <Td className="font-mono">{match.team1.score ?? "-"} : {match.team2.score ?? "-"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
