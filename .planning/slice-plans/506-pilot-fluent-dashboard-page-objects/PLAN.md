# Pilot fluent page objects in dashboard Side panel tests

**Identity:** SEED-263#pilot-fluent-dashboard-page-objects

**Source:** [Selected story](../../seeds/SEED-263-fluent-dashboard-page-objects.md#pilot-fluent-dashboard-page-objects)
**Source review:** [source-only review](source-review.md)

## Goal and boundaries

Make the setup, actions and observations in the three existing integrated
Side panel journeys readable in order, with one owner for the UI mechanics
shared by the two specs. Evaluate the maintenance and diagnostic trade-offs
against the procedural baseline. The pilot is test-only and covers these
journeys and their shared controls. Wider migration, reporter changes and
adopting a project-wide page-object convention are separate decisions.

## Current decisions

- Use one explicit awaited or returned runner per phase. A fluent operation
  registers a named closure synchronously, returns the current or destination
  page object, and runs only inside that phase's ordered `test.step` sequence.
  A failure stops the phase and retains the Playwright assertion. Keep
  expected values, input choices, and transport and native boundaries visible
  in the spec. Read runtime values at the point they are observed, inside an
  awaited phase or at an explicit boundary between phases.
- Start with [dashboard parts and card sessions](../../../dashboard/tests/dashboardParts.ts),
  [review region](../../../dashboard/tests/support/storyReviewMark.ts),
  [review body](../../../dashboard/tests/support/reviewContextLine.ts),
  [Side panel and divider helpers](../../../dashboard/tests/sidePanelWidthPage.ts),
  [frame icon assertions](../../../dashboard/tests/frameIconControl.ts),
  [card selection](../../../dashboard/tests/storyCardSelection.ts), and
  [Sessions sidebar](../../../dashboard/tests/sessionsSidebarPage.ts).
  Reuse the matching scopes and observable waits or move their ownership while
  keeping existing consumer contracts. The shared test gap is the fluent phase
  and duplicated scoped controls. Keep panel frame, review, report and terminal
  observations tied to their respective responsibilities.
- Keep the race in the harness. [The existing hold helper](../../../dashboard/tests/support/holdReviewResponse.ts)
  holds the first matching endpoint response. The pilot needs Story A's
  identity filter and a drain that tolerates cancellation after switching to B.
  Keep that behavior explicit. Release and drain on failure as well as success,
  before [fixture teardown](../../../dashboard/tests/support/pageTest.ts) waits
  for routes. Keep request counts, persisted records, and native attach evidence
  at the boundaries that produce them.
- Consume the first published shared MakeMe entry from the recorded
  [agent-profile supplier](../../seeds/SEED-261-share-domain-test-data.md#share-published-agent-profile-builders).
  At start, use the delivered entry and check for canonical builders already
  covering scoped setup. Extend only for a real pilot consumer when needed.
  Arrange valid queued-story, launch and session facts through the shared API.
  Reuse production shapes and encoders. Keep Git-generated revisions, files
  under review, vendor protocol evidence and independent expectations in their
  existing proof roles. If a shared fixture changes, preserve its other callers'
  case data and run affected consumers.
- The applicable Accepted decisions support this boundary. Use the dashboard
  vocabulary and its distinction between the Side panel and its content under
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts).
  Map directly to domain facts and reuse shared responsibilities under
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
  Judge the pilot against the baseline and the developer's reading and
  maintenance effort under [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| The replacement journey reads in order and preserves the Story A/B race | Slice 1 | The first replacement test visibly records A's loading state and B's identity and changed file before releasing A. After release and drain, it shows one panel item, with B and without A's file or file count. Keep the hold, transport drain and asynchronous UI observations distinct. |
| A report and review replace one another and retain the expected width, focus and snapshot behavior | Slice 1 | Keep the report text, single item and absence of replaced content, pointer and ArrowRight width/ARIA deltas, fresh review request count, focus return on Close, and unchanged session done mark. Opening the already shown review by keyboard retains selection and snapshot and moves focus into it without an extra read. |
| A review and a final report survive switching between Board and Intent | Slice 2 | The second replacement test observes the selected file and visible diff region through both perspectives, Intent's separate comparison request, the retained report and single panel item, and the unchanged done mark. |
| A review replaces the Terminal, with a usable Board, and the same session can reattach | Slice 3 | The switching test retains echo, panel exclusivity, detach evidence and unchanged kept record, selected versus inspected cards, Intent's selection, sidebar focus and reachability, frame-control parity, maximize/restore geometry and unchanged review snapshot. Reopening from the Sessions sidebar retains the same native ID, increments attaches once, restores the normal split and marks the sidebar entry current. Selecting and clearing another Story card leaves the Terminal and details as before. |
| Shared controls and fluent execution help maintainers | Slices 1 and 3 | In Slice 1, a deliberate assertion mismatch in a converted phase identifies the step in its retained trace and the original assertion in failure output. A later step does not run. Restore and pass the same test. In Slice 3, compare all three journeys against the baseline and use a reversible Story card `Review changes` rename to demonstrate one locator edit site inside the pilot. Record any diagnostic or maintenance costs and the keep, adjust or extend recommendation. |

## Decisive premises

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Existing integrated proof for the three slices | On 2026-11-08 at `cf15e455903e0a36048ac98ae7af672024d1aceb` in the owned preparation worktree, ran `npm run test:dashboard -- tests/navigation/side-panel-content-replacement.spec.ts tests/navigation/side-panel-content-switching.spec.ts` with the default configuration and again with `--reporter=list`. | All three passed under Chromium, using the production build, real private Git, the held HTTP reply, and synthetic Codex or Claude evidence. The listed run reported 3.9 s, 4.6 s and 4.8 s for the individual journeys. This is the procedural baseline. |
| Ordered runner and failure diagnostics | At the same revision and with the dashboard's locked Playwright 1.63.0, ran `npm run test:dashboard -- tests/navigation/refinement-fluent-scratch.spec.ts` with a disposable Chromium test and the default reporter. The test queued a browser status change, a deliberately mismatched assertion and a later sentinel. Inspected the retained `trace.zip`'s `test.trace`. | Registration left the starting DOM alone. The first step changed it. The next step failed on the real expected/received values, the later sentinel did not run, and the trace contained the failing step and its assertion. The scratch spec was removed. Slice 1 repeats the diagnostic check against the converted real journey. |
| Shared locator maintenance baseline | Inspected the two specs at the same revision. The first replacement journey, the second replacement journey and the switching journey each define the same `Review changes` locator for a Story card. | Three pilot edit sites. The Panel divider already has a shared locator and would not distinguish the approaches. Slice 3 owns the reversible rename in the delivered pilot. |

## Local gates

On awake macOS with AC power, use `caffeinate -s -i` for full runs. On battery,
follow the maintained lid-open `caffeinate -i` and sleep-log guidance.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).

Run the affected test in the maintained dashboard runner at each slice. After
changes to a shared helper, trace its exported call forms and affected UI
observations to their consumers. Record each consumer's disposition and run
those affected. Likely boundaries include width and covering, review opening
and focus, and Sessions sidebar navigation. Use the installed
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
with the slice's diff to settle the actual list. In the final slice run both
pilot specs together, the affected consumer checks, and `npm run typecheck:dashboard`.
Remove deliberate breaks and restore every green check they affected before
accepting proof.

## Slices

### 1. Read the review and report replacement sequence at the call site

Type: Behavior

Status: done

With the held Story A response, opening Story B and then a final report gives
a reader explicit phase boundaries and browser observations for each replacement.
Carry the existing full first journey, including width, focus and fresh versus
retained review reads. Introduce the minimum runner and page ownership exercised
here and wire this journey's domain setup through MakeMe. Keep the same
assertions and exercise one deliberate assertion failure before restoration.

Proof: The first [replacement journey](../../../dashboard/tests/navigation/side-panel-content-replacement.spec.ts)
passes, and its controlled failure and restored pass establish the named-step
diagnostic. The second journey and unrelated callers still work if a shared
helper or setup boundary moved.

### 2. Follow retained review and report content across perspectives

Type: Behavior

Status: done

With a selected review file or an open report, switching to Intent and back is
readable in the same action and observation vocabulary. Convert the second
replacement journey with the page objects and MakeMe setup from Slice 1. Keep
the selected file, visible diff region, Intent's own request, report contents,
and session done mark observations explicit.

Proof: Both [replacement journeys](../../../dashboard/tests/navigation/side-panel-content-replacement.spec.ts)
pass, including the exact distinct Intent comparison request and the final
report's persisted session check.

Accepted proof (2026-11-08): the second journey runs as four phases. A
loop over Intent and Development inside one phase writes one named cue per
perspective. `PerspectiveChoice` and `Intent` page objects joined
`sidePanelPages.ts`, and `StoryReview.chooseFile` joined
`sidePanelContentPages.ts`. Both tests share the spec-local
`openStoriesAAndB` arrangement, whose MakeMe facts stay in the spec, and
`storyBRetiredCodexRecord` lost its last caller and was removed. Passed: both
pilot specs (3), and again for the replacement spec after refactoring, and
`npm run typecheck:dashboard`.

Learnings for the evaluation: choosing a perspective returns the choice
itself, so a phase takes `intent` and `board` from its page objects rather
than by navigation. Each observation costs about seven helper lines, and
`sidePanelPages.ts` is at 222 of 250 lines before the Terminal and Sessions
sidebar objects.

### 3. Follow Terminal replacement and reattachment beside the Board

Type: Behavior

Status: done

With a running session, opening a review detaches the Terminal. Reopening the
same session from the Sessions sidebar reattaches it in the split. Extend the
shared page ownership where needed for the Terminal and Sessions sidebar. Use
the same MakeMe entry for the arranged Claude launch and queued story facts.
Keep selection, geometry, keyboard actions, native session ID, attach evidence
and kept record checks visible at their proof boundaries.

Proof: The [switching journey](../../../dashboard/tests/navigation/side-panel-content-switching.spec.ts),
both replacement journeys, affected consumers, and dashboard type-check pass.
Temporarily rename the Story card action in the dashboard and adjust the pilot
locator owner. Run the same two specs and restore both edits. Count the pilot
locator sites separately from the temporary product edit and other suites.
Compare the converted call sites and diagnostics with the procedural baseline
and record a keep, adjust or extend recommendation and its evidence in this plan.

Accepted proof (2026-11-08): the switching journey runs as 12 phases.
`storyCardPages.ts` now owns the Board and Story card, `terminalPages.ts` the
Terminal and Sessions sidebar, and `SidePanel` the shared frame controls,
maximize and restore, and fill geometry (`expectFills` in
`partArrangement.ts`). Both specs use the same Board, Story card, Side panel
and Story review objects. Passed: both pilot specs (3), 25 tests across the
pilot and affected consumers (width and covering, review action, Sessions
sidebar navigation, terminal maximize, card selection, and samples of
layout importers) under `caffeinate -s -i`, and `npm run typecheck:dashboard`.
The refactor pass replaced `agent-terminal-maximize.spec.ts`'s identical local
`expectCovers` with `expectFills`, and that spec passed.

## Pilot evaluation

**Rename.** Temporarily renaming the Story card's `Review changes` label in
`dashboard/src/StoryReviewAction.tsx` needed one pilot edit, `StoryCard`'s
`#reviewChanges` getter, against three sites at `d597e56f7`. Both pilot specs
passed under the rename. With the old locator restored and the rename kept,
the run failed at `› Story A's review opens with a file chosen › Story card
"Story A": Review changes`, which shows the renamed build was under test. Both
edits were reverted. Outside the pilot, 40 uses in 28 test files name the
label.

**Reading.** The spec lengths are about the same: 248 to 250 and 236 to 239
lines. Every action and observation is a named step at its own spec line:
13 phases replace 5 steps in the replacement spec and 12 replace 6 in the
switching spec. Raw `expect` calls in the switching spec fell from 74 to 7,
all at native, record or request boundaries. Each journey took 4.2–4.7 s,
against 3.9–4.8 s before.

**Failures.** A failure is reported as test › phase › named cue with its real
expected and received values, and later steps do not run. The code frame
points at the page-object line, so a reader finds the spec line through the
step title or the trace.

**Cost.** The runner and page objects total 709 lines. Shared layout added 13
lines, `makeMe.mjs` 118 and `holdReviewResponse.ts` 52. Each observation costs
about five helper lines. Values read while the test runs must sit between
phases. The Side panel and its contents navigate to each other, so they must
stay in one module, which is at 246 of 250 lines. For the same reason, a
content object has no route back to the Board or Terminal. Negative checks
take a boolean, as in `expectSelected(false)`.

**Recommendation: keep, and adjust before extending.** Keep the phase runner,
the domain page objects, one locator owner per shared control, the named-cue
diagnostics and MakeMe facts at the call site. Before adding page objects,
resolve navigation through the phase's own page-object set instead of
getters across modules, and prefer explicit negative methods. Wider adoption
is still a separate decision.

## Design and readiness review

Plan refinement was unnecessary. Each slice delivers a complete reader-visible
journey with its own integrated proof. The next slice extends the same phase and
locator ownership as its example requires. The pilot evaluation belongs with
the first cross-spec reuse, when there is evidence of shared maintenance cost.
No remaining slice-specific concern surfaced. The recorded MakeMe prerequisite
is the start blocker.
