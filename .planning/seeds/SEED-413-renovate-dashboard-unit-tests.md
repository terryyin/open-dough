---
id: SEED-413
status: active
planted: 2026-11-19
planted_during: Terry aligned unit-test entry guidance around strongly typed backend handlers and narrow UI components, set the Architectural North Star to minimize test support, and started the dashboard unit-test renovation campaign
trigger_when: selected from the product backlog after the updated test-boundary release is installed
scope: three stories (one vertical pilot and two renovation epics decomposed by feature folder)
---

# SEED-413 — Renovate dashboard unit tests around directly testable production seams

## Why this matters

`dashboard/backend-tests/` (555 `.spec.ts` files), `dashboard/frontend-tests/`
(302 `.spec.ts` files), and `dashboard/test-support/` (~790 files alongside
~1,145 production files in `dashboard/src/` and `dashboard/server/`) grew
around two expensive entry habits:

- Backend unit specs start or mount HTTP servers (`startDashboardServer`,
  `adHocReview.ts`, `launchStore.ts`) because `dashboard/server/` mixes
  `node:http` (`URL`, `IncomingMessage`, `ServerResponse`) into domain
  admission and selection.
- Frontend unit specs mount `<App />` (`frontendApp.ts`, `mountedDashboard.ts`),
  triggering 8+ background endpoints and requiring whole-app route mini-servers
  (`frontendServiceSubstitutes.ts`, `frontend*Rule.ts`) and Node arrangement
  commands (`SEED-404`'s baseline at
  `986aad0f1:.planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md`
  measured ~29 minutes locally at two workers, against Doughnut's 2,573
  narrow-component cases in 65 seconds).

The released and installed
[test boundary rule](../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary),
[architectural thinking guidance](../../.agents/skills/dough-slice-planning/references/architectural-thinking.md),
and [Architectural North Star](../NORTH-STAR.md) establish the target
direction:

- **Test support holds only data builders (MakeMe) and page objects** (plus rare
  minimal seam code strictly forced by a framework limitation); no new wrappers
  may be added to test support, and every change outside data builders and page
  objects only removes from it.
- **Plain Vitest runs unit tests; `@playwright/test` stays in `e2e/` only:**
  `dashboard/frontend-tests/` runs on plain Vitest + embedded headless Chromium
  (retiring `frontend.playwright.config.ts` and dual-runner glue in `scripts/test-frontend.mjs`), and
  `dashboard/backend-tests/` runs on plain Vitest in Node (retiring
  `backend.playwright.config.ts`).

## Alternatives and decision

Migrating 247 built-app frontend files to whole-`<App />` `mountAnsweredDashboard`
first (`SEED-404`) or piling layered settle helpers onto full-board mounts
(`DD-587`, `a3a734696`) adds test-support machinery and touches the suite
twice. Renovating all 857 unit-test files in one uninterrupted block would
stall product work.

Instead:

1. Run **one small vertical pilot family first** (`Story Notes`, folding in
   `SEED-407`'s ~100 ms/case target at `47cf696e5` without `DD-587`'s settle
   complexity) to prove the shared typed contract pattern between
   `dashboard/src/` and `dashboard/server/`, delete that family's `test-support`
   wrappers, and align `dashboard/backend-tests/README.md`,
   `dashboard/frontend-tests/README.md`, and `.planning/open-dough.json` so all
   subsequent stories follow the new architecture immediately.
2. Decompose **Backend Renovation** and **Frontend Renovation** by feature
   folder when reached, leading each family with its shared typed contract and
   backend handler seam so neither side invents throwaway adapters.

Assume the Open Dough release containing the updated test-boundary and
direct-mapping guidance is already published and installed in this repository;
do not spend story scope re-editing `Distribution/src/`. Judge speed, clarity,
and deleted `test-support` surface together under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Story decomposition

<a id="done-capture-import-list-analysis"></a>

The Done capture import-list stories come from Terry’s 2026-11-20 reviews of
the Done capture family’s import lists. Terry accepted the first analysis and
its order; the addendum’s two stories were added at Terry’s request. The first,
SEED-413#split-done-mark-decision-from-store, is done, as is the second,
branch entry (SEED-413#split-branch-entry-proposal-from-store; recoverable at
`9969388`); the others are
[delivery observation](https://github.com/terryyin/open-dough/blob/24864be6360f87cc9fec3dc4333de5361de165eb/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records),
landing reports (completed; recoverable at `086faa5a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records`) and
launch flavors as MakeMe steps (completed; recoverable at `47af39ca6:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme`).

- **Analysis (shared by the five stories, at `25f76e98d`).**
  - *Symptom.* 21 specs under `dashboard/backend-tests/review/` import from
    `support/doneCaptureCase.ts`. Most import the same verbs: `minutesAgo`
    (19 specs, 140 calls), `aCheckout` (19, 32), `work` (19, 67), `review`
    (18, 59), `keep` (16, 23), `markDone` (15, 53), `inWorktree` (8, 24),
    and `source` in 9. Many also import production store modules
    (`deleteRecord`, `changeSessionRecord`, `installRecordRemovalDispatch`,
    `keptRecords`) and Playwright-side helpers from
    `test-support/support/adHocReview.ts` (`sessionBranchPins`,
    `retireAdHocBranch`). `ad-hoc-session-branch-entry.spec.ts` still needs
    four spec-local helpers on top. Nearly every spec repeats the same
    script: checkout → launch record → `keep` in a stubbed HOME → dated
    `work` → `markDone` → `review`.
  - *Test design.* (1) The support module is loose procedures, not a model
    of the case: `checkout` and `record` are threaded separately through
    every call. (2) Data building is split across three layers:
    `anEstablishedSession`, `aDefaultLaunch`, `anIsolatedLaunch`,
    `aDeclaringLaunch` and `historyBeforeTheCase` are preset MakeMe chains
    living outside MakeMe. (3) Production actions run as setup: `markDone`
    and `identifyBranch` run the real capture even where the review is the
    topic. (4) The timeline is hidden: launch at 60 and Done at 10 are
    support defaults, while specs add their own `minutesAgo` literals around
    them.
  - *Production testability (the root cause).* (1) Writes go through an
    ambient store under `$HOME`, keyed by a source string:
    `setRecordDoneAt(sourceId, session, …)`, `recordSessionBranchEntry`,
    `changeSessionRecord` and `deleteRecord`. Hence `keep()` stubs HOME,
    and `review()` reads `keptRecords(source)` back, even though the review
    read already takes typed `KeptSessionState`
    (`server/storyReviewSessionAdmission.ts`). The read seam is typed; the
    write seams are not. (2) `setRecordDoneAt` (`server/recordDoneAt.ts`)
    does three jobs in one function: the record's state change (expected
    and automatic Done, disposition time), the Git capture of the branch
    result (`withBranchResultAtDone`), and persistence plus ref pinning
    (`keptWithDoneCapture`). Its `readAncestry` option exists only so
    `aHeldDone` can pause the Git read. (3) `recordSessionBranchEntry`
    (`server/sessionBranchEntry.ts`) has the same shape and asks for a whole
    `PublishedSource`, hence the `identifyBranch` wrapper. (4) The pin-ref
    layout lives in `server/launchRecordPins.ts`
    (`refs/open-dough/session-branch/${host}/${sessionId}/`), and
    `sessionBranchPins` copies it with the host hard-coded to `claude`.
    (5) `installRecordRemovalDispatch()` is a process-wide registration that
    retention and deletion specs must install. (6) Commit attribution
    (`madeSince`: reflog time at or after `launchedAt`) and run grouping in
    `server/sessionCommitsCapture.ts` are pure logic over log entries, but
    are reachable only through real repositories. As a result, all 21 specs
    are Git, file-store and ref integration tests. That is the cost behind
    the family's timeout margin.
  - *Decisions.* Split each write action into a typed decision and an
    effect-only shell, so only the adapter persists and pins. Review-topic
    cases compose Done and branch-entry state with MakeMe and call the typed
    review directly. A few cases keep each action as their topic. Order:
    this story (Done), then branch entry and the pin-ref query, then the
    launch flavors as MakeMe steps.
