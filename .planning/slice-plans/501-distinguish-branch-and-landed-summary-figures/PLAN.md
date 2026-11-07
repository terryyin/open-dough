# Distinguish Branch and Landed figures in precise CI summaries

**Identity:** SEED-258#distinguish-branch-and-landed-summary-figures
**Source:** [Distinguish Branch and Landed figures in precise CI summaries](../../seeds/SEED-258-dough-intent-coverage.md#distinguish-branch-and-landed-summary-figures)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer reviewing a completed story's precise CI comparison can trust
that Branch and Landed figures come from their own builds: the maintained
Summary and file Proof journeys fail when one build's figures appear in the
other's column at entry, folder, or file scope.

Included scope, key examples, and exclusions are the seed's. In short:
test-only change to the precise breakdown proofs
(`dashboard/tests/support/intentSummaryStoryComparisonProofs.ts`) and the
expected rows; no production change, no other SEED-258 follow-up, no new
dashboard behavior or wording.

## Outside-in proof and ownership

| Promise (seed) | Owner | Proof |
| --- | --- | --- |
| One measured file under `folder/` has distinct Branch and Landed counts and durations, reaching the file, `dashboard/tests/folder`, and the `dashboard/tests` entry; Summary and file Proof assert exact Baseline, Branch, Landed and Counts cells (key example *Clean run*) | Slice 1 | The four consumer specs below pass on unchanged production code |
| The Branch-for-Landed substitution fails the intended assertions (key example *Landed replaced by Branch*) | Slice 1 | Scratch replay of the probe below: the Summary spec and the file spec fail on the Landed or Counts cells of the changed scopes; revert, then `git status --porcelain` shows no `dashboard/src` change |
| Trunk Mode, Taken, gap and cue variants keep passing with only the figures the change reaches updated (key example *Single after-build*) | Slice 1 | Same four-spec run |

Local proof command (the four specs are every consumer of the breakdown
proofs; see premises):

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent/intent-summary-story-comparison.spec.ts dashboard/tests/intent/intent-summary-story-comparison-file.spec.ts dashboard/tests/intent/intent-summary-story-comparison-gaps.spec.ts dashboard/tests/intent/intent-story-ci-cues.spec.ts --reporter=list --workers=2
```

Run it with Homebrew Bash 5 first on `PATH` under the
[machine sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos)
(`caffeinate -s -i`, on mains power). No broader local suite is required:
the change touches only fixtures these four specs load. Hosted CI runs the
rest after publication.

Scratch probe (revert before any commit): at the start of
`scopeComparisonCellsOf` in `dashboard/src/ciScopeComparison.ts` insert

```ts
if (precision === "precise" && branch.kind === "summary" && landed.kind === "summary" && branch !== landed) { console.debug("PROBE landed replaced", path); landed = branch; }
```

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The current journeys do not distinguish Branch from Landed | Slice 1's proof command with the scratch probe | Ran the proof command above at `302161aa8` (2026-11-07, load ≈ 10) clean, then with the scratch probe and `--trace on`; reverted with `git restore` | Clean: 10 passed. Probe: 10 passed; 7 of 10 traces logged `PROBE landed replaced`. Premise true; the fault reaches the formatter and survives |
| The four specs are every consumer of the breakdown proofs | Changing the producer values | Searched `dashboard/tests`, `src`, `server` for importers of `intentSummaryStoryComparison{Proofs,Fixture,VariantPublishers,Shared}`; `Shared` and `storyCiComparisonSkippedFixture` do not use the proofs | Only these four specs load them; the proof command covers each, so any missed consumer fails visibly there |
| Distinct Branch and Landed counts reach the Counts cell | Rendering of the changed rows | Read `countsCellText` in `dashboard/src/ciScopeComparisonCounts.ts` at `302161aa8`: distinct measured counts produce a Baseline → Branch → Landed phrase | Supported by source; the slice's clean run asserts the exact rendered text |

## Slices

### 1. Precise journeys tell Branch and Landed figures apart
Type: Behavior
Status: done
Proof: the four-spec proof command passes on unchanged production code; the scratch probe makes the Summary and file Proof specs fail on the changed scopes' cells; probe reverted.

Behavior: a completed story whose Branch and Landed builds report different
counts and durations for `folder/a.spec.ts` → a developer opens the precise
Summary at the entry and folder, and that file's Proof → each column shows
its own build's duration and the Counts cell shows the Baseline → Branch →
Landed comparison; the same assertions fail when Landed is replaced by
Branch.

Change one endpoint's producer values for one `folder/` file (a second test
on one side and a visibly different duration), then update expected rows in
`summaryComparisonExpectedRows.ts`, `summaryComparisonFileExpectedRows.ts`,
the gap rows, and any cue expectation the run reports. Implementation picks
which endpoint to change; changing Branch leaves Trunk Mode rows
(baseline → landed) untouched.

Accepted proof (2026-11-07): Branch's producer adds a second
`folder/a.spec.ts` test (3,000 ms). The four-spec proof command passed
10 of 10 on unchanged production code, and `npm run typecheck:dashboard`
passed. With the scratch probe, 7 tests failed: both Summary variants
failed on the entry Counts and Landed cells (`4 → 6 tests (+2) → 5 tests
(+1)` and `18.5 s` expected; Branch's figures received), and both file
variants failed on `modifiedFileRow`. Probes narrowed to one path showed
the same failure for the folder and file rows. The probe was reverted.
The consumer trace found only these four specs. The refactor pass made
no changes. Commitment observations are in [source-review.md](source-review.md).

Learnings: the touched specs still call `test.slow()`, which AGENTS.md
forbids. That predates this story and is outside its scope. Production
words Landed-equals-Baseline as `1 tests (0)`, and the rows assert that
as-is.

## Current decisions

- If [Plan 499](../499-scan-intent-ci-summaries/PLAN.md) lands its reshaped
  Summary tables first, assert the same figures through the wording trunk
  then has; this story adds no wording of its own.
- `intent-story-ci-cues.spec.ts` writes screenshots under the closed Plan
  493's directory (`.planning/slice-plans/493-compare-before-and-after-ci-proof/screenshots`).
  Delete that run artifact before committing; fixing the spec is outside
  this story.

## Concern evidence

Slice-plan refinement not needed: one slice with one proof loop and no
boundary or sizing concern. No slice-specific concern remains.
