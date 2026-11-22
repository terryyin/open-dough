# Get fast proof of Intent source browsing, pinned links and detours

**Identity:** SEED-413#speed-intent-source-browsing-and-detours
**Source:** [Get fast proof of Intent source browsing, pinned links and detours](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-browsing-and-detours)
**Split from:** SEED-413#speed-intent-source-and-story-reading (plan `755`, former Slices 3–4) on 2026-11-21 at its delivered Slice 2 boundary

## Goal and scope

**Correction first.** Slices 1–2 correct the locations read-recovery and
settings-problem entry delivered by SEED-413#speed-intent-source-and-story-reading
(see [Correction of the locations recovery test entry](#correction-of-the-locations-recovery-test-entry))
before any source-browsing move builds on it. They start after plan 759
lands the required typed page entry and plan 764's Slices 1–2 land the
remaining page reads and the standalone production Intent body.

Dashboard maintainers get fast Vitest feedback that a developer can browse
Gherkin and code sources at the chosen scope, line and revision, follow
canonical and plan links safely, open Project Intent or a selected story, and
resume the exact reading place after a detour through another view. Move the
22 legacy Playwright cases across 15 files:
- `dashboard/frontend-tests/navigation/`: `source-navigation` and
  `source-navigation-refused` (2 files, 3 legacy cases)
- `dashboard/frontend-tests/intent/`: `intent-entry-folder-summaries`,
  `intent-entry-folder-summaries-folders`, `intent-gherkin-groups`,
  `intent-gherkin-layout`, `intent-code-browse-java`, `intent-purpose-case`,
  `intent-home-activation`, `intent-project-visit`,
  `intent-project-visit-selection`, `intent-read-reuse`,
  `intent-reading-place`, `intent-recent-stories` and
  `intent-selection-reads` (13 files, 19 legacy cases)

`intent-story-review-return` was deleted at `ffb4ef63d` with the Intent
header's control that opened Review (Slice 2 of
`759-read-every-changed-file-in-intent`), so no Review detour from Intent
remains to prove.
Replace the test composition in
`dashboard/frontend-tests/intent/intent-candidates-publication.ts` with the
production Intent body, and retire spent `dashboard/test-support/` modules
whose last consumer moves (`support/frontendSourceNavigation.ts`,
`intentEntryFolderSummariesFixtures.ts`, and `putFrontendFolderSources` on
`support/frontendIntentSources.ts`).

## Correction of the locations recovery test entry

Review of SEED-413#speed-intent-source-and-story-reading (`plan 755`,
recoverable at `e0f7d6a6a:.planning/slice-plans/755-speed-intent-source-and-story-reading/PLAN.md`;
implementation `634838a49`, landed at `6fa6ef623`) on 21 November 2026.
Terry raised it on reading the new page helper's import list. It repeats the
[CI status entry correction](../764-speed-intent-ci-status-frame-and-timing-history/PLAN.md#correction-of-the-ci-status-test-entry)
recorded in plan 759 about an hour after this delivery and now carried by
plan 764, and breaks the
same [shared acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories)
rule.

- **Symptom: long production import lists.** In `dashboard/frontend-tests/intent/`,
  `intent-read-recovery-page.tsx` imports from 11 production modules,
  `intent-read-recovery.spec.ts` from 6 and
  `intent-gherkin-settings-problems.spec.ts` from 5. The older
  `intent-candidates-publication.ts` (10), which this plan already owns, has
  the same shape and is the likely template.
- **Test code re-implements production composition.** `PageIntentRecovery`
  in `intent-read-recovery-page.tsx` is a hand-built copy of the page's
  published observation (`usePublishedObservation`: the detail read through
  `loadRepositoryTexts`, `ObservationOutcomes`, `recordSettledOutcomes`,
  `useLimitRecovery`, `usePageVisibility`) and of the page-header and Intent
  part of `ConfiguredDashboardContent` (`PublishedReadStatus`,
  `IntentReadRecovery`, `ProjectIntentReading` with hand-supplied mode
  props). The five recovery cases, including "published detail and Intent
  locations share a wait", therefore prove the test copy. A change to the
  production observation can break the shared wait while these cases still
  pass.
- **Production gained a test-only defaulted reader.** `loadRepositoryTexts`
  (`dashboard/src/repositoryFileReads.ts`) gained
  `readFile: typeof readRepositoryFileAt = readRepositoryFileAt`, which only
  the test copy passes. Production's published observation reads directly,
  with no typed read the page supplies, so it could not be driven and was
  copied instead. `readCachedFile` carries the same defaulted reader from an
  earlier change.
- **Cases reach below or around the typed reads.** The settings-problem spec
  spies on `globalThis.fetch` for the authenticated read endpoint and calls
  production `requestIntentLocationsAt` from its fake reader to turn a
  `TypeError` into the transport's failure. The rate-limit case calls
  production `noteLimit` and `standingLimit` and constructs `ReadProblem`
  itself. `onRecoveryClock` resets module-level transient state through
  `clearAllTransientFailures`.
- **Data built outside MakeMe, repeated per case.** Each spec hand-writes
  `IntentReadSource` objects with the same rejecting `readFile` and absent
  `readCandidates` members (four times across the two specs) and its own
  transient `ReadProblem`.

**Correction outcome.** Dashboard maintainers get locations recovery and
settings-problem proof that renders the production page observation and
Intent body through the required typed page entry, with typed replies built
by MakeMe. Each spec's and helper's production imports shrink to that entry,
its typed inputs and stylesheets.

**Preserved promises.** Every observation in the 5 recovery cases and the
settings-problem cases keeps its title and distinguishing assertion: the
15/30/60/60-second transient schedule, no request while hidden and one on
reveal, the shared wait with published detail that healing detail does not
clear, malformed settings until manual Retry, and rereading when a standing
rate limit ends. Product behavior is unchanged. The 2-file selection's
elapsed time stays within paired noise of its delivered run, or the
regression is recorded with its reason.

**Out of scope.** `setDocumentVisibility` simulates the browser's document
visibility, which is the real input `usePageVisibility` observes, and stays.

## Decisions and existing owners

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [North Star](../../NORTH-STAR.md),
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  and [frontend entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses).
  Use `mountComponent`, `pageMakeMe.mjs` (including typed
  `makeMe.anIntentLocationsAnswer` landed by
  `SEED-413#speed-intent-source-and-story-reading`), and colocated page
  objects under `dashboard/frontend-tests/intent/` and
  `dashboard/frontend-tests/navigation/` without `actSettled`, React `act`, or
  `IS_REACT_ACT_ENVIRONMENT`.
- Supply every read through the required typed page entry from plan 759
  (`PageReads` in `dashboard/src/pageReads.tsx`), which `App` passes to
  `ConfiguredDashboard` as `authenticatedPageReads` through its required
  `reads` prop and cases build with `pageReadsSupplying`. Render the
  production Intent body that plan 764 Slice 2 makes stand alone inside
  `BoardOrIntent` (`IntentReadRecovery` → `IntentPerspective` or
  `RetainedFollowUpPerspective`), or production `ConfiguredDashboard` when
  the page observation is part of the proof. No
  test file renders `IntentPageProviders`, `IntentReadingProvider`,
  `StorySelectionProvider`, `useLimitRecovery` or `IntentReadRecovery`
  itself, and no case mounts `ProjectIntentReading` with hand-supplied mode
  props.
- Add each read a case needs as a **required** member of the typed page
  entry, never as an optional member, context default, separate
  default-valued context or defaulted parameter. This covers the published
  observation's reads (Slice 1) and the source highlighter (Slice 6).
- Build every read reply and recurring input with page-loadable MakeMe
  builder steps: configured, absent, unusable, unreachable and rate-limited
  locations answers, file replies, and a page-reads value whose unused reads
  fail loudly. Do not construct `ReadProblem`, call transport functions such
  as `requestIntentLocationsAt`, spy on `fetch`, or call module-state
  functions such as `noteLimit`, `standingLimit` or
  `clearAllTransientFailures` from a spec or helper.
- For pinned and refused source links, exercise the pure URL and refusal
  rules (`resolveRepositoryBaseUrl`, `sourceLink`) directly. Observe rendered
  canonical and plan links on the production story card fed by typed
  published replies through the page entry, not by calling
  `enrichPreparation` to make its props. Keep one representative popup
  navigation check in `e2e/navigation/source-navigation.spec.ts`.
- Keep each spec's and colocated helper's production imports to the entry,
  its typed inputs and stylesheets. Record the count before and after for
  every file a slice touches; a longer list means the entry exposes too much
  or the case mounts below its owner, so fix the entry instead.
- Size every slice to a single component seam and 2–5 spec files (avoiding the
  18-path multi-seam bundle that overran former Slice 3 in `plan 755`; note
  that any spec file containing JSX mount wrappers must use `.tsx` or move JSX
  into a `.tsx` colocated page helper so `tsc --noEmit` passes). Capture the
  15-file / 22-case two-worker legacy baseline with
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` in Slice 3 before replacing the
  first legacy spec, and compare the completed 15-file cohort in Slice 8.

## Local gate

On macOS run from an awake machine on AC using `caffeinate -s -i` under the
maintained [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, the default test timeouts, explicit path selections, and the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run `npm run typecheck:dashboard` for changed production/types and run named
E2E companions when shared contracts or popup/focus boundaries change.

## Decisive premises and proof

- At `f981fc912` on 2026-11-21 (macOS on AC, `--workers=2`), `intent-source-target-recovery.spec.ts` and `intent-revision-update-failures.spec.ts` passed 5 cases proving the typed production reader retains a pinned file and switches after Retry.
- At `341f133da` on 2026-11-22, `npm run --silent test:dashboard:frontend -- <15 scoped files> --list --reporter=line` listed exactly `22` legacy `chromium` cases across the `15` scoped files: `intent-code-browse-java`, `intent-home-activation` 3, `intent-read-reuse`, `intent-reading-place`, `intent-selection-reads` and `source-navigation-refused` 2 each; every other file 1.
- At `341f133da` on 2026-11-22, after plan 759 Slices 1–2: `usePublishedObservation` (`dashboard/src/publishedObservation.ts`) still reads published work and detail (`carryOutRead` → `readPublishedWork`) without a typed read the page supplies; its only caller is `ConfiguredDashboard`, which now receives the required `reads: PageReads` prop and calls the hook before rendering `PageReadsOnPage`. `loadRepositoryTexts` and `readCachedFile` (`repositoryFileReads.ts`) take a required `readFile`; the two `loadRepositoryTexts` callers in `preparationEnrichment.ts` pass the imported `readRepositoryFileAt` rather than a page read. `noteLimit` is called only by the transports `authenticatedGet.ts` and `revisionCheckRead.ts`. The default-valued `IntentReadSourceOnPage` is gone; `intent-read-recovery-page.tsx`, `intent-gherkin-settings-problems.spec.ts` and `intent-candidates-publication.ts` supply `pageReadsSupplying({ intent })` through `PageReadsOnPage`.

| Promise | Owning proof |
| --- | --- |
| Production supplies the page observation's reads through the required typed page entry, with no defaulted reader parameter | Slice 1 (`npm run typecheck:dashboard`, the recovery and preparation Vitest files, one representative published-read E2E journey, `grep`). |
| Locations recovery and settings-problem cases render the production observation and Intent body with MakeMe replies, not a test copy | Slice 2 (`intent-read-recovery`, `intent-gherkin-settings-problems`, delete `intent-read-recovery-page.tsx`'s composition, import counts). |
| Canonical and plan links use the inspected revision, external/unsafe/invalid targets stay distinct, and popup activation is proved in E2E | Slice 3 (`navigation/source-navigation*` + `e2e/navigation/source-navigation.spec.ts` + retire `frontendSourceNavigation.ts`). |
| Entry and folder summaries aggregate nested test counts and expand or select cleanly | Slice 4 (`intent-entry-folder-summaries*` + retire `intentEntryFolderSummariesFixtures.ts` and `putFrontendFolderSources`). |
| Gherkin groups select scenarios and outlines while tree and feature panes scroll independently | Slice 5 (`intent-gherkin-groups`, `intent-gherkin-layout`). |
| Missing Java grammar falls back to readable plain text and Candidates cases open at their exact source line | Slice 6 (required source highlighter read + `intent-code-browse-java`, `intent-purpose-case`). |
| Project Intent activation, project visits, cached reads, and pending revisions/selections keep the applicable source over the production Intent body | Slice 7 (production Intent body in place of `intent-candidates-publication.ts`'s composition + `intent-home-activation`, `intent-project-visit*`, `intent-read-reuse`, `intent-selection-reads`). |
| Reading place and recent stories restore the story, nested file and reading position after a detour, and another project starts its reading afresh | Slice 8 (`intent-reading-place`, `intent-recent-stories` + 15-file two-worker before/after comparison). |

## Slices

### 1. The page observation's reads enter through the required typed page entry

Type: Structure
Status: planned

Add the published observation's reads (`usePublishedObservation`: published
work and membership, preparation detail through `loadRepositoryTexts`, and
the revision check) as required members of plan 759's typed page entry.
`authenticatedPageReads` supplies the authenticated readers, and
`ConfiguredDashboard` hands the observation its members from its `reads`
prop. `enrichPreparation` passes `loadRepositoryTexts` the detail reader it
is given instead of importing `readRepositoryFileAt`. Record the
standing rate limit where the read's owner receives a rate-limited
`ReadProblem`, so that a typed reply drives it without the transport; if that
move reaches beyond the two transports and the limit owner, stop and split.
Point the existing test composition at the new members without changing any
assertion, so the next slice replaces it with production.

**Proof.** `npm run typecheck:dashboard` passes. The 2 recovery and
settings-problem files and the preparation Vitest files pass unchanged in
their assertions. One representative E2E journey that reads published detail
passes, proving that production supplies the readers. `grep` finds no
`readRepositoryFileAt` import in `dashboard/src/preparationEnrichment.ts` and
no direct published read in `publishedObservation.ts`.

### 2. Locations recovery and settings-problem cases render the production observation and Intent body

Type: Structure
Status: planned

Render `intent-read-recovery` through production `ConfiguredDashboard` (or
the smallest production owner that holds both the published observation and
the Intent body, extracted in production so `ConfiguredDashboard` renders the
same component) with typed replies through the page entry, and delete
`PageIntentRecovery`. Render `intent-gherkin-settings-problems` through the
production Intent body. Add MakeMe steps for the page-reads value, the
unreachable and rate-limited locations answers and the detail file replies;
remove the `fetch` spy, `requestIntentLocationsAt`, `ReadProblem`,
`noteLimit`, `standingLimit` and `clearAllTransientFailures` from both specs
and their helper. Keep role-based colocated page objects.

**Proof.** Both files keep their titles and distinguishing observations and
pass at `--workers=2` within paired noise of their delivered run. No test file
renders `useLimitRecovery`, `IntentReadRecovery`, `PublishedReadStatus` or
`ProjectIntentReading` itself. Record each spec's and helper's production
import count before (12, 6 and 6 at `341f133da`) and after.

### 3. Pinned and refused source navigation links use the inspected revision and keep external, unsafe and invalid targets distinct

Type: Behavior
Status: planned

Capture the 15-file / 22-case legacy Playwright baseline at `--workers=2` with
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` before replacing the first legacy
file. Move `dashboard/frontend-tests/navigation/source-navigation` (1) and
`source-navigation-refused` (2) to plain Vitest over `sourceLink` /
`resolveRepositoryBaseUrl` and the production story card fed by typed
published replies through the page entry. Add a representative popup journey
in `e2e/navigation/source-navigation.spec.ts`, check callers, and delete
`dashboard/test-support/support/frontendSourceNavigation.ts`.

**Proof.** Canonical and plan links point at the inspected revision URL and
open in a popup in E2E; external links stay separate from snapshot files; and
unsafe (`javascript:`, traversal) or missing targets render as non-clickable
text. No case calls `enrichPreparation`.

### 4. Intent entry and folder summaries aggregate nested test counts and select or expand cleanly

Type: Behavior
Status: planned

Move `intent-entry-folder-summaries` (1) and
`intent-entry-folder-summaries-folders` (1) over the production Intent body,
the page entry and `makeMe.anIntentLocationsAnswer`. Check callers across
`dashboard/frontend-tests/` and `e2e/` and retire
`dashboard/test-support/intentEntryFolderSummariesFixtures.ts` and unused
`putFrontendFolderSources` on `dashboard/test-support/support/frontendIntentSources.ts`.
Retain `e2e/intent/intent-gherkin-browse.spec.ts` and
`e2e/intent/intent-code-browse-sources.spec.ts`.

**Proof.** Entry and nested folder rows aggregate test counts accurately, and
clicking names vs disclosure toggles selects or expands the intended scope.

### 5. Gherkin groups select scenarios and outlines while tree and feature panes scroll independently

Type: Behavior
Status: planned

Move `intent-gherkin-groups` (1) and `intent-gherkin-layout` (1, keeping any
JSX container helper in a `.tsx` file) over the production Intent body and the
page entry.

**Proof.** Scenario and Scenario Outline items select and highlight their block,
and the Intent browser tree and Gherkin feature pane keep independent scroll
positions inside a constrained viewport height.

### 6. Java source fallback keeps readable plain text on grammar failure and Candidates cases open at their exact source line

Type: Behavior
Status: planned

Add the source highlighter (`highlightSourceLines` in
`dashboard/src/sourceHighlight.ts`, consumed through `useSourceHighlight.ts`)
as a required member of the page
entry, supplied by `authenticatedPageReads`, so a case supplies a failing
highlighter without module-request interception. Move
`intent-code-browse-java` (2) and `intent-purpose-case` (1) over the
production Intent body.

**Proof.** A failing Java syntax highlighter leaves the `.java` source plain
and readable without erroring, and activating an Optimization Candidates case
opens its exact repository file and line anchor.

### 7. Project Intent activation, project visits, cached reads and pending selections keep the applicable source

Type: Behavior
Status: planned

Replace the provider and recovery composition in
`dashboard/frontend-tests/intent/intent-candidates-publication.ts` with the
production Intent body through the page entry, and verify its existing Vitest
consumers (`intent-candidates-read-recovery.spec.ts`,
`intent-revision-*.spec.ts`, `intent-source-target-recovery-mounted.spec.ts`).
Move `intent-home-activation` (3), `intent-project-visit` (1),
`intent-project-visit-selection` (1), `intent-read-reuse` (2), and
`intent-selection-reads` (2), retaining
`e2e/intent/intent-project-visit-ci.spec.ts`.

**Proof.** Selecting a story opens its own view while Project Intent reads the
published source, cached files avoid duplicate reads, pinned-file failures
name their cause and Retry to the right revision/source, and while a later
revision or selection is pending Purpose keeps the applicable source.
`intent-candidates-publication.ts`'s production import count drops from 11
(at `341f133da`).

### 8. Reading place and recent stories restore the nested file and reading position after a detour

Type: Behavior
Status: planned

Move `intent-reading-place` (2) and `intent-recent-stories` (1) over the
production Intent body. Audit remaining `dashboard/test-support/` consumers
across the 15 files and record the two-worker before/after comparison
including preparation and E2E runtime.

**Proof.** With a file selected two folders deep in a story's Changes, visiting
Development and returning restores the selected story, file and scroll
position without extra reads; choosing a Recent stories row reveals the story
view and keeps the perspective; switching projects resets the reading place;
and the 15-file Vitest suite runs faster at two workers than its recorded
legacy baseline.
