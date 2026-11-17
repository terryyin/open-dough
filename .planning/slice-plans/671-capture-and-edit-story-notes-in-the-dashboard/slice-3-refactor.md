# Consumer trace

Installed command: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/capture-and-edit-story-notes-in-the-dashboard --path dashboard/src/storyNotes.ts --path dashboard/src/StoryNotesControl.tsx --path dashboard/tests/support/storyNotesPage.ts --path dashboard/frontend-tests/stories/story-notes-unreadable.spec.ts --path e2e/stories/story-notes-failed-save.spec.ts --term "The notes could not be read." --term expectNotSaved --term expectReadProblem --term expectProblem --term storyNotesPage --term storyNotesUnreadable --term installFrontendStoryNotes`.

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/frontend-tests/stories/story-notes-unreadable.spec.ts` | changed path |
| `story-notes-unreadable.spec.ts` | basename of `dashboard/frontend-tests/stories/story-notes-unreadable.spec.ts` |
| `dashboard/src/StoryNotesControl.tsx` | changed path |
| `StoryNotesControl.tsx` | basename of `dashboard/src/StoryNotesControl.tsx` |
| `dashboard/src/storyNotes.ts` | changed path |
| `storyNotes.ts` | basename of `dashboard/src/storyNotes.ts` |
| `dashboard/tests/support/storyNotesPage.ts` | changed path |
| `storyNotesPage.ts` | basename of `dashboard/tests/support/storyNotesPage.ts` |
| `e2e/stories/story-notes-failed-save.spec.ts` | changed path |
| `story-notes-failed-save.spec.ts` | basename of `e2e/stories/story-notes-failed-save.spec.ts` |
| `The notes could not be read.` | supplied |
| `expectNotSaved` | supplied |
| `expectReadProblem` | supplied |
| `expectProblem` | supplied |
| `storyNotesPage` | supplied |
| `storyNotesUnreadable` | supplied |
| `installFrontendStoryNotes` | supplied |

## Scope

