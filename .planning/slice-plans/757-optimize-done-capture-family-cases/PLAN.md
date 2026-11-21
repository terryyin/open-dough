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
| A Done capture sees a real merge, or later review opens a kept result after retirement. | The review still reads the accepted parent, actual merge resolution, and captured changes. Capture starts fewer Git processes. The full list of case timings and timeouts shows the final margin. | 4 |

## Current decisions

- Terry chose the Git runners on 2026-11-21. Keep one narrowly scoped Node
  executable selector for the two runners. Both already own process launch,
  while [the Playwright service setup](../../../dashboard/test-support/support/serviceRunSetup.ts)
  chooses a test-wide tool directory and the [backend Vitest config](../../../dashboard/backend.vitest.config.mts)
  has its own setup. Use the existing runner entry points and the established
  pattern for sharing Node code from the distribution source with the
  dashboard server. Keep the selector server-side.
- Reuse [repository templates](../../../Distribution/tests/support/repository-fixture.mjs)
  that already copy the described history and repair origin and worktree paths.
  Prefer reducing calls on that path to another fixture cache. Follow
  [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  when measuring or changing shared Git reads.
- Compare outcomes under [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  and the [timeout-margin candidate](../../TEST-OPTIMIZATION-CANDIDATES.md#done-capture-family-timeout-margin).
  Keep a call-count reduction when it makes a meaningful contribution to
  timeout margin or case time, preserves proof, and does not add a maintenance
  cost that outweighs the gain. Keep the runner bypass if the representative
  runs show lower startup cost and preserve executable and transport behavior.
  Record disconfirmed experiments and the observed limits in this plan.

## Decisive premises observed

Observations ran in the preparation checkout at `0648ff017` on
2026-11-21, macOS on AC, Node 24.21.0. The commands use the local gate prefix
below. The branch-entry, typed Done, observation, landing, and case-builder
suppliers are recorded as satisfied in the source. The adjacent plan 754
owns fixture agreement and cleanup. Confirm which revision supplies the
timing roster before collecting the execution baseline.

| Consuming operation | Observed form and result | Limit |
| --- | --- | --- |
| Vitest Done capture, review, and the installed publisher | `CI=1 GIT_TRACE2_EVENT=<private file> npm run --silent test:dashboard:backend -- --workers=2 ad-hoc-manual-landing.spec.ts ad-hoc-branch-result-race.spec.ts ad-hoc-session-comparisons.spec.ts declared-worktree-publication.spec.ts done-kept-session-commits.spec.ts`. Passed 10/10 at start load 5.20. The real manual merge took 758 ms, declared landing and retry 1,003 ms, and comparison after retirement 1,845 ms. The trace had 427 root starts and 564 total, including nested Git. | This is a proof-route sample and confirms the cost at this revision. Take the full, matched roster baseline before changes. Trace2 reports Apple Git's executable after launch. It cannot establish whether Node invoked the launcher. |
| Fixed measurement roster | The roster command below identified 35 review and launch specs. The ordinary backend runner with `--list --workers=2` selected 103 Node cases from those specs. | The listing establishes the comparison selection at this revision. Roster timing belongs to the execution baseline. |
| Runner transport and shared checkout isolation | `node --test --test-concurrency=2 Distribution/tests/skills/dough-execute-plan/publication-transport-bound.test.mjs Distribution/tests/support/repository-workspace.test.mjs Distribution/tests/support/repository-snapshot-isolation.test.mjs`. Passed 8/8, including stalled push and fetch, abort, bounded success, and mutually isolated copies. | Recheck these paths after edits. The installed landing comparison above independently exercises the copied publication route. |
| Direct Git selection, linked worktree, and the capture's Git read | With `command -v git` resolving to `/usr/bin/git`, a disposable repository initialized using the absolute executable returned by `xcrun -f git`. `worktree add --quiet -b draft <path> HEAD` made the declared branch at the base. From the worktree, `runGit` executed `rev-parse --show-toplevel --path-format=absolute --git-common-dir HEAD^{commit} HEAD^{tree}`; its four values matched separate queries and `symbolic-ref HEAD` gave the declared ref. | This observes the simple linked-worktree inputs on the current Git. The product change needs proof of initial validation and final branch and tip checks on clean, dirty, missing, and changing checkouts. |
| Dashboard server bundle | From the repository root, a Node ESM invocation imported `serverBundleArtifact` from `dashboard/test-support/support/serverBundle.ts` and called the artifact's `create()` and `prepare(directory, new AbortController().signal)`. It built the Vite configuration, boundary server, and Cursor runner into the disposable directory. | Recheck this same bundle after adding the shared selector. |

## Slices

### 1. Dashboard Done capture bypasses Apple's Git launcher

Type: Behavior
Status: planned

With Apple Git first on macOS, a Done capture uses the developer-tool Git
directly and remains reviewable. Build the execution baseline below before
editing. Give `gitRunner.ts` the shared Node-side selection for the effective
environment, covering an explicit `PATH` or `DEVELOPER_DIR` override where
supplied. Reuse resolved selection for equivalent environments. Preserve an
explicit earlier executable, the ordinary Git path on Linux, and fallback
to the existing invocation on unsuccessful resolution. Keep the runner's
buffers, stdin, cancellation, and wait-for-close semantics.

**Proof.** Run `ad-hoc-manual-landing.spec.ts`,
`ad-hoc-branch-result-race.spec.ts`, and `git-target-fetch-process.spec.ts`
through the backend runner. Observe the actual child executable on the real
Done path. A temporary caller-preferred Git on `PATH` must receive the
same calls, including when the process has previously resolved Apple Git.
Verify that tool selection does not change the inherited `PATH`. Exercise
the unresolved developer-tool case against the old invocation. On Linux,
use the same proof entry points in CI and check that normal Git was selected.
Repeat the server bundle observation with the shared module.

### 2. The installed publisher uses direct Git for local reads and transport

Type: Behavior
Status: planned

A declared-worktree publication launched with Apple's Git uses the same
selector for its own local calls and bounded transport. Keep the generic
`exec` and `execWithInput` contracts independent of Git selection. Keep the
installed script surface and transport errors stable. The expected edit,
`publication-git.mjs`, is 279 lines. Move bounded transport into its own
module, owning command classification, process-group shutdown, and the
transport bound. Re-export the existing settings from `publication-git.mjs`
and keep ref handling, reconciliation helpers, and checkout inspection with
their existing public callers. Declare the selector and transport module in
the execution payload, and regenerate the maintained installations.

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
creating a new named worktree and its branch in one Git invocation in the
existing repository fixture. Compare the trace at checkout materialization
and dated work. Use the resolved Git runner already available for Git calls
in the hot family fixture path where this preserves their dates and
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

### 4. Done branch capture uses fewer Git reads and retains the same review

Type: Behavior
Status: planned

A valid branch, observed at Done, produces its retained review with fewer
Git processes. Start with the measured repeated checkout identity and object
reads in `readBranchWorkspace`. Group reads that can share a Git observation
while preserving canonical checkout validation, commit and tree identity,
and the second branch and tip observation after the temporary-index snapshot.
Keep every pin and declared landing check. Let the trace determine whether
another read on this same capture path is redundant. Stop and reassess if a
further reduction requires changing a promised result or moving protection.

**Proof.** Run `ad-hoc-branch-result.spec.ts`,
`ad-hoc-branch-result-race.spec.ts`,
`ad-hoc-branch-result-supersession.spec.ts`,
`ad-hoc-branch-attribution.spec.ts` and `ad-hoc-manual-landing.spec.ts`.
Verify empty and missing checkouts, dirty files, stale marks, kept
pins, and that a real merge retains the accepted trunk parent and actual
resolution. Prove the final identity check still rejects a checkout changed
during capture. Run the fixed full roster using the measurement procedure and
retain its endpoint comparison, residual costs, and any remaining gap.

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
  `rg --sort path -l 'support/(doneCaptureCase|doneCaptureReview|installedPublisher)' dashboard/backend-tests/review dashboard/backend-tests/launches -g '*.spec.ts'`.
  Confirm the selection and case names using
  `npm run --silent test:dashboard:backend -- --list --workers=2 <roster>`.
  For each measured run use the same command without `--list`, with
  `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` pointing to a fresh private
  file. Keep the baseline revision, roster, Node and Git versions, macOS
  power state and start/end load. Keep case wall durations, tail and
  timeout counts separate from run duration. Use `GIT_TRACE2_EVENT` in
  separate matched trace runs. Count Git root starts and nested Git separately.
  For per-case attribution, select one named case with `--grep` and map
  root starts to fixture creation, dated work, capture, and review or
  observation. Keep the same cold or warm fixture conditions for adjacent
  comparisons.
- Compare the baseline with the candidate in two interleaved pairs at two
  workers. Compare like loads when possible and report the load range and
  any mismatch. Evaluate the 100–200 ms target at low load. Check three
  consecutive full-roster runs without timeouts at load 15 or above when
  available. If that load is unavailable, record the load and headroom
  actually observed. If the 100–200 ms target remains out of reach, report
  the measured floor, remaining Git work per case, what those calls protect,
  and the margin against the 5 s default. Preserve the CI result as a
  separate platform observation.
- Run `npm run typecheck:dashboard` and `npm run lint` for the changed
  product and test sources. Validate affected distribution paths with the
  focused Node tests and `Distribution/tests/installation/install-public-payload.sh`.
  Keep the accepted evidence and only the consequential limits here.

Slice-plan refinement was unnecessary. Each slice has its own observable
result and proof loop within the shared comparison. Review found no
remaining slice concern.
