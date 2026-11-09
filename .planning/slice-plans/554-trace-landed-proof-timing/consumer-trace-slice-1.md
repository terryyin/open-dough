# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/server/ciScopeHistory.ts` | changed path |
| `ciScopeHistory.ts` | basename of `dashboard/server/ciScopeHistory.ts` |
| `dashboard/server/intentCiHistoryRead.ts` | changed path |
| `intentCiHistoryRead.ts` | basename of `dashboard/server/intentCiHistoryRead.ts` |
| `dashboard/server/landedCiCollection.ts` | changed path |
| `landedCiCollection.ts` | basename of `dashboard/server/landedCiCollection.ts` |
| `dashboard/server/landedCiHistoryStore.ts` | changed path |
| `landedCiHistoryStore.ts` | basename of `dashboard/server/landedCiHistoryStore.ts` |
| `dashboard/server/launchLandingGit.ts` | changed path |
| `launchLandingGit.ts` | basename of `dashboard/server/launchLandingGit.ts` |
| `dashboard/src/authenticatedGet.ts` | changed path |
| `authenticatedGet.ts` | basename of `dashboard/src/authenticatedGet.ts` |
| `dashboard/src/authenticatedIntentCiHistoryRead.ts` | changed path |
| `authenticatedIntentCiHistoryRead.ts` | basename of `dashboard/src/authenticatedIntentCiHistoryRead.ts` |
| `dashboard/src/ciScopeHistory.ts` | changed path |
| `scopeHistoryOf` | supplied |
| `readLandingOrder` | supplied |
| `keepLandedCiOrder` | supplied |
| `readLandedCiHistory` | supplied |
| `readIntentCiScopeHistory` | supplied |
| `readingCiScopeHistoryOf` | supplied |
| `intent-ci-history` | supplied |

## Scope

