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


<a id="prove-session-completion-reporting-on-vitest"></a>

### Prove session completion reporting in Node Vitest

**Identity:** SEED-413#prove-session-completion-reporting-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/870-prove-session-completion-reporting-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ce2926336e7c138dd95af86d88a9a34cb0fd0a2fcafbb6ad8852fa8d206bb8a2","plan":"7fe6c4dec7198d8775aaafc8cf7cf21a8c4eeeda7a5acbd81ce8bd3197209e73"}}
```

- **Goal.** Developers changing how an agent reports its completion get fast,
  typed Node Vitest feedback on which session a report binds to and closes,
  what the Dashboard keeps when a report is early, quiet, late, superseded or
  refused, and what a final report request answers.
- **Scope.** Move the 11 legacy specs off backend Playwright and account for
  each observation: `sessions/agent-completion-{attempt-loss,binding,early-recovery,identity,input,quiet-closure,returned-closure,superseded}.spec.ts`,
  `sessions/admitted-session-{no-change,shared-checkout}-completion.spec.ts`
  and `sessions/final-report-admission.spec.ts`. Cover the reporting
  instruction each host receives; an early report held until the native
  session binds, through a normal launch or Recheck, and kept against late
  native writers; a deleted early binding; attempt evidence lost mid-launch;
  delivery identity, duplicates and refusals; a superseded submission;
  quiet closure, which needs landing and readable closure evidence, and its
  reporting-only recovery; closure of a story returned to the queue; the
  completion of an admitted session; and final report admission. Prove them
  through typed production operations and kept records: delivery, binding
  and final report admission take the report, record and host collaborators
  they use as typed values, and add no server, request or boundary wrapper
  to test support. A case keeps the installed reporting command, a real
  receiver process or real Git only where that boundary supplies the
  observation, and keeps only that boundary. Remove support with its last
  consumer. Product behavior stays unchanged. Mark as done and its quiet
  rename, observation, terminal attach, the Cursor runner and retention
  have their own sibling stories.
- **Key examples.**
  - Given a Codex or Cursor launch, its first input ends with the reporting
    instruction in that host's grammar. A blank ad hoc launch gets no
    instruction and, on Claude Code, no first input, while its kept claim
    still holds the reporting context.
  - Given a Claude Code launch whose report arrives before its session is
    known, a report naming an unknown session is refused and the real one
    answers `pending-native-session`. The session binds with that receipt,
    stays open, and later native record writes keep it. If the record is
    deleted before settlement, binding refuses it and a later report is
    refused.
  - Given attempt evidence removed or made unreadable after the native start,
    the launch answers uncertain with the native resume identity, submits no
    first input, keeps no record and keeps the unreadable file aside.
  - Given two launches, the older launch's report closes only its own
    session. Repeating a delivery answers the same receipt without writing
    either store, and a new delivery competing with the developer's reopen
    leaves it open. After Mark as done, a retry keeps the developer's Done
    time. Unknown project, host, reference or session, an empty or invalid
    message or outcome, an extra field and a cross-site origin are each
    refused and keep the earlier message.
  - Given a quiet report whose record write failed and a newer attention
    report that also failed, retrying the older answers its original receipt
    and closes nothing, and the newer retry keeps its message and stays open.
  - Given a tracked execution, a quiet report without landing records the
    receipt and stays open. An unacknowledged quiet report keeps its pending
    submission and a reporting-only retry, and recovers without repeating
    work; an unfinished report never closes; after deletion, its retry and
    binding are refused.
  - Given a claimed execution whose story returned to the queue, a quiet
    report closes it and keeps the returned outcome with its receipt, at
    delivery or later binding. Taken, unfinished or attention reports stay
    open, a developer's earlier Done keeps its time, and a newer report
    replaces the outcome. Only a story that left the backlog reports product
    closure evidence.
  - Given an admitted session, a no-change wrap-up closes its claim, keeps the
    borrowed checkout and publishes its session record. Two launches landing
    from one checkout each keep their own accepted range, and a landing retry
    answers its receipt without Git. Lost accepted evidence holds the claim.
  - Given a final report request, an unknown project, unrecorded or
    wrong-host session, arbitrary endpoint, wrong method or cross-site origin
    is refused before any native read. Claude Code answers that it cannot
    read one. Cursor answers its kept message, or explains a quiet or missing
    one, with closure evidence when kept. Codex reads its native report.
- **Replacement trace.** Split from [native session and terminal lifecycle](https://github.com/terryyin/open-dough/blob/23c09d6e4d18b5113b45f3aed28f09e986083072/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest).

**Plan.** [Prove session completion reporting in Node Vitest](../slice-plans/870-prove-session-completion-reporting-on-vitest/PLAN.md)

<a id="prove-cursor-runner-lifecycle-on-vitest"></a>

### Prove Cursor runner lifecycle in Node Vitest

**Identity:** SEED-413#prove-cursor-runner-lifecycle-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/873-prove-cursor-runner-lifecycle-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c2598a48ac988eeacff5b65ead0df4b8b927a01a8cdf68592e3f6f7e95adedf3","plan":"36596227d00e80ef0f927f4ece7a089a8361b6e8072d3d4bc66183891f35df06"}}
```

