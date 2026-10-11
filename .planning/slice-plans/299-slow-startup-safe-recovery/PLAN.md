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
  id performing the current step (`start` through preparation and the installed
  script, `launch` through handoff and the native session), the accepting
  `serverPid` retaining liveness through worker replacement, and note time; and an optional `slowSince`, noted by the running server when the
  threshold passes. Both are written through the existing `note` path in
  `launchAttemptSettlement.ts` and cleared with the outcome. No new store,
  registry, or daemon.
- **Running is derived, owned is a right.** `AttemptObservation` gains
  `running`, computed by the answering server: owned and unsettled here, or
  unsettled with either recorded worker or accepting server alive
  (`process.kill(pid, 0)`; `EPERM` counts as alive). `needsReconciliation` and `unresolvedAttempt`
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
| An unkept publication receipt stops before the native launch and Continue resumes it with one claim (example 5) | 4 | `agent-launch-publication-receipt-failure.spec.ts` at the HTTP/page boundary (direct start-store proof retained): read-only dashboard directory after publication answers `failed`/`unrecorded` naming "Publication succeeded" and the file, zero native launch calls, one profile on origin; after repair, Continue answers `launched` with the same profile |
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

Accepted: held execution/refinement starts note and clear `slowSince`, refuse duplicate Starts and Continue, and launch the original request once after release; late refusal settles normally. The ten-spec command below and typecheck passed; refactor's full start-resume rerun passed after moving its sole-consumer lost-server fixture to `keptExecutionStart.ts`. Native deadline, interrupted continuation and pending-input consumers remain green. Command: `env -u NO_COLOR PATH=/opt/homebrew/bin:$PATH npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-start-resume.spec.ts dashboard/tests/agent-launch-uncertain-continuation.spec.ts dashboard/tests/agent-launch-preparation-resume.spec.ts dashboard/tests/agent-launch-preparation-store-failure.spec.ts dashboard/tests/responsive-session-recovery.spec.ts dashboard/tests/agent-launch-boundary.spec.ts dashboard/tests/agent-launch-acceptance.spec.ts dashboard/tests/agent-launch-start-duplicate.spec.ts dashboard/tests/agent-launch-duplicate.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts`. Diagnosed proof corrections: wrong fixture title/slug, hook-entry observation race, conflicting NO_COLOR/FORCE_COLOR, and duplicate check including its continued self. Corrected full selection passed; no retry substituted for diagnosis. Warning display and cross-server liveness remain G1/G2.
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
bounded-wait paragraph describes the threshold. The temporary cross-server gap was proved closed by slice 3 (G2).

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
Status: done
Proof: the returned 24-spec command, typecheck and diff check passed (terminal exit 0). `agent-launch-second-server.spec.ts` observes running/protected/warning across reload/project switch, refuses Start/Continue, waits its bounded interval and shows one session. `agent-launch-second-server-orphan.spec.ts` kills only the server before a warning note; the live child stays running, its death becomes interrupted after reload, and Continue reuses one claim/workspace/session. `agent-launch-worker-handoff.spec.ts` holds real worker replacements before retained spawn and after child exit; live server facts refuse duplicate effects. `launch-attempt-worker.spec.ts` observes live/dead/EPERM and serialized notes; native timeout and own-record Recheck specs prove clearing. Initial page-read lag was corrected by observing reload; held-lock fresh Accept was repaired through the shared read-only conflict precheck plus authoritative locked recheck. Diagnostics: `dashboard/test-results/2026-10-11T08-13-20.614Z` and `2026-10-11T08-17-24.547Z`. Independent refactor consolidated worker construction/liveness and run bindings and split the linked startup guide. Its nine-spec run exposed exact warning-timestamp equality: the projected acceptance threshold can be replaced by the owning timer timestamp; only presence is contractual. Other selected observations passed; corrected full start/preparation-resume specs passed, then preparation passed again after existing-parser reuse. Typecheck passed; unchanged consumer proof is retained.
Behavior: an attempt one server runs → a page on another server, a reload,
or a restarted server reads it → it is `running` with the worker's step as
its phase and the same warning past the threshold; that server's accept
answers `already-starting` and its continue is refused as still running;
when the owning server settles it, every server shows the outcome. An
unsettled attempt whose worker is dead → it is interrupted, with Recheck and
Continue as today. The accepted/readmitted record starts with this server as its worker;
script spawn replaces its pid while retaining `serverPid`, and native handoff
replaces it with this server's pid. Both facts clear with the outcome; `runningStarts` stays this server's phases for its own starts.
`AGENT-LAUNCH.md`'s startup handoff describes running, worker, and
interrupted. A server killed before noting `slowSince` may leave its child alive;
an answering server derives the past-threshold warning from the recorded
attempt's acceptance time using the existing threshold. Prove this orphan case by
killing only the owned server pid, keeping its held installed script alive,
then observing running/protected/warning before release and interrupted after
the child exits; Continue safely reuses the kept claim. No automatic resume.
Execution found a dead-script/live-owner handoff gap: retaining `serverPid`
closes that interval without a registry. Hold a real worker replacement write
after script exit and prove the second server still refuses Continue.

