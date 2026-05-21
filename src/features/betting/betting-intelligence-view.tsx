"use client";

import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLatestMatches, useRankings } from "@/hooks/use-csapi";
import { useAnalysisHistory } from "@/hooks/use-analysis-history";
import { buildBettingSuggestions } from "@/lib/analytics/betting-model";

const factors = [
  "Forma recente",
  "Win rate por mapa",
  "Head-to-head",
  "Streak",
  "Rating medio",
  "Lado CT/TR",
  "Historico BO1/BO3",
];

export function BettingIntelligenceView() {
  const { data: matches = [] } = useLatestMatches();
  const { data: rankings = [] } = useRankings();
  const { history, saveAnalysis } = useAnalysisHistory();
  const bettingSuggestions = buildBettingSuggestions(matches, rankings);

  return (
    <div className="space-y-4">
      <section>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Inteligencia estatistica</div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50">Sugestoes de entradas</h1>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Modelo inicial de decisao</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {factors.map((factor) => (
              <Badge key={factor} variant="muted">{factor}</Badge>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-400">Analise estatistica baseada em dados historicos.</p>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        {bettingSuggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{suggestion.match}</CardTitle>
                <Badge variant="default">{suggestion.confidence}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold text-slate-100">{suggestion.market}</div>
              <div className="mt-2 text-xs text-slate-500">Edge: {suggestion.edge}</div>
              <p className="mt-4 text-sm leading-6 text-slate-400">{suggestion.rationale}</p>
              <Button className="mt-4 w-full" variant="secondary" onClick={() => saveAnalysis(suggestion)}>
                <Save className="h-4 w-4" />
                Salvar analise
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Historico salvo ({history.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length ? (
            history.slice(0, 6).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-slate-100">{entry.suggestion.market}</div>
                  <div className="text-xs text-slate-500">{entry.suggestion.match}</div>
                </div>
                <Badge variant="default">{entry.suggestion.confidence}%</Badge>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">Nenhuma analise salva ainda.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
