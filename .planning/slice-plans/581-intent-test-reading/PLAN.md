# Express Intent test reading through page objects

**Identity:** SEED-300#express-dashboard-test-intent-through-page-objects

**Source:** [Refined Intent story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-dashboard-test-intent-through-page-objects)

## Goal and scope

Make Intent test source readable as the user's action, changed observation and
independent expectation, with one browser owner for each implicated shared
control. Resolve the first seven findings of the original 26-finding audit,
including repeated sequences/selectors in sibling callers. The seed allocates
the other 19 findings to seven independent stories. There was no original
slice plan: this plan introduces the Intent slices rather than claiming an
inherited slice mapping or readiness.

Preserve every distinct behavior check and the existing integrated, static
SSR, live-mounted and frontend-only proof boundaries. Keep expected rows,
order, units, dates, gaps, source/revision, attempt IDs and reference membership
at the call site. Held responses/releases, clocks, Git/HTTP/store evidence and
keyboard/focus facts stay explicit where their causal order is the proof.
Domain setup uses MakeMe. Exact accessibility/measurement contracts retain
independent expected values. Faster tests, fewer scenarios, a universal fluent
framework and changes to dashboard behavior are outside this outcome.

## Architecture and existing solutions

Extend the existing procedural/component owners. `intentScopeProofPage.ts`
already supplies complete table observations; `expectCiComparisonEntryRows`
already serves integrated and rendered callers. Modularize file Proof row
reading from navigation in `support/ciComparisonUnitsJourney.ts` rather than
create another table representation. `expectSortedColumns.ts` distinguishes
live `expectSortedBy` from static `expectRenderedSortedBy`; preserve that
meaning. Page/Locator-based observations can cross fixture tiers without
moving server setup or transport control into them.

