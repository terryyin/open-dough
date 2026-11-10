# Slice 3 named-sibling reconciliation

Attribution: SEED-261#map-ci-adapter-and-coverage-test-data integration49367c2e4d10ce1aeb96bb7a40512e585fa0bd8c (sibling tip b6690be48d437ebd72946ba8426fcf9612a562af). Inspected the integration against its first parent, not a generic trunk diff. HEAD remains c61170efdc7bddc5ce0b58ed24e0ff4b6550a73b; no merge/rebase/reset/stash/commit/push.

## Reconciled paths and actual behavior

- tests/support/ciTimingTestData.mjs: exact accepted canonical attempt builder. Keeps optional discovery facts absent with .with, adds failed outcome, accepts check/context/URL and preserves explicit URL while retaining the prior incidental URL default. Existing CiTimingJobBuilder is unchanged.
- dashboard/tests/intentCiAdapterProofProject.ts: combines sibling passed/failed/options delegation through MakeMe with our canonical proof-entry collector and narrow opaque return typing. Default time/URL and explicit check/time/URL facts remain visible. No queue/coverage getters imported.
- dashboard/tests/intent/intent-ci-proof-adapter.spec.ts, intent-ci-proof-adapter-reasons.spec.ts, intent-ci-comparison-adapter-taken.spec.ts: exact accepted pending, timed, retry-failure and contextual attempt arrangements; current proof summary routes and named collector declarations retained.
- dashboard/tests/support/comparisonRendering.ts, dashboard/backend-tests/runtime/comparison-renderer-vite-cache.spec.ts: exact accepted private optimizer cache lifecycle and its concurrent-renderer regression. The immutable Vite graph, production app CSS and rendered domain values are unchanged.
- tests/test-runner-split.sh: exact accepted clearing of inherited split, outcomes and deadline settings from nested runner invocations. Runner production is unchanged.

Seven adopted files exactly equal the accepted integration bytes; the adapter harness is the intentional combination. All eight paths stay below250 formatted lines; largest adapter harness241, canonical builder141. No unrelated queue/coverage/planning/closure payload adopted, no new local policy. Existing canonical .with is retained with its accepted source, not judged dead from this branch's partial sibling reconciliation.

## Commands and terminal results

All from the assigned checkout, pinned Node24.21.0/Homebrew Bash. Resource decision: AC, load10.10/free65%, unrelated dark-theme lint active, no competing owned heavy proof. Kept one worker/job, caffeinate -s -i, heavy gates sequential. No sleeps/test.slow/timeouts/retries. AGENTS.md#failing-and-flaky-tests applies as written.

Browser driver owned session81953 to terminal exit0: **49 passed (51.2s)**,18 files. Includes requested three adapter specs, all direct shared builder/harness consumers, renderer cache regression and four mounted-unit journeys. Exact expanded driver arguments:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/ci-comparison-taken.spec.ts dashboard/backend-tests/intent/ci-comparison-timing-gaps.spec.ts dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts dashboard/backend-tests/intent/landed-ci-history-pending-sources.spec.ts dashboard/backend-tests/intent/landed-ci-proof-adapter-units.spec.ts dashboard/backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts dashboard/backend-tests/intent/landed-ci-scope-adapter-shared-attempt.spec.ts dashboard/backend-tests/intent/landed-ci-scope-proof-adapter-recovery.spec.ts dashboard/backend-tests/runtime/comparison-renderer-vite-cache.spec.ts dashboard/tests/intent/intent-ci-comparison-adapter-planning-skip.spec.ts dashboard/tests/intent/intent-ci-comparison-adapter-taken.spec.ts dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts dashboard/tests/intent/intent-ci-comparison-mounted-units.spec.ts dashboard/tests/intent/intent-ci-proof-adapter-reasons.spec.ts dashboard/tests/intent/intent-ci-proof-adapter.spec.ts dashboard/tests/intent/intent-ci-proof-legacy-results.spec.ts dashboard/tests/intent/intent-ci-status-wall-time.spec.ts dashboard/tests/intent/intent-ci-wall-time-history-adapter.spec.ts --workers=1 --reporter=line
```

Node and shell/type/closure gate owned session94796 to terminal exit0, dependency-ordered:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/support/dashboard-ci-adapter-revision-lookup.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-adapter.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-cli.test.mjs tests/test-runner-split.sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_SPLIT=2/3 OPEN_DOUGH_TEST_OUTCOMES=/tmp/slice3-inherited-runner-outcomes.tsv OPEN_DOUGH_TEST_DEADLINE_MS=1 OPEN_DOUGH_NODE_DEADLINE_MS=1 OPEN_DOUGH_SETUP_DEADLINE_MS=1 caffeinate -s -i bash tests/test-runner-split.sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" npm run typecheck:dashboard
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/native-evidence-identity.sh
git diff --check
```

