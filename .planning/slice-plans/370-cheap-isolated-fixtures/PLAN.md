# Cheaper isolated dashboard fixtures

**Source:** [Selected story](../../seeds/SEED-167-cheap-isolated-fixtures.md#cheap-isolated-fixtures)
**Source review:** [Independent source commitments](source-review.md)
**Identity:** SEED-167#cheap-isolated-fixtures

## Goal and scope

Reduce repeated immutable fixture preparation while retaining all existing
scenarios, assertions, per-test writable state, processes, browser contexts,
fake services, native input, strict verdicts and CI workload. Measure normal
local and complete hosted results; retain only supported improvements.

## Execution identity

Story Branch Mode. Created owned workspace
`/Users/terryyin/git/open-dough/.worktrees/cheap-isolated-fixtures`, branch
`codex/cheap-isolated-fixtures`; starting revision
`b22c40678b15adabb25fb10872048a77945940d9`. Originating/default checkout:
`/Users/terryyin/git/open-dough`. Admission accepted on origin/main as
`a94c65e2c2e4a9143b5260b569c83bd4292f081c`, agent `terry-chan`, publisher
`codex-cheap-isolated-fixtures`. Implementation publishes to
origin/refs/heads/codex/cheap-isolated-fixtures.
Dependencies installed with npm ci in this exact worktree; selection8/8 and
browser acquisition commands passed. Retained observer: coordinator
`cheap-isolated-fixtures-167`, directory `/tmp/dough-ci-501/watch-wTnFtn`,
cell240, session89031, PID91167; installed .agents runtime in this worktree;
GitHub ci.yml/CI, target codex/cheap-isolated-fixtures. Reuse it.

## Baseline and proof ownership

Unchanged runtime baseline is b22c4067, represented by metadata-only admission
a94c65e2. Fresh hosted baseline run40809484652 uses that admission. Prior main
run40802306924 selected1,735 cases in577 files, twelve shards/four workers;
ordinary setup/teardown consumed2,004 accumulated seconds (24.6%). Keep queue,
job and reporter suite time separate; no isolated file duration is a CI gain.
The coordinator owns hosted downloads, selection/verdict comparison and final
measurement acceptance. Raw evidence lives in
`/private/tmp/cheap-isolated-fixtures-167`, outside Git.

Normal local command, before and after, with identical default eight workers:
`env -u NO_COLOR npm run test:dashboard -- agent-launch-model.spec.ts agent-launch-codex-model.spec.ts agent-launch-preparation-codex-retry.spec.ts agent-session-cursor.spec.ts accessible-board-keyboard.spec.ts`.
Baseline45/45 strict pass, wall41.26s, reporter40.558s. The same 16-CPU/48-GiB
host had load7.48 and45% memory free. Sequence owned heavy commands; remote
runner headroom is unknown, so preserve its twelve-shard/four-worker workload.
Recheck local load/memory before expensive proof and reconsider on contention.

A separate real-origin subprofile measured0.715–0.726s per setup across five
Claude/Codex/Cursor calls. git add consumed1.669s of3.606s total, push0.813s,
skill copies0.340s. Do not confuse this sequential diagnostic with the normal
local comparison. Its literal script/results remain in the raw directory.

## Existing solutions and decisions

- startOrigin owns installed start-fixture semantics. The queuedTrunkTemplate
  pattern in workspace-publication-fixtures.mjs already prepares a path-free
  immutable base and copies isolated instances. Reuse its lifecycle principle,
  not its different fixture semantics or a cross-layer test dependency.
- globalSetup owns run-local immutable builds and server bundles and their
  cleanup. Reuse that seam for any shared preparation, with no persistent cache
  or new global registry. Nested runs lacking setup retain a safe fresh path.
- Native Git clones/copies must leave independent writable origins, config,
  refs, worktrees and object storage. Source skills and real start entry points
  remain unchanged. Prove edit/publish/cleanup isolation and fresh run inputs.
- The real preview server and Vite path stay real. Existing bundling/build reuse
  is already present; profile remaining bootstrap before selecting a change.
  Keep NODE_DISABLE_COMPILE_CACHE=1 and compile-cache.spec.ts's protection of
  existing caches. Do not work around that isolation policy.
- ADR0002 requires coherent reuse; ADR0008 preserves dashboard boundaries;
  ADR0010 requires empirical improvement. No architecture reversal or North Star
  update is selected; this is bounded maintenance of trustworthy feedback.
- Replanning is permitted within this outcome; no numeric slice budget is
  imposed. An ineffective experiment is revised or undone, with preserved proof.

## Ordered slices

### 1. Installed-start fixtures reuse immutable preparation and keep private state
Type: Structure
Status: planned

Replace repeated installed-skill copying/indexing/initial commit preparation
with a run-owned immutable seed and independent per-test instances. Keep source
inputs current per run, host installation layout, private writable objects and
real Git/start commands. Include initialization failure and cleanup ownership.
Proof: real concurrent instances edit/publish independently; changing and
cleaning one leaves peers and later instances intact; fresh runs see changed
source; unexpected failures surface. Exercise existing real installed-start
consumers across hosts, obtain three consecutive asynchronous/isolation guard
passes, and repeat the normal45-case command. Keep only a measured benefit.
The coordinator publishes through existing delivery and retains actual hosted
results; final CI comparison and remaining startup investigation belong to2.

### 2. Fresh preview servers use only justified cheaper immutable bootstrap
Type: Structure
Status: planned

Profile the remaining real preview-server bootstrap through its existing
fixture seam. Select the smallest measured removal of redundant immutable work,
if one exists, preserving real server/HTTP/process behavior and the compile-cache
policy. An explained no-change result is valid when no supported improvement
fits these constraints; do not add a second server implementation or speculative
cache. Preserve slice1's accepted proof and reuse its seed responsibility.
Proof: relevant ordinary browser and boundary consumers, real concurrent-server
isolation, normal45-case comparison, fresh complete hosted CI and case/verdict
comparison with the named baseline. Repeat affected asynchronous guards three
consecutive times. Report fixture cost, workers, queue, job/suite elapsed time
and uncertainty; reject unproved complexity before completion.

## Story obligations

None at preparation. Record implementation/acceptance gaps here, retaining
source clauses and a concrete owner before any done transition.

## Plan concern review

Refinement was not needed: the two structure slices own separate measured costs
and proof loops. The bootstrap choice is an authorized bounded probe in2, not
an assumed speedup. No remaining human decision or out-of-scope concern was
identified. Initial baseline and source-isolation premises are observed; all
new reuse and speed premises are owned by their producing slice's proof.
