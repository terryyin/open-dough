# Slice 7 implementation proof

Uncommitted implementation on `codex/capture-and-edit-story-notes-in-the-dashboard`,
base `c955b00d13a5c50bf44ca31fd198b16ba9a5c632`, exact execution checkout
`/Users/terryyin/git/open-dough/.worktrees/capture-and-edit-story-notes-in-the-dashboard`.
Start 2026-11-17 03:18:28 UTC. Active time approximately 12 minutes, excluding
command waits; coordinator delivery, refactoring and CI remain coordinator-owned.
No slice status, commit, push, formatter or hook-owned lint operation performed.
Root-owned `execution-context.md` changes preserved.

## Implementation and setup

`StoryReviewHeading` renders existing `StoryNotes` for story subjects in the
existing header row; ad hoc sessions receive none. `IntentHeader` renders the
same control beside its selected story. Neither review state owner is replaced.
`StoryReview.tsx` and `IntentFileReading.tsx` remain untouched. Existing Notes
count, dialog and keyboard-return behavior are reused directly.

Tests use the real CLI/published-origin preparation harness for review and
Intent. Their source selectors resolve `makeMe: true, pageObjects: true`; the
same selection was checked for the strengthened frontend retention test.
Shared factories, preparation helpers and focused page objects are reused.
No timeout overrides or `test.slow()` added. Checkout npm setup was reused.

Before initial expensive proof: awake, AC, 16 cores/48 GB from retained host
basis, observed load 3.90/4.81/4.86; no other root-owned heavy proof. Sequential
commands used the configured two workers. After load rose (current retained
observation 19.73/13.60/8.92), remaining proof used one worker, sequentially.
Subsequent load observed 5.67/9.56/8.36. Commands below remained owned through
terminal completion, using the maintained AC sleep guard.

## Literal commands and results

All commands ran in the exact checkout above. Playwright stdout/stderr and exit
files remain at `/tmp/slice7-<name>.log` and `.exit` for this session.

P1, focused journey proof (`focused-repaired`): 4 passed, 10.4s.

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list review/story-review-diff-add-note.spec.ts intent/intent-story-add-note.spec.ts
```

P2, whole real review suite and story Intent consumers (`e2e-consumers`):
114 passed, 1 failed, 5.1m. Sole defect was the introduced review-header height;
its repaired whole geometry journeys pass P3. Other behavioral observations are
reused: moving Notes to a sibling in the same header changes geometry alone;
comparison/read/file contracts remain unchanged. The subsequent line-menu repair
changes only fit-above positioning; actual menu purposes are renewed by P5/P6.

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list review/ intent/intent-story intent/intent-summary-story-comparison-renamed.spec.ts
```

P3, repaired geometry and Notes journeys (`e2e-layout-repaired`): 10 passed, 47.1s.
Original shared top-bar-height assertion remains unchanged. Both panes, narrow
layout, phone/tablet touch, rotation/panel controls, and reading places pass.

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list --workers=1 review/story-review-panes.spec.ts review/story-review-touch.spec.ts review/story-review-diff-add-note.spec.ts intent/intent-story-add-note.spec.ts
```

P4, frontend consumers (`frontend-consumers`): 48 passed, 1 failed, 2.1m.
Header/title/outside-count geometry, narrow keyboard navigation, source/mode
selection, review rendering, and session selection passed. The strengthened
retention case exposed the single-line menu defect; P6 observes its repair.
The 48 other results remain applicable except menu positioning renewed by P6.

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list --workers=1 review/ intent/intent-story intent/intent-done-review-modes.spec.ts intent/intent-done-source-selection.spec.ts intent/intent-sidebar-toggle.spec.ts sessions/recently-done-sessions-select stories/story-notes-retained.spec.ts
```

P5, actual line-menu consumers after repair (`line-menu-repaired`): 9 passed,
33.1s. Pointer/keyboard/touch/Escape/outside click, copied text, revealed lines,
file/line Add note, existing Follow up, and both Notes journeys pass.

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list --workers=1 review/story-review-diff-line-follow-up.spec.ts review/story-review-diff-add-note.spec.ts review/story-review-workspace-add-note.spec.ts intent/intent-story-add-note.spec.ts intent/intent-story-follow-up.spec.ts
```

P6, repaired one-line retention and open-menu lifecycle (`frontend-line-menu-repaired`):
5 passed, 7.8s. The same pointer action saves a Taken line note. After reload,
a new launch, then Done with no launch/workspace records, its original path,
comparison name/endpoints, line number/side/text are still displayed. Captured
POST independently contains those exact facts. Styling arrival keeps its open
line menu, revealed context and scroll position. A preceding repair check also
passed the retention and Landed rename-context cases together (2 passed, 5.3s).

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list --workers=1 review/story-review-diff-syntax-arrival.spec.ts stories/story-notes-retained.spec.ts
```

Final `npm run typecheck:dashboard` and `git diff --check`: exit 0.
All attempt-owned source files are below 250 lines (largest: Notes page object,
186). No source exceeding 250 lines was edited.

## Failure diagnosis and repairs

Initial P1 assertions confused Published-only review context with a workspace
radio switch and compared `innerText` to `textContent`. Matching fixed-context
and textContent observations corrected the tests; complete journeys pass P1/P3/P5.

