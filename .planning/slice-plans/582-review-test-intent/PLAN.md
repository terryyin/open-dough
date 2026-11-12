# Express Story review and Side panel test intent

**Identity:** SEED-300#express-review-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects)

**Source review:** [Source-only commitments](source-review.md)

## Goal, scope and evaluation

A developer follows review entry, comparison, file/diff reading, freshness and
Side panel interactions through named actions and independent outcomes. Each
shared control has one browser owner across affected procedural/fluent callers.
Resolve the source's three findings and their same-control/sequence siblings,
including callers in Intent, Final report and Terminal. Preserve every distinct
behavior check, test tier, held-answer order, revision/file/diff expectation,
input modality, focus/scroll/geometry observation and native/HTTP/Git evidence.

No dashboard behavior change, universal fluent conversion, new framework or
suite-wide speed promise. Unrelated Terminal, session/report, Board and Intent
migration stays with the sibling stories. The cold harness repair below is
necessary to preserve this story's complete proof, not a wider speed campaign.

For each finding, execution retains one representative before/after at the
source audit `7eab3d6ca` and current preparation base `47b348b3a`, names clearer
actions/outcomes, counts mechanics edit sites and states added helper cost.
Keep the change only when those gains justify that cost under ADR 0010.
Locator counts alone and passing examples do not establish improved readability.

## Architecture and existing solutions

