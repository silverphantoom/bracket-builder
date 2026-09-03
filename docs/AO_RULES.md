# Agent Orchestrator Rules for Bracket Builder

## Operating model

Bracket Builder runs a closed-loop work-package model (decision D-008). Peyton
approves a bounded work package once. The orchestrator then runs decompose,
execute, verify, review, repair, and advance until every child task is Ready or
genuinely blocked, without stopping for per-step approval.

A standalone task that is not part of an approved work package still needs
Peyton's approval before a worker is launched. The approvals listed under
"Approvals that always require Peyton" are unchanged by this model.

Each rule below has one home in this file. Cross-reference a rule rather than
restating it.

## Work package authorization

A work package is a bounded objective with an approved scope: a stated
objective, a risk class, named systems and repositories, and an external-action
boundary.

Peyton's single approval of a work package authorizes the orchestrator to:

- Decompose the package into child tasks.
- Rank those child tasks and map their dependencies.
- Launch workers within the approved scope.
- Start newly unblocked child tasks automatically.
- Run CI and the required verification.
- Request reviews.
- Return review comments to the implementation owner.
- Rerun verification after fixes.
- Continue the repair and re-review loop until each child task reaches Ready or
  is genuinely blocked.

Child tasks inside an approved package need no separate approval from Peyton.

The orchestrator may not expand a package beyond its approved objective, risk
class, systems, repositories, or external-action boundary. New ideas discovered
during execution become Proposed Follow-ups. They are not started automatically
unless the work is necessary to satisfy the approved acceptance criteria.

## Concurrency policy

Worker count is a judgment call, not a fixed number. The orchestrator chooses it
from:

- Task independence and the dependency graph
- Expected time saved by parallelism
- File and subsystem overlap between tasks
- Risk of the change
- Model and subscription efficiency
- Coordination overhead
- Current machine and resource pressure

Rules:

- Use the smallest team that does the job.
- Use one worker when the work is sequential or overlapping.
- Use multiple workers only for genuinely independent workstreams.
- Never spawn a worker only because capacity exists. Prefer finishing existing
  work over creating unnecessary new work.
- Read-only research or audit workers may use greater parallelism than
  code-writing workers, because their collision risk is lower. They still count
  against the total session ceiling.
- Above four simultaneous implementation workers, state why the extra
  concurrency materially shortens the critical path.
- Reduce concurrency automatically on resource contention, model throttling,
  repeated merge conflicts, or rising coordination cost.

Hard safety ceilings during the pilot. These are runaway guards, not targets:

- 8 active worker sessions total across the portfolio, including implementation,
  research, and audit workers
- 2 active reviewer sessions
- 4 code-writing workers in one repository
- 1 code-writing worker per overlapping subsystem/file area

## Project orchestrator

The orchestrator manages the project. It does not implement code.

Before recommending work, read `AGENTS.md` and all files under `ops/`, then
inspect the current Agent Orchestrator board, sessions, branches, pull requests,
checks, reviews, and any existing Vercel preview state.

The orchestrator may:

- Explain current state in plain English.
- Rank priorities by value, risk, dependency, and reversibility.
- Propose bounded tasks and work packages with acceptance criteria.
- Detect overlapping files or responsibilities.
- Launch a worker for any child task inside an approved work package. Launch a
  worker for a standalone task only after Peyton approves that task.
- Request a reviewer and run the closed review loop.
- Run the completion gate and move a passing task to Ready.

The orchestrator may not:

- Edit source files or create implementation commits.
- Start work it invents outside the approved package.
- Merge, promote a preview, deploy to production, modify production, or use a
  paid API route.

## Implementation worker

The worker owns one task in one isolated worktree (decision D-004).

The worker may:

- Read and edit files inside the assigned worktree.
- Run non-destructive local checks.
- Commit to the assigned branch.
- Push the assigned branch.
- Open or update a draft pull request.
- Allow the existing Git integration to create a non-production Vercel preview.
- Apply review findings and re-verify inside the closed review loop.

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

## Closed review loop

Every task inside a work package runs this loop:

implement -> verify -> draft pull request -> CI and preview -> independent
review -> if changes are requested, return the findings to the implementation
owner -> fix -> re-verify -> re-review the current head -> repeat until `PASS`
or a genuine blocker -> completion gate -> Ready.

Repair iterations inside an approved work package are routine. Do not ask Peyton
to approve them.

## Completion gate

A task moves from Draft or Validating to Ready automatically only when every
applicable condition passes:

- Acceptance criteria satisfied
- Implementation stayed inside authorized scope
- Required local verification passed
- Remote CI passed on the current pull-request head SHA
- Preview passed when applicable
- Latest configured independent review of the current head is `PASS`
- All merge-blocking review threads resolved
- No unresolved `CHANGES REQUIRED` verdict on the current head
- No unresolved High or Critical concern
- No unauthorized production or external action occurred
- Working tree clean
- Assigned branch pushed
- Pull request accurately describes the current implementation
- Rollback path documented

