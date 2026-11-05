# Source-only review

**Story:** SEED-242#revive-cursor-sessions-when-the-runner-restarts
**Reviewer launch:** fresh general-purpose agent, 2026-11-05, isolated from implementation
**Inputs supplied:** Goal, selected approach paragraph, Scope (required / kept / limits / deferred / rejection / evaluation), and key examples 1–8 only. No plan, product, proof, or slice text.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When the Cursor runner restarts or is replaced, every unfinished session that runner was holding is running again under the new runner. | slice 2 |  |
| 2 | Each such session continues its recorded chat under the new runner. | slice 2 |  |
| 3 | The new runner holds a live agent for that launch record. | slice 2 |  |
| 4 | The dashboard no longer says the agent is not running for that session. | slice 2 |  |
| 5 | The developer can see those sessions as running in the dashboard, including in Running Cursor sessions, without using Recover on each one. | slice 2 |  |
| 6 | Revival uses the existing Recover keep path for each previously held unfinished session (recorded conversation, workspace, and configuration scope). | slice 2 |  |
| 7 | A continuation is attempted exactly as Recover does today when first input is confirmed. | slice 2 |  |
| 8 | A session that fails to revive remains its unfinished launch record with Recover still offered. | slice 2 |  |
| 9 | Other sessions' revival is not abandoned because one failed. | slice 2 |  |
| 10 | When the dashboard is about to stop a stale runner for new work, it snapshots the unfinished sessions that runner still holds, completes the replacement and the new work as today, then resumes each snapshotted session onto the new runner through the existing Recover keep path. | slice 2 |  |
| 11 | Machine-restart / dead-runner shapes revive the same set once a current runner exists for new work and those sessions remain unfinished and not held. | slice 2 |  |
| 12 | After a runner restart or replacement, each previously held unfinished session has a live agent in the new runner and the dashboard no longer says the agent is not running for that session. | slice 2 |  |
| 13 | Meeting the story does not require a stronger Working-within-launch-wait guarantee than Recover already provides. | slice 2 |  |
| 14 | A kept session whose continuation was not taken in time still counts as running when the runner holds it. | slice 2 |  |
| 15a | A session the previous runner was not holding stays as it was. | slice 2 |  |
| 15b | A finished or marked-done session is not started again. | slice 2 |  |
| 15c | Work that caused the new runner to start remains running. | slice 2 |  |
| 15d | Dashboard restart against a still-current runner still reattaches held clients without resume. | slice 2 |  |
| 15e | Reads, listing, and attach to a still-held client still neither replace the runner nor revive sessions. | slice 2 |  |
| 15f | Claude and Codex restart behavior is unchanged. | slice 2 |  |
| 16 | Observation and listing still never replace or revive. | slice 2 |  |
| 17 | Revival resumes via Recover keep: resume the recorded command and scope; type a continuation only when first input is already confirmed. | slice 2 |  |
| 18.1 | Guaranteeing that every revived session reaches Working with an accepted continuation inside the shared launch wait under concurrent revival. |  | X1 |
| 18.2 | Auto-reviving unfinished not-running sessions that were never held by the replaced runner. |  | X2 |
| 18.3 | Changing when replacement itself is triggered. |  | X3 |
| 19 | Stale runner holds five unfinished Cursor sessions → developer launches new work that requires the current runner → stale runner is replaced, the new launch runs, and each of the five is held again on the new runner continuing its recorded chat, without Recover; Running Cursor sessions shows them; none still reads that the agent is not running. | slice 2 |  |
| 20 | Stale runner holds an unfinished session and a finished or marked-done session → replacement for new work → only the unfinished held session is revived; the finished one is not started again. | slice 2 |  |
| 21 | An unfinished Cursor launch record exists that the previous runner was not holding (already stopped, never attached) → replacement for other work → that record stays as it was; no agent is started for it. | slice 2 |  |
| 22 | Runner process is gone (machine-restart / dead-pid shape) while five unfinished sessions that it had held remain recorded → the next new-work path starts a current runner and those five are held again there without Recover. | slice 2 |  |
| 23 | Dashboard restarts but the runner survives on current code with held clients → those clients are reattached; no resume and no revival pass run (preserved). | slice 2 |  |
| 24 | Revival of one previously held session fails (missing workspace, unreadable scope, or keep failure) → that session stays unfinished with Recover offered; the others that can revive are held on the new runner. | slice 2 |  |
| 25 | Recover today times out with "Cursor did not show it took the instruction in time" while keeping the session → the same kept outcome after automatic revival still satisfies this story when the runner holds the session. | slice 2 |  |
| 26 | Developer only lists or opens held sessions on a stale runner → no replacement and no revival occur until new work asks for a current runner (preserved observation rule). | slice 2 |  |
| 27a | No dual live runner generations. |  | X4 |
| 27b | No draining held sessions before replacement. |  | X5 |
| 27c | No preserving a live in-flight turn's partial output across the process boundary. |  | X6 |
| 27d | No revival of sessions the dashboard did not launch. |  | X7 |
| 27e | No new developer ceremony or control for "runner was replaced." |  | X8 |
| 28 | Observation never starts, replaces, or revives. | slice 2 |  |
| 29 | Replacement remains a new-work boundary concern, as plan 334 established. | slice 2 |  |
