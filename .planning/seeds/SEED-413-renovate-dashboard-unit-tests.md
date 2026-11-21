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
[launch flavors as MakeMe steps](#fold-done-capture-launches-into-makeme).

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
    [the family's timeout margin](#optimize-done-capture-family-cases).
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

<a id="reduce-review-diff-reading-to-logic-cases"></a>

### Test Review diff reading's data logic directly and drop "mounted" from frontend test names

**Identity:** SEED-413#reduce-review-diff-reading-to-logic-cases
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/744-reduce-review-diff-reading-to-logic-cases/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"90187512643b11598fc9981b2275ea684797ad83d5ce8e3947a99c0918051aa1","plan":"8018ccfe97b91df64a91501c50dfb12b99b336825dec33b816fff937e9094963"}}
```

Requested by Terry on 21 November 2026 after
SEED-413#mount-story-review-diff-reading landed (`2d1e73020`).

- **Goal.** Dashboard maintainers read Review diff reading's domain rules,
  such as which grammar a file path or hint selects and which words a
  changed block emphasizes, as fast logic cases with no component mounted.
  Frontend unit test file names say what they test, not how. The new and
  changed cases each run under 500 ms, around 100 ms.
- **Scope.**
  1. Data logic as logic. `story-review-diff-syntax-paths-mounted.spec.ts`
     mounts a diff only to check path-and-hint grammar selection. Replace it
     with cases over the selection logic directly. Audit the whole Review
     diff syntax and emphasis scope (`dashboard/frontend-tests/review/story-review-diff-*`
     and their support) for other cases that check data logic with a clear
     domain meaning through UI elements, and reduce each to the logic it
     names. Cases that check rendering, appearance or arrival behavior stay
     mounted.
  2. Names. Remove `-mounted` from every frontend unit test file name (27
     files in `review/` and `intent/` at `846c4db58`). Whether a case
     mounts is visible in the file. Where a renamed file meets a remaining
     built-app spec of the same name (for example
     `story-review-diff-syntax-appearance` and `-syntax-arrival`), combine
     or rename by what each tests rather than by its runner; built-app
     Playwright specs are being retired anyway.
  3. Speed. Bring each new or changed case above 500 ms to under 500 ms,
     aiming at about 100 ms. The [Review diff reading baseline](#review-diff-reading-after-migration)
     names the slow mounted cases (`syntax-mounted` 672 ms, `syntax-arrival`
     473 ms, maximum attempt 761 ms); measure the renamed Intent files the
     same way.
  4. Boundaries. `test-harness/mounted-dashboard.spec.ts` tests the
     mounted-dashboard harness itself, so its name names its subject and
     stays. Case and helper modules beside the renamed specs that name their
     runner (`mountedComparison*Cases.ts`, `mountedFileDiff.ts`,
     `mountedReviewDiffPage.ts`) follow the same naming rule. The shared
     harness under `dashboard/test-support/mounted-dashboard/` is out of
     scope. Rendering promises that the reduced cases leave, such as
     underline decoration, plain copy and grammars that actually load for
     every selected language, keep one mounted or logic case each rather
     than disappearing with the reduced cases.
- **Key examples.**
  - `a.mts` selects TypeScript, `A.java` Java, `settings.yml` YAML, and
    `notes.txt` no grammar, read from the path alone with nothing mounted.
  - A rename from `old.txt` to `new.ts` selects TypeScript from the new
    path; `new.txt` renamed from `old.ts` selects none.
  - `scripts/setup.test` with hint `shell` selects shell; with hint
    `unfamiliar-language` it selects none; `lib/app.ts` with hint `shell`
    keeps TypeScript because the path wins.
  - `const limit = 20;` changed to `const limit = 25;` emphasizes `20` as
    deleted and `25` as inserted; a low-similarity rewrite, a pure addition
    and a several-hundred-line block emphasize nothing. These read as
    ranges from the emphasis rule, not from rendered marks.
  - A removed line reads its tokens from the old side and every other line
    from the new side; a comment opened above a hunk styles the hunk's
    lines. This is checked over token lines, while colour contrast and
    appearance stay mounted.
  - `story-review-diff-syntax-appearance-mounted.spec.ts` and the built-app
    `story-review-diff-syntax-appearance.spec.ts` end with names that say
    what each checks, such as in-diff token appearance versus agreement with
    Intent's source reading, and no name says `mounted`.
  - The Intent comparison specs keep their cases and lose `-mounted`. Their
    measured cases (93, median 125 ms) already pass except
    `intent-ci-comparison-mounted-scope-running` "Landed running preserves
    one Branch fallback through entry, folders and file Proof" (median 604
    ms, three runs on 21 November 2026 at load about 9–10), which comes
    under 500 ms.
- **Acceptance.** No frontend unit test file name contains `mounted` apart
  from the harness's own spec; the grammar-selection and other audited data
  rules are proved without a mount; every case in the touched files has a
  median of three attempts under 500 ms, recorded per case as in the
  baseline table.

<a id="correct-landing-record-writes-and-tests"></a>

### Keep kept records intact through landings and prove it at the landing adapter

**Identity:** SEED-413#correct-landing-record-writes-and-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/745-correct-landing-record-writes-and-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"64260086789f76c49b4a4a6a390fe138db4ff1e4067e67a89fceea245bc42594","plan":"937fc19fdc243a92b45e6c6fd7b5fa553d074d77fd666c29f2ef9552cfd3af89"}}
```

Correction from the critical review of
SEED-413#decide-landings-over-typed-attempts-and-records (landed at
`4a5ceb24a`; its plan 738 is recoverable at
`086faa5a2:.planning/slice-plans/738-decide-landings-over-typed-attempts-and-records/PLAN.md`).

- **Goal.** Developers keep every launch record a landing or branch handoff
  does not own, and dashboard maintainers prove landing persistence at the
  landing adapter over the real record-store semantics, with MakeMe-built
  cases.
- **Review evidence.**
  - `persistSourceRecords` (`dashboard/server/launchLandingReporting.ts`)
    writes `[source]: nextRecords` built from `keptRecords()`, which keeps
    only session records. A scratch case with a declared landing and an
    unresolved creation record in the same project ended with one record
    after one `prepare`: the creation record was deleted.
  - The attempt path writes that snapshot after `pinLanding` and
    `registerFollowUpReceipt`, so record changes in between (Done marks,
    deletions, new sessions) are overwritten or moved to history as
    `removed`. Not reproduced.
  - `submitSessionBranchEntry` saves `acceptBranchLandingAnswer`, which
    replaces the current record with one built from the pre-entry snapshot
    (it can clear a concurrent Done mark), and answers `landingContext` even
    when the save kept another context.
