# Bracket Builder Agent Orchestrator Pilot

## Why this is the first real pilot

Bracket Builder is smaller, visual, and easier for Peyton to inspect than the
JARVIS runtime. It is the right place to prove Agent Orchestrator task ownership,
worktree isolation, Claude-to-Codex review, and pull-request visibility.

## Before registration

1. Install the stable Agent Orchestrator desktop application on the Mac.
2. Sign in to Claude Code using Peyton's Claude subscription.
3. Sign in to Codex using Peyton's ChatGPT subscription.
4. Do not place Anthropic, OpenAI, or OpenRouter API keys in Agent Orchestrator.
5. From this repository, run:

   ```bash
   bash scripts/ao_preflight.sh
   ```

6. Resolve every failure before launching a worker.

This setup branch must be merged before using `main` as the Agent Orchestrator
base branch. Until then, use the setup branch only for preflight and review.

## Register the project

After this setup is merged:

- Repository: the local Bracket Builder repository
- Base branch: `main`
- Project orchestrator: Claude Code
- Worker: Claude Code
- Worker permission mode: `accept-edits`
- Reviewer: Codex
- Automatic review: on
- Worker rules file: `docs/AO_RULES.md`
- Orchestrator mode: Chat

The JSON in `config/ao-project-config.example.json` is a reference. Agent
Orchestrator stores project configuration locally. Do not use a full config
replacement command without first checking the existing project configuration.

## First orchestrator prompt

```text
Read AGENTS.md, docs/AO_RULES.md, and every file under ops. Inspect the current
Agent Orchestrator sessions, branches, pull requests, checks, and reviews.

Explain the current objective in plain English. Then prepare BB-001 exactly as
defined in ops/NOW.md. Show the complete task brief and confirm that it changes
documentation only. Do not launch a worker until I approve. Do not edit files,
commit, push, merge, deploy, use an API key, or change Supabase.
```

## BB-001 approval message

After the orchestrator shows the bounded brief, Peyton can say:

```text
Approve BB-001 for one Claude Code implementation worker. Use an isolated AO
worktree and task branch. Run the required verification, open a draft pull
request, and request the configured Codex review. Do not merge or deploy.
```

## Review checkpoint

Before approving merge, Peyton should receive:

- A plain-English explanation of the change
- Exact verification results
- The Codex verdict and any blockers
- A list of changed files
- Anything he should visually inspect
- Rollback instructions

The first task succeeds when Peyton can understand the card, worker, branch,
pull request, checks, and reviewer state without reopening unrelated chats.
