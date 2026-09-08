---
id: SEED-008
status: dormant
planted: 2026-09-08
planted_during: unknown
trigger_when: when evaluating or designing branch/worktree workflows for trunk-based development
scope: unknown
---

# SEED-008: Research worktree branches that continuously synchronize with trunk

## Why This Matters

Explore whether a worktree on a short-lived branch can support trunk-based
development by immediately rebasing and synchronizing every branch change with
`main`. Establish the practical and technical limits before adopting this as a
workflow, especially around integration timing, conflicts, and safety.

## When to Surface

**Trigger:** when evaluating or designing branch/worktree workflows for
trunk-based development.

This seed should surface when related milestone scope is proposed. Research the
feasibility and appropriate Git/Codex mechanics before any implementation or
policy is adopted.

## Scope Estimate

**Unknown** — research first; the resulting approach may range from a documented
convention to automation with conflict-handling safeguards.

## Breadcrumbs

- `.planning/seeds/SEED-002-trunk-based-multi-agent-collaboration.md` — related
  shared-branch collaboration experiment.

## Notes

Captured as an idea for later research, not as a decision that continuous
rebase/sync is technically feasible or desirable.
