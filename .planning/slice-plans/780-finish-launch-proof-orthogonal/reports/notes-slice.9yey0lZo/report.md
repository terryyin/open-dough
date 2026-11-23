# Slice 5 proof for SEED-413#finish-launch-proof-orthogonal

The two owned files remain uncommitted and unstaged:

- `dashboard/src/AttachStoryNotes.tsx`
- `dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts`

The accepted implementation base was `a625e1da22090e5d348daae0619100b07cb051fd`. The coordinator restored the same owned edits on `8b12ee0596637b03678e5cc33f101ff25c54fd5b` after the viewport runner repair. Reverified the browser spec and selected E2E cases there. The typecheck for the production and test contracts ran before the viewport-only repair. There are no open story-obligation entries for this slice. Slice scope and lineage are in `.planning/slice-plans/780-finish-launch-proof-orthogonal/PLAN.md#5-follow-up-note-attachment-renders-the-typed-answer` and `.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md` in the section beginning at line 814. The [shared failure policy](/Users/terryyin/git/open-dough/.worktrees/get-launch-unit-proof-in-about-eight-seconds/Distribution/src/skills/dough-execute-plan/references/failure-policy.md) applies to the handoff.

## Promise dispositions

| ID | Result and observing boundary |
| --- | --- |
| 01 | Passed. `AttachStoryNotes.tsx` requires the prop `answer: StoryNotesAnswer \| undefined` on the existing checkbox owner. The production `StoryNotesAttachment` supplies that prop explicitly from `useStoryNotes(sourceId)`. The union includes the pending read state. `npm run typecheck:dashboard` checked the contract and call site. |
| 02 | Passed. The focused browser case “the notes reader selects waiting notes and describes their count” mounts the production `StoryNotesAttachment` over a typed page reader returning one waiting and one sent note. It asserts the exact accessible description `1 waiting of 2 notes`, a checked and enabled checkbox, and the delivered boolean `true`. |
| 03 | Passed. “the notes reader leaves Attach unavailable when no notes wait” supplies a typed successful reading with one sent and zero waiting notes. The actual reader and checkbox jointly result in exact `No waiting notes`, disabled and unchecked, and the delivered boolean `false`. The E2E “a done story whose sessions cannot be reopened, or that holds none, offers Follow up…” verifies Start in the actual no-note journey. |
| 04 | Passed. “the notes reader explains why unreadable notes cannot be attached” supplies the distinct typed `{ kind: "unreadable" }` answer. It checks exact `The notes could not be read.`, disabled and unchecked, and the delivered boolean `false`. |
| 05 | Passed. “Follow up defaults to waiting notes, Start sends the selected choice, and Cancel sends nothing” still uses the real `StartSession`, launcher, checkbox, Start and Cancel. It observes the checked default on each open and exact nested story identity and revision for both Start requests. The first has `notes: true`, the second omits `notes` after unchecking, and Cancel closes the dialog while the callback count remains two. “a Taken card shows notes waiting and offers no story Follow up” retains exact status and accessible description `1 note waiting` on the `Notes (1)` button and absence of a Follow up button. |

The two earlier no-waiting and unreadable cases traversed the whole dialog to submit the same request shape. The new cases prove that each independent state passes `false` to the caller and that each renders the exact distinct description. The shared production connection in `StartSession.tsx` supplies `setAttachNotes` as `onAttach` and passes the resulting boolean into `followUpSourceAttachingNotes` at Start. The request shaper in `followUpRequest.ts` returns the original source for `false` and sets `notes: true` for `true`. The composed browser test observes the unselected request at that same submission boundary. There is no independent channel from the notes read into Start enablement or request content. A dedicated end-to-end unreadable launch was outside the selected proof.

## Focused browser and type proof

The focused browser command selects the whole `dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts` file with two workers. The historical base selected its original four cases. Each candidate run selected the same five cases in the promise table, including the composed and Taken-card witnesses. The typed answers and fixture launch records are preconditions. The tests use the actual reader and rendered controls, with real native interactions in the composed case. The typed callbacks observe the public notes-choice and launch-request boundaries. Case setup uses existing MakeMe builders, `PageReadsOnPage`, the standard component mount and the existing composed launch setup. Both browser runs on the initial candidate and the repaired runner run passed at the standard browser profile, with no viewport override, artificial delay or timeout changes in the spec.

