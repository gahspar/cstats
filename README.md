# CS STATS

Aplicacao web moderna para analise estatistica de Counter-Strike 2, usando dados publicos da [CS API](https://www.csapi.de/).

## Stack

- Next.js 15 com App Router
- TypeScript
- TailwindCSS 4
- shadcn/ui style components
- TanStack Query
- Axios com retry e rate limit simples
- Zod para validacao de payloads
- Recharts para visualizacao
- Supabase para Auth, PostgreSQL, Storage e funcoes futuras

## Modulos iniciais

- Dashboard principal com indicadores, ranking, ultimas partidas, graficos e sugestoes estatisticas
- Times com ranking, win rate, streak, map pool e filtros
- Jogadores com rating, ADR, KAST, HS%, KD e historico base
- Partidas com calendario, formato, score e probabilidade calculada
- Inteligencia/apostas com fatores de decisao e disclaimer obrigatorio

> Analise estatistica baseada em dados historicos. As sugestoes nao garantem lucro.

## API

Base URL padrao:

```env
CS_API_BASE_URL=https://api.csapi.de
```

Endpoints mapeados inicialmente:

- `GET /counts`
- `GET /sides/` e `GET /sides/{id}`
- `GET /maps/` e `GET /maps/{id}`
- `GET /fantasy/` e `GET /fantasy/{id}`
- `GET /rankings/`
- `GET /matches/`, `GET /matches/latest`, `GET /matches/{matchid}` e `GET /matches/{matchid}/stats`
- `GET /teams/`, `GET /teams/{teamid}`, `GET /teams/{teamid}/matchhistory` e `GET /teams/{teamid}/stats`
- `GET /players/`, `GET /players/stats`, `GET /players/stats/raw`, `GET /players/stats/raw/{outcome}`, `GET /players/{playerid}` e `GET /players/{playerid}/stats/{group}`
- `GET /predict/{team_id_a}/{team_id_b}`
- `GET /status`

O browser consome o proxy interno `/api/cs/*`, que consulta a API publica no servidor e evita CORS. O client fica em `lib/api/csapi-client.ts` e os normalizadores tipados em `lib/api/csapi-service.ts`.

## Supabase

A migracao inicial esta em:

```txt
supabase/migrations/001_initial_schema.sql
```

Estruturas preparadas:

- Favoritos
- Historico de analises
- Times salvos
- Cache local
- Logs de partidas
- Estatisticas processadas

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
```

No `DATABASE_URL`, encode caracteres especiais da senha. Exemplo: `#` vira `%23` e `@` vira `%40`.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```

## Arquitetura

```txt
app/                  rotas App Router
components/           UI, layout e graficos reutilizaveis
features/             modulos de produto por dominio
hooks/                hooks client-side
lib/api/              client Axios, services, mock fallback
lib/supabase/         client Supabase
types/                contratos TypeScript
supabase/migrations/  schema SQL inicial
```

## Proximos passos recomendados

1. Adicionar paginas de detalhe para time, jogador e partida.
2. Persistir cache e historico analitico no Supabase.
3. Refinar modelo de probabilidade com pesos configuraveis.
4. Adicionar testes para normalizadores e scoring estatistico.
5. Criar Edge Function para ingestao agendada da CS API.
