@AGENTS.md

# CLAUDE.md: Bracket Builder

Bracket Builder is a frictionless bracket voting app. A creator enters 3 to 32
options, shares a link, and participants vote while results and later rounds
advance.

## Stack

- Next.js 16, React 19, Tailwind CSS, TypeScript
- Supabase for persistence and voting data
- `@dnd-kit` for drag-and-drop bracket creation
- Development command: `npm run dev`
- Verification command: `bash scripts/verify.sh`

## Canonical project context

Read `ops/PROJECT.md`, `ops/NOW.md`, `ops/DECISIONS.md`, and `ops/RUNBOOK.md`.
Agent Orchestrator role and review rules live in `docs/AO_RULES.md`.

## Product constraints

- No login required. Frictionless sharing is central to the product.
- Voting must work well on phones.
- Keep bracket creation simple.
- Do not touch production Supabase data or deploy without Peyton's approval.
