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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/521-conclude-fluent-side-panel-pilot/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e8da4fd4de9a13ac56b5f207c4b74efdd2d7bfa3004cca2499635f17bc6f7c1c","plan":"53646a9759fe58ad71e9b33def4a2ae91fbf5884863ae5e919206a0b54b26c31"}}
```

**Goal.** Dashboard test maintainers can use evidence from all three Side
panel journeys to decide where fluent phases earn their maintenance cost and
whether a further trial is worth proposing.

**Scope.** Record a source-linked conclusion in the existing
[browser journey guide](../../dashboard/tests/writing-journeys.md#fluent-phases-in-the-side-panel-content-journeys).
Compare the procedural baseline, original pilot, and landed revision where
the records support that comparison. Weigh spec readability, shared-control
edit cost, failure diagnostics, and helper size and coupling. Separate
observed results from inferences and state the limits of the comparison.
If a further trial is warranted, name one existing first candidate, the
bounded change, the proof to collect against its baseline, and when to stop.
Otherwise state where to stop and what evidence could reopen the question.
Further trials and conversions are follow-up work. The developer owns any
wider adoption decision.
[ADR 0010, Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

**Key examples.**

1. Given the two pilot evaluations, a maintainer can trace the comparison
   to three distinct outcomes: review and report replacement through a held
   response, review and report retention with selection across Board and
   Intent, and Terminal replacement with reattachment to the same session.
2. Given the shared-control rename, controlled failures, and extension
   evidence, a maintainer can see where edits and diagnostics land and weigh
   smaller modules and clearer negative calls against added helper code.
3. Given the limits of the three journeys and the scratch extension probe,
   a maintainer can tell whether to stop with the pilot or consider one
   bounded candidate with explicit proof and a stopping rule.