The initial action-phase profile recorded 11 clicks and 1.93 summed case-seconds in the old case roster. The measured experiment removed repeated launch setup and Start interaction from the two unavailable-note cases. It retained their independent outcomes at the notes reader boundary. One same-file A/B repeat restored only the original two files for the baseline, restored the exact candidate bytes, and ran the candidate at two workers with the same command selection. Both historical comparisons used the same source revision `a625e1da22090e5d348daae0619100b07cb051fd`.

| Two-worker comparison | No waiting + unreadable case bodies | Summed case time | Shell wall time |
| --- | ---: | ---: | ---: |
| Before → after | 1,212 → 195 ms | 3.190 → 2.107 s | 5.70 → 12.65 s |
| Matched repeat before → after | 817 → 217 ms | 5.459 → 6.047 s | 44.45 → 47.93 s |

The consistently shorter case bodies show a 73–84% reduction at the two changed case boundaries. Wall time grew across both historical comparisons. Reported startup, import and worker phase times varied substantially. Host load logs show an especially noisy matched pair, and the unchanged-purpose composed case also varied. The paired results support the localized reduction in repeated work. Whole-file or whole-launch elapsed improvement is unverified. This limits the improvement claim to the affected observations under Accepted ADR 0010, Definition of improvement.

After the repair, `viewport-after.log.run.json` and `viewport-after.json` record five passing cases and 10.98 s shell wall time. The repair pins the Playwright provider’s initial context to the existing default Vitest dimensions. Because the composed witness uses native pointer input in that profile, a fresh focused run covered the changed setup. The repaired run serves as behavioral evidence and has no paired baseline. Typecheck exited 0 on the original candidate and the production component contract and test source are identical after restoration.

## Consumer trace and journey proof

Search command from the execution checkout:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD" --base a625e1da --term StoryNotesAttachment --term AttachStoryNotes --term sessionAttachingStoryNotes --term 'Attach story notes'
```

See [consumer-trace.txt](consumer-trace.txt) for the candidates and signal terms. The changed effect is where the required typed notes answer enters the rendered checkbox as well as the owner where the three reading outcomes are exercised. The following dispositions cover each reached purpose:

- Production `StartSession.tsx` mounts the existing notes group in the story Follow up branch. Its `sessionAttachingStoryNotes` caller and `followUpSourceAttachingNotes` calls are exercised through the composed browser test and the E2E journeys below. This branch accepts only the boolean notes choice from the reader. Regular non-story StartSession lacks the story source necessary to render the group.
- `attachStoryNotesWords.ts` supplies the same existing label and descriptions independently of the reader refactor. The focused browser role and exact descriptions observe that text. `dashboard/test-support/support/attachStoryNotesPage.ts` reaches the same checkbox by name and tests checked state and waiting count in the card, review-file and review-line E2E journeys.
- `onAttach` substring hits in image attachments, terminal endpoints, connection or recovery code, and internal CI observers refer to separate operations. They have no notes-answer prop, story reader or notes-choice path. Their related terminal/backend tests are outside reach. Planning and archived evidence matches record previous uses and have no runtime consumers.
- The Taken-card note cue uses the shared story notes read separately from the attachment group. Its existing focused browser test remained selected and passed.

The launched E2E profile is `e2e/playwright.config.ts` via `npm run test:e2e`. The single selection used two Chromium workers and the maintained macOS AC sleep guard. Test setup uses the real dashboard server, app, target repositories and note store, with existing synthetic launch-host fixtures. It selected exactly the following four cases. All passed on retry 0 at `8b12ee0596637b03678e5cc33f101ff25c54fd5b` with the two owned working-tree files. The shell wall time was 32.07 s. The custom reporter writes the decisive test roster and terminal state to [notes-e2e.json](notes-e2e.json).

| Source and exact test title | Setup and observing assertion |
| --- | --- |
| `e2e/stories/recently-done-follow-up.spec.ts:63` “a done story whose sessions cannot be reopened, or that holds none, offers Follow up; Start sends its published facts and sessions with the request and leaves the card as it was” | Seeds quiet and reopenable launch records with published done stories and no waiting notes. The story with quiet sessions offers its context, Start opens the corresponding Taken session, the dialog closes, and the single recorded synthetic launch has the exact published context and instruction. |
| `e2e/stories/recently-done-follow-up.spec.ts:167` “starting a follow-up with attached notes marks them sent on the card and in Story notes” | Seeds one waiting note in the dashboard store and publishes the completed story. `attach.expectChecked(1, 1)` sees the default choice. Start opens a Taken session and closes the dialog. Reload observes zero waiting, the retained note and `storyNoteSentToFollowUp`. |
| `e2e/review/story-review-follow-up.spec.ts:46` “Published completion offers file Follow up; Start sends the file context and instruction” | Seeds a waiting note and a published file completion. `attach.expectChecked(1, 1)` sees the default, then `attach.uncheck()` uses the native control. Start closes the dialog, opens a Taken session and records a single launch with file, comparison and instruction. The exact omitted `notes` property is asserted in the composed browser test. |
| `e2e/review/story-review-diff-line-follow-up.spec.ts:91` “line numbers open a Follow up menu by pointer, keyboard, touch, Escape, outside click, and revealed context” | Seeds a waiting note and a published diff. The opened line Follow up displays path, comparison, line and side, then `attachStoryNotes(dialog).expectChecked(1, 1)` observes the waiting note. Cancel closes this dialog. The no-request assertion resides in the composed browser test. |

The expensive proof remained confined to the four reached journey cases. At dispatch, the host reported AC, 16 logical CPUs, 51.46% idle CPU and 43% available memory, with one-minute load around 19. The targeted two-worker selection met the retained proof decision. Browser runner config and historical timing limitations are documented above. No required Slice 5 observations remain open.

## Literal commands and terminal records

### before

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/notes-slice.9yey0lZo/before.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts --workers=2
```

