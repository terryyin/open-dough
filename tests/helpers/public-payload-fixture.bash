#!/usr/bin/env bash
# shellcheck disable=SC2034 # Sourced scenarios consume managed_files.
# Client payload expected by current-source install and release-fixture scenarios.

managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-product-backlog/SKILL.md
  dough-story-decomposition/SKILL.md
  dough-story-decomposition/references/problem-decomposition.md
  dough-story-decomposition/references/seed-format.md
  dough-story-refinement/SKILL.md
  dough-story-refinement/references/planning.md
  dough-resplit-story/SKILL.md
  dough-slice-planning/SKILL.md
  dough-slice-plan-refinement/SKILL.md
  dough-execute-plan/SKILL.md
  dough-execute-plan/assets/claude-hooks.json
  dough-execute-plan/assets/cursor-hooks.json
  dough-execute-plan/references/ci-monitor.md
  dough-execute-plan/references/ci-notify-codex.md
  dough-execute-plan/references/ci-notify-hosts.md
  dough-execute-plan/references/delegation.md
  dough-execute-plan/references/destructive-later-outcome-check.md
  dough-execute-plan/references/disposable-research.md
  dough-execute-plan/references/execution-decisions.md
  dough-execute-plan/references/runtime-setup.md
  dough-execute-plan/references/wrap-up.md
  dough-execute-plan/scripts/ci-failures.mjs
  dough-execute-plan/scripts/ci-host-hook.mjs
  dough-execute-plan/scripts/ci-mailbox-store.mjs
  dough-execute-plan/scripts/ci-mailbox-worker-process.mjs
  dough-execute-plan/scripts/ci-mailbox.mjs
  dough-execute-plan/scripts/ci-observer-stream.mjs
  dough-execute-plan/scripts/ci-runs.mjs
  dough-execute-plan/scripts/watch-ci-execution.mjs
  dough-execute-plan/scripts/watch-ci.mjs
  dough-post-change-refactor/SKILL.md
  dough-post-change-refactor/references/refactor-checks.md
  dough-execution-retrospective/SKILL.md
  dough-story-wrap-up/SKILL.md
)
