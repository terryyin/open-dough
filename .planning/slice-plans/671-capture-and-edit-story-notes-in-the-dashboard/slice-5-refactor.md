# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/src/StoryDiffNote.tsx` | changed path |
| `StoryDiffNote.tsx` | basename of `dashboard/src/StoryDiffNote.tsx` |
| `dashboard/src/followUpContext.ts` | changed path |
| `followUpContext.ts` | basename of `dashboard/src/followUpContext.ts` |
| `fileComparisonName` | supplied |
| `fileContextItems` | supplied |
| `fileStoryContextOf` | supplied |
| `fileFollowUpOf` | supplied |
| `expectComposerContext` | supplied |
| `expectEntryContext` | supplied |
| `storyContext` | supplied |
| `followUpContextText` | supplied |

## Scope

Whole checkout at `56c456a21f7c`, including uncommitted and untracked files: 7017 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/src/StoryDiffNote.tsx`, `dashboard/src/followUpContext.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.agents/skills/dough-product-backlog/scripts/product-backlog-home-reader.mjs` | `storyContext` | 127: `export function storyContextLines(home) {` |excluded: backlog story-context reader is an unrelated name match |
| `.agents/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs` | `storyContext` | 15: `storyContextLines,` |excluded: backlog story-context reader is an unrelated name match |
| `.claude/skills/dough-product-backlog/scripts/product-backlog-home-reader.mjs` | `storyContext` | 127: `export function storyContextLines(home) {` |excluded: backlog story-context reader is an unrelated name match |
| `.claude/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs` | `storyContext` | 15: `storyContextLines,` |excluded: backlog story-context reader is an unrelated name match |
| `.planning/done/SEED-273_follow-up-from-done.json` | `storyContext` | 11: `"report": "## Dough Intent Coverage: Caught\n\n- **Story and revision:** SEED-273#follow-up-from-done (.planning/seeds/SEED-273-follow-up-from-done.md), plan 5…` |excluded: historical/guidance reference does not execute or observe changed comparison naming |
| `.planning/done/SEED-353_declare-git-test-state-through-makeme.json` | `dashboard/src/followUpContext.ts`, `followUpContext.ts`, `fileContextItems` | 11: `"report": "Dough Intent Coverage — SEED-353#declare-git-test-state-through-makeme (plan 642), revision cc9f99288e51ca62dc4cc1a217c0919ddce1e6c3\n\nVerdict: Cau…` |excluded: historical/guidance reference does not execute or observe changed comparison naming |
| `dashboard/server/followUpAdmission.ts` | `followUpContext.ts`, `storyContext`, `followUpContextText` | 11: `followUpContextText,` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/server/followUpFileAdmission.ts` | `followUpContext.ts` | 6: `import type { FollowUpFileFacts } from "../src/followUpContext.ts";` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/server/unattachedInput.ts` | `followUpContext.ts` | 6: `` // A follow-up's context (`../src/followUpContext.ts`), resolved at admission `` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/src/FollowUp.tsx` | `followUpContext.ts`, `storyContext` | 5: `` // will send with the request (`./followUpContext.ts`). The source stays as it `` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/src/followUpRequest.ts` | `followUpContext.ts` | 2: `` // done (`./followUpContext.ts` composes the context): the source it follows `` |excluded: unchanged request schema/type; typecheck passed |
| `dashboard/src/FollowUpSubject.tsx` | `followUpContext.ts` | 3: `` // context the server will send with the request (`./followUpContext.ts`): `` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/src/intentScopeHistoryContext.ts` | `storyContext` | 12: `export type ScopeHistoryContext = {` |excluded: timing-history context is a different concept; no comparison formatter call |
| `dashboard/src/IntentScopePriorBuildReference.tsx` | `storyContext` | 10: `type ScopeHistoryContext,` |excluded: timing-history context is a different concept; no comparison formatter call |
| `dashboard/src/IntentScopeTimingHistory.tsx` | `storyContext` | 18: `scopeHistoryContextOf,` |excluded: timing-history context is a different concept; no comparison formatter call |
| `dashboard/src/IntentScopeTimingHistoryUnits.tsx` | `storyContext` | 18: `type ScopeHistoryContext,` |excluded: timing-history context is a different concept; no comparison formatter call |
| `dashboard/src/IntentSelectionReading.tsx` | `StoryDiffNote.tsx` | 12: `import { StoryNoteView } from "./StoryDiffNote.tsx";` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/src/StartSession.tsx` | `followUpContext.ts` | 30: `` // context the server will send with the request (`./followUpContext.ts`). `` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/src/StoryAnchoredFollowUp.tsx` | `followUpContext.ts` | 8: `import type { FollowUpFileFacts } from "./followUpContext.ts";` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/src/StoryReviewFileDiff.tsx` | `StoryDiffNote.tsx` | 12: `import { useDiffStoryNote } from "./StoryDiffNote.tsx";` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/src/StoryReviewFileHeader.tsx` | `StoryDiffNote.tsx` | 5: `import { useDiffStoryNote } from "./StoryDiffNote.tsx";` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `Distribution/src/skills/dough-product-backlog/scripts/product-backlog-home-reader.mjs` | `storyContext` | 127: `export function storyContextLines(home) {` |excluded: backlog story-context reader is an unrelated name match |
| `Distribution/src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs` | `storyContext` | 15: `storyContextLines,` |excluded: backlog story-context reader is an unrelated name match |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/backend-tests/launches/agent-launch-follow-up-codex.spec.ts` | `storyContext` | 25: `storyContextOf,` |excluded: story/session-only context has no file and bypasses fileContextItems |
| `dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts` | `fileFollowUpOf` | 14: `fileFollowUpOf,` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/backend-tests/launches/agent-launch-follow-up-file.spec.ts` | `fileStoryContextOf`, `fileFollowUpOf`, `storyContext` | 15: `fileFollowUpOf,` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/backend-tests/launches/agent-launch-follow-up-story.spec.ts` | `storyContext` | 24: `storyContextOf,` |excluded: story/session-only context has no file and bypasses fileContextItems |
| `dashboard/frontend-tests/review/story-review-note-context.spec.ts` | `expectComposerContext`, `expectEntryContext` | 30: `` await notes.expectComposerContext([storyA.title, storyA.identity, "Review changes", `${oldPath} → ${path}`, comparison]); `` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/frontend-tests/stories/story-notes-edit.spec.ts` | `expectComposerContext`, `expectEntryContext` | 52: `await notes.expectComposerContext(contextWords);` |reused: accepted frontend23; existing stored-context edit/list does not call comparison naming |
| `dashboard/frontend-tests/stories/story-notes.spec.ts` | `expectEntryContext` | 69: `` await notes.expectEntryContext(0, `${readyStory} · ${readyIdentity}`); `` |reused: accepted frontend23; existing stored-context edit/list does not call comparison naming |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/followUpCompletedFile.ts` | `followUpContext.ts`, `fileStoryContextOf`, `fileFollowUpOf`, `storyContext`, `followUpContextText` | 8: `import type { FollowUpFileFacts } from "../../src/followUpContext.ts";` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `dashboard/tests/support/followUpSources.ts` | `followUpContext.ts` | 3: `` // (`../../src/followUpContext.ts`), spelled out for black-box assertions. `` |excluded: story/session-only context has no file and bypasses fileContextItems |
| `dashboard/tests/support/followUpStories.ts` | `followUpContext.ts`, `storyContext` | 4: `` // session receives for one (`../../src/followUpContext.ts`), spelled out for `` |excluded: story/session-only context has no file and bypasses fileContextItems |
| `dashboard/tests/support/storyNotesPage.ts` | `expectComposerContext`, `expectEntryContext` | 88: `expectComposerContext: async (texts: readonly (string \| RegExp)[]) => {` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `Distribution/tests/support/followUpFileTestData.mjs` | `dashboard/src/followUpContext.ts`, `followUpContext.ts`, `fileFollowUpOf` | 3: `` // request (`fileFollowUpOf` sends it): a path, and a line and side, on the `` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |

### Journey or feature

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `e2e/intent/intent-story-add-note.spec.ts` | `expectComposerContext`, `expectEntryContext` | 19: `await notes.expectComposerContext(["Intent → Changed tests", "dashboard/tests/a.spec.ts", "Published completion", "completed"]);` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `e2e/review/story-review-diff-add-note.spec.ts` | `expectComposerContext`, `expectEntryContext` | 36: `await notes.expectComposerContext(["Story A", "Review changes", expandContextFile, /Published completion [a-f0-9]{40} → [a-f0-9]{40}/]);` |run: focused E2E6 + Landed frontend1 + backend9; concrete observations in handoff |
| `e2e/stories/recently-done-follow-up.spec.ts` | `storyContext` | 38: `storyContextOf,` |excluded: story/session-only context has no file and bypasses fileContextItems |

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers.md` | `expectEntryContext` | 119: `` \| `expectEntryContext` \| declared in `dashboard/tests/support/storyNotesPage.ts` \| `` |excluded: historical/guidance reference does not execute or observe changed comparison naming |
| `dashboard/LAUNCH-FOLLOW-UP.md` | `followUpContext.ts` | 23: `` `src/followUpContext.ts`). A done story's comes first: when it was completed `` |excluded: historical/guidance reference does not execute or observe changed comparison naming |
| `docs/maintainer/findings/ODF-499.md` | `storyContext` | 22: `` - Evidence: source-review commitment H1.1 was recorded `observed` at slice 3 on "expectScopeReadout uses the compactReadout lines that intent-ci-done-glance.sp… `` |excluded: historical/guidance reference does not execute or observe changed comparison naming |
