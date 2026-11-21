# Source-only review

Codex launched `/root/amended_source_review` with `fork_turns: none` and
the [canonical story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-launch-proof)
at trunk revision `fbb074217`, including Goal, Scope, all key examples and the
[shared campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories).
The launch required the reviewer to use only that text and change nothing.
The amended scope names the landed frame launch-opening spec as the owner
of those checks. Goals, examples and launch-proof scope otherwise agree
with the earlier independent review by `/root/source_review`.

G is Goal, S is Scope, E1–E6 are the key examples in source order, and
A1–A6 are the shared campaign acceptance bullets in source order. The P
rows below retain the amended reviewer's IDs. E1 covers all three opening
routes when a row does not name an individual route. The S and M rows
carry the earlier review's independently checkable proof and migration
results. The coordinator added the allocations and carried forward the
inspected observations whose conditions still match.

The amended review also names creation gates, instruction layout and
touch, startup answers and host words, and distinct UI-owned provider
constraints and handoff routes. Exact details for those areas come from
the legacy assertion map. Typed production entry, actual readers and
controlled collaborators, representative E2E proof, paired measurement,
and the existing project, campaign and follow-up owners govern delivery.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | The ad-hoc launch surface offers **Start session**. The source supplies no finer placement rule. [S, “ad-hoc Start session placement”] | slice 1 | observed: ad-hoc-start-session-answer.spec.ts: project-specific enabled offer, direction/help geometry and hidden roster |
| P02 | **Start session** opens its launch dialog. [S, E1] | slice 1 | observed: ad-hoc-start-session.spec.ts: clicking the enabled offer opens the named modal |
| P03 | The story card provides the **Start execution** offer. [S, “story-card Start execution and Start refinement offers”] | slice 3 | observed: story-card-launch-offers.spec.ts observes an enabled Start execution on Ready and unassessed Backlog work |
| P04 | The story card’s **Start execution** opens its dialog. [S, E1] | slice 3 | observed: story-card-launch-dialogs.spec.ts opens the named execution modal from Start execution |
| P05 | The story card provides the **Start refinement** offer. [S, “story-card Start execution and Start refinement offers”] | slice 3 | observed: story-card-launch-offers.spec.ts observes an enabled Start refinement following Start execution |
| P06 | The story card’s **Start refinement** opens its dialog. [S, E1] | slice 3 | observed: story-card-launch-dialogs.spec.ts opens the named refinement modal from Start refinement |
| P07 | The **Start session** dialog names the project. [E1, “names the project or story”] | slice 1 | observed: ad-hoc-start-session.spec.ts: the opened modal has accessible name Start a session in Open Dough in Claude Code |
| P08 | The **Start execution** and **Start refinement** dialogs name the story. [E1, “names the project or story”] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts observe the selected title and exact command identity |
| P09 | Each of those three dialogs names the host. [E1, “and host”] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and ad-hoc-start-session.spec.ts select dialogs by their accessible name including Claude Code |
| P10 | Opening any of those three dialogs focuses the instruction field. [E1] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and the ad-hoc dialog case observe initial instruction focus |
| P11 | Escape dismisses the dialog without sending a start. [E1, “Escape or Cancel sends nothing”] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and the ad-hoc dialog case close unsent drafts by Escape and Cancel and record zero Start calls |
| P12 | Cancel dismisses the dialog without sending a start. [E1, “Escape or Cancel sends nothing”] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and the ad-hoc dialog case close unsent drafts by Escape and Cancel and record zero Start calls |
| P13 | Escape restores keyboard focus to the initiating offer. [E1, “returns the keyboard to the offer”] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and the ad-hoc dialog case observe focus on the actual initiating offer after Escape and Cancel |
| P14 | Cancel restores keyboard focus to the initiating offer. [E1, “returns the keyboard to the offer”] | slice 3 | observed: both workflow cases in story-card-launch-dialogs.spec.ts and the ad-hoc dialog case observe focus on the actual initiating offer after Escape and Cancel |
| P15 | Starting carries through the intended instruction draft. [G, “composing and starting a launch keeps the intended draft”] | slice 7 | observed: remaining-proof.md slice 7 names the exact 4,000 and edited final instruction sent once through LaunchDialog Start. Existing session-instruction-voice.spec.ts observes exact story argv and final unattached input. |
| P16 | Choosing a host updates the host Start asks for. [G, S, E2] | slice 5 | observed: Codex Start in launch-model-effort.spec.ts records the chosen host in the real dialog Start operation |
| P17 | Choosing a model updates the model Start asks for. [G, S, E2] | slice 5 | observed: Codex Start in launch-model-effort.spec.ts records Native Sol as the chosen model |
| P18 | Choosing effort updates the effort Start asks for. [G, S, E2] | slice 5 | observed: launch-model-effort.spec.ts records actual Claude medium and max choices and Codex ultra at Start |
| P19 | Choosing refinement options updates the options Start asks for. [G, S, E2] | slice 6 | observed: No Approach in launch-refinement-options.spec.ts sends only the remaining C option at Start, and the native E2E Options example records Explore and Borrow in definition order |
| P20 | Changing host resets incompatible effort. [E2] | slice 5 | observed: launch-model-effort.spec.ts switches Claude low through Codex default and back to Claude medium |
| P21 | A late catalog reply for the prior host leaves the current host’s options intact. [E2, “cannot replace another host’s current options”] | slice 5 | observed: launch-host-catalog.spec.ts observes the prior read abort and keeps the current host options when the old answer resolves |
| P22 | Following a refusal, the selection is still held before dismissal. The source leaves the selection’s individual fields unspecified. [E2, “Cancel after a refusal drops the kept selection”] | slice 6 | observed: the refusal case in launch-refinement-options.spec.ts observes A and C still checked after the real typed launch path refuses their request |
| P23 | Cancel after the refusal discards that held selection. [E2] | slice 6 | observed: the refusal case in launch-refinement-options.spec.ts cancels the kept selection, then observes No Approach with A and C unchecked and no additional Start |
| P24 | Pasting text into the instruction field inserts it there. [E3, “still inserts it”] | slice 2 | observed: native keyboard paste in launch-attachments.spec.ts appends text at the caret without an attachment |
| P25 | Paste is an attachment input route. [S, “attachments (paste, refusal, cancel)”] | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts observes a pasted image as pasted.png and the copied path after Start |
| P26 | Starting carries through the intended accepted attachments. [G, “keeps the intended … attachments”] | slice 2 | observed: refusal case in launch-attachments.spec.ts captures the five intended files in order at Start, and agent-launch-ad-hoc-attachments.spec.ts retains native chooser and copied bytes assertions |
| P27 | A refused PDF is excluded from the attachment selection. [E3, “refused PDF”] | slice 2 | observed: refusal case in launch-attachments.spec.ts keeps the incumbent preview and sends no PDF |
| P28 | The draft survives the PDF refusal. [E3, “keep the draft”] | slice 2 | observed: refusal case in launch-attachments.spec.ts observes the unchanged instruction after the PDF, oversized PNG, and sixth-file selections |
| P29 | The PDF refusal has a reason. [E3, “with reasons”] | slice 2 | observed: refusal case in launch-attachments.spec.ts renders the supported image types for notes.pdf |
| P30 | An oversized image is refused. [E3, “oversized … images”] | slice 2 | observed: refusal case in launch-attachments.spec.ts keeps one incumbent preview after the oversized selection and sends no oversized file |
| P31 | The draft survives the oversized-image refusal. [E3, “keep the draft”] | slice 2 | observed: refusal case in launch-attachments.spec.ts observes the unchanged instruction after the PDF, oversized PNG, and sixth-file selections |
| P32 | The oversized-image refusal has a reason. [E3, “with reasons”] | slice 2 | observed: refusal case in launch-attachments.spec.ts renders the 10 MB limit and recovery advice for huge.png |
| P33 | An excess image is refused. [E3, “excess images”] | slice 2 | observed: refusal case in launch-attachments.spec.ts keeps five previews and sends only the five admissible files |
| P34 | The draft survives the excess-image refusal. [E3, “keep the draft”] | slice 2 | observed: refusal case in launch-attachments.spec.ts observes the unchanged instruction after the PDF, oversized PNG, and sixth-file selections |
| P35 | The excess-image refusal has a reason. [E3, “with reasons”] | slice 2 | observed: refusal case in launch-attachments.spec.ts renders the five-image limit for extra-4.png |
| P36 | Cancel after Attach leaves the upload count at zero. [E3, “Cancel or Escape after Attach uploads nothing”] | slice 2 | observed: Cancel and Escape in launch-attachments.spec.ts close attached drafts with no Start invocation or attachment endpoint request |
| P37 | Escape after Attach leaves the upload count at zero. [E3, “Cancel or Escape after Attach uploads nothing”] | slice 2 | observed: Cancel and Escape in launch-attachments.spec.ts close attached drafts with no Start invocation or attachment endpoint request |
| P38 | After Cancel following Attach, the dialog reopens empty. [E3, “reopens empty”] | slice 2 | observed: Cancel and Escape in launch-attachments.spec.ts each reopen with an empty instruction and no attachment list |
| P39 | After Escape following Attach, the dialog reopens empty. [E3, “reopens empty”] | slice 2 | observed: Cancel and Escape in launch-attachments.spec.ts each reopen with an empty instruction and no attachment list |
| P40 | Composing and starting preserve the intended dictation. [G, S, “instruction voice capture”] | slice 7 | observed: remaining-proof.md slice 7 shows the 4,000-character transcript append and the final edited dictation sent once in mounted-instruction-voice-overflow.spec.ts, with real story and unattached delivery in session-instruction-voice.spec.ts. |
| P41 | When dictation overflows 4,000 characters, the existing instruction draft remains available for edit. [E4, “retains both drafts for edit”] | slice 7 | observed: mounted-instruction-voice-overflow.spec.ts preserves and shows the separately retained original draft during review, then returns it editable to the focused field on discard. |
| P42 | In the same overflow, the dictation draft remains available for edit. [E4, “retains both drafts for edit”] | slice 7 | observed: mounted-instruction-voice-overflow.spec.ts shows the complete candidate including its tail, keyboard shortening and Add, and no extra transcription before the final edited launch. |
| P43 | Cancel abandons a held transcription. [E4] | slice 7 | observed: mounted-instruction-voice.spec.ts holds one captured clip’s reply, clicks Cancel, and observes its aborted signal, released native track, no Start, and empty next dialog. |
| P44 | Escape abandons a held transcription. [E4] | slice 7 | observed: mounted-instruction-voice.spec.ts holds one captured clip’s reply, sends Escape, and observes its aborted signal, no Start, and empty next dialog. |
| P45 | A late grant after either dismissal leaves the next dialog unpopulated by the old interaction. [E4, “a late grant or reply cannot populate the next dialog”] | slice 7 | observed: mounted-instruction-voice.spec.ts holds native stream permission across Cancel and Escape, then observes newly granted tracks released and empty new dialogs with no request. |
| P46 | A late reply after either dismissal leaves the next dialog unpopulated by the old interaction. [E4, “a late grant or reply cannot populate the next dialog”] | slice 7 | observed: mounted-instruction-voice.spec.ts resolves held transcription after reopening for both Cancel and Escape and observes an empty ready field with no start. |
| P47 | **Start** is disabled while startup runs. [E5] | slice 8 |  |
| P48 | **Start** is disabled if the startup answer is lost. [E5] | slice 8 |  |
| P49 | **Start** is disabled if the startup answer is uncertain. [E5] | slice 8 |  |
| P50 | The originating story stays protected during an in-progress start, a lost answer, or an uncertain answer. The source leaves the exact guard unspecified. [E5, “the story or Start session stays protected”] | slice 8 |  |
| P51 | The originating **Start session** stays protected under those same conditions. [E5, “the story or Start session stays protected”] |  | G1 |
| P52 | Recovery remains reachable while startup runs. [E5, “with reachable recovery”] | slice 8 |  |
| P53 | Recovery remains reachable after a lost startup answer. [E5, “with reachable recovery”] | slice 8 |  |
| P54 | Recovery remains reachable after an uncertain startup answer. [E5, “with reachable recovery”] | slice 8 |  |
| P55 | A refused start leaves a truthful recovery path reflecting the refusal. [G] | slice 8 |  |
| P56 | An uncertain start leaves a truthful recovery path reflecting the uncertainty. [G, E5] | slice 8 |  |
| P57 | Settlement preserves keyboard focus on a task the user began meanwhile. [E5] | slice 8 |  |
| P58 | Session access remains available in the responsive launch journey. [S, “responsive session access”] | slice 8 |  |
| P59 | Responsive session access includes the unattached-start route. [S, “including unattached starts”] | slice 8 |  |
| P60 | Responsive session access includes recovery reads. [S, “including … recovery reads”] | slice 8 |  |
| P61 | **Follow up** offers **Attach** when notes are waiting. [E6] | slice 8 |  |
| P62 | **Start** names the selected Follow up note choice. [E6, “Start names the choice”] | slice 8 |  |
| P63 | Starting preserves the selected Follow up note handoff. [G, S, “Follow up note attach”] | slice 8 |  |
| P64 | With no waiting notes, **Attach** is unavailable. [E6] | slice 8 |  |
| P65 | With no waiting notes, **Start** still works. [E6] | slice 8 |  |
| P66 | A Taken card shows that notes are waiting when they are. [E6] | slice 8 |  |
| P67 | The Taken card in that waiting-notes example offers no **Follow up**. [E6] | slice 8 |  |
| S14 | The existing host catalog choices are available through the launch UI. [S] | slice 5 | observed: launch-host-catalog.spec.ts holds and fails a Codex read, then observes the three catalog choices after Retry |
| S15 | The existing model choices are available under the applicable host and provider conditions. [S, E2] | slice 5 | observed: launch-host-catalog.spec.ts observes the correct Claude and per-project model list, and launch-native-effort.spec.ts exercises Cursor models |
| S16 | The existing effort choices are available under the applicable host and provider conditions. [S, E2] | slice 5 | observed: launch-model-effort.spec.ts and launch-native-effort.spec.ts observe the exact Claude labels and Codex and Cursor model-sensitive effort choices |
| S17 | UI-owned provider constraints remain observable on the paths where they apply. The source leaves the individual constraints unspecified. [S] | slice 5 | observed: launch-native-effort.spec.ts distinguishes compatible effort, incompatible effort with linked invalidity and disabled Start, and unknown configured model defaults |
| S18 | The existing refinement options are available in the refinement flow. [S, E2] | slice 6 | observed: launch-refinement-options.spec.ts observes group A and option C only on refinement, and agent-launch-options.spec.ts reads real installed definitions with descriptions and flags after reload |
| S27 | Existing creation gates continue to enforce their conditions. The source names the in-flight and unresolved conditions in E5 and leaves any other gates unspecified. [S, E5] | slice 4 | observed: story-card-startup.spec.ts and startup-recovery.spec.ts observe held, accepted and unresolved launch gates, and responsive-session-start.spec.ts protects the actual Backlog card without making a Taken assignment |
| S28 | The instruction layout preserves its existing observable behavior at the covered viewports. [S, A4] | slice 1 | observed: ad-hoc-start-session-layout.spec.ts and ad-hoc-launch-dialog.spec.ts: keyboard order, 320 CSS px and 200% conditions, reachability and footer |
| S29 | Touch can operate the instruction area on the existing covered paths. [S, A4] | slice 1 | observed: ad-hoc-refinement-touch.spec.ts and ad-hoc-start-session-answer.spec.ts: native touch, edit, rotate, close and direction disclosure |
| S53 | Existing startup answer behavior remains observable at the launch boundary. The source leaves any expected answers beyond its examples unspecified. [S] | slice 4 | observed: the nine mounted startup and recovery cases exercise the real attempt path through accepted, refused, lost and later machine-read answers, with composed held and native recovery proof listed in proof.md |
| S54 | Existing host wording is preserved where it is part of the launch proof. [S, A4] | slice 4 | observed: story-card-startup.spec.ts observes exact host/workflow/capability phrases, and startup-recovery.spec.ts observes Claude code-marked advice and its absence for Cursor |
| M01 | The coverage disposition accounts for every legacy `launches/` spec in the stated inventory of 29 sources and 81 cases. These counts describe the starting inventory. [S, A4] | slice 8 |  |
| M02 | Frontend unit proof in scope runs in plain Vitest. [S, A1] | slice 8 |  |
| M03 | Journeys requiring actual installation remain covered in `e2e/launches/`. [S] | slice 8 |  |
| M04 | Journeys requiring a native host launch remain covered in `e2e/launches/`. [S] | slice 8 |  |
| M05 | Journeys requiring cross-service startup remain covered in `e2e/launches/`. [S] | slice 8 |  |
| M06 | Migrated families cease using `actSettled` as they move. [A3] | slice 8 |  |
| M07 | Migrated families cease using React `act` wrapping as they move. [A3] | slice 8 |  |
| M08 | Migrated families cease using `IS_REACT_ACT_ENVIRONMENT` as they move. [A3] | slice 8 |  |
| M09 | Spent support is removed when its last consumer moves. [A3] | slice 8 |  |
| M10 | The shared test-support surface shrinks as migration proceeds. The source specifies no size metric. [A3] | slice 8 |  |
| M11 | Before deleting a retired case, each of its distinct assertions is mapped to a destination or a named existing equivalent. [A4] | slice 8 |  |
| M12 | The report explains why repeated cases were consolidated or kept. [A4] | slice 8 |  |
| M13 | The comparable before-and-after two-worker selections record elapsed time including preparation. [A5] | slice 8 |  |
| M14 | The timing includes proof promoted to E2E. [A5] | slice 8 |  |
| M15 | The comparison records counts by engine and destination. [A5] | slice 8 |  |
| M16 | The comparison records slow cases that remain. [A5] | slice 8 |  |
| M17 | The migrated proof gives maintainers faster feedback on a comparable selection. The complete-group target belongs to the final story. [G, A4, A5] | slice 8 |  |
