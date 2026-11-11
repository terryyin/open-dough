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

<a id="run-makeme-harness-once"></a>

### Run MakeMe harness checks once by default

**Identity:** SEED-307#run-makeme-harness-once
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/594-run-makeme-harness-once/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"91275e8ef4405aae30ff9d72c2bccb8d7580f4c869e0a4235d6260334d9aecf0","plan":"039c6db40706575a71934d81c88baa82be9f3df2c072d93c4bbf98c466035b5f"}}
```

#### Goal

Developers and CI retain all nine maintained MakeMe assessment controls without repeating
their fixture installation, Git setup and mutation checks in each default run.

#### Scope

Give each MakeMe harness test one default execution route. Preserve the two
directly discovered Node harness files, including common-command authoring and
refactor scope compatibility controls, and the explicit zero-argument and native
uses of `tests/makeme-native-use.sh`. Keep existing runner selection, split and
failure behavior. This is bounded retrospective suite correction, with no
MakeMe rule, selector, native-host or adoption change and no paid native probe.

**Plan:** [Run MakeMe harness checks once by default](../slice-plans/594-run-makeme-harness-once/PLAN.md)
