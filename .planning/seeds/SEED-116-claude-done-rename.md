---
id: SEED-116
status: active
planted: 2026-10-07
planted_during: Terry's bug report that renaming Claude Code sessions on done keeps failing
trigger_when: A Claude Code session marked done keeps its working name or shows a rename failure
scope: M
---

# SEED-116: Rename Claude Code sessions when they are done

## Why This Matters

A developer scanning Claude Code's own session list relies on the `done-`
prefix to tell finished dashboard sessions from live work. Since commit
`69b938f4` (2026-10-06) routed quiet completion through the shared Done
operation, no Claude Code session is renamed in ordinary use:

- Every quiet completion records "Claude Code rename failed: Native rename
  requires terminal input while the reporting sender is still working. Use Mark
  as done after reporting finishes." (11 sessions in the local launch store on
  2026-10-07). The guard is `dashboard/server/doneMarks.ts`, for hosts without
  `renameWhileReporting`.
- The advised Mark as done then fails with "No terminal attachment is available
  to confirm native rename." unless the developer has that session's dashboard
  terminal open (8 sessions). Claude Code's rename types `/rename` only into an
  existing dashboard attachment (`dashboard/server/hosts/claude/rename.ts`).
- When the saved workspace is gone, as after landing a worktree, the dashboard
  offers no terminal, so the red problem can never be cleared. Example: session
  `3d97347c-c5bb-41a4-804b-e40ec1ace1bd` (SEED-115 refinement) is listed by
  `claude agents --json --all` as `idle`/`done`, still running as pid 17444,
  with its working name.

Codex is unaffected: it renames out of band through `thread/name/set`.

## Alternatives and Decision

Recommended: the dashboard renames through its own short-lived `claude attach`
once the session no longer runs a turn. `claude attach <short id>` runs from
the project folder (`dashboard/server/hosts/claude/runtime.ts`), not the
session's workspace, so a removed worktree does not prevent it.

Rejected alternatives:

- Skip the rename for quiet completion. The developer wants the `done-` name.
- Write Claude Code's `custom-title` transcript entry directly. It depends on
  undocumented storage, and the live session process keeps rewriting its title.
- Rename while the reporting turn still runs. Typed input would interleave with
  the session's own work, which is why the current guard exists.

Claude Code 2.1.292 offers no out-of-band rename command (`claude agents`,
`claude --help`).

## Story Decomposition

<a id="claude-done-rename-readiness-correction"></a>

### A private Claude Code rename types only at a ready prompt

**Identity:** SEED-116#claude-done-rename-readiness-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/270-claude-done-rename-readiness-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"03ef40608b8ff7db3817528f40641477682c1da98580c16f0c8312f722be661c","plan":"c80335c2c287d00d32edb66adb3757e9d59d12ed24f8e63697e9fe7a570f6cbc"}}
```

**Goal:** A developer marking a Claude Code session done, or letting it
complete quietly, gets its `done-` name on a real Claude Code host because the
private rename attachment types only once Claude Code's prompt shows. This
corrects the Claude done rename delivery (SEED-116#claude-done-rename,
`bcb39b01:.planning/seeds/SEED-116-claude-done-rename.md`); it adds no feature
promise.

**Scope:** The private attachment waits for Claude Code's prompt, within the
same one bounded wait, before typing, proven with a fake whose prompt can
arrive late and one developer-run real-host observation; example 3 is proven
from Recently done on a record carrying an old rename problem; `keepRecord`
takes `doneMarks` as required, with its out-of-process test writers using the
binding write; one rename signal is always passed, owned by the Done that
runs. Every promise of the Claude done rename story is preserved. Manual Done
stopping a session after a failed rename is a pending owner decision, outside
this correction.

**Plan:** [270-claude-done-rename-readiness-correction](../slice-plans/270-claude-done-rename-readiness-correction/PLAN.md)

## Ordering and Scope Reduction

One story. If it overruns, deliver Mark as done through a private attachment
first, then the automatic rename after quiet completion.

## Open Decisions

None.

## When to Surface

Now: every quiet Claude Code completion shows a rename failure.

## Breadcrumbs

- Regressing commit: `69b938f4` "Route quiet completion through the shared
  session Done operation".
- Guard: `dashboard/server/doneMarks.ts` (`finishNativeDone`,
  `renameWhileReporting`).
- Claude Code rename: `dashboard/server/hosts/claude/rename.ts`; attach:
  `dashboard/server/hosts/claude/runtime.ts` (`attachClaude`).
- Workspace limitation text: `dashboard/src/sessionAccess.ts`.
- Docs: `dashboard/AGENT-LAUNCH-COMPLETION.md` (native naming),
  `dashboard/AGENT-LAUNCH-TERMINALS.md` (Mark as done).
- Original Mark as done story: [SEED-052](SEED-052-start-agent-work-from-dashboard.md).
