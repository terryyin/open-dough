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

<a id="arrange-done-ad-hoc-observation-and-publication"></a>

### Arrange Done ad hoc sessions directly for delivery observation and publication

**Identity:** SEED-413#arrange-done-ad-hoc-observation-and-publication
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/730-arrange-done-ad-hoc-observation-and-publication/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7a7fddb499f7a1018e5ebd2fa47045e8bb557cef34668cd3086ff41826a0152a","plan":"e987abe99a845065b624e8ab8478a4d2a66bf224929fb42a744e4a88b583bc72"}}
```

Correction of `SEED-413#remove-ad-hoc-done-helper`, whose execution inlined
`markAdHocDone` into 25 call sites. Each repeated three lines (list the
session `done-live`, post Done, assert 200), so the same Done ritual ran in
every case. Terry rejected the result: when Done is the topic, it should not
need that many tests, and when it is only a precondition, the case should
compose the state directly.

Done so far, in the commits "Arrange ad hoc branch results from kept records
and mark Done directly" and "Check manual delivery at Done from kept records":
the 16 cases where Done is the topic are now plain
Vitest. They are branch attribution, branch result and its release, and the
manual delivery check at Done. Each keeps a MakeMe isolated record, works in
real Git, and marks Done once through the production `setRecordDoneAt`, as
the Done capture family does. `markDone` from `agentLaunchBoundary.ts` and
`claudeSessionBecomes(…, "done-live")` remain only where Done is a
precondition.

- **Goal.** Give dashboard maintainers faster, compile-time-checked proof
  of how a Done ad hoc session acquires and retains a delivery. Arrange the
  session from kept records and mark it with `setRecordDoneAt`, so each case
  starts at the observation or publication it proves.
- **Scope.** Replace the nine launch/list/HTTP Done arrangements across ten
  cases with plain Node Vitest cases using MakeMe records, the production
  handlers and real Git. The observation cases are in
  `review/ad-hoc-manual-landing-observation.spec.ts`,
  `review/ad-hoc-manual-landing-observation-retry.spec.ts`, and
  `review/ad-hoc-manual-landing-observation-lifecycle.spec.ts`. The publication
  cases are the prepared-receipt case in
  `review/ad-hoc-manual-landing-precedence.spec.ts`,
  `review/ad-hoc-session-comparisons.spec.ts`, and both cases in
  `launches/agent-launch-session-branch-landing.spec.ts`. Give observation's
  revision memo an explicit owner and expose the publisher's prepare and
  record handling as a typed entry. Keep the live Board read and revision
  check paths asynchronous, and keep the sender's exact retained comparison
  and retry in the installed publication proof.
- **Deferred scope.** The early quiet Done and later native binding case in
  the precedence spec remains with the later backend families, as do the
  branch-result race and quiet retry, session-commits review, and general
  Done lifecycle cases. Retire each `adHocReview.ts` helper when its last
  consumer moves. The later families still use `launchIsolatedReview` and
  `keptAdHocRecord`.
- **Key examples.**
  - A kept branch has a fixed comparison at Done. The first Board read after
    restart discovers its actual trunk merge even after a later advance.
    Both comparisons and their file reads survive branch retirement and an
    offline remote, with the original Done time intact.
  - A check at an unchanged revision discovers a newly Done session. A
    failed validation retries at the same revision while another session's
    delivery settles. Repeated observations keep one receipt and pin pair.
  - While validation is held, deletion or expiry wins. After release the
    other session settles, the removed record stays absent, and only the
    surviving session retains pins until it too expires.
  - A publisher-prepared pair survives an intervening Done and records the
    exact receipt. After delivery and retirement, the same Done session opens
    the delivered rename and its different working-tree comparison.
  - A declared worktree publishes only for its own launch. The pair is kept
    before push and the exact retry after Done and retirement reads the same
    receipt and file. A blank Default main launch can also declare a landing
    and keeps its pins until record deletion.
- **Evaluation.** Preserve each selected case's inputs, result and refusal
  assertions. Verify that the replacements call the typed Done seam without
  a launch, fake finished-session listing or HTTP Done step. Compare focused
  timing and the test-support calls removed against the prior cases under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

