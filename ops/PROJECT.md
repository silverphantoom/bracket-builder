# Bracket Builder Project

## Purpose

Bracket Builder lets someone create a shareable elimination bracket with 3 to
32 entries, send one link to a group, collect anonymous votes, and watch winners
advance to a final result.

## Primary user flow

1. A creator enters and orders bracket options.
2. The application creates the bracket and shareable slug.
3. Participants open the link, usually on a phone.
4. Participants vote in active matchups.
5. Matchups close and winners advance.
6. The bracket displays the final winner and results.

## Product principles

- Frictionless use is more important than account features.
- Mobile voting is a first-class experience.
- The creator flow should remain simple.
- Shared results should feel live and understandable.
- Reliability and vote integrity matter more than adding extra features.

## Current stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase JavaScript and SSR libraries
- `@dnd-kit` for drag-and-drop interactions
- Zod for validation

## Repository map

- `src/app/page.tsx`: home and creation entry
- `src/app/[slug]/`: shared bracket experience
- `src/app/api/`: server endpoints
- `src/components/bracket/`: bracket creation components
- `src/components/bracket-view/`: live bracket display and voting
- `src/components/results/`: result presentation
- `src/components/share/`: sharing experience
- `src/lib/`: application and Supabase helpers
- `supabase/migrations/`: database schema history
- `scripts/verify.sh`: TypeScript and production-build verification

## Hard constraints

- Do not require login without an explicit product decision from Peyton.
- Do not expose Supabase service credentials or production data.
- Do not run a production migration, reset, or destructive data operation.
- Do not deploy or change production configuration without explicit approval.
- Do not trade mobile usability for desktop-only polish.

## Definition of a healthy change

A change is bounded, understandable, mobile-aware, verified by the relevant
checks, reversible through Git, and explained in plain English before merge.
