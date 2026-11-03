# Source review

Launch: fresh general-purpose reviewer (no conversation inheritance), started by
the coordinator on 2026-11-04 during execution of
SEED-225#correct-incident-and-workspace-observation-residue. Input: the seed
section's Goal and Scope verbatim, plus this plan's Provenance, Findings 1–5
and Preserved promises and constraints (no slicing, proof, return or product).
Instruction: use only these inputs, read no files, change nothing; number every
commitment and separate compound items.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Incident evidence stays attributable across a dev-server restart. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-incident-record-restart.spec.ts: both instances' failures listed with distinct serverInstance, closed ended, running current, killed lost |
| 2 | Cheap Sessions refreshes stay cheap while Git runs in a project's main checkout. | slice 3 | |
| 3 | The dashboard gives accurate advice when the request owner cannot be reached. | slice 4 | |
| 4 | The recovery proof does not depend on machine speed. | slice 2 | observed: dashboard/tests/owner-replacement-recovery.spec.ts waitingOnItsCall polls ownerSends().asked() (dashboard/tests/support/ownerSends.ts); passed with a 2.5 s injected send delay that failed the old wait |
| 5 | The work corrects the residue found by the execution retrospective of SEED-225#restore-dashboard-responsiveness. | slice 5 | |
| 6 | Correct the five reviewed defects named in the plan. | slice 5 | |
| 6.1 | A per-load incident identity: each server module load, including a Vite restart in the same process, gets its own incident identity; entries and process records from different loads no longer collide. | slice 1 | observed: dashboard/server/incidentRecord.ts incidentWriter.serverInstance per module load; dashboard/tests/boundary/authenticated-read-incident-record-restart.spec.ts new Set(instances).size 2 |
| 6.1a | Entries from an earlier load are not replaced by a later load's entries. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-incident-record-restart.spec.ts failures toHaveLength(2) before and after the kill |
| 6.1b | A later load's process stays running when an earlier load ends, so a later SIGKILL reads as lost. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-incident-record-restart.spec.ts successor reads states [lost, ended], lost without endedAt |
| 6.2 | A queued signal for the owner-replacement proof: the proof uses a signal that the queued read has reached the owner, not a wall-time wait. | slice 2 | observed: dashboard/tests/owner-replacement-recovery.spec.ts both precondition waits poll the read written onto the owner connection (8th held read, backlog at B) |
| 6.3 | A Git identity without folder times: a plain git status in the main checkout does not trigger a rescan of every worktree. | slice 3 | |
| 6.4 | Lost-connection wording limited to a mid-request loss; a connection failure before any request was sent, such as during the greeting, gets the endpoint advice. | slice 4 | |
| 6.5 | One declared list of history-only fields, used both to remove the fields and to restore them. | slice 5 | |
| 7 | Everything plan 456 proved stays proved. | slice 5 | |
| 7.1 | Incident evidence across replacement. | slice 1 | observed: dashboard/tests/boundary/authenticated-read-incident-record.spec.ts replaced-server case passes |
| 7.2 | Incident evidence across stalls. | slice 1 | observed: authenticated-read-incident-record*.spec.ts stall cases passed in slice 1 command 3 (22 passed) |
| 7.3 | Incident evidence across lost processes. | slice 1 | observed: authenticated-read-incident-record-lifecycle.spec.ts lost-process cases passed in slice 1 command 3 |
| 7.4 | Recovery without reload or duplicate dispatch. | slice 2 | observed: dashboard/tests/owner-replacement-recovery.spec.ts assertions unchanged: B read once, every held call asked once, no navigations, openedOnce; 40/40 and 80/80 repeat runs |
| 7.5 | The unchanged-poll target. | slice 3 | |
| 7.6 | The answer-size target. | slice 3 | |
| 7.7 | Retained-session behavior. | slice 5 | |
| 8 | The original story's promises, examples and restrictions stand. | slice 5 | |
| X1 | Do not change the original story's promises. | slice 5 | |
| X2 | Add no product behavior beyond the five corrections. | slice 5 | |
| X3 | The plan only corrects defects in the delivered code and proof. | slice 5 | |
| X4 | Do not change the request owner's protocol. | slice 4 | |
| X5 | A distinct mid-request cause, if needed, stays inside the consumer library. | slice 4 | |
| X6 | The flaky recovery proof counts as failing; no timing-fragile proof is left in place. | slice 2 | observed: dashboard/tests/owner-replacement-recovery.spec.ts no wall-clock pause remains; repeat-each 5 workers 4 and repeat-each 10 workers 8 with other specs green |
