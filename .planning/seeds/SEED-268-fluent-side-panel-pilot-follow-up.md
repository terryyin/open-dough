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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A dashboard test maintainer can extend the Side panel page objects
without coupling the panel and its contents in a module already at 246 of 250
lines. Readers can see what each negative assertion expects at the call site.

**Scope.** Resolve destinations through the current phase’s own page-object set.
Give the Side panel and its content objects independent module ownership and
replace boolean negative checks with named operations such as
`expectNotSelected()`. Keep the existing ordered cues, shared locators, and
browser, transport, and native observations. Limit changes to the pilot and
its shared helpers.

**Evaluation.** On the revised design, pass and record all three journeys:

- Review, another story’s review, and final report replacement, including the
  held response race and panel controls.
- Review and final report retention across Board and Intent, including the
  selected file and Intent’s separate comparison.
- Review and Terminal replacement beside the Board, including reattachment
  of the same session.

Check the dashboard type-check and affected consumers. A controlled assertion
failure still names the phase and step, reports the expected and received
values, and stops later cues. Restore the assertion and confirm the journey
passes. Record the revised helper and spec sizes and whether the shared
`Review changes` locator still has one owner in the pilot.
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
