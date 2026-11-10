# Slice 1 acceptance

Coordinator inspected the production diff, both collector specs, direct basis
contracts, changed browser expectations, canonical fixture repair, and existing
reference boundary assertions. Original trigger: creation differs from attempt
start, or retained basis is unknown. Expected/observed: originals/repeats/new
points use attempt start; legacy same-attempt acquisition repairs that original
while a newer repeat is listed; unavailable bounds stay explained/excluded;
readers issue no acquisition; retained scope execution still reads 450 ms.
No gap or interim loss was discovered. The later action and richer follow-up
reading remain owed by slices 2–4; this slice admits no action.

Freshness at acceptance: unchanged, pinned trunk
`bf26952a9706f309f5b5f14d9b31fa707f277f11`, base accepted claim85eb42227.
Named supplier `SEED-285#compare-landed-timing-with-recent-builds` is already
accepted in the claim's ancestry and consumed by ciWallTimeReference ->
ciPriorBuildReference. Incoming trunk changes name other work; no newly
attributed supplier behavior conflicts with this slice. Incoming machine JSON
lock changes matter to ordinary later integration/storage work, not a new
supplier comparison. Independent refactor is the next delivery boundary.

## Inspected implementation return and terminal proof

# Slice 1 implementation return

Outcome: provider-reported attempt start through completion is now the uniform
CI comparison/history wall interval for first attempts and reruns. Retained
records declare `timingBasis: attempt-start`; legacy unknown/other bases are
explained wall-history gaps and excluded by the existing shared prior-reference
owner. Background collection refreshes only the retained run/attempt from
GitHub's exact-attempt read or the adapter's full discovered identity. Newer
attempts cannot replace that original. Atomic persistence changes only that
attempt's bounds/basis and preserves its verdict, selection, proof and identity.
Local browsing does not acquire missing bounds. Test execution and the separate
job-chain measure preserve their meanings.

Promises C043-C048: observed in tests/support/ci-attempt-wall-time-basis.test.mjs,
its first/repeat and missing-start assertions, its unknown/workflow-creation
retention cases (gap words, excluded reference, preserved450ms scope proof),
and the two actual collector boundary specs below. C109: the implementation
continues to call dashboard/server/ciWallTimeReference.ts -> shared
ciPriorBuildReference.ts; no second sample/average/filter calculation was added.
Its existing focused reference cases prove five samples, outlier rules, zero,
completeness and exact/selected provenance.

Owned paths (no planning files):
- dashboard/server/baseCiAdapterRevisionLookup.ts
- dashboard/server/baseCiGithubRevisionLookup.ts
- dashboard/server/baseCiRevisionNearest.ts
- dashboard/server/ciWallTimeReference.ts
- dashboard/server/landedCiAttemptTiming.ts
- dashboard/server/landedCiCollectionLanding.ts
- dashboard/server/landedCiHistoryEntries.ts
- dashboard/server/landedCiHistoryStore.ts
- dashboard/server/landedCiKeepResolution.ts
- dashboard/server/landedCiMeasuredBuilds.ts
- dashboard/server/landedCiObservation.ts
- dashboard/server/landedCiTimingBasis.ts
- dashboard/src/ciAttemptTiming.ts
- dashboard/src/ciHistoryGapWords.ts
- dashboard/src/landedCiHistory.ts
- dashboard/backend-tests/intent/landed-ci-attempt-start.spec.ts
- dashboard/backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts
- dashboard/tests/intent/intent-ci-comparison.spec.ts
- dashboard/tests/intent/intent-ci-comparison-locations.spec.ts
- dashboard/tests/support/storyCiObservedJobs.ts
- dashboard/tests/support/retainedTrunkProofs.ts
- docs/dashboard-development-intent-ci-comparison.md
- tests/support/landedCiHistoryTestData.mjs
- tests/support/ci-attempt-wall-time-basis.test.mjs

