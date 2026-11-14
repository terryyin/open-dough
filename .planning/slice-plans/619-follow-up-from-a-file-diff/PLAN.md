# Start a follow-up session from a Done story's file diff

**Source:** [refined story](../../seeds/SEED-347-follow-up-from-a-file-diff.md#start-follow-up-from-a-file-diff)
**Source review:** [source-review.md](./source-review.md)
**Identity:** SEED-347#start-follow-up-from-a-file-diff

## Goal and scope

A developer reviewing a Done story's changes in **Review changes**, or a changed
test in its **Intent → Changed tests**, starts a follow-up session from a file
header or a line number. The session receives the story context, the file, the
comparison the diff shows, an optional line and side, and any instruction. The
seed's scope, required restriction and key examples are the source of truth.

Material exclusions: active (Taken) stories' diffs, and a Done story's review
while it shows its retained workspace snapshot. Terry chose Done stories only on
2026-11-14. Line ranges, **Add note** and **Attach story notes** (SEED-348) are
also excluded. The card's own Follow up and Open terminal rule stays unchanged.

## Existing solution and architecture

PFE found the owners to extend, following the
[file-anchored follow-up direction](../../NORTH-STAR.md#follow-ups-name-what-the-developer-was-shown).
Do not add a second launch kind or dialog.

- **Follow-up source:** `dashboard/src/followUpRequest.ts` (`followUp.story`,
  `followUpSourceKey`), `src/launchRequest.ts` (`sameLaunch`) and
  `src/pageAttempt.ts` (`adHocKey`). Add the optional file anchor to the story
  source and to its key. Anchors that differ by file, line or side are then
  separate launches and page attempts.
- **Admission:** `dashboard/server/followUpAdmission.ts` and `followUpStory.ts`
  resolve the story context. `server/storyReviewAdmission.ts`
  (`admitReviewedFile`, 234 lines) validates a historical file against a
  Published completion (`completion`, re-read through `publishedStoryReview`
  against already fetched history, with each file's
  `includesTrunkFrom ?? baseline` as its from). `storyReviewRunAdmission.ts`
  (`reviewedRunFile`) does the same for a landed run (`reference`). Today
  `admitReviewedFile` reads its fields from a URL. Move that check into a
  field-based module so the file endpoints and follow-up admission share one
  rule. That also keeps `storyReviewAdmission.ts` under the file-size check.
  Validate a line against the side's file text, read by the same rule as the
  file-text endpoint.
- **Context:** `src/followUpContext.ts` (`followUpContextText`,
  `storyContext`) composes the text. It adds the anchor's lines after the
  story's own, and the dialog's context list shows the same items.
- **Page:** `src/FollowUp.tsx` (`StoryFollowUp`) opens `StartSession` with the
  story, revision and sessions, gated by `offersFollowUp`. Anchored follow-ups
  skip that gate. Review (`StoryReviewSnapshotView.tsx`, 237 lines) and Intent
  (`IntentFileReading.tsx`, 241 lines) both render `FileDiff`
  (`StoryReviewFileDiff.tsx`). `FileDiff` has the anchor fields: `reviewed`
  (with `completion` or `reference`), `from`, `tree` and `file`. Line numbers
  are CSS `attr(data-old|data-new)` pseudo-content in `DiffLines` and
  `diffLineItems` (`StoryReviewContextGap.tsx`), with empty alternative text.
  Intent reads the done record through the same done-catalog revision
  (`useIntentStoryLens.ts`). Give both views one page-level way to reach the
  done story, revision and card sessions, rather than threading the card's
  props.
- **File size:** No expected edit is in a file already over 250 lines.
  `IntentFileReading.tsx` and `StoryReviewSnapshotView.tsx` are close, so place
  the header action in `FileDiff` or a shared file-header component rather than
  growing both views. The executing agent applies the
  ordinary post-change file-size check.

Accepted ADRs: [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
requires context from repository records and local operational evidence, with
server-held derivation. That fits: the page names only the anchor.
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps
**Follow up** as the product term. No conflict was found.

## Outside-in proof and decisive premises

Observed in this owned checkout at `c58d574ca`, 2026-11-14, after
`node scripts/setup-native.mjs npm` and `browser`:

| Premise and consuming operation | Observation |
| --- | --- |
| The page journeys for a Done story's published review, its Intent comparison and its card Follow up run here | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts e2e/review/story-review-completed.spec.ts e2e/stories/recently-done-follow-up.spec.ts e2e/intent/intent-story-completed.spec.ts --reporter=list` printed 3 passed (23.3 s). |
| The follow-up boundary inspects the composed first input and launch identity over a real origin | The same environment with `--config dashboard/backend.playwright.config.ts dashboard/backend-tests/launches/agent-launch-follow-up-story.spec.ts dashboard/backend-tests/launches/agent-launch-follow-up-identity.spec.ts` printed 11 passed (14.4 s). |
| The object IDs named in the context can be read from the session's checkout | A tree written through a temporary index in this linked worktree (`dbe5580…`) was read by `git -C <project> cat-file -p <tree>:zz-probe.txt` from the default checkout. Linked worktrees share one object store, so a tree written in the project folder can also be read from an isolated worktree. Unreferenced trees remain prunable by `git gc` (default two weeks). The context therefore also names the completion revision or landed pair, which are commits on origin. |
| Both views hold the anchor fields where the diff renders | `IntentFileReading.tsx:182` passes `story.shown.reviewed` to `FileDiff`. The review passes `shownComparison.reviewed` (`StoryReviewBody.tsx`). `FileDiff` receives each file's own `from`. |

No premise needs a paid, credentialed or developer-operated observation. The
fake `claude` stands in for the native session, as in the existing follow-up
journeys.

| Source example / promise | Owner | Required observation |
| --- | --- | --- |
| Header Follow up in Review changes sends story, file, comparison and instruction | Slices 2, 3 | Page journey on a Published completion, then the stored first input; boundary first-input order |
| Line Follow up in Intent → Changed tests, old side, blank instruction, terminal opens | Slices 2, 4 | Page journey through the line menu; first input names old line 85 |
| Rename names both paths and the line | Slice 2 | Boundary first input on a renamed file's new line |
| Two lines are two launches; repeating one resumes it | Slice 2 | Boundary identity: second line starts anew, same anchor and text resumes |
| Offered beside a card that offers Open terminal; not offered on a workspace snapshot | Slice 3 | Page journey with a reopenable session; snapshot comparison shows no header action |
| Landed-run comparison offers the same | Slices 2, 3 | Boundary admission with `reference`; header present on a landed run |
| Restriction: a file, line or side outside the comparison is refused, nothing starts; page context text still refused | Slice 2 | Boundary refusals with status and words, no launch record |
| Line menu by pointer, touch and keyboard; Escape or outside click returns focus; copy leaves numbers out; no Tab stop per line; revealed context lines work | Slice 4 | Integrated UI test beside `dashboard/tests/review/story-review-diff-context.spec.ts`, with a copy regression observed first |

## Ordered slices

### 1. One historical-file rule for review reads and follow-ups
Type: Structure
Status: done
Proof: Existing story-review file diff and file-text refusals and journeys stay green.

Move `admitReviewedFile`'s Published completion and landed-run file check into
a field-based module that returns the admitted repository and file. The file
diff and file-text endpoints call it unchanged. This enables Slice 2's anchor
admission without copying the completion and landed-run rules. Run the backend
specs that request those endpoints and `e2e/review/story-review-completed.spec.ts`.

Accepted proof (coordinator): field-based `admitHistoricalReviewedFile` in
`dashboard/server/storyReviewHistoricalFileAdmission.ts`; URL adapters in
`storyReviewAdmission.ts`; shared run helpers in `storyReviewRunAdmission.ts`.
`npm run typecheck:dashboard` pass; backend
`story-review-completed-file-admission`, `story-review-file-text-admission`
(3 passed) and `story-review-one-shot-admission` (1 passed); e2e
`story-review-completed.spec.ts` (1 passed). Source-review commitments for
slice 1: none. Learning: landed-run listing must share `queriedRun`'s helpers,
not re-list retained runs in the historical module.

### 2. A follow-up names a file and line, and the session receives them
Type: Behavior
Status: done
Proof: New `dashboard/backend-tests/launches/agent-launch-follow-up-file.spec.ts` over a real origin and the synthetic `claude`, plus the existing follow-up story, identity and boundary specs.

Precondition: a Done story's published done record and a Published completion
comparison, or a landed run. Trigger: a Start session request with
`followUp.story` and a file anchor. Result: admission validates the anchor
through Slice 1 and checks that the line exists on its side. The first input
holds the story's context block and the file block: path, old path, comparison
kind and revisions, and the line and side when given. The request follows.
Different anchors are separate launches. The same anchor and text resume the
kept start. Refusals for a file, line or side outside the comparison, and for
page context text, start nothing. Update `dashboard/LAUNCH-FOLLOW-UP.md` for
the anchor, admission and identity.

Accepted proof (coordinator): optional file anchor on `followUp.story`;
`admitHistoricalReviewedFile` + line check in `followUpFileAdmission.ts`;
context in `followUpContext.ts`; identity via `followUpSourceKey`. Focused
backend suite 32 passed including file + file-admission specs and
story/identity/boundary/matching-rules plus story-review path consumers;
`npm run typecheck:dashboard` pass. Source-review ids 2–5, 26, 28a–c, 29,
34–42, 54–55 observed on that suite.

### 3. Follow up a whole file from a Done story's diff
Type: Behavior
Status: planned
Proof: New `e2e/review/story-review-follow-up.spec.ts` page journey, plus an Intent assertion in a new `e2e/intent/intent-story-follow-up.spec.ts`.

A Done story's **Review changes**, on Published completion or a landed run,
shows **Follow up** beside the file path. In **Intent → Changed tests**, it
appears on a changed file's Purpose diff. Either opens the existing Start
session dialog with the story subject and the file's context lines. Start sends
the anchor. The stored first input holds the file context and the typed
instruction. The action appears when the card offers Open terminal, and is
absent on a workspace snapshot. Add the page-level done-story lookup used by
both views here. Update the review and Intent docs that describe the file
header.

### 4. Follow up one line from the line-number menu
Type: Behavior
Status: planned
Proof: New integrated UI spec in `dashboard/tests/review/` for the menu's interaction, and the Intent journey from Slice 3 extended to old line 85 with a blank start.

Before changing line numbers, add a copy regression: selecting diff lines
copies code without numbers. Then make line numbers in `DiffLines`, including
revealed context lines, open a menu. The menu names the line (“Old line 85”)
and offers **Follow up**, which opens the dialog with the line and side. Prove
pointer and keyboard opening, Escape and outside-click dismissal with focus
returned, no added Tab stop per line, and a touch tap on a phone-sized
viewport. The blank Intent follow-up opens its terminal and the first input
names old line 85. Update `dashboard/STORY-REVIEW-FILES.md` or the diff's
maintained doc for line numbers.

## Story obligations

### G1. Temporary design reference and beneficiary context
Reported: slice 1 — "The file follow-up and story notes mockup shows the file header, line-number menu and follow-up dialog."
Story clause: "The [file follow-up and story notes mockup](../mockups/story-review-and-notes.html) shows the file header, line-number menu and follow-up dialog."
Disposition: no user cost "Start a follow-up session directly from a Done story's diff.": design reference and beneficiary name the audience and mockup; they do not add a separate product outcome beyond the delivered follow-up.
Commitment: 7, 56

### G2. Continuing the earlier conversation is not this file follow-up
Reported: slice 1 — "Continuing the earlier conversation does not give the agent this file or line."
Story clause: "Continuing the earlier conversation does not give the agent this file or line."
Disposition: excluded "Continuing the earlier conversation does not give the agent this file or line."
Commitment: 32

### G3. Active (Taken) story diffs are deferred
Reported: slice 1 — "Follow up from an active (Taken) story's diff."
Story clause: "Follow up from an active (Taken) story's diff."
Disposition: excluded "Follow up from an active (Taken) story's diff."
Commitment: 43, 44, 45, 46

### G4. Retained workspace review is deferred
Reported: slice 1 — "The same applies to a Done story's review while it shows its retained workspace."
Story clause: "The same applies to a Done story's review while it shows its retained workspace."
Disposition: excluded "The same applies to a Done story's review while it shows its retained workspace."
Commitment: 47

### G5. Line ranges are deferred
Reported: slice 1 — "Line ranges or several selected lines."
Story clause: "Line ranges or several selected lines."
Disposition: excluded "Line ranges or several selected lines."
Commitment: 49

### G6. Add note and Attach story notes are deferred to SEED-348
Reported: slice 1 — "Add note and Attach story notes, owned by capture story notes and attach story notes."
Story clause: "**Add note** and **Attach story notes**, owned by [capture story notes](SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups) and [attach story notes](SEED-348-collect-notes-for-story-follow-ups.md#attach-story-notes-to-follow-ups)."
Disposition: excluded "**Add note** and **Attach story notes**, owned by [capture story notes](SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups) and [attach story notes](SEED-348-collect-notes-for-story-follow-ups.md#attach-story-notes-to-follow-ups)."
Commitment: 50a, 50b

## Current decisions, verification and concern review

- Execution started from established start `21421f790125c1165d36e0ef7fd2055f4bf3334f`
  (publisher `dashboard-territory.local-open-dough`, agent `viktor-chan`).
  Source review retained and linked; replanning permission preserved (allowed).
- The anchor names the comparison's revisions, not page text. Context
  validation reuses the history the review already fetched, with no fetch per
  follow-up.
- Local gate: focused specs per slice, as listed. Run the whole dashboard and
  e2e suites once before landing, under `caffeinate -s -i` on AC power, as
  [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
  requires.
- Failure policy: carry [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  as written. A failing or flaky test is a defect to fix. Reproducing it on main
  is attribution, not an exemption.
- At wrap-up, retire the North Star topic and, once SEED-348's stories no
  longer need it, the shared mockup, as the seed says.
- Slice-plan refinement was not needed: the four slices each own one proof
  loop, and the Structure slice directly enables Slice 2.
- No remaining slice-specific concern was identified in this review.
