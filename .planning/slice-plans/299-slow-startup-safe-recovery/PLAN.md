# Slow startup continues automatically and unsafe outcomes stop safely

**Identity:** SEED-130#slow-startup-safe-recovery
**Source:** [story](../../seeds/SEED-130-slow-startup-safe-recovery.md#slow-startup-safe-recovery).
Planning only; this plan grants no Take, execution, or publication.

## Goal and boundaries

A developer who starts execution or refinement from the dashboard sees a slow
start warn and then launch its session on its own, while an actual
interruption or failure stops only the actions that cannot safely proceed and
says what is known. Elapsed time changes urgency; verified facts decide
whether startup proceeds.

Included: the start wait as a warning threshold instead of a settlement; the
page's slow-start warning and its continued following of a running attempt;
the attempt's worker as a machine fact so a page on any dashboard server
shows a live start as running and offers no Continue for it; the publication
receipt as a required checkpoint before the native launch, with a retryable
stop when it cannot be kept; Continue settling from the attempt's own launch
record; and the launch documentation for all of these.

Excluded (the story's deferred promises): automatic continuation of an
interrupted attempt after a server restart; cancelling a running start from
the dashboard; the installed scripts' own retry limits; a new vocabulary for
the existing recovery states; workers on another machine.

Assumptions: the threshold stays `DOUGH_START_TIMEOUT_MS`, default two
minutes; the installed scripts' publication retries, suffix reconciliation,
lost-response verification, `existing` and `continue` answers, and the
thirty-second native launch deadline are unchanged and keep their tests; the
start store's write failure after a script ran stays swallowed (the kept
write-ahead start resumes through `existing`), because only the attempt's
publication receipt is what later recovery reads before any repeated effect;
the `timed-out` uncertainty reason remains for the native launch wait and ad
hoc starts, which this plan does not touch.

## Architecture

The seed's Architecture section is followed. The North Star topic
[A start establishes claim and workspace before the session](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session)
governs starts; this plan revises its *Start progress* row and *Ownership*
rule narrowly (worker as a machine fact, liveness observed), with the
2026-10-11 slow-start incident as the evidence. Both retire at wrap-up once
`dashboard/LAUNCH-START.md` and `dashboard/AGENT-LAUNCH.md` carry the rules.

- **One attempt model, one more fact.** `LaunchAttemptRecord`
  (`dashboard/src/launchOutcome.ts`) gains an optional `worker`: the process
  id performing the current step (`start` while the installed script runs,
  `launch` while this server starts the native session) and when it was
  noted; and an optional `slowSince`, noted by the running server when the
  threshold passes. Both are written through the existing `note` path in
  `launchAttemptSettlement.ts` and cleared with the outcome. No new store,
  registry, or daemon.
- **Running is derived, owned is a right.** `AttemptObservation` gains
  `running`, computed by the answering server: owned and unsettled here, or
  unsettled with a worker that is alive (`process.kill(pid, 0)`; `EPERM`
  counts as alive). `needsReconciliation` and `unresolvedAttempt`
  (`launchAttemptSelection.ts`) read `running` where they read `owned`
  today; `notContinued` and `conflicting` refuse while running. `owned`
  stays the server's right to run and change the attempt.
- **The page derives the warning.** `storyStartup.ts` keeps `progressing`
  for a running attempt and adds the warning from `slowSince` and
  `acceptedAt`; a non-owning server's page reads the phase from the
  attempt's worker step instead of its own `runningStarts`. The Startup
  announcements log announces the slow start once.
- **Checkpoint before effect.** `attemptRun` (`launchRun.ts`) already notes
  the publication receipt before the native launch; a failed note of a
  `published` receipt now stops with a `failed`/`unrecorded` answer that
  names the publication and the file instead of launching on an in-memory
  answer the store contradicts. Other notes keep their memory-answered
  conservatism.
- **Continue reuses verification's own-record rule.** The own-record check
  in `launchVerification.ts` moves to a shared function both Recheck and
  Continue call; Continue settles from it before rerunning a kept request.

## Outside-in proof

| Promise | Slice | Observable proof |
| --- | --- | --- |
| A start past the threshold stays running, refuses duplicates, and launches once when its script finishes (examples 1, 2) | 1 | `agent-launch-start-resume.spec.ts`, `agent-launch-uncertain-continuation.spec.ts`, `agent-launch-preparation-resume.spec.ts` rewritten: attempt unsettled and `running`, `slowSince` noted, second start `already-starting`, Continue refused as still running, release then one `launched`, kept start removed; a late refusal settles as a refusal |
| The card warns after the threshold and shows the session with no action (example 1, UI) | 2 | `responsive-session-recovery.spec.ts` "a start whose wait expires" rewritten: progressing status with the warning sentence, no Startup recovery entry, one announcement, reload keeps it, release then the session on the card |
| Any server shows a live start as running and offers no Continue; a dead worker is interrupted (examples 3, 4) | 3 | new `agent-launch-second-server.spec.ts`: two servers on one machine store; the non-owning server's observation is `running` with the worker, its accept answers `already-starting`, its continue is refused as running; after release both show `launched`. Dead worker: the existing lost-server case in `agent-launch-start-resume.spec.ts` stays green (`interrupted`, Continue resumes); focused unit proof of liveness and of noting and clearing the worker |
| An unkept publication receipt stops before the native launch and Continue resumes it with one claim (example 5) | 4 | `agent-launch-preparation-store-failure.spec.ts` rewritten at the HTTP boundary: read-only dashboard directory after publication answers `failed`/`unrecorded` naming "Publication succeeded" and the file, zero native launch calls, one profile on origin; after repair, Continue answers `launched` with the same profile |
| Continue of an attempt whose own launch record exists settles as launched and starts nothing (example 6) | 5 | `agent-launch-uncertain-continuation.spec.ts` new case: a hand-written unsettled attempt beside a launch record of its story launched after acceptance; Continue settles `launched` with zero start and launch calls |
| Refresh failure and display lag stay warnings (example 7) | preserved | existing publication-checkout maintenance and reconciliation specs stay green; no slice changes them |
| Documentation describes the threshold, worker, and recording boundary | 1, 3, 4 | `dashboard/LAUNCH-START.md` and `dashboard/AGENT-LAUNCH.md` updated in the slice that changes each rule |

Local proof runs the named spec through
`npx playwright test --config dashboard/playwright.config.ts dashboard/tests/<spec>`
with `/opt/homebrew/bin` first on `PATH`, and `npm run typecheck:dashboard`;
CI's lint, unit, and browser jobs run after publication. The browser suite
is run whole only when a slice changes shared launch fixtures.

## Slices

### 1. The start wait warns instead of settling
Type: Behavior
Status: done
Proof: the three rewritten start specs above; `npm run typecheck:dashboard`

Accepted: held execution/refinement starts note and clear `slowSince`, refuse duplicate Starts and Continue, and launch the original request once after release; late refusal settles normally. The ten-spec command below and typecheck passed; refactor's full start-resume rerun passed after moving its sole-consumer lost-server fixture to `keptExecutionStart.ts`. Native deadline, interrupted continuation and pending-input consumers remain green.
Command: `env -u NO_COLOR PATH=/opt/homebrew/bin:$PATH npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-start-resume.spec.ts dashboard/tests/agent-launch-uncertain-continuation.spec.ts dashboard/tests/agent-launch-preparation-resume.spec.ts dashboard/tests/agent-launch-preparation-store-failure.spec.ts dashboard/tests/responsive-session-recovery.spec.ts dashboard/tests/agent-launch-boundary.spec.ts dashboard/tests/agent-launch-acceptance.spec.ts dashboard/tests/agent-launch-start-duplicate.spec.ts dashboard/tests/agent-launch-duplicate.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts`.
Diagnosed proof corrections: wrong fixture title/slug, hook-entry observation race, conflicting NO_COLOR/FORCE_COLOR, and duplicate check including its continued self. Corrected full selection passed; no retry substituted for diagnosis. Warning display and cross-server liveness remain G1/G2.

Behavior: a story start whose installed script is still running at the
threshold → the threshold passes → the attempt stays unsettled and owned with
`slowSince` noted; a second start of the story answers `already-starting`
and Continue answers still running; when the script answers, the attempt
proceeds exactly as an in-time answer: a refusal settles as that refusal; an
established start notes its receipt, launches one native session, keeps the
launch record, and removes the kept start. `started()` in `launchStart.ts`
no longer races the script against the expiry; the timer only notes
`slowSince`. The `uncertain`/`timed-out` words for an expired start wait and
`StartWorkflow.uncertain` leave with their tests. `LAUNCH-START.md`'s
bounded-wait paragraph describes the threshold. Interim, until slice 3: a
page on another server still reads a running attempt as interrupted, as it
does today; the owning server refuses its continuation as running.

### 2. The card warns about a slow start and keeps following it
Type: Behavior
Status: done
Proof: `responsive-session-recovery.spec.ts` rewritten case; typecheck and the full browser suite passed (terminal exit 0). Its real held push and actual `slowSince` produce the exact two-minute warning, phase, indicator and one announcement across another machine read; reload preserves protection, and release launches one session/claim/workspace. Browser Date supplies only the elapsed display. Focused recovery/access/start-phases/start-codex/start-taken/session-kept-start/codex-model-boundary specs also passed.

Behavior: a progressing story card → its attempt carries `slowSince` → the
status keeps the phase sentence and the moving indicator and adds "Still
starting after N minutes. The start goes on in workspace `<path>` on branch
`<branch>`; its session starts when it finishes."; Startup recovery lists
nothing for it; the announcements log says it once; a reload shows the same;
when the session launches the card shows it. The kept-start projection includes
running starts and their existing branch so the page can read their context.
Execution corrected the planning premise: `launchCatalog.keptStarts` currently
filters running starts, and `support/startProgressPage.ts` asserts that exclusion.
Remove it while keeping running phase and kept workspace as distinct facts;
run the whole browser suite because this changes shared launch fixtures.

### 3. A live worker keeps an attempt running on every server
Type: Behavior
Status: planned
Proof: new `agent-launch-second-server.spec.ts`; existing lost-server case; focused liveness unit proof

Behavior: an attempt one server runs → a page on another server, a reload,
or a restarted server reads it → it is `running` with the worker's step as
its phase and the same warning past the threshold; that server's accept
answers `already-starting` and its continue is refused as still running;
when the owning server settles it, every server shows the outcome. An
unsettled attempt whose worker is dead → it is interrupted, with Recheck and
Continue as today. The worker is noted when the script is spawned (its pid)
and when the native launch begins (this server's pid), and cleared with the
outcome; `runningStarts` stays this server's phases for its own starts.
`AGENT-LAUNCH.md`'s startup handoff describes running, worker, and
interrupted. A server killed before noting `slowSince` may leave its child alive;
an answering server derives the past-threshold warning from the recorded
attempt's acceptance time using the existing threshold. Prove this orphan case by
killing only the owned server pid, keeping its held installed script alive,
then observing running/protected/warning before release and interrupted after
the child exits; Continue safely reuses the kept claim. No automatic resume.

### 4. An unkept publication receipt stops before the native launch
Type: Behavior
Status: planned
Proof: `agent-launch-preparation-store-failure.spec.ts` rewritten at the HTTP boundary

Behavior: an established start whose `published` receipt cannot be kept in
`launch-attempts.json` → `attemptRun` stops with `failed`/`unrecorded`:
"Publication succeeded (Taken by <Agent>, workspace <path>), but the receipt
could not be recorded in ~/.open-dough/dashboard/launch-attempts.json:
<error>. Repair the file, then Continue; nothing more was started." (the
Preparing wording for refinement); no native session launches; the kept
start, workspace, branch, and assignment stay; the outcome is answered from
memory when it too cannot be kept, so a restart finds the attempt interrupted.
After repair, Continue reruns the kept request; the installed command answers
`existing` or continues the preparation, the receipt is kept, and one session
launches. `LAUNCH-START.md` names the receipt as the checkpoint before the
session.

### 5. Continue settles from the attempt's own launch record
Type: Behavior
Status: planned
Proof: new case in `agent-launch-uncertain-continuation.spec.ts`

Behavior: an unsettled or uncertain attempt whose story has a launch record
launched since the attempt was accepted → Continue → the attempt settles as
launched with that record's session, with no start run and no native call,
and the answer says so. The own-record rule moves from `launchVerification.ts`
into a shared function Recheck keeps using; Continue calls it in
`continueAttempt`'s pre-acceptance answer.

## Decisive premises

| Premise | Consuming operation | Observation (this workspace, 2026-10-11) | Result |
| --- | --- | --- | --- |
| A late established start proceeds through the same path as an in-time one and launches once | slice 1's launch after release | scratch edit of `launchStart.ts` (await the script, no race) plus a scratch spec: push held 8 s past a 3 s threshold, then released | settled: attempt `owned: true`, no outcome, publication `unknown` while held; on release `launched`, publication `published` with a revision, one Claude launch call, kept start removed; edit and spec reverted |
| A reparented child's liveness is observable by signal 0 | slice 3's `running` | `tmp/liveness-probe.mjs`: parent spawns `sleep 2` and exits; `process.kill(pid, 0)` at 0 ms and 3 s | settled: alive at 0 ms, not alive after exit |
| The fixture runs two dashboard servers on one machine store | slice 3's proof route | scratch spec starting two preview servers with the same `machine` | settled: two origins on different ports, both answer `GET /__agent-launch` |
| The fixture's `close()` ends the server's whole process group | slice 3's dead-worker proof | `dashboard/tests/support/processGroup.ts` | settled by reading: the group leader and every subprocess end together, so the new live orphan case kills only `dashboardServer.pid`; the existing dead-worker case reuses its explicit `pkill` |
| The page follows a running attempt without a bound of its own | slice 2 | `attemptChangeWaits.ts` re-waits after each read while the attempt runs; the server's `changed` wait is bounded and answers `changed: false` | presence only; slice 2's proof observes the card past the threshold and through the launch |

## Execution context

- Established `SEED-130#slow-startup-safe-recovery`, publisher `dashboard-territory.local-open-dough`, agent `bastiaan-chan`; no second claim/start.
- Story Branch Mode, owned workspace `/Users/terryyin/git/open-dough/.worktrees/slow-startup-continues-automatically-and-unsafe`, branch `codex/slow-startup-continues-automatically-and-unsafe`. Integration checkout `/Users/terryyin/git/open-dough`; origin/main; increments publish to the story branch.
- Starting revision `377970db89e0c2e2bde14f765fc2be9d9b58b9a3`; accepted claim/base `3ec282610148afb245a710642b486318d5388d57` on origin/main and remote execution branch.
- Exact-checkout `npm ci` and typecheck passed with `/opt/homebrew/bin` first on PATH; retained planning authority, no numeric slice budget.
- GitHub Actions `ci.yml` push workflow; observer coordinator `bastiaan-chan-243b529b`, directory `/tmp/dough-ci-501/watch-F8Nh94`, PID `1364`, session `44765`, yielded cell `12`. Claim publication predates observer; claim CI unobserved.

## Current decisions

- `slowSince` and `worker` are attempt facts noted through the existing
  `note`; a failed note of either is answered from memory, as today, because
  no effect depends on them. Only the `published` receipt is a required
  checkpoint before the native launch.
- `running` is computed by the answering server, never by the page, so pid
  checks stay server-side.
- Existing recovery states and their words are kept; only the warning and the
  recording stop add text.
- The `DOUGH_START_TIMEOUT_MS` name stays, now the warning threshold; specs
  keep shortening it.

## Considered but excluded

- A cancel action for a running start: a new capability the story defers.
- Automatic Continue after a server restart once the worker is dead: deferred
  by the story; the interrupted path stays manual.
- Storing the phase for non-owning servers in a second structure: the worker
  step already says it.
- Changing the start store's swallow of a post-script write failure: the
  write-ahead start already resumes safely through `existing`.

## Story obligations

### G1. Slow warning is not yet rendered
Reported: slice 1 — "The card progresses and launches automatically, but does not render or announce the slow-start warning or prove its reload persistence."
Story clause: "The Startup announcements log announces the slow start once."
Disposition: proved by slice 2: `responsive-session-recovery.spec.ts`, "warns once, keeps progressing through reload with no recovery, and launches automatically once"

### G2. Another server still reads a live start as interrupted
Reported: slice 1 — "The owning server reports owned; another server still treats an unsettled attempt as interrupted. No running observation field or worker fact was added here."
Story clause: "A page served by any dashboard server, after a reload, project switch, or server restart, shows an attempt whose recorded worker is verifiably alive as running"
Disposition: receiving slice 3
