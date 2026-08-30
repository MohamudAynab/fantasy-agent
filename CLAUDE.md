# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 1. Project facts

- **What this project is:** Fantasy football AI agent for the Bay Area BLITZ (ESPN) league — draft assistance, lineup optimization, waiver recommendations, trade analysis, injury monitoring, and freeform chat, all powered by Google Gemini (tool use)
- **Stack:** Expo / React Native (web + mobile), Express + TypeScript backend, Google Gemini SDK (`@google/genai`), ESPN Fantasy API (unofficial, cookie-based — see below)
- **Run (app):** `npx expo start`
- **Run (server):** `npm run server`
- **Lint / typecheck:** `npm run typecheck`

Use **`package.json`** for scripts — do not invent commands. If this file disagrees with the codebase or `package.json`, **the repo wins**.

---

## 2. Universal rules

**TypeScript:** Avoid `any`; use real types.

**Quality:** Before treating work as done, run typecheck. For API/DB/auth boundaries, add tests that exercise real wiring when the project already uses integration-style tests.

**Coding conventions:** React function components and hooks only. Components **PascalCase**; files camelCase per repo. Keep heavy logic out of JSX. On the API, no business logic in route handlers — use services. Follow existing patterns; do not override ad hoc.

**Security:**
- Always: validate input at HTTP boundaries with Zod; secrets in `.env` (gitignored); generic errors to clients, details only server-side.
- Never: log tokens or keys; commit secrets; expose stack traces to clients.
- Before meaningful auth or ESPN API changes: state the plan briefly first.

**Git:** Small focused commits; never commit `.env` or secrets; keep lockfiles in sync with `package.json`.

**Assistant behavior:** Do not commit, push, or change git config unless explicitly asked. Do not delete files or directories without explicit confirmation. Before edits: short plan, incremental changes. If something is ambiguous, stop and offer options.

---

## Stack: Expo / React Native

```bash
npx expo start
npx expo start --android
npx expo start --ios
npx expo install <pkg>   # use this instead of npm install for native deps
```

Layout: `src/screens/`, `src/api/`, `src/types/`, `components/` — match the repo; no new top-level folders without asking.

Use `SafeAreaView`, `ScrollView`, `KeyboardAvoidingView` where appropriate. All screens follow the same color palette (`#0f172a` bg, `#1e293b` surface, `#22c55e` accent).

---

## Stack: Node API (Express)

```bash
npm run server   # tsx --env-file .env server/index.ts → http://localhost:3001
```

**Agent architecture:** Every feature (draft, lineup, waivers, trades, injuries, chat) is a service in `server/services/` that calls `runAgent()` from `server/services/agent.ts`. The agent runner handles the Gemini function-calling loop (`ai.models.generateContent()` from `@google/genai`, default model `gemini-3.7-flash`) — tools are defined inline per service with a `handler` function, using the same provider-agnostic `AgentTool` shape regardless of the underlying model. Routes in `server/routes/` only validate input (Zod) and call the service. Requires `GEMINI_API_KEY` in `.env` (get one at aistudio.google.com/apikey).

**ESPN auth (cookie-based):** ESPN Fantasy has no public OAuth program — `server/services/espn.ts` authenticates using the `SWID` and `espn_s2` session cookies from a logged-in ESPN browser session, sent as a `Cookie` header on every request to ESPN's internal fantasy endpoints (`lm-api-reads.fantasy.espn.com`). The user pastes SWID/espn_s2/league id/team id/season into the in-app Connect screen, which posts to `POST /auth/espn`; credentials are stored in `.tokens.json` (gitignored, local-dev only — replace with a DB for production). Cookies aren't refreshable programmatically — if they expire, the user re-connects via the same screen. `GET /auth/status` reports connection state.

**Scoring engine:** `server/services/scoring.ts` implements the league's full custom scoring rules (`BAY_AREA_BLITZ_RULES`) independently of ESPN's own point calculations, since the league uses non-default bonuses (TD distance tiers, yardage-tier bonuses, IDP tackle/sack scoring). `calculatePlayerPoints()` is the single source of truth other services should use for point projections.

**Background jobs:** `server/jobs/monitor.ts` runs injury checks on a cron schedule. Currently logs to console — extend to send push notifications or webhooks.

---

## Local memory (Claude Code)

`CLAUDE.local.md` at the repo root is your **private overlay** — gitignore it. Use it for personal URLs, WIP notes, or anything not for the team. Claude Code loads both files; `CLAUDE.local.md` wins on conflicts.
