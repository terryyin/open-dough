---
id: SEED-307
status: active
planted: 2026-11-11
planted_during: Terry requested shared test pattern rules selected per test entry
trigger_when: Terry is ready to refine and decompose the shared testing guidance
scope: story
---

# SEED-307 — Shared test pattern rules

<a id="apply-shared-test-pattern-rules-per-entry"></a>

### Apply shared test pattern rules per entry

**Identity:** SEED-307#apply-shared-test-pattern-rules-per-entry
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Developers configuring test entries in a project that uses Open Dough can
declare whether each entry uses page objects and whether it uses MakeMe test
data builders. Agents working on an entry receive the shared rules for the
patterns declared for that entry.

#### Scope to refine

- Extract reusable page-object guidance from Donut's `e2e-authoring` skill
  and Open Dough's [browser journey guide](../../dashboard/tests/writing-journeys.md#fluent-phases-in-the-side-panel-content-journeys).
  Keep user actions and expected behavior visible in tests, with shared UI
  mechanics owned by page objects.
- Extract reusable MakeMe guidance from Donut's `unit-testing` skill and
  Open Dough's [test data architecture](../../tests/test-data-architecture.md).
  Keep scenario-defining facts visible at the call site and use shared
  builders for valid domain setup and incidental defaults.
- Let each configured test entry declare the two choices independently.
  Verify that an agent working on an entry receives both rules, only the
  page-object rule, only the MakeMe rule, or neither, as declared. The choices
  can differ across entries in the same project.

Decompose this broad story when it comes up for refinement. Settle how projects
declare the choices, how existing entries are handled, and how the applicable
rules reach agents across supported hosts.
