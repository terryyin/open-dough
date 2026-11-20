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

<a id="ad-hoc-branch-result-handoff"></a>

### Prove the ad hoc branch result and its handoff at typed Done seams

**Identity:** SEED-413#ad-hoc-branch-result-handoff
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/732-ad-hoc-branch-result-handoff/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ebf3fb318afd895476bc42a18fa3ec72a404a73739465cad9f8650f494e7cda3","plan":"4ddbd6a0939b85dffbc7a474458173278116a839fa8c9faf7bfb200c30e985ff"}}
```

Split from
[`SEED-413#renovate-later-dashboard-backend-unit-test-families`](#renovate-later-dashboard-backend-unit-test-families)
on 2026-11-20 as the first of its ad hoc review families.

- **Goal.** Developers changing how Done saves an isolated or declared
  branch get plain Node Vitest cases that call `setRecordDoneAt`,
  `recordSessionBranchEntry`, `replaceKeptSession`, `bindRecord` and
  `deleteRecord` directly with MakeMe kept records and real Git. Today these
  nine cases start the boundary server, launch sessions, run the reporting
  CLI and hold Git through a `PATH` shim: 41 s summed in CI run
  44698610582, against 0.2–2.5 s for the moved cases of the Done capture
  family.
- **Scope.** Move these cases, keeping each one's distinct inputs and
  expected outcomes:
  - `review/ad-hoc-branch-result-race.spec.ts`: reopening keeps the branch
    evidence and refuses the old file pair; while a stale Done's capture is
    held the review is unavailable, and a newer Done wins with only its pins;
    deleting a record while its capture reads leaves no pins.
  - `review/ad-hoc-branch-worktree-result.spec.ts`: Done keeps the working
    tree it read (staged, untracked and deleted files, not ignored ones)
    without touching the index, HEAD or files; an edit made while the capture
    is held is excluded; the result survives a forced retirement.
  - `review/ad-hoc-session-branch-handoff.spec.ts`: a declared branch keeps
    its entry state and default tip, and answers the same entry after main
    moves; a foreign clone, a wrong branch for the worktree, or a second
    different entry is refused; an undeclared checkout move explains the
    missing branch association.
  - `review/ad-hoc-branch-cursor-recovery.spec.ts`: after Cursor replaces its
    chat, the branch pins stay owned by the original chat, and deleting or
    expiring the replacement releases only them; a stale native replacement
    keeps a branch identified while it was pending.
  - A capture is held by a typed ancestry read that the production capture
    accepts, in place of the `PATH` shim.
  - Drop `review/ad-hoc-branch-result-quiet-retry.spec.ts`: the applied
    duplicate retry returns before any capture, and
    `sessions/agent-completion-identity.spec.ts` already proves that it
    writes nothing.
  - Retire each `dashboard/test-support/` module or export whose last
    consumer leaves, starting with `cursorBranchRecovery.ts`. Add none.
  - **Scope limits.** "A newer quiet Done takes precedence over a manual mark
    still capturing its branch" stays in the parent story with the
    developer's native Done. So does the handoff case that runs the generated
    branch handoff command from the launch input. That command is an inline
    script that posts over HTTP, and the arrange-done plan relies on this case
    as the wiring's owner. The observation and publication cases stay with
    [`SEED-413#arrange-done-ad-hoc-observation-and-publication`](#arrange-done-ad-hoc-observation-and-publication),
    and the Done lifecycle with
    [`SEED-413#ad-hoc-done-lifecycle`](#ad-hoc-done-lifecycle).
- **Key examples.**
  - *A newer Done wins.* An isolated launch commits `stale` and is marked
    Done; its capture is held. The review reads unavailable. The branch
    commits `latest` and is marked Done again. Once the hold is released, the
    review shows the branch result at `latest`, and the session's pins are the
    baseline and `latest`, never `stale`.
  - *Cursor replacement.* A Cursor launch's branch result pins under chat
    `A`. Cursor replaces the chat with `B`. Deleting `B` removes `A`'s pins
    and leaves another launch's pins.
  - *Undeclared move.* A Default main launch switches to `not-identified`
    and commits there, then is marked Done. The review explains: "No branch
    was identified for this session, and no Default main commits were
    captured."
- **Effort hypothesis.** M: five slices.
- **Plan.** [732](../slice-plans/732-ad-hoc-branch-result-handoff/PLAN.md)

<a id="ad-hoc-done-lifecycle"></a>

### Prove the ad hoc Done lifecycle and kept-record release at typed seams

**Identity:** SEED-413#ad-hoc-done-lifecycle
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/731-ad-hoc-done-lifecycle/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4853a9cd7f22c81bd05c1d1f33556c456ebbcea798dbd6915864b7021b1a57e6","plan":"f77da97a37e1c5a9ab9cb227b74dc94c1162c62f75471bc1be56958407593107"}}
```

Split from
[`SEED-413#renovate-later-dashboard-backend-unit-test-families`](#renovate-later-dashboard-backend-unit-test-families)
on 2026-11-20 as the second of its ad hoc review families.

- **Goal.** Developers changing what a Default main session keeps at Done,
  and what a record releases when it leaves, get plain Node Vitest cases
  that call `deliverCompletion`, `NativeDoneMarks`, `setRecordDoneAt`,
  `readSessionCommits`, the typed review and `deleteRecord` directly with
  MakeMe kept records, attempts and real Git. Today these fourteen cases
  start the boundary server, run the reporting CLI, hold the reflog through a
  `PATH` shim and close servers: 23 s summed in CI run 44698610582.
- **Scope.** Move these cases, keeping each one's distinct inputs and
  expected outcomes:
  - `review/ad-hoc-session-commits.spec.ts`: a quiet report marks Done at its
    receipt time and keeps the session's commits.
  - `review/ad-hoc-session-commits-done.spec.ts`: a reopened session keeps
    its earlier capture until its next Done; a quiet report after a confirmed
    native Done keeps the additional commit; a quiet report during an earlier
    rename wait refreshes the capture; retrying the same quiet delivery
    resumes native Done without reading the checkout again; a rename wait
    that the closing dashboard abandons still keeps the commits.
  - `review/ad-hoc-session-commits-pending-done.spec.ts`: a later Done whose
    capture has not finished refuses the previous review and its files, and
    does not inherit its "no commits" finding; a commit that arrives after
    Done's tip is read is excluded.
  - `review/ad-hoc-review-unavailable.spec.ts`: a launch in a checkout Git
    cannot read keeps no start. Its Done and review halves are already owned
    by `done-kept-session-unavailable.spec.ts` and
    `ad-hoc-review-kept-unavailable.spec.ts`.
  - `review/kept-commits-release.spec.ts`: deleting or expiring a record
    removes its session-run and landing references and leaves another kept
    record's; a record whose saved repository is gone still deletes and
    expires.
  - `NativeDoneMarks` takes the host lookup and reporting folder it uses as
    typed collaborators, and a case can await a report's continuation.
  - Retire each `dashboard/test-support/` export whose last consumer leaves,
    starting with `DefaultMainSessionWork.launchReporting`. Add none.
  - **Scope limits.** The developer's native Done, including "a newer quiet
    Done takes precedence over a manual mark", and the other `sessions/`
    completion cases stay in the parent story. The branch result belongs to
    [`SEED-413#ad-hoc-branch-result-handoff`](#ad-hoc-branch-result-handoff).
- **Key examples.**
  - *Quiet report.* A Default main launch reporting through reference `R`
    commits `typo`. A quiet completion for `R` is delivered. The record is
    Done at the receipt's `receivedAt`, and the review shows one commit run
    with `typo`.
  - *Abandoned rename.* A quiet report's native rename is still waiting
    when the dashboard closes its Done marks. The rename stops, and the
    record keeps the commits read at that Done.
  - *Stale capture.* A record whose commits were read before its latest Done
    refuses the review of the previous capture and its files.
  - *Release.* Two kept records pin session runs and a landing comparison in
    one repository. Deleting one, or letting it expire, removes only its
    references.
- **Effort hypothesis.** M: six slices.
- **Plan.** [731](../slice-plans/731-ad-hoc-done-lifecycle/PLAN.md)

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
     result with its handoff moved to
     [`SEED-413#ad-hoc-branch-result-handoff`](#ad-hoc-branch-result-handoff)
     and the Done lifecycle with record release to
     [`SEED-413#ad-hoc-done-lifecycle`](#ad-hoc-done-lifecycle). The
     observation and publication cases belong to
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
each view owns. Continue in Intent and Sessions. Use the completed
[Project Intent revision family](#project-intent-revision-family-example)
as the reference for the remaining migrations. The other Optimization
Candidates cases remain in scope: record content, opening sources, record
states, live records and read recovery. Keep
each legacy case until its replacement exercises its actual boundary.
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
