# A private Claude Code rename types only at a ready prompt

**Identity:** SEED-116#claude-done-rename-readiness-correction
**Source:** [correction story](../../seeds/SEED-116-claude-done-rename.md#claude-done-rename-readiness-correction),
from the execution retrospective of SEED-116#claude-done-rename
(`bcb39b01:.planning/seeds/SEED-116-claude-done-rename.md`, plan
`bcb39b01:.planning/slice-plans/267-claude-done-rename/PLAN.md`), delivered by
commits ed9a306e, 0bd831be and bcb39b01 (net diff `fef99b34..bcb39b01`) on
`claude/a-claude-code-session-marked-done-is-renamed-wit`.
**Prepared:** 2026-10-07. Planning only, in the execution's worktree.

## Goal and boundaries

A developer who marks a Claude Code session done, or lets it complete
quietly, gets its `done-` name on a real Claude Code host, not only against
the fake: the private rename attachment types `/rename` only once Claude
Code's prompt is shown, within the same one bounded wait. Example 3 of the
reviewed story is proven as written, and the two small seams the delivery
left in production code (an optional `doneMarks` kept only for test callers,
and a rename signal passed for one intent only) are made whole.

Included: the four current findings below, the fake Claude and its support
control needed to prove finding 1, the comments and
`dashboard/AGENT-LAUNCH-TERMINALS.md` wording that state when the private
attachment types, and one developer-run observation of a real `claude attach`.

Exclusions:

- **Pending owner decision, not planned here.** Manual Done stops the session
  after a failed rename, so on a real host "a later Mark as done retries"
  (story example 5, and example 6's manual retry) meets a stopped session and
  reports "no longer running"; the specs revive the session with
  `claudeSessionBecomes(id, "done-live")`. Changing that changes a story
  promise and is left to the developer.
- The page terminal's admission and reopen for Claude stay as they are: no
  readiness is declared on Claude's `attach` result (see current decisions).
- No new wait value. If the measured attach-to-prompt time threatens the
  five-second manual wait, the decision point below applies.

## Base this plan is written against

Branch `claude/a-claude-code-session-marked-done-is-renamed-wit` at
`bcb39b019fef7897699bc8805e686f5a9e853619`, plan 267's completed execution.
File and line references below are to that revision.

## Current findings

1. **The private attachment types at its first output byte, not at a ready
   prompt.** `LiveTerminalClient.firstOutput` resolves on the first `onData`
   chunk (`dashboard/server/liveTerminalClient.ts:60`, `:130`);
   `TerminalAttachments.openPrivate` then awaits only `client.screenText()`
   (`dashboard/server/terminalAttachments.ts:170-171`), which drains xterm's
   write queue (`KeptClientScreen.settled()` returns `pending`,
   `keptClientScreen.ts:107`; `DetachedIdleWatch.text()`), with no quiet
   period or prompt recognition; `renameInClaudeCode` then types Ctrl-U,
   `/rename …`, Enter 300 ms apart (`hosts/claude/rename.ts:57-67`). The
   comments (`terminalAttachments.ts:124-128`, `launchHosts.ts:57-60`) and
   plan 267's premise say "first settled screen". The only real-host evidence
   (plan 267, O1) typed after a fixed four-second wait. The fake Claude
   accepts input as soon as it prints `attached …`
   (`tests/fixtures/fake-claude:126`, `:136`), so no spec can see early
   typing. On a real host the first keys may be dropped, giving "could not be
   confirmed" for every no-terminal Mark as done and every quiet completion.
2. **Example 3 is only partly proven.**
   `dashboard/tests/session-workspace-retirement-claude.spec.ts:142-170` marks
   done over raw HTTP on a record with no prior problem. The story example
   starts from Recently done showing a retired-workspace session with an old
   rename problem, and the scope requires records carrying the old
   "requires terminal input" or "No terminal attachment" problem to be renamed
   by Mark as done.
3. **`keepRecord`'s optional `doneMarks` exists only for test callers.**
   `keepRecord(sourceId, record, doneMarks?)`
   (`dashboard/server/launchRecordBinding.ts:14-18`) is called with
   `doneMarks` by all three production callers (`launchRun.ts:163`,
   `launchVerification.ts:153`, `launchRecording.ts:45`); only out-of-process
   test writers omit it, and its comment ("a writer without them starts none")
   writes that test seam into production.
4. **The rename signal is passed for one intent only.** `LaunchHost.rename(…,
   intent, stopped?)` (`launchHosts.ts:129-135`) gets `stopped` only for
   reporting (`doneMarks.ts:181`), and `renameInClaudeCode` defaults it to a
   fresh signal (`rename.ts:47`); manual Done's `track` receives an
   `AbortController` nothing listens to (`doneMarks.ts:119`, `:130-142`).

## Preserved promises and constraints

Every promise and key example of SEED-116#claude-done-rename and the accepted
proof recorded in plan 267's Learnings: quiet completion pending then renamed
after the receipt; Mark as done renaming with or without an open terminal and
with or without the saved workspace; an open terminal typed into and left
open; the four problem texts (`The session is no longer running, so it was not
renamed.`, `The session was still working when the wait ended.`, `The
terminal attachment could not be opened.`, `The native rename could not be
confirmed.`) and the pending text; one bounded wait per attempt (five seconds
manual, sixty reporting, `DOUGH_DONE_RENAME_WAIT_MS` in tests); manual Done
during a reported wait running one rename; server close leaving the pending
mark and hanging up the private client.

Rejection constraints, unchanged: no typing into a Claude Code session while
it is running a turn; no writes to Claude Code's transcript or session
storage; Codex and Cursor done behavior unchanged.

## Existing solutions and current decisions

PFE over the terminal registry, host boundary, and test support:

- **A readiness predicate shape already exists.** Host attach results may
  declare `ready?: (screen, cursorVisible) => boolean`
  (`launchHosts.ts:42`); Cursor declares one from its composer text
  (`hosts/cursor/terminal.ts:18-26`, `hosts/cursor/idleScreen.ts`), and
  `LaunchInstruction` evaluates such a predicate on a server-side
  `KeptClientScreen` after each output (`launchInstruction.ts:88`). The
  private client already records its screen (`nativeAttach.ts:41-47`,
  `observeScreen: true`). Decision: reuse the predicate shape and the private
  client's recorded screen; Claude Code's prompt recognition lives in its host
  (`dashboard/server/hosts/claude/`, beside `rename.ts`) and is supplied by the
  rename to `WithAttachment`, which waits for it on the private client after
  each output settles, under the same `signal`. A screen that never shows the
  prompt before the wait ends reports `The terminal attachment could not be
  opened.`, as a silent attach does today.
- **Not `TerminalAttachment.ready` for Claude.** Declaring it on Claude's
  `attach` result would also gate the page terminal's admission and its
  reopen of a done session (`joinedSockets.ts:76-86`, `:115-127`), a page
  behavior change outside this correction. The open-socket path of
  `withAttachment` types as today: that terminal is the developer's.
- **The fake already has per-attach controls.** `claudeAttachesSilent`
  (`tests/support/fakeClaude.ts:94`, `:227-229`) toggles a state file the
  fixture reads. Decision: the fake's attach prints a prompt marker modelled on
  slice 1's observed prompt after its `attached …` line, after a delay read
  from one more state file (default none), and discards keys that arrive
  before the marker; `tests/support/fakeClaude.ts` gains one control to set
  that delay, documented in `dashboard/tests/README.md` beside
  `claudeAttachesSilent`.
- **`keepRecord`'s two parts.** Decision: the locked binding write becomes its
  own exported operation that returns the early report it found (re-exported
  from `launchRecordStore.ts`, where `recordOperation` imports from);
  `keepRecord(sourceId, record, doneMarks)` takes `doneMarks` as required and
  starts the reported Done after that write. The out-of-process test writers
  call the binding write by its name. **Caution:** making `doneMarks` required
  broke these callers once during plan 267; all four
  (`agent-completion-recovery.spec.ts:157`,
  `agent-completion-early-recovery.spec.ts:105`,
  `agent-completion-binding.spec.ts:165`,
  `tests/support/completionRecoveryFaults.ts:88`) change in the same slice.
- **One rename signal, owned by `track`.** Decision: `track` creates the
  controller and hands its signal to the Done it runs; both intents pass it to
  `LaunchHost.rename`, whose `stopped` becomes required (Codex ignores it, as
  today). A reported Done that is abandoned writes nothing (today's rule). A
  manual Done whose wait is abandoned, by a later Done of the same session or
  by `close()`, still records a rename problem from the four texts and never
  shows `Named` for a rename that did not complete, because its `doneAt` was
  already written without a pending text (`doneMarks.ts:231-234`,
  `launchRecordStore.ts:123-139`).

No North Star topic is needed; no Accepted ADR conflicts (ADR 0008 keeps done
marks as local operational evidence; ADR 0002's cohesion keeps one attachment
registry and one Done operation).

## Decision point (developer)

Slice 1 measures attach-to-prompt time T on a real host. The manual wait is
five seconds and also covers the idle read, the listing call, 600 ms of key
pauses, and the confirming listing read (about two seconds together in O1).
If T leaves less than about one second of that wait (T above roughly three
seconds), record T in Learnings and hand the manual wait to the developer as
a decision; do not choose a new value. Slice 3 still proceeds: typing only at
the prompt is required whatever the wait is.

## Decisive premises and observations

Observations ran in this worktree at `bcb39b01`; all are readings except O2.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| The private client types after its first output settles, with no prompt check. | Slice 3's remedy. | Reading `liveTerminalClient.ts:60,130`, `terminalAttachments.ts:162-185`, `keptClientScreen.ts:107`, `detachedIdleWatch.ts` `text()`, `rename.ts:57-67`. Confirmed. |
| Claude's `attach` declares no readiness, and a private client ignores any. | Slice 3's seam choice. | Reading `claudeHost.ts:32-34` (`{ pty }` only) and `nativeAttach.ts:41-47` (`readiness: undefined` when private). Confirmed. |
| Declaring `ready` on Claude's attach would change the page terminal. | Current decision "not `TerminalAttachment.ready`". | Reading `joinedSockets.ts:76-86` (unadmitted socket gets `observe`), `:94-103`, `:115-127` (admission runs `reopen`). Confirmed. |
| No recorded Claude Code prompt text exists in this repository. | Slice 1 exists; slice 3's predicate. | `grep -rn "for shortcuts\|❯\|claudeReady" dashboard docs .planning`: no hits. Only the developer can observe it (auto mode denied an agent's node-pty `claude attach` on a real session, plan 267). Remainder bounded by probe slice 1. |
| The fake accepts keys immediately after `attached …`. | Slice 3's red-before proof. | Reading `tests/fixtures/fake-claude:125-136`. Confirmed. |
| Specs read the fake attach's screen text. | Slice 3's consumer set. | `grep -rln "attached \${\|\"attached \|'attached \|\`attached " dashboard/tests`: 15 specs (listed in slice 3's proof). |
| A record marked done with a problem offers Mark as done in Recently done. | Slice 2's UI path. | Reading `SessionEntry.tsx:135-137` (`!markedDone \|\| doneProblem !== undefined`) and `sessionCapabilities.ts:37-45`. Confirmed. |
| The old problem texts as stored. | Slice 2's fixture. | `git show fef99b34:dashboard/server/doneMarks.ts` line 88 and `:114`, `git show fef99b34:dashboard/server/hosts/claude/rename.ts` line 50: stored as `Local done mark retained. Claude Code rename failed: Native rename requires terminal input while the reporting sender is still working. Use Mark as done after reporting finishes.` and `Local done mark retained. Claude Code rename failed: No terminal attachment is available to confirm native rename.` |
| O2: the example 3 spec and proof command run here. | Slice 2's proof. | `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts session-workspace-retirement-claude.spec.ts --workers=1 --reporter=line`: 7 passed (12.5 s). Dependencies are installed at the repository root. |
| `keepRecord` without `doneMarks` is reached only by four out-of-process test writers. | Slice 4. | `grep -rn "keepRecord" dashboard/server dashboard/tests`: production callers `launchRun.ts:163`, `launchVerification.ts:153`, `launchRecording.ts:45` all pass it; `recordOperation` (`tests/support/completionRecovery.ts:30-51`) imports by name from `launchRecordStore.ts`, which re-exports `keepRecord` (`:69`). Confirmed. |
| Only Claude and Codex implement `rename`; Codex ignores the signal. | Slice 5. | `grep -rn "rename:" dashboard/server dashboard/tests`: `claudeHost.ts:35`, `codexHost.ts:29`; `renameCodex(record)` (`hosts/codex/done.ts:39`). Confirmed. |
| Manual Done writes `doneAt` with no pending text before its rename. | Slice 5's abandoned-manual rule. | Reading `doneMarks.ts:231-234` and `launchRecordStore.ts:123-139` (`doneProblem` dropped unless passed). Confirmed. |

## Proof ownership

| Correction outcome | Owning slice | Proof |
| --- | --- | --- |
| The real prompt, its recognizing text, and attach-to-prompt time are known | 1 | Developer's observation recorded in Learnings |
| Example 3 as written: Recently done, old problem text, Mark as done → `Named`, problem gone | 2 | `session-workspace-retirement-claude.spec.ts` |
| Keys are typed only once the prompt shows, within the one wait | 3 | New case: fake prompt delayed below the wait → `Named`, the attach's lines hold `/rename done-…`; red at `bcb39b01` (keys discarded → "could not be confirmed") |
| A prompt that never shows reports "could not be opened" and hangs up | 3 | Existing silent-attach case in `agent-launch-done-stop.spec.ts:214`, plus a case with the prompt delayed past the wait |
| Quiet completion still renames through the private attachment | 3 | `agent-completion-quiet-claude.spec.ts` green |
| Docs and comments say the private attachment types at the prompt | 3 | Reading `AGENT-LAUNCH-TERMINALS.md:97-101`, `terminalAttachments.ts`, `launchHosts.ts` |
| `keepRecord` takes `doneMarks` as required; test writers use the binding write | 4 | Typecheck plus the four writers' specs green |
| One signal, always passed; abandoned manual Done never shows `Named` | 5 | Typecheck; done and quiet specs green; new manual close case |
| Codex and Cursor done behavior unchanged | 3, 5 | `agent-completion-quiet.spec.ts`, `agent-completion-cursor.spec.ts` green |

Proof commands, from the worktree root:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec>.spec.ts --workers=1
env -u NODE_ENV npm run typecheck:dashboard
env -u NODE_ENV node scripts/lint.mjs
```

Because slice 3 changes the fake Claude every dashboard spec loads, run the
whole `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard`
once after slice 3 and before delivery.

## Ordered slices

Slices 2, 4 and 5 do not depend on slice 1 and may run while its observation
is pending; slice 3 starts only after slice 1's Learnings entry exists.

### 1. A real Claude Code attach prompt is observed
Type: Probe (developer-run)
Status: planned
Proof: the developer's recorded observation in Learnings: the prompt's
recognizing text, T, and the rename confirmed in the listing.

The developer, from a terminal (an agent's `claude attach` on a real session
is refused by auto mode), picks a running idle session and records its
attach output:

```sh
cd /Users/terryyin/git/open-dough
claude agents --json --all            # pick one with "status":"idle"
time script -q /tmp/claude-attach.typescript claude attach <short id>
# The moment the input prompt shows, type: /rename done-<its name>  Enter,
# then Ctrl+Z.
claude agents --json --all | grep -o '"name":"done-[^"]*"'
```

Record: T (upper bound from `time`, or a stopwatch from Enter on the attach
command to the visible prompt), what the prompt looks like, and whether the
listing shows the new name. The executing agent then renders
`/tmp/claude-attach.typescript` through `KeptClientScreen` (xterm headless,
80×24 as the private client) up to before the typed `/rename` echo, and
records the screen text and the stable marker that slice 3's predicate will
use. Stop rule: if no stable marker distinguishes the ready prompt from the
screen before it, or the rename typed at the prompt is not confirmed, stop
slice 3 and replan. If T exceeds roughly three seconds, apply the decision
point above.

### 2. Example 3: Recently done renames a retired-workspace session with an old problem
Type: Behavior
Status: planned
Proof: `session-workspace-retirement-claude.spec.ts` green, with the case
below for each of the two old texts.

Behavior: a recorded Claude session whose saved workspace was removed, still
running and idle (`done-live`), marked done earlier with one of the two old
stored problem texts above → the developer opens the page and clicks Mark as
done on its Recently done entry → the entry shows `Named done-<name>` and no
longer shows the old text or any problem, the listing names `done-<name>`,
and the fake saw one private attach whose lines are `/rename done-<name>`.

Includes: replacing the HTTP `markDone` call in the existing case at
`:142-170` with the page click, seeding `doneAt` and the old `doneProblem`
through `recorded()`/`save` before the page loads. No product change is
expected; if the case fails, that is a product defect this slice fixes.

### 3. The private rename attachment types only once Claude Code's prompt shows
Type: Behavior
Status: planned
Proof: the new cases below in `agent-launch-done-stop.spec.ts`; existing
`agent-launch-done-stop`, `agent-terminal-done-reopen`,
`session-workspace-retirement-claude`, `agent-completion-quiet-claude`,
`agent-completion-binding`, `agent-completion-quiet`,
`agent-completion-cursor`, `agent-launch-card-done`,
`agent-launch-done-question`, `agent-launch-done-codex-races`,
`agent-launch-done`, `session-unread-report` green; the 15 specs that read the
fake attach's text green (`agent-terminal`, `agent-terminal-reopen`,
`agent-terminal-maximize`, `agent-terminal-boundary`,
`agent-launch-ad-hoc-sessions`, `session-sidebar-keyboard`,
`frame-sessions-look`, `agent-launch-ad-hoc-terminal`,
`agent-terminal-lifetime`, `story-panel-switching`,
`session-sidebar-navigation`, `agent-terminal-done-question`,
`agent-terminal-keyboard`, `agent-terminal-avatar`, `side-panel-width`);
then the whole dashboard suite; typecheck and lint.

Behavior: a recorded Claude session is idle with no terminal open, and its
attach shows `attached …` at once but its prompt only after a delay shorter
than the wait → Mark as done → the record shows `Named done-<name>` with no
problem, and the attach's recorded lines are exactly `/rename done-<name>`
(at `bcb39b01` the same case fails: the keys arrive before the prompt and are
discarded). With the prompt delayed past the wait → `The terminal attachment
could not be opened.`, no lines typed, the attach ended by SIGHUP. With an
open page terminal, typing is as today.

Includes: the Claude prompt predicate from slice 1 in
`dashboard/server/hosts/claude/`; `WithAttachment` and
`TerminalAttachments.withAttachment` take the predicate the rename supplies,
and `openPrivate` waits for a recorded screen that satisfies it, re-evaluated
after each output settles, ended by `signal` or the client's exit; the fake's
prompt marker, delay file, and pre-prompt key discard; the support control and
its README line; the comments at `terminalAttachments.ts:124-128`,
`:159-161`, `launchHosts.ts:55-60`, `nativeAttach.ts:1-3`, and
`AGENT-LAUNCH-TERMINALS.md:97-101` say the private attachment types once
Claude Code's prompt shows.

### 4. `keepRecord` always starts a reported Done
Type: Structure
Status: planned
Proof: `agent-completion-recovery.spec.ts`,
`agent-completion-early-recovery.spec.ts`, `agent-completion-binding.spec.ts`,
`agent-completion-identity.spec.ts` green; typecheck; lint.

Correction: removes the production comment and optional parameter that exist
only for out-of-process test writers. The locked binding write is exported by
its own name and returns the early report; `keepRecord` requires `doneMarks`
and starts the reported Done after it. The four test writers named in current
decisions call the binding write, in the same change. External behavior is
unchanged; enables nothing further.

### 5. One rename signal, owned by the Done that runs
Type: Structure
Status: planned
Proof: typecheck; `agent-completion-quiet-claude.spec.ts` (manual Done during
the wait, server closed mid-wait), `agent-launch-done-stop.spec.ts`,
`agent-terminal-done-reopen.spec.ts`, `agent-completion-quiet.spec.ts`,
`agent-completion-cursor.spec.ts` green; one new case in
`agent-launch-done-stop.spec.ts`: a manual Done waiting on a `working`
session while the server closes leaves a record that does not show `Named`
(its `doneProblem` is one of the four texts); lint.

Correction: `NativeDoneMarks.track` creates the controller and passes its
signal to the Done it runs; `NativeDone` carries it for both intents;
`LaunchHost.rename`'s `stopped` is required and `renameInClaudeCode` drops its
default. A reported Done abandoned writes nothing, as today; an abandoned
manual Done records its rename failure as today's outcome would. Behavior is
otherwise unchanged.

## Starting from a clean session

- Execute in the story's existing worktree or a fresh one from trunk once this
  plan and story are published; dependencies are installed at the repository
  root here. In a new checkout run `env -u NODE_ENV npm ci --ignore-scripts
  --offline` first: a dashboard-launched session inherits
  `NODE_ENV=production`, under which `npm ci` skips dev dependencies.
- Slice 1 is the developer's. Ask for it at the start; it is not repeatable
  by an agent.

## Current decisions

- Each slice runs its named specs, typecheck, and lint before its commit;
  slice 3 adds the whole dashboard suite once.
- The pending owner decision on manual Done stopping after a failed rename is
  not touched by any slice.
- No new wait value; see the decision point.

## Learnings