PFE inspected shared controls, procedural helpers, fluent phases, fixture tiers,
consumer specs and [the pilot](../../../dashboard/tests/fluent-side-panel-pilot.md#what-the-pilot-earned).
Use `storyCardControls.ts` for the shared Review changes control, reached by
`StoryCard` and procedural opening helpers. Keep `openStoryReview`'s card-settling
and response handling distinct from locating/pressing the control: held-read
callers must be able to press without awaiting the answer.

Extend the suitable existing `storyReviewPages.ts`, `support/reviewTreeRows.ts`,
`reviewPanes.ts`, `reviewContextLine.ts`, `expandContextDiff.ts`, `reviewLineNumbers.ts`,
`reviewRead.ts` and `storyReviewCommitChoice.ts`. The last waits before and after
commit choice because a completed read moves its target; preserve that contract.
Reuse `sidePanelFramePages.ts`, `sidePanelWidthPage.ts`, `pageLayout.ts` and
`support/sidePanelContents.ts` for frame/divider geometry and operations. Reuse
Terminal/touch reading primitives for panel consumers without migrating their
unrelated input workflows. Keep existing touch journey/protocol seams.

Procedural helpers are the default; fluent phases earn their extra machinery
where handoffs recur. A generic click wrapper, duplicate observation model or
helper deriving expectations from rendered/production values would miss the goal.

Follow Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The index and in-file statuses agree; no supersession, conflict or exception was
found. In particular, closing the Side panel preserves the Selected story.
The existing [.planning North Star](../../NORTH-STAR.md) and
[UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md) need no new topic
for test-side owner reuse.

Expected owner sizes at preparation: `storyCardControls` 93, `storyCardPages` 173,
`storyReviewPages` 132, `sidePanelFramePages` 98, `sidePanelWidthPage` 234,
`support/pageTest` 126, `preparationPage` 82, `storyReviewMark` 230 and
`reviewTouchReading` 244 lines. No inspected expected owner exceeds 250 lines.
Keep control, geometry, observation and fixture responsibilities cohesive;
extract their actual shared seam when extending a near-limit file rather than
append orchestration or mechanically cut it. Migrated specs should shrink.

## Preparation evidence

[Premise rows, P0–P3 commands and original observations](preparation-evidence.md)
retain the accepted planning basis and bounded cold-preparation candidate.

## Ordered slices

Each slice includes implementation, focused proof and cleanup. The first Structure
restores required proof for the following Behavior; each slice leaves working tests.

### 1. Restore complete review handoff proof within the default case budget
Type: Structure
Status: done
Proof: Retain every assertion in both `side-panel-content-replacement` cases;
repeat them twice under the default timeout, then typecheck and run affected
Claude/native fixture consumers found by the consumer trace. P2 is the bounded
candidate evidence, not a substitute for verification of the delivered diff.

Change: Reuse/modularize the existing immutable preview preparation in the common
worker pool for queued Codex readers. Keep private origins, native protocol,
server lifecycle and all causal user work in their existing fixtures/cases.
The whole run still accounts for the preparation. This repairs P0 and enables
slice2's full fluent/procedural compatibility gate. Do not cherry-pick an entire
stopped worktree or change its files/ownership; reuse only the justified seam.
No active exact repair owner was established: SEED-287's retained evidence
records a user-directed stop, and SEED-324 names different landed-CI checks.

### 2. Read review entry and comparisons through shared controls
Type: Behavior
Status: done
Proof: Entire affected review cohort plus procedural/fluent entry consumers;
independent expected names, revisions, files/diffs and request evidence remain.

Behavior: A developer reads branch/trunk/completed/one-shot and Intent-entry
cases → follows named entry/comparison operations → the chosen story, baseline
or run and expected comparison are explicit, with one Review changes owner.
Retain exact accessible-name/glyph/Tab proof in `story-review-action.spec.ts`.
Sweep current callers, not the historical count: include completed Intent and
review-mode cases, `navigation/board-scroll`, `support/launchLandingReview` and
helpers that open review indirectly. Disposition each affected caller.

Starting gate: `caffeinate -s -i npm run test:dashboard -- /tests/review/ tests/intent/intent-story-review-return.spec.ts tests/intent/intent-done-review-modes.spec.ts tests/intent/intent-done-landed-review-mode.spec.ts tests/navigation/board-scroll.spec.ts tests/navigation/side-panel-content-replacement.spec.ts tests/navigation/side-panel-content-switching.spec.ts --workers=1`.
Add transitive consumers identified by the delivered effect.

### 3. Read tree, file and diff retention without local selector plumbing
Type: Behavior
Status: done
Proof: Caller-supplied tree order, changed-file counts, selected row, diff text,
line numbers, focus/scroll and independent accessibility/geometry checks remain.

Behavior: A developer reads file/context/retention cases → follows shared tree,
pane and reading operations → the source exposes what is selected and readable
before and after pointer, keyboard or touch input. Keep pane-specific scrolling,
context expansion and visible-line measurements distinct. Extend suitable
owners; do not hide the user protocol in a single generic journey operation.

Starting gate: `caffeinate -s -i npm run test:dashboard -- '/tests/review/story-review-(tree|panes|diff-context|touch|line-counts)' --workers=1`.
Include consuming entry/comparison and one-shot-race cases when their owner changes.

### 4. Keep freshness and held-answer causality visible
Type: Behavior
Status: done
Proof: Refresh/commit/uncommitted-check cases preserve old/new snapshot and file
facts, selected comparison/checks, request payload/counts and exact release order.

Behavior: A review/file read is pending or the worktree changes → the reviewer
chooses another run/file or refreshes → named operations reveal the retained or
replacement answer while the scenario still controls every hold and release.
`story-review-one-shot-choice-races.spec.ts` owns the cross-boundary old-answer
rejection example, including divider, narrow layout, Hide/Show files and focus
return; run it after changes to any owner it consumes, without duplicating it.

Starting gate: `caffeinate -s -i npm run test:dashboard -- '/tests/review/story-review-(refresh|commit-refresh|uncommitted-check|commit-races|one-shot-choice-races)' --workers=1`.

### 5. Express Panel divider and Board return through their owners
Type: Behavior
Status: planned
Proof: Geometry/width persistence, actual drag/cancel/key/touch input, focus,
Selected story, retained file/report/terminal, and attach/read counts stay visible.

Behavior: A reviewer resizes, cancels, changes viewport, maximizes/restores or
closes/reopens panel content → shared frame/divider operations expose that input
→ original measurements and independent observations still establish retained
width/content and Board return across review, report and Terminal callers.
The helper may take a caller-chosen key/count or geometry fact, not choose it
silently; use existing Terminal primitives only where this panel journey needs them.

Starting gate: `caffeinate -s -i npm run test:dashboard -- 'tests/navigation/side-panel-width' tests/navigation/side-panel-content-replacement.spec.ts tests/navigation/side-panel-content-switching.spec.ts tests/sessions/final-report-touch-divider.spec.ts tests/terminals/agent-terminal-maximize.spec.ts tests/intent/intent-story-review-return.spec.ts --workers=1`.
Trace shared layout/close effects through narrow/touch/frontend consumers too.

Execution proof: [slice 1](slice-evidence.md), [slice 2](slice2-evidence.md), [slice 3](slice3-evidence.md); [slice 4](slice4-evidence.md), with [prior failures](slice4-progress.md) and [AC resume](slice4-resume-evidence.md).

## Execution context

[Workspace, publication and observer identity](execution-context.md).

## Verification, current decisions and concern review

Source example1 → slice2; example2 → slice3; example3 → slice4 (with its shared
race gate after slice5); example4 → slice5. Example5 and shared acceptance are
owned per finding by slices2–5: each records its caller disposition, assertion
preservation and before/after benefit/cost before delivery. Slice1 restores the
whole handoff proof used by those mappings. The Ordered slices statuses are authoritative.

Use MakeMe for domain data, stating driving facts at the call site. Keep exact
inputs/actions and independent expectations outside the builder. No sleeps,
`test.slow()`, retries/skips to absorb failure, or timeout extensions. Preserve
existing tiers, causal waits, controlled clocks and native/HTTP/Git boundaries.
The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to every slice, delegation and repair handoff. A base failure
is not exempt; slice1 repairs P0 before the dependent migration proceeds.

Local gate: changed specs plus all affected transitive consumers and
`npm run typecheck:dashboard` for shared TypeScript changes. Moderate CPU usage
in a moderately busy context is supported; no idle-machine or quiet-window
prerequisite applies (developer clarification). Use the maintained
[macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos):
on AC run long proof under `caffeinate -s -i`; on battery plug in or start fully
awake with lid open under `caffeinate -i` and inspect sleep logs afterwards.
These checks follow [project test guidance](../../../AGENTS.md#test-automation)
and shared proof ownership; CI configuration alone adds no full local suite gate.
A changed common fixture warrants its affected fixture-consumer cohort, including
both hosts. Run the installed consumer-trace script for each delivered effect,
follow helper names into real scenarios and disposition matches as run/reused/
excluded with a reason. Extend the starting gates above; do not infer full caller
coverage from a representative passing sample. Run the whole affected cohort
when it is the bounded proof loop. Hosted CI failures remain owned under policy.

No new blocker on a sibling story, trunk-only step, fixed timing limit or sizing
band is invented. Current slices share the model: controls own mechanics,
scenarios own protocol and expected facts; different fixture tiers retain their
proof boundaries. No preparatory framework or future-only representation is needed.
Slice-plan refinement was not needed after construction: the necessary harness
Structure immediately enables entry, and the four Behavior boundaries retain
separate observable outcomes and focused proof loops. No remaining slice-specific
concern was identified beyond completing the explicitly owned repair and proof;
readiness is assessed against the final premise results and current source.

## Story obligations

### G1. Preserve exact review region matching
Reported: slice 2 — "Coordinator inspection found board-scroll exact:true review-region lookup replaced by the partial-match reviewRegion helper."
Story clause: "independent accessibility/geometry observations"
Disposition: proved by slice 2: storyReviewMark.ts31–35 retains the caller exact option; board-scroll.spec.ts46 supplies exact:true; final 14-case proof passed, including both board viewports.

### G2. Restore the cold held-choice race within the default budget
Reported: slice 4 — "The held one-shot run/file race timed out at Hide files after cold setup and three native preparations; trace has no sleep or selector stall."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 4: slice4-resume-evidence.md records two independent cold runs with immutable-key chronology and the complete native/held/panel journey at the default timeout. Total elapsed improvement is not attributed wholly to the fixture change.

### G3. Settle the final trunk-review Refresh timeout
Reported: slice 4 — "The trunk-worktree case exhausted30s at final Refresh under recurring external CPU pressure; its origin was warm, so G2 is not its fix."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 4: slice4-evidence.md records inspected real Take/publish/mark/finalRefresh paths, distributed prior host latency and the complete53-case strict renewal under supported moderate-busy conditions; default timeout and source unchanged.

### G4. Restore the complete phone touch retention proof
Reported: slice 4 — "Timeout began during third native scroll while remaining code reported later final-label cancellation; errorstack alone misleading."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 4: slice4-evidence.md records the complete native/rotation/file/Refresh/commits/check/focus continuation,4-case strict proof and failed/full trace comparison under supported moderate-busy conditions, without reducing observations or extending timeout.
