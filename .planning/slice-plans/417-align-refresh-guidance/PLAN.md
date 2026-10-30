# Align duration-list refresh guidance with recorded-speed scaling

**Source:** [Selected correction](../../seeds/SEED-185-stable-ci-time-budget.md#align-refresh-guidance)
**Identity:** SEED-185#align-refresh-guidance

## Goal and scope

Contributor refresh guidance names the delivered recorded-speed scaling: observed
times are divided by the run's factor against the existing list, and the
`# Source:` line records that factor (or that it was unavailable). Stale "keeping
the seconds" wording is removed from the Node suite and dashboard shard guides.

**Exclusions:** refresh/deal/budget code and ceilings (already delivered by
SEED-185#stable-ci-time-budget at before-cleanup `1bc270042dab3a1bb94c11cf31bdf82adaf8c402`); rewriting on-disk list headers; new refresh
behavior.

**Assumptions:** none beyond the current checkout's delivered `refreshListText`.

## Outside-in proof

| Key example | Signal |
| --- | --- |
| Guides match scaling | `tests/test-shares.md` and `dashboard/tests/shards.md` each describe scaling to the existing list's speed and recording the factor; neither says refresh "keeps the seconds" as written observation |
| Behavior unchanged | focused refresh proof still exits 0 |

Focused command:

```text
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/duration-list.test.mjs tests/support/test-shares.test.mjs tests/support/share-deal-recorded-runs.test.mjs
```

## Ordered slices

### 1. Refresh guides describe recorded-speed scaling

Type: Behavior
Status: planned
Proof: both guides' refresh sections as above; the focused command exit 0.

Behavior: a contributor opens `tests/test-shares.md` or
`dashboard/tests/shards.md` for the refresh procedure → the prose states that
seconds are scaled to the existing list's runner speed and that the `# Source:`
line records the factor (or unavailable), and no longer says the refresh keeps
raw observed seconds.

## Current decisions

- One prose fix across the two contributor guides that still teach the refresh
  command; no code change unless a guide cites a header claim the default
  `newDurationListHeader` must also carry (prefer correcting the guide only).

## Decisive premises

- **Stale "keeping the seconds" remains.** Consuming operation: reading the
  refresh sections of `tests/test-shares.md` (around the `refresh --list
  tests/longest-first` example) and `dashboard/tests/shards.md` (around the
  `dashboard-times-*` refresh and the later "keeping the seconds beside the
  labels" line). Observed 2026-10-30 on
  `9d2a4c39451aa1787ac295b0d3a0e309d08a67cb`: both still say "keeping the
  seconds". Settled.

## Concern evidence

Slice-plan refinement was not needed: one proof loop, one guide-alignment
outcome. This review identified no remaining slice-specific concern.

## Correction provenance

- Original execution: SEED-185#stable-ci-time-budget
- Plan: `.planning/slice-plans/415-stable-ci-time-budget/PLAN.md`
- Related implementation commits: `a81516d2`, `81588f9a`, `103cee16`
  (refresh scaling), planning close `9d2a4c39`
- Finding: after slice 3, `tests/test-shares.md` and `dashboard/tests/shards.md`
  still teach "keeping the seconds" while `refreshListText` scales to list
  speed and records the factor; implementer gap note in slice-3 handoff.
