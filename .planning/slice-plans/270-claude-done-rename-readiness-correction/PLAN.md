# A private Claude Code rename types only at a ready prompt

**Identity:** SEED-116#claude-done-rename-readiness-correction
**Source:** [correction story](../../seeds/SEED-116-claude-done-rename.md#claude-done-rename-readiness-correction),
from the execution retrospective of SEED-116#claude-done-rename
(`bcb39b01:.planning/seeds/SEED-116-claude-done-rename.md`, plan
`bcb39b01:.planning/slice-plans/267-claude-done-rename/PLAN.md`), delivered by
commits ed9a306e, 0bd831be and bcb39b01 (net diff `fef99b34..bcb39b01`) on
`claude/a-claude-code-session-marked-done-is-renamed-wit`.
**Prepared:** 2026-10-07. Planning only; refined in the established preparation
workspace on `codex/a-private-claude-code-rename-types-only-at-a-rea`, base
`fc2fbdc6c3e9303c4e8b1e0bc0b92ef5bb1cd35d`. Existing plan and identity retained.

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
attachment types, an owner-run real-attach probe, and native confirmation of
the corrected dashboard's Done action.

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

## Existing solutions and current decisions

PFE over the terminal registry, host boundary, and test support, rechecked
at the current preparation base. Reuse the existing host-owned native rename,
registry, recorded screen, and locked binding write rather than adding parallel
solutions. The launch-instruction readiness predicate has the same screen
contract, but its instruction/paste/persistence lifecycle is not the rename's:
reuse the predicate shape and screen, not the launch instruction operation.

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

No new North Star topic is needed. The established “Agent launch as a
requested assignment” topic in `.planning/NORTH-STAR.md` supports the selected
host ownership and shared terminal transport. [ADR 0002 — Software development lifecycle
principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
is Accepted: its cohesion principle supports reusing one attachment registry
and one Done operation. [ADR 0005 — Cross-tool validation through native
acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
is Accepted: fake-host proof does not establish real-host behavior; the
existing real-host probe remains pending. ADR 0008 is Proposed in both the
[index](../../../docs/adrs/README.md) and its record; it supplies no binding
constraint on done marks. No conflict with the relevant Accepted ADRs was
found in this refinement.

## Retry boundary (developer decision)

On 2026-10-07 Terry accepted the refinement recommendation: preserve manual
Done stopping after a failed rename and defer repair of the original
post-failure manual retry promise. The evidence is `finishNativeDone` in
`dashboard/server/doneMarks.ts` at `fc2fbdc6`: it catches the rename failure
and proceeds to native stop. The fake's revival proves a new running-session
precondition, not a later retry of the stopped session. Keep that distinction
explicit in spec descriptions and comments; do not add resume machinery.
A first manual recovery after a failed reported wait remains required because
reporting leaves the session running. No story or queue entry for retry repair
is created by this planning request.

## Decision point (developer)

Slice 1 measures attach-to-prompt time T on a real host. The manual wait is
five seconds and also covers the idle read, the listing call, 600 ms of key
pauses, and the confirming listing read (about two seconds together in O1).
If T leaves less than about one second of that wait (T above roughly three
seconds), record T in Learnings and hand the manual wait to the developer as
a decision; do not choose a new value. Slice 5 still proceeds: typing only at
the prompt is required whatever the wait is.

## Decisive premises and observations

The inherited observations below ran at `bcb39b01`; O2 covered only the
previous raw-HTTP case. Current preparation observations at `fc2fbdc6` follow
the table and supply the missing page journey. No implementation slice is done.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| The private client types after its first output settles, with no prompt check. | Slice 5's remedy. | Reading `liveTerminalClient.ts:60,130`, `terminalAttachments.ts:162-185`, `keptClientScreen.ts:107`, `detachedIdleWatch.ts` `text()`, `rename.ts:57-67`. Confirmed. |
| Claude's `attach` declares no readiness, and a private client ignores any. | Slice 5's seam choice. | Reading `claudeHost.ts:32-34` (`{ pty }` only) and `nativeAttach.ts:41-47` (`readiness: undefined` when private). Confirmed. |
| Declaring `ready` on Claude's attach would change the page terminal. | Current decision "not `TerminalAttachment.ready`". | Reading `joinedSockets.ts:76-86` (unadmitted socket gets `observe`), `:94-103`, `:115-127` (admission runs `reopen`). Confirmed. |
| No recorded Claude Code prompt text exists in this repository. | Slice 1 exists; slice 5's predicate. | `grep -rn "for shortcuts\|❯\|claudeReady" dashboard docs .planning`: no hits. Only the developer can observe it (auto mode denied an agent's node-pty `claude attach` on a real session, plan 267). Remainder bounded by probe slice 1. |
| The fake accepts keys immediately after `attached …`. | Slice 5's red-before proof. | Reading `tests/fixtures/fake-claude:125-136`. Confirmed. |
| Specs read the fake attach's screen text. | Slice 5's consumer set. | `grep -rln "attached \${\|\"attached \|'attached \|\`attached " dashboard/tests`: 15 specs (listed in slice 5's proof). |
| A record marked done with a problem offers Mark as done in Recently done. | Slice 2's UI path. | Reading `SessionEntry.tsx:135-137` (`!markedDone \|\| doneProblem !== undefined`) and `sessionCapabilities.ts:37-45`. Confirmed. |
| The old problem texts as stored. | Slice 2's fixture. | `git show fef99b34:dashboard/server/doneMarks.ts` line 88 and `:114`, `git show fef99b34:dashboard/server/hosts/claude/rename.ts` line 50: stored as `Local done mark retained. Claude Code rename failed: Native rename requires terminal input while the reporting sender is still working. Use Mark as done after reporting finishes.` and `Local done mark retained. Claude Code rename failed: No terminal attachment is available to confirm native rename.` |
| O2: the example 3 spec and proof command run here. | Slice 2's proof. | `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts session-workspace-retirement-claude.spec.ts --workers=1 --reporter=line`: 7 passed (12.5 s). Dependencies are installed at the repository root. |
| `keepRecord` without `doneMarks` is reached only by four out-of-process test writers. | Slice 3. | `grep -rn "keepRecord" dashboard/server dashboard/tests`: production callers `launchRun.ts:163`, `launchVerification.ts:153`, `launchRecording.ts:45` all pass it; `recordOperation` (`tests/support/completionRecovery.ts:30-51`) imports by name from `launchRecordStore.ts`, which re-exports `keepRecord` (`:69`). Confirmed. |
| Only Claude and Codex implement `rename`; Codex ignores the signal. | Slice 4. | `grep -rn "rename:" dashboard/server dashboard/tests`: `claudeHost.ts:35`, `codexHost.ts:29`; `renameCodex(record)` (`hosts/codex/done.ts:39`). Confirmed. |
| Manual Done writes `doneAt` with no pending text before its rename. | Slice 4's abandoned-manual rule. | Reading `doneMarks.ts:231-234` and `launchRecordStore.ts:123-139` (`doneProblem` dropped unless passed). Confirmed. |

### Current preparation observations (2026-10-07)

- The code underlying the inherited observations is unchanged between
  `bcb39b01` and `fc2fbdc6`. Literal comparison:
  `git diff bcb39b01..HEAD -- dashboard/server/liveTerminalClient.ts dashboard/server/terminalAttachments.ts dashboard/server/launchRecordBinding.ts dashboard/server/doneMarks.ts dashboard/server/hosts/claude/rename.ts dashboard/tests/session-workspace-retirement-claude.spec.ts dashboard/tests/fixtures/fake-claude`.
  Result: empty. The earlier comparison's root `tests/fixtures` spelling was
  corrected to the actual fixture path for this check.
- Slice 5's waiting seam: reading `LiveTerminalClient.watch()` and
  `screenText()`, `DetachedIdleWatch.text()`, `KeptClientScreen.cursorVisible()`
  and `settled()`, and `nativeAttach()` confirms that the private client owns
  a recorded 80×24 screen. Current `screenText()` provides only a settled read;
  the cursor flag and output/exit-aware predicate wait still need to be exposed
  through that existing observation. `LaunchInstruction.evaluate()` consumes
  the predicate after settled output but additionally owns launch input and
  paste handling, so it is not reused as the rename operation.
- Slice 3's full consumer route was searched with
  `rg -n 'keepRecord|recordOperation|observeCompletionFaults' dashboard scripts tests --glob '!*.md'`.
  Result: three production callers supply Done ownership. Three specs and
  `support/completionRecoveryFaults.ts` perform out-of-process binding writes;
  `agent-completion-recovery.spec.ts` calls `observeCompletionFaults`, which
  calls `recordOperation`, which dynamically imports the binding from
  `launchRecordStore.ts`. Its feature remains in slice 3's proof selection.
- Current dependency setup: the first observation could not start the preview
  server because this worktree lacked `node_modules/.bin/vite`. After
  `env -u NODE_ENV npm ci --ignore-scripts --offline` succeeded, the command
  `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts readiness-planning-observation.spec.ts agent-completion-binding.spec.ts agent-completion-quiet-claude.spec.ts --workers=1 --reporter=line --output /tmp/open-dough-readiness-planning-results`
  passed the eight existing binding/quiet tests. The two disposable page
  cases attempted an extra click on the already-running Done button; they
  did not settle the page premise in that run.
- Slice 2's full page journey was then observed with
  `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts readiness-planning-observation.spec.ts --workers=1 --reporter=line --output /tmp/open-dough-readiness-page-replay-results`:
  **2 passed (14.5 s)**. The disposable spec reused `recorded()` from
  `session-workspace-retirement-claude.spec.ts`, made the fake session
  `done-live`, saved a prior `doneAt` and each of the two old stored problem
  texts, removed the saved workspace, opened the page, found Recently done by
  session ID, asserted the old text, clicked Mark as done once, and asserted
  `Named`, both the native listing and private attach's `/rename` line, and
  disappearance of the old problem. The completed idle record bypasses the
  confirmation question. The disposable spec was removed after the observation;
  slice 2 still owns making this journey a maintained regression case.

## Proof ownership

| Correction outcome | Owning slice | Proof |
| --- | --- | --- |
| The real prompt, its recognizing text, and attach-to-prompt time are known | 1 | Developer's observation recorded in Learnings |
| Example 3 as written: Recently done, old problem text, Mark as done → `Named`, problem gone | 2 | `session-workspace-retirement-claude.spec.ts` |
| Keys are typed only once the prompt shows, within the one wait | 5 | New case: fake prompt delayed below the wait → `Named`, the attach's lines hold `/rename done-…`; red at `bcb39b01` (keys discarded → "could not be confirmed") |
| A prompt that never shows reports "could not be opened" and hangs up | 5 | Existing silent-attach case in `agent-launch-done-stop.spec.ts:214`, plus a case with the prompt delayed past the wait |
| Quiet completion keeps the pending mark until idle, then renames; first manual recovery after a failed reported wait works | 4, 5 | `agent-completion-quiet-claude.spec.ts` receipt, takeover, and expired-wait cases |
| The corrected dashboard renames on the real host | 5 | Owner-run Mark as done without a page terminal; native listing confirms `done-<name>` and the entry has no rename problem |
| Manual rename failures keep cause-specific text, retain local Done, and still stop; exited sessions are not renamed | 4, 5 | `agent-launch-done-stop.spec.ts`; descriptions distinguish external fake revival from the deferred retry |
| Open page terminals retain admission, typing, and reopen behavior; retirement needs no page terminal | 2, 5 | `agent-terminal-done-reopen.spec.ts`, terminal consumer specs, and `session-workspace-retirement-claude.spec.ts` |
| Docs and comments say the private attachment types at the prompt | 5 | Reading `AGENT-LAUNCH-TERMINALS.md:97-101`, `terminalAttachments.ts`, `launchHosts.ts` |
| `keepRecord` takes `doneMarks` as required; test writers use the binding write | 3 | Typecheck plus the four writers' specs green |
| One signal, always passed; abandoned manual Done never shows `Named` | 4 | Typecheck; done and quiet specs green; new manual close case |
| Codex and Cursor done behavior unchanged | 4, 5 | `agent-completion-quiet.spec.ts`, `agent-completion-cursor.spec.ts` green |

Proof commands, from the worktree root:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec>.spec.ts --workers=1
env -u NODE_ENV npm run typecheck:dashboard
env -u NODE_ENV npm run lint
```

Because slice 5 changes the fake Claude every dashboard spec loads, run the
whole `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard`
once after slice 5 and before delivery.

## Ordered slices

Slices 2–4 do not depend on slice 1 and may run while its observation is
pending. Slice 5 starts after slice 1's accepted marker/timing and slice 4's
signal seam; it keeps its fake and product changes in one green delivery.

### 1. A real Claude Code attach prompt is observed
Type: Behavior
Status: planned
Owner: developer; early probe, no product implementation.
Proof: the developer's recorded observation in Learnings: the prompt's
recognizing text, T, and the rename confirmed in the listing.

Behavior: a developer-selected finished session is still running and idle
with no page terminal → the owner observes its native attach → the ready
prompt is distinguishable from earlier output at 80×24, typed `/rename` is
confirmed by the listing, and prompt timing is recorded for slice 5.

The original execution recorded an auto-mode refusal of an agent's real
attach. This plan keeps the remaining credentialed, state-changing observation
owner-run; no real attach was attempted during this preparation. The owner
chooses a session they intend to finish and captures its native attach:

```sh
cd /Users/terryyin/git/open-dough
claude agents --json --all            # pick one with "status":"idle"
script -q /tmp/claude-attach.typescript claude attach <short id>
# Use an 80×24 terminal for this capture and record time to the ready prompt.
# The moment the input prompt shows, type: /rename done-<its name>  Enter,
# then Ctrl+Z.
claude agents --json --all | grep -o '"name":"done-[^"]*"'
```

Record: T measured from starting attach to the first ready prompt, without
including time spent typing or detaching; the native version and session;
what the prompt looks like; and whether the listing shows the new name. The
executing agent then renders
`/tmp/claude-attach.typescript` through `KeptClientScreen` (xterm headless,
80×24 as the private client) up to before the typed `/rename` echo, and
records the screen text and the stable marker that slice 5's predicate will
use. Read both the pre-prompt and ready snapshots through that same renderer;
terminal prose or a replay that does not distinguish those states is not
sufficient evidence. Stop rule: if no stable marker distinguishes the ready
prompt from the screen before it, or the rename typed at the prompt is not confirmed, stop
slice 5 and replan. If T exceeds roughly three seconds, apply the decision
point above.

Safe stopping point: the real marker and timing are known; a failed probe
leaves the current product untouched and stops slice 5. Slices 2–4 remain
independent. This probe is not evidence that the corrected dashboard works.

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

Safe stopping point: the old-problem recovery is proved through the page,
without changing the native prompt assumption or stopping policy.

### 3. `keepRecord` requires its Done owner
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

Safe stopping point: the binding and its completion owner have one explicit
contract, with deletion, reserved-receipt, early-binding, and recovery journeys
still green. No new native operation or persistence authority is introduced.

### 4. One rename signal, owned by the Done that runs
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
otherwise unchanged. Preserve manual stop after rename failure. Where a
spec externally makes a stopped fake session run again, describe that as a new
precondition rather than proof of the deferred retry promise. Cancellation
reports the existing cause for its stage of the rename wait; the reported
abandonment still discards that late write.

Safe stopping point: both Done intents share their lifecycle owner, and an
abandoned manual attempt cannot advertise a confirmed native name. This is a
direct correction of finding 4; it also supplies slice 5's cancellation seam.

### 5. The private rename attachment types only once Claude Code's prompt shows
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
then the whole dashboard suite; typecheck and lint. One owner-run real-host
Mark as done with no page terminal, followed by native listing confirmation,
checks the corrected dashboard against the marker observed in slice 1.
Pending owner-held proof remains incomplete; do not substitute the fake or
slice 1's direct native rename for this observation.

Behavior: a recorded Claude session is idle with no terminal open, and its
attach shows `attached …` at once but its prompt only after a delay shorter
than the wait → Mark as done → the record shows `Named done-<name>` with no
problem, and the attach's recorded lines are exactly `/rename done-<name>`
(at `bcb39b01` the same case fails: the keys arrive before the prompt and are
discarded). With the prompt delayed past the wait → `The terminal attachment
could not be opened.`, no lines typed, the attach ended by SIGHUP. With an
open page terminal, typing is as today.

Before changing production, make the fake emit the observed prompt late and
discard early keys; run the delayed-prompt case against the unchanged rename
path and require the expected confirmation failure. If it already passes,
stop this remedy and investigate the symptom rather than claiming a fix.
Keep that red setup uncommitted until the whole slice is green.

Includes: the Claude prompt predicate from slice 1 in
`dashboard/server/hosts/claude/`; `WithAttachment` and
`TerminalAttachments.withAttachment` take the predicate the rename supplies,
and `openPrivate` waits for a recorded screen that satisfies it, re-evaluated
after each output settles, ended by `signal` or the client's exit. Extend
`LiveTerminalClient` and its existing `DetachedIdleWatch`/`KeptClientScreen`
observation to provide the settled text and cursor visibility to that wait;
the current `screenText()` is only a read, not a readiness subscription. Reuse
the client's existing screen, output stream, and tracked lifetime. Aborts,
exit, or a false prompt never start typing; remove any wait listener on every
settlement. Preserve one deadline for idle, prompt, key entry, and confirmation,
including the key pauses; do not restart the wait after readiness. Keep the
fake's prompt marker, delay file, pre-prompt key discard, support control, and
README line in this same slice; the comments at `terminalAttachments.ts:124-128`,
`:159-161`, `launchHosts.ts:55-60`, `nativeAttach.ts:1-3`, and
`AGENT-LAUNCH-TERMINALS.md:97-101` say the private attachment types once
Claude Code's prompt shows.

Safe stopping point: delayed-prompt success, bounded failure/cleanup, and
real-host confirmation establish the correction. If the real host disagrees,
keep the failure and change the predicate/proof in this same slice; do not
claim the real-host outcome from green fake tests alone.

## Starting from a clean session

- Execute in the story's existing worktree or a fresh one from trunk once this
  plan and story are published; dependencies are installed at the repository
  root here. In a new checkout run `env -u NODE_ENV npm ci --ignore-scripts
  --offline` first: a dashboard-launched session inherits
  `NODE_ENV=production`, under which `npm ci` skips dev dependencies.
- Slice 1 is owner-run because it uses a real credentialed session; its
  state-changing observation has not been run in this preparation. The final
  real-host observation is also owner-run and uses the corrected dashboard.

## Current decisions

- Implementation slices run their named specs, typecheck, and lint before
  commit. The owner-run probe changes no product code and records its
  observation instead. Slice 5 adds the whole dashboard suite once because
  the shared fake executable is loaded by distributed test consumers.
- During execution, apply the installed dough-execute-plan local delivery
  gates: focused proof acceptance and independent dough-post-change-refactor
  before commit, repository formatting through `npm run format`,
  and delivery/CI ownership. See its references/delegation.md and
  references/wrap-up.md; do not treat hosted CI as an additional local gate.
  This request supplies planning authority only.
- Terry's resolved retry boundary applies to every slice: manual stopping is
  preserved, post-failure manual retry repair is deferred, and first manual
  recovery after a failed reported wait remains required.
- No new wait value; see the decision point.

## Plan refinement review

Refinement ran on the existing plan. Retain the owner-held early probe and the
retired-workspace proof slice. Retain the two direct retrospective Structure
corrections, moving the binding correction to slice 3 and signal ownership to
slice 4 before the prompt Behavior at slice 5. Retain the fake, readiness wait,
production integration, failure cleanup, and host proof in one prompt slice:
those changes establish one outcome, and separating them would deliver a fake
that invalidates existing consumers before its matching production behavior.
No slice is complete; the resulting count is five.

The common rule is one Done-owned, bounded rename attempt: Claude owns its
idle/prompt recognition and native confirmation; the shared registry owns the
attachment and its observed screen; binding owns the durable record and hands
native continuation to Done after releasing locks. PFE confirmed the existing
host boundary, screen model, and locked binding operation as suitable seams.
No second PTY path, readiness screen, persistence grammar, or background retry
is needed. `.planning/NORTH-STAR.md`'s “Agent launch as a requested assignment”
topic supports host-owned native operations and shared terminal transport;
its direction is carried forward unchanged. ADR 0008 remains Proposed.

No numeric slice target or hard limit was supplied by this request or
`AGENTS.md`; sizing includes implementation, focused proof, refactoring, and
cleanup under the installed slice-decomposition rule. The two Structure
slices each own one evidenced weakness and preserve external journeys.
The prompt slice has one red-to-green loop plus broad consumer verification;
its owner-held observation and shared-fixture suite are explicit costs, not
hidden preparation. No remaining boundary or cumulative-design concern was
identified in this review. Native observations remain pending work with the
stop rules above; readiness of this plan does not mark them passed.

## Learnings
