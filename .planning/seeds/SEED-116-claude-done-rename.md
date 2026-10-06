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

<a id="claude-done-rename"></a>

### A Claude Code session marked done is renamed without an open terminal

**Identity:** SEED-116#claude-done-rename
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**For / why:** A developer who lets a Claude Code session report quietly, or
who marks it done from a card or Recently done, expects Claude Code to list it
under its `done-` name, as Codex sessions are, without opening its terminal.

**Goal:** Whenever a still-running Claude Code session is marked done, the
dashboard renames it to its `done-` name through its own attachment after the
session's current turn ends, and shows a rename problem only when the rename
truly cannot be done or confirmed.

**Scope:**

Required behavior:

- Quiet completion keeps its local Done mark immediately and leaves the native
  rename pending, not failed, while the reporting turn runs.
- Once Claude Code's listing shows the session idle, the dashboard opens a
  private `claude attach` from the project folder, types `/rename
  done-<name>`, confirms the name through the listing, and detaches. The
  developer sees no terminal for it.
- Mark as done renames the same way whether or not the developer has the
  session's terminal open, and whether or not its saved workspace exists.
- A visible terminal the developer has open is not disturbed by a private
  rename attachment beyond the typed `/rename` itself.
- A rename problem appears only when the session process is gone, the
  attachment cannot open, or the listing does not confirm the name within the
  wait. Its text names that cause.
- A record already carrying today's "requires terminal input" or "No terminal
  attachment" problem is renamed by Mark as done when its session is still
  running.
- `dashboard/AGENT-LAUNCH-COMPLETION.md` and
  `dashboard/AGENT-LAUNCH-TERMINALS.md` describe the new behavior and drop the
  instruction to finish the rename with Mark as done.

Rejection constraints:

- No typing into a Claude Code session while it is running a turn.
- No writes to Claude Code's transcript or session storage.
- Codex and Cursor done behavior is unchanged.

Deferred promises, not commitments of this delivery:

- Renaming a Claude Code session whose process has already exited (it would
  need a resume). It keeps a problem naming that cause.

**Key examples:**

1. A Claude Code session reports quiet completion. The card moves to Recently
   done with no red problem; after its turn ends, `claude agents --json` lists
   it as `done-Open Dough · Refinement · …`.
2. The developer clicks Mark as done on a working Claude Code card without
   opening its terminal. The session is renamed and stopped; no "No terminal
   attachment" problem appears.
3. Recently done shows a session whose worktree was retired ("The saved
   workspace is missing") and an old rename problem. Mark as done renames it
   and the problem disappears.
4. The session process has exited before the rename runs. The card keeps its
   local Done mark and states that the session is no longer running, so it
   could not be renamed.
5. The listing never shows the new name within the wait. The card states that
   the rename could not be confirmed, and a later Mark as done retries it.

- **Value / learning:** Restores the `done-` naming promised by SEED-052's Mark
  as done and confirms that a private `claude attach` from the project folder
  is a reliable rename channel.
- **Effort hypothesis:** M — medium confidence; assumes `claude attach` accepts
  typed `/rename` on an idle session from the project folder, which has not yet
  been observed.
- **Depends on:** none
- **Safe stopping point:** Mark as done through a private attachment
  (examples 2 and 3) is valuable without the deferred quiet-completion rename.

## Ordering and Scope Reduction

One story. If it overruns, deliver Mark as done through a private attachment
first, then the deferred rename after quiet completion.

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