Whole checkout at `561675ce3063`, including uncommitted and untracked files: 5318 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/server/ciScopeHistory.ts`, `dashboard/server/intentCiHistoryRead.ts`, `dashboard/server/landedCiCollection.ts`, `dashboard/server/landedCiHistoryStore.ts`, `dashboard/server/launchLandingGit.ts`, `dashboard/src/authenticatedGet.ts`, `dashboard/src/authenticatedIntentCiHistoryRead.ts`, `dashboard/src/ciScopeHistory.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/server/intentCiComparisonSlots.ts` | `landedCiCollection.ts` | 83: `` // Landed rule resolution (`./landedCiCollection.ts`). `` |excluded: resolver/final-slot behavior is unchanged; this is an existing owner reference, not a new invocation |
| `dashboard/server/intentRequestedRead.ts` | `intentCiHistoryRead.ts` | 5: `` // project's collected CI wall time history (`./intentCiHistoryRead.ts`), or a `` |run: real collected-history main journey and existing landed-ci-history-collection backend cases through public boundary |
| `dashboard/server/landedCiMeasuredBuilds.ts` | `intentCiHistoryRead.ts`, `landedCiCollection.ts`, `landedCiHistoryStore.ts` | 2: `` // (`./landedCiHistoryStore.ts`): which kept builds are points of CI wall `` |run: real collected-history main journey and existing landed-ci-history-collection backend cases through public boundary |
| `dashboard/server/launchBoundary.ts` | `landedCiCollection.ts` | 52: `` // landed CI history (`./landedCiCollection.ts`). It also names the `` |run: real collected-history main journey and existing landed-ci-history-collection backend cases through public boundary |
| `dashboard/server/launchBoundaryAnswer.ts` | `landedCiCollection.ts` | 15: `import type { LandedCiCollection } from "./landedCiCollection.ts";` |run: real collected-history main journey and existing landed-ci-history-collection backend cases through public boundary |
| `dashboard/server/launchLandingReservation.ts` | `launchLandingGit.ts` | 5: `import { verifyLanding, pinLanding } from "./launchLandingGit.ts";` |run: real collected-history main journey and existing landed-ci-history-collection backend cases through public boundary |
| `dashboard/server/launchRecordDeletion.ts` | `launchLandingGit.ts` | 2: `import { removeLandingPins } from "./launchLandingGit.ts";` |excluded: existing verifyLanding/pinLanding/removeLandingPins bodies and signatures are unchanged; the added local order reader has no calls from this boundary |
| `dashboard/server/performedRead.ts` | `intentCiHistoryRead.ts`, `intent-ci-history` | 35: `import { performIntentCiHistoryRead } from "./intentCiHistoryRead.ts";` |run: real collected-history main journey and existing landed-ci-history-collection backend cases through public boundary |
| `dashboard/server/readDiagnosticContext.ts` | `intent-ci-history` | 99: `case "intent-ci-history":` |run: dashboard-ci-scope-history-read.test.mjs validates scoped pin/category, request shape and local read identity |
| `dashboard/server/readingRequestedRead.ts` | `intentCiHistoryRead.ts`, `intent-ci-history` | 17: `import { readingIntentCiHistoryOf } from "./intentCiHistoryRead.ts";` |run: real collected-history main journey and existing landed-ci-history-collection backend cases through public boundary |
| `dashboard/server/readOutcome.ts` | `ciScopeHistory.ts`, `intentCiHistoryRead.ts` | 8: `import type { CiScopeHistory } from "../src/ciScopeHistory.ts";` |run: real collected-history main journey and existing landed-ci-history-collection backend cases through public boundary |
| `dashboard/server/revisionBuildSlot.ts` | `landedCiHistoryStore.ts` | 56: `` // landed CI history (`./landedCiHistoryStore.ts`). `` |excluded: resolver/final-slot behavior is unchanged; this is an existing owner reference, not a new invocation |
| `dashboard/src/authenticatedBranchRead.ts` | `authenticatedGet.ts` | 13: `} from "./authenticatedGet.ts";` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/authenticatedDoneRead.ts` | `authenticatedGet.ts` | 22: `} from "./authenticatedGet.ts";` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/authenticatedIntentCandidatesRead.ts` | `authenticatedGet.ts` | 15: `} from "./authenticatedGet.ts";` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/authenticatedIntentCiComparisonRead.ts` | `authenticatedGet.ts` | 6: `import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/authenticatedIntentCiProofRead.ts` | `authenticatedGet.ts` | 9: `import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/authenticatedIntentCiStatusRead.ts` | `authenticatedGet.ts` | 12: `import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/authenticatedIntentRead.ts` | `authenticatedGet.ts` | 14: `} from "./authenticatedGet.ts";` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/authenticatedProfileRead.ts` | `authenticatedGet.ts` | 16: `} from "./authenticatedGet.ts";` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/authenticatedRead.ts` | `authenticatedGet.ts` | 17: `` // read makes the same one request (`./authenticatedGet.ts`). No extra header or `` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/authenticatedReadRules.ts` | `intentCiHistoryRead.ts`, `scopeHistoryOf`, `readingCiScopeHistoryOf` | 101: `` // A project's collected CI wall time history (`../server/intentCiHistoryRead.ts`). `` |run: dashboard-ci-scope-history-read.test.mjs validates scoped pin/category, request shape and local read identity |
| `dashboard/src/intent-ci-history.css` | `intent-ci-history` | 18: `.intent-ci-history {` |run: unchanged project wall-time browser suite plus scoped retry/zero/gap/provenance/phone cases |
| `dashboard/src/IntentCiEvidence.tsx` | `ciScopeHistory.ts` | 27: `import type { ScopeHistoryEndpoint } from "./ciScopeHistory.ts";` |run: real collector-to-Summary journey; supplemental independent retry, mixed roles, selected gaps, zero, keyboard and narrow-width cases |
| `dashboard/src/IntentCiHistory.tsx` | `intent-ci-history` | 16: `` // `./intent-ci-history.css`'s. `` |run: unchanged project wall-time browser suite plus scoped retry/zero/gap/provenance/phone cases |
| `dashboard/src/IntentCiHistoryChart.tsx` | `intent-ci-history` | 153: `className="intent-ci-history-grid"` |run: unchanged project wall-time browser suite plus scoped retry/zero/gap/provenance/phone cases |
| `dashboard/src/IntentScopeTimingHistory.tsx` | `ciScopeHistory.ts`, `intent-ci-history` | 9: `import type { CiScopeHistory, ScopeHistoryEntry } from "./ciScopeHistory.ts";` |run: real collector-to-Summary journey; supplemental independent retry, mixed roles, selected gaps, zero, keyboard and narrow-width cases |
| `dashboard/src/landedCiHistory.ts` | `intentCiHistoryRead.ts` | 2: `` // boundary answers it (`../server/intentCiHistoryRead.ts`) and CI status `` |run: unchanged project wall-time browser suite plus scoped retry/zero/gap/provenance/phone cases |
| `dashboard/src/publicationContainment.ts` | `authenticatedGet.ts` | 4: `` // (`./authenticatedGet.ts`), and remembered per pair: a commit's history never `` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/readingLimit.ts` | `authenticatedGet.ts` | 3: `` // evidence. `./authenticatedGet.ts` sets it where the boundary answers a read `` |run: controlled-clock test keeps live acquisition withheld while both local histories read; existing limited-reading/limit-recovery browser cases pass |
| `dashboard/src/revisionCheckRead.ts` | `authenticatedGet.ts` | 14: `} from "./authenticatedGet.ts";` |reused: inspected unchanged three-argument calls retain the default upstream guard; live-limit/default contract observed by dashboard-ci-scope-history-read.test.mjs and limited-reading-check/limit-recovery-check browser suites |
| `dashboard/src/useIntentCiHistory.ts` | `intentCiHistoryRead.ts`, `authenticatedIntentCiHistoryRead.ts` | 3: `` // `./authenticatedIntentCiHistoryRead.ts`: read with each read of the trunk's `` |run: unchanged project wall-time browser suite plus scoped retry/zero/gap/provenance/phone cases |
| `dashboard/src/useIntentCiScopeHistory.ts` | `ciScopeHistory.ts`, `intentCiHistoryRead.ts`, `authenticatedIntentCiHistoryRead.ts`, `readIntentCiScopeHistory` | 5: `import { readIntentCiScopeHistory } from "./authenticatedIntentCiHistoryRead.ts";` |run: real collector-to-Summary journey; supplemental independent retry, mixed roles, selected gaps, zero, keyboard and narrow-width cases |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts` | `intentCiHistoryRead.ts`, `landedCiCollection.ts` | 1: `// Landed CI wall-time history collection (../../server/landedCiCollection.ts)` |run: absent-store empty reading and real collected exact build preserved |
| `dashboard/backend-tests/review/story-branch-landing-capture.spec.ts` | `launchLandingGit.ts` | 2: `// pair (../../server/launchLandingGit.ts): the installed` |excluded: existing verifyLanding/pinLanding/removeLandingPins bodies and signatures are unchanged; the added local order reader has no calls from this boundary |
| `dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts` | `intent-ci-history` | 129: `await expect(history.locator("svg text.intent-ci-history-selected")).toHaveText("Selected");` |run: this named spec passed; setup and observing assertions retained in its source and implementation return |
| `dashboard/tests/intent/intent-scope-timing-history-reading.spec.ts` | `intent-ci-history` | 77: `await expect(history.locator("svg text.intent-ci-history-selected")).toHaveText("Selected");` |run: this named spec passed; setup and observing assertions retained in its source and implementation return |
| `tests/support/dashboard-ci-scope-history-read.test.mjs` | `dashboard/server/intentCiHistoryRead.ts`, `intentCiHistoryRead.ts`, `dashboard/src/authenticatedGet.ts`, `authenticatedGet.ts`, `dashboard/src/authenticatedIntentCiHistoryRead.ts`, `authenticatedIntentCiHistoryRead.ts`, `readIntentCiScopeHistory`, `intent-ci-history` | 3: `import { parseIntentCiHistoryRead } from "../../dashboard/server/intentCiHistoryRead.ts";` |run: parser/client/identity/default-limit and explicit-local-read cases |
| `tests/support/intent-ci-scope-history.test.mjs` | `dashboard/server/ciScopeHistory.ts`, `ciScopeHistory.ts`, `scopeHistoryOf` | 4: `import { scopeHistoryOf } from "../../dashboard/server/ciScopeHistory.ts";` |run: named projection tests observe exact endpoints, order, signatures, gap reasons, zero and per-landing reuse |
| `tests/support/landed-ci-history-order.test.mjs` | `dashboard/server/ciScopeHistory.ts`, `ciScopeHistory.ts`, `dashboard/server/landedCiHistoryStore.ts`, `landedCiHistoryStore.ts`, `dashboard/server/launchLandingGit.ts`, `launchLandingGit.ts`, `scopeHistoryOf`, `readLandingOrder`, `keepLandedCiOrder`, `readLandedCiHistory` | 8: `import { readLandingOrder } from "../../dashboard/server/launchLandingGit.ts";` |run: real local first-parent chain, persisted order fallback and stale partial replacement refusal |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/fakeClaude.ts` | `landedCiCollection.ts` | 177: `// (../../server/landedCiCollection.ts); such a test turns it back on` |run: exercised by real collection/backend/Summary journeys and domain tests; existing MakeMe defaults unchanged by inspection |
| `dashboard/tests/support/landedCiHistory.ts` | `intentCiHistoryRead.ts`, `landedCiCollection.ts` | 4: `// its test asks (../../server/landedCiCollection.ts); an unattached Start` |run: exercised by real collection/backend/Summary journeys and domain tests; existing MakeMe defaults unchanged by inspection |
| `tests/support/landedCiProofTestData.mjs` | `dashboard/server/landedCiHistoryStore.ts`, `landedCiHistoryStore.ts` | 3: `/** @typedef {import("../../dashboard/server/landedCiHistoryStore.ts").ProjectHistory} ProjectHistory */` |run: exercised by real collection/backend/Summary journeys and domain tests; existing MakeMe defaults unchanged by inspection |
| `tests/support/makeMe.mjs` | `ciScopeHistory.ts`, `dashboard/src/ciScopeHistory.ts` | 58: `/** @typedef {import("../../dashboard/src/ciScopeHistory.ts").CiScopeHistory} CiScopeHistory */` |run: exercised by real collection/backend/Summary journeys and domain tests; existing MakeMe defaults unchanged by inspection |

