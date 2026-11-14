# Source-only review

Fresh general-purpose reviewer (`Task` / `e6bc7824-eb3b-4035-bbbe-0e66f95280ab`),
launched with no conversation inheritance on 2026-11-14. Its input contained
only the selected story Goal, Scope, Architecture, Key examples and Scope
limits for SEED-358#keep-dashboard-launch-history. No plan, return, product,
proof, suspected omission or current-slice scope was supplied. It read no
project files and changed none. The return below preserves the reviewer's
numbered commitments.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer can later account for each task the dashboard launched, after its session ages out of the recent views or is removed. | slice 2 | observed: launch-history-removed.spec.ts: history holds removed entry after delete |
| 2 | Stop deleting launch records. | slice 2 | observed: launch-history-removed.spec.ts: delete moves to history; operational drops; unwritable refuses |
| 3a.1 | A record that leaves the dashboard's operational records, because it was marked done more than 30 days ago … moves to a dashboard-owned launch history instead. | slice 1 | observed: launch-history-aged-out.spec.ts: 31-day session moves to aged-out history; operational keeps 29-day |
| 3a.2 | A record that leaves the dashboard's operational records, … or because the developer removed its session, moves to a dashboard-owned launch history instead. | slice 2 | observed: launch-history-removed.spec.ts: history entry reason removed with project and unchanged record |
| 4a.1 | History keeps the record as it was recorded | slice 1 | observed: launch-history-aged-out.spec.ts: history entry.record equals seeded longDone |
| 4a.2 | History keeps … its project | slice 1 | observed: launch-history-aged-out.spec.ts: history entry.project is open-dough |
| 4a.3 | History keeps … and when and why it left. | slice 1 | observed: launch-history-aged-out.spec.ts: leftAt string and reason aged-out |
| 5 | A record leaves the operational records only after history holds it | slice 1 | observed: launch-history-aged-out.spec.ts: unwritable keeps longDone in operational store; restore then moves |
| 6 | and moving it again adds no second entry. | slice 1 | observed: launch-history-aged-out.spec.ts: after restart and second write history length stays 1 |
| 7 | Visible behavior stays as it is. | slice 2 | observed: launch-history-removed.spec.ts hides removed; agent-launch-delete.spec.ts stays green |
| 8a.1 | Recently done and its count still cover the 30 days after a session was marked done | slice 1 | observed: launch-history-aged-out.spec.ts + agent-launch-records retention: 29-day remains listed/operational |
| 8a.2 | a removed session still disappears | slice 2 | observed: launch-history-removed.spec.ts: answeredIds omit removed sessionId after delete |
| 8a.3 | and the retirement of host-local state on removal (such as Cursor configuration scopes and landing pins) still runs. | slice 2 | observed: launch-history-removed.spec.ts: Cursor configScope removed; kept-scope and shared chats retained |
| 9 | Routine dashboard reads and writes do not read or rewrite history. | slice 1 | observed: launchRecordDocument.replaceRecords: appendLaunchHistory only when toHistory non-empty |
| 10 | History is readable without native session files. | slice 1 | observed: readLaunchHistory/JSONL under launch-history/; launch-history-aged-out.spec.ts reads without native session files |
| 11 | Wording that says done sessions are kept for 30 days says they are listed for 30 days instead. | slice 1 | observed: RecentlyDone.tsx listed for N days; RecentlyDoneSessions empty-state + recently-done-sessions-sidebar.spec.ts |
| 12a.1 | Scope limits: no history view |  | G1 |
| 12a.2 | no token usage |  | G2 |
| 12a.3 | and no recovery of records already pruned before delivery; the reconstruction story owns the last two. |  | G3 |
| 13 | Temporary launch attempts, landing retries, and other dashboard files keep their own retention. |  | G4 |
| 14 | so history is a separate, append-only, file-based store beside it under `~/.open-dough/dashboard/`. | slice 1 | observed: dashboard/server/launchHistory.ts JSONL under ~/.open-dough/dashboard/launch-history/ |
| 15 | The 30-day write-time drop and explicit deletion become moves into that store. | slice 2 | observed: launch-history-removed.spec.ts delete 200 + history removed; aged-out in launch-history-aged-out.spec.ts |
| 16 | ADR 0008 rules out an application database and keeps workflow facts in Git. Launch history is machine-local session evidence, so files fit both rules. | slice 1 | observed: launchHistory.ts file-based store; no application database |
