---
id: SEED-263
status: active
planted: 2026-11-08
scope: story
---

# Fluent page objects for dashboard browser journeys

<a id="pilot-fluent-dashboard-page-objects"></a>

### Pilot fluent page objects in dashboard Side panel tests

**Identity:** SEED-263#pilot-fluent-dashboard-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer reviewing a dashboard browser test can read the setup,
user actions, and expected outcomes in order at the call site. A developer
changing a shared Side panel control can find the page object that owns it.
Use the pilot to decide whether the design earns wider adoption.

**Scope.** Convert all three integrated journeys in the two Side panel content
specs to a fluent TypeScript API. Reuse the same page objects across both specs
for their shared interactions. The pilot ends at these journeys and the shared
UI responsibilities they exercise.
[Content replacement](../../dashboard/tests/navigation/side-panel-content-replacement.spec.ts)
· [Content switching](../../dashboard/tests/navigation/side-panel-content-switching.spec.ts)

**Design.** Name actions and observations in the dashboard's vocabulary. Page
objects own scoped locators, UI mechanics, and observable waits. A fluent
method records a named async operation synchronously and returns the current
or destination page object. One returned or awaited runner Promise per phase
executes the operations in order through Playwright `test.step`. Reuse or move
existing helper logic so shared controls have one locator owner. Keep expected
values and meaningful user inputs visible in the spec. Arrange domain facts
through the shared MakeMe API for the cases in scope. The test harness owns
Git, transport holds, native session evidence, and cleanup.
[Dashboard vocabulary](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
· [Synchronization](../../dashboard/tests/README.md#synchronization)
· [Test data architecture](../../tests/README.md#test-data-architecture)

**Examples to preserve.**

- A held review for Story A shows its loading state. Story B's review opens
  and shows its changed file before A's answer is released. After the harness
  releases and drains A's answer, B's review remains the sole Side panel
  content. Keep the hold and release explicit between fluent phases.
- A review and a final report replace one another. Reopening after a switch
  reads a fresh snapshot. Asking for the review already shown moves focus to
  it and keeps its snapshot. Keep the mouse and keyboard divider actions and
  their expected changes visible. A review or report stays shown when the
  developer switches to Intent and back.
- Opening a review replaces the Terminal and detaches it while the native
  session stays open. Reopening the same session from the Sessions sidebar
  reattaches it in the normal split. Preserve the proof for selection,
  maximization, session identity, and continued access to the Board.

**Evaluation.** Compare the converted specs with their current versions.
Preserve the existing assertions and integration boundaries, including the
observable order of the race. Check the three journeys, affected consumers,
and dashboard type-check. Inspect a controlled failure for a useful step name
and the underlying assertion. Use a representative shared control rename to
compare the number of edit sites. Record whether the resulting readability,
diagnostics, and maintenance cost warrant keeping, adjusting, or extending the
pattern. Follow the [test automation rules](../../AGENTS.md#test-automation),
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests), and
[macOS sleep guard](../../tests/local-test-resources.md#machine-sleep-on-macos).
[Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
