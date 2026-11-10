# Make GitHub Actions run and attempt-job test setup map directly to the domain

**Identity:** SEED-261#map-github-actions-ci-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-github-actions-ci-test-data)
**Source review:** [source-review.md](./source-review.md)

## Goal and boundaries

Maintainers can trace the same arranged GitHub run, attempt, revision, verdict
and timing across dashboard and execution tests through MakeMe. Convert valid
synthetic run and attempt-job setup and remove duplicate construction while
preserving independent expectations and each consumer's existing behavior.
Real Git, commands, response routing, pagination, request counts, faults,
clocks, processes and teardown stay in harnesses. Captured job timestamps,
logs, exact malformed/partial responses and encoder-input examples stay
literal where their form is the evidence. Adapter attempts, queue/coverage
records and proof fragments/summaries remain with the sibling stories. This
is test-data conversion; no UI, provider contract or CI policy change is
selected. Mixed fixtures convert their GitHub facts only.

## Current decisions

- Reuse `makeMe.aCiRun`, replacing its dependency on the suite-local
  `CiRunAnswer` with the production run contracts. The production owners are
  [`observedRun` and `createGitHubActions`](../../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs),
  [`ListedRun`](../../../dashboard/server/baseCiNearest.ts) and the current
  attempt projection in [`ci-runs`](../../../src/skills/dough-execute-plan/scripts/ci-runs.mjs).
  The current `aRevisionCiRun` in
  [`ciComparisonTestData`](../../../tests/support/ciComparisonTestData.mjs)
  already builds the production `ListedRun` projection for fast comparison
  rules. Reuse its GitHub facts through the same construction owner rather
  than adding another run model; preserve provider-neutral adapter attempts
  separately. Keep compatibility names only while their consumers need them.
  Use named facts for identity, revision, branch, event, outcome and times;
  deterministic incidental defaults must not hide facts deciding a case.
  Missing timing, `null` conclusions and opaque IDs need their actual meaning,
  not new validity restrictions. Preserve existing callers while moving the
  construction rule behind the one public MakeMe import.
- Reuse the existing test-only
  [`apiRun` / `apiJob`](../../../src/skills/dough-execute-plan/scripts/github-actions-api-test-fixtures.mjs)
  transport seam for actual GitHub field names. Move or expose the smallest
  shared encoding part when dashboard consumers need it; leave route parsing,
  scripted answers and `OriginAnswer` envelopes in their harnesses. Eliminate
  the repeated encoding in `actionsRunsAnswer` and the comparison attempt
  endpoint. Preserve workflow ID and repository ownership when reuse needs
  them. Audit optional job URL/step fields through their actual consumers;
  `apiJob` currently only renames `databaseId`, so an observed `url` must not
  silently become an API `url` instead of `html_url`. Add only the variants
  used by a real converting consumer, with no framework or builder-only tests.
- Attempt-job setup uses the GitHub job facts returned by `attemptJobs` and
  the actual [`ReportedAttemptJob`](../../../dashboard/server/ciTimeWithoutRunnerWaits.ts)
  boundary, with transport encoding when required. Adapter `CiTimingJob`
  duration/dependency facts are a separate concept and stay out of this work.
  Extend the same job construction for diagnostic identity, status and steps
  when that consumer arrives. Preserve data passed to each real decoder;
  keep the raw-input mapping test literal.
- Keep the three documented real observations in
  [`storyCiObservedJobs`](../../../dashboard/tests/support/storyCiObservedJobs.ts)
  literal, including carried-over jobs starting before attempt creation.
  Its synthetic run wrappers can delegate. Preserve the completion distractor
  in `storyCiComparisonLandedOutcome` with its reversed time bounds as exact counterexample input; conversion
  must not silently normalize it into valid timing.
