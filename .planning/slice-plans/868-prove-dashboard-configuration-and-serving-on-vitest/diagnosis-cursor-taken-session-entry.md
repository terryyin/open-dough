# Diagnosis: cursor-taken-session-entry

## Signature

`openTakenCursorSession` (`dashboard/test-support/support/cursorSessionReading.ts:96`)
`expect(sessionEntriesIn(parts(page).taken)).toHaveCount(1)` times out at the
default 5 s expect timeout with 0 entries. Failing:
`e2e/sessions/agent-session-cursor-unavailable.spec.ts:33,55,82`,
`e2e/sessions/cursor-session-recovery-stops.spec.ts:34`.

## Reproductions

| Run | Tree | Load (1m) | Result |
| --- | --- | --- | --- |
| `$EV/s7-e2e-consumers-1.log` (~40 min earlier) | 53a1e7ab6 + earlier slice-7 edits | not recorded | 4/4 passed (3.5-7.0 s each) |
| `e2e/test-results/2026-11-27T03-00-11.406Z-19780` | candidate | ~20 | 4/4 failed, same signature |
| `$EV/s7r-e2e-cursor-rerun-1.log` | candidate | ~20 | 4/4 failed (9.7-11.3 s each), same signature |
| `$EV/s7r-e2e-cursor-bisect-1.log` | candidate, one spec file | ~20-24 | 2 failed (24 s each), 1 passed (`:82`, 11.6 s) |
| `$EV/dx-cursor-base-1.log` (`.run.json`) | clean worktree of 53a1e7ab6, real `npm ci`, no parked changes | 21-25 | 3 failed (`:33`, `:55`, `:82`) same signature at `cursorSessionReading.ts:96`; `recovery-stops:34` passed (14.6 s) |

Platform macOS, 4 Playwright workers (list reporter), other agents' work on
the host. CI run 45928835873 on 53a1e7ab6 succeeded.

## Evidence from the trace (round 1)

Trace `e2e/test-results/2026-11-27T03-04-53.385Z-53038/sessions-cursor-session-re-a7754-*/trace.zip`:

- Page snapshot at failure: Start button disabled, status
  "Starting a session in Open Dough… Admitting a story."; Taken "0 entries".
  The session is still being admitted, not misclassified.
