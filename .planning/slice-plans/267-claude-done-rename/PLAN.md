# A Claude Code session marked done is renamed without an open terminal

**Identity:** SEED-116#claude-done-rename
**Source:** [refined story](../../seeds/SEED-116-claude-done-rename.md#claude-done-rename).
**Prepared:** 2026-10-07. Planning only, in the story's existing preparation
workspace on `claude/a-claude-code-session-marked-done-is-renamed-wit`.

## Goal and boundaries

Whenever a still-running Claude Code session is marked done, from a card,
Recently done, or quiet completion, the dashboard renames it to its `done-`
name through its own attachment once the session is idle, and shows a rename
problem only when the rename truly cannot be done or confirmed. The developer
opens no terminal for it, and a retired worktree does not prevent it.

Include the story's required behaviors, its three rejection constraints (no
typing into a session that is running a turn, no writes to Claude Code's
storage, Codex and Cursor done behavior unchanged), and its six key examples.

Renaming a session whose process has exited is deferred: it keeps a problem
naming that cause. No dashboard control, record field, or page wording is
added beyond the problem texts named below.

## Base this plan is written against

Trunk at `8cc56ef41112764952a2dea6dcec27cb79f1c2e2`, the revision this
preparation was announced at. Two SEED-113 executions are in flight on their
own branches (rate-limit recovery, reuse of unchanged records); both change
GitHub reading under `dashboard/server/gh*.ts`, none of the files this plan
touches.

## Existing solutions and current decisions

PFE over the dashboard server and its test support found the owners this plan
reuses or changes; no new boundary, store, API, or page control is introduced.

- **One Done operation already serves manual Done and quiet completion.**
  `finishNativeDone` (`dashboard/server/doneMarks.ts`) attempts the host's
  `rename`, then for manual intent ends attachments and attempts `stop`, and
  writes the record once with `expectedDoneAt` and `automatic` guards, so a
  late automatic write is dropped when the developer changed the mark
  meanwhile (`setRecordDoneAt`, `dashboard/server/launchRecordStore.ts`).
  Decision: keep that one operation and its guards; the "requires terminal
  input" guard and the `renameWhileReporting` host flag are removed, because
  each host's `rename` decides for itself when it may type.
- **The registry already keeps a native client with no socket.**
  `TerminalAttachments` (`dashboard/server/terminalAttachments.ts`) keeps a
  `LiveTerminalClient` before any socket for a launch handoff, settles its
  server-side screen through `KeptClientScreen`, types into it
  (`LaunchInstruction`), and hangs it up on `close()`. Decision: the private
  rename attachment is one more socketless client opened through the host's
  `attach`, scoped to one rename, and hung up by it; `rename.ts` spawns no
  PTY of its own. A client the developer has open is typed into as today and
  left open.
- **The Claude listing already carries the signal.** `claudeSessions`
  (`dashboard/server/hosts/claude/runtime.ts`) parses `status` (`busy`,
  `idle`, `waiting`, present only while the process runs) but keeps it only
  as `availability`. Decision: the private listing keeps `status` on
  `ListedSession`, and the Claude rename waits for `idle`; an entry with no
  `status`, or no entry, is a gone process. Shared `SessionObservation`
  shapes do not change.
- **Quiet completion is answered before the sender's turn ends.**
  `deliverCompletion` (`dashboard/server/completionDelivery.ts`) runs
  `markReportedSessionDone` inside the attempts lock and only then returns the
  receipt the reporting command waits for, so a wait for idle there would
  wait for itself. Decision: quiet completion writes the pending local Done
  mark as today and hands the native Done to a continuation that starts once
  the receipt is sent and runs outside the attempts lock, guarded by
  `reportedNativeDonePending` on re-read and by the record write's own
  `expectedDoneAt`/`automatic` guards. Every host's reporting rename runs
  there, so the Codex rename moves from before the receipt to milliseconds
  after it, observably the same.
