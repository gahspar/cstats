"use client";

import { useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { useRankings, useTeams } from "@/hooks/use-csapi";
import { usePlatformRankings, usePlatformTeams } from "@/hooks/use-platform-data";
import { useFavoriteTeams } from "@/hooks/use-favorite-teams";
import { teamInsights } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";

const pageSize = 80;

export function TeamsView() {
  const searchParams = useSearchParams();
  const { data: fallbackRankings = [] } = useRankings();
  const { data: fallbackTeams = [] } = useTeams();
  const { data: platformRankings = [] } = usePlatformRankings(100);
  const { data: platformTeams = [] } = usePlatformTeams(undefined, 100);
  const { isFavorite, toggleFavorite, favorites } = useFavoriteTeams();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const teamsWithRankings = useMemo(() => {
    const rankings = platformRankings.length > 0 ? platformRankings : fallbackRankings;
    const teams = platformTeams.length > 0 ? platformTeams : fallbackTeams;
    const rankingById = new Map(rankings.map((team) => [team.id, team]));

    return teams
      .map((team) => ({
        ...team,
        ...rankingById.get(team.id),
        rank: rankingById.get(team.id)?.rank ?? team.rank,
      }))
      .sort((teamA, teamB) => {
        const rankA = teamA.rank ?? Number.MAX_SAFE_INTEGER;
        const rankB = teamB.rank ?? Number.MAX_SAFE_INTEGER;

        if (rankA !== rankB) {
          return rankA - rankB;
        }

        return teamA.name.localeCompare(teamB.name);
      });
  }, [fallbackRankings, fallbackTeams, platformRankings, platformTeams]);

  const filteredRankings = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return teamsWithRankings.filter((team) => {
      const matchesQuery = !normalized || team.name.toLowerCase().includes(normalized) || String(team.rank).includes(normalized);
      const matchesFavorite = !onlyFavorites || isFavorite(team.id);

      return matchesQuery && matchesFavorite;
    });
  }, [isFavorite, onlyFavorites, query, teamsWithRankings]);

  const visibleTeams = filteredRankings.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Times</div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50">Ranking e desempenho</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={onlyFavorites ? "primary" : "secondary"}
            onClick={() => setOnlyFavorites((current) => !current)}
          >
            <Filter className="h-4 w-4" />
            Favoritos
          </Button>
          <Button variant="secondary"><SlidersHorizontal className="h-4 w-4" />Colunas</Button>
        </div>
      </section>

      <Card>
        <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <CardTitle>Times monitorados ({filteredRankings.length})</CardTitle>
          <Input
            className="w-full md:w-80"
            placeholder="Filtrar por nome, pais ou ranking"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <thead>
              <tr>
                <Th></Th>
                <Th>Rank</Th>
                <Th>Time</Th>
                <Th>Pais</Th>
                <Th>Win rate</Th>
                <Th>Streak</Th>
                <Th>Map pool</Th>
                <Th>Pontos</Th>
              </tr>
            </thead>
            <tbody>
              {visibleTeams.map((team) => {
                const insight = teamInsights.find((item) => item.id === team.id);
                const favorite = isFavorite(team.id);

                return (
                  <tr key={team.id}>
                    <Td>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 px-0"
                        aria-label={favorite ? "Remover favorito" : "Adicionar favorito"}
                        onClick={() => toggleFavorite({ id: team.id, name: team.name, rank: team.rank })}
                      >
                        <Star className={cn("h-4 w-4", favorite && "fill-amber-300 text-amber-300")} />
                      </Button>
                    </Td>
                    <Td className="font-mono text-slate-500">{team.rank ? `#${team.rank}` : "N/R"}</Td>
                    <Td className="font-medium text-slate-100">{team.name}</Td>
                    <Td>{team.country ?? "-"}</Td>
                    <Td className="font-mono">{insight?.winRate ?? 55}%</Td>
                    <Td><Badge variant={insight?.streak.startsWith("W") ? "success" : "danger"}>{insight?.streak ?? "N/A"}</Badge></Td>
                    <Td>{insight?.mapPool ?? "A definir"}</Td>
                    <Td className="font-mono">{team.points ?? "-"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          {filteredRankings.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              Nenhum time encontrado. Favoritos salvos: {favorites.length}.
            </div>
          ) : null}
          {visibleCount < filteredRankings.length ? (
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="text-sm text-slate-500">
                Mostrando {visibleTeams.length} de {filteredRankings.length} times.
              </div>
              <Button variant="secondary" onClick={() => setVisibleCount((current) => current + pageSize)}>
                Carregar mais
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
