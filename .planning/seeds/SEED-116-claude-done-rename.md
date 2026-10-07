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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/267-claude-done-rename/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bc20898849cee334c0e86229d9364aeb9a9f2bfe0136492409f9ff7318c1a3b3","plan":"ef9999aced06ed89082a6d1c93bd0eae6bc81cbe803592cd3f110b4b84fa2453"}}
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
  rename pending, not failed, while the reporting turn runs. The reporting
  command is the sender's last operation, so once the receipt is answered the
  dashboard waits a bounded time for Claude Code's listing to show the
  session idle. The wait is one automatic attempt, not a background retry
  loop.
- Once the listing shows the session idle, the dashboard opens a private
  `claude attach` from the project folder, types `/rename done-<name>`,
  confirms the name through the listing, and detaches. The developer sees no
  terminal for it.
- Mark as done renames the same way whether or not the developer has the
  session's terminal open, and whether or not its saved workspace exists.
- A visible terminal the developer has open is not disturbed by a private
  rename attachment beyond the typed `/rename` itself.
- A rename problem appears only when the session process is gone, the
  session is still working when the wait ends, the attachment cannot open, or
  the listing does not confirm the name within the wait. Its text names that
  cause, and a later Mark as done retries.
- A record already carrying today's "requires terminal input" or "No terminal
  attachment" problem is renamed by Mark as done when its session is still
  running.
- `dashboard/AGENT-LAUNCH-COMPLETION.md` and
  `dashboard/AGENT-LAUNCH-TERMINALS.md` describe the new behavior, drop the
  instruction to finish the rename with Mark as done, and reword "there is no
  background retry" to describe the one bounded wait after the receipt.

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
6. A session reports quiet completion but its turn keeps running past the
   wait. The card keeps its local Done mark, states that the session was still
   working, and Mark as done later renames it once it is idle.

**Architecture:**

- The private rename attachment is the socketless live client
  `dashboard/server/terminalAttachments.ts` already keeps for a launch
  handoff, opened through the host's `attach` and hung up by the rename when
  it finishes. `dashboard/server/hosts/claude/rename.ts` does not grow a
  second PTY path beside it. A client the developer has open is typed into as
  today and is left open afterwards.
- Each host owns when its rename may run: Codex renames at once out of band;
  Claude waits for the listing to show the session idle, then types. The
  `renameWhileReporting` flag and the "requires terminal input" guard in
  `dashboard/server/doneMarks.ts` go away with that move; the shared Done
  operation only attempts each host's rename and records its problem.
- The receipt is answered before the sender's turn can end, so the wait for
  idle and for the listed name runs as one bounded continuation of the Done
  operation after the receipt, owned and closed with the server's terminal
  registry; no scheduler, poller, or new record state is added.

- **Value / learning:** Restores the `done-` naming promised by SEED-052's Mark
  as done through the private `claude attach` rename channel observed above.
- **Effort hypothesis:** M — good confidence. The decisive premise was
  observed on 2026-10-07: a private node-pty `claude attach 3d97347c` from
  `/Users/terryyin/git/open-dough`, on an idle session whose worktree had
  already been removed, accepted a typed `/rename done-…` (Ctrl-U, the
  command, Enter, 300 ms apart, four seconds after attaching). `claude agents
  --json --all` listed the new name within half a second, and the session kept
  running after the attachment was hung up with SIGHUP.
- **Depends on:** none
- **Safe stopping point:** Mark as done through a private attachment
  (examples 2 and 3) is valuable without the automatic rename after quiet
  completion.

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
