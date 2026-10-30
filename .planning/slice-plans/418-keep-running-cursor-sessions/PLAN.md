# Starting another Cursor session leaves already-running agents running

**Source:** [Selected story](../../seeds/SEED-190-keep-running-cursor-sessions.md#keep-running-cursor-sessions)
**Identity:** SEED-190#keep-running-cursor-sessions

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
npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/cursor-runner-restart-shapes.spec.ts
npx playwright test --config dashboard/playwright.config.ts dashboard/tests/cursor-runner-replacement.spec.ts
```

Revise those specs (and any tightly paired sibling under `dashboard/tests/`) so
they expect held agents to survive the new-work path after helper-gone /
stale-proof replacement shapes this story owns. Keep observation's
leave-alone assertions green. Discriminating check: with the survival change
disabled in a scratch edit, the new survival assertions fail while
observation leave-alone still passes.

## Ordered slices

### 1. New Cursor work after a missing helper leaves held agents running
Type: Behavior
Status: planned
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

- Implementation shape (restore a usable helper for the same answering
  same-build runner, avoid hangup on replace, or another shape that meets the
  examples without a second address-file runner system) is chosen during the
  Behavior slice from the cheapest change that satisfies the proof. The story
  does not pre-select it.

## Concern evidence

- Slice-plan refinement: not needed — one Behavior slice, one proof loop, no
  cumulative special-case design or sizing concern within the understood
  outcome.
- Remaining slice-specific concerns: none.
