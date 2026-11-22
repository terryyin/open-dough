# Get fast proof of Intent source browsing, pinned links and detours

**Identity:** SEED-413#speed-intent-source-browsing-and-detours
**Source:** [Get fast proof of Intent source browsing, pinned links and detours](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-browsing-and-detours)
**Source review:** [source-review.md](source-review.md)
**Split from:** SEED-413#speed-intent-source-and-story-reading (plan `755`, former Slices 3–4) on 2026-11-21 at its delivered Slice 2 boundary

## Goal and scope

**Correction first.** Slices 1–4 correct the locations read-recovery and
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
CI status entry correction (recoverable at
`7b9e64961:.planning/slice-plans/764-speed-intent-ci-status-frame-and-timing-history/PLAN.md#correction-of-the-ci-status-test-entry`)
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
settings-problem proof that renders the production Intent body
(`BoardOrIntent`, whose `IntentReadRecovery` owns the Intent schedule,
visibility and limit rereads) through the required typed page entry, with
typed replies built by MakeMe, and E2E proof on the composed page that
published detail and Intent locations share a wait that healing detail does
not clear. Each spec's and helper's production imports shrink to that entry,
its typed inputs and stylesheets.

**Amended 2026-11-22 (Terry).** Rendering the published observation itself
(`ConfiguredDashboard`) also reaches reads outside the page entry: the
revision stream's `EventSource`, the detail reads in
`publishedWorkDetails.ts` (sessions, agent profiles, assignments, done
stories, slice clocks, moved progress), machine sessions from
`useAgentLaunches`, and module-level transient-failure state that
production clears only on a project change. Bringing them into the entry is
queued as SEED-413#drive-published-observation-through-page-entry; until then the shared wait is proved in E2E.

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
  `RetainedFollowUpPerspective`). No
  test file renders `IntentPageProviders`, `IntentReadingProvider`,
  `StorySelectionProvider`, `useLimitRecovery` or `IntentReadRecovery`
  itself, and no case mounts `ProjectIntentReading` with hand-supplied mode
  props.
