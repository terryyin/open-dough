# Keep each unit's gaps and name visible in Intent CI proof

**Identity:** SEED-281#keep-unit-gaps-and-names-visible

**Source:** [Correction story](../../seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#keep-unit-gaps-and-names-visible)

## Source and provenance

Retrospective correction of SEED-281#distinguish-test-cases-and-files-in-ci-proof
(plan 547), reviewed commits `2c1f3122b`, `cee79fdb6`, `365762415` and
`e6de30d46`, released in 0.3.93 at `f97a3f1d2`. The original story promises
that each count names its unit, that missing evidence stays visible at the
level the publisher reports it (example 37), and that an unavailable or
unreported result keeps its evidence gap.

## Current findings at `f97a3f1d2`

1. **A partial unit disappears below its entry.** `dashboard/src/ciScopeProof.ts`
   `holdsResultInside` requires matched paths for a unit with a file breakdown,
   and `unitResultsAt` keeps only units holding results (or the first unit).
   `ciScopeComparisonUnits.ts` then drops that unit's group and turns it into
   an unreported `—`. A location whose test files lost part 2 shows only its
   test cases in a folder or file Summary, and its test files row reads `1 → —`.
   Introduced by plan 547 for locations reporting both units.
2. **Rows name no unit when no later build measured it.**
   `ciScopeComparisonCountsCell.ts` adds the unit only after a later measured
   total: a Baseline-only unit reads `1 → —`, a removed two-unit file reads
   `5 → removed` and `1 → removed`, and a row with nothing counted reads
   `nothing counted`, so a scope's two unit rows cannot be told apart.
3. **Comparison test support serves other evidence than arranged.**
   `dashboard/tests/support/storyCiComparisonEntrySummaries.ts` serves every
   `evidence.parts` entry as a present fragment and keeps a breakdown only
   when `of === 1`, so `missingPart` would be served as a present zero.
4. **A duplicate test.** `tests/support/ci-proof-action-units.test.mjs` repeats
   `ci-proof-units-cli.test.mjs`'s adapter recipe test; the action's unit
   logic is replayed with ci.yml's inputs in `ci-proof-actions.test.mjs`.

## Preserved promises and constraints

- One evidence per unit, per-unit comparison rows, legacy results never
  compare, a unit only one build reports is no measured zero, version 1 reads
  as legacy, and story exclusions (no layout redesign, no change to which
  builds are compared).
- Not decided here: whether a count difference or cue may cross a missing or
  ambiguous part (an older weakness in `ciScopeComparisonCounts.ts`). The
  developer owns that product choice; this plan neither adds nor removes such
  differences.

## Outside-in proof ownership

| Correction promise | Owner | Observable proof |
| --- | --- | --- |
| A unit with a missing or ambiguous part, or no breakdown, stays at folder and file scopes with its gap; in a comparison it is a gap endpoint, never `—` | 1 | Node cases in `tests/support/intent-scope-proof-units.test.mjs` and `intent-scope-comparison-unit-gaps.test.mjs` arranged through MakeMe (`missingPart`, `brokenDown`). |
| Every compared row names its unit, including Baseline-only, removed and nothing-counted rows | 2 | Node cases for a Baseline-only unit and a removed two-unit file; aligned expectations in `dashboard-ci-comparison-entries.test.mjs` and `summaryComparison*ExpectedRows.ts`, proven by their journeys. |
| Comparison test support serves the evidence arranged; no duplicate action test | 3 | A Node check that served entries equal the arranged ones, including a missing part and a multi-part breakdown; `ci-proof-actions.test.mjs` and `ci-proof-units-cli.test.mjs` keep the deleted test's proof. |

## Slices

### 1. Keep a partial unit's gaps visible below its entry

Type: Behavior
Status: planned
Proof: ownership row 1; the Intent suite as consumer boundary.

Behavior: a location's test files report part 1 of 2 and part 2 is missing;
its test cases are complete. A folder or file Summary keeps the test files
unit with `no CI result` and `part 2 of 2 missing`, and a comparison against
a complete Baseline shows that unit's gap endpoint instead of `—`. A unit that
holds results or reports nothing at all behaves as now.

### 2. Name each compared row's unit

Type: Behavior
Status: planned
Proof: ownership row 2; the comparison journeys whose expectations change.

Behavior: a unit only Baseline reports reads `1 test file → —`; a removed file
that reported both units reads `5 test cases → removed` and `1 test file →
removed`; a row with nothing counted reads `nothing counted as test files`,
reusing the CI status wording.

### 3. Serve exactly the arranged comparison evidence

Type: Structure
Status: planned
Proof: ownership row 3.

Change: `storyCiComparisonEntrySummaries.ts` serves only present parts and
keeps every present part's breakdown, so MakeMe-arranged gaps reach the
comparison as gaps; delete `tests/support/ci-proof-action-units.test.mjs`.
This is the directly owned retrospective correction of findings 3 and 4.

## Proof and delivery gates

Follow [AGENTS.md test automation](../../../AGENTS.md#test-automation) and
[native setup](../../../tests/native-setup.md). Run the affected Node tests
through `bash scripts/test.sh`, `npm run typecheck:dashboard`, `npm run lint`,
and before delivering slices 1–2 `npm run test:dashboard -- tests/intent`
(the consumer boundary of scope and comparison rows), as one background run by
the coordinator with workers chosen for the current load. Trace wording and
row changes with the installed consumer trace.

Local gate: start fully awake; on AC guard long runs with `caffeinate -s -i`;
on battery use `caffeinate -i` with the lid open and read the sleep log
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).
Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff; attribution is no
exemption. SEED-286 and SEED-287 own the Intent journeys' load timeouts.

## Decisive premises

Observed on 2026-11-09 in the execution checkout at `88c244f77` (code identical
to `f97a3f1d2`) with scratch probes that import the modules and write nothing
(`node <probe>.mts`, job-local `outcome-review/`).

| Premise / consuming operation | Literal observation and result | Remainder |
| --- | --- | --- |
| A partial unit disappears below its entry (slice 1) | `hidden-partial-unit.mts`: location `t` with test cases at `t/a` and test files at `t/c` (part 2 of 2 missing); single-run `t/a` printed only `case \| 3 passed test cases \| 1 of 1 part present`; compared `t/a` printed `test files \| 1 → — \| 1 of 2 parts present`. `empty-folder-parts.mts`: `t/b` printed only `case \| no CI result \| 1 of 1 part present`. | Slice 1 adds the Node cases that fail first. |
| Rows lack their unit (slice 2) | `baseline-only-unit.mts`: `test files \| 1 → —`; overall `5 → 7 test cases (+2); 1 test file → —`. `removed-two-units.mts`: `5 → removed` and `1 → removed`. | Slice 2 adds the Node cases that fail first. |
| Test support serves a missing part as present (slice 3) | `missing-part.mts`: parts `[present, missing]` served as `[present, present 0/0/0]`; `missing-part-breakdown.mts`: served evidence had no `files`. | Slice 3's Node check fails first. |

## Current decisions

- One correction for findings 1–4; finding 5 of the review (slow comparison
  journeys) belongs to SEED-286, and the count-difference-across-gaps choice to
  the developer.
