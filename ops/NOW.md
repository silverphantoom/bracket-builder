# Bracket Builder Current State

**Last updated:** September 2, 2026

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
- The current `README.md` is still generic Create Next App boilerplate.
- No fresh local verification result has been recorded for this pilot yet.

## Agent Orchestrator starter sequence

### BB-001: Replace the boilerplate README

**Owner:** Claude Code  
**Reviewer:** Codex  
**Risk:** Low

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
