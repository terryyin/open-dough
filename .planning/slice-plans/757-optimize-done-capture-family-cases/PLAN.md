# Bring the Done capture family's cases to 100–200 ms

**Identity:** SEED-413#optimize-done-capture-family-cases
**Source:** [Bring the Done capture family's cases to 100–200 ms](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#optimize-done-capture-family-cases)

## Goal and scope

Give dashboard maintainers real-Git Done capture feedback in about 100–200 ms
per case in a comparable low-load run, with room under Vitest's default
timeout when other sessions are active. Use the dashboard and installed
publisher runners to bypass Apple's launcher when it is the selected Git.
Reduce avoidable Git starts in the family's checkout setup and production
capture. Preserve existing cases and assertions, Git semantics, and independent
mutable worktrees, origins, reflogs, indexes, and pins. Keep the existing
worker count and timeouts for comparisons. Use the seed's measured-floor
outcome if reaching the target would cost behavior or proof.

## Key examples and proof

| Given and trigger | Observer and expected result | Slice |
| --- | --- | --- |
| macOS resolves Git to Apple's launcher and a Done capture reads a local worktree. | Observe the executable passed to Node's child process by the dashboard runner. It is the executable selected by `xcrun`. A caller-provided Git still receives its calls, and the saved review and pins are the same. | 1 |
| The installed publisher lands a declared worktree on a disposable origin and exactly retries its receipt. | Its local and bounded transport calls use the selected binary, including the actual push. The accepted trunk revision, retained comparison, and retry identity agree. The transport still stops and reaps stalled or aborted calls. | 2 |
| A case builds named worktrees and commits dated work, or prepares an already Done launch to read. | The isolated checkouts keep distinct paths, refs, index, contents, and reflog facts. Each avoids the setup calls the profile identifies as redundant. Existing review and pin assertions pass. | 3 |
| A Done capture sees a real merge, or later review opens a kept result after retirement. | The review still reads the accepted parent, actual merge resolution, and captured changes. Measure the Git starts still needed after the existing workspace read consolidation. The full list of case timings and timeouts shows the final margin. | 4 |

## Current decisions

- Terry chose the Git runners on 2026-11-21. Keep one narrowly scoped Node
  executable selector for the two runners. Both already own process launch,
  while [the Playwright service setup](../../../dashboard/test-support/support/serviceRunSetup.ts)
  chooses a test-wide tool directory and the [backend Vitest config](../../../dashboard/backend.vitest.config.mts)
  has its own setup. Use the existing runner entry points and the established
  pattern for sharing Node code from the distribution source with the
  dashboard server. Keep the selector server-side.
- Reuse [the publisher's process module](../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git-process.mjs)
  for local calls and bounded transport. Its public re-exports and generic
  process helpers keep their callers. Follow [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  so the installed entry resolves the selector locally in every supported layout.
- Reuse [repository templates](../../../Distribution/tests/support/repository-fixture.mjs)
  that already copy the described history and repair origin and worktree paths.
  Prefer reducing calls on that path to another fixture cache. Follow
  [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  when measuring or changing shared Git reads.
- Follow [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  by exercising the affected backend handlers through the existing Node Vitest
  cases and their real Git collaborators. The installed publisher exercises its
  own entry point in the declared landing cases.
- Compare outcomes under [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  and the [timeout-margin candidate](../../TEST-OPTIMIZATION-CANDIDATES.md#done-capture-family-timeout-margin).
  Keep a call-count reduction when it makes a meaningful contribution to
  timeout margin or case time, preserves proof, and does not add a maintenance
  cost that outweighs the gain. Keep the runner bypass if the representative
  runs show lower startup cost and preserve executable and transport behavior.
  Record disconfirmed experiments and the observed limits in this plan.

## Decisive premises observed

The original observations ran at `0648ff017` on 2026-11-21, macOS on AC,
Node 24.21.0. The latest preparation checked `c2a0c51ce` on 2026-11-23 with
the same host profile and Apple Git 2.50.1. Use the local gate prefix below.
The branch-entry, typed Done, observation, landing, and case-builder
suppliers are satisfied. Plan 754 closed at `0e2050f0f` after tying the
case fixtures to production and resolving named worktrees once per case.

| Consuming operation | Observed form and result | Limit |
| --- | --- | --- |
| Vitest Done capture and review under load | At `c2a0c51ce`, `CI=1 GIT_TRACE2_EVENT=<private file> npm run --silent test:dashboard:backend -- --workers=2 ad-hoc-manual-landing.spec.ts ad-hoc-branch-result-race.spec.ts ad-hoc-session-comparisons.spec.ts declared-worktree-publication.spec.ts done-kept-session-commits.spec.ts git-target-fetch-process.spec.ts` started at load 36.06. Five Node cases passed and five reached the 5 s timeout. The retained abort case passed in 628 ms. With the developer-tool directory prepended to `PATH`, the same five Node specs at start load 32.27 passed eight cases. The installed exact retry and review after retirement still timed out. | This reproduces the symptom on current trunk. The diagnostic changed `PATH` and ran at a different load. Timeout truncation also changes how many commands finish. Use the full matched roster and the runner-level executable observation for the actual comparison. |
| Earlier low-load comparison | The five Node specs above passed 10/10 at `0648ff017` and start load 5.20. The real manual merge took 758 ms, declared landing and retry 1,003 ms, and comparison after retirement 1,845 ms. | This historical result motivates the target. Establish its current low-load baseline during execution. |
| Fixed measurement roster | The roster command below at `c2a0c51ce` identified 37 review and launch specs. The ordinary backend runner with `--list --workers=2` selected 115 Node cases from those specs. The earlier selection was 35 specs and 103 cases. | Freeze the roster again at the execution base and compare exactly those files and cases. |
| Runner transport and shared checkout isolation | `node --test --test-concurrency=2 Distribution/tests/skills/dough-execute-plan/publication-transport-bound.test.mjs Distribution/tests/support/repository-workspace.test.mjs Distribution/tests/support/repository-snapshot-isolation.test.mjs`. Passed 8/8 at `c2a0c51ce`, including stalled push and fetch, abort, bounded success, and mutually isolated copies. | Recheck these paths after edits. The declared landing case exercises the copied publication route. |
| Direct Git selection and linked worktree | At `0648ff017` the executable from `xcrun -f git` initialized a disposable repository. `worktree add --quiet -b draft <path> HEAD` made the declared branch at the base. At `c2a0c51ce`, the shell still resolves `/usr/bin/git` and `xcrun -f git` returns `/Library/Developer/CommandLineTools/usr/bin/git`. | The prior Git operation establishes the combined worktree entry's basic behavior. The slices must observe the runner's actual child executable and the fixture's isolated state. |
| Workspace identity and capture | `615f8d8db` already combined workspace identity, tip, tree, and branch in `readBranchWorkspace`, kept the post-snapshot branch and tip check, and parallelized independent reads. | Profile on top of those changes before selecting any further capture edit. |
| Dashboard server bundle | At `c2a0c51ce`, a Node ESM invocation at the repository root imported `serverBundleArtifact` from `dashboard/test-support/support/serverBundle.ts` and called the artifact's `create()` and `prepare(directory, new AbortController().signal)`. It built `vite.config.mjs`, `boundaryServer.mjs`, and `runnerMain.mjs` into the disposable directory. | Recheck this same bundle after adding the shared selector. |

## Slices

### 1. Dashboard Done capture bypasses Apple's Git launcher

Type: Behavior
Status: planned

With Apple Git first on macOS, a Done capture uses the developer-tool Git
directly and remains reviewable. Build the execution baseline below before
editing. Keep the known load-related timeout results in the comparison and
diagnose any different baseline failures before depending on that proof.
Give `gitRunner.ts` the shared Node-side selection for the effective
environment, covering an explicit `PATH` or `DEVELOPER_DIR` override where
supplied. Account for the call's working directory when `PATH` has relative
entries. Reuse resolved selection for equivalent environments. Preserve an
explicit earlier executable, the ordinary Git path on Linux, and fallback
to the existing invocation on unsuccessful resolution. Keep the runner's
buffers, stdin, cancellation, and wait-for-close semantics.

**Proof.** Run `ad-hoc-manual-landing.spec.ts` and
`ad-hoc-branch-result-race.spec.ts` through the backend Node lane. Run the
existing `git-target-fetch-process.spec.ts` through the backend runner's
retained Playwright lane to check close semantics. Observe the actual child
executable on the real Done path. A temporary caller-preferred Git on `PATH`
must receive the same calls, including when the process has previously
resolved Apple Git.
Verify that tool selection does not change the inherited `PATH`. Exercise
the unresolved developer-tool case and a per-call developer directory against
the runner's existing environment contract. On Linux,
use the same proof entry points in CI and check that normal Git was selected.
Repeat the server bundle observation with the shared module.

### 2. The installed publisher uses direct Git for local reads and transport

Type: Behavior
Status: planned

A declared-worktree publication launched with Apple's Git uses the same
selector for its own local calls and bounded transport. Keep the generic
`exec` and `execWithInput` contracts independent of Git selection. Keep the
installed script surface and transport errors stable. Apply executable
selection at the existing `exec` and `spawn` calls in
`publication-git-process.mjs`. Keep command classification, process-group
shutdown, and the transport bound there. Declare the selector in the
execution payload and regenerate the maintained installations.

**Proof.** Observe the actual child executable for a local command and
a push, with both the Apple launcher and a caller-preferred Git. Run
`declared-worktree-publication.spec.ts`,
`declared-blank-launch-publication.spec.ts`,
`ad-hoc-session-comparisons.spec.ts`, and the Distribution
`publication-transport-bound.test.mjs` and
`execution-increment-managed-delivery-transport.test.mjs`. Preserve the
accepted revision, original launch, retained comparison, exact retry, and
transport cancellation. Check the installer via its public payload proof
because a missing runtime import would work in source and fail in an installed
checkout. Apply [the file-size check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size)
to the edited code.

### 3. Case checkouts start fewer Git processes

Type: Behavior
Status: planned

A case that requests a real checkout, dated work or an already Done record
retains its private setup and pays for fewer setup commands. First try
creating a new named worktree and its branch in one Git invocation in
`repository-workspace-materialize.mjs`, where the two calls remain. Compare
the trace at checkout materialization and dated work. Use the resolved Git
runner for calls on the family's fixture path where it preserves their dates and
environment. Retain a real origin whenever the scenario needs published
history or the product's attribution reads it. Reuse existing builder
inputs and keep fixture variants and topology explicit.

**Proof.** Compare the same named worktree and already Done review cases
before and after. Run `repository-workspace.test.mjs`,
`repository-snapshot-isolation.test.mjs`, and all reached fixture readers.
Include `done-kept-session-commits.spec.ts`,
`ad-hoc-branch-result-race.spec.ts`, and `ad-hoc-session-comparisons.spec.ts`.
Observe canonical worktree lookup, dated reflog choices, file contents,
kept pins, and independence when a copied checkout's peer moves or retires.
Use the phase traces to distinguish launcher bypass from fewer Git starts.

### 4. Retained reviews establish the remaining Done capture cost

Type: Behavior
Status: planned

A valid branch, observed at Done, produces its retained review with a
measured case time and Git process count. Compare the remaining starts in
`captureBranchResult`, including the temporary-index snapshot, attribution,
manual landing and pinning. If the phase trace shows a redundant read on this
path that materially improves the measured result, remove it in this slice.
Preserve canonical checkout validation, commit and tree identity, the second
branch and tip observation after the snapshot, every pin, and declared landing
checks. If no comparable saving preserves those promises, retain the measured
floor and the protection each remaining command supplies.

**Proof.** Run `ad-hoc-branch-result.spec.ts`,
`ad-hoc-branch-result-race.spec.ts`,
`ad-hoc-branch-result-supersession.spec.ts`,
`ad-hoc-branch-attribution.spec.ts` and `ad-hoc-manual-landing.spec.ts`.
Verify empty and missing checkouts, dirty files, stale marks, kept
pins, and that a real merge retains the accepted trunk parent and actual
resolution. If the workspace read changes, prove the final identity check
still rejects a checkout changed during capture. Run the fixed full roster
using the measurement procedure and retain its endpoint comparison, residual
costs, and any remaining gap.

## Local gates and measurement

- On AC power, use
  `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`
  per [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run suites sequentially. Keep default test timeouts and never use
  `test.slow()`. Follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  and [MakeMe selection](../../../.agents/skills/dough-makeme/SKILL.md) when
  test sources or data builders change. Use the
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  for shared runner and fixture edits, then run reached proof.
- Before edits, freeze and record a sorted roster from
  `rg --sort path -l 'support/(doneCaptureCase|doneCaptureReview|installedPublisher)' dashboard/backend-tests/review dashboard/backend-tests/launches -g '*.spec.ts' | sort`.
  Confirm the selection and case names using
  `npm run --silent test:dashboard:backend -- --list --workers=2 <roster>`.
  For each measured run use the same command without `--list`, with
  `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` pointing to a fresh private
  file. Keep the baseline revision, roster, Node and Git versions, macOS
  power state and start/end load. Keep case wall durations, tail and
  timeout counts separate from run duration. When reporting process counts or
  a measured floor, identify cases cut short by timeout and compare completed
  cases against completed cases. Use `GIT_TRACE2_EVENT` in
  separate matched trace runs. Count starts with one Trace2 session ID per Git
  process and distinguish root sessions from nested Git sessions. Include the
  runner's child executable observation because Trace2 sees Git after the launcher.
  For per-case attribution, select one named case with `--grep` and map
  root starts to fixture creation, dated work, capture, and review or
  observation. Keep the same cold or warm fixture conditions for adjacent
  comparisons.
- Compare the baseline with the candidate in two interleaved pairs at two
  workers. Compare like loads when possible and report the load range and
  any mismatch. Evaluate the 100–200 ms target at low load using the count
  of completed cases at or below 200 ms, median, 95th percentile and slowest
  case. Check three consecutive full-roster runs without timeouts at load 15 or above when
  available. If that load is unavailable, record the load and headroom
  actually observed. If the 100–200 ms target remains out of reach, report
  the measured floor, remaining Git work per case, what those calls protect,
  and the margin against the 5 s default. Preserve the CI result as a
  separate platform observation.
- Run `npm run typecheck:dashboard` and `npm run lint` for the changed
  product and test sources. Validate affected distribution paths with the
  focused Node tests and `bash Distribution/tests/installation/install-public-payload.sh`.
  Keep the accepted evidence and only the consequential limits here.

Slice-plan refinement updated the four slices in place. The runners share
executable selection and each owns its process lifecycle. Fixture and capture
reductions follow the phase that owns each Git call. Each slice has a focused
proof loop within the active-time limit. Slice 4 owns the final comparison.
The close-semantics, fixture isolation and publication transport checks reached
their expected outcomes. The five loaded Node timeouts are the performance
defect this plan addresses. No remaining slice concern requires a decision
before execution.