### 4. An unkept publication receipt stops before the native launch
Type: Behavior
Status: done
Proof: the returned 22-spec selection and four direct wording/card consumers passed, as did typecheck. `agent-launch-publication-receipt-failure.spec.ts` supplies only a real post-receive read-only-directory precondition for both workflows: actual publication, exact failed/unrecorded memory answer, zero native calls, cleared worker/slow, durable unsettled evidence, protected card with failed answer and truthful recovery/Continue across reload. Repair then Continue keeps attempt ID/time and origin SHA, reuses one assignment/workspace, launches one session and removes the kept start. The original direct `agent-launch-preparation-store-failure.spec.ts` remains green, preserving swallowed start-store result writes. Corrected an absent expect import, the old acceptance uncertainty assertion, and a required-revision assertion: installed refinement Continue legitimately omits the optional revision, so proof separately checks unchanged origin SHA. Diagnostics: `dashboard/test-results/2026-10-11T08-37-52.303Z`, `2026-10-11T08-38-22.044Z`, `2026-10-11T08-38-58.447Z`. Independent refactor shared publication/session refusal formatting and the recording-stop type guard; receipt-failure, start-taken and preparation-codex consumers passed again. Formatter exposed an unknown thrown value; normalization to Error preserved the explanation, and the real receipt-failure spec, typecheck and repaired formatter passed. All modified/new files stay at most 250 formatted lines.
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
launches. The shared unresolved/Continue predicate includes this failed
recording stop even when its publication is known; the existing recovery UI
says that known publication stopped before launch, preserving the failed answer
and Continue. A rejected publication note must not poison later settlement notes.
`LAUNCH-START.md` names the receipt as the checkpoint before the session.

