# Diagnosis: cursor-session-recovery "done and completed sessions offer no Recover"

## Failure signature

- CI run `46011428917`, attempt 1, job `140547633076` (`e2e / shard 6/6`),
  revision `c446520f5` on `claude/diagnose-dashboard-ci-probe-flakes`.
  Artifact `e2e-failure-output-6` holds `error-context.md` and `trace.zip`.
- `e2e/sessions/cursor-session-recovery.spec.ts:166` timed out after 30 s
  in `shownDoneSessionEntriesOf`
  (`dashboard/test-support/dashboardParts.ts:133`, `waitFor attached`). It
  was waiting for the story's Done session entry after
  `keepLaunchStore(... doneAt ...)` and `reloadUntilRead`.
- Page snapshot at timeout: the Taken card still says "This story has an
  open session", and its Ad hoc Cursor session shows "The agent is not
  running" with a Recover button. The page never received the `doneAt` that
  the test wrote.

## Attribution

This story changed only `responsive-unattached-startup.spec.ts` (a frontend
Vitest spec) and planning records. It does not touch the failing code. No
failure of this test appears in any failed CI run from 2026-11-20 through
2026-11-27 13:30Z. This is its first occurrence.

## Reproduction

- 2026-11-27 22:08 local time, load averages 23.5/20.6/25.7. `npm run test:e2e
  -- sessions/cursor-session-recovery.spec.ts` passed with exit 0 (one run).

## Trace timeline (UTC, 2026-11-27)

- 14:00:25.349: `endHeldClient`'s poll evaluates the runner endpoint. The
  page issues `GET __agent-launch/cursor-sessions` at 25.373 and `POST
  __agent-launch/reconciled` at 25.374.
- Between 25.349 and 25.420 the test reads `keptRecords` and writes
  `agent-launches.json` directly, with no server lock.
- 25.420: reload. 25.892: `GET __agent-launch`. 26.268: wait for the Done
  entry starts and runs until it times out.

## Hypotheses

1. Confirmed (earlier marked ruled out, wrongly): the page's `POST
   __agent-launch/reconciled` rewrites `agent-launches.json`.
   `reconcileAttempt` → `keepAttempt` (`launchAttemptStore.ts:189`) →
   `retainLandingSettlement` (`landingSettlementRetention.ts`) →
   `replaceRecords`, which reads and renames the store under its lock. The
   test wrote the store in place without that lock, so a write that landed
   between the server's read and its rename was replaced by the record
   without `doneAt`. CI posted `/reconciled` at 25.374, inside the test's
   write window (25.349–25.420).
2. Subsumed by 1: the read-modify-write is the reconciliation rewrite.
3. Not pursued: the forced experiment explains the signature without it.

## Round 1 (2026-11-27 22:13–, load 9.5–22)

- Instrument A (`cdr-watch1`, `cdr-watch2`; temporary scratch spec, now
  removed): polled the store every 3 ms. With no doneAt write, the server
  rewrote the store with identical content about 1 s after the start
  settled (`settledAt` write), 0.55 s before `openTakenCursorSession`
  returned. Locally it lands before the test's write; under CI load it can
  land after `endHeldClient`.
- Instrument B (`cdr-force1..3`; temporary scratch spec, now removed): held
  the page's `/reconciled` request with `page.route` until after
  `endHeldClient`, released it, waited for the store lock directory to
  appear, then wrote `doneAt`. Unlocked in-place write (the test's old
  setup): doneAt lost 2 of 3 (`Received: undefined`; `cdr-force2`; the
  first batch `cdr-force1` never saw the lock because the spin blocked the
  route release). Write under the lock (`changeMachineDocument`): doneAt
  kept 5 of 5 (`cdr-force3`).
- Classification: test-setup defect. The server writes correctly under its
  lock; `dashboard/test-support/support/machineDocument.ts` already states
  that a test changing a machine document beside a running server must use
  the same lock.
- Repair: `changeKeptSessionsBesideServer` in
  `dashboard/test-support/support/launchStore.ts` changes each kept session
  record under the store lock; the spec's three store changes (unconfirmed
  first input, doneAt, completion) use it.
- Repaired-proof batch hypothesis: with locked writes, the spec passes.
  Stopping count: `--repeat-each 5` of the whole spec (30 runs); any
  failure of the done/completed case stops and reopens the diagnosis.
- Repaired proof (`cdr-repaired`, `caffeinate -s -i`, load 7.7–12.1):
  whole spec `--repeat-each 5`, 30 of 30 passed, exit 0. Typecheck
  (`npx tsc --noEmit -p e2e/tsconfig.json`) and eslint on both changed
  files passed.
- Consumer trace: `changeKeptSessionsBesideServer` is new and used only by
  `e2e/sessions/cursor-session-recovery.spec.ts`; no existing helper
  changed (`cdr-consumer-trace.log`).
- Temporary diagnostic edits: none left in the checkout (scratch specs
  copied to the evidence folder).
- Unrelated defect noticed, not pursued: other tests may still write
  `agent-launches.json` with `keepLaunchStore` beside a running server after
  a page start settles; the same race applies to them.
- Clock: round 1, cumulative 3.3 active minutes, paused; leading hypothesis
  confirmed; no next experiment.
