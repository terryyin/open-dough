# Prove installed execution and refinement starts in Node Vitest

**Identity:** SEED-413#prove-installed-story-starts-on-vitest

**Source:** [Prove installed execution and refinement starts in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest)

## Goal and scope

Give Dashboard maintainers fast typed proof that the installed execution and
preparation starts publish the right Take or Preparing assignment before any
session is dispatched, and that a kept start resumes in its original
workspace with one assignment. Move the 15 legacy backend specs below off
Playwright. Run the real installed commands against real Git and a private
origin wherever publication is the evidence. Retain the existing E2E
journeys for native dispatch in the workspace, page offers and process
restart. Workspace and session-policy choices (`agent-launch-start-session-*`),
host first input, launch admission and attempt recovery, and retained records
have their own owners in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- Enter at the production start composition: [`started`](../../../dashboard/server/launchStart.ts)
  for the start-then-dispatch decision and its warning threshold, and the
  workflow `begin` functions in [execution start](../../../dashboard/server/executionStart.ts)
  and [preparation start](../../../dashboard/server/preparationStart.ts)
  through [`startOf`](../../../dashboard/server/startWorkflows.ts). Pass a
  typed `PublishedSource`, `AgentLaunchRequest`, project `LocalFolder` and
  `StartProgress`. Use [`attemptRun`](../../../dashboard/server/launchRun.ts)
  only where the reporting refusal or worktree-update retry is the
  observation. Do not start the Dashboard server, Vite or Chromium.
- The start workflows resolve the kept start store and the installed
  command's Git routing through `HOME` today. Narrow that read: the start
  workflows take the machine start store they read, and the installed command
  runs under the environment its caller supplies, with the wire composition
  supplying the process-wide values. Do this inside slice 1, where the first
  Node case needs it, then reuse it. Keep `startOrigin` as the real private
  origin and installed skill source.
- Assert publication on origin (`takenProfiles`, `originGit`), the returned
  start or refusal, and the kept start through the typed store reader. Model
  "dispatched nothing" as a stopped start result and verify the kept record
  appropriate to its disposition. The retained E2E journeys observe the
  native session in the workspace.
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for requests,
  repositories and kept start records. Damage a kept record by building it,
  not by editing JSON on disk. Add zero test-support wrappers. Remove
  `agentLaunchBoundary`, `preparationPage`, `codexStart` or server fixture
  helpers only when their last consumer has moved.

The [proof record](PROOF.md) holds the decisive premises, coverage map, local gate and accepted execution evidence.

## Execution context

- Story Branch Mode in the Dashboard-established worktree
  `/Users/terryyin/git/open-dough/.worktrees/prove-installed-execution-and-refinement-starts`,
  branch `codex/prove-installed-execution-and-refinement-starts`. The separate
  integration checkout is `/Users/terryyin/git/open-dough`. The Dashboard
  established the start for Anri-chan under
  `dashboard-territory.local-open-dough`.
- Starting revision `893c3042af69fe6b0aab824ee08d33425ee70c47`. The accepted Take
  and initial candidate `52544c358a47df9019c163d45dcb0625b47b9271` were verified on
  `origin/main` and the remote execution branch. Ordinary increments target the
  remote execution branch. The Take has no observer receipt in this session.
- Installed locked dependencies with `node scripts/setup-native.mjs npm` in
  this worktree and passed `npm run typecheck:dashboard`. Native prerequisite
  validation selected Chromium 158.0.8127.18.
- CI observer for `terryyin/open-dough` on the remote execution branch uses
  GitHub workflow `ci.yml` (CI), coordinator `Anri-chan-413-847`, directory
  `/tmp/dough-ci-501/watch-zwlaMc`, PID 48676, session 35314, cell `g501:16`.
  The stream finished with `observation_error` before the first increment
  because `gh` lost authentication. Recover applicable CI at completion
  once it can authenticate.

## Ordered slices

### 1. Publish the Take before an execution session is dispatched

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: For a queued ready story on a private origin, `started` with an
execution request returns the established start in a new `.worktrees/`
workspace. Origin holds the Take naming host `claude` and the chosen model,
or none on Default, and the kept start holds the established start. A project
whose origin is not the catalog repository returns the refusal and publishes
nothing. A project whose installed skill cannot continue from a start
returns no start, so the launch runs in the execution checkout with no Take
and no workspace. Introduce the typed start store and command environment
here. Convert `agent-launch-start.spec.ts`.

