# Source review — SEED-232#reduce-running-cursor-session-requests

**Launch:** fresh general-purpose reviewer (no conversation inheritance),
2026-11-05, agent id `05ed7080-9e96-414a-b209-6162203edfd3`.
**Input:** story Goal, Scope (required behavior, boundary assumption, deferred
promises, scope limits), Key examples, and Evaluation basis from
`.planning/seeds/SEED-232-reduce-dashboard-refresh-traffic.md#reduce-running-cursor-session-requests`
only. No plan, return, product, or proof supplied. Instruction: use only those
inputs; read no other project files; change nothing; return numbered
commitments, qualifications, journey examples, and exclusions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | While watching the expanded Running Cursor sessions section, the developer sees which sessions the Cursor runner holds. | slice 2 | |
| 2 | While watching that expanded section, the developer sees what those sessions' screen labels say. | slice 2 | |
| 3 | For the same quiet watch, browser-to-dashboard list requests are far fewer than today. | slice 2 | |
| 4 | For the same quiet watch, dashboard-to-runner requests are far fewer than today. | slice 2 | |
| 5 | A session appearing still shows in the section within about one second of the change. | slice 2 | |
| 6 | A session leaving still shows in the section within about one second of the change. | slice 2 | |
| 7 | A session changing label still shows in the section within about one second of the change. | slice 2 | |
| 8 | Runner-up / unreachable / empty-list distinctions are kept as they are. | slice 2 | |
| 9 | Collapse ending demand is kept as it is. | slice 2 | |
| 10 | Independence from the published Git feed is kept as it is. | slice 2 | |
| 11 | While the Sessions sidebar is open and the Running Cursor sessions section is expanded, each list ask is answered from the held-session observation this dashboard process last settled for the current home and machine-document revision when that observation is younger than about one second. | slice 1 | observed: heldSessions.ts reuseMs configuredLimit(DOUGH_SESSIONS_REUSE_MS,1000); cursor-runner-sessions-sharing.spec.ts within-window askList leaves sessionsReads() unchanged |
| 12 | That reuse window is the same reuse window machine-session observation already uses for related Cursor evidence. | slice 1 | observed: heldSessions.ts configuredLimit("DOUGH_SESSIONS_REUSE_MS", 1_000) same name/default as machineSessionObservation.ts |
| 13 | Otherwise (when no such young settled observation exists), the list ask joins an observation already outstanding. | slice 1 | observed: cursor-runner-sessions-sharing.spec.ts and cursor-held-sessions-revision.spec.ts overlapping asks: sessionsReads stays before+1 while held |
| 14 | The list ask reads the runner only when neither a young settled observation nor an outstanding observation exists. | slice 1 | observed: same specs: after reuseMs+200 delay, sessionsReads() greater than settled |
| 15 | Session cards and other readers of the same held evidence keep sharing that observation as today. | slice 1 | observed: consumer-trace: sessions.ts, launchBoundaryAnswer.ts, sessionAdmission.ts reuse heldCursorSessionEvidence API |
| 16 | The section's own ask gap matches that reuse window: after a settled answer it waits about one second before the next owned ask while still expanded and visible (instead of 50 ms). | slice 2 | |
| 17 | A page that becomes visible again asks at once under the same reuse. | slice 2 | |
| 18 | Collapse ends owned demand. | slice 2 | |
| 19 | Sidebar close ends owned demand. | slice 2 | |
| 20 | Unmount ends owned demand. | slice 2 | |
| 21 | A hidden document pauses further asks until it is seen again. | slice 2 | |
| 22 | A runner that is not running stays distinct in the section as today. | slice 2 | |
| 23 | A runner that cannot be reached stays distinct in the section as today. | slice 2 | |
| 24 | A runner that answers no sessions stays distinct in the section as today. | slice 2 | |
| 25 | A failed or unanswered observation keeps no settled answer for reuse, as other shared observations do. | slice 1 | observed: shared-observation.spec.ts failed observation rejects waiters and keeps no settled result; heldSessions.ts comments keep no settled answer on failure |
| 26 | After a failed or unanswered observation, the next ask reads again. | slice 1 | observed: shared-observation.spec.ts next demand after failure starts===2 observes afresh |
| 27 | The section remains machine-local evidence. | slice 2 | |
| 28 | The section remains independent of the published Git revision feed. | slice 2 | |
| 29 | The section remains independent of the Board's other recurring reads. | slice 2 | |
| E1 | Quiet watch: over one minute about sixty browser list asks and about sixty runner reads (vs on the order of a thousand each today); section keeps the same three rows. | slice 2 | |
| E2 | Label change within the bound: follow-up label shows within about one second. | slice 2 | |
| E3 | List membership: row appears or drops within about one second. | slice 2 | |
| E4 | Seen again under reuse: ask at once; answered from settled observation without a new runner read inside the window; after the window reads the runner. | slice 1 | observed: cursor-runner-sessions-sharing.spec.ts and cursor-held-sessions-revision.spec.ts within-window reuse then past-window re-read |
| E5 | Collapse ends demand: no further list asks; other readers keep their demand. | slice 2 | |
| E6 | Unreachable stays distinct: today's unreachable wording and no rows; does not reuse an earlier successful list as if the runner were still fine. | slice 1 | observed: shared-observation.spec.ts + heldSessions failure path: failed/unanswered keeps no settled successful list for reuse; next ask reads again |
| E7 | Independent of Git: quiet-minute ask counts stay as in E1; Board refresh unchanged. | slice 2 | |
| D1 | Deferred: local session updates over SSE or push without recurring browser asks. |  | X-D1 |
| D2 | Deferred: sharing settled runner observations across separately launched dashboard processes. |  | X-D2 |
| D3 | Deferred: unchanged / digest answers while ask pace stays high. |  | X-D3 |
| D4 | Deferred: a sub-second continuous watch. |  | X-D4 |
| D5 | Deferred: aligning this section to the Board's 15-second pace. |  | X-D5 |
| S1 | Scope limit: no change to what a row shows. |  | X-S1 |
| S2 | Scope limit: no change to how choosing a row opens the terminal. |  | X-S2 |
| S3 | Scope limit: no new daemon. |  | X-S3 |
| S4 | Scope limit: no new database. |  | X-S4 |
| S5 | Scope limit: no new scheduler. |  | X-S5 |
| S6 | Scope limit: no change to the runner protocol. |  | X-S6 |
| S7 | Scope limit: no change to machine-session observation's own 15-second page pace. |  | X-S7 |
| S8 | Scope limit: no carrying of this list on the published-progress stream. |  | X-S8 |
