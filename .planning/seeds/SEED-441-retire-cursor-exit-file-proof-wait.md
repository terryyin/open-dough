---
id: SEED-441
status: active
planted: 2026-11-25
planted_during: SEED-440 slice 5 queued the product removal after the exit-file Still-necessary check retired the workaround
trigger_when: selected from the product backlog
scope: one story
---

# SEED-441 — Retire Cursor exit-file proof wait

<a id="retire-cursor-exit-file-proof-wait"></a>

### Retire Cursor exit-file proof wait

**Identity:** SEED-441#retire-cursor-exit-file-proof-wait
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Maintainers and agents waiting for long proof on Cursor use the
native AwaitShell (or foreground Shell) path instead of the until/sleep/
exit-file polling loop in Distribution wait guidance.

**Scope to refine.** Remove or replace the Cursor-specific exit-file blocking
loop under
[wait-for-proof.md#by-host](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#by-host)
so Cursor guidance prefers native waiting on surfaces that expose AwaitShell.
Update any installed mirrors and tests that pin the exit-file Cursor bullet.
Leave Codex and Claude Code host bullets unchanged. Keep the tool-workaround
register disposition and next-review trigger aligned after the product change.

**Evaluation.** On a recorded Cursor agent surface with AwaitShell, a proof
command that exits nonzero across the foreground window and one that is still
running at a wait budget both complete through the revised guidance without
requiring an exit-file poll. Guidance consumers no longer instruct the
until/sleep/exit-file Cursor loop as the required wait.

**Source.** Queued from [SEED-440](SEED-440-recheck-cursor-workarounds.md#recheck-cursor-workarounds)
slice 1 retire disposition. Evidence:
[tool-workarounds — Cursor exit-file proof wait](../../docs/maintainer/tool-workarounds.md)
(2026-11-25 review) and worktree evidence `slice1-full-report.md`,
`slice1-awaitshell-receipts.txt`, `slice1-nonzero.exit`,
`slice1-deadline-terminal.txt` under the SEED-440 execution checkout.
