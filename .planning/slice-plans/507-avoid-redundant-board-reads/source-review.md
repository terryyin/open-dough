# Source review

Launched 2026-11-08 by the execution coordinator as a fresh general-purpose agent without conversation inheritance. Input: only the story text (Goal, Scope, Key examples, Evaluation) of SEED-262#refresh-without-unneeded-reloads, with the instruction to read no files, change nothing, and return numbered commitments. Reviewer notes: 11.1–11.3 are alternative triggers leading to 11.4–11.7; "where the journeys call for it" applies to all of 13.1–13.3; reloads, restarts and switches stay where they prove restoration or isolation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: Developers running the dashboard's Board and session journeys get to the same assertions sooner. | slice 2 | |
| 1.1 | They get there sooner by avoiding full Board reads for steps that can observe the published revision change in place. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Preparing/Taken/removal steps: show(..., { pace }) without reload; recorded full Board reads 15→12, document loads 6→3 (slice 1 return, job tmp s1/) |
| 1.2 | They get there sooner by avoiding full Board reads for steps that can observe the machine-local session change in place. | slice 2 | |
| 2 | Scope starts with the attention journey. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts converted in slice 1 |
| 3 | Scope also covers the related card-session-state journey. | slice 2 | |
| 4 | Drive revision changes through normal in-page published observation. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts show(revision, { pace: passOnePace }) via dashboard/tests/storyColumnsPage.ts in-page revision check |
| 5 | Drive session changes through the existing session-record observation. | slice 2 | |
| 6 | Preserve the following in the converted journeys: | slice 2 | |
| 6.1 | the integrated browser | slice 2 | |
| 6.2 | the committed fake origin | slice 2 | |
| 6.3 | the real launch action | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts launchOnEachQueuedCard and Doughnut launch unchanged; passing runs |
| 6.4 | the real done action | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Taken step markDoneAnyway then entry count 0 and expectCounted |
| 6.5 | the existing membership assertions | slice 2 | |
| 6.6 | the existing session assertions | slice 2 | |
| 7 | Keep the following where they prove restored state or isolation: | slice 2 | |
| 7.1 | explicit reloads | slice 2 | |
| 7.2 | server restart | slice 2 | |
| 7.3 | project switches | slice 2 | |
| 8 | Exclusion: Production observation and caching changes are outside this increment. | slice 2 | |
| 9 | Exclusion: Broader journey conversion, beyond the attention and card-session-state journeys, is outside this increment. | slice 2 | |
| 10 | Exclusion: Fixture and polling changes owned by the other stories are outside this increment. | slice 2 | |
| 11 | Example: With sessions already shown on the open Board, origin publishes a new revision. The trigger is any one of these alternatives: | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts three converted steps start with sessions shown on the open Board |
| 11.1 | Preparing | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Preparing step show(columnsJourney.preparing, { pace }) |
| 11.2 | Taken | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Taken step show(columnsJourney.taken, { pace }) |
| 11.3 | a revision where a story leaves all lists | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts removal step show(columnsJourney.completed, { pace }) |
| 11.4 | The same document shows the new revision. | slice 1 | observed: storyColumnsPage.ts show: readRevision contains new revision; dashboard/tests/sessions/agent-launch-attention.spec.ts expectNotReloaded after each show |
| 11.5 | The same document shows the corresponding membership. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts expectMembership after each converted show |
| 11.6 | Attention follows the published card. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts expectCounted after Preparing and Taken shows plus Preparing label on card |
| 11.7 | The removed story's open session is still reachable from local Taken. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts removal step expectSessionShown(kept, Ready for review, true) and Open terminal in local Taken |
| 12 | Example: With the published revision unchanged, the session listing fails. | slice 2 | |
| 12.1 | Open entries become State unknown in the same document, without another published snapshot. | slice 2 | |
| 12.2 | Open entries keep Open terminal in the same document, without another published snapshot. | slice 2 | |
| 12.3 | The attention journey still proves that local changes affect counts. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts expectCounted after each becomes/pace and after Mark as done |
| 12.4 | The attention journey still proves that local changes leave published card facts intact. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts publishedFactsOf equality (preparingFacts, takenFacts) followed by expectNotReloaded |
| 13 | Example: Switching projects shows only that project's sessions and attention. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts switch step: Doughnut expectCounted({doughnutSharedTitle: one}) only |
| 13.1 | Where the journeys call for it, returning to the project still proves restoration through the normal open path. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts select(Open Dough) then expectCounted, page.reload then settled then expectCounted({}) |
| 13.2 | Where the journeys call for it, a deliberate reload still proves restoration through the normal open path. | slice 2 | |
| 13.3 | Where the journeys call for it, a restart still proves restoration through the normal open path. | slice 2 | |
| 14 | Evaluation: Compare the same ordinary focused selection before and after the change. | slice 2 | |
| 14.1 | Both journeys must make fewer full Board reads that resolve the configured ref. | slice 2 | |
| 15 | Attribute requests by project, revision and path. | slice 2 | |
| 15.1 | Show separately the pinned snapshot reads needed for new revisions. | slice 2 | |
| 15.2 | Show separately the conditional heads checks. | slice 2 | |
| 15.3 | Show separately the unrelated launch traffic. | slice 2 | |
| 16 | Compare elapsed time to the asserted result, with the same cases and proof intact. | slice 2 | |
| 16.1 | Compare focused command wall time, with the same cases and proof intact. | slice 2 | |
