# Fantasy Agent — Build Progress

Fantasy football AI agent for the Bay Area BLITZ (ESPN) league. Draft is Aug 23, 2026 @ 4:00 PM EDT.

## Context

The app was originally built against the Yahoo Fantasy API, but Bay Area BLITZ is hosted on ESPN — Yahoo's API has no visibility into ESPN leagues, so that integration could never work for this league. We migrated the whole app to ESPN's (unofficial, cookie-based) API and added a new Draft Assistant feature ahead of the Aug 23 draft, reusing the existing Express + `runAgent()` architecture rather than introducing new state/data libraries.

The agent runtime itself was later switched from Anthropic (Claude) to Google Gemini (`@google/genai`), since every feature service only ever talks to the shared `runAgent()`/`AgentTool` interface — never to the model SDK directly — the swap stayed contained to `server/services/agent.ts` plus one small history-mapping change in `chat.ts`.

## Completed

### Backend

- **[`server/services/espn.ts`](server/services/espn.ts)** — replaces `yahoo.ts`. Authenticates via `SWID`/`espn_s2` session cookies (ESPN has no OAuth program) instead of OAuth2. Verified live against the real league: confirmed league name "Bay Area BLITZ", 12 teams, team id 10, and a 300-player draft pool with real players (Jahmyr Gibbs, Bijan Robinson, Puka Nacua, etc).
- **[`server/services/scoring.ts`](server/services/scoring.ts)** — full custom scoring engine (`BAY_AREA_BLITZ_RULES`) encoding the league's exact PPR + bonus rules (TD distance tiers, yardage-tier bonuses, IDP tackle/sack/stuff scoring, kicking, return yardage), independent of ESPN's own point calculations. Unit tested per category and bonus threshold.
- **[`server/services/draft.ts`](server/services/draft.ts) + [`server/routes/draft.ts`](server/routes/draft.ts)** — new Draft Assistant service/route (`POST /api/draft/board`). Since ESPN has no public live-draft API, drafted players are tracked manually (passed in from the client) rather than auto-synced.
- **[`server/routes/auth.ts`](server/routes/auth.ts)** — `POST /auth/espn` replaces the Yahoo OAuth redirect/callback; `GET /auth/status` unchanged.
- `lineup.ts`, `waivers.ts`, `trades.ts`, `injuries.ts`, `chat.ts`, `monitor.ts`, `push.ts` all repointed from `yahoo` to `espn` (mechanical swap, same function signatures).
- `yahoo.ts` and `yahoo.test.ts` deleted.
- New tests: `espn.test.ts`, `scoring.test.ts`; `routes.test.ts` extended for `/auth/espn` and `/api/draft/board`.
- **[`server/services/agent.ts`](server/services/agent.ts)** — rewritten on `@google/genai` (`GoogleGenAI`, `ai.models.generateContent()`, default model `gemini-3.7-flash`) replacing the Anthropic SDK. Same `runAgent()`/`AgentTool` signature, so no feature service needed changes beyond `chat.ts`'s history mapping (`role: 'assistant'|'user'` → Gemini's `'model'|'user'`, wrapped in `parts: [{text}]`). Verified against the SDK's own installed type definitions (not just docs, which were inconsistent) to get the function-calling shapes exactly right.
- `agent.test.ts` rewritten to mock `@google/genai` instead of `@anthropic-ai/sdk`, same 3 test cases (end-of-turn text, one tool round trip, 10-iteration cap).
- **40/40 tests passing, `npm run typecheck` clean.**

### Frontend

