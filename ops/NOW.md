# Bracket Builder Current State

**Last updated:** September 3, 2026

## Current phase

MVP re-entry and validation.

## Current objective

Make the existing MVP easy to understand, run, verify, and safely improve. Then
audit the full create, share, vote, advance, and winner flow before choosing new
features.

## Known repository state

- A complete MVP implementation is present.
- The repository includes Next.js, Supabase, voting, bracket creation, sharing,
  and results code.
- `scripts/verify.sh` performs a TypeScript check and production build.
- `README.md` now documents the product, setup, environment variable names,
  verification, repository map, data model, and approval boundaries. It is no
  longer Create Next App boilerplate.
- Fresh local verification has been recorded for this pilot: `git diff --check`
  and `bash scripts/verify.sh` both passed on BB-001.

## Operating model

The pilot now runs the closed-loop work-package model recorded as D-008 in
`ops/DECISIONS.md`. Peyton approves a bounded work package once, and the
orchestrator runs decompose, execute, verify, review, repair, and advance until
each child task is Ready or genuinely blocked. Per-task approval and the fixed
three-worker/one-reviewer limit no longer apply. The full rules, including the
dynamic concurrency policy, completion gate, interruption policy, and work
package report, live in `docs/AO_RULES.md`.

Merge, production deployment, production Supabase changes, credentials, billing,
destructive changes, external communication, and widening a package still
require Peyton's explicit approval.

## Agent Orchestrator starter sequence

### BB-001: Replace the boilerplate README — complete

**Owner:** Claude Code  
**Reviewer:** Codex  
**Risk:** Low

Status: merged to `main` on September 3, 2026 as `b794981` via pull request
number 2, with `git diff --check` and `bash scripts/verify.sh` passing.

Goal: Replace the generic README with accurate product, local setup,
environment, verification, architecture, and safety instructions.

Acceptance criteria:

- Explains the product and core user flow.
- Documents `.env.local.example` without exposing secrets.
- Documents install, development, and `bash scripts/verify.sh`.
- Describes the main repository areas.
- Clearly states that deployment and production Supabase changes require
  Peyton's approval.
- Makes no application-behavior change.
- Passes `git diff --check` and the existing verification script when the local
  environment supports it.

### BB-002: Audit the critical product flow

**Owner:** Codex or Claude Code in read-only planning mode  
**Reviewer:** The other model  
**Risk:** Low

Goal: Trace create, share, anonymous vote, matchup closing, round advancement,
and final-winner behavior. Produce a ranked issue report with evidence. Do not
edit source code.

### BB-003: Fix one approved critical-flow issue

Choose only after Peyton reviews BB-002. One model owns implementation. The
other model reviews the pull request. Do not launch both implementations.

## Not now

- Accounts or authentication
- Monetization
- Major redesign
- Production deployment
- Production database migration
- Multiple simultaneous workers touching the voting or advancement logic
