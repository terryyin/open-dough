# Speed up Cursor session checks

**Identity:** SEED-313#speed-up-cursor-session-checks
**Source:** [Story](../../seeds/SEED-313-cursor-session-checks.md#speed-up-cursor-session-checks)

## Goal and scope

Keep ordinary proof for stale Cursor runner holding, automatic last-held
revival, scoped resume/recovery/cannot-load continuation, Default
no-scope continuation, and missing/unreadable scope refusal with no spawn.
Reduce local one-worker elapsed time by at least 10 seconds. Measure the
maintained Cursor session selection with startup, every credited replacement
check, fixture preparation and teardown. Reuse `heldCursorExecutions` and
accepted SEED-287 Cursor lifetime work; do not duplicate them. Leave other
test families and SEED-287's unfinished non-Cursor ownership alone.

[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps machine-local launch and configuration records authoritative for
session continuation. Preserve those boundaries.
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires a measured worthwhile improvement and surviving proof.

## Outside-in proof and existing owners

| Promise | Required observation |
| --- | --- |
| Stale holding | Observation of a stale-proof runner lists and joins held sessions and starts or replaces nothing. Survives inside the revival journey or an equivalent ordinary check. |
| Automatic revival | One real runner + PTY + UI journey: a third launch replaces the stale runner, revives unfinished last-held IDs without Recover, preserves records/scope/workspace, and shows them running. `cursor-runner-last-held` proves key persistence only and cannot replace this. |
| Scoped continuation | Recover and fresh Open terminal use the recorded chosen scope and workspace, leave a deliberate shared default change untouched, send no model flag, and attach a new process. |
| Cannot-load replacement | Replacement session keeps the same scope and args shape with no model flag; shared default stays unchanged. |
| Scope refusal | Missing and unreadable scope each refuse Recover and/or Open terminal with the saved-configuration explanation and spawn neither calls nor attaches. |
| Default no-scope | Default recovery continues to carry no scope. |
| Fast feedback | Whole-command wall time with setup and teardown for the complete maintained Cursor session selection. Three comparable passing ordinary one-worker runs show at least a 10-second saving versus the matched baseline. |

Reuse `heldCursorExecutions`, `startScopedCursorExecution` /
`startCursorExecution`, `expectContinuationThroughScope` /
`expectContinuationWithoutScope`, `makeRecordedRunnerProofStale`, and the
public runner / persisted-session reading helpers already in
`dashboard/tests/support/`. Prefer establishing scope and refusal variants at
the public runner or persisted-session boundary when those boundaries still
fail for the same faults; keep one end-to-end revival journey for live PTY and
visible revival.

## Verification

Local gate on fully awake AC macOS uses
[`caffeinate -s -i`](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Apply the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Compare base and candidate with strict ordinary Playwright, one worker,
identical test intent and all preparation paid. Record the base SHA, exact
commands, counts, wall time, host load, and any non-comparable observation.
Typecheck affected dashboard paths. Use ordinary CI on the candidate and
integrated trunk.

Family selector (confirm identities against the proof record):

```sh
/usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- \
  --workers=1 \
  --grep 'sessions a replaced runner last held are revived|cursor-session-scope-continuation\.spec\.ts'
```

Require three consecutive focused passes for changed asynchronous proof.
Retained SEED-303 evidence is a lead, not this checkout's matched baseline.

## Ordered slices

### 1. Measure matched Cursor family baseline and promise owners
Type: Behavior
Status: planned
Proof: Early probe. Run the ordinary one-worker family selector above on the
execution base. Record whole-command wall time, summed case durations, host
load/power, and the five project/file/title identities. Map each promise in
Outside-in proof to its current discriminating owner and any candidate cheaper
boundary already present. Do not change product or test behavior in this slice.
Behavior: Current source has a measured family cost and owner map → later
slices size launch reductions against that matched baseline.

### 2. Prove scope continuation and refusal with fewer full launches
Type: Behavior
Status: planned
Proof: Focus the four scope-continuation cases plus any credited public
runner/persisted-session checks. Before moving or thinning a case, observe that
the chosen cheaper boundary fails for the same fault (scratch disable or
equivalent discrimination). Preserve deliberate shared-default noninterference,
cannot-load scope retention, both missing and unreadable refusal causes, both
Recover and Open terminal entrypoints where they discriminate, and Default
no-scope continuation. Compare elapsed including every surviving launch and
fixture preparation. Reuse `heldCursorExecutions` / scoped lifetime helpers;
do not invent a parallel lifetime fixture.
Behavior: Minimal real held scoped lifetime and public continuation boundaries
still expose the scope and refusal faults → fewer repeated full launches keep
the same discriminating protection.

### 3. Keep revival lean and confirm the family saving
Type: Behavior
Status: planned
Proof: Keep one real runner+PTY/UI revival journey that still observes stale
holding, replacement, automatic revive without Recover, preserved
identity/scope/workspace and visible running state. Reduce only incidental
initial starts or setup that surviving observations already cover. Run the
complete matched family selector three consecutive times; every run passes and
whole-command wall time saves at least 10 seconds versus slice 1's matched
baseline, with every credited replacement check included. Reconcile coverage,
neighboring last-held/controls cases as needed, and applicable hosted CI.
Behavior: The maintained Cursor session selection retains equivalent
protection → one ordinary command returns the stated faster feedback.

## Current decisions

- PFE: reuse the committed `heldCursorExecutions` helper and existing
  scope/runner support; change those owners in place when launch cost must
  fall. Do not add a second lifetime representation. `backend-tests/sessions/cursor-runner-last-held.spec.ts`
  remains key-persistence proof only.
- Retained corrected baseline: five cases, 30.691–33.595 summed local case
  seconds (median 30.691 s). Fresh matched whole-command cost is slice 1's
  job; do not claim a saving from the SEED-303 cohort alone.
- SEED-287 unfinished non-Cursor work is out of scope and not a blocking
  dependency. Reconcile only accepted Cursor lifetime overlap before editing
  shared helpers.
- No new internal mocks, wall-clock sleeps, retries, skips, timeout inflation
  or special runner modes may manufacture the saving.

## Decisive premises

| Premise | Consuming operation | Form / profile observed | Result |
| --- | --- | --- | --- |
| The five family titles still exist at rows 40–44 | Family selector and coverage map | Read `cursor-runner-replacement.spec.ts` and `cursor-session-scope-continuation.spec.ts` at preparation HEAD | Settled: all five titles present |
| `heldCursorExecutions` is the revival precondition owner to reuse | Slices 2–3 helper choice | Read helper and its sole revival import at preparation HEAD | Settled: reuse that helper; no second lifetime fixture |
| `cursor-runner-last-held` cannot replace revival UI/PTY proof | Slice 3 revival retention | Read `backend-tests/sessions/cursor-runner-last-held.spec.ts`; coverage-map row 40 replacement note | Settled negative: keep one revival journey |
| Matched whole-command family cost on the execution base | Success measure and slice 3 comparison | Ordinary one-worker family selector under `caffeinate -s -i` | Open — bounded by slice 1 early probe |
| A cheaper public runner/persisted-session boundary discriminates each moved scope/refusal fault | Slice 2 approach and proof move | Scratch disable or equivalent discrimination in the same Playwright profile before thinning | Open — bounded by slice 2; failure stops the move and revises the plan |

## Concern evidence

Slice-plan refinement was not needed: three slices, one coherent cheapest-real-boundary
rule, outside-in proof ownership, and early-probe bounding of the two open
premises. No remaining slice-specific concern.

## Local gates

Use normal strict focused selections and affected neighbors. Follow the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
verbatim in every delegation or repair handoff. Keep default test timeouts and
shared MakeMe data. Start long macOS runs awake: on AC use `caffeinate -s -i`;
on battery plug in or keep the lid open under `caffeinate -i` and inspect sleep
afterwards per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