### Journey or feature

none found

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/slice-plans/551-see-landed-ci-wall-time-history/PLAN.md` | `intent-ci-history` | 98: `` - Colour tokens go in `src/intent-ci-history.css`, derived from the frame tokens, because the frame has no dark scheme. `` |excluded: planning/reference text only; supplier contract integration remains explicitly owned by G1/G2 |
| `.planning/slice-plans/551-see-landed-ci-wall-time-history/source-review.md` | `intentCiHistoryRead.ts`, `landedCiCollection.ts` | 196: `\| 9 \| "through the project's existing CI read boundary" (qualification/constraint (on 8)) \| slice 1 \| observed: dashboard/backend-tests/intent/landed-ci-histor…` |excluded: planning/reference text only; supplier contract integration remains explicitly owned by G1/G2 |
| `.planning/slice-plans/554-trace-landed-proof-timing/PLAN.md` | `scopeHistoryOf` | 427: `Reported: slice 1 — "Independent acceptance found scopeHistoryOf orders and cuts off by receivedAt. launchLandingReservation.ts assigns that time while prepari…` |excluded: planning/reference text only; supplier contract integration remains explicitly owned by G1/G2 |
| `docs/dashboard-development-intent-ci-status.md` | `dashboard/server/landedCiCollection.ts`, `landedCiCollection.ts` | 111: `` (`dashboard/server/landedCiCollection.ts`) whether or not a page is open: `` |reused: maintained project wall-time semantics are unchanged; scope additions documented in dashboard-development-intent-ci-comparison.md |

