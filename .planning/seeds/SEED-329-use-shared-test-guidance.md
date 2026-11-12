---
id: SEED-329
status: active
planted: 2026-11-12
scope: story
---

# Use shared MakeMe and page-object guidance

<a id="guard-scheduled-test-makeme-selection"></a>

### Guard scheduled-test MakeMe selection

**Identity:** SEED-329#guard-scheduled-test-makeme-selection
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/605-guard-scheduled-test-makeme-selection/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84f5e0e89b50790661cf4df7658faf7bb3e194866793205401db282ad3e9e79c","plan":"9d9c28defa34f2c5dabadb4c938feaaafb30246b5eedafa9402a7cc190f470d4"}}
```

#### Goal

A maintainer changing this repository's Intent locations or runner globs learns
at once when a runner-scheduled test stops selecting MakeMe. That keeps the
closed selection gap from reopening unnoticed.

#### Scope

- One maintained check reads this repository's own `.planning/open-dough.json`,
  `tests/node-test-files` globs and `tests/*.sh`, and confirms that every
  scheduled source selects MakeMe with page objects off. It also confirms the
  `tests` location keeps its shell and JavaScript syntax hints.
- Plan: [605](../slice-plans/605-guard-scheduled-test-makeme-selection/PLAN.md)
