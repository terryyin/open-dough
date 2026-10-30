# Source review — SEED-190#keep-running-cursor-sessions

**Launch:** Fresh general-purpose reviewer; source-only; no plan, product, proof,
or conversation inheritance.
**Input:** Goal, Scope (required behavior, scope limits, boundary assumptions),
and Key examples from
`.planning/seeds/SEED-190-keep-running-cursor-sessions.md#keep-running-cursor-sessions`
only.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Terry can start another Cursor session from the dashboard, including after a production dashboard update, and Cursor agents that are already running keep running. | slice 1 | observed: `dashboard/tests/boundary/cursor-runner-helper-repair-shapes.spec.ts` wire-helper-deleted + production checkout-helper-deleted; `dashboard/tests/cursor-runner-helper-survival.spec.ts` page helper-drift keeps held sessions |
| 2 | Agents a live Cursor runner is already holding stay running when another Cursor session starts. | slice 1 | observed: `dashboard/tests/cursor-runner-helper-survival.spec.ts` — held pids stay `processRunning` after Start; attaches length 3 |
| 3 | Commitment 2 includes the case where a production dashboard update has deleted the checkout that contained that runner’s terminal helper and left the runner process answering. | slice 1 | observed: `dashboard/tests/boundary/cursor-runner-helper-repair-shapes.spec.ts` "wire helper file was deleted…" / "checkout helper was deleted" — `rmSync(retired)` while runner answering; held client survives createChatOnRunner; file restored |
| 4 | The new session starts. | slice 1 | observed: `dashboard/tests/cursor-runner-helper-survival.spec.ts` — third session id appears in attaches; Running list count 3 |
| 5 | Running Cursor sessions lists the agents that are still held, including the earlier ones and the new one. | slice 1 | observed: `dashboard/tests/cursor-runner-helper-survival.spec.ts` — Running region Open Dough buttons count 3 |
| 6 | An explicit stop of one session stops that session and leaves the others running. | slice 1 | observed: `dashboard/tests/agent-session-cursor-stop-several.spec.ts` "Stop on one of several held…" — SIGHUP only on stopped; other pid running; Running list 1; other Working |
| 7 | A runner that has already exited is not brought back; its agents are already stopped. | slice 1 | observed: `dashboard/tests/boundary/cursor-runner-restart-shapes.spec.ts` "a dead pid with its stale address left behind…" and "a port reused after the runner died…" — fresh runner, no revival of dead clients |
| 8 | Do not resume the six sessions already stopped on 2026-10-30. | slice 1 | G3 |
| 9 | Do not require retired deployment checkouts to remain on disk. | slice 1 | G4 |
| 10 | Do not prescribe whether the new session joins the existing runner or a separate one. | slice 1 | G5 |
| 11 | “Already running” means the runner still holds that session’s client. | slice 1 | observed: boundary and page proofs use held attaches / `processRunning` on held pids, not launch records alone |
| 12 | A saved launch record whose client is already gone is not still running. | slice 1 | observed: replacement / dead-pid shapes treat gone clients as not running; Recover journeys remain separate |
| 13 | Journey: held agents working → production update deletes checkout with terminal helper → runner still answering and holding agents → start another Cursor session → earlier agents running and listed, new session running, none hung up. | slice 1 | observed: `dashboard/tests/boundary/cursor-runner-helper-repair-shapes.spec.ts` wire-delete + production checkout-deleted; `dashboard/tests/cursor-runner-helper-survival.spec.ts` Running list |
| 14 | Journey: same held agents running → developer stops one → that session stops → others keep running. | slice 1 | observed: `dashboard/tests/agent-session-cursor-stop-several.spec.ts` "Stop on one of several held…" |
| 15 | Journey: runner process already exited → start Cursor session does not recreate dead clients → new session can still start. | slice 1 | observed: `dashboard/tests/boundary/cursor-runner-restart-shapes.spec.ts` dead-pid and port-reuse shapes start fresh current runner without reviving stale clients |
| 16 | Report acceptance examples are the three key examples in 13–15. | slice 1 | observed: commitments 13–15 own the acceptance examples |