- **Scope.**
  - Production: the landing decision answers record changes that the
    adapter applies inside `replaceRecords`; the branch-context save merges
    only `landingReporting` into the current record, rechecks `doneAt` and
    `branchEntry`, and answers the file only when saved. Retire the
    test-only re-export of `decideAttemptLanding`, the duplicate retained
    lookup in `handleLanding`, and the unused `LandingDecision.path`. The
    decision takes "now" from `receivedAt` instead of `Date.now()`, and
    takes a typed input in place of seven positional arguments. Landing
    admission accepts what `verifyLocalOrigin` accepts and answers 405
    before 415, as before.
  - Tests: `composedLandingStores` applies writes the way the record store
    does (session records only through `keptRecords`, retention, creation
    records kept); Done in composed cases goes through production
    `setRecordDoneAt` in place of the test's own `markDone`; persistence
    cases run through `handleLanding` with composed stores, including a
    creation record and a record changed between deciding and saving.
    Decision cases keep only refusals, through `decideLanding`, as
    `test.each` tables; admission refusals the same. The helpers in
    `attemptLandingDecisionCase.ts` become MakeMe steps or named examples,
    with one declared-landing example in place of `aDeclaredRecord` and
    `aComposedDeclaredLanding`. Drop assertions that restate inputs. Record
    deletion in `declared-blank-launch-publication` acts on the record that
    holds the landing.
- **Key examples.**
  - A project keeps a declared-landing launch and an unresolved creation
    record. One `prepare` for that launch → both records stay; only the
    landing launch gains its preparation.
  - An attempt-path landing is decided while another session in the same
    project is marked Done → after the record write, that session keeps its
    Done time and nothing moves to history as `removed`.
  - A branch handoff copies the landing context while the same session is
    marked Done → the saved record keeps `doneAt`, gains no landing
    reporting, and the answer carries no `landingContext`; without the
    concurrent change it answers the saved file.
  - A same-origin landing request that `verifyLocalOrigin` admits through
    `Sec-Fetch-Site: same-origin` without an `Origin` header is accepted; a
    GET with a non-JSON content type answers 405, not 415.
- **Acceptance.** A landing or branch handoff leaves every other kept record,
  including creation records and concurrent changes, as it was, proved at
  `handleLanding` and the branch handoff's typed entry; reverting either
  write fix in a scratch edit fails its case. No backend-test support writes
  Done. The decision specs import no data helper from support beyond MakeMe.

<a id="restore-done-capture-proof-after-composed-reviews"></a>

### Restore Done capture proof and focus session Review tests

**Identity:** SEED-413#restore-done-capture-proof-after-composed-reviews
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/743-restore-done-capture-proof-after-composed-reviews/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4a86e7b26b66316ea4d7db66b392daf011d218c52ed55dc44eed64fe47830c50","plan":"5dbeeac03d5719bf3be3522198cbe46a7e41bd2e3bec5a331e439f08f5b7bce2"}}
```

Correction from the execution retrospective of
SEED-413#split-done-mark-decision-from-store (story at
`6250b7399:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md`).

- **Goal.** Dashboard maintainers can change Done capture, persistence, or
  session Review rules by updating the proof of that behavior. Restore proof
  of real Git reflogs, shared checkouts, capture through branch entry,
  prepared receipts, and retention of both branch and delivery evidence.
  Reduce the number of cases and full Review reads while preserving distinct
  regression protection.
- **Scope.** Prove capture and attribution from their own results, writes and
  races from the saved session and Git pins, and comparison selection and
  file admission from composed retained evidence. Keep representative reads
  that establish evidence actually survives retirement or pruning. Resolve
  the requested session at the production Review boundary and give the
  comparison and file handlers that session's record. Retire the procedures
  that imitate Done or route unrelated tests through Review. Branch entry,
  observation and landing store reads, and the launch preset fold stay with
  their stories.
- **Key examples.**
  - A Default main launch amends work and rebases it onto a pulled trunk
    commit. The real Git reflog yields the surviving session run. If the
    launch enters a branch before Default main advances again, its saved
    Default main capture ends at the recorded entry tip.
  - Two launches overlap in one Default main checkout. Marking one Done
    stores its captured run with the shared-checkout flag.
  - An accepted branch tip has a prepared receipt when the session is marked
    Done. The saved branch result and prepared receipt remain together,
    and recording uses that receipt. With a verified manual merge and no
    prepared receipt, Done saves and pins both the branch and delivery pairs.
  - A working file changes after Done snapshots it and before Done settles.
    The earlier bytes are still readable after the worktree is retired.
  - Two hosts have the same native session ID. Review comparison and file
    reads select the record for the requested host and use its retained
    run and literal file pair. Admission preserves the existing refusals
    for unknown sources, missing sessions, and story launches.
- **Plan.** [743](../slice-plans/743-restore-done-capture-proof-after-composed-reviews/PLAN.md)

<a id="fold-done-capture-launches-into-makeme"></a>

### Build Done capture cases from MakeMe launch steps

**Identity:** SEED-413#fold-done-capture-launches-into-makeme
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#fold-done-capture-launches-into-makeme","dependencies":[{"supplier":{"identity":"SEED-413#split-done-mark-decision-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store"},"implementation":"Composed typed Done state for the Done capture family.","rationale":"The case preset must supply the delivered review input and timeline. Folding the present keep-and-mark setup would embed the store replay this story is meant to remove.","condition":"MakeMe can compose a Done record with captured branch or commit evidence, and the review-topic Done capture cases accept composed records.","state":"satisfied","resolution":{"revision":"6250b73992afc1df2fd9b12bb502008527e568d6","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store","summary":"Satisfied at integration 2a7260d6d: MakeMe composes Done records with captured evidence (keptSessionCommits, sessionCommitsFailedAt, branchResultFrom, branchResultFailedAt with markedDone/markedDoneAt), and review-topic Done capture cases take composed records through doneCaptureReview.ts (plan 734 slices 4–7). Restoring the adapter proof those moves dropped is queued first as SEED-413#restore-done-capture-proof-after-composed-reviews.\nCondition satisfied: MakeMe can compose a Done record with captured branch or commit evidence, and the review-topic Done capture cases accept composed records.\nAccepted integration: 2a7260d6d2596365b432d11731b6b57d01dc0f0f on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#split-branch-entry-proposal-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store"},"implementation":"Typed branch-entry proposal and composed branch-entry preconditions.","rationale":"The declaring-launch recipe needs the delivered branch-entry value and a separate operation for cases that prove keeping it. Folding the old helper would hide the operation that the handoff cases observe.","condition":"The branch-entry proposal is callable separately from persistence, and review and publisher preconditions can be composed with a typed branch entry.","state":"satisfied","resolution":{"revision":"9969388902eb48c56588d9a1d30f45d8be6ac4b3","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store","summary":"Directly satisfied. proposeBranchEntry (dashboard/server/branchEntryProposal.ts) proposes from the trunk ref, typed LaunchRecord and place with no store, and recordSessionBranchEntry alone keeps the entry and its pins; makeMe.aLaunchRecord(...).enteredBranch(entry) composes the entry, used by the review, attribution and declared publisher preconditions (ad-hoc-session-branch-entry, ad-hoc-branch-entry-attribution, support/declaredPublisherBranch.ts). Proved by branch-entry-proposal.spec.ts and hosted CI run 44783274270 on e8b7e417.\nCondition satisfied: The branch-entry proposal is callable separately from persistence, and review and publisher preconditions can be composed with a typed branch entry.\nAccepted integration: e8b7e4170c63f978270efba32e2396989fd555a1 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#observe-done-deliveries-over-typed-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records"},"implementation":"Delivery observation over typed Done records with a separate store adapter.","rationale":"The two-branch preset supplies the delivered decision input. Reusing the ambient-store preset first would encode the store effects in the shared builder and require rebuilding it around the typed boundary.","condition":"Observation decides delivery from typed kept records with real Git inspection, and the store adapter separately owns persistence and lifecycle races.","state":"waiting"},{"supplier":{"identity":"SEED-413#decide-landings-over-typed-attempts-and-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records"},"implementation":"Composable landing attempts and launch records with production request admission for the installed publisher.","rationale":"Both publisher recipes must share the delivered reporting values. Composing the current machine-store setup would put staging effects or the duplicate receiver behind a new builder API.","condition":"Landing preparation and recording take typed attempts and records, MakeMe can compose their shared reporting context, and the publisher bridge uses production request admission.","state":"satisfied","resolution":{"revision":"086faa5a284a7030a101032405772eff1cf69077","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records","summary":"Directly satisfied. SEED-413#decide-landings-over-typed-attempts-and-records delivered decideLanding over composed attempts/records, LandingStores on handleLanding, caller-directed branchLandingContext, admitLandingRequest, and the installed-publisher bridge on production admission with composed stores. Key examples and Intent Coverage Caught at 233d31e6c (ad-hoc-prepared-landing-done). Approved remainders (HOME for blank/worktree machine deletion; 29 server specs; local LandingStores until ObservedLandingStore) do not block this condition. Recoverable story/plan at 086faa5a; accepted on origin/main at 4a5ceb24.\nCondition satisfied: Landing preparation and recording take typed attempts and records, MakeMe can compose their shared reporting context, and the publisher bridge uses production request admission.\nAccepted integration: 4a5ceb24a2d50569dfe181e16a1a6a6b1efa9798 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/737-build-done-capture-cases-from-makeme/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b3b1c66d77ad4ac0d8c2fabeb17e8db63c72660ba88abe160c729ea62aeefe46","plan":"c1abc4a8a650d6c785a986242adbd16c19a629505b1120cfd5dba973c596bcd6"}}
```

