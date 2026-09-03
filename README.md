# Bracket Builder

Bracket Builder turns any argument into a shareable single elimination bracket.
A creator types in 3 to 32 options, gets one link, and sends it to a group.
Everyone who opens the link votes on the current matchups from their phone,
winners advance automatically, and the bracket ends on a single winner.

No account, no login, no app install. That is the point.

## Core user flow

1. A creator opens the home page, names the bracket, and enters and orders the
   options.
2. The app builds the bracket, assigns seeds, and generates a short shareable
   slug (for example `/best-taco-a1b2`).
3. The creator shares that one link.
4. Participants open the link, usually on a phone, and vote in the matchups
   that are currently active.
5. When a matchup reaches the bracket's vote threshold it closes, and its
   winner advances into the next round's matchup.
6. When the final matchup closes, the bracket is marked complete and the app
   shows the winner and the results.

Details worth knowing:

- Entry count is 3 to 32. The bracket is rounded up to the next power of two
  (4, 8, 16, or 32) and any empty slots are filled with BYEs, which resolve
  immediately.
- The vote threshold is set at creation time (5 to 50, default 10). It is the
  number of votes that closes a single matchup, not the whole bracket.
- Votes are anonymous. A voter is identified by an `httpOnly` cookie, and a
  database uniqueness constraint stops the same voter from voting twice in the
  same matchup. Vote submissions are also rate limited per IP.
- The creator gets a separate creator cookie, which lets them edit the title
  and description, force close a matchup, or reset the bracket.

## Requirements

- Node.js 22 or newer (the GitHub Actions verification job uses Node 22)
- npm (the repository ships a `package-lock.json`)
- A Supabase project you are allowed to write to, with the schema in
  `supabase/migrations/` applied

## Install

```bash
npm install
```

## Environment

Copy the tracked example file and fill in your own development values locally:

```bash
cp .env.local.example .env.local
```

`.env.local` needs these three variable names:

| Variable | What it is for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | The Supabase project URL. Sent to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The Supabase anonymous key. Sent to the browser. Read only under row level security. |
| `SUPABASE_SERVICE_KEY` | The Supabase service role key. Server only. It bypasses row level security and is used by the API routes to write brackets, matchups, and votes. |

Secret handling rules:

- Never commit `.env.local`. It is covered by `.gitignore`.
- Never paste a real key value into a README, a commit, a pull request, an
  issue, a chat message, or an agent report. Variable names only.
- `SUPABASE_SERVICE_KEY` must never reach client code. Only server code under
  `src/app/api/`, `src/app/[slug]/`, and `src/lib/supabase/server.ts` may read
  it.
- If a service key is ever exposed, rotate it in Supabase before anything else.

## Run locally

```bash
npm run dev
```

Then open the local address Next.js prints, normally
[http://localhost:3000](http://localhost:3000).

Point the app at a development Supabase project, not production data.

## Verify

```bash
bash scripts/verify.sh
```

That script runs, in order:

1. `npx next typegen` (generates Next.js route types)
2. `npx tsc --noEmit` (TypeScript check)
3. `npm run build` (production build)

The same three checks run in GitHub Actions on every pull request through
`.github/workflows/verify.yml`.

A green build proves the code compiles. It does not prove the voting flow
works. For any change that touches creation, voting, matchup closing, round
advancement, or results, also walk the flow by hand against a development
Supabase project: create a small bracket, open the share link in a second
private browser session, vote, confirm totals and the active matchup update,
confirm a winner advances, and check both a narrow (phone) and a wide layout.
`ops/RUNBOOK.md` has the full smoke check.

Linting is available separately with `npm run lint`. It is not part of
`scripts/verify.sh`.

## Repository map

- `src/app/page.tsx`: home page and creation entry
- `src/app/[slug]/`: the shared bracket experience, including the Open Graph
  share image
- `src/app/api/`: server endpoints
  - `POST /api/brackets`: create a bracket, its seeded options, and every
    matchup
  - `GET /api/brackets/recent`: the most recent public brackets
  - `GET|PATCH /api/brackets/[bracketId]`: full bracket state, plus the
    creator-only update, force close, and reset actions
  - `POST /api/vote`: cast one vote, close the matchup at threshold, and
    advance the winner
  - `GET /api/results/[bracketId]`: lightweight vote and status snapshot
- `src/components/bracket/`: bracket creation components (drag to reorder via
  `@dnd-kit`)
- `src/components/bracket-view/`: live bracket display and voting
- `src/components/results/`: result presentation
- `src/components/share/`: sharing experience
- `src/components/layout/`, `src/components/ui/`: shared shell and primitives
- `src/lib/`: application and Supabase helpers (bracket seeding and advancement
  logic, slug generation, voter and creator cookies, rate limiting)
- `src/types/bracket.ts`: row types and the Zod request schemas
- `src/middleware.ts`: Supabase session refresh middleware
- `supabase/migrations/`: database schema history
- `scripts/verify.sh`: TypeScript and production-build verification
- `ops/`, `docs/`, `AGENTS.md`: project context and agent working rules

## Data model

Four tables, defined in `supabase/migrations/001_initial.sql`:

- `brackets`: title, description, slug, creator token, size, vote threshold,
  status, and the final winner name
- `bracket_options`: one row per entry, with its seed and its BYE flag
- `matchups`: round, position, the two option slots, vote counts, winner, and
  the link to the next round's matchup and slot
- `votes`: one row per vote, unique on (matchup, voter)

All four tables have row level security enabled with public read policies and
no anonymous write policies. Every write goes through an API route using the
service role key, which is why that key stays server side.

## Safety and approval boundaries

This repository is run through Peyton's Agent Orchestrator pilot. Anyone
working in it, human or agent, must respect these boundaries:

- **Deployment requires Peyton's explicit approval.** Do not deploy to
  production, promote a Vercel preview, or change Vercel project settings,
  domains, or environment variables. The existing Git integration may build a
  non-production preview automatically for a pushed branch or pull request, and
  that preview is an allowed verification surface.
- **Production Supabase changes require Peyton's explicit approval.** Do not
  apply or alter a live migration, and do not reset, delete, or edit production
  data. Use a development project instead.
- **No login without an explicit product decision.** Creating, sharing, and
  voting stay frictionless (`ops/DECISIONS.md`, D-001).
- **Mobile voting is a primary use case.** Evaluate changes on a phone-sized
  layout (`ops/DECISIONS.md`, D-002).
- **Never expose secrets or user data**, including `.env.local`, the service
  role key, cookies, and voter identifiers.
- Merges to `main` are Peyton's call. Workers commit to a task branch, push it,
  and open a draft pull request.

## Project documentation

Read these before making a change:

- `ops/PROJECT.md`: purpose, principles, stack, and hard constraints
- `ops/NOW.md`: current phase, objective, and the active task sequence
- `ops/DECISIONS.md`: standing product and process decisions
- `ops/RUNBOOK.md`: install, environment, run, verify, smoke check, and
  rollback
- `AGENTS.md` and `docs/AO_RULES.md`: agent roles, permissions, and the
  required task brief and completion report formats

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase
(`@supabase/supabase-js` and `@supabase/ssr`), `@dnd-kit` for drag and drop,
and Zod for request validation.
