---
id: SEED-268
status: active
planted: 2026-11-08
scope: epic
---

# Fluent Side panel pilot follow-up

The completed pilot `SEED-263#pilot-fluent-dashboard-page-objects` landed on
`main` at `77741589a`. Its three journeys span the
[content replacement spec](../../dashboard/tests/navigation/side-panel-content-replacement.spec.ts)
and the [content switching spec](../../dashboard/tests/navigation/side-panel-content-switching.spec.ts).
The pilot evaluation is in `.planning/slice-plans/506-pilot-fluent-dashboard-page-objects/PLAN.md`
at `e0d4735e14ff40c64151d878d504af9aeab1515c`, under “Pilot evaluation”.

<a id="adjust-fluent-side-panel-page-objects"></a>

### Make fluent Side panel page objects easier to extend

**Identity:** SEED-268#adjust-fluent-side-panel-page-objects

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/516-adjust-fluent-side-panel-page-objects/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cbb618c926e59007068ef23e6ca323645cc88a8513b521c54f7cc72924987e3d","plan":"6d0d994e0c39c5feeda48c36f9456e71eda9e083ff6dd45945db0adcfd94f3f2"}}
```

**Goal.** A dashboard test maintainer can add a page object or a hand-off
between page objects in the Side panel pilot by editing the destination's own
module and the phase's page-object set, without growing a module that holds
the base, the Side panel and its contents together (now
`dashboard/tests/sidePanelContentPages.ts`, 246 of the
[250-line refactor limit](../../src/skills/dough-post-change-refactor/references/refactor-checks.md)).
Readers see what each negative assertion expects at the call site. The landed
evidence lets `SEED-268#conclude-fluent-side-panel-pilot` compare the revised
design with the pilot.

**Scope.**

- Each page object reaches the object the reader is at next through the
  current phase's own page-object set (`SidePanelPages`), not by constructing
  another module's class. Hand-offs keep returning that object, so specs keep
  their chains, and any object can now reach the Board, the Side panel, the
  Terminal or the Sessions sidebar.
- The shared base, the Side panel frame and its content objects each have
  their own module. Page-object modules depend on the base at run time and on
  the set only as a type; only the set's construction knows every class.
- Story card negative checks become named operations: `expectNotSelected()`,
  `expectNotInspected()` and `expectNotShownInTerminal()` replace
  `expectSelected(false)`, `expectInspected(false)` and
  `expectShownInTerminal(false)`. The positive operations take no boolean.
- Keep the phase runner (`support/cueSheet.ts`), every cue name and order,
  one locator owner per shared control, the MakeMe facts at the call site, and
  the browser, transport and native observations between phases. Update the
  “Fluent phases” section of `dashboard/tests/writing-journeys.md` to the
  revised ownership.
- Limit changes to the pilot's two specs, its page-object modules and that
  section. Shared helpers keep their signatures: `storyCardSelection.ts`'s
  boolean `expectSelected` and `expectInspected` serve 29 test files and stay
  as they are, called by the named page-object operations.
- Not in scope: page objects for other journeys, new journey behavior, or a
  route a spec does not use. Wider adoption stays with the conclusion story.

**Architecture.** Module dependencies point one way: spec → `sidePanelPages.ts`
(phase and set construction) → each page-object module → the base. A
page-object module names another page object only through the set's type,
which TypeScript erases, so splitting modules adds no run-time import cycle.
Today the base's `sidePanel` getter constructs `SidePanel`, which extends the
base and constructs `StoryReview` and `FinalReport`, whose `close()` returns
`this.sidePanel`; that cycle is what holds them in one module. The
[ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md)
keeps the page objects' names (Side panel, Story review, Final report). The
evaluation is prospective under
[the definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md):
its baseline is the pilot's measured state below, set before the run.

**Key examples.**

- *Hand-off through the set.* A phase writes
  `board.storyCard("Story A").reviewChanges().expectStory("Story A")`. →
  `reviewChanges()` returns the phase's `storyReview` from its set, and the
  cues run in the same order with the same names as before.
- *Back from content.* A phase writes
  `sidePanel.storyReview.close().expectItems(0)`. → `close()` returns the
  phase's Side panel, from a content module that does not import the Side
  panel module at run time.
- *Named negative.* The switching journey checks that Story B is not the
  Selected story. → The spec line reads
  `board.storyCard("Story B").expectNotSelected()`, and its cue is named
  `Story card "Story B": not selected`, as before.
- *Extension probe.* A scratch change gives the Final report a hand-off to the
  Board used by one phase. → It edits only the Final report's module and that
  phase, type-checks, and the journey passes. The probe is reverted, and the
  modules it touched are recorded.

**Evaluation.** Baseline, from the pilot at `77741589a`: runner and page
objects 709 lines, with `sidePanelContentPages.ts` 246,
`storyCardPages.ts` 161, `sidePanelPages.ts` 139, `terminalPages.ts` 96 and
`support/cueSheet.ts` 65; specs 250 (replacement) and 239 (switching); 9
boolean negative calls in the switching spec; one owner of the `Review changes`
locator (`StoryCard`). On the revised design, pass and record all three
journeys:

- Review, another story's review, and final report replacement, including the
  held response race and panel controls.
- Review and final report retention across Board and Intent, including the
  selected file and Intent's separate comparison.
- Review and Terminal replacement beside the Board, including reattachment
  of the same session.

Run the dashboard type-check and lint, and the specs of any other consumer of a
changed module. A controlled assertion failure still names the phase and step,
reports the expected and received values, and stops later cues. Restore the
assertion and confirm the journey passes. Record the revised module and spec
sizes against the baseline, no module over 250 lines, the extension probe's
touched modules, and whether the shared `Review changes` locator still has one
owner in the pilot.
Follow the [test automation rules](../../AGENTS.md#test-automation),
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests), and
[macOS test gate](../../tests/local-test-resources.md#machine-sleep-on-macos).

<a id="conclude-fluent-side-panel-pilot"></a>

### Draw a conclusion from the three Side panel pilot journeys and plan the next step

**Identity:** SEED-268#conclude-fluent-side-panel-pilot
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-268#conclude-fluent-side-panel-pilot","dependencies":[{"supplier":{"identity":"SEED-268#adjust-fluent-side-panel-page-objects","href":"seeds/SEED-268-fluent-side-panel-pilot-follow-up.md#adjust-fluent-side-panel-page-objects"},"implementation":"Land the revised fluent page objects and record comparable proof from all three Side panel pilot journeys.","rationale":"The original pilot identified a navigation constraint and proposed an adjustment. The conclusion needs evidence from the revised design on every pilot journey. The original results and design review alone cannot establish that the adjustment preserves each journey and its diagnostics.","condition":"The follow-up is on trunk with recorded passing proof for review and report replacement, retention across Board and Intent, and Terminal replacement and reattachment, plus the controlled failure result and the revised helper and spec sizes.","state":"waiting"}]}
```

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Dashboard test maintainers can use the results of all three journeys
to decide where the fluent pattern is worth using and what work should come
next.

**Scope and evaluation.** Compare the original pilot evaluation with the
follow-up’s landed evidence for each of the three journeys. Weigh spec
readability, the cost of changing a shared control, failure diagnostics, and
the amount and coupling of helper code. Record a conclusion and a next-step
plan with the scope, first candidate, and proof needed for any further trial,
or the stopping point if the evidence supports keeping the pattern within the
pilot. Wider adoption is a separate developer decision.
[Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
