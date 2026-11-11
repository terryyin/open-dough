# Express Story review and Side panel test intent

**Identity:** SEED-300#express-review-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

A developer can read what a reviewer opens, compares and keeps, and what a
Side panel interaction changes, without reconstructing repeated browser
mechanics. Shared controls have one maintained selector owner across affected
procedural and fluent journeys. Preserve every receiving audit finding and its
same-sequence sibling callers, including callers in Intent, Final report and
Terminal tests.

Receiving findings from SEED-300: **Opening review and reading a comparison**;
**Review tree, diff and freshness**; **Divider, covering and returning to the
Board**. The source audit was at `7eab3d6ca`; current inspection was at
`9779b93c1`. No original executable plan existed: this maps findings, not
fictional original slices. Story refinement must confirm the examples and
realign this same provisional plan before its proof is executable.

This work preserves product behavior, expected revisions, file names,
additions/removals, line counts, focus, scroll and geometry. It does not promise
a fluent conversion of every journey or change the accepted selection rules.

## Architecture and existing owners

Reuse `dashboard/tests/storyCardPages.ts`, `storyReviewPages.ts`,
`sidePanelFramePages.ts`, `sidePanelWidthPage.ts`, and the existing
`support/reviewTreeRows.ts`, `reviewPanes.ts`, `storyReviewCommitChoice.ts` and
`sidePanelContents.ts`. Procedural and fluent operations should reach the same
control owner; the fluent pilot remains evidence, not a new framework mandate.

[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps Story review as Side panel content and preserves Selected story when the
panel closes. [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires an observed gain against the audit baseline, weighing call-site clarity,
selector edit sites and helper cost. Keep expected values independent of the
implementation being observed.

No inspected expected helper owner exceeds 250 lines; `sidePanelWidthPage.ts`
has 234 and `support/reviewTouchReading.ts` has 242. Preserve the existing frame,
content, tree, pane and touch-reading seams when extending them.

## Provisional slices and proof ownership

Commands below are illustrative selections until story refinement confirms
the cases and transitive consumers. A passing sample cannot disposition all
sibling callers. Each slice records its finding/caller disposition and one
representative before/after with preserved assertions.

### 1. Read review entry and comparison scenarios through shared controls
Type: Behavior
Status: planned
Proof: Inspect branch, trunk, completed, one-shot and Intent-entry call sites;
one selector owns Review changes for affected callers, while revision/file/diff
expectations remain at the call site. Illustrative command:
`npm run test:dashboard -- 'tests/review/story-review-(action|commit-trunk|completed|one-shot|comparison)' 'tests/intent/intent-story-review-return.spec.ts'`.

Behavior: A developer reads a review-entry case → follows named entry and
comparison operations → the source exposes the chosen review and independently
expected comparison, and its unchanged browser journey passes.

### 2. Read tree, file and diff retention without local selector plumbing
Type: Behavior
Status: planned
Proof: Reuse tree/pane owners for selected file, context, focus and scroll;
retain explicit expected file and before/after observations. Illustrative:
`npm run test:dashboard -- 'tests/review/story-review-(tree|pane|diff-context|touch)'`.

Behavior: A developer reads a file/diff retention case → follows shared reading
operations → the source states what remains selected and readable, with the
existing browser checks still distinguishing a lost selection or reading place.

### 3. Keep freshness and held-answer ordering visible in review cases
Type: Behavior
Status: planned
Proof: Refresh controls and displayed checks have shared owners; the spec keeps
request holds, release order, commit choice and expected check facts.
Illustrative: `npm run test:dashboard -- 'tests/review/story-review-refresh' 'tests/review/story-review-commit-refresh.spec.ts' 'tests/review/story-review-uncommitted-check-refresh.spec.ts'`.

Behavior: A developer reads a pending or refreshed comparison case → follows
the named refresh and observations around the explicit held response → the
source explains which result may replace which, and the same causal checks pass.

### 4. Express Panel divider and Board-return interactions in their owners
Type: Behavior
Status: planned
Proof: Shared frame/divider actions cover open/close, cancellation, keyboard and
viewport transitions across review, report and Terminal callers. Keep widths,
bounds, modality, measurements and native attach/request counts explicit.
Illustrative: `npm run test:dashboard -- 'tests/navigation/side-panel-width' 'tests/sessions/final-report-touch-divider.spec.ts' 'tests/terminals/agent-terminal-maximize.spec.ts'`.

Behavior: A developer reads a panel interaction case → follows named frame and
divider operations → the source exposes the actual input and retained Board or
content outcome, and the original geometry, focus and attachment checks pass.

## Refinement and verification still required

Resume with `dough-story-refinement` for this story, realign this same plan,
then run slice-plan refinement and record the preparation assessment. No Take,
execution or readiness follows from this provisional plan.

Refinement must observe current caller cohorts and shared-owner compatibility,
confirm proof selections and settle any decisive reuse premise through the
consuming operation. Use changed specs plus transitive consumers and
`npm run typecheck:dashboard` for shared TypeScript changes. Broader local gates
need a changed shared fixture/consumer or another project requirement; CI
configuration alone does not require a full local suite.

Arrange domain data through MakeMe, leaving case-driving facts, exact inputs
and independent expectations visible. Preserve test tiers, causal waits,
controlled clocks, native/HTTP/Git/record evidence and held-answer ordering.
The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written and must accompany every delegation and repair handoff.
Keep default timeouts; no sleeps or `test.slow()`.
For long macOS runs start fully awake: on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