- Follow [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  and the [test data architecture](../../../tests/README.md#test-data-architecture).
  The comparison is today's duplicate construction; the useful gain is one
  production-aligned construction rule and readable case facts with unchanged
  discriminating proof. No runtime speed gain is claimed.
- The existing [North Star: One Intent workspace with landed CI evidence](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
  keeps measured attempt identity distinct from the revision/landing it
  represents. This conversion follows that distinction and adds no collection,
  history or rerun capability. No new direction topic or ADR is needed.
- Execute in Story Branch Mode; no slice needs to act from trunk. Reconcile
  current trunk before each delivery. Other SEED-261 conversions and CI timing
  work can touch mixed fixtures: preserve their facts and consumer behavior;
  shared files alone do not create a blocking dependency.

## Required cohesive reorganization

`tests/support/makeMe.mjs` is 255 lines at `a1d25c1dd`; slice 1 owns its
reorganization alongside the run conversion. Keep the public MakeMe entry
and fresh-builder semantics. Move CI-specific type/default/construction
responsibility to the shared CI run/job module, leaving the entry to expose
builders; compose a CI builder group if needed. This seam separates domain
construction from public aggregation, and must leave each edited module at
most 250 lines under the existing refactor check. Preserve every existing
MakeMe caller, dashboard type inference and the native import closure; the
traced consumers, dashboard typecheck and native evidence check prove them.
The other currently expected implementation files are at most 250 lines;
recheck any added edit and keep its cohesive cleanup in the owning slice.

## Preparation evidence

Observed on 2026-11-09 in the assigned workspace at
`006bf7961482fd6e997a34e413cb8352200b532b` and `889985084`, using Node
24.21.0 and Homebrew Bash 5. Native `npm`, `browser` and `check` setup passed; Chromium was
153.0.8010.12. The host was on AC, load about 6.24, free memory 54%; probes
used one browser worker alongside short Node selections. The advance to `889985084` changed planning/UX direction only; none of the
probed code or test paths changed, so the observed runtime inputs are identical
across those revisions. All scratch edits were restored before preparation recording.

Commands below run from the owned checkout. `N <paths>` means the literal
prefix `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh <paths>`.
`D <selection>` means the literal prefix `env -u NO_COLOR -u FORCE_COLOR
-u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH"
npm run test:dashboard -- <selection> --workers=1 --reporter=list`.
These abbreviations only avoid repeating the same environment in the table.

| Decisive premise and consuming operation | Observation and result |
| --- | --- |
| A MakeMe run reaches the Intent wall-time display with the same identity, revision and timing; the independent display assertion discriminates the stated timing. | `D 'intent-ci-status-wall-time\.spec\.ts$' --grep 'a listed run from 10:00 to 10:03 shows CI wall time 3 min with the attempt'`: baseline 1 passed (4.7 s); scratch wrap of that run in `aCiRun.with(...).please()` passed (4.1 s); changing only start 10:00 to 10:01 failed with expected 3 min, observed 2 min after identity/revision assertions passed; restored 1 passed (4.5 s). |
| The same observed-run construction reaches cancelled-latest/earlier-completed selection and preserves exact revision ownership. | `env PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/dashboard-ci-revision-nearest.test.mjs`: baseline and scratch MakeMe wrapper passed; changing only earlier run `headSha: a` to `b` failed the maintained attempt assertion (expected 1, actual 2); restored passed. |
| Observed run fields survive the existing API seam and production listing mapper without losing start/completion or ordering time. | `N src/skills/dough-execute-plan/scripts/ci-github-actions-observed-run.test.mjs`: baseline and scratch MakeMe wrapping of the listed run passed; changing only built `startedAt` 10:00 to 10:01 failed the unchanged 10:00 assertion after `createGitHubActions.listRuns`; restored passed. The direct raw-to-observed mapping example stayed literal. |
| An observed MakeMe run encoded through `apiRun` preserves opaque source identity and exact-SHA reuse through the real evidence reader and reuse decision. | `N src/skills/dough-execute-plan/scripts/ci-reuse-github.test.mjs`: baseline passed; scratch run factory used `apiRun(aCiRun.with(observedFacts).please())`, retained workflow ID/repository and raw overrides, and passed. Changing only builder SHA to another revision failed both independent qualifying-reuse assertions (`false` instead of `true`); restored passed. |
| GitHub current-attempt decoding preserves selected workflow, check/context and jobs, and detects wrong workflow ownership. | `env PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-github-current-attempt.test.mjs`: baseline, scratch local run factory using MakeMe + `apiRun` with raw workflow ID/overrides, and restored runs passed. Changing only default workflow ID 7001 to 7002 failed the independent deep equality (`check` undefined instead of `ci.yml`, workflow ID 7002 instead of 7001). |
| Synthetic attempt-job construction preserves carried-over durations while retaining captured observations literally. | `D 'ci-time-without-runner-waits\.spec\.ts$' --grep 'a re-run retains the durations of carried-over jobs even when they started before their reported creation'`: baseline 1 passed (4.0 s); scratch temporary `aGitHubJob.withFacts(...).please()` around only the synthetic longer-carryover override passed (3.2 s); changing that completion 09:47:07 to 09:48:07 failed the independent 337000 ms assertion with 397000 ms; exact restoration passed (3.2 s). Captured job arrays stayed unchanged; the temporary getter was removed. |
| Integrated-state proof reaches real Git, executed commands, provider evidence and observer completion in the planned profile. | `N src/skills/dough-execute-plan/scripts/ci-integrated-state-journey.test.mjs`: exit 0. The suite observes validated C, unresolved without policy, and B's own failure beside C's success through the real observer; its provider read is covered by the current-attempt discrimination above. |
| Observer failure proof consumes MakeMe run and job identity through the existing API seam and emitted event boundary. | `env PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/watch-ci-execution-failures.test.mjs`: baseline exit 0 (0.470 s); scratch first-case runs used `aCiRun.with(run(facts)).please()` and jobs used a temporary `aGitHubJob.withFacts(...).please()` getter, exit 0 (0.690 s). Changing only the failed Backend job's name to Wrong job failed the maintained emitted `failedJobs` deep equality, preserving run 42 / attempt 1 / job 101. Exact restoration passed (0.709 s); the temporary getter was removed. |
| Current comparison construction reaches real Git history, GitHub transport, endpoint selection, wall-time display and shared-attempt job-page identity. | On 2026-11-10 at `a1d25c1dd`, reconstructed only the first historical fast-forward case from `889985084:dashboard/tests/intent/intent-ci-comparison-fast-forward.spec.ts` in temporary `dashboard/tests/intent/intent-ci-comparison-preparation-probe.spec.ts`; changed its moved `listedAttemptJobPages` import to `storyCiComparisonRequests.ts`. `D intent-ci-comparison-preparation-probe.spec.ts`: baseline 1 passed (7.0 s test / 10.2 s run); scratch `wall` returned `makeMe.aCiRun.with(theSameFacts).please()`, 1 passed (6.4 / 7.6 s). Changing only builder run ID 402 to 499 failed the independent final job-page assertion: expected `[401/1/1, 402/1/1]`, received `[401/1/1, 499/1/1]`; both endpoint identity and 3 min 20 s assertions passed first. Exact restoration passed (6.9 / 7.8 s). This is a reconstructed comparison on current code, not a pass of the retired spec. |
| Current fast comparison rules consume canonical run facts, distinguish exact branch/landing revision from later trunk, recover refused evidence and retain final answers. | At `a1d25c1dd`, `D backend-tests/intent/ci-comparison-endpoints.spec.ts backend-tests/intent/ci-comparison-memory-recovery.spec.ts`: 5 passed (4.8 s). Those tests already use `aRevisionCiRun` and independently assert the selected run/attempt, job timing, exact endpoint and read counters. Changing only the fast-forward case's builder `headSha` from `branch` to `later`, then selecting it with `--grep 'a fast-forward landing uses its exact branch tip'`, failed the unchanged `toMatchObject` at line 208: both endpoints became `none` instead of the exact branch build. Restoration: the same five tests passed (4.2 s). |

The 2026-11-10 probes ran in this assigned workspace on Node 24.21.0,
Chromium 153.0.8010.12 and Homebrew Bash 5 after native npm/browser/check
setup passed. Before launch: AC power, load 10.13 on 16 logical CPUs,
54% free memory, no full-suite admission owner or active test/build command
observed. Each sequence held one maintained repository admission for baseline,
scratch/fault and restoration, with one worker and `caffeinate -s -i`:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
  PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i \
  node scripts/local-test-suite.mjs repository "$PWD" "$PWD" \
  node /tmp/dough-261-probe.mjs
```

The temporary driver invoked the `D` command recorded in its row for each
phase. `/tmp/dough-261-endpoint-probe.mjs` used the same wrapper and the
second row's commands. Both drivers restored original bytes in `finally`;
the temporary browser spec was removed and `git status --short` was empty
before record writes. Driver/log paths are incidental local evidence, not
execution prerequisites; the rows record the reproducible inputs and results.

The prior 2026-11-09 contention timeout remains a failed observation, never
accepted proof. SEED-286's completed comparison-test work retired that spec
before this preparation. The current admitted reconstruction now settles the
previously unpaid conversion/discrimination premise, and the current fast
rule tests establish its replacement proof routes. No timeout was raised.
The earlier Node, wall-time and captured-job observations retain their stated
boundaries: their named tests, provider decoders and timing logic are unchanged;
MakeMe added unrelated builders without changing `aCiRun`'s copy semantics.
New comparison-rule consumers are covered by the fresh observations above.


## Proof and delivery gates

Each slice compares its arranged facts with the replaced setup, preserves
independent expected values and the same discriminating failure, and removes
superseded construction. Compare encoded bytes/values at actual API boundaries
where defaults move. Keep missing fields absent, pending conclusions null,
ordering stable and each attempt's own identity/times intact. Do not derive
expectations from the new builder. New builder methods land with real consumers;
remove unused variants and constructors when their last caller disappears.

At each implementation diff run the installed
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
with `--base HEAD`, changed exports and indirect helper exports as terms.
Starting terms include `aCiRun`, `CiRunAnswer`, `actionsRunsAnswer`,
`passingActionsAnswer`, `wall`, `serveActionsFor`, `apiRun`, `apiJob`,
`completedJobs`, `releaseRun`, `githubRun`, `listedRun` and `run` with its
module path when the plain identifier is too broad. Trace through helpers
into assertions and give every consumer a `run`, `reused` or justified
`excluded` disposition. The groups below name known consumers, not a file
limit; indirect lifecycle callers of shared constructors stay covered.

Execution uses [Execute Plan](../../../.agents/skills/dough-execute-plan/SKILL.md)
for independent post-change refactoring before final focused proof, slice
commits, publication and asynchronous CI repair.

Local gate. Follow [test automation](../../../AGENTS.md#test-automation) and
carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation brief and repair handoff. Follow
[native setup](../../../tests/native-setup.md), put Homebrew Bash 5 first on
`PATH`, and unset `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES`. Node checks use `bash scripts/test.sh`
with exact named paths. Each slice runs its named consumer selections,
`npm run typecheck:dashboard` when shared JavaScript changes, and
`npm run lint`. A MakeMe dependency change also runs
`bash scripts/test.sh tests/native-evidence-identity.sh`: MakeMe must stay
loadable in the native fixture's `tests/` + `src/` closure; use type-only
imports for dashboard contracts.

Before a long selection, inspect current host load, memory and competing
runs. Bound local dashboard concurrency to one or two workers and sequence
owned heavy work; leave unrelated runs with their owners. On fully awake
macOS with AC power wrap long/full runs in `caffeinate -s -i`; on battery,
plug in or start awake with lid open under `caffeinate -i` and inspect the
sleep log afterwards, as required by
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
No full local repository suite is required for this test-data conversion:
its broader gate is the traced consumers, including unchanged distributed
consumers of shared fixtures. Hosted CI runs the maintained full checks after
publication, with failures owned through applicable final CI under the same
policy. Never use wall-clock sleeps, `test.slow()` or suite/group/hook timeout
overrides.

## Slices

### 1. Revision judgment and CI status share the run facts
Type: Behavior
Status: done
Proof: Source examples 1 and 2. Run dashboard selections `tests/launches/agent-launch-base-ci`, `tests/intent/intent-ci-status` and `tests/intent/intent-ci-proof-(ancestor|reasons|sources)`, plus the Node support checks `dashboard-ci-revision-nearest.test.mjs`, `dashboard-story-branch-ci.test.mjs` and `requested-revision-ci-status.test.mjs` under `tests/support/`. Run affected project visit/home activation journeys found by the trace.

A test states selected-revision and ancestor run facts through MakeMe → the
real GitHub observation/revision lookup and dashboard read them → base-CI
judgment, selected attempt, pending/absent distinctions and wall-time display
are preserved. Replace the suite-local run type/construction with the
production-aligned shared run builder and existing API encoding. Consolidate
GitHub construction shared with `aRevisionCiRun`, retaining the adapter
projection separately, and perform the MakeMe reorganization above. Convert
`baseCiActions`, `intentCiStatusPage`, `intentCiStoryRecords`,
`intentCiProofPage`, `intentSummaryCiProofFixtures`, their direct run setups
and the named Node support consumers. Incidental defaults belong in the
builder; the envelope and request route stay in `actionsRunsAnswer`.
Raw mapping inputs and deliberate malformed responses remain literal.
Keep every shared-seam caller compatible in this delivery and run its traced
consumers even when its case's data conversion is assigned to a later slice.

### 2. Story comparisons share attempt identity and job timing facts
Type: Behavior
Status: done
Proof: Source example 3. Run `tests/intent/intent-ci-comparison`, `tests/intent/intent-summary-story-comparison`, `tests/intent/intent-summary-ci-proof`, the `backend-tests/intent/ci-comparison-` family and `backend-tests/intent/ci-time-without-runner-waits.spec.ts` through the dashboard runner. Use the current endpoint, published-endpoint, timing, memory, finality and client-read owners for their rules; retained GitHub/UI journeys and mounted presentation tests keep their existing boundaries. The retired fast-forward spec is not an execution selector. Retain equivalent focused coverage of the observed unique job pages `401/1/1` and `402/1/1` at the actual GitHub lookup boundary, plus independent endpoint/timing observations, retry/recovery counts and settled caching; do not restore a large journey solely to own a rule. Run the slice 1 status selections again if their encoding seam changes.

A comparison's Baseline, Branch and Landed name runs/attempts and synthetic
job times through MakeMe → the real comparison reads them at their endpoint
revisions → the same timing, gaps, equivalent-result selection and one-read
sharing are observed. Replace or delegate `wall`; convert the Done,
EarlierLanding, FastForward, LaterFastForward, Skipped variants, Taken,
Retry, LandedOutcome and CancelledLanding fixtures, Summary comparison
fixtures/variant publishers and direct run overrides in their consumers.
Unify the comparison attempt endpoint's transport encoding with the listing.
Convert any valid GitHub facts still arranged outside MakeMe in backend
comparison setup, keeping already-converted rule cases on the same owner.
Introduce the shared GitHub job builder with these real timing consumers;
convert valid synthetic job arrangements in the backend timing cases and
synthetic run wrappers around captured observations. Preserve the captured
jobs and invalid-time distractor exactly as stated in Current decisions.

### 3. Observer failures retain their run, attempt and job evidence
Type: Behavior
Status: done
Proof: Source example 4. Node runner selections under `src/skills/dough-execute-plan/scripts/`: `watch-ci-execution.test.mjs`, `watch-ci-execution-startup.test.mjs`, `watch-ci-execution-failures.test.mjs`, `watch-ci-execution-hold.test.mjs`, `watch-ci-execution-coverage.test.mjs`, `ci-github-acquisition.test.mjs`, `ci-github-current-attempt.test.mjs`, `ci-github-actions-observed-run.test.mjs`, `ci-github-diagnostic.test.mjs`, `ci-github-diagnostic-logs.test.mjs`, `ci-github-diagnostic-inventory.test.mjs`, `ci-github-test-fixtures.test.mjs` and `ci-observer-stream.test.mjs`. Add every traced mailbox/revision-coverage consumer of the delegated run factories.

The GitHub harness holds MakeMe runs and jobs → the actual observer reads
listings, current/earlier attempts, paginated jobs and logs → unfinished-run
failures, earlier-attempt failures after a success, second-page failures and
the original diagnostic details remain observable. Delegate `run` in
`watch-ci-test-fixtures`, `releaseRun` in `ci-mailbox-process-test-fixtures`
and `completedJobs` in `ci-github-test-fixtures`; convert direct valid REST
arrangements in the named specs and observed-job arrangements in failure
cases. Extend job construction only for fields these diagnostics consume,
including URL and steps. Request admission, pagination, scripted reads,
process teardown and exact logs remain owned by the existing harnesses.
No mailbox coverage record or command-adapter construction moves here.

### 4. Reused validation keeps exact revision and current source attempt
Type: Behavior
Status: done
Proof: Source example 5. Run `ci-reuse-github.test.mjs`, `ci-reuse-github-command.test.mjs`, `ci-reuse-story-journey.test.mjs`, `ci-reuse-trunk-journey.test.mjs` and `ci-reuse-resource-journey.test.mjs` under `src/skills/dough-execute-plan/scripts/` with the Node runner. Preserve exact-SHA, opaque source identity, newer rerun, changing/partial answers and distinct target completion assertions.

Valid GitHub source runs/jobs come from MakeMe → the real reuse acquisition
and decision inspect their revision, workflow, repository and context → only
qualifying current proof is reused and the target keeps its own evidence.
Delegate the run/job construction in `ci-reuse-github-test-fixtures` and the
GitHub facts in reuse journey fixtures/direct command tests. Reuse the same
API encoder while carrying required ownership fields. Keep partial counts,
missing fields being tested, wrong-context mutations, malformed/duplicate
markers and echoed shell commands explicit; legitimate but nonqualifying
runs still use MakeMe. Command execution and produced proof text remain real
or exact evidence at their existing boundaries.

### 5. Integrated-state validation keeps the descendant's GitHub evidence separate
Type: Behavior
Status: done
Proof: Source example 6. Run `ci-github-current-attempt.test.mjs`, `ci-integrated-state-journey.test.mjs` and `ci-integrated-state-replaced-basis.test.mjs` under `src/skills/dough-execute-plan/scripts/`, plus traced GitHub-specific consumers. Check unresolved without policy, B's retained `not_required` basis when validated at C, and B's own failure beside C's success. Before final delivery run the complete traced Node/dashboard selections on the final state; reuse accepted checks whose paths and boundaries are unchanged.

Real commits establish accepted B and descendant C; C's covered command
actually executes → its provider harness builds the GitHub run/job facts
through MakeMe → the real current-attempt reader and observer keep B's own
basis separate from validation at C. Delegate `githubRun` and the construction
inside `recordRun` in `ci-integrated-state-github-test-fixtures`. Keep the
command's observed result, ancestry, policy, mailbox and publication mechanics
in the harness. Convert GitHub current-attempt projections where valid setup
needs them; provider-neutral adapter attempts in judge/custom tests remain
with their sibling story. Remove any now-unused GitHub constructors/variants.

## Readiness review

Plan refinement was not needed: this update removes the settled early probe
and keeps five cohesive conversion outcomes with their proof loops (revision/
status judgment, comparison timing, observer failures, exact-revision reuse,
integrated validation). Implementation, preserved external proof and displaced
construction removal stay together. The public-entry reorganization belongs
to the first consuming slice. No project numeric slice target is prescribed.

Reviewed source examples 1–6 against slices 1–5 and the recorded consuming
observations. The former comparison concern is settled by the admitted
reconstruction and current endpoint discrimination above. The plan now names
the actual fast rule/transport/presentation boundaries and existing
`aRevisionCiRun`; no additional run model or implementation-first slice is
needed. One construction rule and transport encoding serve GitHub facts while
harnesses retain operations and exact evidence. No remaining slice-specific,
cumulative-design, scope, proof-route, or human-owned decision concern was
identified. Readiness records preparation only; all five slices remain planned.


## Progress and learnings

### Slice 1
Revision judgment and Intent CI status arrange GitHub run facts through
production-aligned MakeMe (`databaseId` / observed shape) → `apiRun` → real
judgment and status reads. Shared construction lives in
`tests/support/ciRunTestData.mjs` (`githubCiRunFacts`); MakeMe entry exposes CI
and launch builder groups from `ciMakeMe.mjs` / `launchMakeMe.mjs` under the
250-line limit. `aRevisionCiRun` reuses the same GitHub facts and keeps
`adapterAttempt` distinct. Compatibility `id` mirrors `databaseId` while later
callers still read it. Comparison `wall` / job builders remain for slice 2.

Learning: `aRevisionCiRun` timing defaults must not be applied to judgment-only
Node cases that previously omitted wall-time bounds; those use `aCiRun`
(optionally with `branch`) instead.

Accepted focused proof (literal commands retained in execution conversation):
dashboard agent-launch-base-ci / intent-ci-status / intent-ci-proof-* /
intent-project-visit-ci / intent-home-activation (46 passed) plus
agent-launch-base-ci-recheck (2); Node nearest / story-branch / requested-revision
and ci-proof-leads*; typecheck:dashboard; lint; native-evidence-identity.

### Slice 2
Comparison fixtures arrange runs through `wall` → `makeMe.aCiRun` and
synthetic jobs through `aGitHubJob`; attempt/jobs transport uses shared
`apiRun`/`apiJob`. Captured observed jobs and the LandedOutcome reversed-time
distractor stay literal. `githubCiRunFacts` owns attempt-1
`createdAt`↔`startedAt` alignment when creation is omitted.

Accepted focused proof: backend ci-time + ci-comparison- (103); Intent
comparison/summary (136); encoding recheck of slice-1 status selections (42);
refactor wall/execution recheck (7); typecheck; lint; native-evidence.

### Slice 3
Observer/diagnostic GitHub run·attempt·job setup goes through MakeMe
(`run` / `releaseRun` / `completedJobs`·`completedJob`) and `apiRun`/`apiJob`
(observed `url` → API `html_url`). Harness routing, pagination, holds, clocks,
and teardown stay put; diagnostic log text stays literal. Omit incidental
`createdAt` in `run`/`releaseRun` unless the case states it.

Accepted focused proof: named watch-ci / ci-github / observer-stream Node
selections; mailbox + revision-coverage consumers of those factories;
refactor diagnostic/acquisition Node recheck; typecheck; lint; native-evidence.

### Slice 4
Reuse fixtures arrange source runs/jobs through MakeMe with `apiRun`/`apiJob`
carrying `workflowId`/`headRepository` ownership. Observed-first `run` /
`sourceRun` / `coveredJob` keep encoding in one place; opaque source ids stay
distinct from numeric dashboard `databaseId`.

Accepted focused proof: ci-reuse-github + command + story/trunk/resource
journeys; typecheck; lint; native-evidence.

### CI repair (registered SHA d9b19d637)
- Comparison-taken startedAt shadow: already fixed at HEAD via slice 2
  `githubCiRunFacts` alignment; focused proof green.
- Production-watcher restart/SIGINT: hosted CI exhausted the 30s default
  during real install/build (~27.3s) before shutdown; interim
  `test.setTimeout(90_000)` on that case (SEED-287 removes the allowance).
  Full serial file: 7 passed.

### CI repair (registered SHA 2a2038247)
- `run-processes` nested `passing.proof` page setup exhausted the 5s budget
  on a cold first consumer of shared dashboard/server artifacts; pre-warm
  those before preview substitutes. Focused file: 4 passed.

### CI repair (registered SHA 6274a964)
- `test-runner-interrupt` nested ready-wait: 30s starved under contested CI
  CPU before ready; raise `await_ready` to 90s for nested `scripts/test.sh`
  lifecycle, recheck ready after the bound, dump launch/log on timeout, clear
  inherited `OPEN_DOUGH_TEST_*` via `env -u`, touch ready before print, and
  narrow cleanup `pkill` to each check script path. Serial focused proof green.
  N-way self-parallel copies still contend past 90s (not CI's one-file shape).

### CI repair (registered SHA 53152ef1)
- Hosted run 42804393525: dashboard (7/12) failed
  `agent-launch-ad-hoc-codex-input` (5s poll, 0 turns),
  `landed-ci-scope-pending-proof` (landing-prepare `AbortSignal.timeout(10s)`
  under contested CPU; second case 30s test timeout), and
  `production-deployment` (45s install/build/preview budget).
  dashboard (5/12) aborted at `OPEN_DOUGH_DASHBOARD_DEADLINE` with 0 failed
  tests after ~300s — stale `longest-first` left 87 unrecorded specs at the
  median assumption and overloaded the deal.
- Repair: raise retained-report delivery to 30s (matches landing git op
  budget); interim 90s allowances on production-deployment and both
  landed-ci pending-proof cases; bound the Codex maintenance poll with
  `launchWaitMs`; refresh `dashboard/longest-first*` from this run's twelve
  times artifacts (87→12 unrecorded; ~992s predicted/share). SEED-287 owns
  removing the interim allowances. Focused three-file proof green under
  caffeinate.

### Slice 5
Integrated-state provider facts arrange runs/jobs through MakeMe
(`observedCiRun` / `coveredJob`) and encode with `apiRun`/`apiJob` at publish.
Harness keeps sequential `createdAt`, real Git, executed covered commands,
mailbox/policy/observer mechanics, and `observedRuns` projection.

Accepted focused proof: ci-github-current-attempt, ci-integrated-state-journey
and replaced-basis, traced GitHub-specific consumers; typecheck; lint;
native-evidence. Final-state traced Node/dashboard selections reused where
boundaries were unchanged.

## Story obligations

### G1. CI adapter attempts belong to sibling stories
Reported: slice 1 — "source review — sibling-story ownership of CI adapter attempts"
Story clause: "CI adapter attempts, queue and coverage records, and CI proof fragments and summaries belong to the sibling stories."
Disposition: excluded "CI adapter attempts, queue and coverage records, and CI proof fragments and summaries belong to the sibling stories."
Commitment: 21.1, 21.2, 21.3


### G2. No new UI, provider-contract, or CI-policy promise
Reported: slice 1 — "source review — story makes no new UI/provider/CI-policy promise"
Story clause: "it makes no new UI, provider-contract or CI-policy promise."
Disposition: excluded "it makes no new UI, provider-contract or CI-policy promise."
Commitment: 24.1, 24.2, 24.3

## Execution complete

Product advice: no change — keep SEED-261 sibling conversions and SEED-287#fit-dashboard-journeys-in-default-timeout ahead of any new test-data work; this execution’s interim production-watcher 90s allowance (`2a2038247`), nested run-processes artifact pre-warm (`31fbac1e2`), and SHA `53152ef1` interim 90s deployment/landed-ci allowances plus 30s retained-report delivery are evidence for SEED-287, not new queue items.