- Network: `POST /__agent-launch/accept` 03:05:19.536; attempt worker step
  `start` 19.665 → publication `published` (SEED-001#ad-hoc-work) by 20.753;
  step `launch` (admission worktree created) only at 24.191; next
  `/changed?seen=4` at 24.545 was cut off by the expect timeout (~24.5).
- So the admission (story publication + admission worktree) took ~4.5 s of
  the 5 s budget under load ~20-24; the launch itself had not yet produced
  the record.

## Parked changes in the tested tree

16 uncommitted slice-7 files (see `git status`). None touch the launch,
admission or Taken projection path: `cursorRunnerJourney.ts` changes only
`expectCursorRunnerStandIn` / `liveRunner` (expect → node:assert/waitUntil);
`sharedReads.ts`, `localOriginReads.ts`, `productMark.ts`, `brandIcons.ts`,
`productionWatcher.ts` are read/icon/watcher helpers not imported by the
failing launch step.

## Hypotheses

- H1 (leading): load-dependent latency. Under host load ~20+, Cursor
  ad-hoc admission takes ≳5 s, exceeding the default expect timeout at
  `cursorSessionReading.ts:96`; not caused by the parked slice-7 changes.
  Experiment: run the same two spec files on a clean worktree of 53a1e7ab6
  (`$JOB/tmp/base`, real `npm ci`) under the same load, then the candidate
  right after. Stopping count: 1 run each (4 tests each). Prediction under
  H1: base fails with the same signature at comparable rate; under the
  alternative (parked changes), base passes 4/4 while candidate fails.

## Result of the attribution experiment (H1)

Base 53a1e7ab6 without any parked change reproduced the signature 3/4 at the
same load; candidate 4/4 (rerun-1) and 2/3 (bisect-1). The parked slice-7
changes are not the cause: attribution is **base** (committed code), same
rate within noise. H1 supported: the 5 s default expect at
`cursorSessionReading.ts:96` covers story publication plus admission
worktree creation plus launch (git-heavy, ~4.5 s to reach `launch` in the
trace) and is exceeded when the host is saturated. Earlier pass at 3.5-7 s
per test vs 9-24 s now matches a load swing.

Load source (external, not this worktree): `ps` shows another worktree's
Playwright suite (`open-the-board-from-the-verified-git-trunk`), a
`git-publication-native` shell test at ~75 % CPU, Spotlight/Siri daemons.
No leftover `runnerMain` processes from this worktree.

Environments ruled out: parked slice-7 changes (base reproduces 3/4).
Date/HOME-dependent classification ruled out by the trace: the attempt is
still in admission ("Admitting a story.") at timeout, not landed elsewhere.

## Unrelated defects

- Test defect (committed code, also on trunk presumably): a fixed 5 s bound
  on a git-heavy launch in a shared helper used by 5 spec files
  (`agent-session-cursor*.spec.ts`, `cursor-session-recovery*.spec.ts`).
  Per project memory, a fixed bound a loaded machine can exceed is a test
  defect for a later correction, not a reason to weaken assertions.

## Leading hypothesis and next experiment

H1 confirmed as far as attribution goes. Repair needs a judgment call
(not taken here): either (a) wait on a load-independent cue at line 96
(e.g. the start status settling / attempt reaching `launch` before
counting entries), or (b) an explicit per-call timeout on the
`toHaveCount(1)` like other launch waits (a `launchTimeoutMs` fixture is defined in
`dashboard/test-support/dashboardTest.ts`), or (c) accept as external load and rely on CI
(green on 53a1e7ab6, run 45928835873) plus a rerun once load drops.
Next discriminating experiment if wanted: rerun the 2 spec files on the
candidate when 1-min load < 10; expect 4/4 pass.

## Temporary diagnostic edits

None.

## Round log

- Round 1: trace read; attribution experiment run (base 3/4 fail). Base worktree removed. Round count 1, cumulative active minutes ~3 (clock `cumulativeMinutes` 2.3 at last run). Clock paused.

## Confirmed cause and repair (round 2, `repair-cursor-taken-wait`)

- Cause confirmed: test defect in committed test support. After Start,
  `openTakenCursorSession` counted Taken session entries with Playwright's
  default 5 s, while the ad-hoc start (Take publication + admission worktree
  + launch) may take as long as the shared launch wait under host load.
- Repair (a), load-independent cue through an existing page-object step:
  `openTakenCursorSession` now calls `startedSession(page)`
  (`dashboard/test-support/launchStoryCardPage.ts`), the step the Cursor
  ad-hoc start specs already use. It waits for "Local startup in progress."
  to clear (bounded by `launchWaitMs`, the shared launch bound), asserts no
  success log, then asserts exactly one Taken entry. The count assertion is
  unchanged in strength. No product change; unused `parts` /
  `sessionEntriesIn` imports removed.
- Proof:
  - `$EV/rc-two-1.log` (`.run.json`): the two failing spec files, 4/4
    passed (5.5-9.3 s each); load 16.6 → 19.1 (1 min), ~20 (5 min) — the
    same load band at which base and candidate failed 3/4 and 4/4.
  - `$EV/rc-all-1.log` (`.run.json`): every `agent-session-cursor*` and
    `cursor-session-recovery*` spec (all direct and transitive callers of
    `openTakenCursorSession`, incl. via `openStoppedCursorEntry`), 28/28
    passed in 3.6 min; load 19.9 → 17.4.
  - `$EV/rc-typecheck-1.log`: `npm run typecheck:dashboard` exit 0.
  - `$EV/rc-eslint-1.log`: eslint on the changed file exit 0.
- Status: resolved; record is spent once the repair is delivered.
