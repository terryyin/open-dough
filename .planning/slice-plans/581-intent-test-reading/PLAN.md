# Express Intent test reading through page objects

**Identity:** SEED-300#express-dashboard-test-intent-through-page-objects

**Source:** [Refined Intent story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-dashboard-test-intent-through-page-objects)

**Source review:** [Independent source commitments](source-review.md)

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

See [proof strategy and settled premises](proof-strategy.md). Each slice owns
its sibling sweep, before/after source comparison, independent facts and preserved proof.

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
Status: done
Proof: Cohort 1 plus affected consumers. Preserve complete table rows/cells,
units/order and missing-comparison checks. Compare a rendered and integrated
before/after example and selector edit sites.

Behavior: A developer reads comparison/Summary scenarios → follows named
metric and row observations → sees the independent expected facts without
repeated table plumbing. Extend table owners and separate file-row observation
from fixture-specific navigation; include mounted legacy/units siblings.

### 2. Express sort and presentation choices in the scenario
Type: Behavior
Status: done
Proof: Cohort 2 and affected consumers. Retain live keyboard/sort transitions,
percentage marks, signed words, gaps-last order and static render inputs.

Behavior: A scenario changes or configures time presentation/sort → a reader
sees the chosen control/input and expected order/display → one suitable table
owner expresses the shared mechanics without pretending static HTML is live.

### 3. Read CI status and Proof while answers change
Type: Behavior
Status: done
Proof: Cohort 3. Observe old answer while held, checking/freshness/time state,
then replacement answer, scope, unit rows and gaps with caller expectations.

Behavior: A next read is outstanding → the scenario names retained and later
answers → status/Proof owners supply browser observations while the scenario
retains its hold/release sequence and exact evidence.

### 4. Read build samples and prior-build references
Type: Behavior
Status: done
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

## Design and retained evidence

See [design assessment](design-assessment.md) for the slice boundary review and
[preparation evidence](preparation-evidence.md) for the retained baseline and scratch fault.

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

## Execution context

- Established Story Branch execution: `codex/express-intent-test-reading-through-page-objects`
  in `/Users/terryyin/git/open-dough/.worktrees/express-intent-test-reading-through-page-objects`;
  publisher `dashboard-territory.local-open-dough`, agent `stanly-chan`.
- Start `8ad6544887fc2d0302bf208034b2b88bf39370b4`; accepted claim and first
  published base `8299f4e64f49939e1d6120390ebd0b44a0532328`. Remote `origin`, trunk `main`.
  Optional default checkout `/Users/terryyin/git/open-dough`; increments target the story branch.
- Exact-checkout `npm ci` and `npm run typecheck:dashboard` passed. Check-only staged lint
  and script-triggered typecheck hook; selective formatting is `npm run format`.
- CI source GitHub Actions, verified `ci.yml` / `CI` (351271804). Observer coordinator
  `seed300-stanly`, cell `g136:24`, session `77557`, PID `89606`, mailbox
  `/tmp/dough-ci-501/watch-KYQ9Uh`, target the remote execution branch. Claim trunk CI unobserved.
- No numeric slice target/limit supplied. Existing in-scope planning authority retained.
- Local host: 16 logical CPUs, 48 GiB RAM, AC; initial load 32.71, memory 41% free.
  One browser worker; implementation owner rechecks pressure before each expensive launch.
  Other worktrees have active proof; do not modify their processes. Reconsider on contention/failure.
- Plan reorganization: preserve executable slices here; preparation baseline and design
  assessment moved to cohesive linked records to keep each maintained file under 250 lines.

Latest accepted revision: `a7ede26cd2b49c1ea251c98741bba62e0f8bb7b2` on
`origin/codex/express-intent-test-reading-through-page-objects`, suffix base `298d51c27b626fb99f171bebba279b91e091d06d`; observer reused.

Execution structure decisions are retained in [design assessment](design-assessment.md#execution-structure-decisions).

## Accepted slice evidence

- Slice 1: [comparison and Summary acceptance](slice-1-evidence.md).
- Slice 2: [sort and presentation acceptance](slice-2-evidence.md).

- Slice 3: [CI status and Proof acceptance](slice-3-evidence.md).

- Slice 4: [build history and reference acceptance](slice-4-evidence.md).

## Story obligations

### G1. Scope reference facts hidden in journey (reported in slice 4)
Reported: slice 4 — "scopePriorReferencePage still has its pre-existing hardcoded5 included samples/Nov1–Nov5/Run201→202 keyboard expectations; the caller supplies average/selected/difference."
Story clause: "Preserve expected rows, units, dates, gaps, reference membership, unsupported-comparison absence, selected source/revision, keyboard/focus and request/held-answer evidence at the call site."
Disposition: receiving slice 5
Commitment: 70
