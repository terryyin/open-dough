# Make GitHub Actions run and attempt-job test setup map directly to the domain

**Identity:** SEED-261#map-github-actions-ci-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-github-actions-ci-test-data)

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
| **Open:** comparison fixture conversion and shared-attempt job-read proof under admitted host conditions. | The unchanged selected fast-forward test failed its default 30000 ms timeout (30.8 s) at `889985084`. Trace timings: origin fixture 5.815 s, dashboard fixture 5.397 s, Git setup/body 8.258 s and CI read 7.354 s; independent final assertions passed during teardown. Host load was about 21 on 16 logical CPUs; no sleep occurred in the run window. The historical whole-file duration was 19.3 s (`dashboard/longest-first`). A causal correction using maintained admission under AC `caffeinate -s -i` remained queued behind the live full-suite owner in the machine-local configuration worktree, which had reached 51:29 elapsed at deferral; no test or scratch mutation started. The queued command was safely cancelled for deferral, with exact fixture bytes retained. Slice 1 owns the unpaid result; no success is inferred from queuing or from the timeout trace. |

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

### 1. Verify comparison proof under admitted host conditions
Type: Behavior
Status: planned
Proof: First settle the outstanding comparison premise under the maintained admission wrapper below. This is a bounded early probe, before dependent comparison conversion; it requires no paid service or human-operated instrument.

The repository's full-suite owner releases its local admission → run the
single selected fast-forward comparison under `caffeinate -s -i` and the
maintained `scripts/local-test-suite.mjs repository` wrapper → the same
identity, wall-time and unique attempt-job-page assertions complete inside
the default test timeout. First reproduce on unchanged files. Then scratch
wrap `wall` construction through the shared run builder, observe the same
result, change only a case-driving run identity to prove the independent
assertion fails, and restore exact files and observe the original pass.
Use this baseline command from the current owned checkout (reuse its
existing prerequisites):

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
  PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i \
  node scripts/local-test-suite.mjs repository "$PWD" "$PWD" \
  npm run test:dashboard -- 'intent-ci-comparison-fast-forward\.spec\.ts$' \
  --grep 'a fast-forward landing after a story-first merge of main names the tip as Branch and Landed' \
  --workers=1 --reporter=list
```

Keep baseline, scratch conversion, discrimination and restored check under
one admission using a temporary driver when performing the full sequence.
Keep temporary edits in the owned workspace and restore them before any
commit or preparation recording. The failed contention baseline is not
accepted proof. Do not merely rerun until green: if admission does not resolve
the diagnosed cause, diagnose and repair the test/environment under the
[failure policy](../../../AGENTS.md#failing-and-flaky-tests), then repeat its
affected proof before dependent conversion. No timeout increase is selected.
A passed probe settles this remaining premise; review the current story/plan
basis and record readiness before ordinary implementation starts. If the
comparison semantics or source scope differ, stop the affected path and
reassess the same plan, preserving independent work.

### 2. Revision judgment and CI status share the run facts
Type: Behavior
Status: planned
Proof: Source examples 1 and 2. Run dashboard selections `tests/launches/agent-launch-base-ci`, `tests/intent/intent-ci-status` and `tests/intent/intent-ci-proof-(ancestor|reasons|sources)`, plus the Node support checks `dashboard-ci-revision-nearest.test.mjs`, `dashboard-story-branch-ci.test.mjs` and `requested-revision-ci-status.test.mjs` under `tests/support/`. Run affected project visit/home activation journeys found by the trace.

A test states selected-revision and ancestor run facts through MakeMe → the
real GitHub observation/revision lookup and dashboard read them → base-CI
judgment, selected attempt, pending/absent distinctions and wall-time display
are preserved. Replace the suite-local run type/construction with the
production-aligned shared run builder and existing API encoding. Convert
`baseCiActions`, `intentCiStatusPage`, `intentCiStoryRecords`,
`intentCiProofPage`, `intentSummaryCiProofFixtures`, their direct run setups
and the named Node support consumers. Incidental defaults belong in the
builder; the envelope and request route stay in `actionsRunsAnswer`.
Raw mapping inputs and deliberate malformed responses remain literal.
Keep every shared-seam caller compatible in this delivery and run its traced
consumers even when its case's data conversion is assigned to a later slice.

### 3. Story comparisons share attempt identity and job timing facts
Type: Behavior
Status: planned
Proof: Source example 3. Run `tests/intent/intent-ci-comparison`, `tests/intent/intent-summary-story-comparison`, `tests/intent/intent-summary-ci-proof` and `backend-tests/intent/ci-time-without-runner-waits.spec.ts` through the dashboard runner. Preserve the fast-forward assertion that unique job read pages are exactly `401/1/1` and `402/1/1`, retry/recovery request counts and settled caching. Run the slice 2 status selections again if their encoding seam changes.

A comparison's Baseline, Branch and Landed name runs/attempts and synthetic
job times through MakeMe → the real comparison reads them at their endpoint
revisions → the same timing, gaps, equivalent-result selection and one-read
sharing are observed. Replace or delegate `wall`; convert the Done,
EarlierLanding, FastForward, LaterFastForward, Skipped variants, Taken,
Retry, LandedOutcome and CancelledLanding fixtures, Summary comparison
fixtures/variant publishers and direct run overrides in their consumers.
Unify the comparison attempt endpoint's transport encoding with the listing.
Introduce the shared GitHub job builder with these real timing consumers;
convert valid synthetic job arrangements in the backend timing cases and
synthetic run wrappers around captured observations. Preserve the captured
jobs and invalid-time distractor exactly as stated in Current decisions.

### 4. Observer failures retain their run, attempt and job evidence
Type: Behavior
Status: planned
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

### 5. Reused validation keeps exact revision and current source attempt
Type: Behavior
Status: planned
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

### 6. Integrated-state validation keeps the descendant's GitHub evidence separate
Type: Behavior
Status: planned
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

Plan refinement was not needed: the five conversion slices each retain one
consuming outcome and proof loop (revision/status judgment, story comparison
timing, observer failure evidence, exact-revision reuse, and integrated
validation). The preceding bounded probe owns the currently unavailable
comparison observation and changes no story scope. Each builder change ships
with a real consumer and necessary shared-seam compatibility. The cumulative
rule is one GitHub run/job construction, with one encoding at the real
transport boundary, while harnesses continue to own operations and raw
evidence. No separate builder-first or file-only slice is needed. No numeric
slice target is prescribed by this project; boundedness includes
implementation, focused proof and removal of displaced construction.

One remaining concern blocks readiness: slice 1 has not observed the admitted
comparison baseline, conversion, discrimination and restored check. The
unchanged fast-forward test exceeded its default 30 s under diagnosed host
contention; its trace completed the independent assertions during teardown,
but the run still failed. The later sequence remained queued behind the
other live full-suite owner and started no test. The contention correction
has not been verified, so this is `not-ready`, not a repaired failure or an
exemption. Slice 1 owns the exact observation and any required repair once
admission is available; slice 3's comparison conversion waits for it. The
other preparation observations above remain accepted within their stated
boundaries. No goal, scope, ADR or product decision needs a human response.
