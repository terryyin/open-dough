# Source review

Codex ran `/root/source_review` with no conversation inheritance. Its input was the selected story’s Goal, Scope, Key examples and Evaluation, plus the shared acceptance clauses on test ownership, retained coverage and timing. It was instructed to use only that input, read no files, make no changes and derive promises without slice allocation or acceptance. The source anchors below refer to those excerpts. The reviewer returned the numbered results below in this execution’s conversation. The coordinator assigned their slice owners.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 01 | Note attachment receives its notes answer through a required typed input. (Scope and note-attachment example) | slice 5 | observed: AttachStoryNotes.tsx requires answer of type StoryNotesAnswer \| undefined and the actual StoryNotesAttachment reader supplies it explicitly, passed Dashboard typecheck |
| 02 | The reading wrapper renders the waiting state for the corresponding notes answer. (Scope and note-attachment example) | slice 5 | observed: follow-up-note-handoff.spec.ts mounts the actual reader and observes 1 waiting of 2 notes, enabled and selected, and the typed true choice |
| 03 | The reading wrapper renders the distinct no-waiting state for the corresponding notes answer. (Scope and note-attachment example) | slice 5 | observed: follow-up-note-handoff.spec.ts observes No waiting notes, disabled and unchecked, and the typed false choice from a sent-only answer |
| 04 | The reading wrapper renders the distinct unreadable state for the corresponding notes answer. (Scope and note-attachment example) | slice 5 | observed: follow-up-note-handoff.spec.ts observes The notes could not be read, disabled and unchecked, and the typed false choice from an unreadable answer |
| 05 | One composed Start session journey for a Follow-up request remains covered. (Note-attachment example and Goal) | slice 5 | observed: follow-up-note-handoff.spec.ts observes both exact story requests through StartSession, notes only when chosen, no request on Cancel, and the independent Taken-card note cue |
| 06 | An unattached startup attempt in progress is shown on the project-actions row. (Scope and unattached-startup example) | slice 6 | observed: ad-hoc-start-session-answer.spec.ts uses typed ProjectActions progress and observes exact whole words within the action row, disabled launcher and enabled after clear |
| 07 | A refused unattached startup attempt is shown on the project-actions row. (Scope and unattached-startup example) | slice 6 | observed: ad-hoc-start-session-answer.spec.ts observes the typed refusal words and stable row bounds across native touch opening, dismissal and rotation |
| 08 | A blank keyboard start presents the terminal. (Unattached-startup example) | slice 6 | observed: responsive-unattached-startup.spec.ts uses native Enter and observes one presentation of the settled blank session with takesKeyboard false and the other task focused |
| 09 | A keyboard start with an instruction leaves the terminal closed. (Unattached-startup example) | slice 6 | observed: responsive-unattached-startup.spec.ts checks the exact instructed request, progress handoff and zero terminal presentations through settlement while the other task stays focused |
| 10 | The existing image-paste observation stays with its owning dialog and attachment control. (Scope) | slice 7 | observed: agent-launch-ad-hoc-attachments.spec.ts pastes an image into the real instruction and observes pasted.png plus the sent and copied path, all three cases passed in CI 45108770652 |
| 11 | Pasting text extends the instruction. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts uses native clipboard paste and observes the pasted text appended to its existing instruction value |
| 12 | Pasting text attaches no image. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts checks there is no Attached images list after the native text paste |
| 13 | Attachment refusal explains why the input was refused. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts observes the exact invalid MIME type, 10 MB and five-image-limit refusal words from the real file control |
| 14 | Attachment refusal preserves already accepted images. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts observes card.png and only the accepted previews after refusals, then exact five names in the typed Start request |
| 15 | Attachment refusal preserves the instruction draft. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts observes the retained draft after each rejection and the same instruction in the typed Start request |
| 16 | Cancel discards the instruction draft. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts clicks native Cancel and reopens through the actual Start session launcher, then observes an empty instruction |
| 17 | Cancel discards attachments. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts observes the accepted preview before native Cancel and no attachment list after the real reopen |
| 18 | Cancel triggers no upload. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts observes no Start callback and no attachment endpoint fetch after native Cancel |
| 19 | Escape discards the instruction draft. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts dismisses with native Escape and reopens through the actual launcher, then observes an empty instruction |
| 20 | Escape discards attachments. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts observes the accepted preview before native Escape and no attachment list after the real reopen |
| 21 | Escape triggers no upload. (Attachment example) | slice 7 | observed: launch-attachments.spec.ts observes no Start callback and no attachment endpoint fetch after native Escape |
| 22 | The model label on the card follows the launch subject for that session. (Scope and recorded-launch example) | slice 8 | |
| 23 | The model label in the sidebar follows the launch subject for that session. (Scope and recorded-launch example) | slice 8 | |
| 24 | Session details show the launch subject’s recorded effort when present. (Scope and recorded-launch example) | slice 8 | |
| 25 | Session details show the launch subject’s recorded options when present. (Scope and recorded-launch example) | slice 8 | |
| 26 | The existing `CreationEntry` case remains covered through its typed record. (Scope) | slice 6 | observed: ad-hoc-creation-entry.spec.ts renders the existing typed creation, stand-in host and quoted inspection arguments with no original Codex host word |
| 27 | In a narrow dialog, the offers remain reachable in keyboard order. (Dialog and desktop-notes example) |  | G1 |
| 28 | In a narrow dialog, the actions remain reachable in keyboard order. (Dialog and desktop-notes example) |  | G1 |
| 29 | In a zoomed dialog, the offers remain reachable in keyboard order. (Dialog and desktop-notes example) |  | G2 |
| 30 | In a zoomed dialog, the actions remain reachable in keyboard order. (Dialog and desktop-notes example) |  | G2 |
| 31 | On desktop, launch notes remain discoverable by hover. (Dialog and desktop-notes example) | slice 2 | observed: story-card-launch-offers.spec.ts noted Starts discovery case shows each note in response to native hover |
| 32 | On desktop, launch notes remain discoverable by keyboard. (Dialog and desktop-notes example) | slice 2 | observed: story-card-launch-offers.spec.ts noted Starts discovery case shows each note after native Tab and opens its named dialog with Enter |
| 33 | On desktop, launch-note states remain legible in the first of the two schemes. (Dialog and desktop-notes example) | slice 2 | observed: story-card-launch-offers.spec.ts dedicated light and dark case checks glyph legibility and compares available and unavailable text and border colors |
| 34 | On desktop, launch-note states remain legible in the other scheme. (Dialog and desktop-notes example) | slice 2 | observed: story-card-launch-offers.spec.ts dedicated light and dark case checks glyph legibility and compares available and unavailable text and border colors |
| 35 | On desktop, launch-note states remain distinguishable in the first of the two schemes. (Dialog and desktop-notes example) | slice 2 | observed: story-card-launch-offers.spec.ts dedicated light and dark case checks glyph legibility and compares available and unavailable text and border colors |
| 36 | On desktop, launch-note states remain distinguishable in the other scheme. (Dialog and desktop-notes example) | slice 2 | observed: story-card-launch-offers.spec.ts dedicated light and dark case checks glyph legibility and compares available and unavailable text and border colors |
| 37 | After refinement is refused, the chosen options are still checked on reopening. (Refinement example) | slice 3 | observed: launch-refinement-options.spec.ts unsuccessful typed start callback, reopened dialog checks both A and C; agent-launch-options-kept.spec.ts observes the real boundary refusal and retained choice |
| 38 | After refinement is canceled, the chosen options are cleared on the next open. (Refinement example) | slice 3 | observed: launch-refinement-options.spec.ts Cancel closes the reopened dialog, the next open clears both choices and selects No Approach, and only one start was attempted |
| 39 | A held offer follows its applicable availability rule. (Refinement example) | slice 3 | observed: launch-refinement-options.spec.ts held initial read disables Start refinement until the offer is answered |
| 40 | A held offer follows its applicable submission rule. (Refinement example) | slice 3 | observed: launch-refinement-options.spec.ts unavailability is on the real disabled Start refinement button while the initial offer is held |
| 41 | A host reread follows its applicable availability rule. (Refinement example) | slice 3 | observed: launch-refinement-options.spec.ts host reread shows Reading options and exposes no choice controls while held |
| 42 | A host reread follows its applicable submission rule. (Refinement example) | slice 3 | observed: launch-refinement-options.spec.ts held host reread submits a Claude start through the typed callback without an options field |
| 43 | Cancel ends recording when recording work is applicable. (Recording and keyboard-startup example) | slice 4 | observed: mounted-instruction-voice.spec.ts Cancel stops active recording without transcribing, with a real live then ended track and no launch |
| 44 | Cancel ends transcription when transcription work is applicable. (Recording and keyboard-startup example) | slice 4 | observed: mounted-instruction-voice.spec.ts held transcription Cancel iteration observes active then aborted signal and ended tracks |
| 45 | Escape ends recording when recording work is applicable. (Recording and keyboard-startup example) | slice 4 | observed: mounted-instruction-voice.spec.ts Escape stops active recording without transcribing, with a real live then ended track and no launch |
| 46 | Escape ends transcription when transcription work is applicable. (Recording and keyboard-startup example) | slice 4 | observed: mounted-instruction-voice.spec.ts held transcription Escape iteration observes active then aborted signal and ended tracks |
| 47 | A late permission answer leaves the new draft empty. (Recording and keyboard-startup example) | slice 4 | observed: mounted-instruction-voice.spec.ts held permission observes an empty reopened draft and the previous live track ending on its late answer after both dismissals |
| 48 | A late transcription answer leaves the new draft empty. (Recording and keyboard-startup example) | slice 4 | observed: mounted-instruction-voice.spec.ts held transcription resolves the previous request after each native reopen and observes the new draft stay empty |
| 49 | Keyboard startup selects the correct story. (Recording and keyboard-startup example) | slice 6 | observed: responsive-story-startup.spec.ts observes one acceptance for the selected story, its protected selection and details, and the other story still enabled |
| 50 | Keyboard startup announces each applicable transition once. (Recording and keyboard-startup example) | slice 6 | observed: responsive-story-startup.spec.ts records the actual announcer mutations and observes progressing, pending published state and reconciled once each across repeated reads |
| 51 | Keyboard startup leaves focus with the next inspection. (Recording and keyboard-startup example) | slice 6 | observed: responsive-story-startup.spec.ts uses native Enter to open the other card inspection and checks Hide detail stays focused after both settlement reads |
| 52 | Each affected case uses the smallest production owner through the typed entry that production itself uses, with typed sources production explicitly supplies. (Scope and Shared acceptance) | slice 8 | |
| 53 | The affected tests and helpers contain no test-built copy of a production composition. This covers the story-card launch’s machine-sessions composition and the responsive unattached-startup cases’ spread of `launchOffers`. (Scope, story-card example, and Shared acceptance) | slice 6 | observed: StoryCard.tsx and FollowUp.tsx accept only their existing typed inputs, story-startup-page.ts removes the Board MachineSessions fixture, and the unattached and follow-up specs supply real attempts without spreading launchOffers |
| 54 | The affected tests contain no restated production provider stack. (Shared acceptance) | slice 8 | |
| 55 | The affected tests make no view props by calling private pipeline functions. (Shared acceptance) | slice 8 | |
| 56 | Any newly introduced read is supplied by a required typed source. (Shared acceptance) | slice 8 | |
| 57 | A newly introduced read uses no context default. (Shared acceptance) | slice 8 | |
| 58 | A newly introduced read uses no defaulted parameter. (Shared acceptance) | slice 8 | |
| 59 | All frontend unit checks run in plain Vitest. (Shared acceptance) | slice 8 | |
| 60 | Existing composed launch journeys retain coverage. The Follow-up request is the explicitly named journey in ID 05. (Goal) | slice 8 | |
| 61 | Retained proof preserves the genuine browser conditions on which the existing observations depend. (Scope and Shared acceptance) | slice 8 | |
| 62 | Retained proof preserves the existing capture race observations. (Scope) | slice 4 | observed: mounted-instruction-voice.spec.ts held permission, held transcription and unexpected track end; both sibling specs observe overflow, permission refusal, failed capture and retry |
| 63 | Retained proof preserves the existing recovery race observations. (Scope) | slice 6 | observed: startup-recovery.spec.ts and startup-recovery-reads.spec.ts retain held acceptance, late uncertainty, unanswered refresh, protected inspection and confirmed progress with exact Recheck counts |
| 64 | Existing native journeys stay at their current owners. (Scope) | slice 8 | |
| 65 | Existing install journeys stay at their current owners. (Scope) | slice 8 | |
| 66 | The backend group keeps its existing coverage and journeys with the current backend owners. (Scope and Shared acceptance) | slice 8 | |
| 67 | The backend group keeps its runner with its current owner. (Shared acceptance) | slice 8 | |
| 68 | The E2E group keeps its existing coverage with its current owner. (Shared acceptance) | slice 8 | |
| 69 | The E2E group keeps its runner with its current owner. (Shared acceptance) | slice 8 | |
| 70 | The change adds zero E2E cases. (Scope) | slice 8 | |
| 71 | If shared frontend runner configuration changes, whole frontend group proof accompanies the change. (Scope) | slice 8 | |
| 72 | `story-card-launch-offers.spec.ts` retains its `chromium-desktop` instance. (Scope) | slice 2 | observed: simple-launch.aZIjH7md candidate-c.log runs all story-card-launch-offers titles on chromium-desktop |
| 73 | `story-card-startup.spec.ts` retains its `chromium-desktop` instance. (Scope) | slice 6 | observed: story-card-startup.spec.ts retains all six titles on chromium-desktop in the matched run and the post-typecheck consumer proof |
| 74 | As a family moves, its React `act` wrapping is retired. (Shared acceptance) | slice 8 | |
| 75 | As a family moves, its use of `IS_REACT_ACT_ENVIRONMENT` is retired. (Shared acceptance) | slice 8 | |
| 76 | Spent support is removed as its last consumer moves. (Evaluation and Shared acceptance) | slice 8 | |
| 77 | The shared test-support surface keeps shrinking. (Shared acceptance) | slice 8 | |
| 78 | Distinct risks retain separate names when their setup or failure diagnosis calls for it. (Shared acceptance) | slice 8 | |
| 79 | The evidence maps existing observations from all seven original files and all six reopened files to maintained proof. Before any observation is removed, its distinct assertions map to a new owner or a named retained equivalent that would fail for the same regression. (Scope, Evaluation, and Shared acceptance) | slice 8 | |
| 80 | The evidence reports why repeated cases were consolidated or kept. (Shared acceptance) | slice 8 | |
| 81 | The slow steps in the reopened proof are timed. (Scope) | slice 8 | |
| 82 | The whole launch selection runs in about 7–8 seconds wall time, including runner preparation, via `npm run test:dashboard:frontend -- dashboard/frontend-tests/launches --workers=2`. The timed selection includes the creation-entry file. (Goal, Scope, measurement example, and Evaluation) | slice 8 | |
| 83 | The timing evidence records paired before-and-after elapsed times, including preparation, for comparable whole launch selections run with two workers under similar machine load. (Measurement example and Shared acceptance) | slice 8 | |
| 84 | The comparison records case counts by engine. (Shared acceptance) | slice 8 | |
| 85 | The comparison records case counts by destination. (Shared acceptance) | slice 8 | |
| 86 | The comparison records which slow cases remain. (Shared acceptance) | slice 8 | |
| 87 | Each engine’s selection is run explicitly while the legacy runner exists. (Shared acceptance) | slice 8 | |
| 88 | The timing evidence includes runtime for any proof promoted to E2E. (Shared acceptance) | slice 8 | |
| 89 | If reaching the target would require losing a distinct observation, the report gives the measured remainder and its cause. (Scope) | slice 1 | observed: PLAN.md Current decisions and s1-layout-return.md Decision supported at the checkpoint |
| 90 | At the standard viewport, verify the launch dialog’s keyboard order. The amendment moves this check out of the narrow or zoomed setup. | slice 1 | observed: ad-hoc-launch-dialog.spec.ts and ad-hoc-start-session-layout.spec.ts native Tab sequences at the default viewport |
| 91 | At each size already covered by responsive layout cases, verify that offers remain reachable. | slice 1 | observed: ad-hoc-launch-dialog.spec.ts and ad-hoc-start-session-layout.spec.ts geometry and hit checks under both responsive conditions |
| 92 | At those same sizes, verify that actions remain reachable. Offers and actions can fail independently, and the amendment does not prescribe separate tests for them. | slice 1 | observed: ad-hoc-launch-dialog.spec.ts and ad-hoc-start-session-layout.spec.ts hit geometry, full Start and Cancel viewport visibility and workspace policy checks |

## Source context

Codex ran `/root/simpler_source_review` with no conversation inheritance
after the maintainer asked for small, focused cases and standard viewport
setup. The input was the changed key example, the preceding wording, the
developer's instruction and the unchanged goal. Its three changed
commitments are 90–92 above. The earlier unaffected commitments still
apply.

The seven original and six reopened specs, the typed unattached startup and creation-entry baselines, and the two-worker feedback target are stated in the story scope. Shared acceptance places each observation at the production boundary that can prove it. Its consolidation criteria preserve exact wording, accessibility, viewport and input distinctions, races and error or retry boundaries wherever they constitute the proof. The source does not specify the scheme names, the precise held-offer and host-reread outcomes, or the announcement text. The maintainer owns the trade-off if preserving a distinct observation prevents reaching the target.