- **Goal.** Developers changing the Dashboard's Cursor runner get fast Node
  Vitest feedback on which runner starts, accepts work or stays running, and
  on which clients and session evidence survive shutdown or restart. This
  supplies the Cursor runner proof required for the backend runner cutover.
- **Scope.** Account for all 25 observations in the seven legacy specs
  `sessions/cursor-runner-{build-proof,discarded-start,environment,helper-repair-shapes,last-held,restart-shapes}.spec.ts`
  and `terminals/agent-terminal-cursor-runner.spec.ts`. Prove build identity
  and the current-build decision through typed production code. Keep real
  OS processes, filesystem, runner protocol and PTYs for the cases that
  observe those effects, and keep the existing Dashboard process where
  its lifecycle is the trigger. Use the existing fake Cursor agent and
  preserve product behavior. Cursor turn delivery, other hosts' terminal
  attach, browser journeys and retiring the legacy backend runner have
  their own owners. Real Cursor resumption after a runner kill or machine
  reboot remains outside this deterministic proof.
- **Key examples.**
  - Given an accepting runner with missing or stale build proof, startup
    leaves it running and the next real work replaces it once. A process
    that accepts connections but gives no runner answer is left alone
    and the launch starts no agent. Matching build proof with a deleted
    terminal helper lets the next launch restore it and retain the held
    client.
  - Given a dead runner and its old address, even a new listener on that
    port leaves the stale address unusable. A fresh current runner can
    keep the same conversation. Keep publishes last-held keys, deliberate
    hangup removes that client's key, and sudden death leaves the others
    readable.
  - Given two Dashboard servers on one home, startup leaves one runner
    in its own process group. Removing the starter's home ends its
    runner, and an older deployment's startup additions never reach
    the runner's Cursor commands or kept clients.
  - Given a held Cursor client, restarting the Dashboard rejoins the
    same process and can type into it, including when the client was
    waiting for an answer. A trust screen holds back the instruction
    until that same client is ready. Closing the Dashboard leaves the
    Cursor client running while Claude Code and Codex attachments hang
    up. Deliberately stopping the runner ends its held client and the
    next terminal open resumes the conversation on a fresh runner.
