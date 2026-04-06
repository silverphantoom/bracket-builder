@AGENTS.md

# CLAUDE.md — Bracket Builder

Viral bracket voting app. Create a bracket with 3-32 entries, share a link, watch live votes.

## Stack
- Next.js 16, React 19, Tailwind, TypeScript
- Supabase (persistence, realtime voting)
- @dnd-kit (drag-and-drop bracket creation)
- Run: `npm run dev` (port 3000)

## Key Files
- `src/app/page.tsx` — main page
- `src/components/BracketCreator` — bracket creation UI

## Rules
- No login required — frictionless sharing is the product
- Must work on mobile (voting happens on phones)
- Keep bracket creation simple — don't over-complicate the UX