- Add each read a case needs as a **required** member of the typed page
  entry, never as an optional member, context default, separate
  default-valued context or defaulted parameter. This covers the published
  observation's reads (Slice 1) and the source highlighter (Slice 8).
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
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` in Slice 5 before replacing the
  first legacy spec, and compare the completed 15-file cohort in Slice 10.

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
| A typed rate-limited reply sets the page's standing limit without the transport | Slice 2 (`npm run typecheck:dashboard`, a focused typed-reply limit case, the existing limit Vitest cases and one rate-limit E2E journey). |
| Settings-problem cases render the production Intent body with MakeMe replies, not a `fetch` spy or transport calls | Slice 3 (`intent-gherkin-settings-problems`, import counts). |
| Locations recovery cases render the production Intent body with MakeMe replies, not a test copy, and the shared detail/locations wait is proved on the composed page | Slice 4 (`intent-read-recovery`, one E2E journey, delete `PageIntentRecovery`, import counts, paired timing). |
| Canonical and plan links use the inspected revision, external/unsafe/invalid targets stay distinct, and popup activation is proved in E2E | Slice 5 (`navigation/source-navigation*` + `e2e/navigation/source-navigation.spec.ts` + retire `frontendSourceNavigation.ts`). |
| Entry and folder summaries aggregate nested test counts and expand or select cleanly | Slice 6 (`intent-entry-folder-summaries*` + retire `intentEntryFolderSummariesFixtures.ts` and `putFrontendFolderSources`). |
| Gherkin groups select scenarios and outlines while tree and feature panes scroll independently | Slice 7 (`intent-gherkin-groups`, `intent-gherkin-layout`). |
| Missing Java grammar falls back to readable plain text and Candidates cases open at their exact source line | Slice 8 (required source highlighter read + `intent-code-browse-java`, `intent-purpose-case`). |
| Project Intent activation, project visits, cached reads, and pending revisions/selections keep the applicable source over the production Intent body | Slice 9 (production Intent body in place of `intent-candidates-publication.ts`'s composition + `intent-home-activation`, `intent-project-visit*`, `intent-read-reuse`, `intent-selection-reads`). |
| Reading place and recent stories restore the story, nested file and reading position after a detour, and another project starts its reading afresh | Slice 10 (`intent-reading-place`, `intent-recent-stories` + 15-file two-worker before/after comparison). |

## Slices

### 1. The page observation's reads enter through the required typed page entry

Type: Structure
Status: done

Add the published observation's reads (`usePublishedObservation`: published
work and membership, preparation detail through `loadRepositoryTexts`, and
the revision check) as required members of plan 759's typed page entry.
`authenticatedPageReads` supplies the authenticated readers, and
`ConfiguredDashboard` hands the observation its members from its `reads`
prop down the chain `carryOutRead` → `readPublishedWork` →
`readPublishedDetails` → `enrichPreparation`, `readMovedProgress`, and
`useObservedRevisionDelivery` → the revision check schedules.
`enrichPreparation` passes `loadRepositoryTexts` the detail reader it is
given instead of importing `readRepositoryFileAt`. Limit recording stays in
the transports; Slice 2 adds Intent's own recorder. Point the existing test composition at the
new members without changing any assertion, so Slices 3–4 replace it with
production.

**Proof.** `npm run typecheck:dashboard` passes. The 2 recovery and
settings-problem files and the preparation Vitest files pass unchanged in
their assertions. One representative E2E journey that reads published detail
passes, proving that production supplies the readers. `grep` finds no
`readRepositoryFileAt` import in `dashboard/src/preparationEnrichment.ts` and
no direct published read in `publishedObservation.ts`.

**Learnings.** The observation's reads are `PageReads.observation`
(`PublishedObservationReadSource` in
`dashboard/src/publishedObservationReadSource.ts`: `readSnapshot`,
`readDetailFile`, `checkRevision`). `readPublishedWork` takes them as its last
parameter because `navigation/board-frame-mount.ts` mocks
`publishedWorkRead.ts` and `observedRevisionDelivery.ts` and
`accessible-board-announcements.spec.ts` asserts call positions 4 and 5; that
frame and its 13 consumers could instead supply typed replies through
`pageReadsSupplying` (named follow-up for the SEED-413 campaign, outside this
plan). `readPublishedDetails` still reads agent profiles and moved branch
progress (`readMovedProgress`) through their authenticated readers directly;
Rendering the whole observation in a case is queued as
SEED-413#drive-published-observation-through-page-entry (amendment above). Proof: `npm run typecheck:dashboard`; the consumer-traced
frontend selection (57 cases, including the recovery, settings-problem and
board announcement files) with unchanged assertions; 41 E2E specs including
every `e2e/observation/*` journey and 12 backend specs. Three E2E and one
backend timeout at load 48 in untouched journeys passed on isolated rerun at
load 29–32; CI's verdict settles them.
CI repair: branch run 45022526204 at `14f70e8a9` failed Distribution Tests
3/3 on its 320 s test deadline (306 s, slow runners, no failing test; shard 3
held 336 files, 737 s median against 635 s). Terry accepted
`rebalance-ci-shards`' move of `Distribution/tests/skills/dough-story-refinement/**`
into share 1 (691/635/682 s); the next runs check it.
Trunk landed the same move at `7ff45deab`; the branch's line now matches
trunk's pattern order so integration merges cleanly.

### 2. A typed rate-limited reply sets the page's standing limit without the transport

Type: Structure
Status: done

Split from Slice 1 on 2026-11-22: `noteLimit`'s callers are only
`authenticatedGet.ts` and `revisionCheckRead.ts`, but `authenticatedGet` is
the shared transport of 12 read modules. A first attempt found no single
receiving owner: profile, session and containment reads and the revision
stream bypass `PageReads`, the transport derives `resumesAt` from the limit
it has just recorded, `limitsMetSince` counts limits met during a read, and
the transport skips recording for an aborted read. Intent's limited reread
waits on the page's standing limit (`IntentReadRecovery`'s `limitStands`),
so a typed reply must set it.

**Decision (Terry, 2026-11-22):** the transports keep recording. Intent
reading, on receiving a limited `ReadProblem`, also records the standing
limit until that problem's `resumesAt` through a new recorder in
`readingLimit.ts` (for example `noteLimitUntil`), so a MakeMe-built
rate-limited Intent reply drives Slice 4's case. Recording is idempotent for
live reads: a further limited answer only moves the limit later.

**Proof.** `npm run typecheck:dashboard` passes. A focused case shows a
typed rate-limited Intent reply, supplied through the page entry, sets the
standing limit and Intent rereads once it ends, without calling
`noteLimit`/`standingLimit` or constructing `ReadProblem` in the spec. The
existing rate-limit Vitest cases and one E2E journey that meets a
rate-limited read pass unchanged in their assertions.

**Learnings.** `readingLimit.ts`'s `noteLimitUntil` holds the standing
limit until a received limited answer's `resumesAt` without counting it;
`noteFailedIntentRead` (`intentReadRecovery.tsx`, called from
`useIntentLocations.ts` and `IntentCandidatesRecord.tsx`) records it.
`makeMe.aRateLimitedIntentReply` builds the typed reply, and
`intent-read-recovery.spec.ts`'s rate-limit case already uses it; that
spec's only remaining `ReadProblem` is the unreachable reply. Proof:
typecheck; the 4 Intent recovery, candidates and settings Vitest files
(14 cases); the trace-selected Intent specs; the rate-limited E2E journeys
`intent-read-boundary-recovery` and `intent-candidates-read-recovery`; a
break check with the recorder call removed failing the rate-limit case.
CI repair: branch run 45026419659 at `5f28e1a94` failed the native evidence
identity checks because the builder's `ReadProblem` import pulled a dashboard
file into `makeMe.mjs`'s import closure. The builder now lives in
`Distribution/tests/support/rateLimitedIntentReplyTestData.mjs`, registered
only on `pageMakeMe.mjs`; page-loadable builders that construct production
values belong there, outside `makeMe.mjs`'s closure.

### 3. Settings-problem cases render the production Intent body

Type: Structure
Status: done

Split from the former Slice 3 on 2026-11-22 (Terry's amendment above).
Render `intent-gherkin-settings-problems` through the production Intent body
(`BoardOrIntent` under the real `PageFrame`, as
`dashboard/frontend-tests/intent/intent-ci-page-mount.ts` does) with typed
replies through the page entry. Add a MakeMe step for the unreachable
locations answer and remove the `fetch` spy, `requestIntentLocationsAt` and
`ReadProblem` from the spec. Keep role-based colocated page objects.

**Proof.** The file keeps its three titles and distinguishing observations
and passes at `--workers=2`. No test file renders `IntentReadRecovery`,
`PublishedReadStatus` or `ProjectIntentReading` itself. Production import
count before (6 at `5f28e1a94`) and after.

**Learnings.** `mountIntentCiPage`
(`dashboard/frontend-tests/intent/intent-ci-page-mount.ts`) serves any case
that needs the production Intent body under the real `PageFrame`.
`makeMe.anUnreachableIntentReply` (`unreachableIntentReplyTestData.mjs`,
registered on `pageMakeMe.mjs` only) builds the transport's transient
problem. The spec's production imports fell from 6 to 3, all type-only.
Proof: typecheck; the spec 3/3 at `--workers=2` (10.3 s alone at load
28–34); the native identity checks; `intent-read-recovery.spec.ts` 5/5 as the
other `pageMakeMe` consumer.

### 4. Locations recovery cases render the production Intent body and the shared wait is proved on the composed page

Type: Structure
Status: planned

Render `intent-read-recovery` through `BoardOrIntent` with typed replies
through the page entry and delete `PageIntentRecovery` from
`intent-read-recovery-page.tsx`. Remove `clearAllTransientFailures` and the
remaining `ReadProblem` construction; if cases leak module-level transient
state without the reset, return the evidence for
SEED-413#drive-published-observation-through-page-entry instead of a test-side reset.
Prove "published detail and Intent locations share a wait" in one E2E
journey on the composed page (reuse an existing `e2e/observation/` or
`e2e/intent/` recovery journey when one already observes it), and map the
retired Vitest case to it.

**Proof.** The 15/30/60/60-second schedule, no request while hidden and one
on reveal, malformed settings shown until manual Retry, and the reread when
a standing limit ends keep their titles and
distinguishing assertions at `--workers=2`; the E2E journey fails when the
shared wait is broken in production. Production import counts before (5 and
12 at `5f28e1a94`) and after. The 2-file selection's elapsed time stays
within paired noise of its baseline (12.2 s at load 28.65,
`s3-baseline-proof.json`) or the regression is recorded with its reason.

### 5. Pinned and refused source navigation links use the inspected revision and keep external, unsafe and invalid targets distinct

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

### 6. Intent entry and folder summaries aggregate nested test counts and select or expand cleanly

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

### 7. Gherkin groups select scenarios and outlines while tree and feature panes scroll independently

Type: Behavior
Status: planned

Move `intent-gherkin-groups` (1) and `intent-gherkin-layout` (1, keeping any
JSX container helper in a `.tsx` file) over the production Intent body and the
page entry.

**Proof.** Scenario and Scenario Outline items select and highlight their block,
and the Intent browser tree and Gherkin feature pane keep independent scroll
positions inside a constrained viewport height.

### 8. Java source fallback keeps readable plain text on grammar failure and Candidates cases open at their exact source line

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

### 9. Project Intent activation, project visits, cached reads and pending selections keep the applicable source

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

### 10. Reading place and recent stories restore the nested file and reading position after a detour

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
