# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/src/DiffLineNumber.tsx` | changed path |
| `DiffLineNumber.tsx` | basename of `dashboard/src/DiffLineNumber.tsx` |
| `dashboard/src/StoryDiffNote.tsx` | changed path |
| `StoryDiffNote.tsx` | basename of `dashboard/src/StoryDiffNote.tsx` |
| `dashboard/src/StoryReviewBody.tsx` | changed path |
| `StoryReviewBody.tsx` | basename of `dashboard/src/StoryReviewBody.tsx` |
| `dashboard/src/StoryReviewComparison.tsx` | changed path |
| `StoryReviewComparison.tsx` | basename of `dashboard/src/StoryReviewComparison.tsx` |
| `dashboard/src/StoryReviewContextGap.tsx` | changed path |
| `StoryReviewContextGap.tsx` | basename of `dashboard/src/StoryReviewContextGap.tsx` |
| `dashboard/src/StoryReviewDiffLines.tsx` | changed path |
| `StoryReviewDiffLines.tsx` | basename of `dashboard/src/StoryReviewDiffLines.tsx` |
| `dashboard/src/StoryReviewFileDiff.tsx` | changed path |
| `StoryReviewFileDiff.tsx` | basename of `dashboard/src/StoryReviewFileDiff.tsx` |
| `dashboard/tests/storyReviewPages.ts` | changed path |
| `storyReviewPages.ts` | basename of `dashboard/tests/storyReviewPages.ts` |
| `dashboard/tests/support/storyNotesPage.ts` | changed path |
| `storyNotesPage.ts` | basename of `dashboard/tests/support/storyNotesPage.ts` |
| `comparisonWords` | supplied |
| `DiffLineMenu` | supplied |
| `useDiffStoryNote` | supplied |

## Scope

