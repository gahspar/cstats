"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity, ArrowLeft, CalendarDays, Map, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, Td, Th } from "@/components/ui/table";
import { usePlatformTeam, usePlatformTeamMatches } from "@/hooks/use-platform-data";

type RawTeamStats = {
  stats?: {
    overview?: {
      mapsPlayed?: number;
      wins?: number;
      draws?: number;
      losses?: number;
      totalKills?: number;
      totalDeaths?: number;
      roundsPlayed?: number;
      kdRatio?: number;
    };
    mapStats?: Record<string, { wins?: number; losses?: number; winRate?: number; totalRounds?: number }>;
    events?: Array<{ place?: string; event?: { id?: number; name?: string } }>;
    matches?: Array<{ date?: number; event?: { name?: string }; map?: string; team1?: { name?: string }; team2?: { name?: string }; result?: string }>;
  };
};

function pct(value?: number | null) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "-";
}

export function TeamDetailView() {
  const params = useParams<{ id: string }>();
  const teamId = Number(params.id);
  const { data: team, isLoading } = usePlatformTeam(teamId);
  const { data: matches = [] } = usePlatformTeamMatches(teamId);
  const raw = (team?.raw ?? {}) as RawTeamStats;
  const stats = raw.stats;
  const overview = stats?.overview;
  const maps = Object.entries(stats?.mapStats ?? {}).sort(([, a], [, b]) => (b.winRate ?? 0) - (a.winRate ?? 0));
  const events = stats?.events ?? [];
  const recentMatches = matches.length > 0 ? matches : [];
  const winRate = overview?.mapsPlayed ? ((overview.wins ?? 0) / overview.mapsPlayed) * 100 : null;

  if (isLoading) {
    return <div className="text-sm text-slate-500">Carregando estatisticas HLTV do time...</div>;
  }

  if (!team) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" asChild><Link href="/teams"><ArrowLeft className="h-4 w-4" />Voltar</Link></Button>
        <Card>
          <CardContent className="p-6 text-sm text-slate-400">
            Time nao encontrado no cache HLTV local. Execute o cron `task=teams` ou `task=team&id={teamId}` para sincronizar.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2 px-0"><Link href="/teams"><ArrowLeft className="h-4 w-4" />Times</Link></Button>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">HLTV team analytics</div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50">{team.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">#{team.rank ?? "N/R"} ranking</Badge>
          <Badge variant="default">Analise estatistica baseada em dados historicos.</Badge>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Mapas jogados" value={(overview?.mapsPlayed ?? 0).toLocaleString("pt-BR")} delta="amostra HLTV" />
        <MetricCard label="Win rate" value={pct(winRate)} delta={`${overview?.wins ?? 0}W / ${overview?.losses ?? 0}L`} tone={(winRate ?? 0) >= 55 ? "positive" : "neutral"} />
        <MetricCard label="KD do time" value={(overview?.kdRatio ?? 0).toFixed(2)} delta={`${overview?.totalKills ?? 0} kills`} />
        <MetricCard label="Rounds" value={(overview?.roundsPlayed ?? 0).toLocaleString("pt-BR")} delta="historico" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Map pool para apostas</CardTitle>
            <Map className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Mapa</Th>
                  <Th>Win rate</Th>
                  <Th>W-L</Th>
                  <Th>Rounds</Th>
                  <Th>Sinal</Th>
                </tr>
              </thead>
              <tbody>
                {maps.map(([map, data]) => (
                  <tr key={map}>
                    <Td className="font-medium text-slate-100">{map}</Td>
                    <Td className="font-mono">{pct(data.winRate)}</Td>
                    <Td className="font-mono">{data.wins ?? 0}-{data.losses ?? 0}</Td>
                    <Td className="font-mono">{data.totalRounds ?? "-"}</Td>
                    <Td><Badge variant={(data.winRate ?? 0) >= 55 ? "success" : "muted"}>{(data.winRate ?? 0) >= 55 ? "Forte" : "Neutro"}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lineup atual</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            {(team.players ?? []).length ? (
              team.players?.map((player) => (
                <div key={player.id} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
                  <span className="text-sm font-medium text-slate-100">{player.name}</span>
                  <Badge variant="muted">HLTV</Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">Lineup completo ainda nao sincronizado para este time.</div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Partidas recentes no cache</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <thead>
                <tr>
                  <Th>Partida</Th>
                  <Th>Evento</Th>
                  <Th>Formato</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.slice(0, 10).map((match) => (
                  <tr key={match.id}>
                    <Td className="font-medium text-slate-100">{match.team1.name} vs {match.team2.name}</Td>
                    <Td>{match.event ?? "HLTV"}</Td>
                    <Td><Badge variant="muted">{match.format ?? "-"}</Badge></Td>
                    <Td>{match.status}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Eventos e campeonatos</CardTitle>
            <CalendarDays className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            {events.slice(0, 10).map((entry, index) => (
              <div key={`${entry.event?.id ?? index}-${entry.place}`} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
                <span className="text-sm text-slate-100">{entry.event?.name ?? "Evento HLTV"}</span>
                <Badge variant="muted">{entry.place ?? "-"}</Badge>
              </div>
            ))}
            {!events.length ? <div className="text-sm text-slate-500">Eventos detalhados aparecem apos sincronizar `task=team&id={teamId}`.</div> : null}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Resumo para decisao</CardTitle>
          <ShieldCheck className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3">
            <div className="text-xs text-slate-500">Forma</div>
            <div className="mt-1 text-sm text-slate-200">{winRate ? `Win rate geral de ${pct(winRate)}` : "Aguardando amostra HLTV"}</div>
          </div>
          <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3">
            <div className="text-xs text-slate-500">Melhor mapa</div>
            <div className="mt-1 text-sm text-slate-200">{maps[0]?.[0] ?? "Nao calculado"}</div>
          </div>
          <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3">
            <div className="text-xs text-slate-500">Risco</div>
            <div className="mt-1 text-sm text-slate-200">{(overview?.mapsPlayed ?? 0) >= 20 ? "Amostra razoavel" : "Amostra baixa"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
