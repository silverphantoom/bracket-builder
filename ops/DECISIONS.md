# Bracket Builder Decisions

## D-001: No login for the core experience

**Status:** Active

Creating, sharing, and voting should remain frictionless. Authentication is not
part of the core MVP unless Peyton explicitly changes this decision.

## D-002: Mobile voting is primary

**Status:** Active

Most participants will open a shared bracket from a phone. Changes to voting,
matchups, sharing, and results must be evaluated on mobile.

## D-003: Reliability before feature expansion

**Status:** Active

The create, share, vote, advance, and winner path must be understood and
verified before major new features are added.

## D-004: One implementation owner per task

**Status:** Active for the Agent Orchestrator pilot

Claude Code and Codex may produce independent plans or reviews, but only one
implementation worker owns a task. This prevents colliding changes.

## D-005: Subscription-only model use

**Status:** Active for the Agent Orchestrator pilot

Use Peyton's authenticated Claude Code and ChatGPT/Codex subscriptions. Do not
add API keys, usage credits, or pay-as-you-go fallback.

## D-006: Manual merge and production approval

**Status:** Active

Workers may commit, push a task branch, and open a draft pull request. Peyton
must explicitly approve merge, production deployment, production configuration,
and production data changes.

## D-007: Automatic branch previews are allowed

**Status:** Active

The repository's existing Vercel Git integration may automatically build a
non-production preview when a task branch is pushed or a draft pull request is
opened. The preview is an approved verification surface. Agents may not invoke
Vercel directly, alter deployment settings or environment variables, promote a
preview, or deploy to production without Peyton's explicit approval.

## D-008: Closed-loop work-package operating model

**Status:** Active

Peyton approves a bounded work package once. That approval authorizes the
orchestrator to decompose the package into child tasks, rank and dependency-map
them, launch workers inside the approved scope, start newly unblocked child
tasks, run CI and verification, request reviews, return findings to the
implementation owner, and repeat the repair and re-review loop until each child
task reaches Ready or is genuinely blocked. Child tasks inside an approved
package need no separate approval.

This supersedes two earlier pilot rules:

- Per-task approval before launching any worker. Standalone tasks outside an
  approved package still need Peyton's approval.
- The fixed limit of three active implementation workers and one reviewer.
  Concurrency is now chosen dynamically inside hard pilot ceilings.

Unchanged by this decision:

- One implementation owner per task (D-004).
- Subscription-only model use (D-005).
- Manual merge and production approval (D-006). The completion gate can move a
  task to Ready, never to merged. Ready is not merge authority: any merge action
  needs a fresh explicit approval from Peyton naming the specific pull request
  or bounded set of pull requests, and can never be inferred from work-package
  approval, completion-gate success, a Codex `PASS`, green CI, or permission to
  mark a pull request Ready. The invariant and its PR #2 pilot evidence live in
  `docs/AO_RULES.md` under "READY != MERGE AUTHORITY".
- Peyton's explicit approval is still required for merge to `main`, production
  deployment, production Supabase or schema changes, credentials, billing or
  purchases, destructive or irreversible changes, external or customer
  communication, production data mutation, and widening an approved package.

The full model, including the concurrency policy, completion gate, closed review
loop, interruption policy, work package report, and review-launch health rule,
lives in `docs/AO_RULES.md`.
