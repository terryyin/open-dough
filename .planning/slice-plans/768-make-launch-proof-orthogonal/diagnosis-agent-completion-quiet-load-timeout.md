# Diagnosis: agent-completion-quiet-load-timeout

Failure policy: [failure-policy.md](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md) (binding; the repair is owed regardless of attribution).

## Signature

`e2e/sessions/agent-completion-quiet.spec.ts` (3 cases: Land, Story Branch Wrap Up, Trunk Wrap Up) all `timedOut` at the default 30 s
when run with five other built-app specs (s6-consumers-e2e-3, load ~45 on 16 cores, tree cb1ae5ce7 + Slice 6 uncommitted = 840788d00).
Secondary errors: `page.evaluate` in `untilNotedAnswered` (pageRequestNotes.ts:160), and ENOENT `result.json` in the
`finally` of `withInstalledCompletionClosure` (installedCompletionClosure.ts:238).
Alone (s6-quiet-rerun, load 44 -> 37): 3/3 passed in 13.9 s, 15.8 s, 14.3 s.

## Evidence captured (round 1)

Trace timelines of the three failed cases (e2e/test-results/2026-11-22T06-29-10.606Z-53186/*/trace.zip):
- fixtures (origin 4-6 s + dashboard 4.5 s + page 1 s): ~10-12 s before the test body;
- `launch()` settlement (`settledOutcome` long-poll, acceptedAttempts.ts:81): ~8.5 s;
- installed closure (`withInstalledCompletionClosure`) up to the callback: ~7 s;
- the callback reached `openUntilRead` at ~30 s and the timeout fired there (Land) or earlier inside the closure.
No step waits on a fixed deadline or an unanswered signal: each phase is real CPU/Git/process work that progresses,
every phase is ~2x slower than the alone run. The ENOENT is a consequence of the timeout: the `finally` reads the
CI mailbox's `result.json` before its observer has written it, masking the timeout with a second error.

## Attribution

Slice 6 (840788d00) changed StartupRecovery props only; this spec asserts only `startupRecovery` count 0, at the very
end of the page phase that the timeouts never reached. The timed-out steps (fixtures, launch, installed closure, page
open) are untouched by this story's diff. Not caused by this story; repair still owed.

## Hypotheses and experiments

H1 (leading): the test's own serial work (~14 s alone at load ~40) does not fit the 30 s default when its share of
CPU halves under the run's own parallel workers plus external load ~45 -- a time budget the loaded machine exceeds,
not a missed signal.

Experiment E1 (repeat batch, stopping count 1 run, round-1 time bound): rerun the same six-spec set at current load
(~24) and read per-case durations from the proof record. H1 predicts the cases pass but take clearly longer than alone,
scaling with contention; a hang (no progress) in one phase would refute H1.

E1 result (dq-e1, load 24.1 -> 23.5, 2 local workers, exit 0): 10/10 passed; quiet cases 18.9 s, 21.3 s, 14.7 s
(alone at load ~40: 13.9-15.8 s). No reproduction of the timeout at load 24 (0/1 runs). Durations grow with the sibling
specs sharing the run, with no stalled phase: consistent with H1, not yet a confirmation.

Experiment E2 (stopping count 1 run): same six-spec set with `--trace=on` to get a passing per-phase timeline under the
same concurrency at lower load, to compare phase by phase with the three failing traces and find which phases grow
super-linearly (the cuttable cost). Instrument only; no code change.

E2 result (dq-e2, `--trace=on`, load 22.1 -> 22.4, exit 0): 10/10 passed; quiet cases 13.3 s, 13.3 s, 14.0 s. The
reporter removes a passing run's output directory, so no passing trace was kept (instrument gap, not a result).

Experiment E3 (stopping count 1 run): same as E2 with a side copier that mirrors the run's `e2e/test-results/<run>/`
into the evidence folder before the reporter removes it, to get passing per-phase timelines for comparison with the
failing traces. Instrument only; no code change.

E3 result (dq-e3, `--trace=on` + copier, load 22.7 -> 37.7, exit 0): 10/10 passed; quiet cases 16.1 s, 17.2 s, 17.2 s.
Passing traces kept in evidence `dq-e3-traces/`. Phase start times (s), failing (s6, load ~45) vs passing (dq-e3):

| case | dashboard fixture | page | launch start | launched | kept landing | closure done | page open | end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Land fail / pass | 6.3 / 2.5 | 11.0 / 3.9 | 12.7 / 4.5 | 22.9 / 9.7 | 26.8 / 11.7 | 29.7 / 13.2 | 30.2 / 13.5 | 30.0(timeout) / 15.7 |
| Story Branch fail / pass | 4.0 / 0.6 | 8.6 / 2.0 | 10.4 / 2.8 | 20.5 / 7.8 | 24.9 / 10.1 | - / 14.0 | - / 14.7 | 30.0(timeout) / 16.7 |
| Trunk fail / pass | 0.7 / 0.2 | 5.9 / 1.2 | 8.0 / 1.8 | 14.6 / 5.6 | 19.5 / 9.0 | 26.7 / 13.1 | 27.6 / 13.6 | 32.7(timeout) / 16.6 |

Every phase is 2-3.5x slower in the failing run (origin/dashboard/browser fixtures ~3x, launch ~2x, closure ~1.6-2x);
no phase stalls on a deadline or an unanswered signal, and no phase's growth stands out. H1 confirmed as far as
evidence can go without a forced reproduction: the case's serial real work (13-21 s at load 22-37 with sibling specs)
leaves under 2x headroom in the 30 s default; a machine at load ~45 (16 cores) plus the run's own second worker
exceeds it. No leftover test-owned observers or dashboard servers found after the runs (only the execution's own
`ci-mailbox worker /tmp/dough-ci-501/watch-soF02g`, not test-owned; other worktrees' processes add external load).

Unrelated defect found and fixed (test support): `withInstalledCompletionClosure`'s `finally` asserted the mailbox
`result.json` whenever the workspace was gone, so a timeout or earlier failure after retirement replaced the real
error with ENOENT and skipped stopping a still-running observer. The status assertion now sits on the success path
before `observe`, and `finally` stops the observer whenever no `result.json` exists.

Experiment E4 (stopping count 1 run): the quiet spec alone after the finally change, to prove the success path
still asserts the observer's terminal status and passes.

E4 result (dq-e4, spec ALONE, load 33.8 -> 49.3 from other executions, exit 1): 0/3 passed, all `timedOut`
(32.4 s, 33.1 s, 31.0 s) -- the signature reproduced naturally without the sibling specs. Traces
(e2e/test-results/2026-11-22T06-55-58.860Z-74522): Land and Story Branch spent the budget in fixtures alone
(origin 6.5 s, dashboard 9.6 s, browser 7.3 s, page 2 s, then launch settlement at 58 s) and never reached the
closure; Trunk reached the observer claim (completionObserverClaim.ts:40) at 31.8 s. Secondary errors are post-timeout
noise from the body still running after fixture teardown removed the machine folder (`socket hang up`,
`spawn node ENOENT`). So "passes alone, fails together" is really "passes below ~load 40, fails above ~45": the
sibling specs only add load. The finally change was not reached on its success path in E4; it is unproven.

## Environments ruled out (counts)

- Sibling specs as a functional interference: ruled out -- 3/3 six-spec runs at load 22-38 passed (dq-e1, dq-e2,
  dq-e3: 9/9 quiet cases), and alone at load 34-49 failed 3/3 (dq-e4).
- Leftover test-owned processes (runnerMain, dashboard servers, test CI observers): none found after any run.
- A stalled phase / missed signal: none in 6 failing traces; every phase scales together.

## Cause (confirmed by natural reproduction, not by a fix)

Time budget, not synchronization: one case runs ~13-21 s of real serial work (fixtures: prepared origin copy +
dashboard server + browser; a real launch with workspace install; a real installed closure with Git, CI observer and
retirement; three installed reporting runs; then a browser page phase), all inside the default 30 s test timeout.
CPU contention scales every phase 2-3.5x, so at load >= ~45 on 16 cores the case exceeds 30 s regardless of
which other specs run.

## Attribution

Not this story: Slice 6 (840788d00) touched StartupRecovery props; failures end before the page phase that asserts
Startup recovery absent; E4 reproduced on the committed tree alone with the failure in fixtures/launch/closure. This
story's scope excludes E2E cases. The repair is still owed under the failure policy.

## Changes in the tested tree

- Parked, not in the tree: `diagnosis-agent-completion-quiet-observer-stop.patch` beside this record holds the
  unproven `dashboard/test-support/support/installedCompletionClosure.ts` change (apply with `git apply`; it needs one
  green run of the spec before it is kept). Change: the
  observer `result.json` status assertion moves from `finally` onto the success path; `finally` stops the observer
  whenever no `result.json` exists, so a failure after retirement is no longer replaced by ENOENT and a still-running
  observer is stopped. No temporary diagnostic edits to revert (the trace copier lived in /tmp).

## Leading hypothesis and next discriminating experiment

Leading: the case's serial work is too large for the 30 s budget on this machine's routine load; the repair is to cut
the work inside the budget, which is a test-design decision because the allowed levers are (a) splitting the journey
(e.g. installed closure + quiet reporting proved without the browser; the page phase from a composed retired record),
(b) moving fixture cost out of the test budget (prepared origin / dashboard start), or (c) an in-test timeout override
that AGENTS.md permits only when essential and the repair brief forbids.
Next experiment: one more round measuring which phase to cut -- per-phase timing of 10 passing runs at load ~40 from
the traced copier (dq-e3 method), to size (a) vs (b) before a human picks the lever.

Round 1; cumulative active minutes ~5 (clock `cumulativeMinutes` 4.9 at round end).

## Coordinator disposition (round 1)

Held for Terry: the repair needs a test-design choice on an E2E journey this unit-test story excludes. Recommended:
(a) split the journey as a follow-up correction. Independent slices continue; execution does not complete while this
repair is owed and unassigned.