- **Addendum: delivery observation and publication (at `4fd00aed1`).**
  Terry's 2026-11-20 review of the closed
  SEED-413#arrange-done-ad-hoc-observation-and-publication found the same
  problem one layer further on. That story shortened the family's support
  overall, but added six backend-specific modules: `doneCaptureReview.ts`
  (26 specs), `adHocBranchRefs.ts` (12), `doneBranchObservation.ts` (4),
  `declaredPublisherBranch.ts` (3), `installedPublisher.ts` (3) and
  `reportedIsolatedBranch.ts` (1). Its specs import 5–9 support names from
  3–5 support modules beside the production store modules. Much of that
  support translates between typed cases and the machine stores, so the
  specs end up proving their own arrangement.
  - *Shared with these stories.* Every observation and publication case
    still runs `keep` and `markDone` in a stubbed HOME, and `review` reads
    `keptRecords(source)` back. `twoDoneBranchesMergedByHand`,
    `aDeclaredPublisherBranch` and `aReportedIsolatedBranch` are more preset
    MakeMe chains outside MakeMe. `landingPins` copies the
    `refs/open-dough/one-shot` layout as `sessionBranchPins` copies the
    session-branch one. The scopes below now name these.
  - *New write seams.* Two more production entries take a source string
    and read and write the ambient stores themselves.
    `captureObservedLandings` (`server/observedSessionLandings.ts`) reads
    `keptRecords`, decides each delivery and saves with
    `changeSessionRecord`. `handleLanding`
    (`server/launchLandingReporting.ts`) reads and replaces both the attempt
    store and the record store, and `branchLandingContext` writes reporting
    files under `machineDashboardPath`. That is why
    `aReportedIsolatedBranch` calls `replaceAttempts` and
    `writeLandingContext`, and why the lifecycle spec ages records through
    `changeLaunchStore(home, …)`.
  - *Test code that re-implements production.* `installedPublisher.ts`
    stubs global `fetch` with its own receiver. That receiver repeats the
    landing route table, method, origin and body admission that
    `submitLanding` owns. The publication cases therefore depend on a test
    copy of the wire admission.
  - *Decisions.* Apply the same split to the two new seams in
    [delivery observation](https://github.com/terryyin/open-dough/blob/24864be6360f87cc9fec3dc4333de5361de165eb/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records) and
    landing reports (completed; recoverable at `086faa5a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records`),
    after branch entry and before the launch flavors fold into MakeMe, so
    the fold covers the final builders.

<a id="renovate-remaining-backend-families-after-browser-reporter"></a>

### Prove machine-session reads through typed backend answers

**Identity:** SEED-413#renovate-remaining-backend-families-after-browser-reporter
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/829-prove-machine-session-reads-through-typed-answers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7946d5994d6f587cccc4994a439c3398155d1d8916d73d940d19be878bb27c02","plan":"81751012ddce35cfc985dee33074b83603aec6e3764a9a13d52a025ebbe4e1a3"}}
```

- **Goal.** Developers changing the dashboard's machine-session read get fast,
  typed Node Vitest feedback on what an overview or history reader receives.
- **Scope.** The six legacy session-read specs listed in the plan. Exercise
  host reading and record composition, the overview/history split, revision
  reuse and fresh demand, and request admission and encoding. Keep native host
  translation proof with that boundary. Start no server for the Node cases.
  Session mutations, alerts, and other backend families have their own owners.
- **Key examples.** With open records, retained Done records and settled
  attempts, the overview gives the reader the compact listing and the history
  restores the detail under its own revision. A reader holding the current
  revision gets an unchanged answer. A fresh ask can see a changed Codex
  observation while an ordinary ask still reuses a held observation. A full
  answer accepted as gzip decodes to the plain response.

<a id="prove-follow-up-context-on-vitest"></a>

### Prove retained follow-up context in Node Vitest

**Identity:** SEED-413#prove-follow-up-context-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/850-prove-follow-up-context-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"923787162c9dded3f2835a7645760f354220f47bfb91c908136a873eea6c5c82","plan":"ff92da91dd39e136070b8d4ff41eddd7a4f6cde53fb06cf3ccf38596443d61c9"}}
```

- **Goal.** Developers changing the Dashboard's follow-up get fast, typed Node
  Vitest proof that the receiving agent is sent the right source context, the
  developer's own request and the reporting context, in that order, and that a
  retry still sends them after the source record is gone.
- **Scope.** Move the six legacy specs `agent-launch-follow-up-{boundary,story,identity,live,codex,cursor}.spec.ts`
  (22 cases) and the post-split `agent-launch-follow-up-membership.spec.ts`
  (three cases, added with the
  [story-linked ad hoc sessions](https://github.com/terryyin/open-dough/blob/1ee3eb03b59a2133fdb73dddaf28c9d44fef2de8/.planning/seeds/SEED-439-complete-story-linked-ad-hoc-sessions.md#complete-story-linked-ad-hoc-sessions)
  binding) off backend Playwright, and account for each observation. Cover
  the context of a retained session and of a Done story with the Done
  sessions it selects (a Taken card's follow-up stays with its page journey);
  what the first input holds and its order on every
  host; a source's binding to a published story; the identity of a follow-up,
  its repetition and its continuation after the source expires; and
  admission that refuses page-composed context, a source the project no
  longer keeps, or a story membership that is missing, unbound or supplied by
  the page. Prove them through typed answers and kept records: the
  admission and first-input builders take the sources they read as typed
  values, and add no server, request or boundary wrapper to test support.
  Cases that need a real second process, a real Git origin or a native host
  keep only that boundary. The
  [coverage map](#backend-vitest-replacement-coverage) assigns Story Notes,
  published file, comparison and range selectors, attachment admission,
  isolated workspace choice and native first input to their owners; this
  story keeps only what follow-up adds to them, and product behavior stays
  unchanged.
- **Key examples.**
  - Given a Done session retained with a final report, a follow-up names only
    that session. The first input holds its context, the developer's text,
    then the reporting context; a blank request sends no part of its own and
    takes its launch time as title. With an isolated workspace the session's
    block and the reporting context come first. A report longer than the
    request field's limit is sent whole. The source stays Done and unchanged.
  - Given a published Done story with a quiet session kept for it and
    another still open, a follow-up at the revision shown sends the story's
    facts and only the selected sessions' context; with no session kept it
    says so. A story the revision does not publish, or whose record cannot be
    read, refuses the follow-up before any host starts.
  - Given two sources with the same instruction, they are two launches.
    Repeating one after the host refused resumes its kept start, sends its
    saved context and the instruction once, and keeps the first attempt's
    identity, even though the source has expired and a page-composed
    context is refused. A refused follow-up leaves no attachment claimed.
  - Given a follow-up that Codex or Cursor accepted only in part, Continue
    or a repeat after the source and attempt records are gone sends the
    recorded context unchanged, including a legacy story attempt whose
    instruction was saved apart from its context.
  - Given a follow-up running on another server, repeating it after the
    source expires answers with the running attempt and starts nothing.
  - Given a session with no story binding, a binding the published project
    does not list, or one the page supplies, no follow-up starts and nothing
    is kept.
- **Replacement trace.** Split from [launch starts and recovery](https://github.com/terryyin/open-dough/blob/420905723de59e71180451879726f684dcc7915e/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest).

**Plan.** [Prove retained follow-up context in Node Vitest](../slice-plans/850-prove-follow-up-context-on-vitest/PLAN.md)

<a id="prove-native-session-and-terminal-lifecycle-on-vitest"></a>

### Prove marking sessions done, stopping, deleting and reopening in Node Vitest

**Identity:** SEED-413#prove-native-session-and-terminal-lifecycle-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/867-prove-marking-sessions-done-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4a00512e9761571e3eeb561f6a69f6adbc08ff20454889f3387d8ab50b7bb1c4","plan":"372e80f238626f93ccaeed5262f4dc38384dc47d1cf9de3ad078d320ee3058d5"}}
```

- **Goal.** Developers changing how the Dashboard ends a kept session get
  fast, typed Node Vitest feedback on Mark as done, its native rename, stop
  or removal, record deletion and reopening. Each case shows the record the
  Dashboard keeps and the native operations it ran or skipped.
- **Scope.** Move the 14 legacy specs off backend Playwright and account
  for each observation: `sessions/agent-launch-done{,-close,-codex,-codex-intent,-codex-races,-prompt,-refusal,-rename-wait,-stop}.spec.ts`,
  `sessions/agent-launch-delete.spec.ts`,
  `sessions/agent-terminal-done-codex-boundary.spec.ts`,
  `sessions/agent-terminal-reopen.spec.ts`,
  `sessions/done-question-rule.spec.ts` and
  `sessions/agent-completion-quiet-rename.spec.ts`. Cover Claude Code and
  Codex Done by what the host lists, the rename through an open or private
  terminal and its waits, the takeover of a reported Done, races with late
  native answers, shutdown during a wait, refusal before any native call,
  record deletion, reopening through the terminal and the Mark as done
  question. Prove them through typed production operations and kept
  records: the Done, delete and reopen decisions take the host, terminal and
  record collaborators they use as typed values, and add no server, request
  or boundary wrapper to test support. A case keeps a real PTY, socket or
  server only where that boundary supplies the observation, and keeps only
  that boundary. Remove support with its last consumer. Product behavior
  stays unchanged. Completion reporting, observation, terminal attach, the
  Cursor runner and retention have their own sibling stories.
- **Key examples.**
  - Given a kept Claude Code session the host no longer lists, Mark as done
    keeps Done with the rename failure's cause and attaches, stops and
    removes nothing. When the listing cannot be read, the session is still
    stopped.
  - Given a session listed as exited, Mark as done removes its job with
    `claude rm` in the project folder without renaming or stopping it. A
    failed removal keeps Done with its cause and none of the native
    diagnostic, and a later Mark as done retries the removal and clears
    the cause, as it also clears an earlier stored stop failure.
  - Given a session with an open terminal, Mark as done types the rename
    into that terminal, ends the attachment, stops the session and keeps the
    mark across a restart. A title holding a control character types
    nothing. With no terminal open, a private attachment renames once its
    composer appears and is then hung up. A composer that never arrives, a
    rename that is never listed, or a session still working names that cause
    once the wait ends and still stops it. A server closed during the wait
    keeps the pending mark.
  - Given a quiet report that is still renaming a session, the developer's
    Mark as done takes it over: one rename runs and the reported write is
    dropped.
  - Given a Codex session, Done ends every Codex attachment while a Claude
    session with the same ID keeps its own. A late failed interruption, a
    turn finishing during interruption or an unreadable active turn never
    restores deleted intent, redirects the stop or guesses a target.
  - Given a delete request, only the record of a session whose listing
    cannot be read, or that Claude Code no longer lists and is not Done, is
    deleted, with nothing stopped or renamed. A known session keeps its
    record. A session this Dashboard did not record, another project's or
    another site's request is refused before `claude` runs, and an
    unwritable record file answers why and keeps the record.
  - Given a session marked Done, opening its terminal reopens it once the
    attach starts and keeps it reopened across a restart. A refused upgrade
    leaves it Done.

**Plan.** [Prove marking sessions done, stopping, deleting and reopening in Node Vitest](../slice-plans/867-prove-marking-sessions-done-on-vitest/PLAN.md)

<a id="prove-session-completion-reporting-on-vitest"></a>

### Prove session completion reporting in Node Vitest

**Identity:** SEED-413#prove-session-completion-reporting-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing how an agent reports its completion get fast feedback on which session a report binds to and closes, and what the Dashboard keeps when a report is quiet, late, superseded or refused.
- **Evaluation.** Given a launch whose report arrives early, late, after a newer submission or after its attempt was lost, the kept record closes only the bound session, retains the right message and claim, and never invents a binding.
- **Boundary.** Own `sessions/agent-completion-{attempt-loss,binding,early-recovery,identity,input,quiet-closure,returned-closure,superseded}.spec.ts`,
  `sessions/admitted-session-{no-change,shared-checkout}-completion.spec.ts`
  and `sessions/final-report-admission.spec.ts`. Keep a real host or second
  process only where it supplies the proof.
- **Effort hypothesis.** M, low confidence. Completion already has typed receipts; attempt loss and recovery decide how much needs a real process.
- **Safe stopping point.** Completion reporting stays observable through typed checks with fewer agent launches.
- **Replacement trace.** Split from [native session and terminal lifecycle](https://github.com/terryyin/open-dough/blob/23c09d6e4d18b5113b45f3aed28f09e986083072/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest).

<a id="prove-native-session-observation-on-vitest"></a>

### Prove native session observation and alerts in Node Vitest

**Identity:** SEED-413#prove-native-session-observation-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing how the Dashboard reads Codex and Cursor sessions get fast feedback on shared reads, their bounds and failures, and the alerts that follow.
- **Evaluation.** Given overlapping or failing native reads, waiters share one bounded read, failures keep healthy hosts and saved identity, and alerts fire once per actionable change.
- **Boundary.** Own `sessions/agent-launch-codex-observation-{alerts,concurrency,sharing,status,wait}.spec.ts`,
  `sessions/cursor-held-sessions-revision.spec.ts`,
  `sessions/cursor-runner-sessions-sharing.spec.ts`,
  `sessions/cursor-session-alerts.spec.ts` and the opt-in
  `sessions/sessions-replay.spec.ts` measurement. Keep a real runner read
  only where it supplies the proof.
- **Effort hypothesis.** M, low confidence. The machine-session read already answers through typed values.
- **Safe stopping point.** Observation and alert behavior stays observable through typed checks.
- **Replacement trace.** Split from [native session and terminal lifecycle](https://github.com/terryyin/open-dough/blob/23c09d6e4d18b5113b45f3aed28f09e986083072/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest).

<a id="prove-terminal-attach-and-cursor-turns-on-vitest"></a>

### Prove terminal attach and Cursor turns in Node Vitest

**Identity:** SEED-413#prove-terminal-attach-and-cursor-turns-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing a session terminal get fast feedback on who may attach, what passes through it, and how a Cursor client takes its instruction.
- **Evaluation.** Given a recorded session, a same-origin socket attaches and passes output, input and size, a refused upgrade runs nothing, and a Cursor client receives its instruction only when its screen is ready.
- **Boundary.** Own `terminals/agent-terminal-{boundary,close,codex-close,codex,resize}.spec.ts`
  and `terminals/agent-terminal-cursor{,-exit,-idle,-launch,-launch-wait,-trust-join}.spec.ts`.
  Keep a real PTY or socket where that boundary supplies the proof.
- **Effort hypothesis.** L, low confidence. Screen recognition may move to typed checks; attach and socket lifetime may stay end to end.
- **Safe stopping point.** Terminal behavior stays observable with fewer real attaches.
- **Replacement trace.** Split from [native session and terminal lifecycle](https://github.com/terryyin/open-dough/blob/23c09d6e4d18b5113b45f3aed28f09e986083072/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest).

<a id="prove-cursor-runner-lifecycle-on-vitest"></a>

### Prove Cursor runner lifecycle in Node Vitest

**Identity:** SEED-413#prove-cursor-runner-lifecycle-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing the Cursor runner get fast feedback on when it is started, kept, replaced or left, and on what its clients survive.
- **Evaluation.** Given a stale, dead, reused or current runner, the Dashboard starts, keeps or replaces it as its build proof requires, and its held clients survive a server restart.
- **Boundary.** Own `sessions/cursor-runner-{build-proof,discarded-start,environment,helper-repair-shapes,last-held,restart-shapes}.spec.ts`
  and `terminals/agent-terminal-cursor-runner.spec.ts`. Keep a real runner
  process where the result depends on it.
- **Effort hypothesis.** M, low confidence. Most cases observe a real process; the typed share is the start and replace decision.
- **Safe stopping point.** Runner decisions are typed and representative process journeys remain.
- **Replacement trace.** Split from [native session and terminal lifecycle](https://github.com/terryyin/open-dough/blob/23c09d6e4d18b5113b45f3aed28f09e986083072/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest).

<a id="prove-session-retention-and-input-on-vitest"></a>

### Prove session retention, one-shot starts and input in Node Vitest

**Identity:** SEED-413#prove-session-retention-and-input-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing how sessions are kept, retired, started one-shot or given images and voice get fast feedback on the kept record and what each request admits.
- **Evaluation.** Given aged-out or removed sessions, history keeps each once and an unwritable history keeps the record. A one-shot session start carries its policy or is refused before any start. Uploads and voice requests are bounded before anything is written or contacted.
- **Boundary.** Own `sessions/launch-history-{aged-out,removed}.spec.ts`,
  `sessions/agent-launch-retention-scope.spec.ts`,
  `sessions/agent-launch-session-{kept-start,options,refusal}.spec.ts`,
  `sessions/session-attachment-boundary.spec.ts`,
  `sessions/session-instruction-voice-boundary.spec.ts` and
  `sessions/session-workspace-retirement-startup.spec.ts`.
- **Effort hypothesis.** M, low confidence. Records and admission already take typed inputs.
- **Safe stopping point.** Retention, one-shot start and input admission are typed checks.
- **Replacement trace.** Split from [native session and terminal lifecycle](https://github.com/terryyin/open-dough/blob/23c09d6e4d18b5113b45f3aed28f09e986083072/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest).

<a id="prove-published-dashboard-reads-on-vitest"></a>

### Prove published Follow up evidence in Node Vitest

**Identity:** SEED-413#prove-published-dashboard-reads-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/859-prove-published-follow-up-evidence-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f5560aa6f588f22a7f948ed459912e9404c6c36652e87054fafc5a400399ce0e","plan":"1c3618bb542220692c137acd18c14b94a2a8b669a9a6dd7f7c63a7df1785428a"}}
```

- **Goal.** Give Dashboard maintainers fast, typed proof that Follow up
  carries the selected published comparison, file, line, or session evidence
  into the next agent input and preserves it when the same start resumes.
- **Scope.** Keep the six published Follow up backend specs from the coverage
  map. Prove admission and construction through the existing typed launch
  and Review operations in Node, using real Git objects for history and
  line checks and durable attempt records for Repeat and Continue. Keep
  browser selection and actual first-input receipt in the existing Intent
  journeys. Ordinary retained context, notes and host dispatch have their
  own coverage. This increment changes how the proof runs. The later
  published-read stories own the rest of the original scope.
- **Key examples.**
  - Given a completed or retained landed comparison, starting a whole
    Follow up carries its exact baseline and tree. A foreign reference or
    a mismatched endpoint is refused before any host starts.
  - Given a renamed file, a trunk-inclusive file, or the widened historical
    pair, starting a file or line Follow up carries its literal paths,
    applicable endpoints, side and line. A wrong story, range, file, or
    line is refused. A blank request still names the file.
  - Given selected published session records and local evidence, the new
    input includes the selected same-story facts. A record available only
    locally supplies the retained fallback. Continue reuses the original
    input after the source disappears. Two different lines produce two
    attempts, and repeating one line resumes its original attempt.
- **Replacement trace.** This identity retains the first independently
  deliverable part of [published Dashboard reads and evidence](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).
  The following stories and the [coverage map](#backend-vitest-replacement-coverage)
  account for the rest.

**Plan.** [Prove published Follow up evidence in Node Vitest](../slice-plans/859-prove-published-follow-up-evidence-on-vitest/PLAN.md)

<a id="published-read-admission-via-vitest"></a>

### Prove published read admission in Node Vitest

**Identity:** SEED-413#published-read-admission-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Give Board and Review maintainers fast proof that an admitted project can read its published records and that invalid source, revision, or path admission is refused.
- **Evaluation.** Given a pinned project, a listed file at its requested revision is readable. A sibling project or unlisted path is refused. An absent Done record and an unavailable catalog retain their distinct answers.
- **Boundary.** Reconcile cold ref triggers with plans 856 and 858 and pinned record reads with plan 823. Keep the wire admission proof and real Git for reachability.
- **Effort hypothesis.** M, low confidence. Recount surviving proof and size the observed cases during refinement.
- **Safe stopping point.** Every case for this outcome has a maintained owner or a recorded replacement.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove published read admission in Node Vitest](../slice-plans/860-prove-published-read-admission-on-vitest/PLAN.md)

<a id="published-refresh-lifecycle-via-vitest"></a>

### Prove published refresh lifecycle in Node Vitest

**Identity:** SEED-413#published-refresh-lifecycle-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Give developers observing published progress fast proof that refresh advances to a confirmed readable revision and recovers after failures.
- **Evaluation.** Given a visible snapshot, a failed check keeps the previous revision. A subsequent confirmed move advances the Board while the open pinned detail stays at its original revision.
- **Boundary.** Reconcile revision-list, cache and stream proof with plans 856, 853 and 823. Keep real origin movement and the actual stream or browser where delivery, departure, and the displayed recovery cue are observed.
- **Effort hypothesis.** M, low confidence. Recount surviving proof and size the observed cases during refinement.
- **Safe stopping point.** Every case for this outcome has a maintained owner or a recorded replacement.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove published refresh lifecycle in Node Vitest](../slice-plans/861-prove-published-refresh-lifecycle-on-vitest/PLAN.md)

<a id="authenticated-github-observation-via-vitest"></a>

### Prove authenticated GitHub observation in Node Vitest

**Identity:** SEED-413#authenticated-github-observation-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Give maintainers fast proof that the authenticated GitHub workload shares eligible requests, reports failures, and releases its callers and processes.
- **Evaluation.** When two Dashboards and CI share an eligible request, the owner sends it once. A cooldown delays callers, a departing waiter leaves other work running, and an exhausted retry records the bounded incident.
- **Boundary.** Use the surviving revision-check or pinned read for caller-specific proof. Reconcile plan 858’s trigger move. Keep real cross-process ownership and actual subprocess lifetime observations.
- **Effort hypothesis.** L, low confidence. Recount surviving proof and size the observed cases during refinement.
- **Safe stopping point.** Every case for this outcome has a maintained owner or a recorded replacement.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove authenticated GitHub observation in Node Vitest](../slice-plans/862-prove-authenticated-github-observation-on-vitest/PLAN.md)

<a id="published-review-comparisons-via-vitest"></a>

### Prove published Review comparisons in Node Vitest

**Identity:** SEED-413#published-review-comparisons-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Give developers inspecting Review fast proof that comparison and file evidence belong to the selected story and its published or landed pair.
- **Evaluation.** When a retained comparison has a rename, merge, or ambiguous contribution, Review keeps its exact endpoints and presents the recorded reason for any gap. A foreign pair, file, or story is refused.
- **Boundary.** Use the typed Review builder and admission operations with real Git histories and retained records. Reconcile plans 823 and 856 for shared fetch and pins. Retain actual Git process and browser interaction wherever they supply the proof.
- **Effort hypothesis.** L, low confidence. Recount surviving proof and size the observed cases during refinement.
- **Safe stopping point.** Every case for this outcome has a maintained owner or a recorded replacement.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove published Review comparisons in Node Vitest](../slice-plans/863-prove-published-review-comparisons-on-vitest/PLAN.md)

<a id="landing-capture-evidence-via-vitest"></a>

### Prove retained landing capture in Node Vitest

**Identity:** SEED-413#landing-capture-evidence-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Give developers fast proof that a publication’s landing pair stays bound to the launch that published it.
- **Evaluation.** When origin accepts a launch candidate, the capture keeps that launch’s base and candidate. A later publication, another launch, conflicting replay, or deleted source cannot replace the accepted pair.
- **Boundary.** Use installed capture, real Git pins and persisted launch records. Retain the CLI or Git process where its boundary supplies the proof. Follow the landing context into the installed publisher, capture and recovery.
- **Effort hypothesis.** M, low confidence. Recount surviving proof and size the observed cases during refinement.
- **Safe stopping point.** Every case for this outcome has a maintained owner or a recorded replacement.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove retained landing capture in Node Vitest](../slice-plans/864-prove-landing-capture-evidence-on-vitest/PLAN.md)

<a id="published-intent-evidence-via-vitest"></a>

### Prove published Intent evidence in Node Vitest

**Identity:** SEED-413#published-intent-evidence-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Give developers reading Intent fast proof that evidence comes from the selected project and revision and that unavailable evidence has an explicit outcome.
- **Evaluation.** When a revision publishes Intent configuration and test sources, the selected scope returns its own candidates and readable locations. Missing locations and unavailable CI status keep their distinct outcomes.
- **Boundary.** Reconcile the source move in SEED-434 and CI Git input move in SEED-435. After plan 607 lands, account for any product-unit cases the repeat correction leaves on Playwright. Plan 607 keeps its repeat behavior, obligations and load proof.
- **Effort hypothesis.** S to M, low confidence. Recount surviving proof and size the observed cases during refinement.
- **Safe stopping point.** Every case for this outcome has a maintained owner or a recorded replacement.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove published Intent evidence in Node Vitest](../slice-plans/865-prove-published-intent-evidence-on-vitest/PLAN.md)

