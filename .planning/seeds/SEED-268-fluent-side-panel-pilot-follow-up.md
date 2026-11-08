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
The follow-up `SEED-268#adjust-fluent-side-panel-page-objects` revised the
page objects; its evaluation, with all three journeys, the controlled
failure and the revised sizes, is in
`.planning/slice-plans/516-adjust-fluent-side-panel-page-objects/PLAN.md` at
`5217098d1bd32ad7f317d3f995a4f6807fd821b4`, under “Revised design evaluation”.

<a id="conclude-fluent-side-panel-pilot"></a>

### Draw a conclusion from the three Side panel pilot journeys and plan the next step

**Identity:** SEED-268#conclude-fluent-side-panel-pilot
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-268#conclude-fluent-side-panel-pilot","dependencies":[{"supplier":{"identity":"SEED-268#adjust-fluent-side-panel-page-objects","href":"seeds/SEED-268-fluent-side-panel-pilot-follow-up.md#adjust-fluent-side-panel-page-objects"},"implementation":"Land the revised fluent page objects and record comparable proof from all three Side panel pilot journeys.","rationale":"The original pilot identified a navigation constraint and proposed an adjustment. The conclusion needs evidence from the revised design on every pilot journey. The original results and design review alone cannot establish that the adjustment preserves each journey and its diagnostics.","condition":"The follow-up is on trunk with recorded passing proof for review and report replacement, retention across Board and Intent, and Terminal replacement and reattachment, plus the controlled failure result and the revised helper and spec sizes.","state":"satisfied","resolution":{"revision":"5217098d1bd32ad7f317d3f995a4f6807fd821b4","path":".planning/seeds/SEED-268-fluent-side-panel-pilot-follow-up.md#adjust-fluent-side-panel-page-objects","summary":"The revised page objects landed on main at 07dccccf8. Plan 516's “Revised design evaluation” at 5217098d1 records all three journeys passing (replacement 5.3 s, retention across Board and Intent 4.1 s, Terminal replacement and reattachment 4.4 s) with an unchanged phase › cue step tree, the controlled failure (names test › phase › cue, expected and received, stops later cues; restored and passing), and the revised module and spec sizes against the pilot baseline (largest module 173 lines, specs 250 and 239). Execution-branch CI passed on 5217098d1 and c155906c6.\nCondition satisfied: The follow-up is on trunk with recorded passing proof for review and report replacement, retention across Board and Intent, and Terminal replacement and reattachment, plus the controlled failure result and the revised helper and spec sizes.\nAccepted integration: 07dccccf8939572c8c99e8c15ec4d56795f406e9 on origin/refs/heads/main."}}]}
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
