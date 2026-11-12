# Speed up Cursor session checks

**Identity:** SEED-313#speed-up-cursor-session-checks
**Source:** [Story](../../seeds/SEED-313-cursor-session-checks.md#speed-up-cursor-session-checks)
**Source review:** [source-review.md](./source-review.md)

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

### Slice 1 owner map (execution base `467ab91fe36ea484a1e94e55be49e9acde797ae3`)

Family selector five project/file/title identities (coverage-map rows 40–44;
titles confirmed in source at this HEAD):

| # | Project path | File | Title |
| --- | --- | --- | --- |
| 1 | `dashboard/tests/sessions` | `cursor-runner-replacement.spec.ts` | sessions a replaced runner last held are revived without Recover; the third launch stays running |
| 2 | `dashboard/tests/sessions` | `cursor-session-scope-continuation.spec.ts` | recovery and terminal open resume a scoped session through its recorded scope, preserving a deliberate default change |
| 3 | `dashboard/tests/sessions` | `cursor-session-scope-continuation.spec.ts` | cannot-load replacement for a scoped session keeps the scope and sends no model flag |
| 4 | `dashboard/tests/sessions` | `cursor-session-scope-continuation.spec.ts` | a missing or unreadable recorded scope refuses recovery and terminal open, spawning nothing |
| 5 | `dashboard/tests/sessions` | `cursor-session-scope-continuation.spec.ts` | a Default session's recovery carries no scope, exactly as before |

| Outside-in promise | Current discriminating owner | Candidate cheaper boundary already present |
| --- | --- | --- |
| Stale holding | Inside family case 1 after `makeRecordedRunnerProofStale`: Running list + Open terminal joins keep runner PID and call/attach counts; sibling `workingCursorTest` "a stale-proof runner is read…" exists in the same file but is **outside** this family's grep. | Stale-join assertions already share the revival journey; no separate cheaper owner credited inside the timed selection. |
| Automatic revival | Family case 1 only: third UI launch replaces stale runner, auto-revives two unfinished last-held IDs without Recover, preserves records/scope/workspace, shows three running. Precondition via `openHeldCursorExecutions`. | `heldCursorExecutions` / public `launch()` already cut incidental UI starts for the two held preconditions. `backend-tests/sessions/cursor-runner-last-held.spec.ts` is key-persistence only — **not** a revival substitute. |
| Scoped continuation | Family case 2: UI Recover then Open terminal; `expectContinuationThroughScope` + workspace args + deliberate `changeSharedModel` noninterference. Setup via `startScopedCursorExecution`. | Assertion helpers + `keptRecords` / `recordedScope` already isolate scope facts; SEED-303 map still treats a public runner/record held lifetime as a candidate move for slice 2, subject to same-fault discrimination. |
| Cannot-load replacement | Family case 3: Recover under `setAttachMode("cannot-load")`; replacement ID retains scope/args; shared default unchanged. | Same public recovery + persisted-record boundary candidates as scoped continuation; no last-held equivalent. |
| Scope refusal | Family case 4: unreadable scope on Recover and missing scope on Open terminal; saved-configuration explanation; zero calls/attaches; shared default unchanged. | Visible refusal text is UI-bound; spawn-nothing + shared-config preservation may move to a real public/refusal boundary only after discrimination (slice 2). Preserve both causes and both entrypoints. |
| Default no-scope | Family case 5: Recover after `startCursorExecution`; `expectContinuationWithoutScope`. | Same public recovery boundary candidate; must keep the no-scope assertion before any thinning. |
| Fast feedback | Ordinary one-worker family selector whole-command wall time (slice 3 vs matched slice 1 baseline). | N/A — measurement obligation. |

Sibling outside the family grep (do not credit as free timed proof): stale-proof-only `workingCursorTest` in `cursor-runner-replacement.spec.ts`; controls in `cursor-runner-replacement-controls.spec.ts`; last-held backend key persistence.

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
Status: done
Proof: Early probe. Run the ordinary one-worker family selector above on the
execution base. Record whole-command wall time, summed case durations, host
load/power, and the five project/file/title identities. Map each promise in
Outside-in proof to its current discriminating owner and any candidate cheaper
boundary already present. Do not change product or test behavior in this slice.
Behavior: Current source has a measured family cost and owner map → later
slices size launch reductions against that matched baseline.
Progress: five identities + Outside-in owner map recorded. Matched passing
family baseline recorded 2026-11-12 repair re-run on base
`467ab91fe36ea484a1e94e55be49e9acde797ae3`: whole-command `real 94.61` s;
file times 27.2 s (replacement) + 57.2 s (scope-continuation) = 84.4 s;
exit 0; no open-dough dashboard Playwright at launch. See Current decisions /
Decisive premises. Status left for coordinator delivery.

### 2. Prove scope continuation and refusal with fewer full launches
Type: Behavior
Status: done
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
Progress: Four scope cases use `openHeldCursorExecutions` for held setup;
Recover / Open terminal UI observations retained (refusal not moved to HTTP).
Scratch discrimination settled scoped model vs Default no-model. Three
consecutive focused passes exit 0 (`real` 42.80 / 51.31 / 24.08). Status left
for coordinator delivery.

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
  seconds (median 30.691 s) from SEED-303 comparable-baseline Cursor revival
  (10.070/9.874/11.835) + scope continuation (20.632/20.817/21.760) family
  sums. Lead only; not this checkout's matched whole-command baseline.
- SEED-287 unfinished non-Cursor work is out of scope and not a blocking
  dependency. Reconcile only accepted Cursor lifetime overlap before editing
  shared helpers. Family can improve alone (story commitment 9).
- No new internal mocks, wall-clock sleeps, retries, skips, timeout inflation
  or special runner modes may manufacture the saving.
- Slice 1 expensive-proof decision (bastiaan-chan, 2026-11-11 ~22:39–22:40
  local): host AC, 16 cores, load averages ~20–28. Competing full
  `test:dashboard` Playwright suites still owned machine in other worktrees
  `to-ui-improvement-so-that-the-fixed-top-bar-of-s` and
  `try-to-upgrade-all-dependencies-and-make-sure-th` (plus touch-review
  typecheck/CI mailbox, not a full suite). Timed family run **deferred** then;
  static owner/title map above recorded.
- Slice 1 expensive-proof reconsideration (2026-11-12 ~10:26–11:09 local):
  host AC, 16 cores. Prior open-dough full-dashboard deferral cleared at first
  check; residual load from unrelated pygardon/nix. Choice: **run** the one
  matched baseline and record load qualification rather than wait for global
  load <12. Immediate pre-launch recheck found
  `open-the-terminal-only-when-no-custom-instructio` dashboard Playwright;
  waited until clear, then launched. Observation below is **qualified /
  non-comparable** (failed; elevated residual load; competing open-dough
  suites returned during/after). Repair re-run waited ~17 min with 1–5
  concurrent open-dough dashboard Playwright suites continuously present
  (`make-dashboard-journeys-fit-the-default-timeout` workers=2,
  `open-the-terminal-only-when-no-custom-instructio` including this family,
  `speed-up-the-remaining-dashboard-checks`, and others); returned incomplete
  for a green matched baseline. No timeout inflation or product/test edit in
  this slice.
- Prior failed timed attempt (2026-11-12 ~10:27–10:29, not the matched
  baseline): `real 146.81`, 1 timedOut revival under elevated load; retained
  `dashboard/test-results/2026-11-12T02-27-33.799Z-98673/`. Not comparable.
- Matched family timed baseline (commitment 22 — repair re-run, passing):
  - base SHA: `467ab91fe36ea484a1e94e55be49e9acde797ae3`
  - command:
    ```sh
    /usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_TIMES=/tmp/slice1-593-family-repair2.times.json npm run --silent test:dashboard -- \
      --workers=1 \
      --grep 'sessions a replaced runner last held are revived|cursor-session-scope-continuation\.spec\.ts'
    ```
  - before (11:44:41 +0800): load 20.00 35.53 43.59; AC Power; battery 100%
    charged; **no** open-dough dashboard Playwright at launch
  - after (11:46:15 +0800): load 35.91 35.90 42.81; AC Power; battery 100%
  - whole-command wall: `real 94.61` (user 39.43, sys 24.48); exit 0
  - file durations (`OPEN_DOUGH_DASHBOARD_TIMES`): replacement 27.2 s +
    scope-continuation 57.2 s = **84.4 s** summed file time (per-case sum not
    broken out by this reporter format)
  - counts: exit 0 on the five-title family selector; quiet reporter printed
    no FAIL lines
  - artifacts: `/tmp/slice1-593-family-repair2.{txt,meta,times.json}`
  - comparability: **matched passing baseline for slice 3** — open-dough
    Playwright clear at launch; residual non-open-dough load still elevated
    (record when comparing). Slice 3 must save ≥10 s whole-command wall vs
    `real 94.61`.

## Decisive premises

| Premise | Consuming operation | Form / profile observed | Result |
| --- | --- | --- | --- |
| The five family titles still exist at rows 40–44 | Family selector and coverage map | Read `cursor-runner-replacement.spec.ts` and `cursor-session-scope-continuation.spec.ts` at preparation HEAD | Settled: all five titles present |
| `heldCursorExecutions` is the revival precondition owner to reuse | Slices 2–3 helper choice | Read helper and its sole revival import at preparation HEAD | Settled: reuse that helper; no second lifetime fixture |
| `cursor-runner-last-held` cannot replace revival UI/PTY proof | Slice 3 revival retention | Read `backend-tests/sessions/cursor-runner-last-held.spec.ts`; coverage-map row 40 replacement note | Settled negative: keep one revival journey |
| Matched whole-command family cost on the execution base | Success measure and slice 3 comparison | Ordinary one-worker family selector under `caffeinate -s -i` | Settled — 2026-11-12 repair re-run on base `467ab91fe36ea484a1e94e55be49e9acde797ae3`: exit 0, `real 94.61`, file times 27.2+57.2=84.4 s; load before 20.00/35.53/43.59 after 35.91/35.90/42.81 on AC; no open-dough dashboard Playwright at launch. Prior failed attempt (`real 146.81`, timedOut) discarded as non-comparable. Slice 3 compares whole-command wall against `94.61` |
| A cheaper public runner/persisted-session boundary discriminates each moved scope/refusal fault | Slice 2 approach and proof move | Scratch disable or equivalent discrimination in the same Playwright profile before thinning | Settled for held-setup move — scratch without model fails scoped `recordedScope`; scratch Default with model fails `expectContinuationWithoutScope`. Refusal/cannot-load keep UI Recover+Open after same public held precondition; no HTTP thinning without further discrimination |

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
