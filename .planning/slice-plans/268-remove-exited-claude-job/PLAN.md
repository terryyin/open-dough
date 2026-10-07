# Mark as done removes an exited Claude Code session's job

**Identity:** SEED-117#remove-exited-claude-job
**Source:** [refined story](../../seeds/SEED-117-finished-sessions-leave-no-blocked-job.md#remove-exited-claude-job).
**Prepared:** 2026-10-07. Planning only, in the story's preparation workspace
on `claude/mark-as-done-removes-an-exited-claude-code-sessi`.

## Goal and boundaries

Mark as done on a Claude Code session whose process has exited removes that
session's job from Claude Code with `claude rm <short id>`, keeps the local
Done mark and the record's completion message, and shows a problem only when
the removal truly failed. A running session keeps today's stop and the rename
SEED-116 delivers; a session Claude Code no longer lists is only marked, and
one whose listing cannot be read still gets today's stop attempt.

Include the story's required behaviors, its five rejection constraints (never
`rm` on a running or unreadable session, the short id alone with no
worktree-discarding flag, removal only on the developer's Mark as done, no
writes to Claude Code's files, Codex and Cursor unchanged), and its six key
examples.

Excluded, as the story defers them: removing a blocked job automatically when
its workspace disappears, and any change to Delete record. Considered and
excluded here: making the fake `claude`'s `stop` refuse an exited session the
way the real one does; no spec marks an exited session done through `stop`
after this plan, so the fixture change would prove nothing.

## Base this plan is written against

Trunk at `2b982f95ee360fb6d9a5b46ba2e65ce935e198fc`, the revision the
continued preparation fetched. SEED-116's plan 267 is queued, not taken; it
changes the same `finishNativeDone`. Whichever lands second rebases: once both
are in, the exited branch below runs instead of plan 267's "no longer running"
rename problem and its stop, and plan 267's slice 2 gone-process case becomes
the removal.

## Existing solutions and current decisions

PFE over the dashboard server and its test support found the owners this plan
reuses; one host operation is added at an existing boundary.

- **One Done operation already branches on the listing.** `finishNativeDone`
  (`dashboard/server/doneMarks.ts`) attempts the host's `rename`, then for
  manual intent ends attachments, reads `launches.stateOf`, and attempts
  `stop` unless the state is `unavailable`; `attempt()` folds each failure
  into one `Local done mark retained. <Host> <operation> failed: <cause>`
  text, showing a `HostOperationFailure` message and hiding anything else
  behind `The native operation could not be confirmed.`. Decision: the manual
  path reads the state first; when it is `available` with
  `availability: "retained"` and the host offers `remove`, the operation
  attempts `removal` and neither rename nor stop; otherwise today's order
  (rename, end attachments, stop) is unchanged. Reporting intent gains no
  branch.
- **The host boundary already carries `stop` as an optional operation.**
  `LaunchHost` (`dashboard/server/launchHosts.ts`) declares
  `stop?(session, folder, signal)`; `claudeHost` (`dashboard/server/claudeHost.ts`)
  binds it to `stopClaude` through `nativeAlias`. Decision: add
  `remove?(session, folder, signal)` with the same shape, bound for Claude to
  `removeClaude` in `dashboard/server/hosts/claude/runtime.ts`, which runs
  `execClaude(["rm", shortId])` under the stop's ten-second signal. Codex and
  Cursor leave it undefined. `hostOperations()` does not advertise it: the
  page already offers Mark as done through `stop`.
- **The exited reading already exists.** `parsedListing` keeps
  `availability: "retained"` exactly when a listed entry has no `status`
  (`runtime.ts:184-187`); a session missing from a readable listing is
  `unavailable`; an unreadable listing is `unknown`. Decision: the branch
  reads that shared field; no new state, record field, or host query.
- **Failure wording follows today's one sentence per cause.** Decision:
  `removeClaude` throws `HostOperationFailure` with exactly one of
  `Claude Code is not installed where this dashboard runs.` (`ENOENT`),
  `Claude Code did not answer within 10 seconds.` (signal aborted), or
  `Claude Code refused to remove the session.` (any other error); its stderr
  stays private, as the stop's does. The card then reads
  `Local done mark retained. Claude Code removal failed: <sentence>`.
- **The fake `claude` dispatches by first argument.**
  `dashboard/tests/fixtures/fake-claude` handles `stop`, `agents`, and
  `attach`; any other first argument is a launch. Decision: add an `rm`
  branch that drops the session from `agents.json` (error and exit 1 when it
  is not listed, or when `removal-fails` exists in the state directory), and
  add `claudeRemovalCalls()` and `claudeRemovalFails(fails)` to
  `dashboard/tests/support/fakeClaude.ts` beside `claudeStopCalls()` and
  `claudeListingFails()`.
- **The listing-decided spec is the proof entry point.**
  `dashboard/tests/agent-launch-done-stop.spec.ts` already marks sessions
  done over raw HTTP while the fake's listing decides stop or no stop.
  Decision: the new cases live there; the page already shows a done record's
  problem and keeps Mark as done offered while a problem remains
  (`SessionEntry.tsx:117-129`), so no page spec is needed for the retry.
- **Documentation homes exist.** `dashboard/AGENT-LAUNCH-TERMINALS.md:92-98`
  (Mark as done) and `:124-126` (bounded diagnostic) describe stop and
  rename. Decision: both name the removal; `AGENT-LAUNCH-COMPLETION.md` needs
  no change.

No North Star topic is needed: the host boundary and the Done operation
already own these concerns. ADR 0008 keeps launch, terminal, and done marks
as local operational evidence that never settles a story; ADR 0002's high
cohesion is why the one Done operation gains a branch rather than a second
operation. No Accepted decision conflicts.

## Decisive premises and observations

Observations are readings in this workspace at the base above, plus one
read-only host query, unless noted.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| `claude rm <id>` removes an exited job's record and works where `stop` does not. | Slice 1's approach. | `claude rm --help` on Claude Code 2.1.292 (2026-10-07): "Delete a background session and its worktree. Unlike `stop`, works on already-exited sessions." The developer ran it by hand the same day on an exited job whose worktree was retired (seed, "Why This Matters"). Not rerun here: it is state-changing on a real job. |
| A dashboard-launched job owns no worktree, so plain `claude rm` leaves the story worktree alone. | Slice 1's example 5. | `startClaudeInBackground` passes `--bg --name … [--model] [instruction]` and never `--worktree` (`runtime.ts:56-79`). Of 855 job state files under `~/.claude/jobs/`, 2 carry `worktreePath`/`worktreeBranch`; `003d7663`, launched in a `.worktrees/` checkout, carries neither. |
| Today's manual Done on an exited Claude session attempts rename and stop. | Slice 1's remedy. | Reading `doneMarks.ts:84-110`: rename first, then `stateOf`, then stop for every state but `unavailable`; a listed entry without `status` is `available`/`retained` (`runtime.ts:184-187`). `agent-launch-done-codex-races.spec.ts:193` asserts the two-problem text that path produces when stop fails. |
| The fake `claude` treats `rm` as a launch. | Slice 1's fixture change. | Reading `fake-claude:86-112` (`stop`, `agents`, `attach`) and `:176-245` (every other first argument runs the launch scenario). |
| Only Claude would define `remove`; `availability: "retained"` for Codex and Cursor never reaches it. | Codex and Cursor unchanged. | Reading `claudeHost.ts`, `codexHost.ts`, `cursorHost.ts` bindings in `launchHosts.ts:128-132`; the branch requires `host.remove !== undefined`. |
| Reading the state before the rename changes no running-session outcome. | Slice 1's reorder. | `stateOf` runs the listing only (`agentLaunches.ts:112-119`); the rename reads its own listing confirmation. Consumers of the order: `agent-launch-done.spec.ts`, `agent-launch-done-stop.spec.ts`, `agent-launch-done-codex-races.spec.ts:193`, `agent-launch-card-done.spec.ts`, `agent-terminal-done*.spec.ts`; all assert outcomes, none the order. |
| The MarkDone control stays offered on a done record with a problem, and a repeated Done reruns `finishNativeDone`. | Slice 2's retry, example 4. | Reading `SessionEntry.tsx:127-129` and `doneMarks.ts:129-159` (`markSessionDone` writes a new `doneAt` and calls `finishNativeDone` again). |
| A terminal request for a session the listing no longer includes is refused with the host's wording. | Example 1's after-removal state. | Reading `terminalAdmission.ts:36-43` and `hostDescription.ts:47`: "Claude Code no longer lists this session."; `agent-terminal-boundary.spec.ts:190-200` asserts the 410. |
| No spec marks an exited session done through the fake's `stop`. | The excluded fixture change. | `grep done-exited dashboard/tests`: only `agent-launch-card-session-states.spec.ts:108`, a display case. |
| Dependencies are not installed in this workspace. | Every slice's first proof run. | `ls node_modules/.bin/playwright`: no such file; `NODE_ENV=production` in this session. Execution runs `env -u NODE_ENV npm ci --ignore-scripts --offline` first, as plan 267 recorded. |

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Exited session: `claude rm <short id>` from the project folder, no rename, no stop, listing no longer includes it, no problem (examples 1, 5) | 1 | `agent-launch-done-stop.spec.ts`: `claudeSessionBecomes(id, "done-exited")`, `markDone` → 200, record `doneAt` set, no `doneProblem`, `sessionState: { kind: "unavailable" }`; `claudeRemovalCalls()` is exactly `[{ argv: ["rm", shortId], cwd: openDoughFolder }]`; `claudeStopCalls()` and `claudeAttaches()` unchanged; `claudeListing()` lacks the id; the launch's project folder still exists |
| Running session: stop as today (example 2) | 1 | Existing `agent-launch-done.spec.ts` and the stop spec's third case green, `claudeRemovalCalls()` empty there |
| Unlisted and unreadable listing unchanged (example 6) | 1 | The stop spec's first two cases green with `claudeRemovalCalls()` asserted empty |
| Automatic Done after quiet completion unchanged | 1 | `agent-completion-binding.spec.ts` and `agent-completion-quiet.spec.ts` green |
| Docs describe the removal | 1 | `AGENT-LAUNCH-TERMINALS.md` Mark as done and diagnostic paragraphs read |
| Failed removal keeps Done with its cause; later Mark as done retries (example 3) | 2 | Stop spec: `claudeRemovalFails(true)`, `markDone` → `doneProblem` is `Local done mark retained. Claude Code removal failed: Claude Code refused to remove the session.`, response body lacks the fake's stderr; `claudeRemovalFails(false)`, `markDone` again → no `doneProblem`, listing lacks the id |
| An old stop-failure problem is cleared (example 4) | 2 | Same spec: a record stored with `doneAt` and today's `Claude Code stop failed` text, session `done-exited`, `markDone` → no `doneProblem`, one removal call |
| Missing `claude` and timeout sentences | 2 | Focused: `removeClaude` mapping read in review; the timeout shares the stop's signal, the `ENOENT` sentence the launch's detection (`launch.ts:103`). No spec waits ten seconds for it. Interim until slice 2: the generic sentence from slice 1. |

## Ordered slices

### 1. Mark as done removes an exited Claude Code session's job
Type: Behavior
Status: done
Accepted proof: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts agent-launch-done-stop.spec.ts`
(4 pass; "removes an exited session's job with claude rm, neither renaming nor
stopping it" observes the `rm` call, no stop, no problem, listing without the
id); after refactor, 82 spec files (every Mark as done, attach, terminal, and
`*done*` consumer) 259 pass; typecheck and lint clean.
Proof: `agent-launch-done-stop.spec.ts` extended with the exited case and removal assertions on its existing cases; `agent-launch-done.spec.ts`, `agent-launch-card-done.spec.ts`, `agent-terminal-done*.spec.ts`, `agent-launch-done-codex-races.spec.ts`, `agent-completion-binding.spec.ts`, `agent-completion-quiet.spec.ts` green; lint and `npm run typecheck:dashboard`.

Behavior: a recorded Claude session is listed without `status` (its process
exited), with or without its saved workspace → the developer marks it done
→ the fake saw `claude rm <short id>` from the project folder and nothing
else for that session, its listing no longer includes the session, the record
reads Done with its completion message and no problem, and Open terminal is
gone because the listing no longer includes it. A running, unlisted, or
unreadably listed session is handled exactly as today.

Includes: `LaunchHost.remove?`; `removeClaude` running `claude rm` under the
stop's signal and throwing a plain error on any failure, so a failure reads
today's generic `The native operation could not be confirmed.` until slice 2
replaces it; the manual-intent branch in `finishNativeDone` with the state
read moved before the rename; the fake's `rm` branch and
`claudeRemovalCalls()`; `AGENT-LAUNCH-TERMINALS.md` Mark as done and
diagnostic wording.

### 2. A failed removal keeps Done with its cause and a later Mark as done retries it
Type: Behavior
Status: done
Accepted proof: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts --reporter=list agent-launch-done-stop.spec.ts`
(6 pass; "keeps Done with the removal's cause when claude rm fails, and a later
Mark as done retries it" and "clears a stored stop failure by removing the
exited session's job"); after refactor, 119 consumer spec files 444 pass;
typecheck and lint clean. Missing-`claude` and timeout sentences reviewed by
reading `removeClaude`.
Proof: the two spec cases in the table above, in `agent-launch-done-stop.spec.ts`; the same consumer specs green.

Behavior: the fake refuses `rm` → Mark as done → the record keeps Done and
reads `Local done mark retained. Claude Code removal failed: Claude Code
refused to remove the session.` with no subprocess text; the fake accepts
again → Mark as done on that record → no problem, one more removal, listing
lacks the id. A record stored done yesterday with today's stop-failure text
and an exited session → Mark as done → the same clean outcome.

Includes: `removeClaude` mapping its failure to the three `HostOperationFailure`
sentences fixed above, replacing slice 1's generic text; the fake's
`removal-fails` flag and `claudeRemovalFails()`; the stored-record setup
reuses the store helpers the done specs already use.

## Current decisions

- Each slice runs its named specs, lint, and the dashboard typecheck before
  its commit; the whole suite runs through CI after publication.
- `claude rm` runs with the short id alone; the branch never adds
  `--discard-unpushed` or `--force-remove-worktree`.
- The removal replaces rename and stop only for manual intent on a listed
  session without `status`; `unknown` keeps the stop attempt, `unavailable`
  keeps marking only.

## Learnings

- Removal ends dashboard attachments before `claude rm`, as the story's
  required behavior says; `finishNativeDone` picks `removal` from the state
  and skips rename when it is set.
- The fake `claude`'s attach emulation now lives in
  `dashboard/tests/fixtures/fake-claude-attach.cjs` (keeping the fake under
  250 lines); `.cjs` fixtures are linted, extensionless ones are not.
- Claude Code's listing parse moved to `dashboard/server/hosts/claude/listing.ts`
  to keep `runtime.ts` under 250 lines; `stopClaude` keeps its generic failure
  wording, so stop and removal were not unified.
