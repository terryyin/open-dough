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
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-263#pilot-fluent-dashboard-page-objects","dependencies":[{"supplier":{"identity":"SEED-261#share-published-agent-profile-builders","href":"seeds/SEED-261-share-domain-test-data.md#share-published-agent-profile-builders"},"implementation":"The supplier establishes the canonical test-only tests/support/makeMe.mjs entry with the first shared builder used across test entries. The Side panel pilot consumes that entry and reuses or extends it for its own fixtures.","rationale":"The project's test rules require valid domain setup through the single MakeMe entry. That entry is absent at preparation, and the selected agent-profile pilot owns its first cross-entry delivery. Starting with a pilot-local builder or introducing a second first entry would conflict with that allocation.","condition":"The canonical tests/support/makeMe.mjs ESM import is published on trunk and its first builder is exercised by the supplier's dashboard and Node test entries with dashboard type-check coverage.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/506-pilot-fluent-dashboard-page-objects/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c25fefabed4b23f6879da9d8967f6ceadca881d9d3d567460604574a6cd160e4","plan":"b502e77a101f5df63ec7d5869c5c4360c812a149253b65f4b0d67f9443aea231"}}
```

**Goal.** A developer reviewing a dashboard browser test can read the setup,
user actions, and expected outcomes in order at the call site. A developer
changing a shared Side panel control can find the page object that owns it.
Use the three existing journeys to decide whether clearer tests justify the
cost of the abstraction and its failure diagnostics.

**Scope.** Convert all three integrated journeys in the two Side panel content
specs to a fluent TypeScript API. Reuse the same page objects across both specs
for their shared interactions. The pilot ends at these journeys and the shared
UI responsibilities they exercise. Preserve all existing assertions and their
Git, browser, and synthetic native integration boundaries. Changes to product
behavior, migration of other journeys, and a wider convention are separate work.
[Content replacement](../../dashboard/tests/navigation/side-panel-content-replacement.spec.ts)
· [Content switching](../../dashboard/tests/navigation/side-panel-content-switching.spec.ts)

**Approach considered.** Compare three ways to keep ordering, evidence and
shared control ownership visible. Ordinary `await` calls with the existing
locator helpers and `test.step` have the lowest implementation cost, but every
action and observation still carries its own async ceremony. An explicit list
of named callbacks borrows from a stage manager's cue sheet. The spec sets the
cue order, helpers carry out the cues, and the harness calls an explicit hold or
release between lists. It exposes timing boundaries but makes each test author
assemble the calls and their names. Use the cue-sheet discipline with fluent
page objects for this pilot. Typed operations name the dashboard action or
observation and share its mechanics while each awaited phase keeps the order
visible. The analogy only models the test's own actions. Browser requests and
native processes advance independently and still need observable evidence.

**Architecture.** Use the Board, Story card, Sessions sidebar, Side panel, and
Panel divider vocabulary. Page objects own scoped locators, UI mechanics, and
observable browser waits. Each fluent method records a named async operation
synchronously and returns the current or destination page object. A single
returned or awaited Promise per phase runs those operations in order through
Playwright `test.step` and stops on failure. Reuse existing UI helpers and
consolidate any duplicated locator for the same shared control. Keep meaningful
inputs and expected values visible. Arrange valid domain facts through shared
MakeMe. The test harness owns Git, transport holds, native protocol evidence,
and cleanup. [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
· [ADR 0002, Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
· [Dashboard test synchronization](../../dashboard/tests/README.md#synchronization)
· [Test data architecture](../../tests/README.md#test-data-architecture)

**Key examples.**

- A held review for Story A shows its loading state. Story B's review opens
  and shows its changed file before A's answer is released. After the harness
  releases and drains A's answer, B's review remains the sole Side panel
  content. Keep the hold and release explicit between fluent phases.
- A review and a final report replace one another. Reopening after a switch
  reads a fresh snapshot. Asking for the review already shown moves focus to
  it and keeps its snapshot. Keep the mouse and keyboard divider actions and
  their expected changes visible. With a file selected in a review, switching
  to Intent and back keeps the review and its selection while Intent reads its
  own comparison. The final report similarly retains its content and session.
- Opening a review replaces the Terminal and detaches it while the native
  session stays open. Reopening the same session from the Sessions sidebar
  reattaches it in the normal split. Preserve the proof for selection,
  maximization, session identity, and continued access to the Board.

**Evaluation.** Compare the converted specs with their current versions.
Check the three journeys, affected consumers, and dashboard type-check. Inspect
a controlled assertion failure for its named step in the retained Playwright
trace and its underlying assertion in the failure output. Compare the three
existing Story card `Review changes` locator sites in these specs with the
pilot's shared owner by trying a reversible rename. Record whether developers
can follow the setup, actions and expectations, find the failing step, and
make the rename from one site in the pilot, along with the maintenance cost of
the helpers. Use those observations to recommend keeping, adjusting, or
extending the pattern. Wider adoption remains a separate decision. Follow the
[test automation rules](../../AGENTS.md#test-automation),
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests), and
[macOS sleep guard](../../tests/local-test-resources.md#machine-sleep-on-macos).
[ADR 0010, Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
