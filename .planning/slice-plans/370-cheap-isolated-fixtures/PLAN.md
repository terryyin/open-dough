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
Status: done

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
Status: done

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

### G1. Eager preparation has a fixed cost for suites without installed starts
Reported: slice 1 — "Preparation is eager for every global-setup run, including focused suites that use no startOrigin."
Story clause: "Reuse only immutable preparation when measurements justify it."
Disposition: proved by slice 2: measured normal45-case comparison includes eager preparation and falls41.26s to30.88s; complete baseline/candidate CI includes it and three new guards while origin spans fall442.99s to81.66s. The real no-start profile confirms1.71–3.29s eager cost, so focused commands without starts may be slower. Reuse is justified for the measured normal/full workload, not claimed free for every filter.

### G2. First-use diagnostic does not independently establish a speedup
Reported: slice 1 — "First real installed starts were included: old total 6.813s, candidate 8.176s."
Story clause: "Retain only supported gains; report inconclusive or rejected experiments honestly."
Disposition: proved by slice 2: the6.813s/8.176s diagnostic is explicitly inconclusive and excluded from supported speed claims. Final normal same45-case/default8worker result and complete same-workload hosted comparison supply aggregate evidence; no independent first-use gain is asserted.

### G3. Complete hosted comparison and added-proof cost remain pending
Reported: slice 1 — "full hosted coverage remains explicitly parent-owned."
Story clause: "Compare full hosted CI on named baseline and candidate revisions, including case/verdict equality, fixture costs, queue, job and suite time, and uncertainty."
Disposition: proved by slice 2: fullCI40809484652 at a94c65e2 and40814111625 at8c55a30c passed all16jobs; all1735 original identities/verdicts occur once, same4skips/zero retries plus3passing guards. Reports observe unchanged12shards/4workers, fixture spans, queue, job and suite time; new guards cost6.63 accumulated body seconds. Runner/cache variance is retained; repeated candidate observation is recorded in the durable timing report.

### G4. Aborted diagnostic directories with uncertain ownership were retained
Reported: slice 1 — "Four build/request directories were retained because creation windows alone did not establish ownership; uncertainty is preserved rather than deleting potentially unrelated state."
Story clause: "Failures retain cleanup and unexpected-error behavior."
Disposition: proved by slice 1: current failure guard observes missing preparation, partial clone Git128, owned machine/preparation deletion and unchanged peer; slice1-quiescence.json confirms no owned process/preparation survives. Known uniquely owned abort paths were removed. Generic uncertain directories from forced diagnostic aborts remain documented in aborted-owned-paths.json; no cleanup of those directories or claim of their ownership is made.


## Plan concern review

Refinement was not needed: the two structure slices own separate measured costs
and proof loops. The bootstrap choice is an authorized bounded probe in2, not
an assumed speedup. No remaining human decision or out-of-scope concern was
identified. Initial baseline and source-isolation premises are observed; all
new reuse and speed premises are owned by their producing slice's proof.

## Slice 1 accepted proof and limits

Final candidate adds only immutable installed-start preparation, private copies
and native clones, and three guards. The final45-case normal comparison passes
strictly in30.88s versus41.26s baseline; same names/verdicts/default8workers and
sanitized environment. Reporter40.558s to30.458s. The earlier26.83s trial is
superseded after restoring clone metadata parity. Three final isolation runs
pass3/3, terminal0, in10.36/10.19/10.72s. Twenty ordinary real-host, recovery,
store-failure, serving/process/compile-cache consumers passed with unaffected
boundary reuse after the parity correction. Complete config/ref/HEAD/tree/
status parity, private object storage and fresh-source/failure paths are
observed. No owned test/writer remains; raw exact commands, traces and caveats
are in slice1-proof.md and slice1-quiescence.json in the raw evidence directory.
Full hosted coverage and added three-test cost remain G3, owned by2.
The fresh baseline40809484652 passed all16jobs,1,735selected/1,731passed/same4
skips,577files; max job230s, max suite199.324s, full CI235s. Reported dashboard
fixture1,162.174 accumulated seconds and origin fixture442.992s. No speed claim
comes from the bare setup microprofile: preparation is eager, and first real use
varied/slowed in a diagnostic before final parity cleanup (G1/G2). Host load and
cache conditions remain comparison limits. Two sandbox diagnostics were ended
with status143 and count as no pass; all accepted dashboard proof uses the
escalated wrapper needed for sockets/ps/process cleanup on this host.

## Slice 2 accepted proof and limits

No additional bootstrap runtime change was justified. Real globalSetup prepared
assets and bundles before worker imports. Actual Vite/native-config previews
started in268.8/274.9/276.2ms, with only4.0/7.1/5.5ms private pre-spawn work;
close27.6–30.3ms. Compile cache stayed disabled. Two concurrent real previews
had separate PIDs/addresses/HOME/fakeGitHub/Codex sockets/browser contexts.
Mutating A changed only A; stopping A refused connections/deleted its HOME while
B retained its process, original HTTP/browser revision/backlog/localStorage,
HOME marker and model; then B stopped independently. The corrected private
profile command exited0 with no cleanup errors, all7childPIDs stopped and all
run preparation removed. Two earlier diagnostic assertion/cache-path attempts
are incomplete, not passing product proof. See slice2-profile-launch.mjs,
controller/worker JSON and log in the raw directory for literal command/setup/
assertions. No changed async code needs further repetition; accepted slice1
guard3passes and ordinary consumers remain applicable.

The fresh full hosted run closes all previously pending installed consumer
observations in slice1-consumer-trace.md: original selection/verdict equality
and added guards are checked in ci-comparison.json and ci-attempts.json. No
original assertion or scenario, fixture server, context, fake service, native
input, clock, tier, shard, worker or retry policy changed. Durable aggregate
measurements, fixed eager cost and runner uncertainty are retained in
docs/maintainer/dashboard-test-timings.md; maintained fixture rules are in
dashboard/tests/README.md. Do not sum nested fixture spans as elapsed savings.

Repeated identical candidate40815056135 also passed16jobs, same1738identities/
verdicts/same4skips/zeroextraattempts and12shards4workers. Origin81.833s
confirms component reduction; maxjob227s/fullCI230s versus baseline230s/235s.
Its maxsuite203.380s exceeds baseline199.324s, so no reliable suite-elapsed
improvement is claimed. Across candidates dashboardjobs219–227s andfullCI
221–230s show modest observed improvements with runner/cache uncertainty.
