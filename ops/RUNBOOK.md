# Bracket Builder Runbook

## Local prerequisites

- Git
- Node.js and npm compatible with the checked-in lockfile
- A Supabase project or safe development credentials
- Claude Code signed in with Peyton's Claude subscription for Claude workers
- Codex signed in with Peyton's ChatGPT subscription for Codex workers

## Install

```bash
npm install
```

## Environment

Copy the example file:

```bash
cp .env.local.example .env.local
```

Fill in the development values locally:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
```

Never commit `.env.local`. Never print secret values in an agent report, pull
request, issue, or chat.

## Run locally

```bash
npm run dev
```

Then open the local address printed by Next.js, normally
`http://localhost:3000`.

## Verify

```bash
bash scripts/verify.sh
```

The script currently runs:

1. `npx tsc --noEmit`
2. `npm run build`

A successful build does not prove the full voting flow. Important changes also
need a manual or automated product-flow check.

## Safe manual smoke check

Use a development Supabase environment only.

1. Create a small bracket.
2. Open its share link in a separate private browser session.
3. Submit votes from separate test identities where supported.
4. Confirm active matchup state and vote totals update.
5. Confirm a winner advances correctly.
6. Continue until the final winner appears.
7. Check the narrow and wide layouts.

## Vercel preview review

Pushing an Agent Orchestrator task branch or opening its draft pull request may
trigger the repository's existing Vercel integration. This creates a
non-production preview.

Use the preview to inspect visible changes on desktop and phone-sized layouts.
The worker should include the preview URL in its completion report when one is
available. A ready preview is evidence that Vercel built the branch, but it does
not replace local tests, GitHub checks, product-flow verification, or review.

Agents may not run a Vercel deployment command, change Vercel environment
variables, modify domains or project settings, promote a preview, or deploy to
production.

## Production boundaries

Do not:

- Apply or alter a live Supabase migration.
- Reset or delete production data.
- Expose a service-role key.
- Promote a Vercel preview or deploy to production.
- Change a production environment variable, domain, or project setting.

Each requires Peyton's explicit approval and a rollback plan.

## Rollback

Before merge, abandon or revert the task branch. After merge, create a normal
revert commit for the specific change. Do not rewrite shared branch history.
