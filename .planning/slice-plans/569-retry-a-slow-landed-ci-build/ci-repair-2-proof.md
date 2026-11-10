# CI repair return — 42802352676 / attempt 1

Failed published revision/current HEAD: `0fb7f02264c8956c1a7ea68f213ecf115d1a58df`.
All repair changes are uncommitted. Root's `ci-repair-2.md` is unowned and
untouched. Slice 2 remains paused; its recorded stash was not accessed.

## Cause and correction

The retained-history reader restart derived the stopped server's port and
requested it explicitly for the new process. Closing a server releases that
address; another listener can claim it. The real CI failure was the resulting
EADDRINUSE in the second boundary server, not CI acquisition or retained-proof
content. Existing chosen-port behavior correctly refuses a named occupied
port; broadening its retry regex would not establish ownership.

The reader now asks for its own free port and returns that process's reported
address. Every affected API consumer uses the returned reader, including
captured read closures and the enclosing project-cohort assertion. Seven
preview/browser journeys supply the reader origin to real navigation helpers
for opening and revisiting their views. Those helpers retain their existing
default `/` for all other callers, including beforeIntent callbacks.

Persisted history, machine identity, collection-off environment, selected-story
and comparison assertions, per-scope evidence, keyboard/phone observations and
no-acquisition counts are preserved. The same-origin assumption was harness
address plumbing, not an assertion of browser preference persistence in these
journeys. No proxy, source response, selection or preference result is supplied
by a fixture. Production startup, explicit-port refusal, own-address reporting
and CI behavior are unchanged.

The reached chosen-port test fake contained an existing 5ms sleep. It now
settles explicit Promises with the same launch/end order and exact refusal
assertions; no wall-clock wait or timeout exception is needed.

Read-only maintained evidence DD-296 in
`docs/maintainer/project-test-findings.md` confirms the same closed-port race
and earlier any-free-port repairs. Its independent same-origin-specific
session recovery cases are unchanged; no finding maintenance or broader socket
handoff work was undertaken.

## Proof and strict verdicts

1. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-reader-restart.spec.ts --workers=1`

   Before the lifecycle edit: terminal exit1, session62352. The real helper
   closed the original server, then its wrapped close observed an owned HTTP
   listener binding the released original port. Starting the reader reproduced
   the exact EADDRINUSE stack through serverAddress/chosenPort/dashboardServer.
   Report: `dashboard/test-results/2026-11-10T11-02-24.032Z-92371/report.txt`.

   After removing fixed-port reuse: terminal exit0, session87543. The reader
   bound a distinct address, returned the same independently observed retained
   history, added no GitHub calls and never queried the unrelated listener.
   An explicit old-address request still reached that listener, proving it
   remained occupied rather than disappearing. The regression's domain
   landing/history facts use MakeMe; HTTP listener/port ownership is the
   infrastructure input under test. Both server and occupant clean up.

2. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts backend-tests/intent/landed-ci-attempt-start.spec.ts backend-tests/intent/landed-ci-history-collection.spec.ts backend-tests/intent/landed-ci-history-gaps.spec.ts backend-tests/intent/landed-ci-history-lifecycle.spec.ts backend-tests/intent/landed-ci-proof-adapter-units.spec.ts backend-tests/intent/landed-ci-proof-collection.spec.ts backend-tests/intent/landed-ci-reader-restart.spec.ts backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts backend-tests/intent/landed-ci-scope-adapter-shared-attempt.spec.ts backend-tests/intent/landed-ci-scope-build-provenance.spec.ts backend-tests/intent/landed-ci-scope-later-build.spec.ts backend-tests/intent/landed-ci-scope-legacy-gap.spec.ts backend-tests/intent/landed-ci-scope-pending-order.spec.ts backend-tests/intent/landed-ci-scope-pending-proof.spec.ts backend-tests/intent/landed-ci-scope-proof-adapter-recovery.spec.ts backend-tests/intent/landed-ci-scope-proof-completion.spec.ts backend-tests/intent/landed-ci-scope-proof-lifecycle.spec.ts backend-tests/intent/landed-ci-scope-proof-recovery.spec.ts backend-tests/intent/landed-ci-scope-retained-window.spec.ts backend-tests/runtime/boundary-server.spec.ts backend-tests/runtime/chosen-port.spec.ts tests/intent/intent-ci-comparison.spec.ts tests/intent/intent-ci-done-prior-build.spec.ts tests/intent/intent-ci-prior-build-average.spec.ts tests/intent/intent-ci-wall-time-history.spec.ts tests/intent/intent-scope-collected-file-timing-gaps.spec.ts tests/intent/intent-scope-collected-file-timing-history.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-scope-prior-build-average.spec.ts tests/intent/intent-scope-prior-build-states.spec.ts --workers=1`

   Selection: `/tmp/seed285-ci2-dashboard-list.txt` confirms44 tests/31 files,
   with no skip/fixme declarations. Terminal exit1, session61019, with exactly
   one ECONNREFUSED failure in retained-window's enclosing
   `expectProjectHistoryCohort` call, which still received the closed dashboard.
   This strict failed result is retained at
   `dashboard/test-results/2026-11-10T11-09-01.203Z-33520/report.txt`.
   The43 other selected cases passed; their implementation/assertions stayed
   unchanged after that result. They include the original failed CI retained-
   proof lifecycle, all direct reader restart purposes, both new timing
   migrations, pending/evicted/equivalent/later/adapter evidence, seven real
   browser reading journeys, strict chosen-port checks and actual boundary
   own-address reporting. Representative default comparison/history
   navigation also passed.

   The missed aggregate call was corrected to the returned reader, preserving
   every expected row/count. An expanded AST scan of all original-server
   arguments after restart found no other such miss.

3. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-retained-window.spec.ts --workers=1`

   Terminal exit0, session59462. The entire corrected twenty-first-landing
   journey now proves the selected scoped point, retained project cohort,
   eviction explanation, complete proof preservation and unchanged provider
   call count at the reader's address. No assertion was relaxed. This replay
   settles the one failed consumer; the broad gate is not relabelled green.

4. `npm run typecheck:dashboard`

   Final terminal exit0, session69592. Includes every updated address argument,
   helper return, optional navigation parameter, new regression and Promise
   fake. Earlier3706 failed only my direct access to unknown `before.body`;
   that assertion now observes the same full expected body shape via
   toMatchObject. Corrected93538 and final69592 passed.

5. `git diff --check`: terminal exit0. Read-only Prettier prediction found every
   changed/new script remains within250 lines after coordinator formatting.
   No formatter or hook-owned lint was run.

## Inspected observations and setup

- `landed-ci-reader-restart.spec.ts`: actual server close, observable release
  and listener acquisition through the existing released-port utility, real
  new reader startup, exact history equality/no-CI-call assertions, and old
  listener request counter. No synthetic startup result replaces the helper.
- `landed-ci-scope-proof-lifecycle.spec.ts`: normal collected artifact backfill,
  retained original landing/build, then reader restart and repeated exact
  scoped case/file totals with no further provider requests; setup supplies
  raw proof and persisted original state, not the backfilled answer.
- All direct restart specs in the selection continue their actual local
  history/proof reads with returned readers. Existing state, completeness,
  provenance, pruning/order and missing-evidence assertions are unchanged.
- The seven browser files still open the real page, select the actual Done
  story/project, read their original comparison and sample/exclusion facts,
  drill/revisit/retry and use keyboard/phone-width assertions. Only the
  navigation target changes to the new process; authenticated reads and
  no-acquisition counts remain production behavior.
- `chosen-port.spec.ts` retains exact rejection/error identity for named ports,
  unrelated failures and exhausted chosen-port attempts. Its launch/end log
  assertions now use settled Promises; the production owner is untouched.

## Consumer trace

Installed command:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe --base HEAD --term restartAsLandedCiReader --term observeRetainedScopeOrder --term openCollectedHistoryStory --term selectDoneStoryForCiComparison --term openProjectCiStatus --term selectDoneStoryInIntent --term listenOnReleasedRunnerPort --term expectProjectHistoryCohort --term openCiStatus --term selectCompletedStoryInIntent --term selectDoneStoryForChangedTests --term selectDoneStoryForSummaryComparison --term 'same port' --term 'returned reader'`

Record: `/tmp/seed285-ci2-consumer-trace.md`:109 located consumers, all disposed
(12run,97excluded with concrete boundary reasons). Located helper exports were
followed into their actual journeys. Changed files, omitted by the tool's
outside-diff listing, are covered by the31-file gate and owned list below.
Unchanged default-navigation callers supply no new address and retain the
same evaluated `/`, callbacks, selected-story code and read conditions; the
default paths are represented by the replayed comparison/history cases.
Other history module exports, type/schema basename matches, independent
cursor/terminal lifecycle and historical records are explicitly distinguished.
No affected consumer or required observation remains unproved.

## Owned paths

- dashboard/backend-tests/intent/landed-ci-proof-adapter-units.spec.ts
- dashboard/backend-tests/intent/landed-ci-proof-collection.spec.ts
- dashboard/backend-tests/intent/landed-ci-reader-restart.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-adapter-shared-attempt.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-build-provenance.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-later-build.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-legacy-gap.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-pending-order.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-pending-proof.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-proof-adapter-recovery.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-proof-recovery.spec.ts
- dashboard/backend-tests/intent/landed-ci-scope-retained-window.spec.ts
- dashboard/backend-tests/runtime/chosen-port.spec.ts
- dashboard/tests/intent/intent-ci-done-prior-build.spec.ts
- dashboard/tests/intent/intent-ci-prior-build-average.spec.ts
- dashboard/tests/intent/intent-scope-collected-file-timing-gaps.spec.ts
- dashboard/tests/intent/intent-scope-collected-file-timing-history.spec.ts
- dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts
- dashboard/tests/intent/intent-scope-prior-build-average.spec.ts
- dashboard/tests/intent/intent-scope-prior-build-states.spec.ts
- dashboard/tests/intentCiHistoryPage.ts
- dashboard/tests/support/landedCiHistory.ts
- dashboard/tests/support/scopeHistoryCollectedOrder.ts
- dashboard/tests/support/scopeHistoryCollectedPage.ts
- dashboard/tests/support/selectDoneStoryForCiComparison.ts
- dashboard/tests/support/selectDoneStoryInIntent.ts

## Resources and remaining ownership

This macOS host was awake on AC at first regression launch: load6.15/8.22/11.50,
61%free memory. Before the finite44-case gate at19:08, refreshed load was
4.33/5.79/8.56,64%free; root confirmed no competing owned heavy work. One worker
and `caffeinate -s -i` were used, without a full-suite run, sleep, test.slow,
timeout relaxation or provider/native action. All started commands reached
terminal results; no test server, listener, command or watch remains owned.

Root reports final CI diagnostic
`/tmp/seed285-ci-42802352676-1-terminal.json` has complete inventory, no gaps:
exactly the one assigned lifecycle failure. No additional failure is omitted.

No unresolved implementation gap, domain/ADR conflict, oversized file or human
decision remains. Root owns independent acceptance/refactoring, guarded repair
publication, restoring exact stash record
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-MROJ7o/record.json`
(OID`395b5a9f0681e2fab19dcf366067d2f4c5b2de2c`) and explicitly resuming slice2.
No commit, push, refactor pass, plan/status edit, installed-copy edit, stash
operation, formatter or hook-owned lint was performed.