P2 `story-review-panes.spec.ts:88` observed top bars 57 versus 88.5625 pixels.
Notes below the identity increased header height. Keeping Notes in the existing
header row restores the original assertion; P3 renews the affected geometry.

P4 retention trace showed the file heading intercepting the line menu's Add note
click. On a one-line diff the menu flipped above merely because it exceeded the
pane bottom, even when it could not fit above. `DiffLineNumber` now flips only
when the menu fits above. No pointer workaround or weakened assertion is used;
P5/P6 renew actual menu behavior under the linked failure policy.

## Source commitments

| ID | Observation or matching reuse |
| --- | --- |
| 11 | P3/P5 Review Notes shows count 1 and the existing saved story note. |
| 12 | P3/P5 Intent Changed tests Notes shows the same story collection/count. |
| 16 | Existing slice-5/6 context implementation unchanged; P5 reads file, both line sides and revealed context; P6 reads context after Done. |
| 20 | P5 Published/Intent and Taken file Add note; Landed rename context passed in repair check, same shared implementation as slice 5/6. |
| 21 | P5 Published/Intent/Taken line Add note plus P6 one-line Taken pointer menu. |
| 23 | P5 retains Follow up beside Add note for eligible historical line menus and Follow up still starts its existing flow. |
| 26 | Prior slice-5/6 identity-before/after proof matches unchanged context/dialog; new Notes journeys name exact story identity. |
| 27 | Prior slice-5/6 title-before/after proof matches unchanged context/dialog; new Notes journeys name exact story title. |
| 31 | P5 displayed Published/workspace comparison context and P6 saved All changes context. |
| 32 | Prior slice-6 exact real workspace endpoints remain applicable; P6 independently asserts exact submitted and Done-displayed endpoints. |
| 36 | P5 real displayed file/line/view context retained; P6 now directly captures Taken line 1 and reads identical file/comparison/endpoints/line/text after Done with workspace/launch records absent. Existing real restart persistence/store proof remains applicable because those boundaries are unchanged. |
| 61 | P3/P5 Story notes opens over current Review/Intent; underlying diff state remains after close. |
| 63 | P3/P5 capture displayed comparison description before opening, compare unchanged after close. |
| 64 | P3/P5 retain the selected nondefault file and its diff. |
| 65 | P3/P5 retain revealed old line 40 and exact positive scroll offset. |
| 66 | P3/P5 open Notes by keyboard and observe focus on the same Notes opener after close. |
| 69 | Unchanged composer layout/context-above-text from slice 5/6; P5 exercises both file and line composers without changing that boundary. |

Setup/assertions: `e2e/review/story-review-diff-add-note.spec.ts` helper
`openNotesReview` and Notes case; `e2e/intent/intent-story-add-note.spec.ts`
Notes case; `dashboard/frontend-tests/stories/story-notes-retained.spec.ts`
actual Taken capture and final Done context/POST assertions. Focus mechanics
remain in `storyNotesPage`; fixed-context reading in `reviewContextLine`.

## Consumer trace

[Whole-checkout consumer record](slice-7-consumers.md) and
[guidance/history continuation](slice-7-guidance-consumers.md) retain every
located consumer and its disposition. Discovery command:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/capture-and-edit-story-notes-in-the-dashboard --base c955b00d13a5c50bf44ca31fd198b16ba9a5c632 --term StoryReviewHeading --term IntentHeader --term storyHeaderDetail --term storyTitle --term outsideCount --term lineNumberControl --term openLineMenu
```

Header aggregate/title/count/layout and keyboard consumers use P2/P3/P4;
shared line-menu/copy/focus/dialog consumers use P5/P6; store/card APIs, unchanged
helper contracts, CI history substring matches and historical guidance are
excluded only where their asserted boundary is unchanged. No outstanding local
behavioral proof gap. Coordinator-owned lint/refactor/delivery/CI not claimed.

## Coordinator acceptance and independent refactor

Freshness settled unchanged selected story/plan at trunk
`75c9f7310d00e5ba93cc8842b86d99f0b3c756bb`; upstream changes since7ce6
are release/installed-guidance records only, with no product or sibling change.
Root inspected final header row, Intent embedding, fit-above menu condition,
actual positive-scroll/focus journeys and exact contextual lifecycle readback.
All17 source observations recorded through the installed obligation recorder.

Fresh independent refactor_7 found none—already clean. Existing Notes owner
and dialog stay shared; menu placement is one local responsibility. Inspected
checks, conventions and recorded consumer purposes; ADR0002/0008 and file-size
checks satisfied. No edits, no proof invalidation, no tests rerun; whitespace
passed. Reused P2/P4 unaffected observations and repaired P3/P5/P6 observations.
Approximately eight active minutes; no remaining gap or deferred observation.

Guarded formatting first stopped before commit for three non-null assertions.
Root replaced them with explicit local-ref and comparison-text checks within
refactor_7's accepted paths/trace; no new helper, dependency or behavior.
Already-traced repair. Renewed exact P5 (nine passed,30.5s) and frontend
retention-only command with P6 prefix (one passed,3.6s). Other observations
remain valid; guarded fresh preparation retried after these terminal results.