This directed trace follows the mandatory base trace at `/tmp/trace-proof-285-scope-consumers.md`; generic field-name and shared-builder lexical matches in that raw trace were narrowed to the explicit changed responsibilities above. Backend retention and UI-specific traces are retained separately in the implementation return.

## Shared proof-dispatch and retention consumers

This table completes the effect-reaching retention discovery, including existing live-proof consumers. The unchanged-boundary dispositions do not claim new freshness or refresh behavior.

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/server/ciAdapterProof.ts` | `intentCiProofRead.ts` | 1: `` // The CI proof of one ciAdapter attempt (`./intentCiProofRead.ts`): asked of `` |run: backend-tests/intent/landed-ci-proof-collection.spec.ts four cases observe artifact summary/breakdown/zero, mismatched revision, expired reason and adapter branch/attempt; focused proof-reader shell checks preserve validation; existing reader identity checks and freshness/memo code are unchanged |
| `dashboard/server/ciProofArtifact.ts` | `intentCiProofRead.ts` | 1: `` // The CI proof of one GitHub Actions run attempt (`./intentCiProofRead.ts`): `` |run: backend-tests/intent/landed-ci-proof-collection.spec.ts four cases observe artifact summary/breakdown/zero, mismatched revision, expired reason and adapter branch/attempt; focused proof-reader shell checks preserve validation; actual collector-produced archive bytes cross the existing artifact reader |
| `dashboard/server/ciScopeHistory.ts` | `landedCiHistoryStore.ts` | 2: `import type { ProjectHistory } from "./landedCiHistoryStore.ts";` |run: intent-ci-scope-history.test.mjs observes retained summary/gap projection; real collected Summary journey observes public result |
| `dashboard/server/intentCiComparisonSlots.ts` | `landedCiCollection.ts`, `LandedCiCollection` | 83: `` // Landed rule resolution (`./landedCiCollection.ts`). `` |excluded: unchanged Landed resolver reference; proof retention consumes its result without altering selection |
| `dashboard/server/intentCiHistoryRead.ts` | `landedCiCollection.ts`, `landedCiHistoryStore.ts`, `keptLandedCiHistory`, `LandedCiCollection` | 5: `` // history (`./landedCiHistoryStore.ts`) alone and asks no CI, Git or GitHub, `` |run: real collector-to-Summary journey observes scoped public read, actual store failure/retry and retained-order fallback; existing backend history cases preserve absent-store empty |
| `dashboard/server/intentRequestedRead.ts` | `intentCiProofRead.ts` | 4: `` // judgment named (`./intentCiProofRead.ts`), a story's CI comparison, the `` |run: dashboard-ci-proof-parse.test.mjs preserves live-proof request parsing; real Summary journey exercises the unchanged proof route beside scoped history |
| `dashboard/server/landedCiMeasuredBuilds.ts` | `landedCiCollection.ts`, `landedCiHistoryStore.ts`, `LandedCiCollection` | 2: `` // (`./landedCiHistoryStore.ts`): which kept builds are points of CI wall `` |run: existing landed-ci-history-collection backend and intent-ci-wall-time-history browser cases preserve project measurements; proof fields are additive |
| `dashboard/server/launchBoundary.ts` | `landedCiCollection.ts`, `LandedCiCollection` | 52: `` // landed CI history (`./landedCiCollection.ts`). It also names the `` |run: real accepted landing submission with Intent closed triggers collection in new backend cases and real Summary journey |
| `dashboard/server/launchBoundaryAnswer.ts` | `landedCiCollection.ts`, `LandedCiCollection` | 15: `import type { LandedCiCollection } from "./landedCiCollection.ts";` |run: real accepted landing submission nudges sole collector in new backend cases and real Summary journey |
| `dashboard/server/performedRead.ts` | `intentCiProofRead.ts`, `performIntentCiProofRead` | 36: `import { performIntentCiProofRead } from "./intentCiProofRead.ts";` |run: four-case collection spec exercises shared proof dispatch; real Summary journey completes live endpoint reads before counting zero additional history CI operations |
| `dashboard/server/readingRequestedRead.ts` | `intentCiProofRead.ts` | 18: `import { readingIntentCiProofOf } from "./intentCiProofRead.ts";` |reused: readingIntentCiProofOf signature/wording unchanged; scoped diagnostic name is covered separately by dashboard-ci-scope-history-read.test.mjs |
| `dashboard/server/readOutcome.ts` | `intentCiProofRead.ts` | 9: `import type { IntentCiProofAnswer } from "./intentCiProofRead.ts";` |reused: IntentCiProofAnswer remains the same subject/checkedAt/proof shape; typecheck and real live endpoint/rendered comparison observations pass |
| `dashboard/server/revisionBuildSlot.ts` | `landedCiHistoryStore.ts` | 56: `` // landed CI history (`./landedCiHistoryStore.ts`). `` |excluded: unchanged finalSlot/resolver definitions; comment/reference only for added proof retention |
| `dashboard/src/authenticatedIntentCiProofRead.ts` | `intentCiProofRead.ts`, `readIntentCiProof` | 2: `` // (`../server/intentCiProofRead.ts`) with `intent=ci-proof`: the proof of `` |run: real Summary journey and existing intent-summary-story-comparison/file/gaps suites observe live endpoint summaries and values; inspected query/subject/schema code unchanged by server dispatch extraction |
| `dashboard/src/authenticatedReadRules.ts` | `intentCiProofRead.ts` | 91: `` // (`../server/intentCiProofRead.ts`). `` |reused: readingCiProofOf remains unchanged; dashboard-ci-proof-parse.test.mjs and real endpoint journey preserve live subject validation; new scoped rules tested separately |
| `dashboard/src/ciProof.ts` | `intentCiProofRead.ts` | 2: `` // answers it (`../server/intentCiProofRead.ts`): a GitHub Actions run `` |reused: existing CiProof schemas/subject helpers unchanged; dashboard-ci-proof-read/breakdown-read/adapter-proof/parse checks exercise the retained validation contract |
| `dashboard/src/IntentCiEvidence.tsx` | `intentCiProofRead.ts` | 6: `` // `./authenticatedIntentCiProofRead.ts`); or a selected done / Taken Trunk Mode `` |run: real Summary journey and existing comparison suites preserve shared live evidence while new local history renders independently |
| `dashboard/src/useIntentCiComparisonEntries.ts` | `intentCiProofRead.ts`, `readIntentCiProof` | 2: `` // (`./useIntentCiComparison.ts`), each read through `./authenticatedIntentCiProofRead.ts` `` |run: real Summary journey explicitly waits for all endpoint proof reads and independently checks Baseline/Branch/Landed figures; existing comparison/file/gap suites pass; inspected subject keys and Check again dependencies unchanged |
| `dashboard/src/useIntentCiShownProof.ts` | `intentCiProofRead.ts`, `readIntentCiProof` | 3: `` // `./authenticatedIntentCiProofRead.ts`, and what that proof says now: no `` |reused: inspected source/attempt/checkedAt key, judgment refresh dependency and ambiguous-adapter guard unchanged; existing project CI wall-time journey observes current judgment/Proof; proof-reader shell cases preserve dispatch result |
| `dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts` | `landedCiCollection.ts`, `LandedCiCollection` | 1: `// Landed CI wall-time history collection (../../server/landedCiCollection.ts)` |run: recorded exact landing collection and absent-store empty reading remain passing through public boundary |
| `tests/support/dashboard-ci-proof-parse.test.mjs` | `dashboard/server/intentCiProofRead.ts`, `intentCiProofRead.ts` | 2: `` // (`../../dashboard/server/intentCiProofRead.ts` `parseIntentCiProofRead`): `` |run: focused shell proof command includes this file and preserves the live request/refusal contract |
| `dashboard/tests/support/fakeClaude.ts` | `landedCiCollection.ts`, `LandedCiCollection` | 177: `// (../../server/landedCiCollection.ts); such a test turns it back on` |run: backend collection fixtures exercise opt-in production collection; default test-server collection-off case remains passing |
| `dashboard/tests/support/landedCiHistory.ts` | `landedCiCollection.ts`, `LandedCiCollection` | 4: `// its test asks (../../server/landedCiCollection.ts); an unattached Start` |run: real installed landing/public history read helpers exercised by collection and real Summary journeys |
| `tests/support/landedCiProofTestData.mjs` | `dashboard/server/landedCiHistoryStore.ts`, `landedCiHistoryStore.ts` | 3: `/** @typedef {import("../../dashboard/server/landedCiHistoryStore.ts").ProjectHistory} ProjectHistory */` |run: new scope/order tests arrange retained canonical data through MakeMe; existing builder defaults unchanged |
| `.planning/slice-plans/547-distinguish-test-cases-and-files-in-ci-proof/PLAN.md` | `dashboard/server/intentCiProofRead.ts`, `intentCiProofRead.ts` | 29: `` breakdowns. `dashboard/server/intentCiProofRead.ts` and `ciAdapterProof.ts` `` |excluded: planning/reference text does not invoke changed runtime proof dispatch or retention; active supplier coordination remains G1/G2 |
| `.planning/slice-plans/551-see-landed-ci-wall-time-history/source-review.md` | `landedCiCollection.ts`, `LandedCiCollection` | 196: `\| 9 \| "through the project's existing CI read boundary" (qualification/constraint (on 8)) \| slice 1 \| observed: dashboard/backend-tests/intent/landed-ci-histor…` |excluded: planning/reference text does not invoke changed runtime proof dispatch or retention; active supplier coordination remains G1/G2 |
| `.planning/slice-plans/554-trace-landed-proof-timing/PLAN.md` | `performIntentCiProofRead` | 53: `` - **Validated proof acquisition.** `performIntentCiProofRead` dispatches to `` |excluded: planning/reference text does not invoke changed runtime proof dispatch or retention; active supplier coordination remains G1/G2 |
| `docs/dashboard-development-intent-ci-status.md` | `dashboard/server/landedCiCollection.ts`, `landedCiCollection.ts`, `LandedCiCollection` | 111: `` (`dashboard/server/landedCiCollection.ts`) whether or not a page is open: `` |reused: project-history collection ownership remains unchanged; new scoped behavior is maintained in dashboard-development-intent-ci-comparison.md |

