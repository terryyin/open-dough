# Keep Done story Intent pinned to the landed result

**Identity:** SEED-283#keep-done-story-intent-pinned
**Source:** [selected story](../../seeds/SEED-283-keep-done-story-intent-pinned.md#keep-done-story-intent-pinned)

## Goal and scope

A developer can review a Done story's changed tests and recorded evidence
after trunk has moved on. Its browser uses the story's baseline/result diff
and landing's test locations, inventory, and unchanged-file source. All three
Done tabs stay independent of project freshness. Project Intent owns its
revision notice and refresh, and visibly names the revision its browser shows,
even after a planning-only update and with no file selected.

Historical gaps explain the unavailable source without substituting current
trunk or implying no changes. CI, source, and saved coverage retain independent
loading/failure/absence/result states and supported recovery. Project refresh
keeps the prior shown revision through updating/failure and advances the label
on accepted locations, with the existing reading/focus/retry behavior.

No CI endpoint, collection, proof-schema, assessment-process, history-retention,
or selection-workflow change. Preserve explicit equivalent/later-build
provenance and Check again: a proof's measured revision is distinct from the
source tree at landing. SEED-282 owns common layout/comparison presentation
and is not a prerequisite. Reconcile with that work if it lands first rather
than duplicating its presentation. Preparation authorizes no implementation.

## Architecture and existing solutions

Follow [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
and [ADR 0002, principles 2 and 5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
The ADR index and relevant in-file statuses agree; no conflict or supersession
affects this approach. Published Git/records own the evidence, while cached
answers and reading place remain rebuildable/disposable. The existing
[North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
supports these ordinary read and presentation responsibilities; no new topic,
ADR, database, service, or source of truth is warranted.

PFE traced the following existing owners at
`c7e41e9e4abdd957e3b1117a1bba13d27749d1e6`:

- `IntentPerspective.tsx` currently creates one `useShownIntentLocations`
  result from project work and supplies it to project and story. Change this
  orchestration so historical story source and refreshable project reading
  have their own correct inputs. `IntentReadingScope` and the page's existing
  reading place already isolate project/story browsing; preserve that boundary
  and prevent a newly selected story from inheriting another story's revision.
- `storyComparisonShown.ts` already owns the comparison and file diffs.
  `storyReviewPublished.ts` returns both the published completion commit and
  its Git tree. Read source/settings at the published result commit, not the
  synthetic baseline or the raw tree object. Keep that source revision
  distinct from CI's measured endpoint. Reuse the existing landed-result
  provenance when a supported retained comparison supplies it; do not invent
  a current-trunk fallback if the historical result cannot be established.
- `authenticatedIntentRead.ts`, `useIntentLocations.ts`, and
  `server/intentLocationsRead.ts` already read/cache locations and settings at
  an explicit revision. Reuse that read path for history. Existing location
  selection, `intentStoryOverlay.ts`, rename mapping, outside count, and
  `IntentFileReading.tsx` already own changed/deleted-file placement and diffs.
  Keep one model rather than copying a Done-only browser or selection grammar.
- `IntentCiEvidence.tsx` already separates project/story evidence;
  `intentCiComparisonResolve.ts` owns historical endpoint/proof recovery;
  `IntentStoryCoverage.tsx` owns the saved report and missing-record states.
  Preserve these owners and keep them usable when locations cannot be read.
- `IntentRevisionNotice.tsx` and `useIntentLocations.ts` already distinguish
  observed, requested, and successfully shown revisions. Use the shown
  revision for the persistent project-browser label and retain existing
  update/retry/focus behavior. A selected file already names its source
  revision, which does not replace a browser-wide label with no selection.

The common rule is evidence ownership: story source comes from its published
result, current project reading advances only through its own refresh.
Separate input lifecycles are justified by those meanings; duplicate evidence
models or per-tab historical implementations are not.

## Outside-in proof ownership

Arrange automated domain data through the shared MakeMe API under
[test data architecture](../../../tests/README.md#test-data-architecture).
Extend the existing canonical completion/published-revision fixtures; state
post-landing file/settings facts at the case site. Do not stub the result the
production historical reader must establish.

| Final promise | Owner | Observable proof |
| --- | --- | --- |
| Historical locations/inventory/source and original diff survive later test rename/deletion/addition and settings change | 1 | Extend `intent-story-completed.spec.ts` and the real completion fixtures: advance trunk with changed test paths and removed/changed locations, then open Changed tests. Assert landing's location, unchanged source, modified/added/deleted/renamed diff, absence of later-only files, and equality with Review changes. Cover Trunk completion and the Story Branch/merge fixture in `intent-summary-story-comparison-file.spec.ts`. Record actual revision arguments; do not satisfy the browser by intercepting a fabricated historical answer. |
| All three Done tabs lack project freshness controls and keep story evidence after a project visit/refresh | 1 | A controlled-clock Done journey observes a newer published trunk, switches all tabs, visits Project Intent and refreshes, then returns to the same story/file/Purpose or Proof/scroll. Assert no story revision notice/Show latest, fixed story comparison endpoints and saved coverage, project-only refresh, and keyboard return. Extend `intent-project-visit.spec.ts` using its existing isolation journey. |
| Historical comparison/source/coverage gaps are distinct, explained, and do not silently show current tests | 1 | Update the shallow-history case in `intent-story-completed.spec.ts`; add a failed historical locations read with supported Retry. Assert the Done view never claims the current tree is its history or that missing evidence means no changes. Retain `intent-story-coverage.spec.ts`'s saved unavailable/no-assessment/failed-record states and CI-gap journeys; one unavailable source must not hide the other tabs. |
| Existing historical CI provenance and recovery remain supported | 1 | Retain `intent-ci-comparison-gaps.spec.ts`, `intent-ci-comparison-cancelled-landing.spec.ts`, `intent-ci-comparison-cancelled-landing-gaps.spec.ts`, and `intent-ci-comparison-retry.spec.ts` through the affected Intent suite. Extend only the cross-tab revision isolation observation; do not rewrite endpoint rules. |
| Project browser's shown revision stays visible and advances after planning-only updates, including no file selection | 2 | Extend `intent-revision-notice.spec.ts` with unchanged test files plus a changed planning record: before refresh label remains old, during held read label stays old, success moves it to the new revision and keeps it visible. Observe with a selected file and after returning to the project browser's no-file homepage. Verify actual locations requests use that new revision. |
| Failed updates keep old label/source, Retry applies the requested revision, and focus/reading survive | 2 | Extend `intent-revision-update-outcomes.spec.ts` and `intent-revision-update-boundaries.spec.ts`: retain old shown label through network/unreadable-settings failure and reopening; successful Retry advances it. Keep selected-path deletion explanation, project-switch isolation, keyboard focus and reading-place assertions. Project CI's independently followed revision is not labelled as the browser's shown source. |
| Maintained guidance describes the delivered evidence and refresh boundaries | 1, 2 | Update historical story/CI wording with slice 1 and Project Intent/revision wording with slice 2 in the existing Intent documents. Review the concrete examples against delivered behavior. |

## Ordered slices

### 1. Read a Done story from its published result

Type: Behavior
Status: planned
Proof: slice 1 rows above, through the real published completion and
authenticated historical locations/source read boundaries.

A story has completed and trunk later changes its tests/settings → open its
Intent tabs → Changed tests shows the landing's locations, test inventory and
baseline/result changes, CI comparison keeps its story provenance, and Intent
coverage shows its saved assessment. A current project revision never offers
Show latest in these Done tabs. Visit/refresh Project Intent and return →
story evidence and its reading remain unchanged. Unrecoverable comparison or
historical-source failure explains that gap without showing current trunk as
the story, while independent evidence remains usable.

Change existing source-read orchestration and its input/provenance derivation;
reuse the browser, comparison, overlay, and evidence owners. Keep loading and
gap presentation specific to the selected story's available evidence, including
initially unread history and changed selection. Replace the current Done
shallow-history expectation of a usable current published tree with the
historical unavailable behavior. Preserve the active-story no-workspace/current
tree journey, which has a different meaning and remains outside this change.
Align story and historical-CI documentation and affected observers in this
slice. Consult any landed common-frame changes before editing presentation.

Safe stopping point: Done stories have trustworthy historical reading and no
project refresh notice; Project Intent still has its existing notice/recovery,
with a persistent browser revision label supplied by slice 2.
Sizing hypothesis: one historical-source selection rule, one real Done-story
reading/absence proof loop, and reuse of the existing revision-keyed reader.
No preparatory Structure slice is needed for these already-present owners.

### 2. Show the Project Intent browser's current revision through refresh

Type: Behavior
Status: planned
Proof: slice 2 rows above under the existing controlled page clock and
authenticated request holds/failures.

Project Intent is showing revision A → observe B whose only change is planning
→ the project notice offers Show latest beside the browser and its visible
revision label still names A. Apply B → keep A during the read; success names
B persistently, even with identical test files and no selected file. Failure
keeps A and its reading with Retry; accepted retry names B. Project freshness
controls belong to Project Intent, and returning to a selected story retains
that story's own evidence/reading.

Use the existing successfully shown locations revision and notice lifecycle.
Do not label the latest observed work, a requested-but-failed revision, a
selected file's independently retained text, or the CI build as the browser's
current source. Keep existing malformed-settings, path-removal, focus return,
project switching, narrow/zoomed layout, and independent CI behavior. Align
project Intent guidance and browser-wide revision assertions in this slice.

Safe stopping point: the complete story promise is delivered; current project
freshness and historical story evidence are understandable independently.
Sizing hypothesis: one project refresh/feedback proof loop using the existing
state machine; success, held read, failure, and retry are states of that same
outcome, not separate slices.

## Consumer trace and verification gates

Inspected consumers include `IntentStoryView.tsx`, `IntentProjectView.tsx`,
`IntentBrowser.tsx`, `IntentFileReading.tsx`, `IntentStoryComparison.tsx`,
`useIntentLocations.ts`, and `pageIntentReading.tsx`. A source revision reaches
the location inventory, unchanged-file Purpose, candidates, overlays/outside
counts, and file/folder CI views. Shared comparison wording also reaches Review
changes; specialize missing-history presentation only where Done meaning
requires it. Never weaken active-story gap expectations by accident.

Observed test support includes `intentPerspectivePage.ts` (revision notice
selected by status text), `intentStoryPage.ts` (tab/diff/summary observers),
`intentRevisionJourney.ts` (paused-clock moving revisions/request accounting),
`intentCompletedStory.ts`, and `intentSummaryStoryComparisonFixture.ts` (real
CLI completion and published Git). The latter currently deliberately includes
`later.spec.ts` in the current tree: historical inventory changes can affect
Summary/outside rows and expected totals in `intent-summary-story-comparison*`
fixtures, not merely the new regression. Inspect their assertions and align
them with the same evidence rule. A file's existing source-revision caption
must remain truthful independently of the new browser-wide label.

For each implementation diff run the installed `consumer-trace.mjs` with
`--base HEAD` and terms for the old current-tree fallback, revision notice,
Show latest, and changed helper exports. Follow listed helpers to enclosing
journeys; disposition each consumer as run, reused, or excluded with evidence.
Use a single sufficient suite run rather than repeating its covered cases.

Focused development checks:

- Slice 1: `npm run test:dashboard -- tests/intent/intent-story-completed.spec.ts tests/intent/intent-story-coverage.spec.ts tests/intent/intent-project-visit.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-story-changes-gaps.spec.ts --workers=2` plus the newly added historical-revision journey.
- Slice 2: `npm run test:dashboard -- tests/intent/intent-revision-notice.spec.ts tests/intent/intent-revision-update-outcomes.spec.ts tests/intent/intent-revision-update-boundaries.spec.ts tests/intent/intent-project-visit.spec.ts tests/intent/intent-story-views-narrow.spec.ts --workers=2` plus its no-file/label assertions.
- For changed dashboard code: `npm run typecheck:dashboard` and `npm run lint`.
- Before delivery, `npm run test:dashboard -- tests/intent --workers=2` covers
  the affected consumer suite for shared source/reading changes, including
  Summary, Proof, candidates, request reuse, keyboard and narrow-view journeys.
  Run additional affected consumers the actual diff trace finds. A full
  repository run is not a local gate merely because hosted CI runs it.

**Local gate.** Follow [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long runs in **caffeinate -s -i**. On battery,
plug in or keep the lid open under **caffeinate -i** and inspect the sleep log.
Before expensive proof inspect this host's load/memory and competing work and
choose supported concurrency without reducing coverage. Follow
[the project's failure policy as written](../../../AGENTS.md#failing-and-flaky-tests)
for every failing/flaky test and published CI, including attribution to base,
preserving another active repair owner's work, and bounded human exceptions.
Use MakeMe for domain data, controlled clocks/events rather than sleeps, the
default timeout, and no test.slow() or suite/file/group/hook timeout overrides.

## Decisive premises and retained observations

Observed in this owned worktree on 2026-11-09 at
`c7e41e9e4abdd957e3b1117a1bba13d27749d1e6`, using the normal dashboard
Playwright config and Chromium fixtures. Domain setup reused the canonical
completion and published-revision fixtures. Temporary observation specs were
removed before recording refinement; no product edit or probe file remains.

The machine was on AC, with load 6.31/7.14/6.63, memory_pressure reporting 76%
free, and no other observed test run. The small two-worker observations ran
under the AC sleep guard; they are not a full-suite capacity claim. This fresh
worktree lacked node_modules; `npm ci --ignore-scripts --no-audit --no-fund`
established its local setup before the probes.

| Premise / consuming operation | Literal observation and profile | Result / unverified remainder |
| --- | --- | --- |
| The reported Done notice and source-context leak exists through the actual browser | `caffeinate -s -i npm run test:dashboard -- tests/intent/preparation-done-probe.spec.ts tests/intent/preparation-project-probe.spec.ts --workers=2 --reporter=line` using disposable specs in this checkout | 2/2 passed in 14.1 s, asserting the current undesirable behavior: Done tree contains later-trunk-only `later.spec.ts`; after a planning-only published commit all three tabs offer Show latest; applying it removes the notice and leaves the changed-file diff identical. This reproduces the symptom, not the remedy. |
| The authenticated source reader consumes a historical result commit, independently of current settings | Done probe used browser same-origin `fetch('/__authenticated-read?source=open-dough&revision=<completion>&intent=locations')` after real CLI Story Branch completion, and again after deleting current `.planning/open-dough.json` | HTTP 200 with the exact requested completion, landing's added file, and no later-only test; the answer remained identical after current settings deletion. The UI meanwhile lost its browser after refreshing to those deleted settings. Read the completion commit, not `review.tree`'s raw Git tree, for source/settings. No new server storage mechanism is assumed. |
| Project planning-only refresh already reaches the new revision despite unchanged source text | Project probe used `openWithFeatureSelected`, unchanged jobs-feature files plus one changed planning file, controlled `moveTrunk`, and authenticated-request accounting | Locations request reached B and source text stayed identical; the notice disappeared. The selected-file caption did show B, while the locations browser had no revision label. A new persistent browser-wide label remains implementation work. |
| Saved coverage independently preserves absence, explicit unavailable, loading, failed retrieval and successful Retry | `caffeinate -s -i npm run test:dashboard -- tests/intent/preparation-done-probe.spec.ts tests/intent/preparation-project-probe.spec.ts tests/intent/intent-story-coverage.spec.ts --workers=2 --reporter=line` after extending the Done probe with current-settings removal | 6/6 passed in 23.9 s: both probes and all four saved-coverage journeys, including failed read → Retry → exact saved report. The existing setup does not fake the coverage rendering. New cross-context isolation assertions belong to slice 1. |

The first probe attempt exposed two observation-harness mistakes, both fixed
before the retained passes: APIRequestContext omitted the browser same-origin
metadata and received 403; an overbroad no-SHA assertion found the truthful
file-source caption. The corrected browser fetch and locations-scoped check
settled the actual claims. These were probe defects, not product test failures.
No unverified external, paid, credentialed, native-host or production premise
is needed for this approach. New behavior must get failing regression
observations before implementation; current undesirable-behavior passes do not
prove it. Reuse retained evidence only while relevant paths/profile still match.

## Current decisions and preparation review

- Historical source comes from the Done story's established published result;
  its baseline/diff and CI proof retain their own explicit provenance.
- Missing history is an explained gap, not current project source and not an
  empty-change result. Preserve active-story meanings and supported recovery.
- Project's persistent label follows successfully shown locations, with its
  current update/failure/retry state machine and independent reading scope.
- No dependency agreement is needed for SEED-282: the current owners support
  both outcomes; adapt to its accepted changes if publication order overlaps.

Plan refinement was not needed: two cohesive Behavior slices own historical
reading and project refresh feedback, with mapped proof and safe stopping
points. No remaining slice-specific concern was identified in the inspected
boundaries. No execution, Take, product release, or client rollout is authorized by
this preparation.