Proof acceptance locations:
- landed-ci-attempt-start.spec.ts: actual bare-origin landing/normal collector;
  legacy run41/attempt1 is supplied with workflow-creation bounds while GitHub
  lists faster attempt2. Exact attempt1 returns start10:01/end10:03; original
  and new run42 each project120000ms into points and the shared reference.
  When exact bounds are unavailable, the original is an explained excluded gap.
  Development-reader before collection and stopped-reader restart assert no
  provider acquisition. Setup uses MakeMe landing/history/proof and trunk CI
  builders; fixture input supplies only legacy/raw provider facts.
- landed-ci-attempt-start-adapter.spec.ts: real configured adapter command
  discovers newer repeat:2 and original first:1; collector repairs only the
  retained opaque original and restart history reading adds no discovery or
  GitHub calls. Setup is MakeMe provider/landing/history facts on real origin.
- intent-ci-comparison.spec.ts and intent-ci-comparison-locations.spec.ts:
  actual provider->comparison UI uses distinct first-attempt creation/start;
  baseline becomes4min57s and overall+22s while job-chain4min55s/+17s remains.
  Locations continuation still reuses the comparison without CI acquisition.
- landed-ci-scope-pending-order.spec.ts / retained-window.spec.ts retain exact
  equality assertions for every kept build/proof. Their shared retainedTrunkProofs
  now obtains the canonical build from MakeMe (including current basis) instead
  of comparing a raw pre-default input to the canonical persisted shape.
- Existing ci-prior-build-reference/boundaries/schema and scope-history cases
  retain real shared calculation/proof reading; no average rule was duplicated.

Terminal proof commands/results:

1. Failing-first `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/ci-attempt-wall-time-basis.test.mjs`: failed as intended at first-attempt creation fallback, missing-start fallback and unverified retained timing. Initial integrated spec had a synchronous fakeGitHub callback error; after fixing it to async, its baseline failed on required120s versus actual180/240s. Production implementation followed those observations.

2. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-attempt-start.spec.ts --workers=1`: pass, both available/unavailable cases including local reading. Those same cases are included in the wider gate below.

3. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- 'backend-tests/intent/(ci-comparison-(endpoints|equivalent-wall|cancelled|cancelled-awaiting|timing-gaps|selection|proof-gaps|taken|exact-landing|finality-.*|memory-.*|history-integration)|landed-ci-.*|ci-done-wall-.*|ci-prior-build-.*|ci-time-without-runner-waits)\.spec\.ts' 'tests/intent/intent-ci-(comparison(\.spec|-adapter.*|-taken|-locations|-skipped-landed|-cancelled-landing|-missing-run|-relative)|wall-time-history.*|prior-build.*|done-prior.*|done-reference-lifecycle)' --workers=1`: terminal exit1, exactly two field-only preservation fixture failures above, no others. Selection157 tests/73 files is retained at /tmp/seed285-slice1-dashboard-selection.txt; selected files contain no skip/fixme declarations. Report: dashboard/test-results/2026-11-10T09-59-07.090Z-37098/report.txt. Retain that strict result; the repair/replay below settles its two affected consumers. Unchanged passing observations remain reusable.

4. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-scope-pending-order.spec.ts backend-tests/intent/landed-ci-scope-retained-window.spec.ts backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts backend-tests/intent/intent-ci-comparison-receipt.spec.ts tests/intent/intent-scope-collected-file-timing-gaps.spec.ts tests/intent/intent-scope-collected-file-timing-history.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-scope-prior-build-average.spec.ts tests/intent/intent-scope-prior-build-states.spec.ts --workers=1`: terminal exit0, session86941. Repairs plus newly identified real consumers;10 files, no broad rerun.

5. `npm run typecheck:dashboard`: terminal exit0, session27851, includes new adapter spec and canonical fixture changes. Earlier exact-optional typing defects were repaired before acceptance.

6. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/ci-attempt-wall-time-basis.test.mjs tests/support/ci-prior-build-boundaries.test.mjs tests/support/ci-prior-build-reference-schema.test.mjs tests/support/ci-prior-build-reference.test.mjs tests/support/dashboard-ci-adapter-revision-lookup.test.mjs tests/support/dashboard-ci-revision-nearest.test.mjs tests/support/dashboard-landed-exact-build.test.mjs tests/support/dashboard-later-trunk-build.test.mjs tests/support/dashboard-later-trunk-landed.test.mjs tests/support/intent-ci-scope-history-cohort.test.mjs tests/support/intent-ci-scope-history-gaps.test.mjs tests/support/intent-ci-scope-history-links.test.mjs tests/support/intent-ci-scope-history-matching.test.mjs tests/support/intent-ci-scope-history-provenance.test.mjs tests/support/intent-ci-scope-history-timing.test.mjs tests/support/intent-ci-scope-history-units.test.mjs tests/support/intent-ci-scope-history.test.mjs tests/support/landed-ci-history-identity-subject.test.mjs tests/support/landed-ci-history-identity.test.mjs tests/support/landed-ci-history-order.test.mjs tests/support/landed-ci-history-proof-finality.test.mjs tests/support/landed-ci-history-proof-versions.test.mjs tests/support/landed-ci-history-reading-order.test.mjs`: terminal exit0, session28656,23 files. Final new five-case wall-basis tests also assert preserved scope test execution.

