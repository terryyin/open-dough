# Fluent Side panel pilot

How three Side panel content journeys use fluent page objects, and what that
pilot measured. [Journey writing](writing-journeys.md#page-objects) routes a
selected spec to the shared page-object convention; the phase-and-cue
machinery here is this project's pilot for these three journeys.
[SEED-300](../../.planning/seeds/SEED-300-dashboard-test-page-objects.md)
owns wider dashboard page-object refactoring.

## Fluent phases in the Side panel content journeys

Three Side panel content journeys across two specs are written as phases over
fluent page objects. `sidePanelPages(page).phase(title, write)` in
`sidePanelPages.ts` builds the phase's page-object set and hands `write` its
Board, Side panel, Story review, Final report, Panel divider, perspective
choice, Intent, Terminal and Sessions sidebar objects. Each method writes one
named cue without touching the page and returns the object the reader
reaches next, taken from that set rather than constructed: a Story card's
`reviewChanges()` returns the phase's Story review, and the Story review's
`close()` returns the phase's Side panel. The phase then runs those cues in
order, each as its own `test.step` located at the spec line that wrote it,
and stops at the first failure. `support/cueSheet.ts` is the runner. Every
object extends the base in `fluentPageObject.ts`. `storyCardPages.ts`,
`sidePanelFramePages.ts`, `storyReviewPages.ts`, `finalReportPages.ts` and
`terminalPages.ts` own their parts' scoped locators, so a shared control
such as the Story card's `Review changes` has one locator; they import the
base at run time and name the set only with `import type`, and only
`sidePanelPages.ts` imports every class. A new hand-off is a method on the
object the reader leaves that returns `this.pages.<object>`; a new object is
a module of its own and a member of the set. A cue must not read a value it
needs later. Measured widths and rooms, review read counts, transport holds
(`holdReviewOf`), native attach evidence and kept records are read in the
spec between phases.

## What the pilot earned

Keep fluent phases in these three journeys. The strongest case is shared
controls across several content hand-offs, where one locator edit and named
cues make the journeys easier to maintain and diagnose. This is an exploratory
comparison of the recorded procedural baseline, original pilot and landed
revision. [ADR 0010, Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md),
[original pilot evaluation](https://github.com/terryyin/open-dough/blob/e0d4735e14ff40c64151d878d504af9aeab1515c/.planning/slice-plans/506-pilot-fluent-dashboard-page-objects/PLAN.md#pilot-evaluation),
[revised evaluation](https://github.com/terryyin/open-dough/blob/5217098d1bd32ad7f317d3f995a4f6807fd821b4/.planning/slice-plans/516-adjust-fluent-side-panel-page-objects/PLAN.md#revised-design-evaluation).

| Journey | What the fluent spec makes visible | Revised list run |
| --- | --- | --- |
| [Story review and Final report replacement](navigation/side-panel-content-replacement.spec.ts#L66) | Phases show that the held response cannot overwrite the other story's review, that reviews and reports replace each other, and that the Panel divider works by mouse and keyboard. | Passed, 5.3 s |
| [Story review and Final report retention](navigation/side-panel-content-replacement.spec.ts#L182) | The review keeps its chosen file and diff across Board and Intent, and the Final report keeps its session's text. The request log between phases shows Intent's separate comparison. | Passed, 4.1 s |
| [Story review and Terminal replacement](navigation/side-panel-content-switching.spec.ts#L40) | The phases follow the swaps beside a usable Board. The native attach count and kept record between phases show reattachment to the same session. | Passed, 4.4 s |

The [procedural runs](https://github.com/terryyin/open-dough/blob/e0d4735e14ff40c64151d878d504af9aeab1515c/.planning/slice-plans/506-pilot-fluent-dashboard-page-objects/PLAN.md#decisive-premises)
passed all three cases. The original pilot replaced 5
procedural steps with 13 phases across the replacement spec and 6 with 12 in
the switching spec, where raw `expect` calls fell from 74 to 7, all at native,
record or request boundaries. Spec lengths went from 248 and 236 lines to
250 and 239 and stayed there in the revision. The names and order of the
revised phase and cue tree matched the original pilot after masking the
per-run Terminal session ID in the JSON output. Individual journeys took
3.9–4.8 s in the procedural run and 4.2–4.7 s in the original pilot. Treat
these samples and the revised times above as run context.

The original rename experiment changed the Story card's `Review changes`
label and passed with one pilot locator edit versus three procedural edit
sites. Restoring the old locator while keeping the new label caused the
expected failure. A source check in the revised pilot still found a single
owner in `StoryCard`. The original evaluation found 40 uses in 28 test files
outside the pilot, so the measured edit saving is local to these specs.

In the revised controlled failure, the reporter named the test, phase and
cue, with expected `Story Z` and received `Story A`. Later cues and phases
stopped. The code frame still pointed into `storyReviewPages.ts`, so use the
cue title or trace to find the spec call. The replacement spec passed after
the expected value was restored.

The original navigation between the Side panel and its contents kept them in
one module and left the contents without a route to the Board or Terminal.
The phase's object set lets them live in separate modules. The largest
page-object module fell from 246 to 173 lines, while the runner and page
objects grew from 709 to 761 lines. The growth comes from module headers
and imports, two set members, and named methods that make the expectation
explicit at nine formerly boolean call sites in the switching spec. A scratch
hand-off from the Final report to the Board passed type-check and both
replacement cases with five helper lines and two spec lines. That one
reverted change shows the cost of adding one route through the set.

Stop with these three journeys. Reopen the question when an existing
procedural journey has a documented shared-control edit across specs or
recurring content hand-offs that are hard to follow. Use that journey's
current edit sites, step trace and failure output as the baseline for a
separate trial, weighing any gain against the helper code it adds. Trials
and conversions are follow-up work. The developer decides wider adoption.
