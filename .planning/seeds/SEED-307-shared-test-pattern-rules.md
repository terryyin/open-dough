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

Refine the configuration syntax, the
behavior for existing entries, and delivery to agents in Codex, Cursor, and
Claude Code when each story is selected.

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

<a id="run-makeme-harness-once"></a>

### Run MakeMe harness checks once by default

**Identity:** SEED-307#run-makeme-harness-once
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/594-run-makeme-harness-once/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"91275e8ef4405aae30ff9d72c2bccb8d7580f4c869e0a4235d6260334d9aecf0","plan":"039c6db40706575a71934d81c88baa82be9f3df2c072d93c4bbf98c466035b5f"}}
```

#### Goal

Developers and CI retain the seven MakeMe assessment controls without repeating
their fixture installation, Git setup and mutation checks in each default run.

#### Scope

Give each MakeMe harness test one default execution route. Preserve the two
directly discovered Node harness files and the explicit zero-argument and native
uses of `tests/makeme-native-use.sh`. Keep existing runner selection, split and
failure behavior. This is bounded retrospective suite correction, with no
MakeMe rule, selector, native-host or adoption change and no paid native probe.

**Plan:** [Run MakeMe harness checks once by default](../slice-plans/594-run-makeme-harness-once/PLAN.md)
