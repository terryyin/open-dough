# End the held-gh start-slack deadlock and concurrent test-results race

**Identity:** SEED-218#fix-owned-calls-start-slack-hang
**Source:** [selected story](../../seeds/SEED-218-end-local-suite-hangs.md#fix-owned-calls-start-slack-hang).
**Source review:** [independent commitments](source-review.md).

## Goal and scope

A developer's local `npm test` ends with a finite, named result.
`github-request-owned-calls.test.mjs` records each fixture `gh` call against
`OwnedCalls` at spawn, as the production owner does, so a held call the test
owns is recognized and ended however late the fixture logs it. Each test in the
file has a finite bound, so a wait on an exit that never comes fails fast with
the test named, and its teardown still ends the fixture `gh`. The full local
suite, `tests/dashboard-concurrent-runs.sh` included, passes.

Exclusions, from the story: no change to the request-owner production path or
`startSlackMs`; no runner-wide test timeout; no live progress output for local
runs.

The developer's execution instruction additionally requires a permanent
delayed-start regression. Retain that test in the normal suite; scratch
experiments alone do not satisfy this obligation. Runner-wide timeouts and
progress output remain deferred.

## Existing solutions and decisions

- **Production recording.** `github-request-calls.mjs` calls
  `owned.started(child.pid, …)` synchronously right after `execFile`. The
  test helper `leftCalls().call()` adopts that order: record, then wait for
  the fixture to log the call. Keep the recognition rule and slack in
  `github-request-owned-calls.mjs` unchanged.
- **Tests with other records.** The "never signalled unless" test records
  other arguments, a start an hour early, and this test process. It keeps
  its own explicit `owned.started` calls; only tests that record the very
  call they spawned move to recording at spawn. The "cannot be looked at"
  test records resource `search`, so the helper takes the resource along
  with the owner.
- **Bound.** Use Node's per-test `timeout` option (the same mechanism as
  `--test-timeout`, which cancelled the scratch repro at its bound with no
  `gh` left behind). Choose a value well above the file's loaded worst case;
  alone, its slowest test takes ~1.2 s.
- **Concurrent runs.** The pid-qualified run stamp and the `test-results`
  parent `mkdirSync` in `dashboard/playwright.config.ts` stay as they are.

## Decisive premises

Observed in this preparation workspace on 2026-11-02. Each scratch edit was
reverted before the records were written.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Late recording reproduces the hang | First owned-calls test | Scratch copy with a 3.5 s wait before `owned.started(left.pid, …)`, run as `env -u NO_COLOR -u FORCE_COLOR node --test --test-timeout=30000 --test-name-pattern="asked to end, and its record" <copy>` | Cancelled at 30 s (`test timed out after 30000ms`); no fixture `gh` left running |
| Recording at spawn ends a call the fixture logs late | First two owned-calls tests | Scratch helper recording at spawn, then waiting `SCRATCH_DELAY` before the fixture-logged await; `SCRATCH_DELAY=0` and `3500` with `--test-name-pattern="asked to end, and its record\|killed a second later"` | Both pass at each delay (7.0 s and 4.5 s at 3.5 s) |
| The file passes alone today | Focused runner | `bash scripts/test.sh src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs` with Homebrew Bash first on `PATH` | Passed, ~7 s |
| Concurrent dashboard runs no longer race | `tests/dashboard-concurrent-runs.sh` | Three runs in turn through `bash scripts/test.sh` (the first from an absent `dashboard/test-results`), then three copies at once | 3/3 and 3/3 passed, load ~10 |
| The full suite finishes with the fix in place | Full local runner | With the scratch at-spawn helper (drafted-record test included), `env -u NO_COLOR -u FORCE_COLOR npm test`; `scripts/test-jobs.sh` lists both the owned-calls file and `tests/dashboard-concurrent-runs.sh` | rc 0 in 525 s, load up to ~14 |

## Outside-in proof

- The owned-calls file passes through
  `bash scripts/test.sh src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs`
  alone, and with four copies of that command running at once.
- A committed delayed-start regression exercises a fixture call whose startup
  acknowledgment arrives 3.5 s after spawn. It verifies that the call is
  recognized and ended (exit 143) and its record removed. Run it through the
  normal runner, not only as a scratch experiment.
- Discriminate that permanent regression by temporarily moving recording back
  after the delayed acknowledgment, then restore the fix: the regression fails
  at its per-test bound, names the test, and leaves no fixture `gh` running
  (key examples 1 and 2).