Whole checkout at `4298fddeb0c3`, including uncommitted and untracked files: 7016 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/src/DiffLineNumber.tsx`, `dashboard/src/StoryDiffNote.tsx`, `dashboard/src/StoryReviewBody.tsx`, `dashboard/src/StoryReviewComparison.tsx`, `dashboard/src/StoryReviewContextGap.tsx`, `dashboard/src/StoryReviewDiffLines.tsx`, `dashboard/src/StoryReviewFileDiff.tsx`, `dashboard/tests/storyReviewPages.ts`, `dashboard/tests/support/storyNotesPage.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/src/diff-line-number.css` | `DiffLineNumber.tsx` | 2: `` (`./DiffLineNumber.tsx`): digits stay outside copied code; the menu opens `` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/diffContextExpansion.ts` | `StoryReviewDiffLines.tsx` | 3: `` // (`./StoryReviewDiffLines.tsx`). Expansion is presentation state only. `` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/diffLineSide.ts` | `DiffLineNumber.tsx` | 2: `` // its line-number control uses (`./DiffLineNumber.tsx`). `` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/diffLineTokens.ts` | `StoryReviewFileDiff.tsx` | 1: `` // Syntax styling for a story-review file diff (`./StoryReviewFileDiff.tsx`): `` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/IntentFileReading.tsx` | `StoryReviewFileDiff.tsx` | 35: `import { FileDiff } from "./StoryReviewFileDiff.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/IntentSelectionReading.tsx` | `StoryDiffNote.tsx` | 12: `import { StoryNoteView } from "./StoryDiffNote.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/pageStoryReviews.ts` | `StoryReviewComparison.tsx` | 9: `import type { ShownComparison } from "./StoryReviewComparison.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/story-review-diff.css` | `StoryReviewFileDiff.tsx` | 1: `/* A reviewed file's diff (./StoryReviewFileDiff.tsx) in the story review` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/StoryAnchoredFollowUp.tsx` | `DiffLineNumber.tsx`, `StoryReviewFileDiff.tsx` | 7: `import type { DiffLineSide } from "./DiffLineNumber.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/storyComparisonShown.ts` | `StoryReviewFileDiff.tsx` | 1: `` // The comparison a story's diff reads (`./StoryReviewFileDiff.tsx`), as one `` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/StoryReview.tsx` | `StoryReviewBody.tsx`, `StoryReviewComparison.tsx` | 11: `import { ReviewBody } from "./StoryReviewBody.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/StoryReviewFeedback.tsx` | `StoryReviewComparison.tsx` | 7: `import type { ShownComparison } from "./StoryReviewComparison.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/StoryReviewFileHeader.tsx` | `StoryDiffNote.tsx`, `StoryReviewFileDiff.tsx`, `useDiffStoryNote` | 5: `import { useDiffStoryNote } from "./StoryDiffNote.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/StoryReviewMark.tsx` | `StoryReviewComparison.tsx` | 18: `import { type ShownComparison } from "./StoryReviewComparison.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/StoryReviewSnapshotView.tsx` | `StoryReviewFileDiff.tsx` | 10: `` // Selecting a file reads its diff (`./StoryReviewFileDiff.tsx`) from its `` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/unifiedDiff.ts` | `StoryReviewFileDiff.tsx` | 2: `` // (`./StoryReviewFileDiff.tsx`): its hunks and their lines, or that Git read `` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/useStoryReviewComparison.ts` | `StoryReviewComparison.tsx` | 7: `import type { ShownComparison } from "./StoryReviewComparison.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |
| `dashboard/src/useStoryReviewSelection.ts` | `StoryReviewComparison.tsx` | 9: `import type { ShownComparison } from "./StoryReviewComparison.tsx";` | run: complete frontend review and real review/Intent; syntax/line facts, comparison selection, menus, Follow up and diff lifecycle |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/frontend-tests/intent/intent-read-reuse-story.spec.ts` | `StoryReviewFileDiff.tsx` | 7: `// (../../src/StoryReviewFileDiff.tsx, ../../src/answerMemo.ts). Without a story:` | run: intent-read-reuse-story selected after broad real proof; shared Purpose diff rendering and reading reuse |
| `dashboard/frontend-tests/review/story-review-note-context.spec.ts` | `storyNotesPage.ts` | 12: `import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";` | run: frontend review/ + stories/story-notes; Landed facts, collection lifecycle, identity retention, refusals |
| `dashboard/frontend-tests/stories/story-notes-edit.spec.ts` | `storyNotesPage.ts` | 8: `import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";` | run: frontend review/ + stories/story-notes; Landed facts, collection lifecycle, identity retention, refusals |
| `dashboard/frontend-tests/stories/story-notes-retained.spec.ts` | `storyNotesPage.ts` | 10: `import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";` | run: frontend review/ + stories/story-notes; Landed facts, collection lifecycle, identity retention, refusals |
| `dashboard/frontend-tests/stories/story-notes-unreadable.spec.ts` | `storyNotesPage.ts` | 9: `import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";` | run: frontend review/ + stories/story-notes; Landed facts, collection lifecycle, identity retention, refusals |
| `dashboard/frontend-tests/stories/story-notes.spec.ts` | `storyNotesPage.ts` | 9: `import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";` | run: frontend review/ + stories/story-notes; Landed facts, collection lifecycle, identity retention, refusals |
| `dashboard/tests/fluent-side-panel-pilot.md` | `storyReviewPages.ts` | 24: `` `sidePanelFramePages.ts`, `storyReviewPages.ts`, `finalReportPages.ts` and `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `dashboard/tests/sidePanelFramePages.ts` | `storyReviewPages.ts` | 4: `// (./storyReviewPages.ts) or a Final report (./finalReportPages.ts), through` | reused: prior slice5 repair104 proof; only shared Notes helper fromLine gains explicit caller-supplied actions, its default and existing collection/frame methods unchanged |
| `dashboard/tests/sidePanelPages.ts` | `storyReviewPages.ts` | 8: `// review (./storyReviewPages.ts) and Final report (./finalReportPages.ts)` | reused: prior slice5 repair104 proof; only shared Notes helper fromLine gains explicit caller-supplied actions, its default and existing collection/frame methods unchanged |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/diffLineFollowUpPage.ts` | `DiffLineNumber.tsx` | 1: `` // Line-number menu on a Done story's DiffLines (`../../src/DiffLineNumber.tsx`): `` | run: whole E2E review/ + Intent Addnote/Followup; published and workspace lines, pane geometry, context reveal and existing launch wire |

### Journey or feature

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `e2e/intent/intent-story-add-note.spec.ts` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts` | 15: `import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";` | run: whole E2E review/ + Intent Addnote/Followup; published and workspace lines, pane geometry, context reveal and existing launch wire |
| `e2e/review/story-review-diff-add-note.spec.ts` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts` | 24: `import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";` | run: whole E2E review/ + Intent Addnote/Followup; published and workspace lines, pane geometry, context reveal and existing launch wire |
| `e2e/review/story-review-workspace-add-note.spec.ts` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts` | 14: `import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";` | run: whole E2E review/ + Intent Addnote/Followup; published and workspace lines, pane geometry, context reveal and existing launch wire |
| `e2e/stories/story-notes-failed-save.spec.ts` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts` | 13: `import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";` | reused: prior slice5 repair104 proof; only shared Notes helper fromLine gains explicit caller-supplied actions, its default and existing collection/frame methods unchanged |
| `e2e/stories/story-notes-persistence.spec.ts` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts` | 13: `import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";` | reused: prior slice5 repair104 proof; only shared Notes helper fromLine gains explicit caller-supplied actions, its default and existing collection/frame methods unchanged |

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/slice-plans/663-emphasize-changed-words-in-diff-lines/PLAN.md` | `StoryReviewContextGap.tsx`, `StoryReviewDiffLines.tsx` | 25: `` consumed by `StoryReviewDiffLines.tsx` and `StoryReviewContextGap.tsx` `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/663-intent-hint-language-for-story-review-diffs/PLAN.md` | `StoryReviewBody.tsx`, `StoryReviewFileDiff.tsx` | 54: `` (`diffLineTokens.ts` 40, `StoryReviewFileDiff.tsx` 159, `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/ci-43988422233-refactor.md` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts` | 7: `` \| `dashboard/tests/support/storyNotesPage.ts` \| changed path \| `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/ci-44004647060-consumers.md` | `dashboard/src/StoryDiffNote.tsx`, `StoryDiffNote.tsx`, `dashboard/src/StoryReviewFileDiff.tsx`, `StoryReviewFileDiff.tsx`, `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts`, `useDiffStoryNote` | 7: `` \| `dashboard/src/StoryDiffNote.tsx` \| changed path \| `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/ci-44004647060-proof.md` | `StoryDiffNote.tsx` | 9: `` Reproduced red: one failed, one passed (7.0s). `StoryDiffNote.tsx` now keeps `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/existing-solution.md` | `DiffLineNumber.tsx`, `StoryReviewContextGap.tsx`, `dashboard/src/StoryReviewDiffLines.tsx`, `StoryReviewDiffLines.tsx`, `StoryReviewFileDiff.tsx` | 36: `` `DiffLineNumber.tsx` is the one line menu; `StoryReviewFileDiff.tsx` decides `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/proof-map.md` | `StoryReviewFileDiff.tsx` | 33: `` \| Giving every story review's line numbers the menu changes which existing review and Intent proofs \| Slice 6's change to `canLineFollow` \| 2026-11-17, this wo… `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers-1.md` | `dashboard/src/DiffLineNumber.tsx`, `DiffLineNumber.tsx`, `dashboard/src/StoryReviewContextGap.tsx`, `StoryReviewContextGap.tsx`, `dashboard/src/StoryReviewDiffLines.tsx`, `StoryReviewDiffLines.tsx`, `dashboard/src/StoryReviewFileDiff.tsx`, `StoryReviewFileDiff.tsx` | 31: `` \| `dashboard/src/DiffLineNumber.tsx` \| `onClose` \| 18: `onClose,` \| excluded: generic local symbol/text collision (onClose, subscribe, holdNext, AnswerHold, ex… `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers.md` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts` | 35: `` \| `dashboard/tests/support/storyNotesPage.ts` \| changed path \| `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-refactor.md` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts` | 75: `` \| `dashboard/tests/support/storyNotesPage.ts` \| `storyNotesPage` \| 3: `export function storyNotesPage(page: Page) {` \| run: F/E exercise these focused object/s… `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-repair-refactor.md` | `storyNotesPage.ts` | 61: `\| Every card's Notes, composer/list/count, blank rejection, captured POST, ordering, other-story isolation, focus and single announcement; real built frontend …` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-3-refactor.md` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts` | 3: `` Installed command: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/capture-and-edit-sto… `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-5-refactor.md` | `dashboard/src/StoryDiffNote.tsx`, `StoryDiffNote.tsx`, `dashboard/src/StoryReviewFileDiff.tsx`, `StoryReviewFileDiff.tsx`, `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts`, `useDiffStoryNote` | 7: `` \| `dashboard/src/StoryDiffNote.tsx` \| changed path \| `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `dashboard/AGENT-LAUNCH-REVIEW.md` | `DiffLineNumber.tsx`, `StoryReviewDiffLines.tsx` | 144: `` (`src/DiffLineNumber.tsx`). Binary and `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `dashboard/STORY-REVIEW-FILES.md` | `DiffLineNumber.tsx`, `StoryReviewDiffLines.tsx` | 37: `` (`src/DiffLineNumber.tsx`, `src/StoryReviewDiffLines.tsx`). A diff's code `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `dashboard/STORY-REVIEW-MARKS.md` | `StoryReviewComparison.tsx` | 52: `` (`src/StoryReviewComparison.tsx`); while all changes are shown, the `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |
| `docs/maintainer/project-maintenance-findings.md` | `dashboard/src/StoryReviewFileDiff.tsx`, `StoryReviewFileDiff.tsx` | 87: `` - Evidence: coordinator transcript `1cd76bae-22c3-404c-b849-2df63d24fb85` L56–L58 — “Fixing the TypeScript exactOptionalPropertyTypes error that blocked the co… `` | excluded: guidance, design or retained history; no runtime consumer; maintained STORY-NOTES updated separately |

## Setup and assertion purpose mapping

- Real Taken setup: story-review-workspace-add-note.spec.ts writes a 160-line trunk file, publishes a declared Take via origin.publishTake, commits new54 in that Taken workspace, and keeps its launch via storyALaunch/onStoryBranch. openReview reads the real server/Git comparison. fromFile and fromLine([Add note]) observe availability, composer context, successful close and one announcement; card readback observes stored line text and comparison.
- Retention setup: story-notes-retained.spec.ts saves through the built frontend with explicit machine/notes substitutes. Replaces the first launch with a new session of the same identity, reloads and reads the note. Removes the identity from active backlog, publishes its Done record, answers an empty machine list and reloads. Done card count/list and exact captured POST observe retention with no launch/workspace record. Persistence itself remains covered by real store/restart proof from slice2.
- Session exclusion: recently-done-ad-hoc-review.spec.ts builds a standalone landed ad hoc session and explicit file answer. Its real rendered diff is observed by StoryReview.expectNoLineFollowUp and new expectNoNoteActions, proving no line controls and no file Add note.
- Existing context expansion: story-review-diff-context.spec.ts uses the same real workspace/context setup; fully revealed gaps now assert zero preceding/following controls through contextExpansion, preserving the 66-line/EOF/uniqueness/content/scroll observations while line-number actions are allowed.
- Shared DOM and context consumers: complete frontend review/ and real review/ exercise appearance, syntax arrival, reveal/scroll, line menus, navigation, selection, Refresh, commit ranges, landed/completion snapshots and Follow up. Intent Addnote and Followup exercise both shared diff owners from Changed tests. The unaffected note store/API and wire contracts reuse earlier server proof.
- No actual dictation is claimed; slice8 owns it. This pass changes note eligibility and workspace context, not storage or announcement ownership.

Terminal proof: frontend review/+stories/story-notes+ad hoc review passed25 (23.3s); frontend Intent reuse passed1 (3.3s). Initial real review/+Intent notes/Followup passed102 and failed the phone geometry invariant; see the touch consumer record for the repair and renewed5+7 observations. Workspace exact endpoints now compare composer and saved context to the real snapshot baseline/tree, not only a hash-shaped regular expression.