Whole checkout at `2735be520d13`, including uncommitted and untracked files: 7000 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/frontend-tests/stories/story-notes-unreadable.spec.ts`, `dashboard/src/StoryNotesControl.tsx`, `dashboard/src/storyNotes.ts`, `dashboard/tests/support/storyNotesPage.ts`, `e2e/stories/story-notes-failed-save.spec.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/server/projectConfigurationBoundary.ts` | `storyNotes.ts` | 6: `import { answerStoryNotes } from "./storyNotes.ts";` | excluded X1: imports server/storyNotes.ts; the refactor changes only frontend wording ownership, not its endpoint, schema or store |
| `dashboard/src/App.tsx` | `storyNotes.ts` | 13: `import { StoryNotesOnPage, usePageStoryNotes } from "./storyNotes.ts";` | run F1: mounted notes frontend owner/card/substitute; five focused frontend notes cases preserve valid notes and observe unreadable card/dialog wording; T1 checks shared import contracts |
| `dashboard/src/DoneStoryCard.tsx` | `StoryNotesControl.tsx` | 36: `import { StoryNotes } from "./StoryNotesControl.tsx";` | run F1: mounted notes frontend owner/card/substitute; five focused frontend notes cases preserve valid notes and observe unreadable card/dialog wording; T1 checks shared import contracts |
| `dashboard/src/StoryCard.tsx` | `StoryNotesControl.tsx` | 39: `import { StoryNotes } from "./StoryNotesControl.tsx";` | run F1: mounted notes frontend owner/card/substitute; five focused frontend notes cases preserve valid notes and observe unreadable card/dialog wording; T1 checks shared import contracts |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/frontend-tests/stories/story-notes.spec.ts` | `storyNotes.ts`, `storyNotesPage.ts`, `storyNotesPage`, `installFrontendStoryNotes` | 8: `import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";` | run F1: mounted notes frontend owner/card/substitute; five focused frontend notes cases preserve valid notes and observe unreadable card/dialog wording; T1 checks shared import contracts |
| `dashboard/tests/agentRosterRecords.ts` | `expectProblem` | 15: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `dashboard/tests/dashboardPage.ts` | `expectProblem` | 164: `export async function expectProblemAndNoSnapshot(` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `dashboard/tests/limitedReadingJourney.ts` | `expectProblem` | 17: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `dashboard/tests/navigation/development-intent-frame.spec.ts` | `expectProblem` | 20: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `dashboard/tests/writing-journeys.md` | `expectProblem` | 22: `` `expectSettledPage`, `expectProblemAndNoSnapshot` (`dashboardPage.ts`) and `` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/frontendServiceSubstitutes.ts` | `storyNotes.ts`, `installFrontendStoryNotes` | 21: `import { installFrontendStoryNotes } from "./frontendStoryNotes.ts";` | run F1: mounted notes frontend owner/card/substitute; five focused frontend notes cases preserve valid notes and observe unreadable card/dialog wording; T1 checks shared import contracts |
| `dashboard/tests/support/frontendStoryNotes.ts` | `installFrontendStoryNotes` | 18: `export async function installFrontendStoryNotes(page: Page) {` | run F1: mounted notes frontend owner/card/substitute; five focused frontend notes cases preserve valid notes and observe unreadable card/dialog wording; T1 checks shared import contracts |

### Journey or feature

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `e2e/observation/limit-recovery-tabs.spec.ts` | `expectProblem` | 15: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `e2e/observation/limited-reading-membership.spec.ts` | `expectProblem` | 7: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `e2e/observation/project-read-recovery.spec.ts` | `expectProblem` | 21: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `e2e/observation/read-failure.spec.ts` | `expectProblem` | 9: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `e2e/observation/transient-read-exclusions.spec.ts` | `expectProblem` | 13: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `e2e/observation/transient-read-recovery.spec.ts` | `expectProblem` | 15: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `e2e/observation/transient-recovery-currentness.spec.ts` | `expectProblem` | 23: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `e2e/observation/transient-recovery-lifecycle.spec.ts` | `expectProblem` | 19: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `e2e/stories/agent-roster.spec.ts` | `expectProblem` | 11: `expectProblemAndNoSnapshot,` | excluded X2: expectProblem substring belongs to project snapshot/read-recovery observation, not storyNotesPage; no shared helper, request or DOM boundary changed |
| `e2e/stories/story-notes-persistence.spec.ts` | `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts`, `storyNotesPage` | 13: `import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";` | reused E2: inspected normal save/restart/list/count/context workflow; helper methods it calls and success behavior are unchanged, while F1 covers the touched frontend module and E1 covers renamed failure observations |

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/ci-43988422233-proof.md` | `storyNotesPage`, `installFrontendStoryNotes` | 6: `Terms: expectTabOrder, storyNotesControl, expectSnapshotButtons, expectScanToDetailAt420AndTwiceZoom, storyNotesPage, installFrontendStoryNotes, Inspect story,…` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/ci-43988422233-refactor.md` | `StoryNotesControl.tsx`, `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts`, `storyNotesPage`, `installFrontendStoryNotes` | 7: `` \| `dashboard/tests/support/storyNotesPage.ts` \| changed path \| `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/PLAN.md` | `storyNotes.ts`, `e2e/stories/story-notes-failed-save.spec.ts`, `story-notes-failed-save.spec.ts` | 67: `` `server/storyNotes.ts` store with `unreadable: "preserve"`; the endpoint in `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/proof-map.md` | `e2e/stories/story-notes-failed-save.spec.ts`, `story-notes-failed-save.spec.ts`, `The notes could not be read.` | 15: `` \| A save that could not be kept leaves the composer with its text and says so \| 3: new `e2e/stories/story-notes-failed-save.spec.ts` (read-only records directo… `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-1-consumers.md` | `storyNotes.ts` | 11: `` \| `dashboard/server/storyNotes.ts` \| changed path \| `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers-1.md` | `storyNotes.ts` | 18: `` \| `dashboard/server/projectConfigurationBoundary.ts` \| `storyNotes.ts`, `StoryNotes`, `storyNotesEndpoint`, `storyNotes`, `StoryNote` \| 5: `import { storyNotes… `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers-5.md` | `storyNotes.ts`, `installFrontendStoryNotes` | 32: `` \| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/PLAN.md` \| `execution-context.md`, `dashboard/STORY-NOTES.md`, `STORY-NOTES.md`, `da… `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers.md` | `dashboard/src/storyNotes.ts`, `storyNotes.ts`, `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts`, `storyNotesPage`, `installFrontendStoryNotes` | 25: `` \| `dashboard/src/StoryNotes.tsx` \| changed path \| `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-proof.md` | `StoryNotesControl.tsx`, `storyNotes.ts`, `storyNotesPage` | 12: `` stays empty. `storyNotesPage.expectSaved` asserts one status/announcement. `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-refactor.md` | `dashboard/src/storyNotes.ts`, `storyNotes.ts`, `dashboard/tests/support/storyNotesPage.ts`, `storyNotesPage.ts`, `storyNotesPage`, `installFrontendStoryNotes` | 9: `` \| `dashboard/src/storyNotes.ts` \| changed path \| `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-repair-refactor.md` | `StoryNotesControl.tsx`, `dashboard/src/storyNotes.ts`, `storyNotes.ts`, `storyNotesPage.ts`, `storyNotesPage` | 7: `` The incoming repair renames `dashboard/src/StoryNotes.tsx` to `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-3-proof.md` | `story-notes-failed-save.spec.ts`, `The notes could not be read.` | 12: `` - `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list st… `` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/source-review.md` | `dashboard/frontend-tests/stories/story-notes-unreadable.spec.ts`, `story-notes-unreadable.spec.ts`, `StoryNotesControl.tsx`, `storyNotes.ts`, `e2e/stories/story-notes-failed-save.spec.ts`, `story-notes-failed-save.spec.ts`, `The notes could not be read.`, `expectNotSaved`, `storyNotesPage` | 33: `\| 1 \| Notes are separate entries, each with its own context. \| slice 2 \| observed: dashboard/frontend-tests/stories/story-notes.spec.ts desktop/phone saved ent…` | reused R1: planning/proof history; same file paths and messages, runtime proof mapped below; current source-review helper name follows the renamed observer under root-owned record maintenance |
| `dashboard/STORY-NOTES.md` | `The notes could not be read.` | 23: `If the notes file cannot be read, cards say “The notes could not be read.”` | reused R2: maintained wording remains exactly the rendered text, and F1/E1 preserve its reported unreadable/refusal/retry behavior |

## Purpose and proof correspondence

F1 — Frontend notes owner, story cards, service substitute and dialog observers. Command: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list stories/story-notes`. Result: 5 passed (9.5s), default 2 workers. Inspected `dashboard/frontend-tests/stories/story-notes-unreadable.spec.ts:21-49`: existing note establishes prior count 1, substitute changes to unreadable, controlled clock advances one shared check interval, each Done/Taken/Backlog card has explicit read problem and no count, dialog shows exact problem, refused save preserves the exact draft/error. The two old observer names become one `expectProblem(message)` at `dashboard/tests/support/storyNotesPage.ts:59`; expected messages stay caller supplied, selector/assertion behavior unchanged. Existing `story-notes.spec.ts` exercises desktop/phone general notes, blank refusal, newest first, counts/context, stale read and original terminal/focus continuity. Setup provides only service answers, not rendered outcomes.

E1 — Real failed-save workflow. Command: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list stories/story-notes-failed-save.spec.ts`. Result: 1 passed (5.3s), 1 worker. Inspected `e2e/stories/story-notes-failed-save.spec.ts:26-72`: actual HOME records chmod 0555 causes refusal, exact draft/error and no file; restored 0755 retry lists saved note and clears composer/problem; aborted POST for next draft preserves original file bytes and exact draft/error; unroute retry lists both notes, next composer is empty, final count 2. The observer rename preserves the actual alert check; no scenario inputs or assertions were dropped.

E2 — Reused incoming accepted persistence result: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list stories/story-notes-persistence.spec.ts` — 1 passed (6.5s). Inspected phone save, server shutdown/restart using same machine HOME, desktop reload and note/count/context checks. This refactor changes neither called success helpers nor server persistence implementation. The original result remains current for that boundary.

T1 — `npm run typecheck:dashboard` checks new constant export/import and renamed helper contract; passed (exit 0). `git diff --check` passes. No generated output is affected.

R1/R2 — Original slice-3 consumer disposition record `/tmp/dough-slice3-consumers-complete.md` remains the incoming-effect record. This record extends it only for the refactor paths/removed names. Existing slice-1 real unreadable byte preservation/refusal, and CI-repair keyboard/layout/readiness observations retain their exact implementations and valid-notes setups: wording extraction does not change DOM, conditional rendering, values, opener class, tab order, endpoint, schema, physical store or success helpers. The focused changed-message/observer paths are observed freshly by F1/E1.

## Decision and limits

One read-only pass covered duplication, naming, shared knowledge, dead code, test boundaries and every changed-file size before edits. Two candidates: consolidate the unreadable message in existing frontend notes owner; consolidate identical dialog alert observers. Both belong to the existing frontend notes responsibility; tests follow that seam. No server/API/storage refactor, new responsibility, plan dispute or architectural exception. ADR 0002 cohesion/direct domain representation and ADR 0008 machine-local notes constraints remain preserved. Changed test-entry selector resolved MakeMe and page objects true for both new specs; existing builders and focused objects retained.

Host decision before tests: this macOS host awake on AC, 16 cores/48 GiB, load 10.25/6.77/6.67, about 2.0 GiB free plus 10 GiB inactive, no known competing owned heavy proof. Retain project default 2 workers for the five frontend cases, then one failed-save case sequentially under `caffeinate -s -i`; observed totals 9.5s and 5.3s validate bounded cost. No full-suite launch. Reconsider if contention, failures or workload changes. No deferred required product observation.

All located consumer rows are dispositioned: 36. Raw installed output remains at `/tmp/dough-slice3-refactor-consumer-trace.md`.

Root confirmed the active source-review promise 53 now names `storyNotesPage.expectProblem`; no old helper names remain in active production/test sources. Final `wc -l` check: all twelve incoming/refactor paths remain below 250 lines (largest PLAN 219, StoryNotesControl 191); no rename/extraction/split/deletion. Final `git diff --check` passed.
