---
id: SEED-301
status: active
planted: 2026-11-11
planted_during: Terry requested a reminder to cap first-layer test cases at ten lines
trigger_when: Terry is ready to refine the test-case length rule and its tooling
scope: story
---

# SEED-301 — First-layer test case length

<a id="limit-first-layer-test-cases-to-ten-lines"></a>

### Limit first-layer test cases to ten lines

**Identity:** SEED-301#limit-first-layer-test-cases-to-ten-lines
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Refinement must define the test-case counting and enforcement details and settle the Nix, Python, and Lizard setup."],"basis":{"document":"873e4b47f32e727ebaa22bfae983bf7202be0e00fe5fe97f6babb11338965550"}}
```

#### Goal

Keep test intent easy for Open Dough developers to read by limiting each
first-layer test case body to 10 lines of code. Use the existing MakeMe test
data builders and page objects to keep setup and browser mechanics out of the
case body while keeping the scenario and its expected outcome visible.
[MakeMe](../../Distribution/tests/README.md#test-data-architecture) · [Page objects](../../dashboard/tests/fluent-side-panel-pilot.md#fluent-phases-in-the-side-panel-content-journeys)

#### Refinement reminder for Terry

Enforce the rule during refinement. Agree how Lizard will count lines of code
in individual test case bodies and verify that a 10-line case passes and an
11-line case is flagged.

Set up the tooling in dependency order. Use Nix to manage the development
environment, provide Python through that environment, then add Lizard for
line counting.

<a id="arrange-ci-comparison-tests-through-makeme"></a>

### Arrange CI comparison frontend tests through MakeMe

**Identity:** SEED-301#arrange-ci-comparison-tests-through-makeme
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Dashboard Frontend Tests of the story CI comparison read as short
scenarios: their data is built through MakeMe builder steps instead of many
separately imported fact helpers, so each spec imports less and each case
states only the facts it relies on.

**Scope:** The CI comparison family in `dashboard/frontend-tests` (the Summary
and Proof comparison specs and their `mountedComparison*Cases.ts`) and the
data helpers they import from `dashboard/tests/support`: prepared comparison,
summary scope, mixed, relative and wall-time entries, adapter slots and
selections. These become steps of one MakeMe builder for a compared story;
turning prepared proof into the rendered endpoint proofs moves into the
rendering harness. Expected rows, page objects and serving stay where they
are. Other frontend families (served dashboard answers, Intent published
projects, launches and sessions) follow as their own stories.

**Known expectations:** every changed spec keeps its scenario inputs and
independent expectations and passes; the family's data-building imports from
`dashboard/tests/support` drop to the builder entry point; superseded helper
modules are removed.