Direct inherited invocation deliberately presents split2/3, an outer outcomes path and already-expired outer deadlines; nested run_split clears them, so its independently expected all/share/invalid settings cases pass. The maintained runner invocation passes too.

## Setup and observing assertions

- intent-ci-proof-adapter-reasons: retry at later time succeeds, failed earlier attempt remains failure; independent verdict/count/attempt label, remembered proof and no-query-on-ambiguous identity assertions pass with check/run distinctions preserved.
- intent-ci-proof-adapter: explicit MakeMe pending attempt leads to completed ancestor proof; independent attemptId/counts/oversized summary and verdict-before-proof assertions pass. intent-ci-comparison-adapter-taken: explicit timed completed ancestor and pending tip retain provisional comparison, independent baseline/branch time and not-landed wording.
- Other selected backend/browser adapter cases independently observe opaque attempt identity, pending-to-passed retained points, runner-wait timing gaps, same opaque ID across runs, shared true attempt and recovery. dashboard-ci-adapter-revision-lookup and CI proof leads Node tests observe contextual attempt selection and ranked summary through real adapter reads/CLI.
- comparison-renderer-vite-cache regression actually creates two renderers concurrently, independently asserts distinct cache paths under temp/outside shared default, existing paths while live, and removal after close. Mounted-unit four journeys render production components/CSS and independently assert case+2 and file no-change at overall, entry, folder and file/tree levels.
- test-runner-split actual nested runner checks every expected check name/share/timing record and absence of inherited OPEN_DOUGH_TEST_* values; no predicate or expected share changed.

## Preserved proof and value comparison

An inline node --experimental-transform-types comparison imported HEAD's old builder from git show as a data URL and the current canonical builder: seven prior routes (passed with timing; passedWithoutTimes/pending/incomplete with and without check) deep-equaled. passed helper independently matched prior run/attempt/SHA/branch/time/mainRun URL facts; failed helper independently matched failure/time/check/explicit URL. Exit0 before browser launch.

The prior105 browser/backend observations remain accepted for unchanged collector/ZIP/proof entry/rendered values; relevant adapter and cache routes were renewed by49, not assumed unchanged. The19 real collector snapshots remain applicable because no fragment, summary, entry, evidence, report conversion or proof transport value-producing code changed in this reconciliation. Cache placement changes only the temporary optimizer location/lifetime, observed by its own regression; production markup/CSS promise is renewed on mounted units and unchanged elsewhere. Prior typing-only repair stays intact. No repeat of the whole105 or19 snapshot comparison was made.

## Trace and handoff

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD" --base HEAD --term CiAdapterAttemptBuilder --term aCiAdapterAttempt --term passed --term passedWithoutTimes --term failed --term pending --term ListedAttemptOptions --term ciTimingTestData --term createComparisonRenderer --term comparisonRendering --term viteCacheDir --term run_split --term OPEN_DOUGH_TEST_SPLIT > /tmp/slice3-reconciliation-trace.md
```

Every located row has run/reused/covered/excluded disposition. Direct actual attempt consumers are the three Node and16 browser/backend selections; renderer lifecycle regression plus mounted units cover cache-only effect, with other unchanged rendering observations retained. Generic status words/split environment references and imports of unchanged helper exports do not gain a changed effect. Native identity confirms the MakeMe runtime import closure remains valid after canonical builder adoption.

No unresolved failure/flake, missing selected observation or human-owned decision identified. No formatting/lint/done mark/publication performed. Return uncommitted for root's fresh refactor, final source/sibling settlement and guarded delivery from the same pending base.

## Coordinator acceptance

At current main49367c2e4, selected source remains unchanged. Inspected attributed adapter builder/fixture and setup conversions, cache lifecycle/regression and nested-runner environment isolation. Existing attempt facts deep-equal; affected routes renewed by49 browser/backend and3 Node suites plus both runner conditions, typecheck/native identity. Original collector/proof output observations remain unchanged. G2 is proved; no remaining sibling mismatch in this slice’s affected behavior.

## Coverage clarification

Independent reviewer refactor_3_reconciled identified overbroad wording on cache-only trace rows: some mounted specs were not in the original105 selection. Those rows now state coverage of the changed cache lifecycle by the concurrent-renderer regression and mounted-unit journeys, with unchanged markup/CSS behavior. They claim no individual unrun spec pass; actual per-spec runs remain solely those in the primary and reconciliation commands. No new rendering behavior was changed or left unproved.

Fresh independent refactor `/root/refactor_3_reconciled`: none — already clean; ## REFACTOR COMPLETE. No product edits or invalidated proof; cache-only coverage qualification corrected as above. Final source check unchanged at49367c2e4; named sibling behavior reconciled and remaining product changes irrelevant to this slice.
