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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/662-tell-compared-usage-tools-apart/PLAN.md"}
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
