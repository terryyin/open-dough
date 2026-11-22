---
id: SEED-405
status: active
planted: 2026-11-18
trigger_when: selected from the backlog
scope: one story
---

# SEED-405 — Introduce Cucumber to E2E Test

<a id="introduce-cucumber-to-e2e-test"></a>

### Introduce Cucumber to E2E Test

**Identity:** SEED-405#introduce-cucumber-to-e2e-test
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer reviewing a representative Open Dough workflow can read its expected
behavior in a Gherkin feature and see whether that scenario passed in the normal
local and CI runs of [E2E Test](../../e2e/README.md).

#### Scope

Introduce Cucumber by converting one existing E2E workflow. Keep the real
product entry point, integration boundaries, and behavioral assertions that
workflow already exercises, and keep step definitions thin over production and
existing E2E boundaries without adding a duplicate `test-support` layer
([Architectural North Star](../NORTH-STAR.md)). Use the first conversion to see
how well the feature communicates the workflow and how its results appear in E2E
proof.

#### Key examples

- A developer reads the feature and can identify the starting conditions, the
  user action, and the observable outcome.
- The converted scenario runs through the usual E2E entry point locally and in
  CI. When the expected outcome fails, the proof identifies the scenario and
  the failed step.