### 2. Refuse an execution start that cannot be established

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Through the slice 1 entry, a story Taken by another agent names its
owner, a story not queued is not started, an unrefined story points to
refinement, and a command with no readable result is not trusted. Each
publishes nothing on the test origin. Definite refusals leave no kept start.
Unreadable command output leaves publication unknown and retains the draft
without an established claim, as the legacy case and `keepsStart` require.
A refused first launch after a published claim names the Agent and workspace
and keeps the start. A second
start while the first is held on origin's `pre-receive` hook is refused as
already starting, and two concurrent starts leave one claim and one
workspace. Retain the
[Taken-card E2E](../../../e2e/launches/agent-launch-start-taken.spec.ts)
for the offer and its single session. Convert `agent-launch-start-refusal`,
`agent-launch-start-taken-refused` and `agent-launch-start-duplicate`.

### 3. Resume a kept Take with its original claim

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Supply a short warning threshold as a typed value. A push slower than
it keeps running and establishes with one claim. A refusal after it settles
normally. A stop carrying recovery keeps its SHAs and the continuation passes
them back. A start lost with its server resumes from its workspace with one
claim. A lost start whose workspace is not the isolated claim stops with the
script's reason. For Codex, a kept execution whose first-input
acknowledgment was lost resumes with the same claim and workspace and no
second publication. Compare the legacy Codex assertions with the
[Codex recovery E2E](../../../e2e/launches/agent-launch-codex-recovery.spec.ts)
and carry any missing native input observation into that journey. Convert
`agent-launch-start-resume` and `agent-launch-start-codex-recovery`.

### 4. Publish Preparing before a refinement session is dispatched

Type: Behavior
Status: planned
Estimate: 10–15 active minutes.

Proof: `started` with a refinement request publishes Preparing for host and
model with no Taken profile, returns the established preparation in a new
workspace, and keeps it with no publisher, mode or plan. An installed skill
without the preparation formatter returns no start. A story not queued, every
agent name held (listing the holders), and a workspace that cannot be created
each stop with no workspace, kept start or progress phase. Convert
`agent-launch-preparation-start` and `agent-launch-preparation-stops`.

### 5. Recover the original Preparing assignment after an interruption

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: A slow start past the warning threshold establishes with one profile.
An unpublished stop keeps the start and its continuation settles with one
profile. An interrupted precommit start recovers in its workspace without
replacing an occupied agent. A refusal after the announcement keeps the
start, and Start again resumes with one assignment. An unannounced retry
clears its old disposition. A continuation that prints a failure without
readable JSON names that failure. A store whose write fails after
publication preserves the published preparation, with and without the slow
threshold; inject that failure through the typed store, not an origin hook.
Retain the [kept-preparation E2E](../../../e2e/launches/agent-launch-preparation-kept.spec.ts)
for the Backlog card offer. Convert `agent-launch-preparation-resume`,
`agent-launch-preparation-continuation-refusal` and
`agent-launch-preparation-store-failure`.

### 6. Continue Codex refinement only with its Git-verified allocation

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: After a real Codex preparation is published, build its kept start
with a legacy SHA or a lost result: continuation establishes the same
workspace allocation with unchanged profiles and origin `main`. For each
damage variant of retained retry, continuation refuses without replacing
the preparation or publishing again. Retain the
[Codex retry E2E](../../../e2e/launches/agent-launch-preparation-codex-retry.spec.ts)
for the dialog's single refusal. Convert
`agent-launch-preparation-codex-continuation` and
`agent-launch-preparation-codex-retry`.

### 7. Restore reporting support on a kept installed start

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Through `attemptRun` with typed inputs, Continue on a kept start whose
worktree lacks the reporting helper stops before dispatch and names it. A
fresh start whose worktree lacks the sibling fails after Taken without
claiming a session might have launched. A compatible older install without
landing prepares reporting. Applying the prepared updater to the exact kept
worktree resumes the kept start once, and an updater refusal explains and
dispatches nothing. Convert `agent-launch-incomplete-reporting-settlement`
and `agent-launch-update-worktree-retry`.

## Plan review

Slice-plan refinement was not needed. Each slice owns one start outcome
and its legacy files; the typed start store and command environment are
introduced inside slice 1, where the first Node case needs them, and the
warning threshold inside slice 3. Seven slices fit the eight-slice limit.
Prospective estimates assume the installed commands keep their current
arguments and result shapes. No unresolved slice-specific concern remained
after this review.
