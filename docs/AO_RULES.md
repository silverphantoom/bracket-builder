# Agent Orchestrator Rules for Bracket Builder

## Portfolio limit

Across Peyton's Agent Orchestrator projects, keep at most three active
implementation workers and one reviewer. Prefer finishing, reviewing, or
stopping existing work before launching another worker.

## Project orchestrator

The orchestrator manages the project. It does not implement code.

Before recommending work, read `AGENTS.md` and all files under `ops/`, then
inspect the current Agent Orchestrator board, sessions, branches, pull requests,
checks, reviews, and any existing Vercel preview state.

The orchestrator may:

- Explain current state in plain English.
- Rank priorities by value, risk, dependency, and reversibility.
- Propose bounded tasks with acceptance criteria.
- Detect overlapping files or responsibilities.
- Launch a worker only after Peyton approves the task during the pilot.
- Request a reviewer.

The orchestrator may not:

- Edit source files or create implementation commits.
- Automatically start follow-up tasks it invents.
- Merge, promote a preview, deploy to production, modify production, or use a
  paid API route.

## Implementation worker

The worker owns one approved task in one isolated worktree.

The worker may:

- Read and edit files inside the assigned worktree.
- Run non-destructive local checks.
- Commit to the assigned branch.
- Push the assigned branch.
- Open or update a draft pull request.
- Allow the existing Git integration to create a non-production Vercel preview.

The worker may not:

- Push to `main`.
- Merge, invoke Vercel directly, promote a preview, or deploy to production.
- Change production Supabase data, schema, or configuration.
- Use `bypass-permissions`.
- Add an API key, usage credits, or pay-as-you-go fallback.
- Start proposed follow-up work.

## Reviewer

Codex is the default independent reviewer for Claude Code work. Reverse the
roles when Codex implements.

The reviewer must inspect the task, acceptance criteria, complete diff, project
context, test evidence, and non-production preview when the change is visible.
It should separate real merge blockers from optional follow-up ideas.

Use one verdict:

- `PASS`
- `PASS WITH CONCERNS`
- `CHANGES REQUIRED`
- `BLOCKED`

A reviewer never merges, promotes a preview, or deploys to production.

## Required task brief

```text
Task ID and title:
Why now:
Goal:
Acceptance criteria:
Expected files or area:
Required verification:
Out of scope:
Risk level:
Implementation owner:
Reviewer:
```

## Completion report

```text
Outcome:

What changed:
- ...

Files changed:
- ...

Verification:
- Command and result

Preview:
- URL and what was inspected, or why no preview exists

Risks or uncertainty:
- ...

Peyton should verify:
- ...

Rollback:
- ...

Proposed follow-up tasks, not started:
- ...
```
