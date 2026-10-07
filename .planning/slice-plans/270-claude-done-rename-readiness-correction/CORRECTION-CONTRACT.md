# Correction contract

Part of [plan 270](PLAN.md); execution identity and ordered slices stay there.

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
attachment types, the explicitly authorized agent-run real-attach probe, and
native confirmation of the corrected dashboard's Done action.

Exclusions:

- **Deferred promise (Terry's decision, 2026-10-07).** Manual Done continues
  stopping the session after a failed rename. Repair of the original
  post-failure manual retry promise is outside this correction. This adds no
  rejection of naturally available retries: a first manual recovery after a
  failed quiet report, while the session still runs, remains required.
- The page terminal's admission and reopen for Claude stay as they are: no
  readiness is declared on Claude's `attach` result (see current decisions).
- No new wait value. If the measured attach-to-prompt time threatens the
  five-second manual wait, the decision point below applies.

## Key examples

1. A still-running idle session has no page terminal. Its private attach
   prints a banner before showing the input prompt. Manual Done, or quiet
   completion after its receipt and the end of its turn, types no keys at the
   banner; once the prompt appears, it types `/rename done-<name>`, confirms
   the name in the native listing, and closes the private attachment. Idle,
   prompt, typing, and confirmation share the existing one bounded wait.
2. The banner arrives but the prompt never appears before the wait ends.
   The local Done mark remains, the attachment closes without typed input,
   and the record reports `The terminal attachment could not be opened.`
   A session still running a turn is never typed into. A page terminal the
   developer already has open keeps its existing behavior.
3. Recently done contains a still-running idle session whose saved worktree
   was retired and whose record carries either old rename problem below.
   The developer clicks Mark as done there; the entry shows
   `Named done-<name>`, the old problem disappears, and the native listing
   confirms the name. Proof starts with that record and uses the page action.
4. A quiet completion report arrives before its launch record is bound. The
   production binding operation retains that report and its required Done
   owner starts the reported Done. Out-of-process test writers can exercise
   the binding write without creating a production exception for a missing
   Done owner.
5. A later Done or server close abandons a running rename wait. The signal
   owned by that Done reaches the rename for either intent. An abandoned
   reported Done leaves its pending mark; an abandoned manual Done retains
   a rename problem and never displays `Named` for an unconfirmed rename.

The post-failure manual retry repair is deferred by the developer's decision
below. A failed quiet report still permits a first manual recovery while the
session runs. The early real-host probe supplies the prompt marker and timing
before the readiness predicate is implemented.

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

Preserve the promises and key examples of SEED-116#claude-done-rename except
its deferred post-failure manual retry repair, including a first manual
recovery after a failed reported wait. Preserve compatible accepted proof
recorded in plan 267's Learnings: quiet completion pending then renamed after
the receipt; Mark as done renaming with or without an open terminal and with
or without the saved workspace; an open terminal typed into and left
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
