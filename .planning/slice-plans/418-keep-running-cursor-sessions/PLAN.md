# Starting another Cursor session leaves already-running agents running

**Source:** [Selected story](../../seeds/SEED-190-keep-running-cursor-sessions.md#keep-running-cursor-sessions)
**Source review:** [source-review.md](./source-review.md)
**Identity:** SEED-190#keep-running-cursor-sessions

## Story obligations

### G1. Deleted wire helper file not asserted (address-drift only)
Reported: slice 1 — "Copy-from-install onto a missing wire helper path has no separate focused assertion (address-drift repair is what the specs hit)."
Story clause: "a production dashboard update has deleted the checkout that contained that runner's terminal helper and left the runner process answering"
Disposition: proved by slice 1: `dashboard/tests/boundary/cursor-runner-helper-repair-shapes.spec.ts` "a runner whose wire helper file was deleted…" and "the production deployment shape…checkout helper was deleted" — `rmSync(retired)` then createChatOnRunner keeps same pid/heldPid and restores the file from this install

### G2. Stop one of several held sessions leaves the others running
Reported: slice 1 — "Explicit stop-one-session not freshly asserted in this slice's focused commands."
Story clause: "An explicit stop of one session stops that session and leaves the others running"
Disposition: proved by slice 1: `dashboard/tests/agent-session-cursor-stop-several.spec.ts` "Stop on one of several held Cursor sessions ends only that client and leaves the others running under Running Cursor sessions" — SIGHUP only on stopped; other pid still running; Running list count 1; other entry Working

### G3. Do not resume the six stopped sessions
Reported: slice 1 — "Do not resume the six sessions already stopped on 2026-10-30."
Story clause: "Do not resume the six sessions already stopped on 2026-10-30"
Disposition: excluded "Do not resume the six sessions already stopped on 2026-10-30"
Commitment: 8

### G4. Do not require retired checkouts on disk
Reported: slice 1 — "Do not require retired deployment checkouts to remain on disk."
Story clause: "Do not require retired deployment checkouts to remain on disk"
Disposition: excluded "Do not require retired deployment checkouts to remain on disk"
Commitment: 9

### G5. Do not prescribe runner join vs separate
Reported: slice 1 — "Do not prescribe whether the new session joins the existing runner or a separate one."
Story clause: "Do not prescribe whether the new session joins the existing runner or a separate one"
Disposition: excluded "Do not prescribe whether the new session joins the existing runner or a separate one"
Commitment: 10

## Goal and scope

Terry can start another Cursor session from the dashboard, including after a
production dashboard update has deleted the checkout that held the live
runner's terminal helper, and the Cursor agents that runner already holds keep
running and stay listed under Running Cursor sessions, with the new session
running too. An explicit stop of one session still stops only that session. A
runner that has already exited is not revived.

**Exclusions:** Resuming the six sessions already stopped on 2026-10-30;
requiring retired deployment checkouts to remain on disk; prescribing whether
the new session joins the existing runner or a separate one as long as the
examples hold.

**Assumptions:** "Already running" means the runner still holds that session's
client. Observation and start-if-absent continue to leave an answering runner
alone. New Cursor work still needs a usable way to open a terminal on the
current install.

## PFE and architecture

- **Reuse:** `ensureCurrentCursorRunner` / `spawnHelperReady` in
  `dashboard/server/hosts/cursor/runnerCurrent.ts`, `stopCursorRunner` and the
  runner SIGTERM → `attachments.close()` hangup path, `terminalBridge`'s
  held-vs-new-work split, production watcher's `ensureCursorRunner`-only
  ensure, and the proofs in
  `dashboard/tests/boundary/cursor-runner-restart-shapes.spec.ts` and
  `dashboard/tests/cursor-runner-replacement.spec.ts`.
- **Change:** The current-runner path for new work. Today a missing recorded
  helper makes an answering runner not current even when `buildId` matches, so
  new work stops that runner and hangs up every held client. Change that path
  so the story's examples hold: held agents survive the new-session start after
  helper-gone, and the new session still starts. Prefer keeping one
  machine-local accepting runner address (do not invent a second parallel
  current-runner system or dual address files unless a cheaper change fails
  the examples).
- **Found elsewhere:** SEED-161 published helper proof and made helper-gone
  replace the runner so new terminals would work. That replacement is the
  defect relative to this story; revise its outcome where held agents must
  survive, without undoing observation's leave-alone behavior.
- **ADR:** Follow
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  Running Cursor sessions is machine-local evidence; no Accepted decision
  requires hanging up held agents on a new session or checkout retirement. No
  North Star topic warranted.

## Outside-in proof

| Key example | Signal |
| --- | --- |
| Helper-gone, answering runner still holds agents, then a new Cursor session starts | Focused runner/boundary (and page journey as needed): earlier held clients stay alive (no SIGHUP / still listed under Running Cursor sessions); the new session is running too |
| Explicit stop of one held session | Existing stop journey: that session stops; the others keep running |
| Runner process already exited | Starting a Cursor session does not recreate the clients that died with it; the new session can still start |

Focused commands (owned checkout):

```text
PATH="/opt/homebrew/bin:$PATH" npx playwright test --config dashboard/playwright.config.ts \
  dashboard/tests/boundary/cursor-runner-restart-shapes.spec.ts \
  dashboard/tests/boundary/cursor-runner-helper-repair-shapes.spec.ts \
  dashboard/tests/cursor-runner-replacement.spec.ts \
  dashboard/tests/cursor-runner-helper-survival.spec.ts \
  dashboard/tests/agent-session-cursor-stop.spec.ts \
  dashboard/tests/agent-session-cursor-stop-several.spec.ts
```

Accepted proof (slice 1): that focused suite, 16 passed after helper-repair
survival and post-change splits. Discriminating check (pre-refactor): with
`repairSpawnHelperProof` forced to return false, helper-gone / production /
page survival assertions failed while observation leave-alone still passed.

## Ordered slices

### 1. New Cursor work after a missing helper leaves held agents running
Type: Behavior
Status: done
Proof: The outside-in table above through the focused Playwright commands.
Discriminating check as above.

Behavior: An answering Cursor runner still holds one or more working agents,
and its published terminal helper is gone from disk (as after a production
dashboard update deleted that checkout), while the runner remains reachable →
Terry starts another Cursor session → the earlier agents keep running and
remain listed under Running Cursor sessions, the new session is running, and
none of the earlier agents is hung up. Explicit stop of one session still
stops only that session. A runner that has already exited is not revived.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Helper-gone makes start-if-absent leave the runner alone and makes the next new-work launch replace it (today's path) | Slice 1 changes that new-work outcome for held agents | `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/cursor-runner-restart-shapes.spec.ts -g 'terminal helper is gone'` in this preparation checkout (with linked `node_modules` for the run only; symlink removed afterward) | Passed (736ms): held client survived `ensureCursorRunner`; `createChatOnRunner` replaced the runner. Confirms the defect path this slice revises. |

## Current decisions

- Implementation shape: restore usable helper proof for the same answering
  same-build runner (`repairSpawnHelperProof` in `runnerCurrent.ts`) — rewrite
  recorded address to the wire helper path, and copy this install’s helper onto
  that path when the retired checkout removed the file. One machine-local
  address file kept. True build-mismatch still replaces.

## Learnings

- Observation / `ensureCursorRunner` leave-alone stays correct after helper-gone;
  only the new-work currentness path needed repair.
- Focused proofs publish a fixture retired-checkout helper via
  `OPEN_DOUGH_CURSOR_SPAWN_HELPER_PROOF` so the wire path can be deleted without
  removing this install’s real node-pty helper (repair’s copy source). The
  runner caches the published path at process start.
- CI repair (run 41022008901 on `aded040f`): board-paging Shift+Tab into a
  height-hidden Backlog card scrolled while the column page row was still
  sliding; restorative `scrollIntoView` now waits for `!sliding` in
  `columnPaging.ts`.

## Concern evidence

- Slice-plan refinement: not needed — one Behavior slice, one proof loop, no
  cumulative special-case design or sizing concern within the understood
  outcome.
- Remaining slice-specific concerns: none.

## Execution complete

Product advice: Aggregate delivery matches the story — same-build helper
repair reuses the answering runner so held agents survive the next Cursor
session after production checkout retirement; observation leave-alone and
stale-buildId replace stay intact; stop-one-of-several and dead-runner cases
are covered. Aligns with ADR 0008; no product correction or backlog change
recommended. Conclusions remain conditional on unresolved CI for
`0921f1f71ab86f870b8adf8d686cb7889256e900`.