Use existing source, history, recovery and story-view owners named in the
slices. A different chart's semantics are a reason to retain separate owners;
similar SVG markup alone is not a shared domain model. Share genuinely common
controls between procedural and fluent APIs. Fluent phases require their own
shared-control/handoff evidence under
[the pilot evaluation](../../../dashboard/tests/writing-journeys.md#what-the-pilot-earned).

Follow Accepted [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
No conflict or exception was found. Existing North Star direction suffices;
this story introduces no new state authority or runtime architecture.

## Proof ownership and baseline

Each slice owns its finding's disposition, sibling-call-site sweep, before/after
example, implementation, cleanup and preserved regression proof in one loop.
Record affected specs, shared owner, distinguishing independent assertions and
literal verification command in this plan as execution learns them. An exact
contract or measurement retained directly is a supported disposition, not an
unresolved finding. Samples demonstrate readability; every affected caller
still needs a disposition and sufficient proof.

| Original finding / final promise | Owning slices and observable evidence |
| --- | --- |
| Comparison and Summary metrics/rows | 1: integrated/rendered rows, units, cardinality, order and unsupported comparisons with caller expectations |
| Sorting and relative presentation | 2: actual live keyboard activation/sort transitions; independently configured static presentation |
| CI status and Proof | 3: retained old answer, outstanding read and replacement, scope/gap/unit rows |
| Timing history | 4: build samples/reference; 5: selected scope sample/reference, gaps and recovery |
| Locations, source and recovery | 6: selected source/target line; 7: revision and failure/retention sequence |
| Story/perspective changes | 8: chosen story/file/view and kept reading, narrow layout, focus and Files sidebar |
| Retained CI follow-up | 9: Done entry, original/repeat/reference, links/keyboard and no new acquisition |
| One control owner with worthwhile cost | Every slice: all affected callers use the suitable owner; compare edit sites, call-site meaning and helper cost against `7eab3d6ca` and the execution base |
| Every distinct behavior and tier survives | Every slice: inspect assertions/setup and run changed specs plus transitive consumers; final Intent/frontend selection covers the aggregate change |

The source audit at `7eab3d6ca` is historical. At preparation base
`9779b93c12250fa7a6acafedcd661f7bbc468888`, the sampled helpers and fixtures
retain the documented seams; 158 dashboard test/support files changed since
the audit. Reconcile each current caller, rather than treating historical
counts or unchanged representative specs as complete coverage.

## Decisive premises

| Premise and consuming operation | Observation in this checkout / result / remainder |
| --- | --- |
| Integrated and static cases can use the existing comparison reader | Preparation selection includes adapter, mounted legacy and mounted units; all 32 selected cases passed at `9779b93c1` on 2026-11-11. The reader takes caller rows, not production-derived expectations. |
| Static and live sort proofs must retain distinct operations | `comparisonRendering.ts` inserts SSR markup without handlers; `comparisonMountPage.ts` mounts a live component. Selection includes mounted-sort and integrated Summary sort; all 32 selected cases passed at `9779b93c1` on 2026-11-11. Static `sort`/`showPercent` remain inputs. |
| Shared recovery observations can cross frontend/integrated setup | Selection includes integrated read-recovery and frontend candidate recovery under their existing separate fixtures; all 32 selected cases passed at `9779b93c1` on 2026-11-11. |
| Remaining reading examples reach real observable boundaries | Selection includes kept CI answer, wall/scope history, source browse, Purpose target line, story changes, reading place and retained follow-up; all 32 selected cases passed at `9779b93c1` on 2026-11-11. This establishes existing boundaries, not an unimplemented helper's benefit. |
| The local proof route can start integrated servers | Initial run failed because this worktree lacked `node_modules`, though parent tooling ran static cases. `npm ci` installed the lockfile locally; native setup check passed (Chromium 153.0.8010.12), and the repaired 32-case selection passed. No failure was waived. |

Before accepting any replacement proof, observe discrimination with one
plausible scratch fault at its real boundary and restore it. Unimplemented API
designs are proposals, not settled runtime facts. An unchanged existing proof
keeps its boundary; changing it reopens its corresponding premise.

## Focused commands

Use `npm run test:dashboard -- <selection> --workers=1` initially. These are
starting cohorts, not exclusions. Add every consumer found by the implementation
trace, including callers outside these names; run a whole affected family when
that is cheaper and sufficient. Existing proof is retained unless changed.

| Slice | Initial selection arguments |
| --- | --- |
| 1 | `'tests/intent/intent-ci-comparison' 'tests/intent/intent-summary'` |
| 2 | `'tests/intent/intent-ci-comparison.*(sort\|relative\|presentation)' 'tests/intent/intent-summary.*(sort\|relative\|presentation)' 'tests/intent/intent-ci-status-sort.spec.ts'` |
| 3 | `'tests/intent/intent-ci-status' 'tests/intent/intent-ci-proof'` |
| 4 | `'tests/intent/intent-ci-wall-time-history' 'tests/intent/intent-ci-prior-build-average.spec.ts'` |
| 5 | `'tests/intent/intent-scope-timing-history'` |
| 6 | `'tests/intent/intent-code-browse' 'tests/intent/intent-gherkin' 'tests/intent/intent-purpose' 'tests/intent/intent-test-optimization-candidates-case.spec.ts'` |
| 7 | `'tests/intent/intent-revision-notice.spec.ts' 'tests/intent/intent-read-recovery.spec.ts' 'tests/intent/intent-test-optimization-candidates' 'frontend-tests/intent-candidates-read-recovery.spec.ts'` |
| 8 | `'tests/intent/intent-story-changes' 'tests/intent/intent-done-project-refresh-reading.spec.ts' 'tests/intent/intent-project-visit' 'tests/intent/intent-reading-place.spec.ts' 'tests/intent/intent-sidebar-toggle.spec.ts' 'tests/intent/intent-story-views-narrow.spec.ts'` |
| 9 | `'tests/intent/intent-ci-follow-up.spec.ts' 'tests/intent/recently-done-ci-automatic-repeat.spec.ts'` |

## Ordered slices

### 1. Read comparison and Summary figures through shared owners
Type: Behavior
Status: planned
Proof: Cohort 1 plus affected consumers. Preserve complete table rows/cells,
units/order and missing-comparison checks. Compare a rendered and integrated
before/after example and selector edit sites.

Behavior: A developer reads comparison/Summary scenarios → follows named
metric and row observations → sees the independent expected facts without
repeated table plumbing. Extend table owners and separate file-row observation
from fixture-specific navigation; include mounted legacy/units siblings.

### 2. Express sort and presentation choices in the scenario
Type: Behavior
Status: planned
Proof: Cohort 2 and affected consumers. Retain live keyboard/sort transitions,
percentage marks, signed words, gaps-last order and static render inputs.

Behavior: A scenario changes or configures time presentation/sort → a reader
sees the chosen control/input and expected order/display → one suitable table
owner expresses the shared mechanics without pretending static HTML is live.

### 3. Read CI status and Proof while answers change
Type: Behavior
Status: planned
Proof: Cohort 3. Observe old answer while held, checking/freshness/time state,
then replacement answer, scope, unit rows and gaps with caller expectations.

Behavior: A next read is outstanding → the scenario names retained and later
answers → status/Proof owners supply browser observations while the scenario
retains its hold/release sequence and exact evidence.

### 4. Read build samples and prior-build references
Type: Behavior
Status: planned
Proof: Cohort 4. Observe selected dates/values, ordered samples, gaps and
reference position; preserve exact SVG/geometry checks when they are the proof.

Behavior: A scenario discloses and selects build history → the reader follows
the chosen observation/reference → history helpers own repeated browser
mechanics. Extend `intentCiHistoryPage.ts` and `ciHistoryWindowPage.ts`.

### 5. Read selected scope history and its recovery
Type: Behavior
Status: planned
Proof: Cohort 5. Preserve units, selected sample/reference, gap/provenance and
failed/held read results, with independent request/store evidence.

Behavior: A scope history is selected or reread → its scenario names the
sample, reference and resulting reading → existing scope-history owners
express it without a competing universal chart model.

### 6. Choose locations and read exact source targets
Type: Behavior
Status: planned
Proof: Cohort 6. Preserve selected location/file and target line, code/Gherkin
and Purpose/candidate distinctions, with exact expected source content.

Behavior: A user chooses a source location → a scenario names the target and
observed line → source/story helpers own repeated rows and target mechanics.

### 7. Retain reading through revision and failed-read recovery
Type: Behavior
Status: planned
Proof: Cohort 7. Observe reading before/after revision, held answer or retry;
retain clocks, requests, release order, selected file/line and recovery wording.

Behavior: Source reading becomes stale or unavailable → a scenario drives its
specific recovery → shared reading observations show what remains and what
changes, usable under both frontend and integrated fixtures.

### 8. Follow story and perspective changes without losing reading place
Type: Behavior
Status: planned
Proof: Cohort 8. Observe story/revision/file/diff/view, retained scroll,
keyboard focus, narrow views and Files sidebar through the transitions.

Behavior: A reader follows a story/project/perspective change → the scenario
states its chosen view and kept context → extend story/mode/project-visit
owners without duplicating selection or confusing Inspect with Selected story.

### 9. Follow retained CI evidence from the Done card
Type: Behavior
Status: planned
Proof: Cohort 9 and affected consumers. Preserve exact original/repeat/reference
timings, attempt URLs/IDs, saved membership and no new CI acquisition.

Behavior: A developer follows a Done card's CI evidence → the scenario names
each destination and expected reading → `ciFollowUpReadingPage.ts` owns the
navigation/observations and takes expected facts instead of embedding run 71.

## Current decisions and cumulative design

Nine slices each own one readable outcome and proof loop; timing history and
source recovery are split where they have distinct boundaries. Each slice is
useful and green if later work stops. No generic framework, speculative API,
extra owner per fixture tier or artificial prerequisite is needed. Compare
clarity/edit sites and helper cost in each slice; a locator-count reduction
alone is not the promised improvement. No numeric timing limit was supplied.

Current expected Intent helper owners are below 250 lines (`intentPerspectivePage`
241, `intentScopeProofPage` 221, `intentStoryPage` 208). Use their existing
source-reading, table and story-view seams if extension approaches the limit;
inspect actual proposed edits before implementation. No oversized code-owner
reorganization is currently required.

## Plan concern assessment

The evaluator is the developer reading these scenarios in Intent. Each
Behavior slice changes that developer-visible source: named user actions and
independent expectations replace repeated browser mechanics. Its proof loop
combines a representative before/after reading and shared-control ownership
comparison with preserved automated product observations; passing those
product tests alone does not prove the source-reading improvement.

| Boundary | Judgment and evidence |
| --- | --- |
| 1. Comparison/Summary figures | Retain: one table-reading outcome spans the same evidence in integrated and rendered setups; caller rows and all affected consumers give its proof. Sorting can remain unchanged. |
| 2. Sort/presentation choices | Retain: operating live controls and configuring static presentation establish one presentation-choice outcome with distinct honest observations. It remains useful after row reading is settled. |
| 3. CI status/Proof changing answers | Retain: retained answer, outstanding read and replacement form one causal reading outcome; separating the displayed facts from their transition would fragment its proof. |
| 4. Build history/reference | Retain: selected build observations and their prior-build reference share one history-reading loop. |
| 5. Scope history/recovery | Retain: scope identity, units and gap/provenance distinguish this reading loop from build history; recovery preserves that same selected reading. Similar SVG markup does not justify consolidation. |
| 6. Exact source targets | Retain: choosing a location and reading its target form one source-navigation outcome. Failed/stale read recovery can remain unchanged. |
| 7. Revision/read recovery | Retain: retaining and replacing an existing reading through a held or failed answer has its own causal boundary, across independent frontend/integrated fixtures. Reuse slice 6's suitable owner without making another owner for recovery. |
| 8. Story/perspective reading place | Retain: chosen context and retained file/view/scroll/focus are observed through the navigation transition; narrow views and Files sidebar are conditions of that outcome. |
| 9. Retained CI follow-up | Retain: the Done entry and original/repeat/reference destinations form one retained-evidence reading flow, with attempt membership and no new acquisition observed at their own boundaries. |

The seven Intent findings have complete ownership: slices 1, 2, 3, 4/5,
6/7, 8 and 9 respectively. A source-label comparison found all 26 original
audit findings retained exactly once across the eight seed stories. No
Consolidate, Split or Escalate finding remains at these boundaries. There are
nine planned slices, no sizing exception and no further resplit recommendation.
Consumer discovery may refine an actual slice when its concrete change reveals
an independent outcome or credible sizing risk; it does not authorize a new
framework or a source-scope change.

The 32-case baseline settled the listed existing reading routes. A subsequent
restored-reader sample timed out during initial published-work reading while
another execution deliberately held the machine under pressure. Its normal
local profile was restored after that owner's pressure workers joined; both
sample cases then passed. No slice-specific concern remains from these
observations. Boundary review grants no execution authority.

## Execution gates and learnings

- Run changed specs and transitive consumers, plus `npm run typecheck:dashboard`
  for shared TypeScript changes. Use the installed consumer-trace procedure
  during implementation. The final local selection covers Intent plus affected
  frontend/cross-family consumers; broaden to the dashboard suite only when
  actual changed shared fixtures or consumers justify it. CI configuration
  alone does not add a mandatory local full-suite gate.
- For long macOS runs start fully awake; on AC use `caffeinate -s -i`. On
  battery plug in, or use `caffeinate -i` with lid open and inspect sleep logs.
  See [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written into every delegation and repair handoff. A failure in the base
  or elsewhere is attribution, never an exemption. Keep MakeMe, causal waits
  and default timeouts. Apply independent post-change refactoring before commit.
- The missing-dependency failure was repaired by installing this worktree's
  lockfile and validating native prerequisites; all 32 selected cases passed.
  The separate restored sample passed after its intended local host profile
  was restored. Recheck host headroom before another expensive attempt.

## Retained preparation observations

At `9779b93c1`, on 2026-11-11, the strict normal runner selected and passed 32
cases across the 16 files below. Inspected setup/observations are those files
and their existing comparison, history, source, recovery and follow-up owners.
This covers existing boundaries, not the future helper design or its benefit.
The literal command was:

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-preparation-proof.json npm run test:dashboard -- tests/intent/intent-ci-comparison-adapter.spec.ts tests/intent/intent-ci-comparison-mounted-legacy.spec.ts tests/intent/intent-ci-comparison-mounted-units.spec.ts tests/intent/intent-ci-comparison-mounted-sort.spec.ts tests/intent/intent-summary-ci-proof-sort.spec.ts tests/intent/intent-read-recovery.spec.ts frontend-tests/intent-candidates-read-recovery.spec.ts tests/intent/intent-ci-status-kept.spec.ts tests/intent/intent-ci-wall-time-history-order.spec.ts tests/intent/intent-scope-timing-history-reading.spec.ts tests/intent/intent-code-browse-sources.spec.ts tests/intent/intent-purpose-case.spec.ts tests/intent/intent-story-changes.spec.ts tests/intent/intent-reading-place.spec.ts tests/intent/intent-ci-follow-up.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts --workers=1
```

The host had 16 logical CPUs, 48 GiB RAM and AC power. Load was 4.87 before the
32-case launch; concurrent work was visible, so the selection used one worker.
The strict transcript's `selectedCount` and terminal attempts both equal 32,
all passed with no retry (`/tmp/seed300-preparation-proof.json`, run
`c5dc48a3-6b5f-4d89-851c-fbec144ca45c`). Reuse this result while its covered
paths are unchanged; reconcile affected proof after a changed base.

A scratch replacement of the shared entry-table selector with a missing table
made both an integrated adapter case and a rendered legacy case fail at
`expectProofTableRows`: empty actual table versus caller-supplied expected
rows. This establishes that the shared reading path discriminates missing
semantics in both setups. The exact helper bytes were restored, with no
scratch product changes retained. The command was:

```sh
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-adapter.spec.ts tests/intent/intent-ci-comparison-mounted-legacy.spec.ts --grep 'done adapter|overall Counts and entry row' --workers=1
```

The restored rerun encountered a distinct 30-second integrated startup timeout
before comparison selection, while the page still said Reading published work.
No sleep occurred in its window. Host load was above 20 and SEED-287's explicit
pressure run was active. Its controller subsequently recorded all 20 pressure
workers joined at 08:09:36 UTC, with no remaining busy work. At the next launch,
load was 12.85 on 16 logical CPUs and the memory-pressure query reported 45%
free. This changed condition supplied the normal local profile for one bounded
diagnostic replay; it was not an unchanged retry until green.

Both restored cases passed with the same command and
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-reader-restored-normal-proof.json`.
The helper's bytes matched Git throughout the restored runs. No assertion,
timeout, production behavior or other owner's workload was changed. This
settles the normal local reading route, not stability under arbitrary external
pressure. Reuse the maintained headroom/sleep policy for future launches.