When the gate passes, the orchestrator is authorized to:

- Mark the draft pull request Ready for Review.
- Stop or idle the implementation worker.
- Place the task in Agent Orchestrator's Ready column.
- Include the task in the next summary for Peyton.

The orchestrator may not merge. See "READY != MERGE AUTHORITY" below.

## READY != MERGE AUTHORITY

Ready is a review state. It is not permission to merge.

- A successful completion gate authorizes Draft -> Ready only.
- It never authorizes: merge, squash merge, rebase merge, enabling auto-merge,
  or pushing directly to `main`.
- Before any merge action, there must be a fresh explicit Peyton approval naming
  the specific pull request or bounded set of pull requests to merge.
- Merge authority must never be inferred from: approval of a work package;
  approval to execute a task; completion-gate success; Codex `PASS`; green CI;
  the phrase "Ready"; prior merge approvals; or permission to mark a pull
  request Ready for Review.

Merge stays Peyton's explicit decision (D-006).

> Pilot evidence (PR #2, BB-001, merged 2026-09-03 as b794981): PR #2 moved
> from Ready to merged on the strength of a brief conversational go-ahead
> ("go ahead with the merge") given in the governing conversation before any
> formal definition of merge authority existed. The approval did not name the
> PR explicitly, and nothing in the rules at the time distinguished Ready from
> merge authority or defined what a valid merge approval must contain. This
> invariant closes that ambiguity: only a fresh explicit approval naming the
> specific PR (or bounded set of PRs) authorizes any merge action.

## Interruption policy

During an approved work package, do not interrupt Peyton for:

- Reversible implementation choices
- Running tests
- Fixing CI
- Responding to review comments
- Retrying a failed non-destructive check
- Starting an already-approved child task
- Creating commits
- Pushing a task branch
- Opening a draft pull request or marking one Ready

Interrupt Peyton only when:

- The approved objective would have to expand.
- A product decision has multiple materially different outcomes.
- A High or Critical security issue requires a product or architecture choice.
- Production data or schema mutation is required.
- Credentials, billing, or money are involved.
- Deployment or merge approval is required.
- An external message or action is required.
- A destructive or irreversible operation is required.
- The orchestrator cannot resolve a blocker safely inside the approved package.

## Approvals that always require Peyton

These boundaries are unchanged by the work-package model:

- Merge to `main` (see "READY != MERGE AUTHORITY")
- Production deployment
- Production Supabase or schema changes
- Credentials
- Billing or purchases
- Destructive or irreversible changes
- External or customer communication
- Production data mutation
- Widening an approved work package

Also unchanged: Claude Code is the default orchestrator and implementation
worker, Codex is the default independent reviewer, first-party subscription
authentication only (decision D-005), no API keys or usage-credit fallback, and
never `bypass-permissions`.

## Review-launch health

Before starting a work package that depends on automated review, verify that the
configured reviewer can actually launch.

If a review launch fails:

1. Attempt one safe self-recovery.
2. Diagnose the local Agent Orchestrator or runtime issue.
3. Do not create an ad-hoc infinite watcher loop.
4. If recovery succeeds, continue the package.
5. If recovery fails, move the task to Needs Peyton / Blocked and report the
   exact failure.

Never claim a review is running when it is not.

### Pilot evidence: the BB-001 review-launch failure

On 2026-09-03 at approximately 04:20 UTC, the first Codex review launch for
BB-001 (pull request #2) failed with the Agent Orchestrator error
`REVIEW_OPERATION_FAILED`. The recorded cause was a reviewer pane-replacement
step whose liveness probe was inconclusive because the system tmux default
socket `/private/tmp/tmux-501/default` did not exist ("error connecting ... No
such file or directory" while inspecting the legacy session
`review-bracket-builder-2`).

Recovery: the orchestrator started the system tmux server with a detached
placeholder session, retriggered, and all subsequent review launches succeeded.
The placeholder later exited on its own, leaving a stale socket file.

Outcome, 2026-09-03: the orchestrator tested the workaround during BB-004's own
review launch. That review launched successfully with no system tmux server
running at all, so the placeholder is not currently necessary. The BB-001
failure came from a stale legacy session record that has since cleared, and the
placeholder has been removed.

Durable rule: if a review launch fails with this legacy-socket error, the one
safe self-recovery is to start the system tmux server with a detached
placeholder session and retrigger once.

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

## Work package report

The orchestrator reports a work package to Peyton in this format:

```text
WORK PACKAGE:
Objective:
Status:

ACTIVE:
- task / worker / phase / last meaningful progress

READY:
- task / PR / CI / reviewer verdict / human verification

BLOCKED:
- task / exact blocker / decision needed

QUEUED:
- task / dependency preventing start

DISCOVERED FOLLOW-UPS:
- proposed work not started

CONCURRENCY:
- active workers
- active reviewers
- why current concurrency level is appropriate
- whether resource/model contention exists

NEEDS PEYTON:
- only decisions or approvals that truly require Peyton
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
