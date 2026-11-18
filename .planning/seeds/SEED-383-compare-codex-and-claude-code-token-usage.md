---
id: SEED-383
status: active
planted: 2026-11-16
planted_during: Terry asked to compare dashboard token usage for Codex and Claude Code
trigger_when: selected from the product backlog
scope: story
---

# SEED-383 — Compare Codex and Claude Code token usage

<a id="tell-compared-usage-tools-apart"></a>

### Tell compared Usage tools apart and drop stale read errors

**Identity:** SEED-383#tell-compared-usage-tools-apart
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/662-tell-compared-usage-tools-apart/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7bbde2078ac0afd6838bc215db389e885fbc3fcfb668ada4989f9948bfe4c61f","plan":"5345a4a0043f5557d4990d9891fef1699b965a12be1a7d38eef8fa831c7f72b1"}}
```

#### Goal

A developer comparing Codex and Claude Code in System settings → Usage can tell
the two tools' marks apart without relying on colour, and sees a read failure
only while it still describes the shown selection. This corrects the delivered
comparison; it adds no promise about the product's intent.

#### Scope

Correct the comparison's stale failure alert, its colour-only mark identity and
legend, prove that answers for an old selection never join a new one, and align
the Usage contract text with the delivered behaviour.

[Correction plan](../slice-plans/662-tell-compared-usage-tools-apart/PLAN.md)
