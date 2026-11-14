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
