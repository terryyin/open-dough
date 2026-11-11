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

Use the [cohort commands](proof-strategy.md#focused-commands), extended by actual consumer discovery.

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
Status: done
Proof: Cohort 5. Preserve units, selected sample/reference, gap/provenance and
failed/held read results, with independent request/store evidence.

Behavior: A scope history is selected or reread → its scenario names the
sample, reference and resulting reading → existing scope-history owners
express it without a competing universal chart model.

### 6. Choose locations and read exact source targets
Type: Behavior
Status: done
Proof: Cohort 6. Preserve selected location/file and target line, code/Gherkin
and Purpose/candidate distinctions, with exact expected source content.

Behavior: A user chooses a source location → a scenario names the target and
observed line → source/story helpers own repeated rows and target mechanics.

### 7. Retain reading through revision and failed-read recovery
Type: Behavior
Status: done
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

## Execution gates

Use the [proof gates and retained setup learning](proof-strategy.md#execution-gates-and-learnings).
Local gate: affected journeys and `npm run typecheck:dashboard`; for long macOS
runs use `caffeinate -s -i` on AC, or `caffeinate -i` on battery with the lid open
and sleep-log inspection, under [the maintained guard](../../../tests/local-test-resources.md#machine-sleep-on-macos).
The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to this plan and every delegation/repair handoff.

## Execution context

See [execution identity, delivery and recovery context](execution-context.md).

## Accepted slice evidence

See the [accepted proof index](proof-strategy.md#accepted-slice-evidence).

## Story obligations

### G1. Scope reference facts hidden in journey (first reported in slice 4)
Reported: slice 5 — "scopePriorReferencePage still has its pre-existing hardcoded5 included samples/Nov1–Nov5/Run201→202 keyboard expectations; the caller supplies average/selected/difference."
Story clause: "Preserve expected rows, units, dates, gaps, reference membership, unsupported-comparison absence, selected source/revision, keyboard/focus and request/held-answer evidence at the call site."
Disposition: proved by slice 5: slice-5-current-evidence.md, current45-case strict pass with explicit caller facts, direct103ms position oracle, frontend held retry and real store recovery; retained matching faults
Commitment: 70
### G2. Scope reference position lacks a numeric UI observation
Reported: slice 5 — "Coordinator acceptance found scope prior-average asserts one reference and API reference facts, but no numeric plotted position. Build-history position proof does not observe scope chart placement."
Story clause: "Expose those observations through the history helpers, with expected dates, values, gaps and reference placement in the scenarios that prove them."
Disposition: proved by slice 5: slice-5-current-evidence.md, current45-case strict pass with explicit caller facts, direct103ms position oracle, frontend held retry and real store recovery; retained matching faults
### G3. Reconcile accepted scope-history context and current callers
Reported: slice 5 — "Accepted SEED310 at c6d2645 changes scope/context/reference controls, moves reading/units/segments UI cases to frontend, and adds Project Intent scope-history callers. Old snapshot proof does not establish combined bytes."
Story clause: "Resolve the seven Intent findings below, including their same-sequence and selector siblings."
Disposition: proved by slice 5: slice-5-current-evidence.md, current45-case strict pass with explicit caller facts, direct103ms position oracle, frontend held retry and real store recovery; retained matching faults
Commitment: 30
### G4. CI held-retry observation is unstable
Reported: slice 5 — "CI43012675687/1 dashboard8/13 at15633ccd failed the frontend scope reading case: after Retry and reads2, the old error alert was absent; local45-case proof did not establish stability."
Story clause: "Preserve expected rows, units, dates, gaps, reference membership, unsupported-comparison absence, selected source/revision, keyboard/focus and request/held-answer evidence at the call site."
Disposition: proved by slice 5: slice-5-current-evidence.md CI repair acceptance; deterministic pending-state regression failed at the original absent-alert boundary, then complete46-case strict pass with the held request, selected landing, unchanged comparison and replacement evidence; typecheck passed

### G5. Plain source selection still bypasses its shared owner
Reported: slice 6 — "Coordinator inspection found the edited frontend appearance case still clicks notes.check through a raw role/regex locator, although plainPath is explicit and its highlighted-file sibling uses sourceFile."
Story clause: "Share the operations for choosing a location, reading the target line, retaining the reading place, and seeing or retrying a failed read."
Disposition: proved by slice 6: slice-6-evidence.md; exact plainPath choice uses sourceFile and the complete frontend appearance journey passed1/1 strict with its independent source, contrast, colors and retained-state observations

### G6. Candidate absence probes still bypass the source owner
Reported: slice 6 — "Coordinator found the movedAway absent-location probe still using its raw button locator; implementation inspection found the analogous outside-configured pygardonClipPath probe. Both are ordinary recorded-file controls."
Story clause: "Share the operations for choosing a location, reading the target line, retaining the reading place, and seeing or retrying a failed read."
Disposition: proved by slice 6: slice-6-evidence.md; both ordinary candidate absence probes use sourceFile and their two complete owning journeys passed2/2 strict, including open/return/focus/read counts, authored Markdown opening and outside-configured explanation

### G7. Selected-target recovery needs complete independent proof
Reported: slice 7 — "Coordinator inspection found target-line assertions in Purpose/candidate cases and revision/failure protocols in other cases, but no selected-target recovery observation joining expected file, line, revision, focus and reading place. Location/candidate backoff proof alone does not establish that source example. Coordinator also found the new offset owner replacing an existing one-shot retained-position assertion with eventual polling, which could accept a later jump-and-restore."
Story clause: "A selected source line survives a revision notice or failed read → the scenario retries or releases a held replacement → its expected file, target line, revision, focus and retained reading place remain independently proved."
Disposition: proved by slice 7: slice-7-evidence.md; two independently selected real line44 recovery alternatives prove exact file, target, source/browser revisions, expected focus at applicable phases and original one-shot offset through held/failed reads and replacement; current corrected3 plus43 retained positives and source-retention scratch

### G8. Candidate recovery hides its expected revision
Reported: slice 7 — "Coordinator inspected openCandidates(page): it asserts the fixed openDough.revision internally, including frontend callers arranging frontendRevision, instead of exposing the independent expected revision in the scenario."
Story clause: "Preserve expected rows, units, dates, gaps, reference membership, unsupported-comparison absence, selected source/revision, keyboard/focus and request/held-answer evidence at the call site."
Disposition: proved by slice 7: slice-7-evidence.md; every3 integrated/frontend openCandidates caller supplies its independent expected revision explicitly, with no default fixed expectation; actual timeout, rate-limit and manual Retry journeys retain current passing proof

### G9. Revision control absence was narrowed to a notice subtree
Reported: slice 7 — "Coordinator compared the original done-project-refresh Intent-wide Show latest absence with the migrated helper's forced status/text-filtered notice subtree; the new observation covers a narrower absence."
Story clause: "Preserve expected rows, units, dates, gaps, reference membership, unsupported-comparison absence, selected source/revision, keyboard/focus and request/held-answer evidence at the call site."
Disposition: proved by slice 7: slice-7-evidence.md; one container-scoped Show latest owner preserves original positive notice containers and the whole-Intent negative scope; the complete all-Done-tabs negative journey passed in corrected3
