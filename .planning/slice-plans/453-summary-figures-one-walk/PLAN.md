# Prove and unify summary proof figures

**Identity:** SEED-192#summary-figures-one-walk
**Source:** [correction story](../../seeds/SEED-192-review-product-intent.md#summary-figures-one-walk).

## Source and provenance

Retrospective correction of
[Find expensive proof in the test hierarchy](../../seeds/SEED-192-review-product-intent.md#inspect-hierarchical-proof-cost),
plan 452, executed on branch `claude/find-expensive-proof-in-the-test-hierarchy`
from Take `5260f2bc4`: slice commits `f310f5739` (summed duration and spread),
`a04e6e12a` (slowest list), `afdf296de` (drill-down), and plan-only commits
`c9ac761de`, `45d6975c0`. Reviewed at `45d6975c0`.

## Current findings

1. **Unproved wording that real proof reaches.** `proofSpreadLine`
   (`dashboard/src/intentSummaryProofCost.ts`) has a different-UTC-day form,
   "between 2026-11-01 23:50 and 2026-11-02 01:05 UTC", that no spec or unit
   test observes; every fixture finishes on 2026-11-02. Pygardon's published
   proof spans runs on 2026-11-01 and 2026-11-02. Sums of a minute or more
   ("1m 5s" from `durationWords`, `dashboard/src/proofDurationWords.ts`) are
   also unobserved as sums.
2. **The summary figures rule is written twice.** `IntentGherkinSummary.tsx`
   (selection) and `IntentSummaryChildren.tsx` (each child) each build
   coverage, scenario total, count line, and cost line separately. Their
   visibility gates differ: the selection shows proof lines when
   `settled || readyCount > 0`; a child when `readyCount > 0 || !incomplete`.
   The next per-row figure would need edits in both places.
3. **Repeated walks per render.** `scenarioCountForFiles`,
   `observationsForFiles`, and `slowestRowsOf` each re-parse every read file,
   and each child repeats two passes, unmemoized, on every file arrival
   (about 94 files for Doughnut's `e2e_test/features`). The "one matching walk"
   (`observedRowsForFiles`) holds in code, not at runtime.
4. **Duplicated assertions.** `intent-summary-drill-down.spec.ts` step 16.1
   repeats the cli folder figures (17.0 s line, three child lines, four
   slowest names) that `intent-summary-proof-cost.spec.ts`'s cli folder step
   already owns.

## Preserved promises and constraints

All of plan 452's promises (its [source review](../452-inspect-hierarchical-proof-cost/source-review.md)):
wording, number formats, placement, tree order, unknown-never-0 s, Partial
labelling, slowest order and cap, drill-down. Both visibility gates stay as
they are (the selection's gate predates this story from SEED-217; this
correction changes no visible behavior). Figures stay derived in the browser,
not stored, with no added reads
([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).

## Outside-in proof

| Finding | Slice | Signal |
| --- | --- | --- |
| 1 | 1 | new `tests/support/intent-summary-proof-cost.test.mjs` (node, through `bash scripts/test.sh`): `proofSpreadLine` same-minute ("at"), same-day ("between … UTC on"), and different-day forms with one commit and with several; `proofCostLineFor` with a sum ≥ 60 s reads "1m 5s" |
| 2, 3 | 2 | all `dashboard/tests/*intent*.spec.ts` unchanged and green; a unit test in the same file shows the selection and a child derive from one figures function |
| 4 | 2 | drill-down spec 16.1 keeps selection, reveal, path and sum assertions only; proof-cost spec unchanged |

## Ordered slices

### 1. Prove multi-day spread and minute-or-more sums
Type: Behavior
Status: planned
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/intent-summary-proof-cost.test.mjs`.

The current wording is the expected result; a defect found while proving it
is repaired here.

### 2. One summary-figures derivation from one walk
Type: Structure
Status: planned
Proof: all `dashboard/tests/*intent*.spec.ts` from `dashboard/` with
`env -u NO_COLOR -u FORCE_COLOR npx playwright test $(ls tests/*intent*.spec.ts) --reporter=list`;
slice 1's unit file; `npm run typecheck:dashboard`, `npm run lint`.

One function in `intentSummaryProofCost.ts` takes the files, statuses,
texts, and latest observations, walks the read files once
(`observedRowsForFiles`), and returns the scenario total, count, cost,
spread, and slowest rows. The selection and each child (sliced from the same
walk) render from it. Each caller keeps its existing visibility gate. Trim
step 16.1 of the drill-down spec to its selection and reveal assertions plus
the path and sum line.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The summary's figure modules load in node unit tests without React | Slice 1 unit proof | Scratch `tests/support/.probe-453.test.mjs` importing `proofSpreadLine`, `proofCostOf`, and `durationWords`, run by `bash scripts/test.sh` with Homebrew Bash 5 and by `node --test` (2026-11-03, at `45d6975c0`), then deleted | Loaded and ran; printed "Observations finished between 2026-11-01 23:50 and 2026-11-02 01:05 UTC, from 2 commits." and "1m 5s 1m 20s" |

## Local gates

- Focused proof per slice as listed. Slice 2 changes the summary every Intent
  location and folder journey renders, so all intent specs run before
  publishing it.
- Failing and flaky tests follow
  [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests);
  carry it, by link or verbatim, into every delegation and repair handoff.

## Current decisions

- Retrospective (2026-11-03): keep both visibility gates; unifying them
  would change SEED-217 behavior and is not part of this correction.

## Concern evidence

Slice-plan refinement was not needed: one proof-only Behavior slice and one
behavior-preserving Structure slice over the same two modules. This review
found no remaining slice-specific concern.
