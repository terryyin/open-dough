# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/server/machineJsonStore.ts` | changed path |
| `machineJsonStore.ts` | basename of `dashboard/server/machineJsonStore.ts` |
| `dashboard/server/projectConfigurationBoundary.ts` | changed path |
| `projectConfigurationBoundary.ts` | basename of `dashboard/server/projectConfigurationBoundary.ts` |
| `dashboard/server/storyNotes.ts` | changed path |
| `storyNotes.ts` | basename of `dashboard/server/storyNotes.ts` |
| `dashboard/src/storyNote.ts` | changed path |
| `storyNote.ts` | basename of `dashboard/src/storyNote.ts` |
| `storyNotesEndpoint` | supplied |
| `storyNoteSchema` | supplied |
| `writing is blocked` | supplied |

## Scope

Whole checkout at `681002b3946b`, including uncommitted and untracked files: 6972 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/server/machineJsonStore.ts`, `dashboard/server/projectConfigurationBoundary.ts`, `dashboard/server/storyNotes.ts`, `dashboard/src/storyNote.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/server/ciFollowUpAdmission.ts` | `machineJsonStore.ts` | 2: `import { leaveMachineJson } from "./machineJsonStore.ts";` |run: Distribution/tests/support/ci-follow-up-ledger.test.mjs; unreadable evidence remains blocked and preserved |
| `dashboard/server/ciFollowUpRetention.ts` | `machineJsonStore.ts` | 2: `import { leaveMachineJson } from "./machineJsonStore.ts";` |run: Distribution/tests/support/ci-follow-up-ledger.test.mjs; unreadable evidence remains blocked and preserved |
| `dashboard/server/ciFollowUpStore.ts` | `machineJsonStore.ts` | 14: `} from "./machineJsonStore.ts";` |run: Distribution/tests/support/ci-follow-up-ledger.test.mjs; unreadable evidence remains blocked and preserved |
| `dashboard/server/gitFilesIdentity.ts` | `machineJsonStore.ts` | 15: `` // `./machineJsonStore.ts` trusts a file's; a file changed within the last `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/hosts/cursor/heldSessions.ts` | `machineJsonStore.ts` | 17: `import { machineDocumentsRevision } from "../../machineJsonStore.ts";` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/keptStarts.ts` | `machineJsonStore.ts` | 5: `` // unreadable file are as `./machineJsonStore.ts` describes; a change to a `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/landedCiHistoryStore.ts` | `machineJsonStore.ts` | 44: `} from "./machineJsonStore.ts";` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/landedCiReceipt.ts` | `machineJsonStore.ts` | 10: `import type { StoreRead } from "./machineJsonStore.ts";` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/launchAttemptStore.ts` | `machineJsonStore.ts` | 14: `` // unreadable as `./machineJsonStore.ts` describes. `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/launchLandingRecord.ts` | `machineJsonStore.ts` | 7: `import { leaveMachineJson } from "./machineJsonStore.ts";` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/launchRecordDocument.ts` | `machineJsonStore.ts` | 13: `` // when unreadable as `./machineJsonStore.ts` describes. `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/localBoundaries.ts` | `projectConfigurationBoundary.ts` | 21: `import { installProjectConfigurationMiddleware } from "./projectConfigurationBoundary.ts";` |run: story-notes-admission and story-review-state-admission at HTTP boundary |
| `dashboard/server/machineJsonLock.ts` | `machineJsonStore.ts` | 1: `` // The directory lock beside a machine JSON document (`./machineJsonStore.ts`) `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/machineSessionObservation.ts` | `machineJsonStore.ts` | 22: `` // machine-document revision (`./machineJsonStore.ts`) it began under: a `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/machineSessionsFragments.ts` | `machineJsonStore.ts` | 10: `` // (`./machineJsonStore.ts`) and whose observed facts -- shown workspace, `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/sessionStartStore.ts` | `machineJsonStore.ts` | 16: `` // `./machineJsonStore.ts` describes. `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/startStore.ts` | `machineJsonStore.ts` | 16: `` // `./machineJsonStore.ts` describes. `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/storyReviewMarks.ts` | `machineJsonStore.ts` | 14: `` // when unreadable as `./machineJsonStore.ts` describes. `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/server/storyReviewStates.ts` | `machineJsonStore.ts` | 9: `` // `./machineJsonStore.ts` describes. `` |run: story-review-state-admission retains recovery behavior |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/backend-tests/configuration/machine-json-reuse.spec.ts` | `machineJsonStore.ts` | 1: `// How often a machine document (../../server/machineJsonStore.ts) is parsed:` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/backend-tests/configuration/machine-json-revision.spec.ts` | `machineJsonStore.ts` | 1: `// The machine-document revision (../../server/machineJsonStore.ts): this` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/backend-tests/launches/launch-attempt-retention.spec.ts` | `machineJsonStore.ts` | 24: `import { leaveMachineJson } from "../../server/machineJsonStore.ts";` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/backend-tests/review/story-notes-admission.spec.ts` | `storyNote.ts`, `storyNotesEndpoint`, `writing is blocked` | 7: `import { storyNotesAnswerSchema, storyNotesEndpoint, type StoryNotesAnswer } from "../../src/storyNote.ts";` | run: story-notes-admission proves accepted note shape and store refusal, using the shared note builder |
| `dashboard/backend-tests/runtime/kept-landed-ci-history.spec.ts` | `machineJsonStore.ts` | 4: `// (../../server/machineJsonStore.ts) read the file before the case kept its` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/frontendSettingsSubstitutes.ts` | `projectConfigurationBoundary.ts` | 5: `// (../../server/projectConfigurationBoundary.ts, ../../server/localJsonEndpoints.ts).` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/tests/support/machineDocument.ts` | `machineJsonStore.ts` | 1: `// A machine JSON document (../../server/machineJsonStore.ts) as a test keeps` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `dashboard/tests/support/machineFileIdentity.ts` | `machineJsonStore.ts` | 1: `// A machine document's file identity (../../server/machineJsonStore.ts): the` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `Distribution/tests/support/storyNoteTestData.mjs` | `dashboard/src/storyNote.ts`, `storyNote.ts` | 2: `/** @typedef {import("../../../dashboard/src/storyNote.ts").StoryNote} StoryNote */` | run: story-notes-admission proves accepted note shape and store refusal, using the shared note builder |

### Journey or feature

none found

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/evidence/SEED-303-early-handoff/watcher-consumers.md` | `dashboard/server/machineJsonStore.ts`, `machineJsonStore.ts` | 41: `` \| `dashboard/server/machineJsonStore.ts` \| excluded: inspected match is incidental prose/fixture text (for example "remain evidence", "document text", or anoth… `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
| `.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/PLAN.md` | `dashboard/server/machineJsonStore.ts`, `machineJsonStore.ts`, `projectConfigurationBoundary.ts`, `storyNotes.ts` | 37: `` - **Keeping notes.** Reuse `dashboard/server/machineJsonStore.ts` with a new `` |excluded: unchanged non-preserving store, type/comment reference, or planning/guidance mention; the only changed shared effect is the preserve refusal wording |
