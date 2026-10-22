# Show feedback maintenance's real outcome after quiet and interrupted runs

**Identity:** SEED-010#correct-feedback-maintenance-session-status
**Source:** [Correction story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#correct-feedback-maintenance-session-status)

## Source and provenance

A bounded retrospective correction from the execution retrospective of
[SEED-010#run-due-feedback-maintenance](https://github.com/terryyin/open-dough/blob/1a70db5cbd98b0a052f8f3e0f11785014d944db5/.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#run-due-feedback-maintenance)
(Story 9, plan 341, completed). Reviewed commits: `ca410794`, `5a2b1bdc`,
`247da19b`, `755d8920`, `7a17013d`, `0f500a5f`, `b812a2bf`. Findings were
verified at the branch tip `9ac8912c` of
`claude/receive-due-feedback-assessments-without-manual`, which has trunk
merged in.

## Goal and scope

The maintainer sees the actual outcome of each automatic feedback maintenance
session on this machine's dashboard. A quietly completed cycle does not read
as "did not complete" until the next check, and an interrupted automatic start
does not read as running forever or block later due dates.

Included: how the dashboard composes the row and the System settings status
line from the last watch-list read and the machine's feedback-maintenance
sessions; how those sessions are read from launch records and attempts; unit
and browser proof; and the wording in `dashboard/FEEDBACK-MAINTENANCE.md`.

Excluded: the overlap between `feedback-maintenance-launch.spec.ts` and
`feedback-maintenance-due-row.spec.ts`, which is left to
dough-test-optimization; Story 9 key example 4 (the setting turned off while
the session is open), an accepted residual; any new check trigger or GitHub
request; and any change to the cycle, the watch list block, the launch gates,
or the 15-minute check period.

Assumptions: the cycle publishes its advanced due date before it reports
(observed in production on 2026-10-22); the check reads the watch list only
while no feedback-maintenance session is running (`dueDecision` returns `wait
open` before `read`), so any review it holds was read before every running
session's start and after the end of the session state it last saw.

## Preserved promises and constraints

From Story 9, unchanged and restored by this correction:

- "A report with nothing requiring attention marks the session done quietly,
  and the advanced due date on trunk ends the due state." Goal: "only the
  decisions that need a person reach one."
- "A served due date is not launched again on this machine, whether the
  session is still open, ended quietly, or ended failed, stopped, uncertain, or
  without advancing the due date. In that last case the cycle is still due: the
  dashboard shows that beside Open Dough's Start session."
- Key example 5: a session that ends without the due date advancing is, at the
  next observation, shown as due and not completed, and is not relaunched.
- Showing where maintenance stands asks GitHub nothing; the check's request
  budget in `dashboard/GITHUB-REQUESTS.md` stays as it is.

## Current findings

1. **A quiet, successful cycle reads as "did not complete" until the next
   check.** `feedbackMaintenanceState` (`dashboard/src/feedbackMaintenanceState.ts`
   `rowOf`, `lastLaunchOf`) composes from the review the check last read,
   kept in memory by `dashboard/server/feedbackMaintenanceCheck.ts`. That read
   happened before the launch. When the completion report marks the session
   done, nothing new is read until the next check, up to 15 minutes later
   (`DOUGH_MAINTENANCE_CHECK_MS`). With the session `done` and serving X, and the
   cached `reviewAfter` still X, `dueDecision` answers `served`. The row then says
   "Feedback maintenance due since X; its automatic session did not complete"
   and settings say "did not complete (due X)". This happens after every
   successful run (production 2026-10-22: report 09:09:14, next check 09:15:23).
   The specs miss it because they check every 100 ms, and the launch spec
   reports before it publishes the advanced date. `FEEDBACK-MAINTENANCE.md`
   documents the defect ("A **done** launch counts as done once a later due date
   is read").
2. **An interrupted automatic start counts as running forever.**
   `observedSessions` in `feedbackMaintenanceCheck.ts` maps an attempt with
   `outcome === undefined` to `running` and ignores `AttemptObservation.running`.
   `running` is true only when the answering server owns the attempt or its
   worker process is alive (`dashboard/server/ownedAttempts.ts`,
   `launchAttemptWorker.ts` `attemptWorkerRunning`). An unsettled attempt with
   no live worker needs reconciliation, and elapsed time never settles it
   (`dashboard/src/launchAttemptSelection.ts` `needsReconciliation`).
   `dueDecision` therefore waits `open` indefinitely: no read, no launch for
   later due dates, and the row says "Feedback maintenance is running".

## Preparation observations and decisive premises

Observed on 2026-10-22 in this checkout
(`/Users/terryyin/git/open-dough/.worktrees/receive-due-feedback-assessments-without-manual`
at `9ac8912c`), Node 24.21.0 matching `.node-version`. Scratch files lived under
`/tmp/od344/` and one scratch spec under `dashboard/tests/`, which was deleted.
No product file was left changed, and no paid or native host run took place.

| Premise and consuming operation | Literal observation | Result |
| --- | --- | --- |
| Finding 1 in the state composition: a done session serving X, launched after the cached read of X, yields an incomplete row and settings outcome. | `node /tmp/od344/p1.mjs` calling `feedbackMaintenanceState("open-dough", {authorized:true, review:{kind:"scheduled", reviewed:"2026-10-15", reviewAfter:"2026-10-22"}}, [{due:"2026-10-22", at:"2026-10-22T08:30:00Z", progress:"done"}], "2026-10-22")` | `row: incomplete`, `lastLaunch: incomplete`; texts "Feedback maintenance due since 2026-10-22; its automatic session did not complete" and "Due since 2026-10-22. Last automatic launch: did not complete (due 2026-10-22)." Confirmed. |
| Finding 1 in the browser, through a route a spec can use: with a check period longer than the test, the first check still launches at listen when authorization is on before the server starts. When the advanced date is published and a quiet report follows, the page shows the false status. | Scratch `dashboard/tests/scratch-od344.spec.ts`: `turnOn` before `startDashboardServer({…, maintenanceCheckMs: 3_600_000})`, `launchedInput`, `pushWatchList(… dayFromToday(6))`, `reportingThrough(origin, input)({message:""})`, poll `doneAt`, then read the row and settings line; `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/scratch-od344.spec.ts --reporter=list` | Launch happened. The row read `Feedback maintenance due since 2026-10-21; its automatic session did not complete` once the sessions answer arrived; it was empty on an immediate read. Settings read `Due since 2026-10-21. Last automatic launch: did not complete (due 2026-10-21).` Confirmed and discriminating. The row loads asynchronously, so absence must be asserted only after the answer is known to have arrived. |
| Finding 2 in the session reading: an automatic attempt with no outcome and `running: false` is taken as running and holds a later due date. | `/tmp/od344/sessions.ts` holds the literal lines 94–156 of `feedbackMaintenanceCheck.ts` (the server module cannot be imported under strip-only Node, see below). `node /tmp/od344/p3.mjs` feeds that attempt to it, then to `dueDecision` with `reviewAfter: "2026-10-29"`, `today: "2026-10-30"`, then to `feedbackMaintenanceState`. | `[{"due":"2026-10-22", …, "progress":"running"}]`, `{"kind":"wait","reason":"open"}`, "Feedback maintenance is running". Confirmed. |
| Once finding 2 is corrected, a later due date's launch is not refused by the interrupted attempt. | `node /tmp/od344/p4.mjs`: `sameLaunch(interrupted.request, req("2026-10-29"))` and `conflicting(req("2026-10-29"), [], [interrupted], new Map())` from `dashboard/server/launchAttemptConflicts.ts` | `sameLaunch false`, `conflicting undefined`. The ad hoc acceptance path continues only a `sameLaunch` attempt, and ad hoc requests have no story conflict. A later date is accepted fresh. Confirmed. |
| The session reading can be unit-proved where it lives today. | Importing `dashboard/server/feedbackMaintenanceCheck.ts` from a Node script | `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` (constructor parameter properties). False: slice 2 moves the reading to `dashboard/src/`, where the other feedback-maintenance units are tested. |
| The existing unit proof runs here. | `node --test tests/support/feedback-maintenance-state.test.mjs tests/support/feedback-maintenance-due.test.mjs` | 11 pass. |

No premise needs a paid, credentialed, or owner-held observation.

## Existing solutions and architectural direction

PFE within the dashboard found what the correction needs:

- `AttemptObservation.running` and `needsReconciliation` already define
  whether an unsettled attempt runs on this machine. The session reading
  reuses `running`; it does not add a second liveness rule.
- `feedbackMaintenanceState` already has the comment "Done counts as done
  unless the date read since has not advanced", but it compares only dates, so
  a read taken before the session counts as a read "since". The correction
  makes "since" real by keeping when the review was read. It does not add a
  new state kind.
- Another option was to trigger a check when a maintenance record is marked
  done or its report arrives. It was rejected: it adds GitHub reads and a
  change to `GITHUB-REQUESTS.md`, couples the done mark to the check loop, and
  still shows the false status between the mark and the read's answer.
  Keeping the read time is local to the pure composition, costs no request,
  and matches Story 9's "next observation" wording in key examples 2 and 5.

Established structure and the Accepted ADR 0008 (machine-local launch records,
published due date) already support the change. No North Star topic is
needed.

## Outside-in proof

| Promise | Owner and proof |
| --- | --- |
| A quietly completed cycle is not shown as incomplete before a read after it started, and the row stays empty with settings "done (due X)". | Slice 1: state unit cases; browser test with a long check period, advanced date published before the quiet report. |
| A done session whose date a read after it started shows unchanged still shows "did not complete" (Story 9 key example 5). | Slice 1: state unit case; existing `feedback-maintenance-due-row.spec.ts` first test (report without advancing, then `afterFurtherChecks`) stays green. |
| An ended (unavailable) or deleted automatic session still shows as incomplete right away. | Slice 1: the existing state unit case for `ended` stays green; `feedback-maintenance-due-row.spec.ts` unavailable-after-restart test. |
| An automatic attempt no process runs, still unsettled, is ended: it serves its date, the row says it did not complete, and a later date launches. | Slice 2: unit cases on the moved session reading and `dueDecision` in `feedback-maintenance-due.test.mjs`, and a state unit case in `feedback-maintenance-state.test.mjs`. |
| A starting automatic attempt (unsettled, `running: true`) is still running and holds the check. | Slice 2: unit case. |
| A launched attempt with a kept record is read once, from the record. | Slice 2: unit case preserving the existing de-duplication. |
| The documentation states both rules. | Slices 1 and 2: `dashboard/FEEDBACK-MAINTENANCE.md` wording, reviewed in the slice. |

Consumers of the changed effects, traced for this plan:

- `feedbackMaintenanceState` output reaches the sessions answer
  (`dashboard/server/launchBoundaryAnswer.ts`), Open Dough's project row
  (`ProjectActions.tsx`), the settings section
  (`FeedbackMaintenanceSettings.tsx`), the two feedback-maintenance specs, and
  `tests/support/feedback-maintenance-state.test.mjs`. That unit file's `on`
  fixture has no read time, so its cases need one.
- The session reading reaches `dueDecision` in the check loop and the sessions
  answer. Consumers are both feedback-maintenance specs and
  `dashboard/tests/boundary/agent-launch-ad-hoc-codex-input.spec.ts`, which
  runs the check at 100 ms.
- No GitHub request changes, so `GITHUB-REQUESTS.md` and the request-counting
  assertions (`refReads`, `watchListReads`) are unaffected by design.
  Re-running the two specs confirms it.

Local checks for each slice: the two unit files, the two feedback-maintenance
specs, `agent-launch-ad-hoc-codex-input.spec.ts`, `npm run
typecheck:dashboard`, and `npm run lint`. These cover every consumer above,
and the changed surface is feature-local. Hosted CI runs the rest after
publication.

## Ordered slices

### 1. A quietly completed cycle stays quiet until a read after it started shows otherwise
Type: Behavior
Status: done
Proof: `node --test tests/support/feedback-maintenance-state.test.mjs` with new cases: (a) a `done` session serving X, launched after the review of X was read, gives no row, `lastLaunch` `done (due X)`, settings "Due since X. Last automatic launch: done (due X)."; (b) the same session with the review of X read after it started gives `incomplete` on both; (c) an `ended` session serving X is `incomplete` whatever the read time. Existing cases get a read time after their sessions' `at`. Browser: a new test in `dashboard/tests/feedback-maintenance-due-row.spec.ts` runs a server whose check period outlasts the test (`serverOn` gains an optional check period; `turnOn` before the server starts). After the launch, it publishes the advanced date, reports quietly, and waits for `doneAt`. Settings show `Last automatic launch: done (due X)`. On the dashboard, the row is checked only after something from the same sessions answer has rendered. One such anchor is the sidebar's Feedback maintenance entry. Another is the row showing "Feedback maintenance is running" before the report, when the page refreshes the answer. The executor confirms which anchor the page offers. After the anchor, the project row has no status (`toHaveCount(0)`); an immediate read is not enough, because the row loads asynchronously. Before the change, this test shows "did not complete" (observed above). Then the two feedback-maintenance spec files, `agent-launch-ad-hoc-codex-input.spec.ts`, typecheck, and lint.

Behavior: the check reads the watch list's review of due date X before launching the session serving X; the cycle publishes a later date and reports with nothing needing attention, and the session is marked done → the sessions answer, before any later read → Open Dough's row says nothing about feedback maintenance, and the settings line's last automatic launch is "done (due X)". The next check reads the advanced date → "Next due …", as before. If instead a read after the session started still finds X, the row says "due since X; its automatic session did not complete" and settings say "did not complete (due X)", as Story 9 key example 5 requires. The check's observation keeps when its review was read, with the review, through `observe()` and restarts as it keeps the review today. `feedbackMaintenanceState` counts a `done` session serving the read date as done, with no row, when that session started after the read. `FEEDBACK-MAINTENANCE.md` replaces "A **done** launch counts as done once a later due date is read" with the rule above and says the row's incomplete line follows a read taken after the session.

Accepted proof (2026-10-22): `node --test tests/support/feedback-maintenance-state.test.mjs tests/support/feedback-maintenance-due.test.mjs` 12 pass. The new case "a session marked done after the review of its date was read is done, with nothing on the row, until a read after it started finds that date" covers (a), (b), and (c). The fixture `on` gains `readAt` after every session's `at`. The browser run `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/feedback-maintenance-due-row.spec.ts dashboard/tests/feedback-maintenance-launch.spec.ts dashboard/tests/boundary/agent-launch-ad-hoc-codex-input.spec.ts --reporter=list` gave 11 passed. Its new test, "a cycle that publishes its advanced date and reports quietly is done on the row and in settings before the next check reads the date", uses a check period of 3,600,000 ms. It asserts the settings line `done (due X)` and the row's `toHaveCount(0)` after the anchor, the Recently done card "Ad hoc session for Feedback maintenance", which comes from the same `setSessions` answer. The sidebar entry was not a usable anchor because a done session leaves it. `watchListReads` equals `[served]`, and there is one launch. Before the change, the test failed with "did not complete (due X)". `npm run typecheck:dashboard` and `npm run lint` pass. The read time is kept only in memory with the review and is lost on restart, as the review is.

### 2. An interrupted automatic start counts as ended and frees later due dates
Type: Behavior
Status: planned
Proof: `node --test tests/support/feedback-maintenance-due.test.mjs` with new cases on the moved session reading. (a) An automatic attempt with no outcome and `running: false` reads as `ended` serving its date; `dueDecision` answers `wait served` for that date and `launch` for a later reached date. (b) The same attempt with `running: true` reads as `running`, and `dueDecision` answers `wait open`. (c) A launched attempt whose session has a kept record yields only the record's session. (d) Records map to done, ended (unavailable), or running as today. `tests/support/feedback-maintenance-state.test.mjs` adds a case: an interrupted attempt serving X gives row `incomplete`. Then the two feedback-maintenance spec files, `agent-launch-ad-hoc-codex-input.spec.ts`, typecheck, and lint.

Behavior: an automatic feedback-maintenance attempt was accepted for due date X, and the server running it stopped before it settled; no worker for it lives on this machine → the next check and the sessions answer → it is ended, not running. The row says feedback maintenance is due since X and its automatic session did not complete. X is not launched again. Once the cycle publishes a later date that is reached, the check reads it and launches one session for it. An attempt a live worker or the answering server still runs remains running and holds the check, as today. `maintenanceDue` and `observedSessions` move from `dashboard/server/feedbackMaintenanceCheck.ts` to `dashboard/src/feedbackMaintenanceDue.ts`, beside `MaintenanceSession`, so the unit tests can import them. The check and its `state` answer call them unchanged otherwise. The attempt branch maps `outcome === undefined && attempt.running` to `running`, and every other attempt to `ended`. `FEEDBACK-MAINTENANCE.md` adds this case beside "A session that ended unavailable without being marked done no longer counts as running", and the `MaintenanceProgress` comment names it.

## Current decisions

- Finding 1 is corrected in the composition by keeping the review's read time,
  not by triggering a check: no new GitHub request, no coupling of the done mark
  to the check loop. The settings line keeps "Due since X" from the last read
  while the last launch says "done (due X)"; both are true, and neither is
  alarming.
- Only a `done` session is spared by the read-time rule. An ended, deleted, or
  interrupted session did not report completion, so it shows "did not complete"
  immediately, as today.
- Comparing the read time with the session's start (`at`) is enough. The check
  reads only while no session runs, so a read after a serving session's start
  happened after it stopped running.
- The interrupted-attempt rule reuses `AttemptObservation.running`; no timeout
  or second liveness rule.

## Learnings

(Execution records consequential discoveries here.)

## Concern evidence

Slice-plan refinement was not needed. Each slice has one finding, one outcome,
and one proof loop. The two findings are independent: different functions,
different proof. Slice 2's relocation is the minimum that makes its rule
unit-provable, and it ships with the behavior it enables. No remaining
slice-specific concern was identified.
