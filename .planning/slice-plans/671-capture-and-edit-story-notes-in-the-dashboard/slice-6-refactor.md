# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/frontend-tests/stories/story-notes-retained.spec.ts` | changed path |
| `story-notes-retained.spec.ts` | basename of `dashboard/frontend-tests/stories/story-notes-retained.spec.ts` |
| `dashboard/src/StoryAnchoredFollowUp.tsx` | changed path |
| `StoryAnchoredFollowUp.tsx` | basename of `dashboard/src/StoryAnchoredFollowUp.tsx` |
| `dashboard/src/StoryDiffNote.tsx` | changed path |
| `StoryDiffNote.tsx` | basename of `dashboard/src/StoryDiffNote.tsx` |
| `dashboard/src/StoryReviewFileDiff.tsx` | changed path |
| `StoryReviewFileDiff.tsx` | basename of `dashboard/src/StoryReviewFileDiff.tsx` |
| `dashboard/src/reviewedFileContext.ts` | changed path |
| `reviewedFileContext.ts` | basename of `dashboard/src/reviewedFileContext.ts` |
| `reviewedComparison` | supplied |
| `reviewedFilePaths` | supplied |
| `fileFollowUpParts` | supplied |
| `file.kind === "renamed"` | supplied |

## Scope

Whole checkout at `4298fddeb0c3`, including uncommitted and untracked files: 7024 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/frontend-tests/stories/story-notes-retained.spec.ts`, `dashboard/src/StoryAnchoredFollowUp.tsx`, `dashboard/src/StoryDiffNote.tsx`, `dashboard/src/StoryReviewFileDiff.tsx`, `dashboard/src/reviewedFileContext.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/server/storyReviewComparison.ts` | `file.kind === "renamed"` | 86: `paths.has(file.path) \|\| (file.kind === "renamed" && paths.has(file.oldPath));` |run/reused: real review rename and historical file reads consume unchanged wire fields; prior independent admission/refusal proof retained, no server helper reused into production UI |
| `dashboard/server/storyReviewHistoricalFileAdmission.ts` | `file.kind === "renamed"` | 61: `(file.kind === "renamed" ? file.oldPath === oldPath : oldPath === undefined)` |run/reused: real review rename and historical file reads consume unchanged wire fields; prior independent admission/refusal proof retained, no server helper reused into production UI |
| `dashboard/src/diffLineTokens.ts` | `StoryReviewFileDiff.tsx` | 1: `` // Syntax styling for a story-review file diff (`./StoryReviewFileDiff.tsx`): `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/doneStoryFollowUp.ts` | `StoryAnchoredFollowUp.tsx` | 3: `` // Review changes and Intent both reach it here (`./StoryAnchoredFollowUp.tsx`) `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/FollowUp.tsx` | `StoryAnchoredFollowUp.tsx` | 8: `` // (`./StoryAnchoredFollowUp.tsx`). `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/IntentFileReading.tsx` | `StoryReviewFileDiff.tsx` | 35: `import { FileDiff } from "./StoryReviewFileDiff.tsx";` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/IntentSelectionReading.tsx` | `StoryDiffNote.tsx` | 12: `import { StoryNoteView } from "./StoryDiffNote.tsx";` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/pageLaunches.ts` | `StoryAnchoredFollowUp.tsx` | 4: `` // (`./StoryAnchoredFollowUp.tsx`). `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/story-review-diff.css` | `StoryReviewFileDiff.tsx` | 1: `/* A reviewed file's diff (./StoryReviewFileDiff.tsx) in the story review` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/storyComparisonShown.ts` | `StoryReviewFileDiff.tsx` | 1: `` // The comparison a story's diff reads (`./StoryReviewFileDiff.tsx`), as one `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/StoryReviewBody.tsx` | `StoryDiffNote.tsx` | 3: `import { StoryNoteComparison } from "./StoryDiffNote.tsx";` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/StoryReviewFileHeader.tsx` | `StoryAnchoredFollowUp.tsx`, `StoryDiffNote.tsx`, `StoryReviewFileDiff.tsx`, `file.kind === "renamed"` | 3: `` // landed run, Follow up beside that path (`./StoryAnchoredFollowUp.tsx`). `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/StoryReviewFileRow.tsx` | `file.kind === "renamed"` | 23: `` file.kind === "renamed" ? `${file.oldPath} → ${file.path}` : file.path `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/StoryReviewSnapshotView.tsx` | `StoryReviewFileDiff.tsx` | 10: `` // Selecting a file reads its diff (`./StoryReviewFileDiff.tsx`) from its `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/src/unifiedDiff.ts` | `StoryReviewFileDiff.tsx` | 2: `` // (`./StoryReviewFileDiff.tsx`): its hunks and their lines, or that Git read `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/backend-tests/review/story-review-file-text-admission.spec.ts` | `file.kind === "renamed"` | 45: `...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),` |reused: independent request/expected-answer construction and server contract unchanged; earlier backend/admission proof remains applicable; current UI producer projection renewed in real review and Landed frontend case |
| `dashboard/frontend-tests/intent/intent-read-reuse-story.spec.ts` | `StoryReviewFileDiff.tsx` | 7: `// (../../src/StoryReviewFileDiff.tsx, ../../src/answerMemo.ts). Without a story:` |run: final frontend2; unchanged UI/memo contract, actual changed-file read counted once at spec48 |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/adHocReview.ts` | `file.kind === "renamed"` | 129: `...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),` |reused: independent request/expected-answer construction and server contract unchanged; earlier backend/admission proof remains applicable; current UI producer projection renewed in real review and Landed frontend case |
| `dashboard/tests/support/adHocReviewFileCases.ts` | `file.kind === "renamed"` | 42: `const renamed = answer.files.find((file) => file.kind === "renamed");` |reused: independent request/expected-answer construction and server contract unchanged; earlier backend/admission proof remains applicable; current UI producer projection renewed in real review and Landed frontend case |
| `dashboard/tests/support/fileFollowUpPage.ts` | `StoryAnchoredFollowUp.tsx` | 2: `` // Purpose (`../../src/StoryAnchoredFollowUp.tsx`): the control beside the file path, and `` |run: frontend review15 and real review/Intent103; shared path/provenance facts, actual file reads, note save/context and Follow up first input; purpose mapping below |
| `dashboard/tests/support/followUpCompletedFile.ts` | `file.kind === "renamed"` | 142: `...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),` |reused: independent request/expected-answer construction and server contract unchanged; earlier backend/admission proof remains applicable; current UI producer projection renewed in real review and Landed frontend case |

### Journey or feature

none found

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/slice-plans/663-intent-hint-language-for-story-review-diffs/PLAN.md` | `StoryReviewFileDiff.tsx` | 54: `` (`diffLineTokens.ts` 40, `StoryReviewFileDiff.tsx` 159, `` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/ci-44004647060-consumers.md` | `dashboard/src/StoryDiffNote.tsx`, `StoryDiffNote.tsx`, `dashboard/src/StoryReviewFileDiff.tsx`, `StoryReviewFileDiff.tsx` | 7: `` \| `dashboard/src/StoryDiffNote.tsx` \| changed path \| `` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/ci-44004647060-proof.md` | `StoryDiffNote.tsx` | 9: `` Reproduced red: one failed, one passed (7.0s). `StoryDiffNote.tsx` now keeps `` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/existing-solution.md` | `StoryAnchoredFollowUp.tsx`, `StoryReviewFileDiff.tsx`, `fileFollowUpParts` | 36: `` `DiffLineNumber.tsx` is the one line menu; `StoryReviewFileDiff.tsx` decides `` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/PLAN.md` | `fileFollowUpParts` | 145: `` for the file. Context from `fileFollowUpParts`. `` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/proof-map.md` | `StoryReviewFileDiff.tsx` | 33: `` \| Giving every story review's line numbers the menu changes which existing review and Intent proofs \| Slice 6's change to `canLineFollow` \| 2026-11-17, this wo… `` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers-1.md` | `dashboard/src/StoryAnchoredFollowUp.tsx`, `StoryAnchoredFollowUp.tsx`, `dashboard/src/StoryReviewFileDiff.tsx`, `StoryReviewFileDiff.tsx` | 48: `` \| `dashboard/src/StoryAnchoredFollowUp.tsx` \| `onClose` \| 62: `onClosed,` \| excluded: generic local symbol/text collision (onClose, subscribe, holdNext, Answer… `` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-5-refactor.md` | `dashboard/src/StoryAnchoredFollowUp.tsx`, `StoryAnchoredFollowUp.tsx`, `dashboard/src/StoryDiffNote.tsx`, `StoryDiffNote.tsx`, `dashboard/src/StoryReviewFileDiff.tsx`, `StoryReviewFileDiff.tsx` | 7: `` \| `dashboard/src/StoryDiffNote.tsx` \| changed path \| `` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-6-consumers.md` | `dashboard/frontend-tests/stories/story-notes-retained.spec.ts`, `story-notes-retained.spec.ts`, `dashboard/src/StoryAnchoredFollowUp.tsx`, `StoryAnchoredFollowUp.tsx`, `dashboard/src/StoryDiffNote.tsx`, `StoryDiffNote.tsx`, `dashboard/src/StoryReviewFileDiff.tsx`, `StoryReviewFileDiff.tsx` | 9: `` \| `dashboard/src/StoryDiffNote.tsx` \| changed path \| `` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/source-review.md` | `dashboard/frontend-tests/stories/story-notes-retained.spec.ts`, `story-notes-retained.spec.ts` | 36: `\| 4 \| Notes survive new launches. \| slice 6 \| observed: dashboard/frontend-tests/stories/story-notes-retained.spec.ts: same note read after replacing the launc…` |excluded: planning or maintained narrative; no executable consumer of these helpers |
| `docs/maintainer/project-maintenance-findings.md` | `dashboard/src/StoryReviewFileDiff.tsx`, `StoryReviewFileDiff.tsx` | 87: `` - Evidence: coordinator transcript `1cd76bae-22c3-404c-b849-2df63d24fb85` L56–L58 — “Fixing the TypeScript exactOptionalPropertyTypes error that blocked the co… `` |excluded: planning or maintained narrative; no executable consumer of these helpers |

## Refactor purpose and inspected proof

The new reviewedFileContext owner supplies historical comparison kind/id and
renamed-file path facts to StoryDiffNote, StoryAnchoredFollowUp and the
StoryReviewFileDiff read query. No admission, persistence, line-menu, channel,
CSS or comparison selection rule changed. Independent backend request/expected
answer builders intentionally retain their own projection as contract oracles.

- Path and provenance: real e2e/review/story-review-workspace-add-note.spec.ts
  starts from a real Taken workspace and reads the actual snapshot; file/line
  save contexts match exact trees and line text. Published file/new54/old54/
  revealed40 capture is observed by story-review-diff-add-note.spec.ts.
- Landed rename: frontend review/story-review-note-context.spec.ts21 uses
  explicit external service answers with the real built UI; exact captured
  add request at70 has oldPath, path, Landed name and both endpoints. The
  saved entry is reopened and inspected. No frontend fixture supplies that
  capture behavior. Real rename file reads also run in review/commit-renames.
- Existing Follow up: e2e/review/story-review-follow-up.spec.ts46 reads real
  published data and captures first input after Start; :106 observes workspace
  exclusion then Landed dialog and retained terminal behavior. Intent old-line
  case :68 captures first input with path, Published comparison, line85/old.
- Read reuse: frontend intent/intent-read-reuse-story.spec.ts48 counts real
  UI-issued diff reads against the external substitute and checks no published
  text read. The facts extraction preserves this query contract.
- Lifecycle setup: story-notes-retained.spec.ts now uses existing MakeMe
  repository completion to render an empty active backlog, rather than
  removing matching Markdown lines. Notes are still saved/read after new
  launch, then read with count from Done and no machine records. Removed
  only the assertion restating the empty fixture input; observable note and
  captured add-request assertions remain.

Incoming geometry/menu/CSS and other lifecycle proofs were initially retained
because these refactor edits do not change those rules. Full real review
renewal also reobserves their behavior; no required observation is deferred.
The raw whole-change discovery remains /tmp/refactor-6-consumers.md; its generic
backlog/plan/history matches are records-only and do not extend product effects.

## Terminal verification

All browser commands used `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR
-u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test`, then:

| Remaining arguments | Terminal result |
| --- | --- |
| --config dashboard/frontend.playwright.config.ts --reporter=list review/ stories/story-notes-retained.spec.ts | 15 passed (15.7s) |
| --config dashboard/frontend.playwright.config.ts --reporter=list stories/story-notes-retained.spec.ts intent/intent-read-reuse-story.spec.ts | 2 passed (6.3s), final fixture-only assertion removal and Intent read reuse |
| --config e2e/playwright.config.ts --reporter=list review/ intent/intent-story-add-note.spec.ts intent/intent-story-follow-up.spec.ts | 103 passed (3.1m), including the repaired original phone landscape invariant |

`npm run typecheck:dashboard` and `git diff --check` passed. Actual host AC,
16 cores/48GiB as supplied, load3.28 confirmed before commands. Default two
workers per browser command. The final two-case frontend command overlapped
briefly with E2E; all commands terminal, no failure or resource issue observed.
No watches started. No deferred observation, file rename or deletion. Shared
helpers are16lines; all checked changed files are250lines or fewer. ADR0002/
0008 unchanged: these are shared UI facts with no new durable representation.