Fifth of the [Done capture import-list stories](#done-capture-import-list-analysis);
which records the initial analysis and the decision to fold the final typed
arrangements after the four preceding renovations.

- **Goal.** Dashboard maintainers can read a Done capture case from its
  MakeMe setup through the production entry and assertions. One scenario value
  carries the checkout, its launch record or records, and the timeline so a
  maintainer can see which work occurred during each launch.
- **Scope.**
  - Move the established Default main, blank Default main, isolated and
    declaring launch presets onto the existing launch builder. Give the
    repository builder the shared pre-launch history and use the real checkout
    fixture to materialize named worktrees, with an origin where the case
    publishes. State launch and Done times at the call site and retain the
    distinction between case work and the action under test.
  - Compose the two manually merged Done branches, the declared publisher
    branch and the reported isolated branch from those same builders. Derive
    the observed trunk from the case's source and ref. Reuse the delivered
    Done, branch-entry, observation and landing-report values. Cases that
    exercise persistence, a race, or the installed publisher keep the real
    operation and its independent observations.
  - Remove arrangements and redundant verbs from `doneCaptureCase.ts`,
    `doneBranchObservation.ts`, `declaredPublisherBranch.ts`,
    `reportedIsolatedBranch.ts`, `reportedDoneCase.ts` and the specs. Retire
    modules once their last caller moves. Keep any remaining effect in its
    existing owner and add no support wrappers. The four supplier stories
    own the production seam changes. Runtime optimization has its own story.
- **Key examples.**
  - A Default main case names its launch and Done times in MakeMe. Real work
    before, within and after those times keeps the existing inclusion and
    exclusion assertions, including a shared checkout with overlapping sessions.
  - The branch-entry spec declares the worktrees and launch facts in MakeMe.
    A dirty entry still preserves its first tree and Default main tip, review
    still reads the separate comparisons, and foreign or conflicting places
    are still refused. The spec has no local setup helpers, and any remaining
    import from `doneCaptureCase.ts` is limited to one case builder.
  - A two-branch observation case starts from dated Done records and a real
    manually merged trunk; it keeps the existing delivery, retry and removal
    assertions. A publisher case starts from the matching launch, attempt
    and context and keeps the distinct branch and delivered comparisons,
    including across retirement and exact retry.
- **Evaluation.** Compare support imports and named bindings per affected
  spec, and lines in the affected specs and support, including builders that
  receive moved setup. Rebase the comparison on the delivered supplier state.
  Fewer support verbs and visible scenario facts with every assertion preserved
  are the gain, with any added lines counted in the trade-off.
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- **Effort hypothesis.** S–M, one plan.

<a id="optimize-done-capture-family-cases"></a>

### Bring the Done capture family's cases to 100–200 ms

**Identity:** SEED-413#optimize-done-capture-family-cases
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-413#optimize-done-capture-family-cases","dependencies":[{"supplier":{"identity":"SEED-413#split-done-mark-decision-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store"},"implementation":"Typed Done transition, Git branch-result capture, and review cases composed from Done state.","rationale":"Profiling the old review setup would measure machine-store writes and Done replay that this story removes.","condition":"The typed Done transition and Git capture are separate from the store adapter, and review-topic cases use composed Done records without replaying the store-backed Done action.","state":"satisfied","resolution":{"revision":"6250b73992afc1df2fd9b12bb502008527e568d6","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store","summary":"Satisfied at integration 2a7260d6d: dashboard/server/doneTransition.ts holds the pure Done transition and sessionBranchCapture.ts exports the Git-only captureBranchResult as setRecordDoneAt's collaborator; review-topic cases compose Done records without markDone (plan 734 slices 1, 2, 4–7). The correction SEED-413#restore-done-capture-proof-after-composed-reviews, queued first, adds back a few adapter cases before this measurement.\nCondition satisfied: The typed Done transition and Git capture are separate from the store adapter, and review-topic cases use composed Done records without replaying the store-backed Done action.\nAccepted integration: 2a7260d6d2596365b432d11731b6b57d01dc0f0f on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#split-branch-entry-proposal-from-store","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store"},"implementation":"Typed branch-entry proposal, production pin-ref query, and review cases composed from branch-entry state.","rationale":"The optimization needs to measure the branch-entry setup that remains after repeated store-backed entry actions are removed from review cases.","condition":"Branch-entry proposals are separate from persistence, the session pin-ref query is available, and cases where branch entry is a precondition use composed branch-entry state.","state":"satisfied","resolution":{"revision":"9969388902eb48c56588d9a1d30f45d8be6ac4b3","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store","summary":"Directly satisfied. The proposal is separate from persistence (branchEntryProposal.ts vs sessionBranchEntry.ts), the session pin-ref query is production sessionBranchPins in launchRecordPins.ts (with heldLandingPins for one-shot pins), and cases where the entry is a precondition compose it with makeMe enteredBranch; no test-side identifyBranch, aDeclaringLaunch or aDeclaredBranch remains. Proved by the branch-entry and pin specs and hosted CI run 44783274270 on e8b7e417.\nCondition satisfied: Branch-entry proposals are separate from persistence, the session pin-ref query is available, and cases where branch entry is a precondition use composed branch-entry state.\nAccepted integration: e8b7e4170c63f978270efba32e2396989fd555a1 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-413#fold-done-capture-launches-into-makeme","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme"},"implementation":"Done capture launch cases built through domain-named MakeMe steps.","rationale":"The launch arrangement changes the setup that the optimization measures, so the remaining costs need to be established with the delivered builders.","condition":"The Done capture cases use MakeMe launch and repository steps, with the checkout, record, and timeline carried by one case object.","state":"waiting"},{"supplier":{"identity":"SEED-413#observe-done-deliveries-over-typed-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records"},"implementation":"Typed delivery-observation decision over composed Done records, with the store adapter alone saving deliveries and pins.","rationale":"Profiling the observation cases before the split would measure machine-store reads and writes in a stubbed HOME that this story removes.","condition":"Delivery observation decides from typed kept records separately from its store adapter, and observation cases other than the adapter's races use composed records.","state":"waiting"},{"supplier":{"identity":"SEED-413#decide-landings-over-typed-attempts-and-records","href":"seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records"},"implementation":"Typed landing decision over composed attempts and records, production landing request admission, and the publisher bridge delegating to it.","rationale":"Profiling the publication cases before the split would measure attempt and record store writes and the test-side receiver that this story removes.","condition":"Landing preparation and recording decide from typed attempts and records separately from their store adapter, the landing request admission is a production function, and only the publisher-topic cases run the installed publisher.","state":"satisfied","resolution":{"revision":"086faa5a284a7030a101032405772eff1cf69077","path":".planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records","summary":"Directly satisfied. SEED-413#decide-landings-over-typed-attempts-and-records delivered decideLanding over composed attempts/records, LandingStores on handleLanding, caller-directed branchLandingContext, admitLandingRequest, and the installed-publisher bridge on production admission with composed stores. Key examples and Intent Coverage Caught at 233d31e6c (ad-hoc-prepared-landing-done). Approved remainders (HOME for blank/worktree machine deletion; 29 server specs; local LandingStores until ObservedLandingStore) do not block this condition. Recoverable story/plan at 086faa5a; accepted on origin/main at 4a5ceb24.\nCondition satisfied: Landing preparation and recording decide from typed attempts and records separately from their store adapter, the landing request admission is a production function, and only the publisher-topic cases run the installed publisher.\nAccepted integration: 4a5ceb24a2d50569dfe181e16a1a6a6b1efa9798 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

Follows the closed SEED-413#arrange-done-ad-hoc-observation-and-publication
(plan recoverable at
`0f1fe2cdd:.planning/slice-plans/730-arrange-done-ad-hoc-observation-and-publication/PLAN.md`),
which made its ten cases plain Vitest, about twice as fast as their
Playwright versions.
Queued after the five [Done capture import-list stories](#done-capture-import-list-analysis),
which move most of the family off the machine store and the replayed
actions. Profile what remains after them. The Git binary finding below
does not depend on them.

- **Goal.** Dashboard maintainers get Done capture proof that runs at about
  100–200 ms per case and passes reliably under local load. The family's
  cases now take about 1–2 s each at load 6–12 and 3–5 s at load 14–16. Under
  Vitest's 5 s default, two or three of them time out at that load. Hosted CI
  runs them in under 1 s.
- **Measured on 2026-11-20 at `78778ad74`** (trunk's 21 specs and 65 cases
  that import `doneCaptureCase.ts`, macOS, `--workers=2`, load 12–19 from
  other sessions).
  - Each case starts about 41 Git processes (2,685 for the family, counted
    with `GIT_TRACE2_EVENT`). Git itself runs about 7 ms in each. The most
    frequent are `rev-parse` (579), `rev-list` (250), `update-ref` (214),
    `add` (195), `cat-file` (175) and `commit` (148). `push`, `clone` and
    `pull` are few and take 73–87 ms each.
  - `git` resolves to `/usr/bin/git`, Apple's `xcrun` launcher. Starting it
    from Node took 36 ms at load 15, against 7 ms for the binary it runs
    (`xcrun -f git`) and 4 ms for `/usr/bin/true`. Linux has no launcher,
    which fits the hosted CI times.
  - With that binary's directory first on `PATH`, two interleaved pairs of
    family runs summed 54.7 s and 26.3 s of case time, against 70.1 s and
    109.1 s unchanged. Cases of 2 s or more fell from 7 and 23 to 3 and 0.
    The second unchanged run timed one case out at 5 s. At load 12–14 the
    median case was 357 ms and 20 of 65 cases ran within 200 ms.
  - That directory also holds `python3`, `make` and `clang`, so putting it
    first on `PATH` changes more than Git. A private directory holding one
    `git` script that runs the binary gave 61.6 s and 58.5 s against 67.9 s
    unchanged: the extra shell start spends most of the saving. A symbolic
    link starts as fast as the binary, but Git then looks for its templates
    under `/Applications/Xcode.app` and warns on `init`.
  - Load moved between runs and the same arrangement varied twofold, so a
    duration at a named load does not reproduce. The count of Git processes
    per case does.
- **Scope.**
  - On macOS the family's cases run the Git binary directly, resolved once
    per run. Where `git` is already another binary, and on Linux, nothing
    changes. How the binary is reached is the open decision below.
  - Cut the Git processes each case starts, in the family's support and in
    production seams that start more than their answer needs. The family is
    the Git-heavy Done capture cases under `dashboard/backend-tests/review/`
    and `dashboard/backend-tests/launches/`, with their shared support:
    `doneCaptureCase.ts`, `doneCaptureReview.ts`, `doneBranchObservation.ts`,
    `declaredPublisherBranch.ts`, `installedPublisher.ts`,
    `reportedIsolatedBranch.ts` and `adHocBranchRefs.ts`, as the five
    import-list stories leave them. Profile per case first: checkout creation,
    checkout work, production Done capture, observation and review reads.
    After the branch-entry story, entry setup is gone; the Done review,
    attribution, declared publication and lifecycle deletion cases still take
    4.1–4.6 s at load ~20 in real Done capture and fixture Git.
  - Keep the Git that developers run, the production handlers and every
    assertion. The proof is of Git's own behavior (reflog times, merges,
    worktrees, pins), so a Git library in the test process does not replace
    it. Raising timeouts is out of scope.
- **Open decision (Terry).** Which owner reaches the binary. Slice planning
  waits for it.
  - *The Git runners resolve it* (recommended). `dashboard/server/gitRunner.ts`
    and the installed `publication-git.mjs` start the binary `xcrun -f git`
    names when `git` is the launcher. Tests and a developer's own dashboard
    both save the launcher on every Git call, and no other tool's
    resolution changes. It changes shipped code in two places.
  - *The test environment puts the binary's directory first on `PATH`.* No
    product change, and the family gets the measured saving. Every check
    then also takes `python3`, `make` and `clang` from that directory.
  - *Fewer processes only.* No change to how Git starts. The family keeps
    the launcher's cost on each remaining call.
- **Alternatives considered.**
  - *Run the binary directly* (first, by the owner decided below). Measured
    above and independent of the earlier stories. On its own it leaves the
    median case near 350 ms under load.
  - *Fewer processes per case* (chosen second). Build a checkout's history in
    fewer calls, and answer several production reads from one call. The
    saving is whatever the per-case profile shows. Each change is judged by
    the process count.
  - *One built checkout copied per case*, as a machine image is cloned for
    each instance. The image is the materialized base history and the
    instance is a case's checkout. Git stores absolute paths for worktrees
    and the origin, so a copy fits only checkouts with neither. A candidate
    for those cases, to be judged by the profile.
  - *One long-lived `git cat-file --batch` process for reads*, as a
    connection pool reuses one connection. It serves object reads only and
    adds a process lifetime to the production server. Not pursued in this
    story.
- **Key examples.**
  - On macOS a family run starts Git without the launcher. Its cases pass
    with their assertions unchanged.
  - A Done branch capture with a real merge and a typed review read finishes
    within about 200 ms at low load.
  - At load 15 or more, the family passes several runs in a row at
    `--workers=2` with no timeout.
  - A case whose topic is the review of an already Done session starts no
    more Git processes than its real commits and its review reads need.
- **Evaluation.** Use [`dough-test-optimization`](../../.claude/skills/dough-test-optimization/SKILL.md)
  and the [`done-capture-family-timeout-margin`](../TEST-OPTIMIZATION-CANDIDATES.md#done-capture-family-timeout-margin)
  candidate. Count Git processes per case before and after with
  `GIT_TRACE2_EVENT`. Compare per-case durations in interleaved runs of the
  family before and after, at the same worker count, and record the load of
  each, under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
  If 100–200 ms is not reachable, report the measured floor and the Git
  processes that remain for each case. Explain why they cannot be removed
  without losing protection, and give the margin the family reaches instead.
- **Architecture.** Choosing the Git binary is a new responsibility under
  either of the first two options. No Accepted ADR covers it. In the runners
  it has two owners, one per runner, each resolving once per process. In the
  test environment it has three entries to reach: `scripts/test-environment.bash`
  for shell checks, and the Playwright and Vitest configurations of the
  dashboard groups.

<a id="prove-ad-hoc-review-handoffs-with-typed-handlers"></a>

### Prove ad hoc review handoffs with typed handlers

**Identity:** SEED-413#prove-ad-hoc-review-handoffs-with-typed-handlers
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/742-prove-ad-hoc-review-handoffs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"97821c79edf2387333c0d8d176cc14424a4c429d507dd08f895b188ec71ce511","plan":"7e87a9d0dd023c0f7b768a7e96925836aabd7f43cedde347b2fb202ef091dd5d"}}
```

**Goal.** Give dashboard maintainers direct Node Vitest feedback on the three
ad hoc review handoffs still exercised through Playwright. Keep the actual
Git comparisons and native Done observations, and retire the ad hoc review
HTTP test helper and its branch-validation fixture.

**Scope.** Move the quiet Done race, the early report and native binding
case, and the Default main branch-entry command case to typed production
entries. Compose the named launch, reporting attempt, and checkout in
MakeMe. Exercise real Git and file persistence where they decide what the
dashboard keeps. Retain a native stop observer in the race and run the
emitted branch-entry command from the real branch in its wiring case.
Keep the test timeout at its default. Delete the helpers when their final
users move and add no test-support wrappers. Preserve existing product
behavior and the shared request contracts. Landed CI, Story Notes storage,
other launch and session cases, and retiring the backend Playwright runner
remain part of the [backend campaign](#renovate-later-dashboard-backend-unit-test-families).

**Key examples.**

- A manual Done has read an earlier commit and is held in ancestry
  validation. When a quiet completion captures a later commit and the
  manual mark resumes, Review changes shows the later tree, only the
  baseline and later revision stay pinned, and no native stop runs.
- An isolated launch pushes a commit to the target and reports quiet Done
  before its native session binds. The receipt is pending. When the session
  binds, its review shows the verified landed baseline and new tree.
- A Default main launch sends a branch-entry command with its reporting
  reference. When run from the original checkout after the developer moves
  to a draft branch and commits, its receipt names that session, workspace,
  branch, and commit.

**Plan.** [742](../slice-plans/742-prove-ad-hoc-review-handoffs/PLAN.md)

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
  1. [Ad hoc review handoffs](#prove-ad-hoc-review-handoffs-with-typed-handlers)
     owns the last two users of `adHocReview.ts` and the branch-entry
     command case. The other converted cases already use typed entry points.
     Remaining native Done cases belong to `sessions/`.
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
[Story Review diff reading](#review-diff-reading-after-migration) and
[Usage Token index reading](#usage-token-index-reading-after-migration) now run
in mounted Chromium.

**Goal.** Give dashboard developers readable UI unit tests and feedback from
the complete frontend group in roughly a minute at the usual two workers,
including preparation. This carries the suite-wide commitments, including
SEED-404's timing goal and SEED-301's Intent MakeMe work.

**Scope and order.** Select families by feature folder and the interaction
each view owns. The Optimization Candidates and open Sessions sidebar
families have landed as mounted Vitest Chromium proof.
Split the next piece by the rendered owner whose cases it moves, sized by the
[experience below](#experience-from-the-completed-frontend-families), and
choose it by the seconds it removes for the production change it needs, read
from the [current state](#frontend-group-state-after-seven-families). Prefer
an owner that already takes typed inputs, then one small extraction or one
typed source behind a hook. Continue with the Usage chart cases, the rest of
Review, Intent and Sessions. Leave Navigation's frame, board and URL cases
until an audit has separated what a mounted board owner can prove from what
needs a real page load or belongs in E2E. Use
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
  responses with `makeMe.anIntentLocationsAnswer`, and retire the unread
  `locationsRequest` export in `intentReadRecoveryPage.ts`.
- When an Intent family reuses
  [`intent-candidates-publication.ts`](../../dashboard/frontend-tests/intent/intent-candidates-publication.ts),
  mount the production `IntentPageProviders` there instead of re-composing
  the mode and reading providers.
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

#### Experience from the completed frontend families

Seven frontend stories closed between 2026-11-19 and 2026-11-20: Story Notes,
Project CI history, the Project Intent revision cases, the Show latest file
reads, the two Optimization Candidates stories and the open Sessions sidebar.
Their plans are in Git history (720, 722, 724, 728, 729, 733 and the Sessions
sidebar plan).

- **Size.** Two cases on an existing fixture took two slices and about 40
  minutes from Take to Close. Twelve cases with new page objects, or five
  cases with an extraction, took five to seven slices and about two hours.
  Split a piece at about a dozen to twenty cases over one or two owners.
- **What made a family cheap.** The owner already took typed props (Project
  CI history needed no production change), or an earlier story had left the
  fixture and typed reply (Show latest file reads, candidates revision).
- **What made a family expensive.** The first owner chosen dragged in
  unrelated providers. The Project Intent revision cases first mounted
  `IntentPerspective` with story selection, CI reads and workspaces, then
  needed `ProjectIntentReading` extracted and two more slices. Choose the
  owner by what the cases observe and read its hooks and contexts before
  sizing.
- **Production changes that recur.** A typed source behind the reading hook
  (`storyNotesState(source)`, `readCandidates` on `IntentReadSource`). An
  extracted owner (`ProjectIntentReading`, the open Sessions list). A
  component importing its own stylesheet. A module that pulls Node code
  cannot load in the page.
- **Acting and waiting.** Render and act directly and wait through retrying
  assertions. Removing `actSettled` cut the revision cases from 7.16 s to
  5.75 s. A deferred reply belongs to the case that observes the pending
  read. Answer the first read before expecting what follows it, and wait one
  task before asserting that a late answer changed nothing, or the case
  passes with its guard broken.
- **State that outlives a case.** Read caches keyed by repository, revision
  and path need a new revision per case. Keep readers on one fake clock. A
  component declared inline in a case remounts and loses its state.
- **The mounted page differs from the built app's.** It has touch, so
  desktop disclosure needs a fine pointer set through CDP. Colour scheme and
  time zone are also set through CDP. `makeMe.mjs` cannot load in the page:
  expose the Node-free builder on `pageMakeMe.mjs`.
- **Measuring.** A scratch probe understates delivered time (2.07 s probed
  became 7–8 s). Summed case time can rise while the command gets faster.
  Compare the focused command's elapsed time over interleaved runs, and keep
  the full-group comparison for the end. A selection mixing both engines
  runs only the Vitest specs, so run a built-app spec alone for its
  baseline.
- **Proof that slipped.** Two stories dropped an assertion while moving
  cases (focus after delete, no reread after 70 s) and restored it in a
  later slice. Name each retired case and the mounted case that carries
  each of its assertions before deleting it.
- **Support.** Each story retired the support whose last consumer moved,
  and none could retire a module that E2E or another family still used.
  Steps already owned by an E2E journey (the revision check pace, host
  status cadence) were dropped with that journey named.

#### Frontend group state after seven families

CI run 44741808717 at `93235af49` (2026-11-20) recorded 758 cases and 1,252
summed seconds. The 85 mounted Vitest cases in 32 specs took 24.0 s. The 123
cases in 42 `pageTest.ts` specs took 62.3 s. The 550 built-app cases in 237
specs took 1,165.7 s, 93% of the time.

| Folder | Built-app specs | Cases | CI summed seconds | Seconds per case |
| --- | ---: | ---: | ---: | ---: |
| Navigation | 47 | 116 | 330.1 | 2.8 |
| Intent | 59 | 107 | 248.8 | 2.3 |
| Sessions | 42 | 92 | 154.8 | 1.7 |
| Launches | 29 | 81 | 124.1 | 1.5 |
| Review | 21 | 47 | 119.9 | 2.6 |
| Configuration | 19 | 49 | 87.5 | 1.8 |
| Terminals | 12 | 41 | 71.8 | 1.8 |
| Stories | 8 | 17 | 28.7 | 1.7 |

Mounted cases average 34 ms in Stories and 73 ms in Sessions, and 605 ms in
Intent, where `ProjectIntentReading` is the owner. At 758 cases the
one-minute goal at two workers allows about 150 ms a case. Moving every case
onto Vitest reaches the engine goal and can still miss the minute, so each
piece prefers the narrowest owner and records its mounted time per case.

##### Review diff reading after migration

On the same AC-powered Mac with Node 24.21.0, the focused
`review/story-review-diff --workers=2` selection ran on clean
`4e991ea00` and on the slice 6 working tree at `a3563cf18`.
Both worktrees used their own locked dependencies. Three baseline/revised
pairs ran alternately on 20–21 November 2026 with the macOS sleep guard.
Elapsed seconds include runner preparation. One-minute load was natural.

| Selection | Elapsed seconds | Load before → after |
| --- | ---: | ---: |
| Before 1 | 38.85 | 10.54 → 10.89 |
| After 1 | 21.41 | 10.89 → 18.07 |
| Before 2 | 31.57 | 20.15 → 19.93 |
| After 2 | 17.96 | 19.93 → 20.59 |
| Before 3 | 24.37 | 20.59 → 17.56 |
| After 3 | 13.18 | 17.56 → 16.09 |

The median elapsed time fell 43%, from 31.57 s before to 17.96 s after.
The three original clean runs earlier in the story took 30.924, 29.209
and 28.382 s. This comparison covers the focused Review diff selection
under the observed loads. The full frontend group's time is a separate
measurement.

The original eight built-app specs passed 22 cases. The revised selection
passed 43 mounted cases in six specs and five retained built-app cases in
three specs. The five built-app cases still cover these boundaries.

- File diff and text reads. `syntax-arrival` checks Retry after an
  unavailable file text and plain rendering after a failed grammar load.
- Review revision selection. `syntax-intent-hints` checks the live snapshot
  revision and the published Done revision used to resolve syntax hints.
- Review and Intent rendering. `syntax-appearance` checks token appearance
  against the same Intent source in both schemes. It also observes zero
  additional diff or text reads while switching schemes in Review.

The five audited shared support files fell from 568 to 220 lines.
The word-emphasis opener and fixture retired, the retained diff helper
kept the observations the built-app cases still read, and both grammar
helpers still serve the Intent cases that hold or fail a module load.

Mounted attempts had a median of 56 ms and a maximum of 761 ms.
The table gives each case's median of three attempts, rounded to milliseconds.
Spec names omit `story-review-diff-` and `.spec.ts`.

| Mounted spec | Case | Median ms |
| --- | --- | ---: |
| `syntax-appearance-mounted` | styled changed words keep token colours inside insertions and deletions | 63 |
| `syntax-appearance-mounted` | emphasized tokens and underlines stay readable in light and dark | 97 |
| `syntax-appearance-mounted` | diff tokens on added, removed and unchanged lines read at 4.5:1 in both appearances | 50 |
| `syntax-arrival-mounted` | a diff shown before its text is read stays plain and complete until the text arrives | 172 |
| `syntax-arrival-mounted` | styling that arrives after the diff keeps the reading position, revealed context and an open line menu | 473 |
| `syntax-arrival-mounted` | emphasis is present before tokens arrive and stays on the same words after | 138 |
| `syntax-languages-mounted` | a modified README heading and fence take distinct token colours while markers and backgrounds stay | 45 |
| `syntax-languages-mounted` | a JSON property name and string value take distinct colours from each other and punctuation | 35 |
| `syntax-languages-mounted` | a removed CSS property and colour value differ and stay readable when appearance switches | 71 |
| `syntax-mounted` | a TypeScript diff styles each line by its side's whole text and keeps the plain diff's change facts | 672 |
| `syntax-paths-mounted` | a.ts styles the file's keyword | 159 |
| `syntax-paths-mounted` | a.mts styles the file's keyword | 106 |
| `syntax-paths-mounted` | a.cts styles the file's keyword | 54 |
| `syntax-paths-mounted` | a.tsx styles the file's keyword | 53 |
| `syntax-paths-mounted` | a.js styles the file's keyword | 115 |
| `syntax-paths-mounted` | a.mjs styles the file's keyword | 8 |
| `syntax-paths-mounted` | a.cjs styles the file's keyword | 12 |
| `syntax-paths-mounted` | a.jsx styles the file's keyword | 27 |
| `syntax-paths-mounted` | A.java styles the file's keyword | 22 |
| `syntax-paths-mounted` | a.py styles the file's keyword | 73 |
| `syntax-paths-mounted` | a.sh styles the file's keyword | 33 |
| `syntax-paths-mounted` | a.bash styles the file's keyword | 7 |
| `syntax-paths-mounted` | a.feature styles the file's keyword | 14 |
| `syntax-paths-mounted` | README.md styles the file's keyword | 123 |
| `syntax-paths-mounted` | data.json styles the file's keyword | 39 |
| `syntax-paths-mounted` | a.css styles the file's keyword | 58 |
| `syntax-paths-mounted` | a.yaml styles the file's keyword | 8 |
| `syntax-paths-mounted` | a.yml styles the file's keyword | 21 |
| `syntax-paths-mounted` | a rename from old.txt to new.ts styles by its new path | 10 |
| `syntax-paths-mounted` | a rename from settings.yaml to settings.yml styles by its new path | 22 |
| `syntax-paths-mounted` | notes.txt with no supported extension reads plain | 86 |
| `syntax-paths-mounted` | new.txt with no supported extension reads plain | 84 |
| `syntax-paths-mounted` | scripts/setup.test uses a known hint when its path names no grammar | 23 |
| `syntax-paths-mounted` | scripts/setup-renamed.test uses a known hint when its path names no grammar | 7 |
| `syntax-paths-mounted` | an unfamiliar hint leaves a path-silent file plain | 106 |
| `syntax-paths-mounted` | the file's path grammar wins over a known hint | 17 |
| `word-emphasis-mounted` | changed words in a block are deletions and insertions; copy stays plain | 69 |
| `word-emphasis-mounted` | a three-line rewrap gaining a word emphasizes only that word | 63 |
| `word-emphasis-mounted` | splitting a call across lines emphasizes the added comma, indent and argument | 114 |
| `word-emphasis-mounted` | re-indent emphasizes the changed whitespace on both lines | 109 |
| `word-emphasis-mounted` | a pure addition and revealed context have no word emphasis | 131 |
| `word-emphasis-mounted` | a low-similarity rewrite stays line-level with no word emphasis | 2 |
| `word-emphasis-mounted` | a several-hundred-line block stays line-level while a small block is emphasized | 31 |

##### Usage Token index reading after migration

All 13 cases across the six moved Usage reading specs (`system-settings-usage`,
`-period`, `-estimate`, `-selection`, `-checking`, `-tool`) now mount
[`SystemSettingsUsage`](../../dashboard/src/SystemSettingsUsage.tsx) directly on
headless Chromium over a typed [`UsageSource`](../../dashboard/src/usageSource.ts),
plus 3 mounted cases in
[`system-settings-usage-source.spec.ts`](../../dashboard/frontend-tests/configuration/system-settings-usage-source.spec.ts)
proving `pageUsageSource`'s refusal wording and abort forwarding.

- **Focused 6-spec timing comparison** (`--workers=2`, AC power,
  `caffeinate -s -i`, Node 24.21.0, explicit paths for the 6 moved specs):
  three interleaved warm runs comparing pre-story baseline `1817333330f5`
  against the mounted replacement at matching 1-minute natural load
  (`8.09–12.60`) cut median command elapsed time from **`9.66 s` to `5.78 s`**
  (**`-40.2%`**, `-3.88 s`; summed per-case medians `12.49 s → 5.85 s`,
  `-53.2%`):
  - Pair 1: Before `8.89 s` (load `9.03 → 8.56`) vs After `5.78 s` (load `8.56 → 8.28`)
  - Pair 2: Before `9.66 s` (load `8.28 → 8.09`) vs After `5.63 s` (load `8.09 → 8.32`)
  - Pair 3: Before `12.75 s` (load `8.32 → 12.60`) vs After `8.06 s` (load `12.60 → 12.47`)
  - Slice 1's earlier clean baseline at `1817333330f5` under heavier host load
    (`35.16–40.97`) took `39.25 s`, `45.13 s`, `39.75 s` (median `39.75 s`).
  - Including [`system-settings-usage-source.spec.ts`](../../dashboard/frontend-tests/configuration/system-settings-usage-source.spec.ts)
    (all 7 mounted Vitest specs, 16 cases), three warm runs took `7.09 s`,
    `6.63 s`, `6.23 s` (median **`6.63 s`**, load `7.82–8.24`).
- **Audited `dashboard/test-support/support/` Usage support (`wc -l`):**
  `697 → 675` total lines (`-22` lines):
  - [`systemSettingsUsagePage.ts`](../../dashboard/test-support/support/systemSettingsUsagePage.ts):
    `216 → 194` lines (`-22`). Removed zero-consumer re-export `UsageToolName`,
    unexported internal `expectGeneralSettingsShown`, `openUsage`,
    `TaskDetail`, and `usageView`, and removed zero-consumer `usageView`
    methods `showsDaysProblem`, `showsLoading`, `showsPartialPoints`,
    `showsNoPoints`, and `showsNoProblem`. Kept `visitUsage` and the remaining
    19 `usageView` methods consumed by the 5 retained built-app chart specs
    (`-average`, `-compare`, `-legend`, `-overflow`, `-spacing`) and 4
    `e2e/configuration/system-settings-usage*` journeys.
  - [`usageSpacingPage.ts`](../../dashboard/test-support/support/usageSpacingPage.ts):
    `71 → 71` lines. Unexported internal `taskOrderWords`; kept `usageSpacing`
    and its 7 methods for `-spacing` and
    [`e2e/configuration/system-settings-usage-tools.spec.ts`](../../e2e/configuration/system-settings-usage-tools.spec.ts).
  - [`usageToolsPage.ts`](../../dashboard/test-support/support/usageToolsPage.ts)
    (`115`), [`usageChartPage.ts`](../../dashboard/test-support/support/usageChartPage.ts)
    (`221`), and [`usageLegendPage.ts`](../../dashboard/test-support/support/usageLegendPage.ts)
    (`74`): unchanged; every export and method remains consumed by the 5 chart
    specs and/or 4 E2E journeys.
- **Reusable building blocks for the 20 retained chart cases** (`-average`,
  `-compare`, `-legend`, `-overflow`, `-spacing`):
  - the typed source (`UsageSource` in [`dashboard/src/usageSource.ts`](../../dashboard/src/usageSource.ts))
  - the page MakeMe entry (`makeMe.aTokenIndexAnswer` in [`Distribution/tests/support/pageMakeMe.mjs`](../../Distribution/tests/support/pageMakeMe.mjs))
  - the mounted Usage page objects ([`system-settings-usage-page.ts`](../../dashboard/frontend-tests/configuration/system-settings-usage-page.ts) and [`system-settings-usage-tools-page.ts`](../../dashboard/frontend-tests/configuration/system-settings-usage-tools-page.ts))
- **Removed built-app cases paired with mounted replacements and per-case median durations** (`0` cases removed as E2E-only duplicates; every distinct assertion across all 13 moved cases preserved in place; the 4 `e2e/configuration/system-settings-usage*` journeys — [`system-settings-usage.spec.ts`](../../e2e/configuration/system-settings-usage.spec.ts), [`-period.spec.ts`](../../e2e/configuration/system-settings-usage-period.spec.ts), [`-tools.spec.ts`](../../e2e/configuration/system-settings-usage-tools.spec.ts), [`-estimate.spec.ts`](../../e2e/configuration/system-settings-usage-estimate.spec.ts) — stay intact proving the real store, filters, and Refresh; average median `450 ms` across the 13 moved cases, `428 ms` with the 3 `pageUsageSource` cases):

| Spec (`dashboard/frontend-tests/configuration/`) | Removed built-app case title | Mounted Vitest case | 3-run attempts (ms) | Median (ms) |
| --- | --- | --- | --- | ---: |
| `system-settings-usage.spec.ts` | `"ten eligible tasks draw their one rolling median value"` | `system-settings-usage.spec.ts:34` (same title) | `59, 57, 93` | `59` |
| `system-settings-usage.spec.ts` | `"partial and unpriced tasks explain a sparse trend, and an empty cohort explains its absence"` | `system-settings-usage.spec.ts:45` (same title) | `392, 173, 229` | `229` |
| `system-settings-usage.spec.ts` | `"task detail distinguishes repeated launches and unknown outcomes, with keyboard selection and focus restoration"` | `system-settings-usage.spec.ts:97` (same title) | `684, 594, 1002` | `684` |
| `system-settings-usage-period.spec.ts` | `"local calendar requests retain the last valid day view through invalid input and cohort changes"` | `system-settings-usage-period.spec.ts:27` (same title) | `291, 317, 322` | `317` |
| `system-settings-usage-period.spec.ts` | `"empty periods explain their counts and do not show an old median"` | `system-settings-usage-period.spec.ts:89` (same title) | `20, 26, 36` | `26` |
| `system-settings-usage-selection.spec.ts` | `"a failure leaves once its selection is read again"` | `system-settings-usage-selection.spec.ts:25` (same title) | `775, 499, 1045` | `775` |
| `system-settings-usage-selection.spec.ts` | `"a failure leaves once a day round trip reads its period again"` | `system-settings-usage-selection.spec.ts:59` (same title) | `389, 262, 276` | `276` |
| `system-settings-usage-selection.spec.ts` | `"an answer for a selection already left never joins the one shown"` | `system-settings-usage-selection.spec.ts:95` (same title) | `475, 264, 696` | `475` |
| `system-settings-usage-tool.spec.ts` | `"adding Claude Code keeps a Codex-only model, offering both tools' models once; hiding Codex then resets that model and keeps the workflow and a shared effort"` | `system-settings-usage-tool.spec.ts:24` (same title) | `736, 424, 713` | `713` |
| `system-settings-usage-tool.spec.ts` | `"the Claude Code cohort names, once and in words, the background work it leaves out and each task's own missing usage; Codex names no left-out work"` | `system-settings-usage-tool.spec.ts:98` (same title) | `929, 440, 1319` | `929` |
| `system-settings-usage-checking.spec.ts` | `"checking survives a selected cohort read and waits for Refresh's selected-cohort reread"` | `system-settings-usage-checking.spec.ts:41` (same title) | `713, 553, 744` | `713` |
| `system-settings-usage-checking.spec.ts` | `"a failed Refresh after a filter change retains the selected chart and time beside its error"` | `system-settings-usage-checking.spec.ts:96` (same title) | `337, 296, 396` | `337` |
| `system-settings-usage-estimate.spec.ts` | `"refreshing to an explicit rate replaces the estimate and keeps another model's warning"` | `system-settings-usage-estimate.spec.ts:42` (same title) | `316, 233, 665` | `316` |
| `system-settings-usage-source.spec.ts` | — *(added for `pageUsageSource`)* | `system-settings-usage-source.spec.ts:30` (`"a refused read shows Usage could not be read. or the endpoint's own message"`) | `58, 81, 91` | `81` |
| `system-settings-usage-source.spec.ts` | — *(added for `pageUsageSource`)* | `system-settings-usage-source.spec.ts:61` (`"a refused Refresh shows Usage could not be refreshed. or the endpoint's own message"`) | `440, 465, 477` | `465` |
| `system-settings-usage-source.spec.ts` | — *(added for `pageUsageSource`)* | `system-settings-usage-source.spec.ts:99` (`"leaving a pending read aborts the page source's request"`) | `104, 111, 106` | `106` |

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
