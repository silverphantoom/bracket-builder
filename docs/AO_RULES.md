# Agent Orchestrator Rules for Bracket Builder

## Portfolio limit

Across Peyton's Agent Orchestrator projects, keep at most three active
implementation workers and one reviewer. Prefer finishing, reviewing, or
stopping existing work before launching another worker.

## Project orchestrator

The orchestrator manages the project. It does not implement code.

Before recommending work, read `AGENTS.md` and all files under `ops/`, then
inspect the current Agent Orchestrator board, sessions, branches, pull requests,
checks, and reviews.

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
- Merge, deploy, modify production, or use a paid API route.

## Implementation worker

The worker owns one approved task in one isolated worktree.

The worker may:

- Read and edit files inside the assigned worktree.
- Run non-destructive local checks.
- Commit to the assigned branch.
- Push the assigned branch.
- Open or update a draft pull request.

The worker may not:

- Push to `main`.
- Merge or deploy.
- Change production Supabase data, schema, or configuration.
- Use `bypass-permissions`.
- Add an API key, usage credits, or pay-as-you-go fallback.
- Start proposed follow-up work.

## Reviewer

Codex is the default independent reviewer for Claude Code work. Reverse the
roles when Codex implements.

The reviewer must inspect the task, acceptance criteria, complete diff, project
context, and test evidence. It should separate real merge blockers from optional
follow-up ideas.

Use one verdict:

- `PASS`
- `PASS WITH CONCERNS`
- `CHANGES REQUIRED`
- `BLOCKED`

A reviewer never merges or deploys.

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

Risks or uncertainty:
- ...

Peyton should verify:
- ...

Rollback:
- ...

Proposed follow-up tasks, not started:
- ...
```