<a id="machine-observation-via-vitest"></a>

### Prove Dashboard machine observations in Node Vitest

**Identity:** SEED-413#machine-observation-via-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Give Dashboard maintainers fast proof that local checkout invalidation and machine status reflect changes in their actual sources.
- **Evaluation.** When worktree Git identity changes, observers invalidate it. When one host metric is unavailable, the other stays readable and concurrent readers share the in-flight sample.
- **Boundary.** Use real Git transitions for checkout identity and the typed sampling operation with only the platform sampler controlled. Preserve method and origin refusal where the wire supplies the proof.
- **Effort hypothesis.** S to M, low confidence. Recount surviving proof and size the observed cases during refinement.
- **Safe stopping point.** Every case for this outcome has a maintained owner or a recorded replacement.
- **Replacement trace.** [Published Dashboard reads and evidence before the split](https://github.com/terryyin/open-dough/blob/fb8983cb8eb62b38c79fbc293b491128f411bdb2/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest).

**Plan.** [Prove Dashboard machine observations in Node Vitest](../slice-plans/866-prove-machine-observation-on-vitest/PLAN.md)

<a id="prove-dashboard-configuration-and-serving-on-vitest"></a>

### Prove Dashboard configuration and serving in Node Vitest

**Identity:** SEED-413#prove-dashboard-configuration-and-serving-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/868-prove-dashboard-configuration-and-serving-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b230eec9de8dc25f07844f891e2a0c12e79522438a099031ac5f11536e3a6ebf","plan":"e276b4520b5603fafdd82514fd0788a072624a888cbf4dc81d216dd1291eaa72"}}
```

- **Goal.** Developers changing Dashboard configuration (project membership,
  machine JSON storage, OpenAI credentials, terminal theme, feedback
  maintenance, notifier setup, and published agent settings) or serving,
  deployment, qualification, and update-watcher behavior get fast Node Vitest
  feedback while preserving real process, Git, filesystem, and HTTP serving
  proof where the product contract involves them.
- **Scope.** Move the 13 legacy Playwright specs in
  `dashboard/backend-tests/configuration/` (39 cases:
  `authenticated-read-agent-settings`, `feedback-maintenance-boundary`,
  `machine-json-reuse`, `machine-json-revision`, `notifier-setup`,
  `openai-configuration-boundary`, `openai-configuration-size`,
  `project-add-boundary`, `project-add-validation`,
  `project-configuration-boundary`, `project-configuration-mount-lifetime`,
  `project-remove-boundary`, `terminal-theme-boundary`) and the nine
  product-facing Playwright specs in `dashboard/backend-tests/runtime/`
  (25 cases: `boundary-server`, `dev-server-cache-ownership`,
  `production-deployment`, `production-qualification`,
  `production-update-selection`, `production-watcher-preview`,
  `production-watcher-refusals`, `production-watcher-setup-lifetime`,
  `serving-modes`) off backend Playwright, accounting for all 22 specs and
  64 cases.
  - Prove configuration boundary admission and persistence through direct
    production calls or in-process HTTP boundaries on Node Vitest without
    spawning child Dashboard servers where the boundary contract does not
    require a child process.
  - Preserve real Git, filesystem, CLI, and process serving boundaries where
    the product contract requires them (`project-add-validation`,
    `project-add-boundary` transport/abort/deadline behavior, `notifier-setup`,
    `production-qualification`, `production-update-selection`,
    `production-deployment`, `production-watcher-preview`,
    `production-watcher-refusals`, `boundary-server`,
    `dev-server-cache-ownership`, and `serving-modes`), running them directly
    in Node Vitest without Playwright's `request` fixture or browser runner.
  - Relocate `production-watcher-setup-lifetime.spec.ts`, which exercises
    `e2e/runtime/productionWatcherMachine.ts` with a real Playwright browser,
    to `e2e/runtime/` beside its consumer so its browser proof stays intact
    and off the legacy backend runner.
  - Product behavior is unchanged. Add zero new server, request, or boundary
    wrappers to `dashboard/test-support/`, compose typed state with MakeMe
    where applicable, and remove any test-support helper left with no
    remaining caller.
  - Test-infrastructure-only `runtime/` specs (the other 30 Playwright specs)
    and backend runner removal stay with
    [runner cutover](#retire-legacy-dashboard-backend-runner); browser page
    journeys stay in `e2e/configuration/` and `e2e/runtime/`.
- **Key examples.**
  - Given a saved OpenAI key, terminal theme, feedback maintenance choice, or
    project list, a foreign-origin, wrong-Host, cross-site, wrong-method,
    wrong-content-type, malformed, or oversized request is refused without
    changing the saved file, leaking secrets, or calling `claude` or `gh`; a
    valid save, read, exact 32 KiB UTF-8/ASCII key, or removal updates the
    machine file and returns `Cache-Control: no-store` with no checkout paths
    exposed.
  - Given a project addition request, invalid URLs, missing or nested
    checkouts, mismatched origins, duplicate ids or repositories, unreachable
    origins, and origins without a usable default branch are refused at their
    field without writing configuration; concurrent duplicate additions save
    exactly one entry; client disconnect, boundary deadline, server shutdown,
    or an unfinished body aborts the pending Git transport without writing
    configuration.
  - Given a machine JSON file, repeated reads parse it once while unchanged,
    re-parse after a cross-process rename or unsettled mtime, never serve a
    cached parse for an unreadable replacement, and advance
    `machineDocumentsRevision` on writes and renames.
  - Given `setup-notifier:dashboard` in an isolated HOME, missing or outdated
    `terminal-notifier` is refused without preparing an app; on macOS, setup
    builds, signs, and diagnoses the branded `Open Dough.app` with its
    iconset without posting, `--test` posts one labelled notification and
    refreshes in place, and denied permission names the settings entry.
  - Given a pinned revision with `.planning/open-dough.json`, the profile read
    returns its published text (or `null` when absent or unreadable), while a
    client-supplied path to the setting file is refused with 404.
  - Given a published `main` branch and CI workflow push exclusions,
    qualification spans deletions, renames, and the selected commit's policy,
    update selection keeps the last activated baseline until activation
    succeeds, deployment verifies and stages the pinned commit in isolation
    (and cleans up on cancellation), failed preview replacement and
    restoration report both causes with neither preview running, and the
    watcher refuses invalid options, unpublished `main`, or an occupied port
    and retires its processes on shutdown.
  - Given the bundled `boundaryServer`, `dev`, and `preview` servers, each
    environment reads its own project configuration file, `dev` and `preview`
    mount identical local boundaries and icon exports with Vite HMR only in
    `dev`, and two `dev` servers keep isolated optimized module caches.

**Plan.** [Prove Dashboard configuration and serving in Node Vitest](../slice-plans/868-prove-dashboard-configuration-and-serving-on-vitest/PLAN.md)

<a id="prove-launch-attempts-with-typed-state"></a>

### Prove Dashboard launch attempts with typed machine state

**Identity:** SEED-413#prove-launch-attempts-with-typed-state
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers changing launch recovery or drain need Node Vitest
  cases that show which machine state drives each decision. `LaunchAttemptOwner`,
  the attempt store, and project configuration currently pull state from the
  environment. Launch-owner cases repeat a stubbed `HOME`, mounted project
  configuration, and owner teardown to exercise those decisions.
- **Evaluation.** Launch-owner decision cases compose typed attempts and
  project state directly, without a stubbed `HOME` or mounted configuration.
  A retry after interruption uses the retained attempt identity and request.
  An update drain refuses new starts and continuations and waits until the
  accepted attempt's outcome is durably recorded. The held-gate cases in
  `agent-launch-duplicate.spec.ts` and `agent-launch-codex-duplicate.spec.ts`
  pass under the load other local suites create. On 2026-11-27, at a load
  average of about 17, three of them missed their 3 s wait for the native
  launch, while each spec passed alone, both before and after the
  published Follow up story's continuation change.
- **Boundary.** Extend the typed decision and persistence split used for
  session and landing state to launch attempts. Keep focused production
  adapter proof for persistence and configuration, and preserve the real
  process, Git, and native checks that observe those boundaries. Keep the
  existing launch assertions and avoid new test-support wrappers. Runner
  removal belongs to [runner cutover](#retire-legacy-dashboard-backend-runner).
- **Baseline.** [Worker recovery and drain](https://github.com/terryyin/open-dough/blob/23e911e465339f1b371fd9e36cc99a583c580ac1/.planning/slice-plans/857-prove-launch-worker-recovery-on-vitest/PLAN.md#execution-complete)
  landed at `62522f4f`. Its focused selection ran 23 Node cases in 8.71 s.
  Use the same selection to compare runtime and check for lost observations.

<a id="retire-legacy-dashboard-backend-runner"></a>

### Run the entire Dashboard backend unit suite on Node Vitest

**Identity:** SEED-413#retire-legacy-dashboard-backend-runner
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#retire-legacy-dashboard-backend-runner","dependencies":[{"supplier":{"identity":"SEED-413#finish-backend-vitest-renovation-after-launch-attachments","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments"},"implementation":"Land the typed Story Notes and note-follow-up checks with native confirmation preserved in E2E.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"dec37b6b829b7b5d20a57df4a3775e9c6a015faa","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments","summary":"The exact five-spec backend selection passed all 41 cases in Node Vitest, covering 29 pilot cases, 11 previously mounted launch cases, and one valid Attach contrast. The twelfth original launch case passed in Chromium E2E in e2e/stories/recently-done-cursor-follow-up-notes.spec.ts with the same kept input confirmed and its admitted note version sent. The Dashboard sent-state journey passed separately. The archived plan records the selectors and timing checks. No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.\nCondition satisfied: No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.\nAccepted integration: 720879458315e6b86aa70f5d9a609274de119f31 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-launch-starts-and-recovery-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest"},"implementation":"Integrate the proof disposition for the eight launch admission and settlement paths in slices 1–4.","rationale":"Runner cutover removes the legacy execution path. Its eight proof paths must have maintained owners before that removal. A separate supplier owns legacy recovery, worker, change and drain proofs.","condition":"No launch admission or settlement case in the original story's delivered slices 1–4 depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"420905723de59e71180451879726f684dcc7915e","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest","summary":"The retained launch admission and settlement plan accounts for all eight legacy spec paths. The replaced fixture-only spec was removed with its fixture. The seven surviving paths and maintained cross-server, admission-close and worker controls passed in the one-worker Node Vitest selection, with zero Chromium selections. The integrated 61-case check also passed both worktree-retry cases and Dashboard typecheck. The plan preserves the receiving real process, Git and native E2E observations. The six worker recovery and drain paths remain assigned to the queued follow-up.\nCondition satisfied: No launch admission or settlement case in the original story's delivered slices 1–4 depends on the legacy backend runner.\nAccepted integration: 6eaca3b874431ad8c5e1dca386b6a4dc6b49e5ac on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-launch-worker-recovery-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-worker-recovery-on-vitest"},"implementation":"Integrate the proof disposition for the six worker recovery, continuation, change, reconciliation and drain legacy specs.","rationale":"Runner cutover removes the legacy execution path. The cases transferred from the original story still need their Node or retained E2E proof before the runner can be removed.","condition":"No legacy launch worker recovery, continuation, change, reconciliation or drain case in the six-spec follow-up still depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"23e911e465339f1b371fd9e36cc99a583c580ac1","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-worker-recovery-on-vitest","summary":"All six paths now run on Node Vitest in place: agent-launch-continuation-interrupted, agent-launch-uncertain-continuation, agent-launch-worker-handoff, agent-launch-change-wait, settled-attempt-reconciliation and dashboard-update-drain. Own-record settlement moved to the new Node spec agent-launch-confirmed-continuation. The final one-worker backend selection at 7af0fb4a6 ran 23 Node cases with no Chromium case, all passing first try. Native receipt, server death, the phone effort check and preview replacement stay in their E2E journeys, which passed 11, 1 and 10 cases. Plan 857 completed all seven slices; its Delivered notes record each slice's proof and mutation checks.\nCondition satisfied: No legacy launch worker recovery, continuation, change, reconciliation or drain case in the six-spec follow-up still depends on the legacy backend runner.\nAccepted integration: 62522f4fa327ea55218cd963a3bef90c9c50eb8a on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-native-session-and-terminal-lifecycle-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest"},"implementation":"Land the proof disposition for Mark as done, native stop and removal, record deletion and reopening.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Done, stop, delete or reopen unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-published-dashboard-reads-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest"},"implementation":"Land the maintained proof disposition for published Follow up evidence.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published Follow up evidence is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-dashboard-configuration-and-serving-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-dashboard-configuration-and-serving-on-vitest"},"implementation":"Land the settings and product runtime proof disposition.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No configuration or serving unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#finish-backend-vitest-renovation-after-launch-options","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options"},"implementation":"Land the typed upload and claim cleanup checks, with accepted delivery kept in E2E.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No launch attachment unit case depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"ee8d963f593e06a2a2ca518b8c4072e888b8bae6","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options","summary":"The integrated backend selector classifies both selected launch attachment specs as Node Vitest. Six focused Node cases passed, covering the former upload, cleanup, filename and selection observations. The retained Chromium refinement and recovery journeys passed and verify accepted bytes at the ordered native paths and the reused recovery path. The archived slice plan records the commands and proof.\nCondition satisfied: No launch attachment unit case depends on the legacy backend runner.\nAccepted integration: fec5480484657266e715615024f3d6b630ad4b35 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-324#close-landed-ci-repeat-check-gaps","href":"seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps"},"implementation":"Land the retained repeat and load proof disposition for the correction.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"All repeat correction proof and load obligations have maintained owners through cutover.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-installed-story-starts-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest"},"implementation":"Land the proof disposition for installed execution and refinement starts.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No installed execution or refinement start case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"79475eaef07720be5bdd25722433060d62f8a19a","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest","summary":"The integrated backend selector classifies all 18 selected specs as Node Vitest and selects zero of them for Playwright. The archived plan and proof record map the 15 legacy specs to 48 passing typed real-Git cases, with eight passing retained Chromium E2E cases for actual native dispatch, kept starts and restart. The runner cutover owns its existing harness and survivor recount.\nCondition satisfied: No installed execution or refinement start case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 5725b315656e159e4cfc59dc069b9edf76b3091d on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-session-workspace-starts-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest"},"implementation":"Land the proof disposition for workspace choice, admission and scheduled launch.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No workspace choice or scheduled launch case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"daea1238c354addf980ff601d7b794fe4523c927","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest","summary":"Plan 848 moved 18 of the 19 mapped workspace and scheduled launch specs. Plan 854 at cfd4dcfac7e06fa70e73be54cca2ad6626b1ab36 moved its remaining isolated Codex case to Node Vitest and removed the legacy spec. The same case observes the established worktree cwd, codex branch namespace and ordered native input. The mapped backend listing on integrated d4c2df6a0d40041869a89b395f8fd28316a46db1 found 46 Node cases and zero legacy cases. The separately owned scheduled admission case stays outside this supplier’s scope.\nCondition satisfied: No workspace choice or scheduled launch case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: d4c2df6a0d40041869a89b395f8fd28316a46db1 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-native-first-input-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest"},"implementation":"Land the proof disposition for host choices and first native input.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"eac4d5e9e4041f64f603a5afc08378552a9c433c","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest","summary":"The integrated maintained backend selection passed 88 Node Vitest cases across 21 specs, with zero Playwright cases and zero retries. Plan 849 at the recoverable revision maps all 79 legacy observations and separates four unchanged creation controls from 84 migrated Node cases. The retained Chromium selection covers 24 cases, including the moved real worker shutdown and restart. No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.\nCondition satisfied: No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: cbab58ebbe335734f8990002e6fb50fec0df4738 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-follow-up-context-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-follow-up-context-on-vitest"},"implementation":"Land the proof disposition for ordinary follow-up context and retry.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No ordinary follow-up context case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-kept-launch-records-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-kept-launch-records-on-vitest"},"implementation":"Land the proof disposition for retained launch record behavior.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No retained launch record case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"29e3287e862e5d5415d32653b3e71c91287b90a8","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-kept-launch-records-on-vitest","summary":"The plan's maintained backend selection over the seven retained launch record specs, with the new Vitest owners, selected 26 Node Vitest cases and zero Playwright cases. All passed on one worker in 6.5 s, against 18 legacy Chromium cases and 50.7 s at the base. start-store, launch-observations and agent-launch-host-identity were converted in place. launch-records-across-processes and launch-record-store replace the three records specs. The refused kept start joined agent-launch-boundary. Plan 851 at the recoverable revision maps every legacy case. agent-launch-records-shared-machine.spec.ts is deleted. Its remaining catalog fixture observations (one bare catalog origin, the same installed checkout for both servers, Claude cwd in that checkout) test test-support/support/catalogProjectOrigin.ts, not product records, and now fall under this consumer's harness and fixture boundary; recover them from 48e1d1f37.\nCondition satisfied: No retained launch record case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 1600a87c37e1073a306f8273709c21e06df10f97 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#published-read-admission-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-read-admission-via-vitest"},"implementation":"Land the maintained proof disposition for published read admission.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published read admission is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#published-refresh-lifecycle-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-refresh-lifecycle-via-vitest"},"implementation":"Land the maintained proof disposition for published refresh lifecycle.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published refresh lifecycle is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#authenticated-github-observation-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#authenticated-github-observation-via-vitest"},"implementation":"Land the maintained proof disposition for authenticated GitHub observation.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for authenticated GitHub observation is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#published-review-comparisons-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-review-comparisons-via-vitest"},"implementation":"Land the maintained proof disposition for published Review comparisons.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published Review comparisons is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#landing-capture-evidence-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#landing-capture-evidence-via-vitest"},"implementation":"Land the maintained proof disposition for retained landing capture.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for retained landing capture is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#published-intent-evidence-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-intent-evidence-via-vitest"},"implementation":"Land the maintained proof disposition for published Intent evidence.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published Intent evidence is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#machine-observation-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#machine-observation-via-vitest"},"implementation":"Land the maintained proof disposition for Dashboard machine observations.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for Dashboard machine observations is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-session-completion-reporting-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-completion-reporting-on-vitest"},"implementation":"Land the proof disposition for session completion reporting and final report admission.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No completion reporting unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-native-session-observation-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-observation-on-vitest"},"implementation":"Land the proof disposition for native session observation, alerts and the Sessions replay.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No session observation or alert unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-terminal-attach-and-cursor-turns-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-terminal-attach-and-cursor-turns-on-vitest"},"implementation":"Land the proof disposition for terminal attach and Cursor turns.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No terminal attach or Cursor turn unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-cursor-runner-lifecycle-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-runner-lifecycle-on-vitest"},"implementation":"Land the proof disposition for the Cursor runner lifecycle.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Cursor runner unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-session-retention-and-input-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-retention-and-input-on-vitest"},"implementation":"Land the proof disposition for session retention, one-shot session starts and session input.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No retention, one-shot session start or session input unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Maintainers running Dashboard Backend Test locally or in CI
  get one Node Vitest execution path with the same selection, sharding,
  timing, failure and proof-record contracts.
- **Evaluation.** A full backend selection contains every surviving unit
  check on Vitest, with each former legacy observation accounted for.
  A filtered or sharded run reports the right cases and times. A deliberate
  failing specimen is carried in the expected proof record and retains its
  diagnostics.
- **Boundary.** Own runtime specs solely about test runners and their harness
  (selection, reporters, setup, fixtures, fake hosts and browser waiting),
  the remaining Playwright launch-options runner specimen if still
  present, and the four `start-origin-*` private fixture contracts. Replace harness contracts still in use and retire cases proving
  removed setup. Remove the backend Playwright config, the backend dual-runner
  path and unused backend request/server wrappers. Keep test contracts shared
  by frontend or E2E until their own last consumer is gone. Own the private
  stand-in fixture and runner process teardown in `observation/`
  (`private-http-stand-in-runner` and `run-processes`). The three other
  `observation/` specs that the frontend runner retirement moved
  (`control-reachability-observation`, `observation-measurements` and
  `touch-reading-observation`, 11 cases) prove Playwright-only helpers that
  E2E and backend page objects use; give them a home that keeps that proof.
- **Prerequisite.** The product stories in the coverage map, attachment admission and the
  repeat correction supply the product-proof disposition needed before
  removing the legacy runner. Recount from fetched trunk and account for
  all survivors, including any that were added after the split.
- **Effort hypothesis.** M to L, low confidence, assuming product legacy
  specs have reached their named owners before cutover.
- **Safe stopping point.** The standalone backend command and CI producer both
  run on Node Vitest, with full selection and proof-record discrimination
  rechecked and the legacy backend entry point removed.

<a id="backend-vitest-replacement-coverage"></a>

#### Backend Vitest coverage and order

Developers need the current mixed-runner backend tests to become fast,
compile-time-checked evidence without losing native, Git, filesystem or
process behavior. Manual spot checks would leave routine regression proof to
the developer. Deferring keeps useful checks but prolongs their setup cost.
An import-only migration would retain expensive HTTP and worker setup and
move the same tests twice. These stories use typed production answers, kept records, and real
collaborators at the boundary whose behavior the case observes.

The maintained `groupFiles(backendGroup)` selector at `1e0e1f876` on
25 November 2026 counted 592 backend specs, 307 Playwright and 285 Vitest.
The 307 paths were launches 91, observation 54, sessions 50, runtime 39,
Review 31, Intent 17, configuration 13, and terminals 12. The later print
from the same selector at `43b6506e7` found 607 paths overall, 369 Vitest
and 238 Playwright. Its updated published-read inventory was 57 observation,
33 Review, 17 Intent and six selected launch paths on Playwright. Allocate legacy
paths in the following order so each has one owner. A surviving file can be
converted, consolidated with a named proof owner, moved to the correct suite,
or removed once its behavior or duplicate is accounted for.

| Selection at the recount | Proof disposition owner |
| --- | --- |
| Two `launch-attachment-*` specs | [Attachment admission](https://github.com/terryyin/open-dough/blob/ee8d963f593e06a2a2ca518b8c4072e888b8bae6/.planning/slice-plans/842-prove-launch-attachment-admission-on-vitest/PLAN.md), completed on Node Vitest |
| Three `agent-launch-follow-up-notes*` specs, plus the two Vitest Story Notes pilot specs | [Story Notes](https://github.com/terryyin/open-dough/blob/dec37b6b829b7b5d20a57df4a3775e9c6a015faa/.planning/slice-plans/845-prove-story-notes-and-follow-up-delivery-on-vitest/PLAN.md), completed on Node Vitest with Cursor confirmation in E2E |
| Six `agent-launch-follow-up-{file-admission,file,landed-comparison-admission,published-range-admission,published-sessions,selection}` specs | [Published Follow up evidence](#prove-published-dashboard-reads-on-vitest) |
| `agent-launch-options-rules.spec.ts` | [Runner cutover](#retire-legacy-dashboard-backend-runner), while it is a runner specimen |
| Eight launch admission and settlement spec paths | [Launch admission and settlement](https://github.com/terryyin/open-dough/blob/420905723de59e71180451879726f684dcc7915e/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest) |
| Six launch recovery, worker, change and drain specs | [Worker recovery and drain](https://github.com/terryyin/open-dough/blob/23e911e465339f1b371fd9e36cc99a583c580ac1/.planning/slice-plans/857-prove-launch-worker-recovery-on-vitest/PLAN.md), completed on Node Vitest with native receipt, server death and preview replacement in E2E |
| 15 installed execution and refinement specs | [Installed story starts](https://github.com/terryyin/open-dough/blob/79475eaef07720be5bdd25722433060d62f8a19a/.planning/slice-plans/847-prove-installed-story-starts-on-vitest/PLAN.md), completed on Node Vitest with native dispatch and restart in E2E |
| 18 workspace and scheduled launch specs, plus the cutover's later `admitted-session-duplicate.spec.ts` | [Session workspace choices](https://github.com/terryyin/open-dough/blob/daea1238c354addf980ff601d7b794fe4523c927/.planning/slice-plans/848-prove-session-workspace-starts-on-vitest/PLAN.md), completed on Node Vitest, including the isolated Codex case and restored observations in [plan 854](https://github.com/terryyin/open-dough/blob/cfd4dcfac7e06fa70e73be54cca2ad6626b1ab36/.planning/slice-plans/854-restore-session-workspace-vitest-proof/PLAN.md) |
| 15 native dispatch and first-input specs | [Host choices and first input](https://github.com/terryyin/open-dough/blob/eac4d5e9e4041f64f603a5afc08378552a9c433c/.planning/slice-plans/849-prove-native-first-input-on-vitest/PLAN.md), completed on Node Vitest with worker shutdown and restart in E2E |
| 6 ordinary follow-up context specs | [Prove retained follow-up context in Node Vitest](#prove-follow-up-context-on-vitest) |
| 7 retained launch record specs | [Retained launch records](https://github.com/terryyin/open-dough/blob/29e3287e862e5d5415d32653b3e71c91287b90a8/.planning/slice-plans/851-prove-kept-launch-records-on-vitest/PLAN.md), completed on Node Vitest; the shared-machine spec's catalog fixture checks moved to [runner cutover](#retire-legacy-dashboard-backend-runner) |
| Four `start-origin-{default,demand,isolation,private}` specs | [Runner cutover](#retire-legacy-dashboard-backend-runner), preserving private installed fixture behavior wherever it remains in use |
| 14 Done, stop, delete and reopen specs | [Marking sessions done, stopping, deleting and reopening](#prove-native-session-and-terminal-lifecycle-on-vitest) |
| 11 completion reporting specs | [Session completion reporting](#prove-session-completion-reporting-on-vitest) |
| Nine observation, alert and replay specs | [Native session observation and alerts](#prove-native-session-observation-on-vitest) |
| 11 terminal attach and Cursor turn specs | [Terminal attach and Cursor turns](#prove-terminal-attach-and-cursor-turns-on-vitest) |
| Seven Cursor runner specs | [Cursor runner lifecycle](#prove-cursor-runner-lifecycle-on-vitest) |
| Nine retention, one-shot start and input specs | [Session retention, one-shot starts and input](#prove-session-retention-and-input-on-vitest) |
| Eleven Playwright Intent paths named in the [repeat proof selection](../slice-plans/607-close-landed-ci-repeat-check-gaps/proof-selection.txt) | [Automatic repeat correction](SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps), including its failure and load proof |
| 12 observation Playwright paths | [Prove published read admission in Node Vitest](#published-read-admission-via-vitest) |
| 15 observation Playwright paths | [Prove published refresh lifecycle in Node Vitest](#published-refresh-lifecycle-via-vitest) |
| 23 observation Playwright paths | [Prove authenticated GitHub observation in Node Vitest](#authenticated-github-observation-via-vitest) |
| 21 review Playwright paths | [Prove published Review comparisons in Node Vitest](#published-review-comparisons-via-vitest) |
| 12 review Playwright paths | [Prove retained landing capture in Node Vitest](#landing-capture-evidence-via-vitest) |
| 6 intent Playwright paths | [Prove published Intent evidence in Node Vitest](#published-intent-evidence-via-vitest) |
| 2 observation Playwright paths | [Prove Dashboard machine observations in Node Vitest](#machine-observation-via-vitest) |
| Five observation harness specs | [Runner cutover](#retire-legacy-dashboard-backend-runner) |
| 13 configuration specs and nine product-facing runtime specs listed below | [Configuration and serving](#prove-dashboard-configuration-and-serving-on-vitest) |
| Other 30 runtime specs, which prove test infrastructure | [Runner cutover](#retire-legacy-dashboard-backend-runner) |

The nine product-facing runtime specs are `boundary-server`,
`dev-server-cache-ownership`, `production-deployment`,
`production-qualification`, `production-update-selection`,
`production-watcher-preview`, `production-watcher-refusals`,
`production-watcher-setup-lifetime`, and `serving-modes`. Use the
same distinction for newly added runtime cases according to what they observe.

Story Notes used explicit store inputs and retained records to preserve
receiving-input and note-version observations through typed operations.
Launch and session families carry the largest historical setup cost.
Published Follow up can move independently. Recount the remaining read
families against the local-Git publications that affect their boundaries.
Follow the repeat correction with disposition of its residual Intent
unit cases. Runner cutover is last. When pausing for product work,
defer cutover first. Each earlier outcome can stop safely with the mixed
runner still active.

Measure each selected family with the maintained command under comparable
conditions before and after. Record per-case times against roughly 100 ms,
counts, summed case time, elapsed selection time, and the cost and named
owner of any proof moved to E2E. Preserve distinct failures and interactions,
compose state with MakeMe, add zero request or server wrappers to test support,
and remove those with no remaining caller. Recount each boundary before
refinement. The remaining unrefined product scopes are effort hypotheses. The old 14–25 active-hour estimate for the whole
remainder assumed per-file migrations. At `07435ba0f` the selector picked 592 backend specs (305 Playwright and
287 Vitest), including 89 launch Playwright specs. The original 79 launch
specs spanned independent proof outcomes and exceeded one eight-slice plan.
The six launch stories above account for 75 product specs. The other four
exercise the private test-origin builder (installed fixture source, object
isolation, failure cleanup and copy ownership), so runner cutover owns their
disposition. Check those fixture contracts at their surviving consumers.
Reconcile landed product work, consolidate equivalent assertions, and retain
actual process proof where its result requires it.

The original launch selection at `07435ba0f` excluded notes, published
follow-up cases, attachments, and the options specimen. The maintained
backend command with one worker passed 271 Chromium and 78 Node cases on
their first attempt. It took 1,046.47 s wall and 972.027 s summed case time.
The per-story plans carry the relevant excerpts. Take fresh scoped
comparisons for execution under comparable load.

Earlier direct conversion reduced summed case time from 37.308 s to 31.758 s
while mixed-engine wall time rose from 36.842 s to 40.582 s. The typed Usage
History importer reduced focused elapsed time from 88.701 s to 36.389 s and
CLI starts from 288 to six. Keep both measures. The
[original remainder](https://github.com/terryyin/open-dough/blob/1e0e1f8767e7cebaba46182d141d75d7fb026525/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments)
retains the earlier family counts, timing samples, overlap analysis and
links to completed proof.