- Full local `env -u NO_COLOR -u FORCE_COLOR npm test` passes, with no
  `ENOENT` from `tests/dashboard-concurrent-runs.sh` (key example 4). The
  [failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  policy applies as written. Run the full suite because the story's promise
  is about that run, not because the change touches shared runtime paths.
- Read the added-time baseline with
  `PATH=/opt/homebrew/bin:$PATH bash scripts/ci-test-times.sh src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs`;
  apply `tests/time-budget.md` and let the published revision's CI settle the
  budget without raising its ceilings.

## Ordered slices

### 1. A held call the test owns is ended however late its fixture logs it
Type: Behavior
Status: done
Proof: the outside-in proof above.

Behavior: an owned-calls test spawns a held fixture `gh`, and the fixture logs
the call 3.5 s after spawn → generation 2's `earlierCallsEnded` runs → it
answers `[]`, the call exits 143 after `told-to-end`, and no record remains. A
test still waiting on an exit no signal will produce fails at its bound with
its name, and teardown ends its `gh`.
The delayed-start example remains as a committed regression in this file.

## Execution context

- Story Branch Mode; created workspace
  `/Users/terryyin/git/open-dough/.worktrees/fix-owned-calls-start-slack-hang`,
  branch `codex/fix-owned-calls-start-slack-hang`; originating and integration
  checkout `/Users/terryyin/git/open-dough`.
- Starting revision `bd8cdf7a97c48e3d7550c2d97187dd6910700d82`; accepted Take
  `39424d5b25f0bdad27eae03389dd740fe5e47055` on `origin/main` and the execution
  branch. Agent `juacompe-chan`, publisher `codex-plan444-20261102`.
- Dependencies installed with `node scripts/setup-native.mjs npm` against the
  unchanged lockfile; `npm run --silent typecheck:dashboard` passed here.
- CI: GitHub Actions `ci.yml` (verified workflow 351271804, name `CI`), target
  `codex/fix-owned-calls-start-slack-hang`. Coordinator
  `codex-plan444-20261102`; yielded cell `g66:23`, session `17760`, directory
  `/tmp/dough-ci-501/watch-jde7In`, PID `28549`. The trunk Take is unobserved;
  implementation delivery registers on this execution-branch observer.
- Replanning authority remains the selected plan and this bounded regression
  amendment; no broader scope or new slice target is authorized.
- Added-time baseline from the documented command: 10 successful main CI runs
  gave this job 2.8–3.7 s at recorded speed, 60.3 s per-job headroom, verdict
  `wide`; all three shares were also `wide`. No paired local timing is
  required; the published candidate's CI settles the budget.
- Expensive-proof decision: this Mac has about 59% system-wide memory free,
  load around 5, and no other observed active Node/shell/Playwright proof.
  Other worktrees exist but their owners' future workload is unknown. The
  refinement's same-host full suite took 525 s at load up to 14. Run the
  required full local suite once at its normal four-job default, after the
  focused and standalone dashboard checks finish. Coordinator owns
  `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/open-dough-plan444-times.txt /usr/bin/time -p env -u NO_COLOR -u FORCE_COLOR npm test > /tmp/open-dough-plan444-full-suite.log 2>&1`
  through its terminal result. Reconsider contention and any failure before
  another heavy attempt; do not weaken proof or timing ceilings.

## Concern evidence

Refinement was not needed: one cohesive Behavior slice with settled premises
and one proof loop. No numeric slice target, hard limit, or sizing exception
was supplied.

Remaining slice-specific concerns: none identified in this review.

## Accepted proof

- Permanent delayed-start regression and all existing counterexamples passed
  through the normal focused runner, then four simultaneous copies passed.
  The regression observes actual 3500 ms delayed fixture startup in the same
  PID, generation-2 `[]`, exit 143, matching `told-to-end` PID, and no record.
- An isolated mutation recorded after delayed acknowledgment. The normal
  runner named the permanent regression and failed at its 30000 ms bound;
  PID 91153 was absent after teardown. Actual source was never mutated.
  Literal command, selection and terminal provenance are in `source-review.md`.
- Standalone `tests/dashboard-concurrent-runs.sh` passed (coordinator session
  73366, exit 0).
- Full local command in Execution context passed (session 41908, exit 0,
  real 517.00 s). `/tmp/open-dough-plan444-full-suite.log` contains no failure
  diagnostics. Job timings are `/tmp/open-dough-plan444-times.txt`.
- Independent refactor review identified only repeated test registration:
  direct timeout arguments format to 283 lines; a local bounded registration
  helper preserves each test's name and 30000 ms timeout within the 250-line
  limit. It was applied after the full run; focused and four-copy normal-runner
  proof passed again. Formatted size is 249 lines. Unchanged production,
  runner and dashboard boundaries reuse the full verdict; unchanged ownership
  timing, teardown and Node timeout semantics reuse mutation discrimination.
  Refactor returned `## REFACTOR COMPLETE`, no gaps. Consumer trace:
  `/tmp/plan444-refactor-consumers.aCT4yS/trace.md`; parallel logs:
  `/tmp/plan444-parallel-refactor.EAsEXO/{1,2,3,4}.log` (all empty).

## Retrospective

- Attribution: Take `39424d5b25f0bdad27eae03389dd740fe5e47055` is claim
  provenance; implementation `78ce26f44f289e274c73e6dba96d635638548ef7` is the
  related delivered change on the execution branch. Other trunk work is not
  attributed to this execution. Initial preparation `d9f70140` is planning
  provenance only. CI on the execution branch remains pending at review time.
- Outcome review compared the original seed, the explicit permanent-regression
  amendment, all source-review commitments and the net delivered patch. No
  implementation correction or architecture exception is needed. Real process
  identity/termination tests retain the negative identity cases; the new delay
  exercises the demonstrated start-slack failure rather than reproducing its
  expected outcome in setup. Focused, parallel and mutation proof are retained;
  unchanged wider boundaries reuse the successful full suite.
- ADR 0000 keeps this test implementation detail with the work; ADR 0010's
  evidence/cost rule supports the bounded fix and added 3.5 s regression.
  No published guidance or production responsibility changed. This urgent
  reliability repair supports the backlog's delivery/intent-proof direction.
- Process review enabled by project configuration and based on this full
  coordinator/agent conversation. Recorded `DD-404` in `DearDough.md`: generic
  planning basenames overwhelmed the consumer trace. Log changed from 638 to
  654 physical lines: above the 500-line warning threshold, below the 1000-line
  ceiling. No maintenance cycle or improvement implementation was invoked.
- Product learning: retain the narrow fix and existing dashboard mitigation;
  no new story, queue change, follow-up correction, or broader timeout/progress
  behavior is justified or authorized.

## Execution complete

Product advice: no change. The permanent delayed-start regression and file-local
bound cover the demonstrated defect; retain the existing Playwright mitigation
and keep runner-wide timeout and live progress output deferred as directed.
