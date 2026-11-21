# Source-only review

Codex launched `/root/source_review` with `fork_turns: none` and the
unchanged [story Goal, Scope, key examples and exclusions](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-launch-proof)
and [shared campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories).
The launch required the reviewer to use only that text and change nothing.
The reviewer returned the numbered results below in this execution's
conversation. The coordinator added the slice allocations.

G is Goal, S is Scope, E1–E6 are the key examples in source order, and
A1–A6 are the shared campaign acceptance bullets in source order. Each
result carries the entry points and triggers named by the source. Scope-only
results preserve the existing proof where the source supplies no exact
values or conditions.

The actual reader and typed collaborator, retry, abort, cache and stale-answer
proof, production rendering entry and explicit typed sources, case design,
native input, built-dashboard E2E routing, per-engine invocation and paired
runs constrain the proof. Wording, accessibility, viewport and input
distinctions, races, and error and retry boundaries qualify each affected
result. The case reduction aim, final complete-group measurement, runner
retirement, existing ownership boundaries, timing and renamed-diff
follow-ups, and SEED-341 coordination supply context.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | The ad-hoc **Start session** offer is available at its established placement. [S, E1] | slice 1 | observed: ad-hoc-start-session-answer.spec.ts: project-specific enabled offer, direction/help geometry and hidden roster |
| P02 | **Start session** opens its launch dialog. [S, E1] | slice 1 | observed: ad-hoc-start-session.spec.ts: clicking the enabled offer opens the named modal |
| P03 | An applicable story card offers **Start execution**. [S, E1] | slice 3 | observed: story-card-launch-offers.spec.ts observes an enabled Start execution on Ready and unassessed Backlog work |
| P04 | **Start execution** opens its launch dialog. [S, E1] | slice 3 | observed: story-card-launch-dialogs.spec.ts opens the named execution modal from Start execution |
| P05 | An applicable story card offers **Start refinement**. [S, E1] | slice 3 | observed: story-card-launch-offers.spec.ts observes an enabled Start refinement following Start execution |
| P06 | **Start refinement** opens its launch dialog. [S, E1] | slice 3 | observed: story-card-launch-dialogs.spec.ts opens the named refinement modal from Start refinement |
| P07 | The ad-hoc dialog names the project. [E1] | slice 1 | observed: ad-hoc-start-session.spec.ts: the opened modal has accessible name Start a session in Open Dough in Claude Code |
| P08 | The execution and refinement dialogs name the story. [E1] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts observe the selected title and exact command identity |
| P09 | Each of the three opened dialogs names the host. [E1] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and ad-hoc-start-session.spec.ts select dialogs by their accessible name including Claude Code |
| P10 | Each of the three opened dialogs initially focuses the instruction field. [E1] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and the ad-hoc dialog case observe initial instruction focus |
| P11 | Escape and Cancel each send nothing when closing any of the three opened dialogs. [E1] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and the ad-hoc dialog case close unsent drafts by Escape and Cancel and record zero Start calls |
| P12 | Escape and Cancel each return keyboard focus to the initiating offer in the three opening journeys. [E1] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and the ad-hoc dialog case observe focus on the actual initiating offer after Escape and Cancel |
| P13 | Start carries the intended instruction draft. [G] | slice 7 | |
| P14 | The existing host catalog choices are available through the launch UI. [S] | slice 5 | |
| P15 | The existing model choices are available under the applicable host and provider conditions. [S, E2] | slice 5 | |
| P16 | The existing effort choices are available under the applicable host and provider conditions. [S, E2] | slice 5 | |
| P17 | UI-owned provider constraints remain observable on the paths where they apply. The source leaves the individual constraints unspecified. [S] | slice 5 | |
| P18 | The existing refinement options are available in the refinement flow. [S, E2] | slice 6 | |
| P19 | Start requests the selected host. [G, S, E2] | slice 5 | |
| P20 | Start requests the selected model. [G, S, E2] | slice 5 | |
| P21 | Start requests the selected effort. [G, S, E2] | slice 5 | |
| P22 | Start requests the selected refinement options. [G, S, E2] | slice 6 | |
| P23 | Changing host resets incompatible effort. [E2] | slice 5 | |
| P24 | A late host catalog reply cannot replace another host’s current options. [E2] | slice 5 | |
| P25 | The selection remains held after the refusal in the refusal-to-Cancel journey. E2 calls it the “kept selection.” [E2] | slice 6 | |
| P26 | Cancel after that refusal drops the kept selection. [E2] | slice 6 | |
| P27 | Existing creation gates continue to enforce their conditions. The source names the in-flight and unresolved conditions in E5 and leaves any other gates unspecified. [S, E5] | slice 4 | |
| P28 | The instruction layout preserves its existing observable behavior at the covered viewports. [S, A4] | slice 1 | observed: ad-hoc-start-session-layout.spec.ts and ad-hoc-launch-dialog.spec.ts: keyboard order, 320 CSS px and 200% conditions, reachability and footer |
| P29 | Touch can operate the instruction area on the existing covered paths. [S, A4] | slice 1 | observed: ad-hoc-refinement-touch.spec.ts and ad-hoc-start-session-answer.spec.ts: native touch, edit, rotate, close and direction disclosure |
| P30 | Pasting text inserts it into the instruction field. [E3] | slice 2 | observed: native keyboard paste in launch-attachments.spec.ts appends text at the caret without an attachment |
| P31 | The PDF in the refusal journey is rejected. [E3] | slice 2 | observed: refusal case in launch-attachments.spec.ts keeps the incumbent preview and sends no PDF |
| P32 | An oversized image is rejected. [E3] | slice 2 | observed: refusal case in launch-attachments.spec.ts keeps one incumbent preview after the oversized selection and sends no oversized file |
| P33 | Excess images are rejected. [E3] | slice 2 | observed: refusal case in launch-attachments.spec.ts keeps five previews and sends only the five admissible files |
| P34 | Each named attachment refusal keeps the instruction draft. [E3] | slice 2 | observed: refusal case in launch-attachments.spec.ts observes the unchanged instruction after the PDF, oversized PNG, and sixth-file selections |
| P35 | The PDF refusal gives its reason. [E3] | slice 2 | observed: refusal case in launch-attachments.spec.ts renders the supported image types for notes.pdf |
| P36 | The oversized-image refusal gives its reason. [E3] | slice 2 | observed: refusal case in launch-attachments.spec.ts renders the 10 MB limit and recovery advice for huge.png |
| P37 | The excess-image refusal gives its reason. [E3] | slice 2 | observed: refusal case in launch-attachments.spec.ts renders the five-image limit for extra-4.png |
| P38 | Start preserves the intended accepted attachments. [G, S] | slice 2 | observed: refusal case in launch-attachments.spec.ts captures the five intended files in order at Start, and agent-launch-ad-hoc-attachments.spec.ts retains native chooser and copied bytes assertions |
| P39 | After Attach, Escape and Cancel each close without uploading anything. [E3] | slice 2 | observed: Cancel and Escape in launch-attachments.spec.ts close attached drafts with no Start invocation or attachment endpoint request |
| P40 | Reopening after either close in the Attach journey starts with empty attachment state. [E3] | slice 2 | observed: Cancel and Escape in launch-attachments.spec.ts each reopen with an empty instruction and no attachment list |
| P41 | The existing instruction voice-capture path makes the captured instruction available for composition. [G, S] | slice 7 | |
| P42 | If dictation would overflow 4,000 characters, the original instruction draft remains available for editing. [E4] | slice 7 | |
| P43 | In the same overflow condition, the transcription remains available for editing. [E4] | slice 7 | |
| P44 | Escape and Cancel each abandon a held transcription. [E4] | slice 7 | |
| P45 | A late grant cannot populate the next dialog. [E4] | slice 7 | |
| P46 | A late reply cannot populate the next dialog. [E4] | slice 7 | |
| P47 | Start is disabled while the start runs, when an answer is lost, and when an answer is uncertain. [E5] | slice 8 | |
| P48 | The story stays protected in each of those three states. [E5] | slice 8 | |
| P49 | The ad-hoc **Start session** stays protected in each of those three states. [E5] | slice 8 | |
| P50 | Recovery is reachable while the start runs, when its answer is lost or uncertain, and after a refusal in the goal’s recovery path. [G, E5] | slice 8 | |
| P51 | The recovery path represents a refused or uncertain start truthfully. [G] | slice 8 | |
| P52 | Settlement leaves keyboard focus with a task begun meanwhile. [E5] | slice 8 | |
| P53 | Existing startup answer behavior remains observable at the launch boundary. The source leaves any expected answers beyond its examples unspecified. [S] | slice 4 | |
| P54 | Existing host wording is preserved where it is part of the launch proof. [S, A4] | slice 4 | |
| P55 | Session access continues to work in the existing responsive journeys. [S] | slice 8 | |
| P56 | The existing unattached-start journey continues to work. [S] | slice 8 | |
| P57 | The recovery read remains available in the existing responsive session-access coverage. [S] | slice 8 | |
| P58 | **Follow up** offers **Attach** when notes are waiting. [E6] | slice 8 | |
| P59 | Start names the note handoff choice. [E6] | slice 8 | |
| P60 | Start carries the intended note handoff on each applicable UI-owned route. The source names the Attach route and does not enumerate any additional choices. [G, S, E6] | slice 8 | |
| P61 | **Attach** is unavailable when there are no waiting notes. [E6] | slice 8 | |
| P62 | Start still works when there are no waiting notes. [E6] | slice 8 | |
| P63 | A Taken card shows that notes are waiting. [E6] | slice 8 | |
| P64 | A Taken card offers no **Follow up**. [E6] | slice 8 | |
| M01 | The coverage disposition accounts for every legacy `launches/` spec in the stated inventory of 29 sources and 81 cases. These counts describe the starting inventory. [S, A4] | slice 8 | |
| M02 | Frontend unit proof in scope runs in plain Vitest. [S, A1] | slice 8 | |
| M03 | Journeys requiring actual installation remain covered in `e2e/launches/`. [S] | slice 8 | |
| M04 | Journeys requiring a native host launch remain covered in `e2e/launches/`. [S] | slice 8 | |
| M05 | Journeys requiring cross-service startup remain covered in `e2e/launches/`. [S] | slice 8 | |
| M06 | Migrated families cease using `actSettled` as they move. [A3] | slice 8 | |
| M07 | Migrated families cease using React `act` wrapping as they move. [A3] | slice 8 | |
| M08 | Migrated families cease using `IS_REACT_ACT_ENVIRONMENT` as they move. [A3] | slice 8 | |
| M09 | Spent support is removed when its last consumer moves. [A3] | slice 8 | |
| M10 | The shared test-support surface shrinks as migration proceeds. The source specifies no size metric. [A3] | slice 8 | |
| M11 | Before deleting a retired case, each of its distinct assertions is mapped to a destination or a named existing equivalent. [A4] | slice 8 | |
| M12 | The report explains why repeated cases were consolidated or kept. [A4] | slice 8 | |
| M13 | The comparable before-and-after two-worker selections record elapsed time including preparation. [A5] | slice 8 | |
| M14 | The timing includes proof promoted to E2E. [A5] | slice 8 | |
| M15 | The comparison records counts by engine and destination. [A5] | slice 8 | |
| M16 | The comparison records slow cases that remain. [A5] | slice 8 | |
| M17 | The migrated proof gives maintainers faster feedback on a comparable selection. The complete-group target belongs to the final story. [G, A4, A5] | slice 8 | |
