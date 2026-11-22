# Source review: SEED-413#speed-intent-source-browsing-and-detours

Obtained 2026-11-22 at Slice 1 acceptance, replacing the review obtained
before Slice 1 delegation because the story's "Correction first" bullet
changed when Slice 1 was split. A fresh general-purpose reviewer with no
conversation inheritance read one assembled file: the selected story section
(without its JSON records), the
[shared acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories)
its Evaluation cites, and the plan's
[correction input](PLAN.md#correction-of-the-locations-recovery-test-entry).
It was told to read no other file, change nothing and number independently
observable promises.

Unnumbered context it returned: the split-from lineage; the review findings
motivating the correction; Slices 1–3 before any source-browsing move as a
delivery order; scope ownership by file and the cases owned elsewhere;
separately owned runners, timing and renamed-diff follow-ups and SEED-341
coordination; shared-acceptance method guidance; fewer cases and faster
feedback as goals with the campaign target measured by the final story;
`setDocumentVisibility` out of scope; a shrinking shared test-support surface.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Production supplies the page's published observation reads through the required typed page entry, so the observation can be driven through that entry without a copy | slice 1 | observed: `PageReads.observation` (required, `dashboard/src/pageReads.tsx`) supplied by `authenticatedPublishedObservationReads`; `ConfiguredDashboard` passes `reads.observation` to `usePublishedObservation`, which hands it to `carryOutRead` → `readPublishedWork` → `readPublishedDetails` → `enrichPreparation` and the revision check schedule; `npm run typecheck:dashboard` exit 0 (s1a run records in `git rev-parse --git-path open-dough/evidence`: s1a-typecheck2) |
| C2 | No production read keeps a defaulted reader parameter (`loadRepositoryTexts`, `readCachedFile`); reads are added as a required typed source, never an optional member, context default or defaulted parameter | slice 1 | observed: `loadRepositoryTexts`/`readCachedFile` take a required `readFile`; `preparationEnrichment.ts` keeps only a type import of `readRepositoryFileAt`; no direct `readPublishedSnapshot`, `readRepositoryFileAt` or `checkPublishedRevision` call in `publishedObservation.ts`, `requestedRead.ts`, `publishedWorkRead.ts`, `revisionCheckSchedule.ts`; every `PublishedObservationReadSource` member is required |
| C3 | The standing rate limit is recorded where a typed reply is received; the rate-limit case is driven by a typed reply without `noteLimit`/`standingLimit` or a hand-built `ReadProblem` | slice 2 |  |
| C4 | The locations recovery and settings-problem files render the production page observation and Intent body through the required typed page entry, not `PageIntentRecovery` or another copy | slice 3 |  |
| C5 | Every case supplies reads only through the typed page entry: no `globalThis.fetch` spy, no transport or limit function calls, no private pipeline calls to build a view's props | slice 3 |  |
| C6 | Typed replies and inputs for these specs are built by MakeMe; hand-written repeated `IntentReadSource` and `ReadProblem` objects are gone | slice 3 |  |
| C7 | Production imports in each spec and helper shrink to the typed page entry, its typed inputs and stylesheets | slice 3 |  |
| C8 | `intent-candidates-publication.ts` renders the production Intent body instead of its provider composition; no test restates a provider stack | slice 8 |  |
| C9 | Preserved: the 15/30/60/60-second transient retry schedule keeps its title and distinguishing assertion | slice 3 |  |
| C10 | Preserved: no request while the page is hidden, one on reveal | slice 3 |  |
| C11 | Preserved: published detail and Intent locations share a wait, and healing the detail does not clear it; the case fails if a production observation change breaks the shared wait | slice 3 |  |
| C12 | Preserved: malformed settings stay shown until a manual Retry | slice 3 |  |
| C13 | Preserved: the page rereads when a standing rate limit ends | slice 3 |  |
| C14 | Product behavior is unchanged by the correction | slice 1 | observed: consumer-traced frontend selection 57/57 passed including `intent-read-recovery.spec.ts`, `intent-gherkin-settings-problems.spec.ts`, `accessible-board-announcements.spec.ts` with unchanged assertions (s1a-frontend); 41 E2E specs including every `e2e/observation/*` published-detail journey passed, the 3 load-48 timeouts in untouched journeys passing on isolated rerun (s1a-e2e, s1a-e2e-rerun); 12 backend specs passed with one load timeout passing on rerun (s1a-backend, s1a-backend-rerun) |
| C15 | The 2-file selection's elapsed time stays within paired noise of its delivered run, or the regression is recorded with its reason | slice 3 |  |
| C16 | Clicking names and toggles selects or expands the intended item at the chosen scope (folder summaries, groups) | slice 5 |  |
| C17 | Gherkin panes scroll independently | slice 6 |  |
| C18 | A missing Java grammar keeps readable plain text | slice 7 |  |
| C19 | Selecting an Optimization Candidates case opens its exact source and line | slice 7 |  |
| C20 | Canonical and plan links use the inspected revision | slice 4 |  |
| C21 | External, unsafe and invalid link targets each keep their distinct result | slice 4 |  |
| C22 | When a pinned file read fails, the reader sees the specific cause | slice 8 |  |
| C23 | After a pinned file read failure, Retry loads the right revision and source | slice 8 |  |
| C24 | While a later revision is pending, Purpose keeps the applicable source | slice 8 |  |
| C25 | A developer can open Project Intent or a selected story (home activation, project visit and selection) | slice 8 |  |
| C26 | With a file selected two folders deep in a story's Changes, a visit to Development and back restores the story, the file and the reading position | slice 9 |  |
| C27 | The detour return in C26 happens without extra reads | slice 9 |  |
| C28 | Switching projects resets the reading place | slice 9 |  |
| C29 | All 22 legacy cases across the 15 owned files have a traceable disposition; retired cases' distinct assertions map to a new owner or named existing equivalent, with each proof owner recorded | slice 9 |  |
| C30 | Reductions preserve exact wording, accessibility, viewport and input distinctions, races, and error/retry boundaries where they are the proof; distinct risks needing separate setup or diagnosis stay separately named | slice 9 |  |
| C31 | The record states why repeated cases were consolidated or kept | slice 9 |  |
| C32 | The unit proof runs on Vitest with no React `act` wrapping and no `IS_REACT_ACT_ENVIRONMENT` in the moved families | slice 9 |  |
| C33 | Spent support is removed as its last consumer moves (`support/frontendSourceNavigation.ts`, `intentEntryFolderSummariesFixtures.ts`, `putFrontendFolderSources`) | slice 9 |  |
| C34 | Composed source, settings, visit and popup navigation journeys stay in representative `e2e/intent/` and `e2e/navigation/` coverage | slice 9 |  |
| C35 | A two-worker before/after elapsed comparison for the 15-file cohort, with preparation, counts by engine and destination, remaining slow cases, each engine run explicitly and paired under comparable load when noisy | slice 9 |  |
| C36 | The runtime of proof promoted to E2E, including popup/focus runtime, is recorded and included in the comparison | slice 9 |  |
