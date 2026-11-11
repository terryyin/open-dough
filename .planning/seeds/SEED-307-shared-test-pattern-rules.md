---
id: SEED-307
status: active
planted: 2026-11-11
planted_during: Terry requested shared test pattern rules selected per test entry
trigger_when: Terry selects either shared testing rule for refinement
scope: story
---

# SEED-307 — Shared test pattern rules

Projects can document test patterns in local guidance, but each project has
to maintain that guidance and tell agents which test entries it covers.
Developers should be able to select shared rules for each test entry so agents
receive guidance that fits the tests they are working on.

Deliver MakeMe first so developers can use the shared data-building guidance
even if page-object work is deferred. Refine the configuration syntax, the
behavior for existing entries, and delivery to agents in Codex, Cursor, and
Claude Code when each story is selected.

<a id="apply-shared-makeme-rules-per-entry"></a>

### Apply shared MakeMe rules per entry

**Identity:** SEED-307#apply-shared-makeme-rules-per-entry
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can declare whether a configured test entry uses MakeMe. An agent
working on that entry receives the shared MakeMe rule when the entry selects
it. Another entry in the same project can opt out.

#### Scope to refine

- Draw reusable guidance from Donut's `unit-testing` skill and Open Dough's
  [test data architecture](../../tests/test-data-architecture.md). Keep facts
  that define the scenario visible in the test and use shared builders for
  valid domain setup and incidental defaults.
- Verify with two entries in one project, one that selects MakeMe and one
  that opts out, that agents receive the MakeMe rule only for the first entry.

<a id="apply-shared-page-object-rules-per-entry"></a>

### Apply shared page-object rules per entry

**Identity:** SEED-307#apply-shared-page-object-rules-per-entry
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can declare whether a configured test entry uses page objects.
An agent working on that entry receives the shared page-object rule when the
entry selects it. The page-object choice is independent of the MakeMe choice.

#### Scope to refine

- Draw reusable guidance from Donut's `e2e-authoring` skill and Open Dough's
  [browser journey guide](../../dashboard/tests/writing-journeys.md#fluent-phases-in-the-side-panel-content-journeys).
  Keep user actions and expected behavior visible in tests and put shared
  browser mechanics in page objects.
- Verify that entries in the same project can select page objects with or
  without MakeMe, and that entries with page objects disabled still receive
  the MakeMe rule when selected. Cover both rules, either rule alone, and
  neither rule.
