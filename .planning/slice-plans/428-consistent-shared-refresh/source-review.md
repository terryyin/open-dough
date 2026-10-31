# Source review — SEED-202#consistent-shared-refresh

**Launch:** fresh general-purpose reviewer; source-only; no plan, product, proof, or conversation inheritance.

**Input:** `.planning/seeds/SEED-202-bounded-dashboard-refresh.md#consistent-shared-refresh` Goal and Scope only. No Key examples, Exclusions, or human amendments beyond that text.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | This story is a correction to Keep dashboard refresh work bounded across viewers (`SEED-202#bounded-dashboard-refresh`), recoverable at `dc397adab49fbb7b2002be45161c80a6bd1b0a21:.planning/seeds/SEED-202-bounded-dashboard-refresh.md`. | slice 3 | |
| 2 | Developers viewing the dashboard get unchanged answers and shared Cursor reads only when what their view already shows matches the answer they would receive. | slice 3 | |
| 2.1 | Unchanged answers are obtained only under that match condition. | slice 1 | observed: `dashboard/src/agentLaunches.ts` clears `heldRevision` in `setRecords`/`setFacts`; `dashboard/tests/agent-launch-held-revision-after-action.spec.ts` expects next poll `{ held: false, unchanged: false }` and Working after machine returns to A |
| 2.2 | Shared Cursor reads are obtained only under that match condition. | slice 3 | |
| 3 | The settings view's machine-session refresh stays small when nothing changed. | slice 1 | observed: `dashboard/tests/system-settings-feedback-maintenance-unchanged.spec.ts` second-check answers held, unchanged, bytes `< 1024` |
| 4 | A page that changes its sessions or facts outside the poll stops holding the poll's revision. | slice 1 | observed: `dashboard/src/agentLaunches.ts` `setRecords`/`setFacts` set `heldRevision.current = undefined`; proof poll after mark-done has `held: false` |
| 4a.1 | Such outside-the-poll changes come from an action's answer. | slice 1 | observed: same clearing path; mark-done journey in `agent-launch-held-revision-after-action.spec.ts` |
| 4a.2 | Such outside-the-poll changes come from a session re-read. | slice 1 | observed: `readSession` mutates via `setFacts`/`setRecords` (`launchRecordActions.ts` → clearing setters) |
| 4a.3 | Such outside-the-poll changes come from a mark. | slice 1 | observed: mark-done clears held revision; next poll full in held-revision-after-action spec |
| 5 | After such a change, that page's next poll receives the full answer. | slice 1 | observed: `answeredDuring(() => passOnePace())` equals `{ held: false, unchanged: false }` and page shows Working (A) |
| 6.1 | The settings view's feedback-maintenance refresh sends the revision it holds. | slice 1 | observed: `FeedbackMaintenanceSettings.tsx` `useMaintenanceState` calls `readMachineSessionsSince(heldRevision.current)`; spec asserts `held: true` |
| 6.2 | The settings view's feedback-maintenance refresh keeps its state on an unchanged answer. | slice 1 | observed: early return when `"unchanged" in answer`; spec keeps maintenance line text |
| 7 | A shared Cursor held-session read is joined only under the same machine documents it started from. | slice 3 | |
| 8 | A reader whose launch record was written after the read began gets its own read. | slice 3 | |
| 9 | One machine-document revision keys both shared observations. | slice 2 | observed: `machineSessionObservation.ts` demands `[configuredProjects(), await machineDocumentsRevision()]`; Cursor join still on slice 3 |
| 9q | That revision is owned by the machine document store. | slice 2 | observed: store-owned `machineDocumentsRevision()` in `machineDocumentsRevision.ts`, re-exported from `machineJsonStore.ts`; observation-local identity/`machineJsonReplacements` removed; `machine-json-revision.spec.ts` |

| T1 | Page changes sessions or facts outside the poll → stops holding the poll's revision → next poll receives the full answer. | slice 1 | observed: same as 4 and 5 via held-revision-after-action journey |
| T2 | Settings feedback-maintenance refresh: send held revision; on unchanged answer, keep state. | slice 1 | observed: same as 6.1 and 6.2 |
| T3 | Settings machine-session refresh stays small when nothing changed. | slice 1 | observed: same as 3 |
| T4 | Shared Cursor held-session read: join only under the same machine documents the read started from. | slice 3 | |
| T5 | Reader with launch record written after the read began → own read. | slice 3 | |
| T6 | Dashboard viewers: unchanged answers / shared Cursor reads only when view content matches the answer they would receive. | slice 3 | |