- **Problem wording is already one sentence per cause.** `HostOperationFailure`
  messages reach the card unchanged (`SessionEntry.tsx` shows `Intended
  name` with the problem). Decision: the Claude rename reports exactly one
  of: `The session is no longer running, so it was not renamed.`, `The
  session was still working when the wait ended.`, `The terminal attachment
  could not be opened.`, or today's `The native rename could not be
  confirmed.`; the pending text `Native done mark is pending.` stays as it
  is between the receipt and the continuation's write.
- **The fake Claude already attaches, renames, and lists status.**
  `dashboard/tests/fixtures/fake-claude` prints `attached <id>` at once,
  applies a typed `/rename` to its listing unless `renames-ignored`, records
  each attach's pid, lines, and ending signal, and `claudeSessionBecomes`
  (`dashboard/tests/support/fakeClaudeListing.ts`) switches a session between
  `working`, `working-idle`, `done-live`, and `done-exited`. Decision: the
  fake needs no change; `DOUGH_DONE_RENAME_WAIT_MS` keeps shortening the wait
  in tests.

Current decisions this plan fixes:

- **The wait.** One bounded wait per rename attempt covers waiting for idle
  and confirming the name through the listing: five seconds for manual Done
  (today's `defaultRenameWaitMs`), sixty seconds for the continuation after a
  receipt, because the sender still prints its final response; both read
  `DOUGH_DONE_RENAME_WAIT_MS` when set. Idle is polled each second, the name
  each 250 ms as today.
- **The seam.** `AgentTerminals` offers `withAttachment(session, folder, use)`:
  it runs `use(type)` against the newest client with an open socket, or
  otherwise opens a socketless client through the host's `attach` at the
  initial size, awaits its first settled screen, runs `use`, and hangs that
  client up when `use` settles. `LaunchHost.rename` receives this seam
  instead of the bare `type` function. Codex ignores it.
- **The continuation owner.** A small owner in `doneMarks.ts`, constructed by
  `agentLaunchPlugin.ts` with the terminals and launches, holds in-flight
  continuations by session and aborts their waits on `close()`; the
  attachment registry's own `close()` hangs up a private client mid-rename.
  An aborted or failed continuation leaves the record's pending or problem
  text for Mark as done to retry. No scheduler, timer store, or record field
  is added.

No North Star topic is needed: the host boundary and the attachment registry
already own these concerns. Accepted ADR 0008 keeps launch, terminal, and
done marks as local operational evidence that never settles a story; ADR
0002's high cohesion is why one Done operation and one attachment registry
serve both intents. No Accepted decision conflicts.

## Decisive premises and observations

Observations ran in this preparation workspace at trunk
`8cc56ef41112764952a2dea6dcec27cb79f1c2e2`. O1 was run by the developer from
this session's prompt; the rest are readings.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| A private `claude attach` from the project folder accepts a typed `/rename` on an idle session whose worktree is gone, the listing confirms it, and the session survives the attachment's SIGHUP. | Slices 1 and 3's approach. | O1 on the real Claude Code 2.1.292, session `3d97347c` (`done`/`idle`, cwd a removed worktree): `attached` screen after 4 s, `\u0015`, `/rename done-…`, `\r` 300 ms apart; `claude agents --json --all` listed the new name 0.4 s later; after SIGHUP the session was still listed `idle` with the new name, pid unchanged. Confirmed. |
| Today's quiet completion of a Claude session records the "requires terminal input" problem, and Mark as done without a terminal records "No terminal attachment". | Slices 1 and 3's remedy and regression set. | Reading `agent-completion-binding.spec.ts:155-159` (quiet case asserts the first text) and `agent-terminal-done-reopen.spec.ts:78-80`, `agent-launch-card-done.spec.ts:86`, `session-unread-report.spec.ts:239`, `agent-launch-done-question.spec.ts:154`, `agent-launch-done-codex-races.spec.ts:193` (each asserts the second); the local store holds 11 and 9 such records. Reproduced by existing specs. |
| The Claude rename types only into a client with an open socket; a kept socketless client exists only through `keep()`, which Claude's `attach` never declares. | Slice 1's seam. | Reading `terminalAttachments.ts` (`type` filters `hasOpenSocket()`; `keep` is called from launch handoff; `claudeHost.attach` returns `{ pty }` only). |
| A socketless `LiveTerminalClient` without `keep` is not hung up until `hangup()` or exit, and its screen settles through `KeptClientScreen.settled()`. | Slice 1's private client lifetime and typing moment. | Reading `liveTerminalClient.ts` (`socketDropped` hangs up only on a drop; `screenText()` awaits `idle.text()` → `screen.settled()`), `detachedIdleWatch.ts`, `keptClientScreen.ts:107`. |
| The listing's `status` is `idle` between turns and absent once the process exits; `state` alone does not say whether a turn runs. | Slice 2's idle rule. | `claude agents --json --all` on 2026-10-07 listed `3d97347c` as `state: done, status: idle` (turn ended, process running), `fc7572eb` as `working`/`idle`, and this session as `working`/`busy`; exited sessions list no `status`. The fake lists the same shapes (`fakeClaudeListing.ts:31-35`). |
| The receipt is returned to the reporting command only after `markReportedSessionDone` finishes inside the attempts lock, and the sender's turn continues until the command returns. | Slice 3's continuation. | Reading `completionDelivery.ts:26-103` (`withKeptAttempts(async … await markReportedSessionDone … return saved)`) and `doneMarks.ts:52-61`; `dashboard/AGENT-LAUNCH-COMPLETION.md:74` ("Reporting keeps its sender's attachments and work running"). |
| A late automatic record write is dropped when the mark changed meanwhile. | Slice 3's lock-free continuation. | Reading `launchRecordStore.ts:115-122` (`automatic && !doneAutomatically` → unchanged; `expectedDoneAt` mismatch → unchanged). |
| The missing-workspace journey already exists in a spec. | Slice 1's example 3 proof. | Reading `agent-launch-card-done.spec.ts:121` (`renameSync(folder, …moved)` before Mark as done). |
| The Codex quiet spec reads the stored problem synchronously right after the page shows Done. | Slice 3's Codex timing. | Reading `agent-completion-quiet.spec.ts:171-179`: `stored(...)[0]?.doneProblem` is asserted at 176 before the page assertion at 179; after the move to the continuation, the page assertion goes first. |
| The stop-failure spec's substitute `claude` delegates every non-stop command to the fixture, so its attach and listing work. | Slice 1's regression set. | Reading `agent-launch-done-codex-races.spec.ts:163-180`; after slice 1 its expected problem is the stop failure alone. |
| Dependencies are not installed in this workspace. | Every slice's first proof run. | `ls node_modules/.bin/playwright`: no such file. Execution runs `env -u NODE_ENV npm ci --ignore-scripts --offline` first; a dashboard-launched session inherits `NODE_ENV=production`, under which `npm ci` skips dev dependencies. |
| The workspace lints clean with the story changes. | Delivery gate. | `env -u NODE_ENV node scripts/lint.mjs`: "All matched files use Prettier code style!". |

Literal observation, run by the developer from this session's prompt:

```sh
# O1 — private attach rename probe; script kept at $CLAUDE_JOB_DIR/tmp/probe-rename.mjs during this session
node probe-rename.mjs 3d97347c "done-Open Dough · Refinement · Retain actionable diagnostics when a dashboard CI shard times out"
# [0.5s] before: … "status":"idle","state":"done"
# [5.1s] typed /rename
# [5.5s] confirmed: … "name":"done-Open Dough · Refinement · …"
# [7.5s] after detach: … "status":"idle" (pid 17444 unchanged)
```

## Proof ownership

| Promise (story) | Owning slice | Proof |
| --- | --- | --- |
| Mark as done renames without an open terminal (example 2) | 1 | `agent-terminal-done-reopen.spec.ts`: first Mark as done shows `Named done-…` with no problem; `claudeAttaches()` has one attach whose lines hold the `/rename`, ended by SIGHUP |
| Mark as done renames when the saved workspace is gone (example 3) | 1 | `agent-launch-card-done.spec.ts`: after the folder is moved, the entry shows `Named` and no rename problem |
| A visible terminal is typed into and left open | 1 | `agent-terminal-done-reopen.spec.ts` second mark (existing): `/rename` typed into the open attachment, no second attach |
| Unconfirmed rename names that cause; a later Mark as done retries (example 5) | 1 | existing `claudeRenamesIgnored(true)` journey keeps "could not be confirmed"; `claudeRenamesIgnored(false)` then Mark as done shows `Named` |
| No typing while a turn runs; still-working names that cause (example 6, manual) | 2 | spec: `claudeSessionBecomes(id, "working")`, short wait, Mark as done → `The session was still working when the wait ended.`, no attach ran, stop ran |
| Gone process names that cause (example 4) | 2 | spec: `claudeSessionBecomes(id, "done-exited")`, Mark as done → `The session is no longer running, so it was not renamed.`, no attach ran |
| Quiet completion stays pending while the turn runs, then renames (example 1) | 3 | `agent-completion-binding.spec.ts` quiet case: after the receipt the record holds `Native done mark is pending.`; `claudeSessionBecomes(id, "done-live")` → record `doneProblem` undefined, listing name `done-…`, one private attach |
| Quiet completion whose turn outlasts the wait keeps its local Done and names the cause (example 6, reporting) | 3 | same spec, listing left `working`, short wait → `The session was still working when the wait ended.`; Mark as done after `done-live` shows `Named` |
| Codex and Cursor done behavior unchanged | 3 | `agent-completion-quiet.spec.ts` and `agent-completion-cursor.spec.ts` green after the reorder noted above |
| Shutdown mid-wait leaves the pending text, no hung client | 3 | `agent-completion-binding.spec.ts` or a sibling: stop the server during the wait; store still holds the pending text; fake's attach (if opened) ended by SIGHUP |
| Docs describe the behavior | 1, 3 | `dashboard/AGENT-LAUNCH-TERMINALS.md` and `dashboard/AGENT-LAUNCH-COMPLETION.md` read as the slices below say |

Proof commands, from the workspace root:

```sh
env -u NODE_ENV npm ci --ignore-scripts --offline
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec>.spec.ts --workers=1
env -u NODE_ENV node scripts/lint.mjs
env -u NODE_ENV npm run typecheck:dashboard
```

## Ordered slices

### 1. Mark as done renames through a private attachment
Type: Behavior
Status: planned
Proof: `agent-terminal-done-reopen.spec.ts` and `agent-launch-card-done.spec.ts` as the table above says, plus `session-unread-report.spec.ts`, `agent-launch-done-question.spec.ts`, and `agent-launch-done-codex-races.spec.ts` updated to the renamed outcome and green.

Behavior: a recorded Claude session is still running and idle, with or
without its saved workspace → the developer marks it done from a card or
Recently done with no terminal open → the record shows `Named done-<name>`
with no problem, Claude Code lists that name, the session was stopped as
today, and the fake saw exactly one `claude attach` from the project folder
that typed `\u0015`, `/rename done-<name>`, `\r` and ended by SIGHUP. With a
terminal open, the `/rename` is typed into it and it stays open.

Includes: `AgentTerminals.withAttachment` over `TerminalAttachments` (open
socket client, else a socketless client through `host.attach`, first settled
screen, `use(type)`, hangup); `LaunchHost.rename` takes that seam;
`renameInClaudeCode` keeps the control-character check, the key pauses, and
the listing confirmation inside `use`, and reports `The terminal attachment
could not be opened.` when the attach throws or exits before its first
screen; `AGENT-LAUNCH-TERMINALS.md:97` says Claude renames through its own
attachment, or the open one.

### 2. The Claude rename waits for an idle session and names a gone or busy one
Type: Behavior
Status: planned
Proof: one spec (new or in `agent-launch-card-done.spec.ts`) with the two listing changes above and `DOUGH_DONE_RENAME_WAIT_MS` short; `claudeAttaches()` empty in both; `claudeStopCalls()` has one.

Behavior: the session's listing says `busy` → Mark as done → no attach is
opened; after the wait the record shows `The session was still working when
the wait ended.`, stop ran, and a later Mark as done once it is `idle` shows
`Named`. The listing has no `status` for it → Mark as done → `The session is
no longer running, so it was not renamed.`, no attach, no stop attempted when
the state is unavailable (as today).

Includes: `ListedSession.status`; the idle poll inside the one bounded wait;
the `renameWaitMs` split by intent (manual five seconds, reporting sixty).

### 3. Quiet completion renames after the receipt
Type: Behavior
Status: planned
Proof: `agent-completion-binding.spec.ts` quiet case extended as the table says, `agent-completion-quiet.spec.ts` reordered and green, `agent-completion-cursor.spec.ts` green, and the shutdown case.

Behavior: a Claude session reports `completed` with no attention →
the receipt returns at once with the local Done mark and `Native done mark is
pending.` → when the listing shows it `idle` within the wait, the dashboard
renames it through a private attachment and clears the problem; the card in
Recently done shows `Named done-<name>`. When the turn outlasts the wait, the
record says `The session was still working when the wait ended.` and Mark as
done retries. A delivery retry of an applied receipt schedules the same
continuation. Codex's quiet rename runs in the same continuation; its
outcomes are unchanged.

Includes: the continuation owner constructed in `agentLaunchPlugin.ts`, closed
with the terminals; `markReportedSessionDone` becomes the continuation's body,
run outside `withKeptAttempts`; the `renameWhileReporting` flag and the
"requires terminal input" guard removed; `AGENT-LAUNCH-COMPLETION.md:66-73`
and `AGENT-LAUNCH-TERMINALS.md:181-186` describe the pending mark, the one
bounded wait after the receipt, and that recovery beyond it is explicit
(Mark as done or delivery retry).

## Current decisions

- Each slice runs its named specs, lint, and the dashboard typecheck before
  its commit; the whole suite runs through CI after publication.
- Problem texts are the four sentences fixed above; none mentions a terminal
  the developer should open.
- Slice 2's idle poll and slice 3's wait never type into a `busy` or
  `waiting` session; `waiting` is treated as busy for the rename.

## Learnings

None yet.