## Literal retained proof commands

All commands below reached terminal exit 0 for the observations stated.

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-proof-collection.spec.ts --workers=1
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/dashboard-ci-proof-read.test.mjs tests/support/dashboard-ci-proof-breakdown-read.test.mjs tests/support/dashboard-ci-adapter-proof.test.mjs tests/support/dashboard-ci-proof-parse.test.mjs
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-timing-history-reading.spec.ts tests/intent/intent-ci-wall-time-history.spec.ts --workers=1
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-timing-history-reading.spec.ts --grep 'earlier supported units' --workers=1
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-timing-history-reading.spec.ts --grep 'empty scope|all gaps scope|equivalent and later' --workers=1
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-timing-history-reading.spec.ts --grep 'one measured attempt labels|equivalent and later|failed local entry' --workers=1
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-scope-timing-history-reading.spec.ts --grep 'unverified local landing order' --workers=1
```

The first command is the final four-case backend retention selection: adapter summary/branch/attempt plus artifact summary, mismatched proof and expired proof. The first combined supplemental UI command ran the then-present exact/retry case and existing project wall-time tests; later filtered commands supply the added units/gaps/provenance/mixed-role/order cases. Supplemental local-history DTO substitutions prove presentation only; the real collector-to-Summary command in the implementation return owns acquisition, retention and no-acquisition-on-browsing.

## Superseded raw discovery and grouped exclusions

The following supporting records are lexical discovery, superseded for acceptance by this directed index and its explicit responsibility tables: `/tmp/trace-proof-285-scope-consumers.md`, `/tmp/trace-proof-285-scope-consumers-focused.md`, `/tmp/trace-proof-285-scope-consumers-directed.md`, `/tmp/trace-proof-285-retention-consumers-focused.md`, `/tmp/trace-proof-285-ui-consumers.md`, `/tmp/trace-proof-285-ui-g7-consumers.md`, `/tmp/trace-proof-285-collected-journey-consumers.md`, and `/tmp/trace-proof-285-store-failure-consumers.md`. A blank cell in an old discovery file is not an unresolved acceptance claim.

- `PLAN.md`, `source-review.md`, and story-obligation parser hits in installed/source guidance, done records and unrelated plans are names of record formats. This implementation did not alter those formats, parsers or unrelated records. Only plan 554 execution/source evidence is coordinator-owned; supplier plans remain G1/G2 coordination inputs.
- Generic `segment`, `series`, `annotations`, `stroke`, `entryOf` and similarly broad field-name hits in brand assets, unrelated icons, host launch code, location text/candidate segmentation, and other chart consumers share spelling only. The changed timing series is passed only to IntentCiHistoryChart by project/scoped history; those concrete consumers and observations are listed above. No unrelated rendering or segmentation API changed.
- Existing `makeMe` imports/getters/default facts are unchanged. New proof/history getters, optional breakdown/missing/untimed setters, nullable-unit choice and explicit captured-landing setter are additive. Default CiProofEntry output still omits untimed when zero and retains its original single-part shape. Hundreds of existing shared-builder imports therefore do not invoke changed defaults; new methods are exercised by named collection/order/projection/UI tests and typecheck.
- Legacy `landedAt`/completion-report consumers retain their prior default comparison and outcome facts. The new `withCapturedLanding` branch is exercised by P/E/R fixture inputs in the real journey; completion/read/Done facts and unrelated launch fixtures remain unchanged.
- Existing finalSlot/Landed resolution, verification/pinning/deletion functions, parser fields and live-proof freshness/refresh keys remain unchanged. Their lexical references do not authorize claiming supplier pending/provenance/retention completion; G1/G2 and slice-3 retry remain explicit open boundaries.

## G1/G2 scoped collection continuation

Only two new capability specs were added in this continuation; product code is unchanged. Both reuse the existing collector, real Git comparison publishers, FakeGitHub and MakeMe facts. They do not supply collected history answers.

| Consumer / observation | Disposition |
| --- | --- |
| `dashboard/backend-tests/intent/landed-ci-scope-build-provenance.spec.ts` — exact A and confirmed-skipped P share one retained attempt | run: passed; public scope read has one 1200 ms point, measured A revision/date, both represented revisions with exact/equivalent roles and selected P; only one archive acquisition, repeat local read adds no GitHub call |
| Same spec — cancelled M uses the next passing trunk attempt D while unrelated later R has its own collected proof | run: passed; public scope read has one selected 3400 ms point with D's real revision/date/run/link and later provenance, represented M separate, R absent, one acquisition of D archive and no provider call on repeat read |
| `dashboard/backend-tests/intent/landed-ci-scope-pending-proof.spec.ts` — known queued run51/attempt2 at an actual accepted landing | open G1: real lookup occurred, then failing-first public read returned `Selected landing was not collected` without Pending/run evidence; no-numeric/no-measured-build/no-new-provider assertions remain unobserved after that failure |
| Existing Landed resolver, confirmed-skip classifier and cancelled-forward selection | reused: no implementation changes; the new passing tests exercise their actual collection-to-scope use rather than creating another resolver; supplier551's final window/retention/resumption proof remains G1/G2 |

Literal commands and terminal outcomes:

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-build-provenance.spec.ts --workers=1
```

Passed both tests, exit0, session83502.

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-pending-proof.spec.ts --workers=1
```

Expected missing-behavior red, exit1 at the Pending/run assertion (line71), session6798. Evidence: `dashboard/test-results/2026-11-09T06-21-10.825Z-89336`. This remains a failing gate, not an accepted exception. Supplier551 owns the existing pending lifecycle repair; after integration this story must preserve safe pending run/link evidence in its scoped gap DTO and UI, without presenting it as a measured build.

`npm run typecheck:dashboard` passed with both new specs (session36502). No formatter, hook lint, refactor, commit or publication was run for this continuation.
