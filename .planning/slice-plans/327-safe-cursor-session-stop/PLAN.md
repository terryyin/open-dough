# Stop and acknowledge Cursor sessions safely

**Identity:** SEED-052#safe-cursor-session-stop
**Source:** [Stop and acknowledge Cursor sessions safely](../../seeds/SEED-052-start-agent-work-from-dashboard.md#safe-cursor-session-stop)

## Goal and scope

A developer stopping Cursor work can distinguish acknowledging its dashboard
record from interrupting execution, know whether execution actually stopped,
and continue without an unnoticed competing writer. Stop and Mark as done are
separate actions; an unconfirmed stop explains the remaining state, preserves
reopen/recovery, and blocks a replacement writer in the same workspace until
confirmation or an explicit override with the risk shown. Interrupted
delegated agents are recovered from the checkout, never from a promised
return. Local Done never claims native termination.

Included: a native probe of Cursor stop, Done naming, and interrupted Task
behavior; a runner-mediated Cursor stop with confirmed/unconfirmed results;
local acknowledgement independent of native stop, with native Done naming
only where the probe proves it supported; interrupted-delegation recovery
guidance for coordinators; native verification and the ODF-204/ODF-229
finding updates.

Excluded: stopping sessions the dashboard did not launch or hold; session-only
model scope (SEED-052#cursor-session-model-scope); richer result reading
beyond story 1; any stop or naming mechanism the probe shows Cursor does not
support — that limit is recorded, not simulated. Claude and Codex stop,
rename, and Mark as done behavior is unchanged.

## Current decisions and reuse

- Terry decided on 2026-10-20 during refinement: this one story keeps both
  the dashboard stop/acknowledge work and the interrupted-delegation
  recovery; Stop and Mark as done are separate actions; a replacement writer
  is blocked on an unconfirmed stop until confirmation or explicit override.
- PFE / existing solutions: Codex already verifies the active turn before
  `turn/interrupt` and renames natively; Claude supplies `claude stop` and a
  terminal rename; both reach the shared Done orchestration
  (`dashboard/server/doneMarks.ts`) through the optional `stop`/`rename`
  operations on the host boundary (`dashboard/server/launchHosts.ts`), and
  the UI learns availability from `hostOperations`, never from a host name.
  Reuse that whole pattern: add Cursor's operations at its own boundary,
  keep shared presentation and Done code host-neutral, and add no
  Cursor-specific branch to them. The Cursor runner already holds each
  session's PTY and exposes a hangup (SIGHUP) used by recovery and shutdown,
  and recovery already resumes or replaces a kept Cursor session — stop
  acts through that runner and is confirmed by re-observing it, rather than
  by a new process store or by the dashboard server's local attachments,
  which do not hold Cursor clients.
- Report-backed local acknowledgement already exists and is preserved:
  a Cursor session with a completion report can be marked done locally
  today. This story separates that acknowledgement from interruption
  instead of building a second Done path; the quiet-report automatic Done
  keeps its current deliberately quiet behavior.
- Delegated recovery reuses what execution guidance already owns:
  delegation forbids the delegated agent committing, pushing, or marking a
  slice done, and the coordinator owns proof acceptance from the checkout.
  The gap is only the interrupted-return path; add it there instead of new
  dashboard machinery, which cannot control an in-session Task anyway.
- Follow [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  deterministic dashboard tests do not prove native Cursor behavior; slices
  1 and 5 own native evidence. Guidance wording follows ADR 0006 (written
  for the executing agent in its project).
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  is Proposed, binds nothing, and is not contradicted; no Accepted ADR
  conflicts with this scope and no North Star topic is warranted — the
  change follows the existing host-boundary pattern rather than setting new
  direction.

## Outside-in proof ownership

| Source promise (seed key example) | Owner | Observable result |
| --- | --- | --- |
| 1. Stop a working Cursor session → confirmed stopped, record un-done, reopen resumes | 2 (deterministic), 5 (native) | Fake-Cursor journey shows stop, confirmed reading, and reopen; native run observes the real client ceasing work |
| 2. Stop unconfirmed → remaining state named, recovery preserved, replacement blocked until confirmation or explicit override | 2 | Journey shows the unconfirmed explanation, the block, and the override with its risk wording |
| 3. Mark as done → local acknowledgement only; supported native Done naming attempted separately, failure visible | 3 | Journey shows Recently done with local-only wording (or the proved native name), and no termination claim |
| 4. Locally done session later found still held/working → native state shown as it is, Stop still available | 3 | Journey shows the still-working reading on a done record with its own Stop action |
| 5. Interrupted delegated Task, no return → slice treated as incomplete; diff/plan/remote inspected and proof re-established before acceptance | 4 | Execute-plan guidance tests show the recovery contract; slice 1's reproduction supplies the native facts it rests on |
| 6. Interrupted agent later publishes (ODF-204 pattern) → detected before delivery, paused for the developer's decision | 4, 5 | Guidance tests show the pause; ODF-204 is updated with the actual response after delivery |
| 7. Claude and Codex unchanged | 2, 3 | Existing Claude/Codex done, stop, and rename specs stay green |

Proof boundaries: focused dashboard Playwright specs at the real
page/server boundary with the fake Cursor runner
(`dashboard/tests/support/fakeCursor.ts`) for deterministic slices, plus
`npm run typecheck:dashboard`; guidance slices use the existing
execute-plan guidance tests. Whole-suite dashboard runs stay CI's unless a
changed shared fixture makes focused selection unrepresentative.

## Decisive premises and preparation observations

Named checkout: this preparation worktree,
`/Users/terryyin/git/open-dough/.worktrees/stop-and-acknowledge-cursor-sessions-safely`,
base `bee3ee461426ba65d74d0cc4a2c178204eb025a6`, 2026-10-20.

Settled by tracing the consuming operations in this checkout:

- The Cursor boundary (`dashboard/server/cursorHost.ts`) supplies no
  `stop`, `rename`, or `readResult`. The shared Done flow
  (`doneMarks.ts`) requires a native stop for a manual mark, with one
  exception: a session that already submitted a completion report is
  acknowledged locally. The UI mirrors this — `marksDone` keys on the
  boundary's `stop` operation and `marksRecordDone` on a completion report
  (`dashboard/src/sessionCapabilities.ts`) — so an active unreported Cursor
  session offers no Mark as done today.
- Cursor clients live in the separate runner process. It already exposes
  `/hangup`, which ends attachments with SIGHUP to the held PTY, and
  recovery already hangs up, resumes, and replaces kept clients through
  that runner. The fake Cursor client exits on SIGHUP; that settles the
  dashboard protocol route, not native termination.
- Codex's stop reads native state and interrupts only a verified active
  turn; Claude's stop is a native command. Neither mechanism exists to copy
  for Cursor — the boundary shape is the reuse, not their transports.
- Locally, `cursor-agent --help` (2026.10.19) shows no stop or rename for
  the runner-kept `--resume` sessions the dashboard launches.
  `cursor-agent persist stop <session>` manages tmux-backed persisted
  sessions — tmux is not installed on this machine and the dashboard does
  not launch that mode — so it is not an established stop source and is not
  adopted on presence alone.
- Execution delegation guidance already forbids a delegated agent
  committing, pushing, or marking a slice done, and already makes the
  coordinator accept proof from inspecting the checkout; searching the
  execution guidance for interruption finds no interrupted-return recovery
  (no still-active check, no unexpected-remote-commit check, no re-proof
  requirement before a replacement writer).

Left to the early probe (slice 1), because only a paid native run reaches
them:

- Whether hanging up the runner-kept `cursor-agent` client — or another
  input the probe identifies as supported, such as the working screen's
  interrupt — actually stops an in-flight Cursor turn, including delegated
  subagents that turn spawned, and which post-stop observation (runner no
  longer holding the client, process state, screen) honestly confirms it.
- Whether any supported native naming can reflect Done for a Cursor
  session; if none can, slice 3 delivers the local-only naming with that
  limit recorded.
- What interrupting a native delegated Task call leaves running, in a
  bounded reproduction in an isolated checkout: whether the agent keeps
  editing, committing, or pushing after the interrupt or after a later
  continuation, and what settles that it has stopped.

## Ordered slices

### 1. Probe native Cursor stop, Done naming, and interrupted delegation
Type: Behavior
Status: done
Proof: A bounded paid native run of a dashboard-launched Cursor session
doing real work (including, where the session supports it, a delegated
subagent), stopped through each candidate the preparation identified,
with post-stop held/process/screen observation and a watch for later
edits or commits from the stopped work; a naming attempt by each avenue
the probe identifies; and a bounded interrupted-Task reproduction in an
isolated checkout. Results recorded in this plan's learnings; any
capability no candidate proves is named explicitly.

Behavior: Given a working native Cursor session, when it is stopped, the
maintainer observes whether its work — including delegated work —
actually ceases and what confirms that; whether its native name can
reflect Done; and what an interrupted delegated Task leaves active.
Failure of a premise here stops the dependent part of slices 2–3 and
replans it (for example to an honest unconfirmed-only stop); it does not
block the acknowledgement separation in slice 3 or the guidance in
slice 4, whose cautious path assumes interruption may not stop the agent.

#### Learnings (2026-10-20, read-only re-verification; no paid native run)

A paid dashboard-launched native Cursor run was **not** performed in
this execution, and no bounded interrupted-Task reproduction was run.
The findings below rest only on the read-only evidence named in each
item; anything that evidence cannot settle is recorded as an explicit
limit, not as a result.

- **Candidate stop (dashboard protocol only).** The candidate stop is
  the Cursor runner's hangup: `hangupCursorClient`
  (`dashboard/server/hosts/cursor/runnerClient.ts`) posts to the
  runner's `/hangup` (`dashboard/server/hosts/cursor/runnerMain.ts`),
  whose `answerHangup` (`dashboard/server/hosts/cursor/runnerKeep.ts`)
  ends attachments, and the held PTY receives SIGHUP
  (`dashboard/server/liveTerminalClient.ts`). Confirmation must be
  re-observation of the runner no longer holding the client; sending
  the hangup request alone confirms nothing. The fake Cursor client
  (`dashboard/tests/support/fakeCursor.ts`) exits on SIGHUP, which
  proves the dashboard protocol route only. **Explicit limit:** whether
  SIGHUP to the held PTY terminates a native in-flight Cursor turn, or
  any delegated subagents that turn spawned, is **UNPROVEN**; it
  remains pending slice 5's native verification and must not be
  claimed before then.
- **No supported native Done naming found.** Locally,
  `cursor-agent --help` (2026.10.19-6bbf2c4) shows `--resume` but no
  stop or rename for the runner-kept resume sessions the dashboard
  launches. `cursor-agent persist stop <session>` manages tmux-backed
  persisted sessions; `which tmux` finds no tmux on this machine and
  the dashboard does not launch that mode, so it is not a naming (or
  stop) source for these sessions. **Consequence:** slice 3 delivers
  dashboard-local naming only; no native Done name is claimed.
- **Interrupted delegated Task — cautious assumption, cited not
  reproduced.** Slice 4's assumption that interruption may not stop
  the agent rests on
  [ODF-204](../../../docs/maintainer/findings/ODF-204.md) and
  [ODF-229](../../../docs/maintainer/findings/ODF-229.md), not on a new
  reproduction. ODF-204 records one interrupted delegated refactor
  that went on to commit and push its slice and mark it done despite a
  no-commit delegation, while a second writer was active in the same
  checkout; its inference is qualified — whether the interrupt failed
  to stop it or a later "continue" reached it as its own instruction
  is unknown. ODF-229 records one interrupted implementation Task that
  left edits in the checkout with no agent return, so the coordinator
  inspected the diff and re-ran proof from the checkout; it did not
  commit or push. **Explicit limit:** neither file establishes that an
  interrupt generally fails to stop a native Task, and no new
  reproduction settles that here; the cautious assumption is a safety
  posture from these two occurrences, pending any later native
  evidence.

### 2. Stop a held Cursor session and report confirmed or unconfirmed
Type: Behavior
Status: planned
Proof: Fake-Cursor Playwright journeys show Stop on an active Cursor
session ending the held client through the runner and reading as stopped
once re-observation confirms it, with the record un-done and reopen
resuming the saved conversation; a stop the runner cannot confirm (still
held/working, runner unreachable) shows the unconfirmed explanation with
the remaining state named, preserves reopen/recovery, blocks starting a
replacement session for that workspace, and admits one only after
confirmation or an explicit override carrying the competing-writer risk.
Existing Claude/Codex stop and done specs stay green.

Behavior: Pre-condition → trigger → result per seed key examples 1 and 2:
the Cursor boundary gains a stop operation that acts through the runner
on the held client, and confirmation comes from re-observing the runner
afterwards, never from the request having been sent. Stop does not write
the local done mark, complete the story, or delete the saved conversation
or workspace; reopen and recovery keep working for a stopped session,
independently of acknowledgement.

### 3. Acknowledge a Cursor session without claiming termination
Type: Behavior
Status: planned
Proof: Session journeys show Mark as done on an acknowledgeable Cursor
session moving the record to Recently done with wording that claims only
the local acknowledgement; where slice 1 proved a supported native Done
name, that naming is attempted separately and its failure is visible on
the record, and where it proved none, the session states Done is a
dashboard-local name only. A locally done session later observed still
held/working shows that native state as it is, with Stop still offered on
its own terms. The report-backed and quiet-report acknowledgement paths
behave as today, and Claude/Codex journeys stay green.

Behavior: Per seed key examples 3 and 4: Mark as done for Cursor is the
local acknowledgement, offered and worded independently of Stop; the
shared UI and Done orchestration learn this from the host boundary's
facts, not a Cursor name check, and no surface rewrites a local mark into
a termination claim.

### 4. Recover an interrupted delegated agent before any replacement writer
Type: Behavior
Status: planned
Proof: Execute-plan guidance tests show the delegation/wrap-up guidance
requiring, on an interrupted call with no return: treat the slice as
incomplete; inspect the checkout's diff and plan and the remote branch
for the interrupted agent's commits before any replacement writer,
formatter, or delivery proceeds; re-run the focused proof from the
checkout before accepting partial edits; and pause for the developer's
decision on any unexpected commit, without marking the slice done on the
interrupted agent's claim. Slice 1's recorded reproduction (or its
explicit limit) is cited by the guidance's premise, not assumed.

Behavior: Per seed key examples 5 and 6: a coordinator who interrupts a
delegated implementation or refactor Task and receives no return recovers
outcome and acceptance from the checkout itself. This is guidance for the
executing agent in its project (ADR 0006); it adds no dashboard machinery
and does not claim a dashboard stop controls an in-session Task.

### 5. Verify the Cursor journey natively and settle ODF-204 and ODF-229
Type: Behavior
Status: planned
Proof: A native Cursor run through the dashboard — launch, work, Stop
with confirmed result, reopen; an unconfirmed stop with its explanation,
block, and override; Mark as done as local acknowledgement with the
naming behavior slice 1 proved — each observed on the real dashboard;
the delegated-interruption recovery exercised or its precise remaining
gap recorded. ODF-204 and ODF-229 are updated with this evidence (or
gap) after delivery without rewriting their pre-fix occurrences.

Behavior: Given the delivered dashboard and guidance on a real machine,
when the journeys above run in native Cursor, the developer-visible
stop, acknowledgement, and recovery behavior matches the seed's key
examples, and deterministic-test evidence is not substituted for this
native proof (ADR 0005). Missing native proof stays pending and named;
it is not marked passed by this slice's deterministic companions.

## Current decisions

- Stop acts through the Cursor runner on the held client and is confirmed
  by re-observation; the request alone never reads as stopped.
- Stop and Mark as done stay separate: Stop never writes the done mark,
  and Mark as done never claims native termination. Native Done naming is
  delivered only where slice 1 proves a supported mechanism.
- An unconfirmed stop retains its explanation on the session, preserves
  reopen/recovery, and blocks a replacement writer in that workspace
  until confirmation or an explicit override that shows the risk.
- Interrupted-delegation recovery lives in execution guidance and assumes
  interruption may not stop the agent; it relies on checkout and remote
  inspection plus re-established proof, never on a promised return.
- Slices 3 and 4 are independent of the probe's stop result and may
  proceed if native evidence is delayed; slice 2 consumes slice 1's
  recorded learnings, and slice 3 consumes only its naming result.
