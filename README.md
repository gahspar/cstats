# CS STATS

Aplicacao web moderna para analise estatistica de Counter-Strike 2. A fonte principal de dados e o pacote unofficial `hltv`, sempre executado no backend. A CSAPI.de permanece como fallback complementar.

> Analise estatistica baseada em dados historicos. As sugestoes nao garantem lucro.

## Stack

- Next.js 15 com App Router
- TypeScript
- TailwindCSS 4
- shadcn/ui style components
- TanStack Query
- Axios
- Recharts
- Supabase para Auth, PostgreSQL, Storage, cache e logs
- `hltv` unofficial package para ingestao server-side

## Arquitetura de Dados

```txt
HLTV NPM Package
  -> services/workers server-side
  -> Supabase/Postgres + cache
  -> API routes internas
  -> frontend
```

O frontend nunca importa ou executa o pacote `hltv` diretamente. As rotas internas leem somente dados locais do Supabase/cache:

- `/api/matches`
- `/api/live`
- `/api/teams`
- `/api/players`
- `/api/rankings`
- `/api/events`
- `/api/odds`

## Workers e Cron

Workers em `src/workers`:

- `syncLiveMatches` - partidas ao vivo, cache de 30 segundos.
- `syncMatches` - proximas partidas e partidas monitoradas.
- `syncRankings` - ranking HLTV, cache de 1 hora.
- `syncTeams` - detalhes dos times, cache de 6 horas.
- `syncPlayers` - detalhes de jogadores, cache de 6 horas.
- `syncOdds` - historico de odds, cache de 15 segundos.
- `syncEvents` - eventos, cache de 10 minutos.

Endpoint preparado para Vercel Cron ou Supabase Scheduler:

```bash
POST /api/cron/hltv?task=all
POST /api/cron/hltv?task=live
POST /api/cron/hltv?task=rankings
POST /api/cron/hltv?task=odds
```

Quando `CRON_SECRET` estiver configurado, envie `Authorization: Bearer <CRON_SECRET>`.

## Supabase

Execute as migrations em `supabase/migrations`:

- `001_initial_schema.sql`
- `002_hltv_data_platform.sql`

Tabelas principais:

- `teams`
- `players`
- `matches`
- `live_matches`
- `rankings`
- `maps_stats`
- `odds_history`
- `events`
- `processed_predictions`
- `sync_logs`
- `hltv_cache`

## Fallback CSAPI.de

A integracao CSAPI.de continua disponivel em `/api/cs/*` e nos services legados. Ela serve como fallback e complemento quando o cache HLTV ainda nao foi populado.

## Setup local

```bash
npm install
npm run dev
```

Crie um `.env.local` baseado em `.env.example`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
CS_API_BASE_URL=https://api.csapi.de
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
CRON_SECRET=
```

No `DATABASE_URL`, encode caracteres especiais da senha. Exemplo: `#` vira `%23` e `@` vira `%40`.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```

## Estrutura

```txt
src/app/              rotas App Router e APIs internas
src/components/       UI, layout e graficos reutilizaveis
src/features/         modulos de produto por dominio
src/hooks/            hooks client-side
src/services/hltv/    services server-side HLTV
src/repositories/     acesso Supabase/cache
src/workers/          jobs de sincronizacao
src/analytics/        analise de odds e movimentos
src/engine/           engine estatistica inicial
src/types/            contratos TypeScript
supabase/migrations/  schema SQL
```
