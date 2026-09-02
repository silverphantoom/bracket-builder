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
