---
id: SEED-440
status: active
planted: 2026-11-25
planted_during: Terry Yin requested one evidence-led review of the Cursor workarounds
trigger_when: selected from the product backlog
scope: one review story
---

# SEED-440 — Recheck Cursor workarounds

<a id="recheck-cursor-workarounds"></a>

### Recheck Cursor workarounds

**Identity:** SEED-440#recheck-cursor-workarounds
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Maintainers can decide which Cursor-specific Distribution behavior to keep,
simplify, or retire using evidence from Cursor itself. Prefer running the
review in Cursor and check the native Cursor surface where each workaround runs.

#### Scope

Review all four Cursor entries in the
[tool workaround register](../../docs/maintainer/tool-workarounds.md): exit-file
proof waits, CI generation identity, imported Claude Code hooks, and the
slice-clock hook's empty-`cwd` fallback. Also check interrupted delegation as
a boundary case. Identify any Cursor-specific cancellation or proof-return
gap separately from the general practice of verifying edits and proof after
an interruption. Start from [ODF-229](../../docs/maintainer/findings/ODF-229.md).

#### Review order

1. **Right problem.** Trace the observed failure to its cause. Decide whether
   the tool creates the problem, the Distribution creates it, or the workflow
   asks the agent to do unnecessary work. If the workaround addresses a symptom,
   identify what would prevent the problem at its source.
2. **Still necessary.** On a recorded current Cursor build and pinned payload,
   reproduce the relevant workflow in isolation with the workaround disabled
   and without a hidden substitute. Record the actual tool calls, hook inputs,
   receipts, or independent state needed to judge the result. Missing evidence
   leaves the conclusion inconclusive.
3. **Right solution.** When the underlying problem still exists, compare the
   current workaround with the simplest viable use of Cursor's native behavior
   or the existing Distribution workflow. Check that the simpler path preserves
   the user-visible result and report the trade-off.

#### Acceptance

Record the answers in order for every case, including tool build, client
surface, payload revision, evidence and disposition. Update the register with
the result and the next review trigger where needed. Give any remaining product
change a concrete follow-up. Use native evidence for retirement decisions
under [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