- **Replacement trace.** Split from [native session and terminal lifecycle](https://github.com/terryyin/open-dough/blob/23c09d6e4d18b5113b45f3aed28f09e986083072/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest).

**Plan.** [Prove Cursor runner lifecycle in Node Vitest](../slice-plans/873-prove-cursor-runner-lifecycle-on-vitest/PLAN.md)

<a id="prove-session-retention-and-input-on-vitest"></a>

### Prove session retention, one-shot starts and input in Node Vitest

**Identity:** SEED-413#prove-session-retention-and-input-on-vitest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/874-prove-session-retention-and-input-on-vitest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"57e8f8113f59576eb0b574ed429bfaf4e7e44bdc655f3ea38bd68d6b0d640730","plan":"b2c5e3cd673502c1ff7cd5d920b00c04e4779acd3c2905fc021c51b9808709f1"}}
```

**Goal.** Give Dashboard developers faster Node Vitest feedback when they
change session retention, one-shot starts, or session input. Preserve the
existing evidence about local records, launch policy, input and workspace
availability as part of the backend runner migration.

**Scope.** Replace the Playwright selection of the nine specs listed below
with maintained Node Vitest proof. Use typed production operations and
keep real storage, Git, HTTP or PTY behavior where the result depends on
it. The [campaign coverage map](#backend-vitest-replacement-coverage)
assigns the neighboring launch and terminal families and the runner cutover
to their respective owners. Browser gestures and actual vendor services
are outside this deterministic proof.

- `sessions/launch-history-{aged-out,removed}.spec.ts` and
  `sessions/agent-launch-retention-scope.spec.ts`.
- `sessions/agent-launch-session-{kept-start,options,refusal}.spec.ts`.
- `sessions/session-attachment-boundary.spec.ts`,
  `sessions/session-instruction-voice-boundary.spec.ts` and
  `sessions/session-workspace-retirement-startup.spec.ts`.

**Key examples.**

- A later record write archives a session marked Done 31 days ago exactly
  once. A session marked Done 29 days ago and an older unclosed session
  remain visible. Explicit removal archives exactly once with its own
  reason. If the archive is unwritable, expiry stays hidden but stored and
  can retry on a later write, while explicit removal refuses. Cursor
  scopes retire only after their records leave. Shared configuration and
  the saved conversation survive.
- A supported execution or refinement start carries the selected one-shot
  workspace and landing policy through its first input and kept record.
  Starting leaves origin unchanged. If native launch is refused after
  establishment, a later ordinary Start uses the kept policy and
  workspace once. An unsupported choice is refused before establishment
  or native dispatch.
- A valid session image gets its own numbered file with the original
  bytes. Invalid requests and unavailable sessions leave storage alone,
  opaque session IDs stay within their storage directory, and a failed
  write preserves existing data. Invalid audio never reaches the provider,
  disconnect and shutdown cancel work in flight, and provider failures
  return bounded public errors.
- If a retained workspace disappears after the host check and before
  native PTY startup, the terminal reports the missing workspace and
  closes without attaching or reopening Done intent.

- **Replacement trace.** Split from [native session and terminal lifecycle](https://github.com/terryyin/open-dough/blob/23c09d6e4d18b5113b45f3aed28f09e986083072/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest).

**Plan.** [Prove session retention, one-shot starts and input in Node Vitest](../slice-plans/874-prove-session-retention-and-input-on-vitest/PLAN.md)

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

<a id="admit-launch-requests-as-typed-values"></a>

### Admit Dashboard launch requests as typed values

**Identity:** SEED-413#admit-launch-requests-as-typed-values
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Developers proving launch admission in Node Vitest reach
  `answer()` in `dashboard/server/launchBoundaryAnswer.ts` by hand-building
  a `Socket`, `IncomingMessage` and `ServerResponse`, because admission in
  `agentLaunchAdmission.ts` (`launchRequest`) reads the request stream.
  About ten backend files repeat that construction, for example
  `launches/agent-launch-refusal.spec.ts`,
  `launches/agent-launch-model-admission.spec.ts`,
  `server/landingRequestAdmission.spec.ts` and
  `sessions/agent-launch-session-refusal.spec.ts`.
- **Evaluation.** Admission and the accept branch take a typed launch
  request, and a thin wire adapter keeps origin checking and JSON parsing.
  The listed specs call the typed entry for their decisions and keep one
  wire case where status, headers or origin are the observation, without
  new test-support wrappers.
- **Provenance.** Named by the post-change refactor pass of
  [session retention, one-shot starts and input](https://github.com/terryyin/open-dough/blob/162a60bd6b5378db843deadc972fbac8728c6352/.planning/slice-plans/874-prove-session-retention-and-input-on-vitest/PLAN.md#3-refuse-a-session-policy-that-cannot-be-established).

<a id="retire-legacy-dashboard-backend-runner"></a>

### Run the entire Dashboard backend unit suite on Node Vitest

**Identity:** SEED-413#retire-legacy-dashboard-backend-runner
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#retire-legacy-dashboard-backend-runner","dependencies":[{"supplier":{"identity":"SEED-413#finish-backend-vitest-renovation-after-launch-attachments","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments"},"implementation":"Land the typed Story Notes and note-follow-up checks with native confirmation preserved in E2E.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"dec37b6b829b7b5d20a57df4a3775e9c6a015faa","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments","summary":"The exact five-spec backend selection passed all 41 cases in Node Vitest, covering 29 pilot cases, 11 previously mounted launch cases, and one valid Attach contrast. The twelfth original launch case passed in Chromium E2E in e2e/stories/recently-done-cursor-follow-up-notes.spec.ts with the same kept input confirmed and its admitted note version sent. The Dashboard sent-state journey passed separately. The archived plan records the selectors and timing checks. No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.\nCondition satisfied: No Story Notes or note-bearing follow-up unit case depends on the legacy backend runner.\nAccepted integration: 720879458315e6b86aa70f5d9a609274de119f31 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-launch-starts-and-recovery-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest"},"implementation":"Integrate the proof disposition for the eight launch admission and settlement paths in slices 1–4.","rationale":"Runner cutover removes the legacy execution path. Its eight proof paths must have maintained owners before that removal. A separate supplier owns legacy recovery, worker, change and drain proofs.","condition":"No launch admission or settlement case in the original story's delivered slices 1–4 depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"420905723de59e71180451879726f684dcc7915e","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest","summary":"The retained launch admission and settlement plan accounts for all eight legacy spec paths. The replaced fixture-only spec was removed with its fixture. The seven surviving paths and maintained cross-server, admission-close and worker controls passed in the one-worker Node Vitest selection, with zero Chromium selections. The integrated 61-case check also passed both worktree-retry cases and Dashboard typecheck. The plan preserves the receiving real process, Git and native E2E observations. The six worker recovery and drain paths remain assigned to the queued follow-up.\nCondition satisfied: No launch admission or settlement case in the original story's delivered slices 1–4 depends on the legacy backend runner.\nAccepted integration: 6eaca3b874431ad8c5e1dca386b6a4dc6b49e5ac on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-launch-worker-recovery-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-worker-recovery-on-vitest"},"implementation":"Integrate the proof disposition for the six worker recovery, continuation, change, reconciliation and drain legacy specs.","rationale":"Runner cutover removes the legacy execution path. The cases transferred from the original story still need their Node or retained E2E proof before the runner can be removed.","condition":"No legacy launch worker recovery, continuation, change, reconciliation or drain case in the six-spec follow-up still depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"23e911e465339f1b371fd9e36cc99a583c580ac1","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-worker-recovery-on-vitest","summary":"All six paths now run on Node Vitest in place: agent-launch-continuation-interrupted, agent-launch-uncertain-continuation, agent-launch-worker-handoff, agent-launch-change-wait, settled-attempt-reconciliation and dashboard-update-drain. Own-record settlement moved to the new Node spec agent-launch-confirmed-continuation. The final one-worker backend selection at 7af0fb4a6 ran 23 Node cases with no Chromium case, all passing first try. Native receipt, server death, the phone effort check and preview replacement stay in their E2E journeys, which passed 11, 1 and 10 cases. Plan 857 completed all seven slices; its Delivered notes record each slice's proof and mutation checks.\nCondition satisfied: No legacy launch worker recovery, continuation, change, reconciliation or drain case in the six-spec follow-up still depends on the legacy backend runner.\nAccepted integration: 62522f4fa327ea55218cd963a3bef90c9c50eb8a on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-native-session-and-terminal-lifecycle-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest"},"implementation":"Land the proof disposition for Mark as done, native stop and removal, record deletion and reopening.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Done, stop, delete or reopen unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"499d3b82bfe3b987b927c3f77aaece6d0f68fd2d","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest","summary":"The integration candidate passed 56 Node Vitest cases across all 14 mapped specs, with zero backend Chromium selections and zero retries. Archived plan 867 accounts for all 58 legacy cases, including the shared origin duplicates. The retained E2E selection passed, including terminal reopen and record deletion. The accepted integration has the same runtime and proof source bytes as the tested candidate.\nCondition satisfied: No Done, stop, delete or reopen unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 03e815bda8318b75c4c627022a7ed3e114f50419 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-published-dashboard-reads-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest"},"implementation":"Land the maintained proof disposition for published Follow up evidence.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published Follow up evidence is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"satisfied","resolution":{"revision":"c57304660d75709c648e3129d8cf175f393b1a93","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-published-dashboard-reads-on-vitest","summary":"All six published Follow up specs now run on Node Vitest in place, plus agent-launch-follow-up-forged-context and agent-launch-follow-up-line-resume split from them. The final one-worker selection of those eight specs ran 17 Node cases and no Playwright case in 23.1 s, against 18 Playwright cases in 68.0 s at the base. Each refusal was checked by disabling its production guard. The two Intent browser journeys in e2e/intent/intent-story-follow-up.spec.ts keep the actual selection and first-input receipt and passed. The merged state at the integration passed 61 Node cases across the follow-up and continuation specs. Plan 859 at the recoverable revision maps every legacy case.\nCondition satisfied: The proof disposition for published Follow up evidence is published, and its surviving product-unit cases no longer require the legacy backend runner.\nAccepted integration: cce90482c879d459a7dd3da56939c0e34e9cb8b8 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-dashboard-configuration-and-serving-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-dashboard-configuration-and-serving-on-vitest"},"implementation":"Land the settings and product runtime proof disposition.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No configuration or serving unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#finish-backend-vitest-renovation-after-launch-options","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options"},"implementation":"Land the typed upload and claim cleanup checks, with accepted delivery kept in E2E.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No launch attachment unit case depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"ee8d963f593e06a2a2ca518b8c4072e888b8bae6","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options","summary":"The integrated backend selector classifies both selected launch attachment specs as Node Vitest. Six focused Node cases passed, covering the former upload, cleanup, filename and selection observations. The retained Chromium refinement and recovery journeys passed and verify accepted bytes at the ordered native paths and the reused recovery path. The archived slice plan records the commands and proof.\nCondition satisfied: No launch attachment unit case depends on the legacy backend runner.\nAccepted integration: fec5480484657266e715615024f3d6b630ad4b35 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-324#close-landed-ci-repeat-check-gaps","href":"seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps"},"implementation":"Land the retained repeat and load proof disposition for the correction.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"All repeat correction proof and load obligations have maintained owners through cutover.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-installed-story-starts-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest"},"implementation":"Land the proof disposition for installed execution and refinement starts.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No installed execution or refinement start case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"79475eaef07720be5bdd25722433060d62f8a19a","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest","summary":"The integrated backend selector classifies all 18 selected specs as Node Vitest and selects zero of them for Playwright. The archived plan and proof record map the 15 legacy specs to 48 passing typed real-Git cases, with eight passing retained Chromium E2E cases for actual native dispatch, kept starts and restart. The runner cutover owns its existing harness and survivor recount.\nCondition satisfied: No installed execution or refinement start case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 5725b315656e159e4cfc59dc069b9edf76b3091d on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-session-workspace-starts-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest"},"implementation":"Land the proof disposition for workspace choice, admission and scheduled launch.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No workspace choice or scheduled launch case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"daea1238c354addf980ff601d7b794fe4523c927","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest","summary":"Plan 848 moved 18 of the 19 mapped workspace and scheduled launch specs. Plan 854 at cfd4dcfac7e06fa70e73be54cca2ad6626b1ab36 moved its remaining isolated Codex case to Node Vitest and removed the legacy spec. The same case observes the established worktree cwd, codex branch namespace and ordered native input. The mapped backend listing on integrated d4c2df6a0d40041869a89b395f8fd28316a46db1 found 46 Node cases and zero legacy cases. The separately owned scheduled admission case stays outside this supplier’s scope.\nCondition satisfied: No workspace choice or scheduled launch case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: d4c2df6a0d40041869a89b395f8fd28316a46db1 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-native-first-input-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest"},"implementation":"Land the proof disposition for host choices and first native input.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"eac4d5e9e4041f64f603a5afc08378552a9c433c","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest","summary":"The integrated maintained backend selection passed 88 Node Vitest cases across 21 specs, with zero Playwright cases and zero retries. Plan 849 at the recoverable revision maps all 79 legacy observations and separates four unchanged creation controls from 84 migrated Node cases. The retained Chromium selection covers 24 cases, including the moved real worker shutdown and restart. No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.\nCondition satisfied: No host-choice or first-input case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: cbab58ebbe335734f8990002e6fb50fec0df4738 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-follow-up-context-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-follow-up-context-on-vitest"},"implementation":"Land the proof disposition for ordinary follow-up context and retry.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No ordinary follow-up context case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"76b599da18dca0da2499f87944e2c6020f4f0807","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-follow-up-context-on-vitest","summary":"The ordinary follow-up Playwright specs (boundary, story, identity, live, codex, cursor) and the membership spec are deleted. Their observations run as Node Vitest: session input, established input, story input, attempt identity, refusal, continuation, and the cross-server repeat. None of those cases select the legacy backend runner. The intent check caught a continuation that dropped the recorded source context.\nCondition satisfied: No ordinary follow-up context case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 2cd10b04b890e30d764289c4b21eefbf877cd8ca on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-kept-launch-records-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-kept-launch-records-on-vitest"},"implementation":"Land the proof disposition for retained launch record behavior.","rationale":"Runner cutover removes the legacy execution path. This supplier owns the disposition of these product observations before that removal.","condition":"No retained launch record case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"29e3287e862e5d5415d32653b3e71c91287b90a8","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-kept-launch-records-on-vitest","summary":"The plan's maintained backend selection over the seven retained launch record specs, with the new Vitest owners, selected 26 Node Vitest cases and zero Playwright cases. All passed on one worker in 6.5 s, against 18 legacy Chromium cases and 50.7 s at the base. start-store, launch-observations and agent-launch-host-identity were converted in place. launch-records-across-processes and launch-record-store replace the three records specs. The refused kept start joined agent-launch-boundary. Plan 851 at the recoverable revision maps every legacy case. agent-launch-records-shared-machine.spec.ts is deleted. Its remaining catalog fixture observations (one bare catalog origin, the same installed checkout for both servers, Claude cwd in that checkout) test test-support/support/catalogProjectOrigin.ts, not product records, and now fall under this consumer's harness and fixture boundary; recover them from 48e1d1f37.\nCondition satisfied: No retained launch record case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 1600a87c37e1073a306f8273709c21e06df10f97 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#published-read-admission-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-read-admission-via-vitest"},"implementation":"Land the maintained proof disposition for published read admission.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published read admission is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#published-refresh-lifecycle-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-refresh-lifecycle-via-vitest"},"implementation":"Land the maintained proof disposition for published refresh lifecycle.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published refresh lifecycle is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#authenticated-github-observation-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#authenticated-github-observation-via-vitest"},"implementation":"Land the maintained proof disposition for authenticated GitHub observation.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for authenticated GitHub observation is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#published-review-comparisons-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-review-comparisons-via-vitest"},"implementation":"Land the maintained proof disposition for published Review comparisons.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published Review comparisons is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#landing-capture-evidence-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#landing-capture-evidence-via-vitest"},"implementation":"Land the maintained proof disposition for retained landing capture.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for retained landing capture is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#published-intent-evidence-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#published-intent-evidence-via-vitest"},"implementation":"Land the maintained proof disposition for published Intent evidence.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for published Intent evidence is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#machine-observation-via-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#machine-observation-via-vitest"},"implementation":"Land the maintained proof disposition for Dashboard machine observations.","rationale":"Runner cutover removes the legacy execution path. The supplier owns every product case selected for its outcome before that removal.","condition":"The proof disposition for Dashboard machine observations is published, and its surviving product-unit cases no longer require the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-session-completion-reporting-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-completion-reporting-on-vitest"},"implementation":"Land the proof disposition for session completion reporting and final report admission.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No completion reporting unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-native-session-observation-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-observation-on-vitest"},"implementation":"Land the proof disposition for native session observation, alerts and the Sessions replay.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No session observation or alert unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"0e82130ff6693e0f9a7b936aa8871aacb6ebbfee","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-observation-on-vitest","summary":"The maintained selection on accepted integration e49a4aa8 covered the nine legacy session observation, alert and replay specs. It selected 19 Node Vitest cases and zero Playwright cases. All 18 active cases passed and the opt-in replay was skipped. Plan 869 maps the 19 active predecessor cases and opt-in measurement, with the redundant Cursor sharing case consolidated. The enabled replay and all 14 retained Chromium cases passed locally before integration. The resulting unit proof no longer requires the legacy backend runner.\nCondition satisfied: No session observation or alert unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: e49a4aa8d64245bc2560cd5b044d6f5cded010e9 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-terminal-attach-and-cursor-turns-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-terminal-attach-and-cursor-turns-on-vitest"},"implementation":"Land the proof disposition for terminal attach.","rationale":"Runner cutover removes the legacy execution path. Disposition of these terminal attach checks belongs to their existing supplier before that removal.","condition":"No terminal attach unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"0f91c70c84ffdbcd0d79126cdb741b4c2879f236","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-terminal-attach-and-cursor-turns-on-vitest","summary":"All five legacy terminal attach specs now run on Node Vitest in place or split by question: agent-terminal-admission (11, new) and agent-terminal-boundary (6), agent-terminal-resize (2), agent-terminal-close (1), agent-terminal-codex-close (1) and agent-terminal-codex (3). The one-worker selection of those six files ran 24 Node cases and zero Playwright cases, all passing, at 12.5 s; the integrated merge reran them with the trunk Done/stop specs, 40 cases passing. Plan 871 at the before-cleanup revision records each slice's proof, and an Intent Coverage break on the Codex resume environment was caught.\nCondition satisfied: No terminal attach unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 66d05a5eae9d44f78fde7b4c935ef467b2a5cd6a on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#prove-cursor-runner-lifecycle-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-runner-lifecycle-on-vitest"},"implementation":"Land the proof disposition for the Cursor runner lifecycle.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No Cursor runner unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-session-retention-and-input-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-retention-and-input-on-vitest"},"implementation":"Land the proof disposition for session retention, one-shot session starts and session input.","rationale":"Runner cutover removes the legacy execution path. Disposition of these product checks belongs to their existing supplier before that removal.","condition":"No retention, one-shot session start or session input unit case in this supplier’s scope depends on the legacy backend runner.","state":"waiting"},{"supplier":{"identity":"SEED-413#prove-cursor-turns-on-vitest","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-turns-on-vitest"},"implementation":"Land the proof disposition for Cursor turns.","rationale":"Runner cutover removes the legacy execution path. Disposition of these Cursor turn checks belongs to their supplier before that removal.","condition":"No Cursor turn unit case in this supplier’s scope depends on the legacy backend runner.","state":"satisfied","resolution":{"revision":"aa6ee4483c067e5ab32541ab8e76a7e4e9968c1f","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-turns-on-vitest","summary":"All six Cursor turn specs (18 cases: agent-terminal-cursor{,-exit,-idle,-launch,-launch-wait,-trust-join}.spec.ts) now run on Node Vitest (18/18 passed, 74.04s summed case time, 77.32s elapsed; 0 Playwright tests listed), workingKeptCursorTest and the pageTest import were removed from keptCursorTurn.ts, npm run typecheck:dashboard passed, and Dough Intent Coverage returned Caught on the trust-prompt readiness gate.\nCondition satisfied: No Cursor turn unit case in this supplier’s scope depends on the legacy backend runner.\nAccepted integration: 54c3899ad57382bf893f524a28de04966f070aff on origin/refs/heads/main."}}]}
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
| Six `agent-launch-follow-up-{file-admission,file,landed-comparison-admission,published-range-admission,published-sessions,selection}` specs | [Published Follow up evidence](https://github.com/terryyin/open-dough/blob/c57304660d75709c648e3129d8cf175f393b1a93/.planning/slice-plans/859-prove-published-follow-up-evidence-on-vitest/PLAN.md), completed on Node Vitest; the two Intent browser journeys keep the receipt |
| `agent-launch-options-rules.spec.ts` | [Runner cutover](#retire-legacy-dashboard-backend-runner), while it is a runner specimen |
| Eight launch admission and settlement spec paths | [Launch admission and settlement](https://github.com/terryyin/open-dough/blob/420905723de59e71180451879726f684dcc7915e/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-starts-and-recovery-on-vitest) |
| Six launch recovery, worker, change and drain specs | [Worker recovery and drain](https://github.com/terryyin/open-dough/blob/23e911e465339f1b371fd9e36cc99a583c580ac1/.planning/slice-plans/857-prove-launch-worker-recovery-on-vitest/PLAN.md), completed on Node Vitest with native receipt, server death and preview replacement in E2E |
| 15 installed execution and refinement specs | [Installed story starts](https://github.com/terryyin/open-dough/blob/79475eaef07720be5bdd25722433060d62f8a19a/.planning/slice-plans/847-prove-installed-story-starts-on-vitest/PLAN.md), completed on Node Vitest with native dispatch and restart in E2E |
| 18 workspace and scheduled launch specs, plus the cutover's later `admitted-session-duplicate.spec.ts` | [Session workspace choices](https://github.com/terryyin/open-dough/blob/daea1238c354addf980ff601d7b794fe4523c927/.planning/slice-plans/848-prove-session-workspace-starts-on-vitest/PLAN.md), completed on Node Vitest, including the isolated Codex case and restored observations in [plan 854](https://github.com/terryyin/open-dough/blob/cfd4dcfac7e06fa70e73be54cca2ad6626b1ab36/.planning/slice-plans/854-restore-session-workspace-vitest-proof/PLAN.md) |
| 15 native dispatch and first-input specs | [Host choices and first input](https://github.com/terryyin/open-dough/blob/eac4d5e9e4041f64f603a5afc08378552a9c433c/.planning/slice-plans/849-prove-native-first-input-on-vitest/PLAN.md), completed on Node Vitest with worker shutdown and restart in E2E |
| 6 ordinary follow-up context specs | [Prove retained follow-up context in Node Vitest](https://github.com/terryyin/open-dough/blob/76b599da18dca0da2499f87944e2c6020f4f0807/.planning/slice-plans/850-prove-follow-up-context-on-vitest/PLAN.md), completed on Node Vitest |
| 7 retained launch record specs | [Retained launch records](https://github.com/terryyin/open-dough/blob/29e3287e862e5d5415d32653b3e71c91287b90a8/.planning/slice-plans/851-prove-kept-launch-records-on-vitest/PLAN.md), completed on Node Vitest; the shared-machine spec's catalog fixture checks moved to [runner cutover](#retire-legacy-dashboard-backend-runner) |
| Four `start-origin-{default,demand,isolation,private}` specs | [Runner cutover](#retire-legacy-dashboard-backend-runner), preserving private installed fixture behavior wherever it remains in use |
| 14 Done, stop, delete and reopen specs | [Marking sessions done, stopping, deleting and reopening](https://github.com/terryyin/open-dough/blob/499d3b82bfe3b987b927c3f77aaece6d0f68fd2d/.planning/slice-plans/867-prove-marking-sessions-done-on-vitest/PLAN.md), completed on Node Vitest with the terminal and deletion journeys retained in E2E |
| 11 completion reporting specs | [Session completion reporting](#prove-session-completion-reporting-on-vitest) |
| Nine observation, alert and replay specs | [Native session observation and alerts](https://github.com/terryyin/open-dough/blob/0e82130ff6693e0f9a7b936aa8871aacb6ebbfee/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-observation-on-vitest) |
| Five Claude and Codex terminal attach specs | [Terminal attach](https://github.com/terryyin/open-dough/blob/0f91c70c84ffdbcd0d79126cdb741b4c2879f236/.planning/slice-plans/871-prove-terminal-attach-on-vitest/PLAN.md), completed on Node Vitest |
| Six Cursor turn specs | [Cursor turns](https://github.com/terryyin/open-dough/blob/aa6ee4483c067e5ab32541ab8e76a7e4e9968c1f/.planning/slice-plans/872-prove-cursor-turns-on-vitest/PLAN.md), completed on Node Vitest |
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
