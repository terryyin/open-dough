# Diagnosis: lifecycle-expiry-timeout

## Failure signature

`dashboard/backend-tests/review/ad-hoc-manual-landing-observation-lifecycle.spec.ts:199`
"expiry while the target is being inspected releases evidence and cannot
recreate the launch": `Test timeout of 30000ms exceeded`, last reached at
line 212 `await expect.poll(() => landingPins(origin.project)).toEqual([])`.

## Reproductions

| Run (evidence) | Conditions | Result |
| --- | --- | --- |
| `s1-broad` | backend `review/` group plus two launch specs, load 28–40 | timeout (with 7 other ad hoc timeouts/socket hang-ups that passed on rerun) |
| `s1-rerun` | 6 failing files + one-shot spec, load 25–40 | timeout at line 212 again |
| `s1-lifecycle` | file alone | pass |
| `d1-lifecycle`, `d1b-lifecycle` | file alone, load 14–24 | pass; per-test 7.3 s, 15.2 s, 18.7 s (expiry case) |
| `d1d-trace` (trace in evidence `d1d-trace.zip`) | expiry case alone, load ~15 | pass 16.8 s |

Evidence directory: `git rev-parse --git-path open-dough/evidence` in the
execution checkout.

## Attribution

This story's change (`storyReviewSessionAdmission.ts`,
`storyReviewSessionFileAdmission.ts`) only adds a story-identity refusal on
session review lookups; these ad hoc sessions carry no story identity and the
pin-expiry path does not call the changed function. Base revision not run.

## Hypotheses and experiments

1. **The case's fixed cost sits close to the 30 s bound, so load alone pushes
   it over.** Trace: `Before Hooks` 16.3 s, of which fixture `observation`
   13.6 s, almost all untraced Node work. Scratch timing (spec copy, deleted):
   `launchIsolatedReview` 1.1–1.6 s, `commit` ~0.1 s, **`markAdHocDone`
   5.5–5.6 s each** (×2), merges+push 0.2 s, body launch 1.4 s. Confirmed: the
   two Done marks spend ~11 s of the ~17 s at load 15, so at load ≥30 the case
   exceeds 30 s.
2. Leading hypothesis (open): the Done mark waits out a fixed interval
   (~5 s) in this fixture, e.g. a host-side wait or retry deadline reached
   through `NativeDoneMarks.markDone` (`dashboard/server/launchBoundaryAnswer.ts:48`).
   Next discriminating experiment: time inside `markDone` to find the wait.
   Code reading: `markSessionDone` → `finishNativeDone` → Claude
   `renameInClaudeCode` (`dashboard/server/hosts/claude/rename.ts`) polls the
   listing for `idle` up to the manual rename wait (5 s default). The fake
   `claude` lists every launched session `busy`/`working` forever, so each
   `markAdHocDone` waits out the full 5 s and retains a `doneProblem`
   ("still working"). Test-environment cause, not product: the helper marks
   Done on a session the fixture never lets finish.
3. **Fix hypothesis:** `markAdHocDone` first lists the session `done-live`
   (finished, idle — as `ad-hoc-branch-worktree-result.spec.ts` does) so the
   rename completes through the fake attachment in < 1 s. Batch: one
   before/after run of the markAdHocDone consumer specs (the lifecycle,
   retry, observation, manual-landing, branch-result, cursor-recovery,
   comparisons, session-branch-landing specs). Stopping count: 1 before +
   1 after; stop if the after run shows no Done-mark drop.
   **Confirmed.** `d2-before` (10 consumer files, 30 tests, load 16–18):
   all pass, sum 333 s, run 174 s; lifecycle expiry case 17.2 s.
   `d2-after` with the fix (load 14–15): all pass, sum 147 s, run 78 s;
   lifecycle expiry case 7.9 s; every Done-marking case drops ~5–13 s
   (two-Done cases ~11–13 s). Per-case table: evidence `d2-compare.txt`;
   full report: evidence `lifecycle-diagnosis-report.md`.

## Fix

`dashboard/test-support/support/adHocReview.ts` `markAdHocDone` lists the
session `done-live` before posting Done (fix clock `lifecycle-fix`).

## Temporary edits and parked changes

None outstanding (scratch spec removed). Slice 1's uncommitted changes are
parked in the checkout and are not suspected.

## Rounds

Round 1 confirmed the cause (paused at ~4 active minutes); fix under slice clock `lifecycle-fix`.
