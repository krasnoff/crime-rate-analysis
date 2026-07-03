# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Next.js (App Router) app that lets users ask questions in **Hebrew, natural language** about Israeli crime statistics and get back an AI-generated SQL query plus a results table. The UI itself is RTL/Hebrew; keep that in mind when touching `app/page.tsx`.

Flow: user types a question → `generateQuery` (server action) sends it + a schema-describing system prompt to an LLM → LLM returns SQL in a code block → the code extracts/cleans the SQL → `runGeneratedSQLQuery` (server action) validates it's read-only and executes it against Vercel Postgres → results render as a table.

## Commands

- `npm run dev` — start dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint (flat config, `next/core-web-vitals` + `next/typescript`)

There is no test suite configured in this repo.

## Architecture

- `app/actions.ts` — the two server actions that do all the work:
  - `generateQuery(input)`: calls the LLM (currently configured via `createOpenAI` pointed at an OpenAI-compatible endpoint, using `OLLAMA_BASE_URL`/`OLLAMA_API_KEY`/`OLLAMA_MODEL` env vars — despite the var names, any OpenAI-compatible provider works) with `lib/system_prompt.ts` as the system prompt, then extracts a SQL query from the response text (from a fenced code block, or by regex-matching a leading `SELECT`/`WITH` statement) and strips comments/explanatory text.
  - `runGeneratedSQLQuery(query)`: guards that the query starts with `select`/`with` and contains none of `drop/delete/insert/update/alter/truncate/create/grant/revoke` (naive substring check — not a real SQL sanitizer), then runs it via `@vercel/postgres`'s `sql.query`.
  - Both are server-only (`"use server"`).
- `lib/system_prompt.ts` — the single source of truth for the Postgres schema the LLM is told about (tables: `crimestatistics`, `policedistricts`, `policemerhavim`, `policestations`, `statisticareas`, `yeshuvim`, `municipal`, `statisticgroups`, `statistictypes`, and several link tables) plus prompting rules (e.g. always return ≥2 columns of quantitative/plottable data, use `LIKE '%value%'` for name lookups, specific Hebrew term normalizations like `דרום` → `דרומי`). When the actual DB schema changes, update this file — it's not derived from the DB at runtime.
- `app/page.tsx` — single-page client component holding all UI state (query input, sample queries, `localStorage`-backed query history, results table, error/loading states). Calls the two server actions directly.
- `types/result.ts` — `Result = Record<string, string | number>`, the shape of a single result row (column name → value). Any change to what `runGeneratedSQLQuery` can return should stay compatible with this.
- `components/please-wait.tsx` — loading spinner shown while a query is in flight.
- `app/[transport]/route.ts` — stateless MCP server (via `mcp-handler`), served at `/mcp` (Streamable HTTP) and `/sse` (legacy SSE). Exposes the DB schema as the `schema://crime-db` resource (reuses `lib/system_prompt.ts` as the resource text) and a `run_crime_sql` tool that executes a query through `runGeneratedSQLQuery`. This lets an external MCP client (e.g. Claude Desktop) write and run its own SQL against the same DB/guard instead of going through `generateQuery`.

## Environment variables (`.env`)

- `OLLAMA_BASE_URL`, `OLLAMA_API_KEY`, `OLLAMA_MODEL` — LLM endpoint config used by `generateQuery` (OpenAI-compatible API; not necessarily Ollama despite the name).
- `POSTGRES_URL` (+ related `POSTGRES_*` vars) — used implicitly by `@vercel/postgres`'s `sql` import.
- `GOOGLE_GENERATIVE_AI_API_KEY` — present in `.env`; `@ai-sdk/google` and `@ai-sdk/mistral` are installed dependencies but not currently wired up in `app/actions.ts` (only the OpenAI-compatible provider is used there).

## Notes for making changes

- SQL safety in `runGeneratedSQLQuery` is a substring blocklist, not real parsing — if you touch it, don't assume it's airtight (e.g. it doesn't prevent injection via a crafted string literal containing an allowed word in a comment, etc.).
- The system prompt in `lib/system_prompt.ts` is long and schema-specific; when adding new tables/columns to the DB, mirror the same description style (table shape, field-by-field description, relationships, Hebrew synonyms) so the LLM can reliably reference them.
- The UI is entirely in `app/page.tsx` as one component — there's no component library or state management beyond `useState`/`useEffect`.