### 5. Continue settles from the attempt's own launch record
Type: Behavior
Status: done
Proof: the literal 16-spec selection below, extra race/uncertain/admission-close selection, typecheck and whitespace check passed to terminal exit 0. Four raw HTTP workflow/outcome cases settle the latest matching cross-host own record, keep identity/time and record bytes, clear worker/warning and trap all scripts/native calls. Missing project proves ordering: fresh Accept refuses `folder-not-found`, while Continue settles; read-only attempts and unreadable records start nothing. Real file-operation holds prove newer running/settled evidence survives and a newly appearing record suppresses effects at locked admission; closing during durable admission starts nothing. G4's native pending-input consumers retain their original assertions. Corrected setup capture and subprocess TypeScript flags, then reran affected full specs; diagnostics `2026-10-11T09-03-09.427Z`, `09-08-40.448Z`, `09-09-11.768Z`. Independent refactor shared worker liveness and merged landing retention; the eight-spec command below, typecheck and diff check passed. Before-checks proof was strengthened after acceptance found dirty scripts did not force that check to refuse (G5); full uncertain-continuation passed, independent narrow review found no edits, repaired formatter passed. All modified/new files stay at most 250 formatted lines.
Command: `env -u NO_COLOR PATH=/opt/homebrew/bin:$PATH npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-uncertain-continuation.spec.ts dashboard/tests/agent-launch-open-session-continue.spec.ts dashboard/tests/agent-launch-continuation.spec.ts dashboard/tests/agent-launch-claude-own-record-verification.spec.ts dashboard/tests/responsive-session-recovery-verification.spec.ts dashboard/tests/agent-launch-acceptance.spec.ts dashboard/tests/agent-launch-acceptance-kept-first.spec.ts dashboard/tests/agent-launch-duplicate.spec.ts dashboard/tests/agent-launch-worker-handoff.spec.ts dashboard/tests/agent-launch-second-server.spec.ts dashboard/tests/agent-launch-own-record-continuation-race.spec.ts dashboard/tests/agent-launch-publication-receipt-failure.spec.ts dashboard/tests/agent-launch-codex-reconciliation.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-codex-lifetime.spec.ts`.
Refactor command: `env -u NO_COLOR PATH=/opt/homebrew/bin:$PATH npx playwright test --config dashboard/playwright.config.ts dashboard/tests/launch-attempt-worker.spec.ts dashboard/tests/agent-launch-worker-handoff.spec.ts dashboard/tests/agent-launch-second-server.spec.ts dashboard/tests/agent-launch-own-record-continuation-race.spec.ts dashboard/tests/agent-launch-uncertain-continuation.spec.ts dashboard/tests/agent-launch-publication-receipt-failure.spec.ts dashboard/tests/launch-attempt-admission-close.spec.ts dashboard/tests/one-shot-landing-recovery-retention.spec.ts`.
Behavior: an unsettled or uncertain attempt with its own completed launch record → Continue → the same attempt settles launched from the latest matching record before pre-launch checks, without scripts or native calls. Recheck shares the original own-record selection; canonical pending first input keeps native recovery priority. Locked readmission rechecks fresh machine facts before effects; a closed owner starts nothing.

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

- `slowSince` and `worker` use existing attempt notes; failed notes stay answered from memory. Only the `published` receipt is a required checkpoint before native launch.
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
Disposition: proved by slice 3: `agent-launch-second-server.spec.ts`, `agent-launch-second-server-orphan.spec.ts` and `agent-launch-worker-handoff.spec.ts`

### G3. An unrecorded child cannot be observed after its server dies
Reported: slice 3 — "If recording the script pid fails and its server subsequently dies while that unrecorded child lives, the durable server-only worker cannot reveal the surviving child."
Story clause: "verified facts decide whether startup proceeds."
Disposition: no user cost "verified facts decide whether startup proceeds.": an actual recording failure leaves no verifiable live worker in the store, so the existing interrupted recovery correctly applies; the dead server cannot launch, and Continue reuses the durable kept start. The source promises observation of recorded live workers, not inference of an unrecorded process.

### G4. Own-record shortcut must preserve pending-input recovery
Reported: slice 5 — "The own-record shortcut can settle a pending-input conversation without recovering its first input."
Story clause: "the shared native recovery for ad hoc and pending-input sessions."
Disposition: proved by slice 5: canonical `pendingInputRecord` plus unchanged Codex reconciliation, preparation recovery, start and lifetime consumer assertions; terminal 16-spec selection passed.

### G5. Before-checks proof lacks a refusing precondition
Reported: slice 5 — "Dirty installed scripts prove settlement precedes pre-acceptance checks."
Story clause: "Continuing an attempt whose own launched session this machine already records settles it as launched and starts nothing."
Disposition: proved by slice 5: `agent-launch-uncertain-continuation.spec.ts` execution/unsettled case observes fresh Accept refuse `folder-not-found`, then Continue settles its own record with zero effects; full spec and typecheck passed.