Consumer trace: /tmp/seed285-slice1-consumer-trace.md. Actual installed command:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe --base HEAD --term 'run creation' --term 'attempt start' --term 'attemptOf' --term 'startedAt' --term 'landedCiHistory' --term 'measuredBuildOf' --term 'gapReasonWords' --term 'serveObservedComparisonAttempts' --term 'observedFirstAttempts' --term 'retainedTrunkProofs'`
All796 located consumers have dispositions:149 run,647 excluded with concrete
boundary reasons. Relevant helper terms were followed to their journeys; the
changed surface/proof set covers81 distinct dashboard files and23 Node files.
False-positive workflow/session timestamps, installed/source runtime, records,
and mounted facts that already supply normalized bounds are identified there.
No unexcluded consumer or required observation is left unrun.

Expensive-proof decision retained/reconsidered: macOS awake/onAC, guarded with
caffeinate-s-i and one Playwright worker, root has no heavy job running. At final
follow-up launch load32.19/25.40/23.02,48%free; selected finite workloads were
sequenced, with terminal ownership retained. No timeout relaxation, sleeps,
flaky retry or real provider mutation. All owned test servers/processes ended
through their fixture cleanup. No active verification commands remain.

No open implementation gap, scope amendment, ADR/North-Star conflict or
additional decision. Later slices2-4 remain as planned and were not implemented.
No commit/push/status mark/refactor/formatter/hook-owned lint was performed.
Root's planning files remain root-owned and were not changed by this agent.

## Accepted independent refactor

# Slice 1 independent refactor return

Completed the read-only check pass, then made two small cohesion edits within
CI evidence acquisition and its canonical test-data support:

- `dashboard/server/baseCiGithubRevisionLookup.ts`: one private
  `readExactAttempt` now owns the existing exact-attempt route and raw-provider
  normalization for retained timing refresh and cancelled-latest fallback.
  Earlier-attempt fallback still uses its requested run/attempt identities;
  retained refresh still checks the actual provider identity. Request method,
  route, signal, ordering, error handling and output fields are unchanged.
- `tests/support/landedCiHistoryTestData.mjs`: both current-basis defaults use
  the authoritative `attemptTimingBasis` constant rather than repeating its
  literal. Explicit legacy/unknown test facts still override that default.

No other refactor edits, new public contracts, production subsystems,
configuration, generated artifacts, renamed/split/deleted files or speculative
code. The shared refresh helper's use during both decision and application is
needed: the latter also preserves an existing build for a newly seen receipt.
That is one rule used at two distinct persistence paths, not duplicated policy.
No further duplication, naming, surgery, dead-code or test-cohesion candidate
requires an edit. Parent-owned record organization matches its supplied seams.
All current changed files were inspected under the 250-line check; after edits,
the two refactored files are 198 and 197 lines before coordinator formatting.

## Verification and inspected observations

1. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-attempt-start.spec.ts backend-tests/intent/ci-comparison-exact-landing.spec.ts --workers=1`
   Terminal exit 0, session14227.
   The actual collector's GitHub exact-attempt path still repairs original41/1
   while faster41/2 is listed, yields120000ms alongside new42, explains/excludes
   unavailable original bounds, and reads locally before collection/after
   restart without acquisition. The exact-landing comparison cases preserve
   selection, including a cancelled latest attempt choosing its own earlier
   completed attempt. Setup and assertions are unchanged in those two specs;
   collector setup supplies raw/legacy provider facts, not the refreshed result.
2. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/ci-attempt-wall-time-basis.test.mjs tests/support/dashboard-ci-revision-nearest.test.mjs tests/support/landed-ci-history-order.test.mjs tests/support/landed-ci-history-proof-finality.test.mjs`
   Terminal exit 0, session98574.
   Direct basis tests retain independent first/repeat/missing-start and
   unknown/other-basis assertions plus450ms retained scope execution. Existing
   selection, ordered-history and proof-finality contracts preserve their
   canonical builder outputs and accepted proof. All domain setup remains via
   MakeMe; no assertions or scenario inputs were changed by this refactor.
3. `npm run typecheck:dashboard`
   Terminal exit 0, session28672, including the private typed helper and the
   canonical JS builder's shared TS constant import.
4. `git diff --check`: exit0, no whitespace errors.

Accepted slice1 proof outside the exact-provider path remains reusable:
normalization, wall/reference eligibility, persistence, history projection,
UI wording/navigation, adapter lookup, scope-proof reading and browser fixture
shape are unchanged. The builder import preserves the same value and override
semantics; both repaired retainedTrunkProofs consumers keep their accepted
exact equality observations. The earlier loop keeps its existing traversal,
catch/break and requested-identity override; provider decode/transport is now
shared with the replayed real collector. The prior broad gate's two strict
fixture failures and their accepted repair dispositions remain as recorded;
this refactor does not relabel the failed run as passing. No broad rerun.

## Consumer trace

Installed command:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe --base HEAD --term readExactAttempt --term attemptOf --term earlierAttemptsOf --term attemptTimingBasis --term retainedTrunkProofs`

Record: `/tmp/seed285-refactor1-consumer-trace.md`.
All682 located consumers are disposed:129 reused,553 excluded with their
accepted concrete boundary reasons. Every located path also appeared in the
incoming accepted trace; no new consumer path was found. Private helper and
constant references have no new externally observable effect. Reused entries
refer to `slice-1-proof.md` and the incoming accepted trace; the affected
provider path is replayed above. No unexcluded/unproved consumer remains.

Expensive-proof decision refreshed before launch: this macOS host is awake on
AC, load7.76/13.66/18.26,54%free memory; root confirmed no competing owned heavy
job. Run the finite two-spec browser gate sequentially with one worker and
caffeinate-s-i, then four focused Node files and typecheck. No full suite,
timeout relaxation, wall-clock sleeps, flaky retry, live project enablement or
provider mutation. All three command sessions reached terminal exit0; no
owned commands/watches remain. No commit/push/formatter/hook-owned lint or plan
status change. Approximate active refactor elapsed time:10minutes.

No unresolved gap, ADR conflict, North Star conflict, plan restriction dispute
or human decision is required.

## REFACTOR COMPLETE

Delivery freshness: unchanged at `f46b5d8e2f1f60d3e8e1b46923b0d54ea424669a`;
new incoming changes are unrelated preparation records, with no named supplier
behavior to reconcile. Source and independently accepted proof remain current.

Mechanical delivery repair: the formatter correctly refused `require-await`
on adapter `attemptOf` before commit/status/publication. Coordinator replaced
async-without-await with explicit `Promise.resolve`, preserving its result and
Promise contract, within the accepted adapter path and consumer trace; no new
representation or path. Already-traced repair, broader proof unchanged.
`PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/dashboard-ci-adapter-revision-lookup.test.mjs tests/support/ci-attempt-wall-time-basis.test.mjs` passed (session76739).
`PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts --workers=1` passed (session93545): original opaque identity migrates and reader restart acquires nothing.
Formatter preparation is repeated because this repair invalidated it.
