<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may
differ from training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Bracket Builder Agent Rules

## Read before working

Read, in order:

1. `ops/PROJECT.md`
2. `ops/NOW.md`
3. `ops/DECISIONS.md`
4. `ops/RUNBOOK.md`
5. `docs/AO_RULES.md`
6. The assigned task and acceptance criteria

## Working rules

- One task has one implementation owner, one Agent Orchestrator worktree, one
  branch, and one pull request.
- Stay inside the assigned task. Propose follow-up work instead of starting it.
- Preserve the frictionless product: no login is required to create, share, or
  vote unless Peyton explicitly changes that product decision.
- Treat mobile voting as a primary use case.
- Never expose `.env.local`, service-role keys, cookies, or user data.
- Do not change a live Supabase schema or production data.
- Existing Git integration may create a non-production Vercel preview after a
  task branch is pushed or a draft pull request is opened. That preview is
  allowed for verification. Do not invoke Vercel directly, promote a preview,
  change deployment settings, or deploy to production.
- Never use `bypass-permissions`.
- Use Peyton's authenticated Claude Code or Codex subscription session. Do not
  add API keys, usage credits, or pay-as-you-go fallback.

## Git permissions during the pilot

An approved worker may edit and test inside its assigned worktree, commit to its
assigned branch, push that branch, and open or update a draft pull request. It
may not push directly to `main`, merge, promote a preview to production, or
perform another external operation without Peyton's explicit approval.

## Verification

Run focused checks first. Before claiming an implementation is complete, run:

```bash
bash scripts/verify.sh
```

For documentation-only work, also run `git diff --check`. Report exact commands,
results, remaining uncertainty, what Peyton should inspect, the preview URL when
one exists, and rollback steps.