- **Accepted timing.** Terry accepted the delivered timing on 2026-11-20.
  The migrated cases' local timeout margin under load moves to
  [Bring the Done capture family's cases to 100–200 ms](#optimize-done-capture-family-cases).

<a id="split-done-mark-decision-from-store"></a>

### Mark Done through a typed decision and compose Done state in review cases

**Identity:** SEED-413#split-done-mark-decision-from-store
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

First of three stories from Terry's 2026-11-20 review of the Done capture
family's import lists. Terry accepted the analysis and the recommended order
below. The other two stories are
[branch entry](#split-branch-entry-proposal-from-store) and
[launch flavors as MakeMe steps](#fold-done-capture-launches-into-makeme).

- **Analysis (shared by the three stories, at `25f76e98d`).**
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
    [the family's timeout margin](#optimize-done-capture-family-cases).
  - *Decisions.* Split each write action into a typed decision and an
    effect-only shell, so only the adapter persists and pins. Review-topic
    cases compose Done and branch-entry state with MakeMe and call the typed
    review directly. A few cases keep each action as their topic. Order:
    this story (Done), then branch entry and the pin-ref query, then the
    launch flavors as MakeMe steps.
- **Goal.** Dashboard maintainers can prove Done capture and the review of
  Done sessions without a machine home. Marking Done is a typed decision on
  the record plus a Git-only branch-result capture. The store write and pin
  refs belong to the adapter alone. Review cases start from an already-Done
  record.
- **Scope.** Split `setRecordDoneAt` into: a pure Done transition (record,
  Done time and options → next record); a Git-only branch-result capture
  over a typed place that returns its result; and the store adapter that
  persists and pins. Replace the `readAncestry` test hook with the capture's
  own typed Git collaborator, or drop it if the held-Done race moves to the
  adapter's own case. Add MakeMe steps for a Done record with its captured
  branch result or session commits. Move every spec whose topic is the
  review off `keep`, `markDone` and `keptRecords`, and onto composed state
  passed to the typed review. Keep Done marking as the topic only in
  specs that prove the capture, the transition rules (expected, automatic,
  undo) or the adapter's persistence. Cover `madeSince` and run grouping
  with typed-log unit cases, and keep one real-Git case for the reflog read.
- **Key examples.**
  - A review case of a Done isolated branch builds its record with a MakeMe
    branch result and real Git commits, then reads the typed review, with no
    HOME stub and no `markDone`.
  - The Done transition refuses a stale expected Done time and ignores an
    automatic Done the record no longer allows, as plain values.
  - A held capture still loses to a newer Done, proved once at the adapter.
- **Evaluation.** Every replaced case keeps its assertions. Count
  `doneCaptureCase.ts` imports and calls, HOME stubs, and per-case time
  before and after at the same load, under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- **Effort hypothesis.** M, one plan.

<a id="split-branch-entry-proposal-from-store"></a>

### Propose a branch entry from typed inputs and expose its pin refs

**Identity:** SEED-413#split-branch-entry-proposal-from-store
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Second of the [Done capture import-list stories](#split-done-mark-decision-from-store);
the analysis and decisions are recorded there.

- **Goal.** Dashboard maintainers can prove branch-entry identification and
  its refusals from typed inputs. Review cases start from a record that
  already holds its branch entry, and tests ask production for a session's
  pins instead of copying the ref layout.
- **Scope.** Split `recordSessionBranchEntry` into a proposal over
  `{ trunk ref, record, place }` (verify the registered worktree, read the
  entry state and Default main tip, observe trunk) that returns the entry
  or a refusal, and the adapter that writes the record and pins. Narrow its
  `PublishedSource` input to what it reads. Expose the session's pin refs as
  a production query beside `sessionBranchRefPrefix` in
  `server/launchRecordPins.ts`, and retire `sessionBranchPins` and its
  hard-coded host. Add a MakeMe step for a record with a branch entry, and
  move cases where entry is a precondition off `identifyBranch`. Retire
  `declaredBranchCase.ts` when its last caller moves. Replace the
  `installRecordRemovalDispatch` setup with an explicit collaborator where
  these cases need retention or deletion.
- **Key examples.**
  - A foreign clone, a wrong branch and a second place are refused by the
    proposal, without a kept store.
  - An entry kept before main moves still answers the same entry.
  - A review of a declared branch, composed with its entry, separates the
    branch from the Default main commits made before entry.
- **Evaluation.** As in the first story, also counting `adHocReview.ts`
  imports from `dashboard/backend-tests/`.
- **Effort hypothesis.** M, one plan.

<a id="fold-done-capture-launches-into-makeme"></a>

### Build Done capture cases from MakeMe launch steps

**Identity:** SEED-413#fold-done-capture-launches-into-makeme
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Third of the [Done capture import-list stories](#split-done-mark-decision-from-store);
the analysis and decisions are recorded there.

- **Goal.** Dashboard maintainers read a Done capture case as one built
  scenario. A spec imports `makeMe` and the production entry it proves,
  not a list of support verbs.
- **Scope.** Turn `anEstablishedSession`, `aDefaultLaunch`,
  `anIsolatedLaunch`, `aDeclaringLaunch` and `historyBeforeTheCase` into
  domain-named steps of the MakeMe launch and repository builders. Give the
  case one object that carries its checkout, record and timeline, so calls
  no longer thread `checkout` and `record` separately and launch and Done
  times are visible in the case. Shrink `doneCaptureCase.ts`,
  `reportedDoneCase.ts` and the remaining spec-local helpers to what MakeMe
  cannot hold. Add no new support wrappers.
- **Key examples.**
  - `ad-hoc-session-branch-entry.spec.ts` imports no names from
    `doneCaptureCase.ts` beyond a case builder, and has no spec-local setup
    helpers.
  - A case states its launch and Done times in its own builder chain.
- **Evaluation.** Imports per spec, support lines and spec lines before
  and after, under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- **Effort hypothesis.** S–M, one plan.

<a id="optimize-done-capture-family-cases"></a>

### Bring the Done capture family's cases to 100–200 ms

**Identity:** SEED-413#optimize-done-capture-family-cases
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#optimize-done-capture-family-cases","dependencies":[{"supplier":{"identity":"SEED-413#split-done-mark-decision-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store"},"implementation":"Typed Done transition, Git branch-result capture, and review cases composed from Done state.","rationale":"Profiling the old review setup would measure machine-store writes and Done replay that this story removes.","condition":"The typed Done transition and Git capture are separate from the store adapter, and review-topic cases use composed Done records without replaying the store-backed Done action.","state":"waiting"},{"supplier":{"identity":"SEED-413#split-branch-entry-proposal-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store"},"implementation":"Typed branch-entry proposal, production pin-ref query, and review cases composed from branch-entry state.","rationale":"The optimization needs to measure the branch-entry setup that remains after repeated store-backed entry actions are removed from review cases.","condition":"Branch-entry proposals are separate from persistence, the session pin-ref query is available, and cases where branch entry is a precondition use composed branch-entry state.","state":"waiting"},{"supplier":{"identity":"SEED-413#fold-done-capture-launches-into-makeme","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme"},"implementation":"Done capture launch cases built through domain-named MakeMe steps.","rationale":"The launch arrangement changes the setup that the optimization measures, so the remaining costs need to be established with the delivered builders.","condition":"The Done capture cases use MakeMe launch and repository steps, with the checkout, record, and timeline carried by one case object.","state":"waiting"}]}
```

Follows the [Done ad hoc observation and publication move](#arrange-done-ad-hoc-observation-and-publication),
which made its ten cases plain Vitest, about twice as fast as their
Playwright versions.
Queued after the three [Done capture import-list stories](#split-done-mark-decision-from-store),
which move most of the family off the machine store and the replayed
actions. Profile what remains after them.

- **Goal.** Dashboard maintainers get Done capture proof that runs at about
  100–200 ms per case and passes reliably under local load. The family's
  cases now take about 1–2 s each at load 6–12 and 3–5 s at load 14–16. Under
  Vitest's 5 s default, two or three of them time out at that load. Hosted CI
  runs them in under 1 s.
- **Scope.** The Git-heavy Done capture family under
  `dashboard/backend-tests/review/` and `dashboard/backend-tests/launches/`,
  and its shared support, `doneCaptureCase.ts`, `doneCaptureReview.ts`,
  `doneBranchObservation.ts`, `declaredBranchCase.ts`,
  `declaredPublisherBranch.ts`, `installedPublisher.ts` and
  `adHocBranchRefs.ts`. Profile where checkout creation, checkout work,
  production Done capture, observation and review reads spend each case's
  time, then cut the cost while keeping real Git, the production handlers and
  every assertion. Shared fixtures, cheaper Git setup and production seams
  that do avoidable work are all in scope. Raising timeouts is out of scope.
- **Key examples.**
  - A Done branch capture with a real merge and a typed review read finishes
    within about 200 ms at low load.
  - At load 15 or more, the family passes several runs in a row at
    `--workers=2` with no timeout.
- **Evaluation.** Use [`dough-test-optimization`](../../.claude/skills/dough-test-optimization/SKILL.md)
  and the [`done-capture-family-timeout-margin`](../TEST-OPTIMIZATION-CANDIDATES.md#done-capture-family-timeout-margin)
  candidate. Compare per-case durations against the current family at the
  same worker count and load, under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
  If 100–200 ms is not reachable, report the measured floor and the cost that
  remains for each case. Explain why it cannot be removed without losing
  protection, and give the margin the family reaches instead.

<a id="renovate-later-dashboard-backend-unit-test-families"></a>

### Renovate the later dashboard backend unit-test families around typed server handlers

**Identity:** SEED-413#renovate-later-dashboard-backend-unit-test-families
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Split from `SEED-413#renovate-remaining-dashboard-backend-unit-tests`, which
kept the [completed Done capture family](https://github.com/terryyin/open-dough/blob/8f4cc9480ccb0b736e3b29c787ab49a6ac80d366/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-dashboard-backend-unit-tests).

- **For / why.** Developers changing `dashboard/server/` get fast,
  compile-time-checked unit tests for every remaining family: plain Node
  Vitest cases that call strongly typed handlers directly with MakeMe domain
  state and real Git and file collaborators. The campaign ends when
  `dashboard/backend.playwright.config.ts` and the backend request and server
  wrappers in `dashboard/test-support/` are deleted.
- **Evaluation.** Split one family at a time when it is reached, each sized
  to one plan. A family is the cases that share a typed handler and its
  arrangement; a feature folder holds several (`review/` alone holds seven).
  For each family:
  - Keep wire transport thin over exported strongly typed handlers sharing
    one typed contract with `dashboard/src/`. At planning, name the production
    entry and the data and collaborators each variant uses. Unit cases
    [call that entry directly](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
    with those inputs. Resolve request context and process-wide state in the
    adapter. Keep each domain shape on its MakeMe builder.
  - Give each behavior one owner. Move single-service cases to plain Node
    Vitest through the handlers. Downgrade a wire check to a unit case of
    the adapter's request admission with typed request values. Upgrade it to
    an `e2e/` journey only when a started server is essential. Drop a case
    another group already owns. No case in this collection starts a server,
    mounts a boundary or runs on Playwright.
  - State arrangement through MakeMe. Driving a launch to arrange a review
    costs 6–13 s per case in CI against about 1 s from kept records, so the
    handler seam alone leaves most of a launch-arranged family's time in
    place.
  - Delete retired `dashboard/test-support/` wrappers, add none, and leave no
    behavioral regression gap.
- **Revisit the completed Story Notes pilot.** The
  [handler](../../dashboard/server/storyNotes.ts) chooses its file through the
  machine home, so the [unit test suite](../../dashboard/backend-tests/review/story-notes.spec.ts)
  changes `process.env.HOME` for every case. Let the production caller bind the
  default notes store and the suite supply its own temporary notes file or
  file-backed store explicitly. Run the existing persistence, isolation and
  unreadable-file cases against real files with the process home untouched.
  Its request admission is already a unit case (`story-notes-request.spec.ts`).
- **Order.** Highest CI seconds first among the families whose seam the
  earlier ones have shown, as a railway converts its busiest lines first
  while both gauges run. The count of specs still on `@playwright/test` is
  the campaign's progress, and the two-engine group run is its carrying cost
  until that count is zero.
  1. The rest of ad hoc review, which retires `adHocReview.ts`. The branch
     result, its handoff, the Done lifecycle and kept-record release already
     run on Vitest. The observation and publication cases belong to
     [`SEED-413#arrange-done-ad-hoc-observation-and-publication`](#arrange-done-ad-hoc-observation-and-publication).
     "A newer quiet Done takes precedence over a manual mark still capturing
     its branch" stays here, with the developer's native Done in
     `sessions/`. So does the launch-input wiring case of
     `ad-hoc-session-branch-handoff.spec.ts`.
  2. `intent/` landed CI, resolving the load sensitivity of `SEED-324` and
     `SEED-319`. Preserve freshness, invalidation, and close behavior when
     moving reads to typed handler inputs. Check whether those inputs can
     replace the module-level memos in `followUpStory.ts`, `ciProofArtifact.ts`,
     `ciAdapterProof.ts` and `baseCiGithubRevisionLookup.ts`. Give any cache
     the production path still needs an explicit lifecycle owner. The earlier
     analysis includes `LandedCiCollection.close()` (recoverable at
     `6c628be4a:.planning/slice-plans/715-default-dashboard-backend-checks-to-the-mounted-boundary/PLAN.md`).
  3. The remaining families by CI seconds.
- **Family map** (2026-11-19; CI medians over five main runs, 555 files,
  2,519 s; entry kinds counted from each spec's text, so approximate).

  | Folder | Files | CI s | Through a server | Separate process | Direct or no server | Uses a page |
  | --- | ---: | ---: | ---: | ---: | ---: | ---: |
  | `launches/` | 104 | 445 | 59 | 15 | 27 | 3 |
  | `review/` | 64 | 429 | 44 | 11 | 8 | 1 |
  | `intent/` | 110 | 411 | 40 | 13 | 55 | 2 |
  | `usage-history/` | 70 | 349 | 0 | 0 | 70 | 0 |
  | `sessions/` | 76 | 336 | 46 | 11 | 19 | 0 |
  | `observation/` | 56 | 262 | 33 | 15 | 4 | 4 |
  | `runtime/` | 43 | 221 | 6 | 3 | 26 | 8 |
  | `terminals/` | 18 | 48 | 11 | 0 | 7 | 0 |
  | `configuration/` | 14 | 18 | 9 | 0 | 5 | 0 |

  - `usage-history/` already calls server modules directly; its work is the
    engine change and its 349 s is spent below any wire.
  - `runtime/` proves the test runtime itself, including the Playwright
    runners. Those cases retire with the runner they prove; the rest change
    engine.
  - About 68 specs need a separate server process (a signal, a restart, a
    preload, a held connection). Each is downgraded to a unit case of the
    behavior beneath it or, when the process itself is essential, upgraded
    to an `e2e/` journey. None stays in this collection.
  - The 18 specs that open a page belong to `dashboard/frontend-tests/` or
    `e2e/`.
  - 43 of the 445 files in `dashboard/server/` import `node:http` types; the
    domain beneath them is already typed (`AgentLaunches`, the review
    answers), so most seams are an export and a split admission.
- **Alternatives considered.** Changing every spec's engine first while it
  keeps its HTTP entry would retire Playwright early, yet it rebuilds the
  worker fixtures as new test support, gains no speed and touches the suite
  twice. Calling handlers from the Playwright specs first keeps Playwright in
  the group and also touches the suite twice.
- **Effort hypothesis.** L across the suite, as family-sized stories.
- **Safe stopping point.** Every completed family stands on its own with
  faster checks, compile-time contract safety, and fewer `test-support`
  files.

<a id="mount-optimization-candidates-frontend-proof"></a>

### Prove Optimization Candidates in mounted frontend tests

**Identity:** SEED-413#mount-optimization-candidates-frontend-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/733-mount-optimization-candidates-frontend-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b91546e81b7b060b0fb52dc69f7059ea72acbf4a9dd0a13a3b776605fd8d5f6f","plan":"3744673d9d9a3c49a59f823d71a029fd31873e20ad208b5f01152842621cc042"}}
```

Split from the [later frontend families](#renovate-later-dashboard-frontend-unit-test-families).

- **Goal.** Dashboard developers can check what a reader sees in Optimization
  Candidates, where a recorded source opens, and how a failed record recovers
  with a focused Vitest Chromium run. Today six specs arrange a whole dashboard
  with project routes for 12 cases. The revision cases already use a typed
  mount, so this family can remove its remaining built-app arrangements first.
- **Scope.** Move record formats, field order, revision evidence links, tab
  layout and keyboard operation, record availability, opening files and cases,
  and candidate-read recovery. Keep the real record and Project Intent reading
  owners. Keep the revision cases and the composed GitHub timeout journey as
  proof at their current boundaries. Remove the candidate-specific setup whose
  last consumer moves. General Intent locations recovery, Gherkin settings,
  CI views, and frontend runner retirement stay with later families.
- **Key examples.** The CI status tab starts selected. The reader opens
  Optimization Candidates and sees the ordered record for the shown revision
  across the full reading width. A live record and a profile-only mechanism
  show their own fields. Absent, empty, mismatched and unreadable records each
  have distinct wording and the locations remain usable. A configured source
  opens in Purpose at its recorded file or case line, with the tree selected.
  Returning focuses the entry without rereading. Ambiguous and out-of-scope
  sources explain what can be opened. A shorter backoff cannot bypass a
  standing GitHub wait. A refusal or malformed response needs manual Retry.
- **Effort hypothesis.** M, six slices. The mounted revision family and existing
  MakeMe inputs cover the main setup. Recovery needs its shared clock and
  response classification.
- **Evaluation and stopping point.** Compare the same behavior selection at
  two workers with the legacy baseline and inspect the candidate-specific
  arrangements removed. The family passes independently while the remaining
  frontend tests still use both engines.
- **Plan.** [733](../slice-plans/733-mount-optimization-candidates-frontend-proof/PLAN.md)

<a id="mount-open-sessions-sidebar-frontend-proof"></a>

### Prove open Sessions sidebar readings in mounted frontend tests

**Identity:** SEED-413#mount-open-sessions-sidebar-frontend-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/734-mount-open-sessions-sidebar-frontend-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5c0962da863baf6af3dbd979f8dd33c38b7996633dbe65d9c0b6fc88816b0357","plan":"6bcf517712769c27597358af209750f4ec651de2d9124496e3b6bd164fc045c5"}}
```

Split from the [later frontend families](#renovate-later-dashboard-frontend-unit-test-families).

- **Goal.** Dashboard developers can check how the Sessions sidebar presents
  open sessions and machine status from typed inputs in Vitest Chromium.
  Four specs currently build the dashboard and substitute machine and host
  reads for five cases about what the sidebar displays.
- **Scope.** Move open-session ordering and its attention badge, one-line
  title and tooltip, elapsed time, state edges and hidden labels, and
  independently available session and host figures. Existing E2E journeys
  own polling, cross-project navigation, focus return, and touch behavior.
  This story owns these four frontend specs within the session renovation
  coordinated with [SEED-341](SEED-341-simplify-session-tests.md#simplify-remaining-session-tests).
  Recently done and Running Cursor, shared sidebar layout changes, terminal
  and report interactions, and backend observation stay with their existing
  owners.
- **Key examples.** Two sessions need the developer, so their older launch
  comes first, then the remaining open sessions newest first. A working row
  changes to Needs input and moves to its launch position in the attention
  group as the badge rises. A long title truncates on one line beside the
  elapsed age. Its tooltip retains the state, project, workflow and launch
  time. The age changes on the existing tick and shows the largest whole
  unit. The left edge and hidden words distinguish working, attention,
  halted and unsettled states. If disk is unread, CPU and the counts still
  show. If the sessions are unread, host figures still show on their own.
- **Effort hypothesis.** M, five slices. The view already has typed session
  observations and status. The open list needs a narrow render seam and
  Chromium must retain the real row layout and elapsed tick.
- **Evaluation and stopping point.** Compare the focused selection at two
  workers with the legacy baseline, and remove unused arrangement while
  keeping the shared E2E readers. The open-list checks stand on their own.
- **Plan.** [734](../slice-plans/734-mount-open-sessions-sidebar-frontend-proof/PLAN.md)

<a id="renovate-later-dashboard-frontend-unit-test-families"></a>

### Renovate the later dashboard frontend unit-test families

**Identity:** SEED-413#renovate-later-dashboard-frontend-unit-test-families
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Split from `SEED-413#renovate-remaining-dashboard-frontend-unit-tests`, which
moved the Project Intent apply-and-retry cases. The two Optimization
Candidates revision cases already run as mounted cases in
[`intent-candidates-revision.spec.ts`](../../dashboard/frontend-tests/intent/intent-candidates-revision.spec.ts).

**Goal.** Give dashboard developers readable UI unit tests and feedback from
the complete frontend group in roughly a minute at the usual two workers,
including preparation. This carries the suite-wide commitments, including
SEED-404's timing goal and SEED-301's Intent MakeMe work.

**Scope and order.** Select families by feature folder and the interaction
each view owns. First, the
[Optimization Candidates family](#mount-optimization-candidates-frontend-proof)
extends the existing revision mount to the remaining candidate cases. Next,
the [open Sessions sidebar family](#mount-open-sessions-sidebar-frontend-proof)
takes only the open list and its figures, whose E2E wiring already has owners.
Both stand independently. Continue with the rest of Intent and Sessions. Use
the completed
[Project Intent revision family](#project-intent-revision-family-example)
as the reference for the remaining migrations. Keep each legacy case until
its replacement exercises its actual boundary.
Use shared typed Intent inputs in place of `putFrontend*` project arrangements;
coordinate session proof with [SEED-341](SEED-341-simplify-session-tests.md).
The family map includes Navigation, Launches, Review, Configuration, Terminals,
the Stories cases left by the pilot, and the audit of the four test-harness
specs. The root contains no product specs. Reassess the order by measured
cost and which shared contracts are available as families finish.

- Mount the smallest rendered owner with typed inputs. Keep an enclosing view
  when its children coordinate. Its unit test suite should be able to
  [render that view](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
  without preparing answers for unrelated dashboard features. Use the
  backend's existing shared contract where coupled. Preserve distinct assertions and remove a duplicate only
  after locating its equivalent proof. For example, reloading an encoded story
  URL and traversing Back and Forward needs a real E2E browser journey.
  Account for the cost of any checks moved there.
- Render and act in each moved case as soon as the page allows, under
  [Which entry a case uses](../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and the [North Star](../NORTH-STAR.md#act-as-soon-as-the-page-allows-retire-actsettled).
  Remove `actSettled`, React `act` wrapping and `IS_REACT_ACT_ENVIRONMENT`
  from the mounted families already moved (Story Notes, Project CI history,
  the phone board) when the family is next touched. Retire
  `mountedActSettled.ts` and its harness case with `mountedDashboard.ts`.
  When migrating the built-app `intent-read-recovery` and
  `intent-gherkin-settings-problems` specs, replace handwritten locations
  responses with `makeMe.anIntentLocationsAnswer`.
- Retire a feature's app mount, route substitutes and page-object scaffolding
  when their last consumers move. For example, `frontendIntentCi.ts` still
  uses `serveFrontendCiHistory` after Project CI history migrates. Add zero
  new wrappers. Audit harness cases against the product behavior they protect
  before retiring machinery whose only checks exercise the harness itself.
- At the last frontend migration retire `frontend.playwright.config.ts`,
  frontend dual-engine dispatch and its
  dedicated selection/output glue, `frontendApp.ts`, `mountedDashboard.ts`,
  `frontendServiceSubstitutes.ts` and spent `frontend*Rule.ts` modules.
  Preserve shared runner behavior still used by the backend, the frontend npm
  command, filtering, listing, worker budget, shards, timings and CI proof.
  `@playwright/test` remains the E2E runner. The frontend group runs entirely
  on plain Vitest with headless Chromium.
- Finish by comparing a full two-worker run against the baseline below and
  checking the surviving behavior and support surface. A fast filtered run
  already helps one developer on one family. It cannot measure the cost of
  the full group. Each completed family delivers usable feedback on its own.
  Effort L across families, to be refined as each one is reached.

#### Project Intent revision family example

All nine cases in the six `intent-revision-*.spec.ts` files now use mounted
Chromium (`def2a68c3)). The [fixture](../../dashboard/frontend-tests/intent/intent-revision-fixtures.ts)
mounts the real `ProjectIntentReading` with the production reading place and
typed locations and file replies. Reopen and project-switch cases exercise that
reading place. Deferred replies live in the cases that need to observe a
pending read.

The [failed-update case](../../dashboard/frontend-tests/intent/intent-revision-update-failures.spec.ts)
keeps one file switch to prove the old tree stays usable, then verifies that
the notice's Retry loads the new revision and its source. The
[source-target recovery cases](../../dashboard/frontend-tests/intent/intent-source-target-recovery-mounted.spec.ts) own the
separate file Retry across revisions. The [Project Intent visit E2E](../../e2e/intent/intent-project-visit-ci.spec.ts)
proves **Show latest** advances the revision through the composed dashboard.

On 2026-11-20, three interleaved warm runs of
`npm run test:dashboard:frontend -- intent/intent-revision --workers=2`
at `b21c3231b` and the equivalent tested candidate `868250005` gave median
command elapsed times of 6.20 s and 3.49 s. The failed-update case took 519 ms
and 361 ms. The simpler Show latest case had overlapping timing ranges. The
focused selection measures the benefit of removing the last built-app cases
from that command. The full-group goal still needs a full-group measurement.

#### Rework from the completed frontend families

- **Story Notes control.** The [mounted control suite](../../dashboard/frontend-tests/stories/story-notes-control.spec.ts)
  builds a page-wide project map and passes the project key again to render
  one story's control. Have the production page resolve the project's shared
  notes state and let the suite render the same control with that state
  explicitly. Keep the refresh and late-read-after-save cases on the real
  subscribed state. The dialog already renders from notes and callbacks.
- **Project CI history.** [JudgedBranch](../../dashboard/src/IntentCiJudgedBranch.tsx)
  requires the judgment hook's refresh `round` for rendering. The evidence
  reader uses that field and the panel never reads it. Narrow the panel's
  typed input so its suite can omit the round. Move the seven gap rows,
  run links, keyboard traversal within the
  history, and phone overflow proof in the [gap-only case](../../dashboard/frontend-tests/intent/intent-ci-wall-time-history-gaps.spec.ts)
  to the history-only mount already demonstrated by the
  [evidence suite](../../dashboard/frontend-tests/intent/intent-ci-wall-time-history-evidence.spec.ts).
  It should need only the history reading. Keep the [panel cases](../../dashboard/frontend-tests/intent/intent-ci-wall-time-history.spec.ts)
  that prove judgment and Proof beside history, including keyboard movement
  from **Check again** to **Builds and evidence**.

#### Frontend campaign baseline

At `267a27502` there are 304 frontend spec files, including nine
`.mounted.spec.ts` files. The root holds no specs. The CI proof also names
five Intent modules that register cases for other spec files. The frontend
sources match the measured revision. Summed case time identifies expensive
families. The campaign's roughly one-minute goal is elapsed time for the
complete local group at two workers, including preparation.
[CI run 44503789713, attempt 1, frontend-test-proof artifact](https://github.com/terryyin/open-dough/actions/runs/44503789713/artifacts/14518967274)

| Folder | Specs | Cases | CI summed seconds | Local summed seconds |
| --- | ---: | ---: | ---: | ---: |
| Intent | 110 | 249 | 321.3 | 214.2 |
| Navigation | 49 | 123 | 282.4 | 212.3 |
| Sessions | 46 | 97 | 164.2 | 108.4 |
| Launches | 29 | 81 | 125.6 | 74.7 |
| Review | 21 | 47 | 98.7 | 75.8 |
| Configuration | 19 | 49 | 95.0 | 64.1 |
| Terminals | 12 | 41 | 81.4 | 58.4 |
| Stories, including the Story Notes pilot | 14 | 28 | 34.2 | 26.3 |
| Test harness | 4 | 16 | 4.2 | 3.6 |

The local baseline on 2026-11-19 at `267a27502` was **7 min 15 s** for
the complete command. All 731 cases passed on the first attempt (837.8
summed case-seconds). This was one run after focused checks in this
worktree, using `caffeinate -s -i npm run test:dashboard:frontend -- --workers=2`
on AC power. Natural one-minute load was 5.83 at start and 4.80 at finish.

A scratch experiment in this checkout ran 24 copies of one history-render
case at two workers. It took 3.63 s wall in separate files and 2.32 s together.
This establishes a file cost for that component. Measure the full group to
judge the campaign outcome.
