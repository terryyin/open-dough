# Source review: SEED-413#speed-intent-source-browsing-and-detours

Obtained 2026-11-22 before Slice 3's redelegation, replacing the review
obtained at Slice 1 acceptance because Terry amended the correction (Slice 3
split; the shared detail/locations wait proved in E2E; the published
observation's remaining reads queued as
SEED-413#drive-published-observation-through-page-entry). A fresh
general-purpose reviewer with no conversation inheritance read one assembled
file: the selected story section (without its JSON records), the
[shared acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories)
its Evaluation cites, and the plan's
[correction input](PLAN.md#correction-of-the-locations-recovery-test-entry)
with the amendment. It was told to read no other file, change nothing and
number independently observable promises. Observations accepted for Slices
1–2 carry over where the amended promise is unchanged.

Unnumbered context it returned: split origin and baseline; the correction's
symptoms; Slices 1–4 before any source-browsing move as a delivery order; the
amendment and its deferral; `setDocumentVisibility` out of scope; scope
ownership by file and cases owned elsewhere; shared-acceptance method
guidance; separately owned follow-ups, SEED-341 coordination and the final
story's group measurement.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Production supplies the page observation's reads through the required typed page entry; reads are added to a required typed source, never an optional member, context default or defaulted parameter | slice 1 | observed: `PageReads.observation` (required, `dashboard/src/pageReads.tsx`) supplied by `authenticatedPublishedObservationReads`; `ConfiguredDashboard` passes `reads.observation` to `usePublishedObservation`, which hands it to `carryOutRead` → `readPublishedWork` → `readPublishedDetails` → `enrichPreparation` and the revision check schedule; `npm run typecheck:dashboard` exit 0 (s1a run records in `git rev-parse --git-path open-dough/evidence`: s1a-typecheck2) |
| C2 | Every case supplies reads through the required typed page entry, not below or around it: no `fetch` spy, no `requestIntentLocationsAt`, `noteLimit` or `standingLimit` calls, no private pipeline calls to make a view's props | slice 4 |  |
| C3 | The standing rate limit is recorded where a typed reply is received | slice 2 | observed: `intent-read-recovery.spec.ts` "rate-limited Intent locations reread when the standing limit ends" supplies `makeMe.aRateLimitedIntentReply` through `pageReadsSupplying({ intent })` with no `noteLimit`, `standingLimit` or limited `ReadProblem` built in the spec, and observes the page's limit notice ending at the reply's `resumesAt` and the reread after; it fails with `noteFailedIntentRead`'s `noteLimitUntil` call removed (r2-vitest, r2-break) |
| C4 | Both locations-recovery and settings-problem files render the production Intent body (`BoardOrIntent`) at the required typed page entry; `intent-candidates-publication.ts` drops its provider composition for the production Intent body; no test file re-creates the page observation, the Intent body or its providers, and no test copy or restated provider stack remains | slice 10 |  |
| C5 | E2E proof on the composed page shows published detail and Intent locations share a wait that healing detail does not clear, until the published observation runs through the page entry | slice 4 |  |
| C6 | No production read keeps a defaulted reader parameter (`loadRepositoryTexts` `readFile`, `readCachedFile`) | slice 1 | observed: `loadRepositoryTexts`/`readCachedFile` take a required `readFile`; `preparationEnrichment.ts` keeps only a type import of `readRepositoryFileAt`; no direct `readPublishedSnapshot`, `readRepositoryFileAt` or `checkPublishedRevision` call in `publishedObservation.ts`, `requestedRead.ts`, `publishedWorkRead.ts`, `revisionCheckSchedule.ts`; every `PublishedObservationReadSource` member is required |
| C7 | Typed replies are built by MakeMe instead of hand-written `IntentReadSource`/`ReadProblem` data repeated per case | slice 4 |  |
| C8 | Each spec's and helper's production imports shrink to the entry, its typed inputs and stylesheets | slice 4 |  |
| C9 | The recovery cases keep their title and distinguishing assertion for the 15/30/60/60-second transient schedule | slice 4 |  |
| C10 | The recovery cases keep their title and distinguishing assertion for no request while hidden and one on reveal | slice 4 |  |
| C11 | The settings-problem cases keep their title and distinguishing assertion for malformed settings until manual Retry | slice 3 |  |
| C12 | Rereading when a standing rate limit ends keeps its title and distinguishing assertion | slice 4 |  |
| C13 | Product behavior is unchanged by the correction | slice 1 | observed: consumer-traced frontend selection 57/57 passed including `intent-read-recovery.spec.ts`, `intent-gherkin-settings-problems.spec.ts`, `accessible-board-announcements.spec.ts` with unchanged assertions (s1a-frontend); 41 E2E specs including every `e2e/observation/*` published-detail journey passed, the 3 load-48 timeouts in untouched journeys passing on isolated rerun (s1a-e2e, s1a-e2e-rerun); 12 backend specs passed with one load timeout passing on rerun (s1a-backend, s1a-backend-rerun) |
| C14 | The 2-file selection's elapsed time stays within paired noise of its delivered run, or the regression is recorded with its reason | slice 4 |  |
| C15 | Fast Vitest proof of browsing Gherkin and code sources at the chosen scope, line and revision: clicking names and toggles selects or expands the intended item | slice 6 |  |
| C16 | Gherkin panes scroll independently | slice 7 |  |
| C17 | A missing Java grammar keeps readable plain text | slice 8 |  |
| C18 | Selecting an Optimization Candidates case opens its exact source and line | slice 8 |  |
| C19 | Canonical and plan links use the inspected revision | slice 5 |  |
| C20 | External, unsafe and invalid targets keep their distinct results | slice 5 |  |
| C21 | When a pinned file read fails, the reader sees the specific cause | slice 9 |  |
| C22 | After a pinned read failure, the reader can Retry to load the right revision and source | slice 9 |  |
| C23 | While a later revision is pending, Purpose keeps the applicable source | slice 9 |  |
| C24 | A developer can open Project Intent or a selected story | slice 9 |  |
| C25 | With a file selected two folders deep in a story's Changes, a visit to Development and back restores the story, file and reading position | slice 10 |  |
| C26 | That detour restore happens without extra reads | slice 10 |  |
| C27 | Switching projects resets the reading place | slice 10 |  |
| C28 | All 22 legacy cases across the 15 owned files have a traceable disposition; each retired case's proof owner is recorded and its distinct assertions mapped to a new owner or named existing equivalent before deletion | slice 10 |  |
| C29 | The unit proof runs on Vitest without `act` wrapping; React `act` and `IS_REACT_ACT_ENVIRONMENT` are retired as the families move | slice 10 |  |
| C30 | Spent test-support modules whose last consumer moves are retired (`support/frontendSourceNavigation.ts`, `intentEntryFolderSummariesFixtures.ts`, `putFrontendFolderSources`); the shared test-support surface keeps shrinking | slice 10 |  |
| C31 | Composed source, settings, visit and popup navigation journeys are retained in representative `e2e/intent/` and `e2e/navigation/` coverage | slice 10 |  |
| C32 | Where they are the proof, exact wording, accessibility, viewport and input distinctions, races, and error/retry boundaries are preserved; distinct risks needing separate setup or diagnosis stay separately named | slice 10 |  |
| C33 | A two-worker before/after elapsed comparison for the 15-file cohort, with preparation, counts by engine and destination, remaining slow cases and the runtime of proof promoted to E2E; each engine run explicitly, paired under comparable load when noisy; actual time and remaining cost reported | slice 10 |  |
| C34 | The record reports why repeated cases were consolidated or kept | slice 10 |  |