Terminal [run record](before.log.run.json), [before.exit](before.exit), and [before.log](before.log). Revision `a625e1da22090e5d348daae0619100b07cb051fd`. Exit 0.

### after

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/notes-slice.9yey0lZo/after.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts --workers=2
```

Terminal [run record](after.log.run.json), [after.exit](after.exit), and [after.log](after.log). Revision `a625e1da22090e5d348daae0619100b07cb051fd`. Exit 0.

### matched-before

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/notes-slice.9yey0lZo/matched-before.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts --workers=2
```

Terminal [run record](matched-before.log.run.json), [matched-before.exit](matched-before.exit), and [matched-before.log](matched-before.log). Revision `a625e1da22090e5d348daae0619100b07cb051fd`. Exit 0.

### matched-after

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/notes-slice.9yey0lZo/matched-after.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts --workers=2
```

Terminal [run record](matched-after.log.run.json), [matched-after.exit](matched-after.exit), and [matched-after.log](matched-after.log). Revision `a625e1da22090e5d348daae0619100b07cb051fd`. Exit 0.

### typecheck

```sh
npm run typecheck:dashboard
```

Terminal [run record](typecheck.log.run.json), [typecheck.exit](typecheck.exit), and [typecheck.log](typecheck.log). Revision `a625e1da22090e5d348daae0619100b07cb051fd`. Exit 0.

### notes-e2e

```sh
env OPEN_DOUGH_E2E_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/notes-slice.9yey0lZo/notes-e2e.json /usr/bin/time -p caffeinate -s -i npm run test:e2e -- e2e/stories/recently-done-follow-up.spec.ts e2e/review/story-review-follow-up.spec.ts e2e/review/story-review-diff-line-follow-up.spec.ts --workers=2 --grep 'a done story whose sessions cannot be reopened|starting a follow-up with attached notes|Published completion offers file Follow up|line numbers open a Follow up menu'
```

Terminal [run record](notes-e2e.log.run.json), [notes-e2e.exit](notes-e2e.exit), and [notes-e2e.log](notes-e2e.log). Revision `8b12ee0596637b03678e5cc33f101ff25c54fd5b`. Exit 0.

### viewport-after

```sh
env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/Users/terryyin/git/open-dough/.git/worktrees/get-launch-unit-proof-in-about-eight-seconds/open-dough/evidence/notes-slice.9yey0lZo/viewport-after.json /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/follow-up-note-handoff.spec.ts --workers=2
```

Terminal [run record](viewport-after.log.run.json), [viewport-after.exit](viewport-after.exit), and [viewport-after.log](viewport-after.log). Revision `8b12ee0596637b03678e5cc33f101ff25c54fd5b`. Exit 0.

