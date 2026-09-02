#!/usr/bin/env bash
set -u
set -o pipefail

failures=0
warnings=0

pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; warnings=$((warnings + 1)); }
fail() { printf 'FAIL  %s\n' "$1"; failures=$((failures + 1)); }

check_command() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    pass "$name is installed: $(command -v "$name")"
  else
    fail "$name is not installed or not on PATH"
  fi
}

printf '=== Bracket Builder Agent Orchestrator preflight ===\n\n'

if [[ "$(uname -s)" == "Darwin" ]]; then
  pass "macOS detected"
else
  warn "Pilot was designed for Peyton's Mac. Detected: $(uname -s)"
fi

for name in git gh node npm claude codex; do
  check_command "$name"
done

printf '\n--- Repository ---\n'
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  pass "Repository: $(git rev-parse --show-toplevel)"
  if [[ -z "$(git status --short)" ]]; then
    pass "Working tree is clean"
  else
    warn "Working tree has uncommitted changes. Preserve them before AO creates task worktrees."
  fi
  if git remote get-url origin >/dev/null 2>&1; then
    pass "origin remote exists"
  else
    warn "origin remote is missing. Pull-request tracking will be limited."
  fi
else
  fail "Run this script from the Bracket Builder repository"
fi

printf '\n--- Authentication ---\n'
if command -v gh >/dev/null 2>&1; then
  gh auth status >/dev/null 2>&1 && pass "GitHub CLI is authenticated" || fail "GitHub CLI is not authenticated. Run: gh auth login"
fi
if command -v claude >/dev/null 2>&1; then
  claude auth status >/dev/null 2>&1 && pass "Claude Code is authenticated" || fail "Claude Code is not authenticated"
fi
if command -v codex >/dev/null 2>&1; then
  codex login status >/dev/null 2>&1 && pass "Codex is authenticated with ChatGPT" || fail "Codex is not authenticated. Run codex and choose Sign in with ChatGPT"
fi

printf '\n--- Subscription-only guard ---\n'
for variable_name in ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN OPENAI_API_KEY OPENROUTER_API_KEY; do
  value="${!variable_name-}"
  if [[ -n "$value" ]]; then
    warn "$variable_name is set in this shell. Unset it before launching AO to prevent metered fallback."
  else
    pass "$variable_name is not set"
  fi
done

printf '\n--- Project verification ---\n'
if [[ -d node_modules ]]; then
  if bash scripts/verify.sh; then
    pass "Bracket Builder verification passed"
  else
    fail "Bracket Builder verification failed"
  fi
else
  warn "node_modules is missing. Run npm install, then bash scripts/verify.sh"
fi

printf '\n--- Agent Orchestrator ---\n'
if command -v ao >/dev/null 2>&1; then
  ao doctor && pass "ao doctor passed" || fail "ao doctor reported a failure"
  ao agent ls --refresh && pass "AO agent readiness refreshed" || fail "AO could not refresh agent readiness"
else
  warn "AO CLI is not on PATH. A desktop-only install is acceptable if its Settings screen shows Git, GitHub, Claude Code, and Codex as ready."
fi

printf '\nFailures: %d\nWarnings: %d\n' "$failures" "$warnings"
if (( failures > 0 )); then
  printf 'Preflight did not pass. Resolve failures before starting a worker.\n'
  exit 1
fi
printf 'Preflight passed. Review warnings before starting BB-001.\n'
