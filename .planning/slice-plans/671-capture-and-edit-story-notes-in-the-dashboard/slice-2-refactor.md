# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/src/localSettingState.ts` | changed path |
| `localSettingState.ts` | basename of `dashboard/src/localSettingState.ts` |
| `dashboard/src/storyNotes.ts` | changed path |
| `storyNotes.ts` | basename of `dashboard/src/storyNotes.ts` |
| `dashboard/src/storyReviewStates.ts` | changed path |
| `storyReviewStates.ts` | basename of `dashboard/src/storyReviewStates.ts` |
| `dashboard/tests/support/frontendStoryNotes.ts` | changed path |
| `frontendStoryNotes.ts` | basename of `dashboard/tests/support/frontendStoryNotes.ts` |
| `useStoryNotes` | supplied |
| `useStoryReviewStates` | supplied |
| `projectReviewStates` | supplied |
| `storyNotesPage` | supplied |
| `installFrontendStoryReviewState` | supplied |
| `markAsReviewed` | supplied |
| `unreviewStory` | supplied |
| `expectReviewed` | supplied |
| `expectSessionReviewCue` | supplied |
| `installFrontendStoryNotes` | supplied |

## Scope

Whole checkout at `ab91ef3234f6`, including uncommitted and untracked files: 6993 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/src/localSettingState.ts`, `dashboard/src/storyNotes.ts`, `dashboard/src/storyReviewStates.ts`, `dashboard/tests/support/frontendStoryNotes.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/done/SEED-328_mark-recently-done-stories-as-reviewed.json` | `storyReviewStates.ts` | 11: `"report": "# Dough Intent Coverage: SEED-328#mark-recently-done-stories-as-reviewed\n\nChecked revision: 2ca89f7721fe7381f27656e297cdd179ec5ee599 (2026-11-12, …` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `dashboard/server/projectConfigurationBoundary.ts` | `storyNotes.ts`, `storyReviewStates.ts` | 4: `import { answerStoryReviewStates } from "./storyReviewStates.ts";` | excluded: server-module basename match; frontend state extraction changes no server implementation, endpoint or contract |
| `dashboard/src/App.tsx` | `storyNotes.ts` | 13: `import { StoryNotesOnPage, usePageStoryNotes } from "./storyNotes.ts";` | run: T for imported types/contracts; F/E for card/dialog/shared Board-sidebar page-state consumers and their actual enclosing observations below |
| `dashboard/src/DoneStoryCard.tsx` | `storyNotes.ts` | 36: `import { StoryNotes } from "./StoryNotes.tsx";` | run: T for imported types/contracts; F/E for card/dialog/shared Board-sidebar page-state consumers and their actual enclosing observations below |
| `dashboard/src/RecentlyDone.tsx` | `storyReviewStates.ts`, `useStoryReviewStates` | 27: `import { useStoryReviewStates } from "./storyReviewStates.ts";` | run: T for imported types/contracts; F/E for card/dialog/shared Board-sidebar page-state consumers and their actual enclosing observations below |
| `dashboard/src/RecentlyDoneEntry.tsx` | `storyReviewStates.ts` | 19: `import type { StoryReviewStates } from "./storyReviewStates.ts";` | run: T for imported types/contracts; F/E for card/dialog/shared Board-sidebar page-state consumers and their actual enclosing observations below |
| `dashboard/src/RecentlyDonePageEvidence.tsx` | `storyReviewStates.ts` | 10: `} from "./storyReviewStates.ts";` | run: T for imported types/contracts; F/E for card/dialog/shared Board-sidebar page-state consumers and their actual enclosing observations below |
| `dashboard/src/SessionsSidebarSessionEntry.tsx` | `storyReviewStates.ts`, `useStoryReviewStates` | 24: `import { useStoryReviewStates } from "./storyReviewStates.ts";` | run: T for imported types/contracts; F/E for card/dialog/shared Board-sidebar page-state consumers and their actual enclosing observations below |
| `dashboard/src/StoryCard.tsx` | `storyNotes.ts` | 39: `import { StoryNotes } from "./StoryNotes.tsx";` | run: T for imported types/contracts; F/E for card/dialog/shared Board-sidebar page-state consumers and their actual enclosing observations below |
| `dashboard/src/StoryNotes.tsx` | `storyNotes.ts`, `useStoryNotes` | 5: `import { storyNoteNotSaved, useStoryNotes } from "./storyNotes.ts";` | run: T for imported types/contracts; F/E for card/dialog/shared Board-sidebar page-state consumers and their actual enclosing observations below |
| `dashboard/src/storyReviewState.ts` | `storyReviewStates.ts` | 2: `` // machine serving the dashboard (`../server/storyReviewStates.ts`): the `` | excluded: comment refers to unchanged server store; wire schema and endpoint unchanged |
| `dashboard/src/StoryReviewStateAction.tsx` | `storyReviewStates.ts` | 3: `` // (`./storyReviewStates.ts`): an unreviewed story offers a red Mark as reviewed; a `` | run: T for imported types/contracts; F/E for card/dialog/shared Board-sidebar page-state consumers and their actual enclosing observations below |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/frontend-tests/sessions/recently-done-sessions-review-cue-evidence.spec.ts` | `installFrontendStoryReviewState`, `expectSessionReviewCue` | 9: `import { expectSessionReviewCue } from "../../tests/recentlyDoneSessionsSidebarPage.ts";` | run: F, real frontend note/review shared-state, unknown/recovery or stale-answer purpose; specific observations below |
| `dashboard/frontend-tests/sessions/recently-done-sessions-review-cue-races.spec.ts` | `installFrontendStoryReviewState`, `markAsReviewed`, `expectReviewed`, `expectSessionReviewCue` | 8: `import { expectSessionReviewCue } from "../../tests/recentlyDoneSessionsSidebarPage.ts";` | run: F, real frontend note/review shared-state, unknown/recovery or stale-answer purpose; specific observations below |
| `dashboard/frontend-tests/sessions/recently-done-sessions-review-cue.spec.ts` | `markAsReviewed`, `unreviewStory`, `expectReviewed`, `expectSessionReviewCue` | 5: `import { expectSessionReviewCue } from "../../tests/recentlyDoneSessionsSidebarPage.ts";` | run: F, real frontend note/review shared-state, unknown/recovery or stale-answer purpose; specific observations below |
| `dashboard/frontend-tests/stories/recently-done-review-cue.spec.ts` | `markAsReviewed`, `unreviewStory`, `expectReviewed` | 13: `expectReviewed,` | run: F, real frontend note/review shared-state, unknown/recovery or stale-answer purpose; specific observations below |
| `dashboard/frontend-tests/stories/recently-done-review-state-offer.spec.ts` | `markAsReviewed`, `expectReviewed` | 14: `expectReviewed,` | run: F, real frontend note/review shared-state, unknown/recovery or stale-answer purpose; specific observations below |
| `dashboard/frontend-tests/stories/recently-done-review-state.spec.ts` | `markAsReviewed`, `unreviewStory`, `expectReviewed` | 31: `expectReviewed,` | run: F, real frontend note/review shared-state, unknown/recovery or stale-answer purpose; specific observations below |
| `dashboard/frontend-tests/stories/story-notes.spec.ts` | `storyNotes.ts`, `frontendStoryNotes.ts`, `storyNotesPage`, `installFrontendStoryNotes` | 5: `import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";` | run: F, real frontend note/review shared-state, unknown/recovery or stale-answer purpose; specific observations below |
| `dashboard/tests/recentlyDoneReviewState.ts` | `markAsReviewed`, `unreviewStory`, `expectReviewed` | 105: `export const markAsReviewed = (card: Locator) =>` | run: F/E exercise these focused object/substitute contracts; expected answers and request/held-response evidence remain independently asserted |
| `dashboard/tests/recentlyDoneSessionsSidebarPage.ts` | `expectSessionReviewCue` | 124: `export async function expectSessionReviewCue(row: Locator, needed: boolean) {` | run: F/E exercise these focused object/substitute contracts; expected answers and request/held-response evidence remain independently asserted |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/frontendRecentlyDoneBoardReview.ts` | `installFrontendStoryReviewState` | 27: `installFrontendStoryReviewState,` | run: F/E exercise these focused object/substitute contracts; expected answers and request/held-response evidence remain independently asserted |
| `dashboard/tests/support/frontendRecentlyDoneReviewCue.ts` | `installFrontendStoryReviewState` | 29: `import { installFrontendStoryReviewState } from "./frontendStoryReviewState.ts";` | run: F/E exercise these focused object/substitute contracts; expected answers and request/held-response evidence remain independently asserted |
| `dashboard/tests/support/frontendServiceSubstitutes.ts` | `storyNotes.ts`, `frontendStoryNotes.ts`, `installFrontendStoryReviewState`, `installFrontendStoryNotes` | 21: `import { installFrontendStoryNotes } from "./frontendStoryNotes.ts";` | run: F/E exercise these focused object/substitute contracts; expected answers and request/held-response evidence remain independently asserted |
| `dashboard/tests/support/frontendStoryReviewState.ts` | `installFrontendStoryReviewState` | 49: `export async function installFrontendStoryReviewState(` | run: F/E exercise these focused object/substitute contracts; expected answers and request/held-response evidence remain independently asserted |
| `dashboard/tests/support/storyNotesPage.ts` | `storyNotesPage` | 3: `export function storyNotesPage(page: Page) {` | run: F/E exercise these focused object/substitute contracts; expected answers and request/held-response evidence remain independently asserted |

### Journey or feature

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `e2e/sessions/recently-done-sessions-review-cue-ad-hoc.spec.ts` | `markAsReviewed`, `unreviewStory`, `expectReviewed`, `expectSessionReviewCue` | 14: `expectReviewed,` | run: E, real-page read/save/recovery and persistence purpose; specific observations below |
| `e2e/stories/recently-done-review-state-failed-save.spec.ts` | `markAsReviewed`, `unreviewStory`, `expectReviewed` | 14: `expectReviewed,` | run: E, real-page read/save/recovery and persistence purpose; specific observations below |
| `e2e/stories/recently-done-review-state-persistence.spec.ts` | `markAsReviewed`, `unreviewStory`, `expectReviewed` | 10: `expectReviewed,` | run: E, real-page read/save/recovery and persistence purpose; specific observations below |
| `e2e/stories/recently-done-review-state-refresh.spec.ts` | `markAsReviewed`, `expectReviewed` | 14: `expectReviewed,` | run: E, real-page read/save/recovery and persistence purpose; specific observations below |
| `e2e/stories/story-notes-persistence.spec.ts` | `storyNotesPage` | 5: `import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";` | run: E, real-page read/save/recovery and persistence purpose; specific observations below |

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/seeds/SEED-336-live-dashboard-status.md` | `dashboard/src/storyReviewStates.ts`, `storyReviewStates.ts` | 247: `the cue. [The review store](../../dashboard/src/storyReviewStates.ts) polls` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/existing-solution.md` | `storyReviewStates.ts` | 19: `` story identity, as `server/storyReviewStates.ts` does. Notes have no other `` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/PLAN.md` | `storyNotes.ts`, `storyReviewStates.ts` | 86: `` `server/storyNotes.ts` store with `unreadable: "preserve"`; the endpoint in `` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-1-consumers.md` | `storyNotes.ts`, `storyReviewStates.ts` | 11: `` \| `dashboard/server/storyNotes.ts` \| changed path \| `` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers-1.md` | `storyNotes.ts`, `dashboard/src/storyReviewStates.ts`, `storyReviewStates.ts` | 18: `` \| `dashboard/server/projectConfigurationBoundary.ts` \| `storyNotes.ts`, `StoryNotes`, `storyNotesEndpoint`, `storyNotes`, `StoryNote` \| 5: `import { storyNotes… `` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers-2.md` | `installFrontendStoryReviewState` | 37: `` \| `dashboard/frontend-tests/sessions/recently-done-sessions-review-cue-evidence.spec.ts` \| `frontendServiceSubstitutes.ts`, `frontendServiceSubstitutes`, `hold… `` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers-5.md` | `storyNotes.ts`, `frontendStoryNotes.ts`, `installFrontendStoryNotes` | 32: `` \| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/PLAN.md` \| `execution-context.md`, `dashboard/STORY-NOTES.md`, `STORY-NOTES.md`, `da… `` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-consumers.md` | `dashboard/src/storyNotes.ts`, `storyNotes.ts`, `dashboard/tests/support/frontendStoryNotes.ts`, `frontendStoryNotes.ts`, `useStoryNotes`, `storyNotesPage`, `installFrontendStoryNotes` | 25: `` \| `dashboard/src/StoryNotes.tsx` \| changed path \| `` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-2-proof.md` | `storyNotesPage` | 12: `` stays empty. `storyNotesPage.expectSaved` asserts one status/announcement. `` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/source-review.md` | `storyNotes.ts`, `storyNotesPage` | 33: `\| 1 \| Notes are separate entries, each with its own context. \| slice 2 \| observed: dashboard/frontend-tests/stories/story-notes.spec.ts desktop/phone saved ent…` | excluded: planning or historical references remain valid; refactor preserves names, promises and read cadence; runtime proof is F/E below |
| `dashboard/STORY-CARDS.md` | `storyReviewStates.ts` | 54: `` (`server/storyReviewStates.ts`), an entry meaning reviewed, and a missing or unreadable file reads as nothing `` | excluded: server-store reference and maintained review behavior unchanged; F/E renew the same behavior |

## Refactor proof and purpose dispositions

Changed seam: one Dashboard frontend machine-local setting subscription/refresh owner; notes and review requests, schemas, context maps and presentation remain separate. Removed the unused notes-only enabled branch and unused notes substitute getter. No changed wire output, server store, text, layout, keyboard order or resource precondition. Incoming source review and initial consumer record remain the source-promise mapping; prior exclusions for review-owner and sidebar cue behavior are superseded by current run dispositions here.

F: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list stories/ sessions/recently-done-sessions-review-cue` — 29 passed, 24.2s.

At the built frontend boundary, story-notes.spec.ts supplies external note answers, captures POST independently, and asserts blank/no POST, two ordered saved entries and story context, other-story isolation, one initial GET, count/focus/announcement, controlled next read and released stale read. Terminal case prints through the original socket while modal is open, retains the original connected screen and one attachment, then observes output/focus. Existing review-state/story cue specs assert card state/selection/announcement/session retention and readable controls. Sidebar cue specs supply per-project external state, hold unknown/stale reads and fail/recover the boundary; actual cue/card assertions observe independent project isolation, successful save sharing and older-read rejection. Touch layout/color assertions in those existing consumers stayed unchanged and passed.

E: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list stories/story-notes-persistence.spec.ts stories/recently-done-review-state-refresh.spec.ts stories/recently-done-review-state-persistence.spec.ts stories/recently-done-review-state-failed-save.spec.ts sessions/recently-done-sessions-review-cue-ad-hoc.spec.ts` — 5 passed, 14.6s.

At the real page/server boundary: notes persistence saves phone text through real HOME storage, restarts the server and observes desktop text/context/count. Review refresh opens two real pages, saves on one, advances the other to its next read, then refreshes published stories and observes retained review state. Review persistence reloads/restarts, unreviews by keyboard and checks preserved selection/order/snapshot mark/repository bytes. Failed-save makes the real records directory unwritable and separately aborts POST, observes unchanged saved state/focus/error, then successful retry. Ad hoc cue journey creates a real published completion/association, changes review on the real card, checks all related sidebar cues while preserving selection/unread/report meaning, including rejected-save recovery.

T: `npm run typecheck:dashboard` — passed after all product edits. `git diff --check` — passed after all edits. All changed raw files <=250 lines; read-only Prettier projection of changed script/style sources found none >225. No tests changed, renamed or deleted; MakeMe/page-object --changed selection resolved for the incoming frontend/E2E and their helpers. No generated artifacts affected.

Accepted-proof reuse: slice-1 server/store admission/unreadable proof stays valid: exact server, schema, setup and assertion locations unchanged. Slice-2 note frontend/project-owner and E2E page-owner implementation moved, so F/E replace those observations at identical setup/assertion locations; stories suite and typecheck were renewed. Existing standalone dialog/layout/terminal boundaries are unchanged and also observed in F. The notes cross-page next-read claim remains frontend-boundary composition plus real persistence; no concurrent real notes-two-page claim is added. No proof gap or deferred required observation.

Resource decision: awake macOS on AC, 16 cores,48GiB, memory free42%, load7.37; no competing owned heavy proof. Sequenced focused default2-worker runs under caffeinate-s-i, using the known stories suite~19s as duration evidence. Both commands reached terminal results; no full suite. Reconsider if workload, contention, runtime or failures change.
