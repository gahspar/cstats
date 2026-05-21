"use client";

import { format } from "date-fns";
import { Activity, Database, LineChart, ShieldCheck } from "lucide-react";
import { MapWinrateChart } from "@/components/charts/map-winrate-chart";
import { TeamFormChart } from "@/components/charts/team-form-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, Td, Th } from "@/components/ui/table";
import { useDatasetCounts, useLatestMatches, useMaps, usePlayerStats, useRankings, useSides } from "@/hooks/use-csapi";
import { buildBettingSuggestions } from "@/lib/analytics/betting-model";
import { teamInsights } from "@/lib/api/mock-data";

export function DashboardView() {
  const { data: counts } = useDatasetCounts();
  const { data: matches = [] } = useLatestMatches();
  const { data: rankings = [] } = useRankings();
  const { data: players = [] } = usePlayerStats();
  const { data: maps = [] } = useMaps();
  const { data: sides = [] } = useSides();
  const bettingSuggestions = buildBettingSuggestions(matches, rankings);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {format(new Date(), "dd/MM/yyyy")} - CS2 analytics
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50">Dashboard principal</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => window.scrollTo({ top: 520, behavior: "smooth" })}>Filtros</Button>
          <Button variant="primary" asChild><a href="/intelligence">Nova analise</a></Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Partidas indexadas" value={(counts?.matches ?? 0).toLocaleString("pt-BR")} delta="+12% 30d" tone="positive" />
        <MetricCard label="Times monitorados" value={(counts?.teams ?? 0).toLocaleString("pt-BR")} delta="Top 100" />
        <MetricCard label="Jogadores ativos" value={(counts?.players ?? 0).toLocaleString("pt-BR")} delta="+4% 30d" tone="positive" />
        <MetricCard label="Mapas oficiais" value={(maps.length || counts?.maps || 0).toLocaleString("pt-BR")} delta={`${sides.length || 2} lados`} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Forma recente por time</CardTitle>
            <Badge variant="muted">Win rate ponderado</Badge>
          </CardHeader>
          <CardContent>
            <TeamFormChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ranking mundial</CardTitle>
            <ShieldCheck className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Time</Th>
                  <Th>Pts</Th>
                  <Th>Mov.</Th>
                </tr>
              </thead>
              <tbody>
                {rankings.slice(0, 6).map((team) => (
                  <tr key={team.id}>
                    <Td className="font-mono text-slate-500">{team.rank}</Td>
                    <Td className="font-medium text-slate-100">{team.name}</Td>
                    <Td>{team.points ?? "-"}</Td>
                    <Td>
                      <Badge variant={(team.change ?? 0) >= 0 ? "success" : "danger"}>
                        {(team.change ?? 0) > 0 ? "+" : ""}
                        {team.change ?? 0}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Jogos do dia e ultimas partidas</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Partida</Th>
                  <Th>Evento</Th>
                  <Th>Formato</Th>
                  <Th>Mapa</Th>
                  <Th>Score</Th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 6).map((match) => (
                  <tr key={match.id}>
                    <Td className="font-medium text-slate-100">{match.team1.name} vs {match.team2.name}</Td>
                    <Td>{match.event ?? "CS API"}</Td>
                    <Td><Badge variant="muted">{match.format ?? "BO3"}</Badge></Td>
                    <Td>{match.maps?.[0]?.name ?? "-"}</Td>
                    <Td className="font-mono">{match.team1.score ?? "-"} : {match.team2.score ?? "-"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Probabilidades</CardTitle>
            <LineChart className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            {bettingSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="rounded-md border border-slate-800 bg-slate-950/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-100">{suggestion.market}</div>
                    <div className="mt-1 text-xs text-slate-500">{suggestion.match}</div>
                  </div>
                  <Badge variant="default">{suggestion.confidence}%</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">{suggestion.rationale}</p>
              </div>
            ))}
            <p className="text-xs text-slate-500">Analise estatistica baseada em dados historicos.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Win rate por mapa e lado</CardTitle>
          </CardHeader>
          <CardContent>
            <MapWinrateChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top jogadores</CardTitle>
            <Database className="h-4 w-4 text-slate-500" />
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
                  <Th>KD</Th>
                </tr>
              </thead>
              <tbody>
                {players.slice(0, 5).map((player) => (
                  <tr key={player.id}>
                    <Td className="font-medium text-slate-100">{player.name}</Td>
                    <Td>{player.team ?? "-"}</Td>
                    <Td className="font-mono">{player.rating?.toFixed(2) ?? "-"}</Td>
                    <Td className="font-mono">{player.adr?.toFixed(1) ?? "-"}</Td>
                    <Td className="font-mono">{player.kast?.toFixed(1) ?? "-"}%</Td>
                    <Td className="font-mono">{player.kd?.toFixed(2) ?? "-"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {teamInsights.map((team) => (
          <Card key={team.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">#{team.rank} ranking</div>
                <div className="mt-1 text-base font-semibold text-slate-100">{team.name}</div>
              </div>
              <Badge variant={team.streak.startsWith("W") ? "success" : "danger"}>{team.streak}</Badge>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-sky-400" style={{ width: `${team.winRate}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Win rate {team.winRate}%</span>
              <span>{team.mapPool}</span>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