- **[`src/screens/ConnectScreen.tsx`](src/screens/ConnectScreen.tsx)** rebuilt — form for SWID / espn_s2 / league id / team id / season (replacing the old "Connect Yahoo" OAuth button), styled with the shared theme tokens.
- **[`src/screens/DraftAssistantScreen.tsx`](src/screens/DraftAssistantScreen.tsx)** (new) — ranked player board, tap-to-mark-drafted (by me or by others), live recommendation panel, wired into a new "Draft" tab in `App.tsx`.
- **[`src/api/client.ts`](src/api/client.ts)** — `connectEspn()` and `getDraftBoard()` added; `getYahooAuthUrl()` removed.
- **[`src/types/index.ts`](src/types/index.ts)** — added `DraftRecommendation`.
- Two real TypeScript bugs found and fixed during typecheck (bad multi-child JSX passed to `SectionTitle`, which only accepts a single string).

### Config

- **`.tokens.json`** seeded with the real ESPN session (SWID/espn_s2/leagueId/teamId/seasonId) captured via an authenticated browser session, so the app connects immediately without re-typing long cookie strings. Gitignored, not committed.
- **`.env`** cleaned of dead Yahoo vars (`YAHOO_CLIENT_ID`, etc — no longer used anywhere). `ANTHROPIC_API_KEY` removed and replaced with `GEMINI_API_KEY` (currently empty — needs a real key from aistudio.google.com/apikey).
- **`.env.example`** updated to match (ESPN needs no env vars; `GEMINI_API_KEY` documented).
- **[`CLAUDE.md`](CLAUDE.md)** updated: stack line, ESPN auth section, scoring engine section, agent architecture section (Gemini instead of Claude).
- `package.json` — `@anthropic-ai/sdk` removed, `@google/genai` (v2.19.0) added.

### Verification performed

- `npm run typecheck` — clean.
- `npm test` — 40/40 passing.
- Live server smoke test — `/auth/status` returns `authenticated: true` off the seeded token file.
- Live ESPN API calls (`getLeagueSettings`, `getRoster`, `getPlayerPool`) run directly against the real league and returned correct data.
- Gemini wiring confirmed end-to-end — a real `POST /api/draft/board` call reaches Google's API and fails with a clean, expected 403 "unregistered caller" error (since `GEMINI_API_KEY` isn't set yet), not a crash — proving the full ESPN → scoring → agent → Gemini chain is correctly wired.

## Known issues / blockers

1. **`GEMINI_API_KEY` is not set.** Every agent-backed endpoint (draft, lineup, waivers, trades, chat) needs a real key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) added to `.env` before it'll return real responses.
2. **Expo's web bundler is broken**, unrelated to either migration: `react-native-reanimated` v4's Babel plugin requires `react-native-worklets`, which isn't installed. Installing it directly hits an `@types/react` peer-dependency conflict already present in `package.json` (`react-native@0.81.5` wants `@types/react@^19.1.0`, but the repo pins `~19.0.0`). This has **not** been resolved — the Draft Assistant and Connect screens have not been visually verified in a browser yet.

## Remaining / Next steps

- [ ] Add a real `GEMINI_API_KEY`, then re-verify `/api/draft/board` (and lineup/waivers/trades/chat) return real recommendations end-to-end.
- [ ] Resolve the Expo web dependency conflict (likely needs a coordinated bump of `@types/react`, `react-native-safe-area-context`, `react-native-screens`, `react-native-web`, `expo-status-bar`, and `typescript` to the versions Expo 54 expects, or pinning `react-native-worklets` compatibly) so the app can actually run in a browser.
- [ ] Visually verify `ConnectScreen` and `DraftAssistantScreen` once the bundler is fixed; exercise the full Connect → Dashboard → Draft tab flow.
- [ ] Frontend design pass (next task, in progress).
- [ ] Cookies (`SWID`/`espn_s2`) aren't refreshable programmatically — confirm the Connect screen's re-entry flow works when the session eventually expires.
- [ ] Longer-term, from the original project brief (not yet started): lineup optimization refinements once real ESPN roster data exists post-draft, live scoring infrastructure, waiver wire recommendation tuning, push notifications beyond console logging, and replacing the file-based token store (`.tokens.json`) with a real DB before this goes beyond local single-user dev use.
