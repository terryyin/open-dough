# Source-only review: SEED-262#arrange-prerequisite-state

Launched 2026-11-08 as a fresh general-purpose agent without conversation
inheritance, supplied only the story's Goal, Scope, Key examples,
Architecture and Evaluation text from
[the seed](../../seeds/SEED-262-faster-dashboard-test-feedback.md#arrange-prerequisite-state),
told to read no files and change nothing. Its exclusions: X1 broader sidebar
fixture migration, X2 Git origin construction, X3 artifact preparation,
X4 fixture lifetime, X5 polling cadence, X6 replacing real Starts in card
Start and launch-to-listing. Items 5.1–5.6 apply only where the cases
exercise them.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: a developer running a journey reaches the behavior it proves sooner when an unrelated workflow only supplies that journey's initial state. | slice 2 | |
| 2.1 | The attention journeys start with Claude sessions that are already open. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts both cases open via openWithOpenSessions; expectOpen Working + arranged ID (dashboard/tests/storyCardAttention.ts); strict proof-sel-1 passed |
| 2.2 | The related card session-state journey starts with Claude sessions that are already open. | slice 2 | |
| 3.1 | Each case's valid persisted records are arranged in that case's own machine before the first page read. | slice 2 | |
| 3.2 | Each case's matching native listings are arranged in that case's own machine before the first page read. | slice 2 | |
| 4 | The Doughnut session used by the attention project-switch case is included in the pre-arranged state. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Taken case arranges doughnutSession; expectOpen(doughnutSession) after switch then blocked count |
| 5.1 | Real published membership reads stay real where the cases exercise them. | slice 2 | |
| 5.2 | Real session observation stays real where the cases exercise it. | slice 2 | |
| 5.3 | Real restart stays real where the cases exercise it. | slice 2 | |
| 5.4 | Real reload stays real where the cases exercise it. | slice 2 | |
| 5.5 | Real project switching stays real where the cases exercise it. | slice 2 | |
| 5.6 | Real Mark as done stays real where the cases exercise it. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Taken case real markDoneAnyway removes entry and drops count |
| 6.1 | The card Start journey keeps real Starts, because it observes the result of a launch. | slice 2 | |
| 6.2 | The launch-to-listing journey keeps real Starts, because it observes the result of a launch. | slice 2 | |
| 7.1 | Example 1, setup: three Open Dough sessions are already open when the page opens on the Backlog, and no Start request is needed for this setup. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Backlog case opens with three working sessions; expectNothingStarted: no Start POSTs, claudeLaunchCalls [] |
| 7.2 | Example 1: as Claude reports sessions as blocked, review, unavailable, or stopped, each card counts only the sessions that need attention. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts step counts each card's affected sessions in Backlog and Preparing (unchanged assertions) |
| 7.3 | Example 1: an unreadable listing suppresses the counts. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts same step: unreadable listing suppresses counts (unchanged) |
| 7.4 | Example 1: a readable listing restores the counts. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts same step: readable listing restores counts (unchanged) |
| 7.5 | Example 1: a Preparing revision keeps the placement and counting rules. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts same step: Preparing revision keeps placement and counts, published facts unchanged |
| 8.1 | Example 2, setup: both projects already have sessions when the page opens. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Taken case: open-dough and doughnut sessions arranged in one store write before page |
| 8.2 | Example 2: a published Take moves a card. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Taken case: published Take moves card (unchanged) |
| 8.3 | Example 2: Mark as done removes the card's last affected session from the count. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Taken case: Mark as done removes last affected session from count |
| 8.4 | Example 2: project switching and reload show the current project's counts. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Taken case: project switch and reload read current project's counts |
| 8.5 | Example 2: after origin removes a story from every list, its affected session and reason stay visible in local Taken with Open terminal. | slice 1 | observed: dashboard/tests/sessions/agent-launch-attention.spec.ts Taken case: story in no list keeps affected session and reason in local Taken with Open terminal |
| 9.1 | Example 3, setup: three already-open sessions change while their native listing is unreadable. | slice 2 | |
| 9.2 | Example 3: the page shows State unknown and keeps Open terminal and the Start restrictions. | slice 2 | |
| 9.3 | Example 3: after recovery, a real server restart and reload show the actual states and actions. | slice 2 | |
| 9.4 | Example 3: switching away and back keeps project isolation and the original entries. | slice 2 | |
| 10 | Example 4: when a developer starts execution or refinement from a card, the Start journey still drives the actual dialog and native launch, and it observes the new card entry. | slice 2 | |
| 11.1 | Architecture: the committed origin remains the source of published placement. | slice 2 | |
| 11.2 | Architecture: the persisted records and the native listing remain separate inputs for local session presentation. | slice 2 | |
| 12.1 | The canonical launch data is built through MakeMe. | slice 1 | observed: dashboard/tests/storyCardAttention.ts keepOpenSessions builds makeMe.aLaunchRecord executing/refining records |
| 12.2 | The arranged state is written with a single project-keyed store write before navigation. | slice 1 | observed: dashboard/tests/storyCardAttention.ts keepOpenSessions single keepProjectLaunchRecords write before openQueuedStoryCards |
| 13 | Each listed session uses the same native identity as its persisted record. | slice 1 | observed: dashboard/tests/storyCardAttention.ts keepOpenSessions uses claudeListsSession id as record sessionId; expectOpen compares sessionNamedBy |
| 14 | Existing fixture boundaries carry the arranged state through the production reader (ADR 0008 for dashboard state; ADR 0002 for product intent and test design). | slice 1 | observed: dashboard/tests/storyCardAttention.ts page reads through production records reader and fake claude listing; listing failure/recovery steps in dashboard/tests/sessions/agent-launch-attention.spec.ts |
| 15.1 | Evaluation: the same cases are compared before and after the change under the same runner profile. | slice 2 | |
| 15.2 | Evaluation: the comparison shows lower elapsed arrangement time. | slice 2 | |
| 15.3 | Evaluation: the comparison shows fewer requests caused by starting workflows. | slice 2 | |
| 15.4 | Evaluation: the existing attention, membership, and session-management assertions are kept. | slice 2 | |
| 15.5 | Evaluation: the real card Start journey is run again (journey coverage ownership; ADR 0010, Definition of improvement). | slice 2 | |
