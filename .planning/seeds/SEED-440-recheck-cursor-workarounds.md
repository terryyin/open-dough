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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/836-recheck-cursor-workarounds/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c2a2ee20ab6bd31e7187029aaba52d7e9fea7b4c2a5138d7956e537874300756","plan":"404eee0b85107ce85cadefc55af63d84b2d2a22ce1b8df3ba777d6546d13ecb8"}}
```

#### Goal

Maintainers can decide which Cursor-specific Distribution behavior to keep,
simplify, or retire using evidence from Cursor itself. Prefer running the
review in Cursor and check the native Cursor surface where each workaround runs.

#### Scope

Review all four Cursor entries in the
[tool workaround register](../../docs/maintainer/tool-workarounds.md): exit-file
proof waits, CI generation identity, imported Claude Code hooks, and the
slice-clock hook's empty-`cwd` fallback. For each entry, answer in the register's
review order:

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

Also check interrupted delegation as a boundary case starting from
[ODF-229](../../docs/maintainer/findings/ODF-229.md). Identify any
Cursor-specific cancellation or proof-return gap separately from the general
practice of verifying edits and proof after an interruption.

Record the answers in order for every case, including tool build, client
surface, payload revision, evidence, and disposition (keep, simplify, retire,
or inconclusive). Update the register with the result and the next review
trigger where needed. Give any remaining product change a concrete follow-up.
Use native evidence for retirement decisions under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).

**Scope limits.** This story does not implement retire or simplify product
patches; those become follow-ups. It does not change Codex or Claude Code
register entries. Inconclusive is a valid recorded outcome when native evidence
is missing. Closing ODF-229 is not required unless that boundary check produces
evidence that warrants a separate follow-up.

#### Key examples

- **Exit-file proof wait.** On the recorded Cursor build and surface, a proof
  command that crosses the foreground window exits nonzero, and another reaches
  the deadline. With the exit-file loop disabled and no hidden substitute,
  native waiting either delivers the real result once within the deadline
  without needless model wakes, or fails that bar; the register records keep,
  simplify, retire, or inconclusive from that evidence.
- **CI generation identity.** A parent and child agent path exposes the
  identifiers Shell and hooks see, including across a new prompt. If a common
  native identity delivers the CI failure once to the correct agent, the
  temporary generation bridge can be simplified or retired; otherwise the
  register keeps it with the observed gap.
- **Imported Claude Code hooks.** Both hook sets are installed with imports
  enabled. Observation shows which handlers receive each event and which can
  produce effects. When native dispatch or scoped configuration ensures one
  effective handler for each intended action, the `cursor_version` skip can be
  simplified; otherwise keep with the dual-handler evidence.
- **Empty-`cwd` slice-clock fallback.** Coordinator and subagent tool calls in a
  linked worktree show whether the native event identifies the command's own
  checkout, including with multiple workspace roots. Drop the fallback only when
  that input is reliable; otherwise keep with the empty-`cwd` observation.
- **Interrupted delegation boundary.** An interrupted Cursor Task leaves edits
  without a proof return. The review records whether any Cursor-specific
  cancellation or proof-return gap remains beyond the existing interrupted-
  delegation recovery guidance; any product change is a follow-up, not this
  story's delivery.
