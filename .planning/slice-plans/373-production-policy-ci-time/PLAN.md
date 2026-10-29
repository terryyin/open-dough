# Cheaper production-watcher policy coverage

**Source:** [Selected story](../../seeds/SEED-171-production-policy-ci-time.md#production-policy-ci-time)
**Source review:** [Independent source commitments](source-review.md)
**Identity:** SEED-171#production-policy-ci-time

## Goal and scope

Reduce repeated full-app builds while preserving the policy family's fault
detection and unique watcher integration proof. Reuse the existing real-Git
qualification boundary for overlapping rules. No production behavior, mutable
fixture sharing, assertion weakening, retries/skips, clock/second-server work,
shard/worker/weight changes, release or guidance changes.

## Execution identity

Story Branch Mode; owned workspace
`/Users/terryyin/git/open-dough/.worktrees/production-policy-ci-time`, branch
`codex/production-policy-ci-time`, created for this work. Starting revision
`b8ad020a2ec8d12b26a5ef6db6ed3308833dc2f5`. Originating/default checkout
`/Users/terryyin/git/open-dough`. Remote origin, integration target main;
implementation target refs/heads/codex/production-policy-ci-time. Admission
accepted on main and execution branch as
`80678d4a7be69459952dcf533b8d3486d57566ea`, agent aki-chan, publisher
codex-production-policy-ci-time. The identical originating draft was removed
and default checkout safely refreshed to that accepted claim.

Node24.21.0 matches .node-version. npm ci and Chromium acquisition succeeded
in this checkout; runner selection observes10cases through the two filters.
Selected checkout and canonical installed CI runtime match. Workflow diagnostic
selects ci.yml/CI, id351271804, push-triggered; native GitHub adapter, existing
integrated-state policy. The main admission is unobserved by the branch observer.
Original observer /tmp/dough-ci-501/watch-sgyuzH, cell375/session92922/PID89768,
finished at its eight-hour bound. Current coordinator production-policy-ci-time-171
stream /tmp/dough-ci-501/watch-j9i5bH, cell432/session50703/PID41056, recovered
published f84ddb57 through managed resume with no push. Reuse it; no duplicate watcher.

## Baseline and decision basis

Raw evidence is outside Git at `/private/tmp/production-policy-ci-time-171`.
Normal local command before and after, unchanged default worker configuration:
`env -u NO_COLOR npm run test:dashboard -- production-watcher-updates.spec.ts production-qualification.spec.ts`.
Baseline80678d4a has runtimeb8ad020a:10selected/strictpass, terminal0,
wall74.68s, reporter74.315s. The default cap is8workers on16logical CPUs/48GiB;
do not confuse configured capacity with active workers. Before launch: load5.95,
11.72GiB free; no competing owned heavy proof. Recheck headroom before expensive
commands, sequence owned local runs, and retain unknown other-machine work.
Proof records, literal argv and times are family-before.json/.log/-times.txt.

Fresh full baseline40825747965 was dispatched at admission80678d4a, before
implementation. The coordinator owns its verdict/download and candidate CI
comparison. Keep queue, job and suite time separate; whole-suite benefit cannot
be inferred by subtracting serial test seconds. Prior exploratory run40817738559
had a193s update chain and112s across its two policy cases, but queueing also
made full CI423s. It is supporting context, not this task's fresh baseline.

Keep only a normal-family improvement supported by preserved proof and full CI.
There is no numeric speed target. Static current flow has five successful
policy activations (E,F,H,Q,S), besides the retained startup/update/shutdown
journey. Each activation stages, installs, builds and replaces a real app.
Hypothesis: remove overlapping activations without removing distinct watcher
observations, saving useful family time. Count actual gate/prefix observations,
including required failure/held-build work, not only case or source-line counts.
If local feedback fails to improve, revise or undo ineffective changes. Report
inconclusive hosted elapsed results honestly; do not widen scope to hit a number.

## Existing solutions and decisive premises

- PFE: productionQualification.mjs owns qualification from real published trees;
  boundary/production-qualification.spec.ts exercises it with disposable origins,
  remote candidate workflows, local edits, ranges, renames, unsupported/missing
  policy and cleanup. Reuse this boundary; no second policy grammar or framework.
  The shared ci-workflow-path-policy.mjs parser and its Node tests already own
  YAML/glob rules; do not duplicate that matrix in full deployments.
- productionUpdatePolicies.ts supplies the two policy steps in the one real
  productionUpdateJourney chain. publishedMainFixture, build gates, deploymentWork
  and replacement signals already observe actual work. Preserve these owners;
  do not replace npm/Vite, Git, build success or activation with internal fakes.
- Baseline normal10-case proof reaches both boundaries and real watcher results.
  Before readiness, two isolated scratch faults were detected by existing tests:
  reading the baseline commit's policy fails the selected-policy case; dropping
  qualifying paths fails the accumulated application-range case. Each selected
  one case, exited1 on its assertion; source was restored byte-for-byte in finally.
  Restored full qualification suite selected3 and passed strict, terminal0.
  Exact commands/results are qualification-discrimination.json, the two
  *-mutant.json/.log records and qualification-restored.json/.log.
- Remaining equivalence is established before predecessor narrowing: add any
  missing cheap proof, observe discrimination where mapping is uncertain, then
  reshape the expensive journey. A title, passing count or supplied fixture
  outcome is not equivalent proof. Preserve all unique integration observations.
- ADR0002 supports coherent reuse; ADR0008 keeps real published-state/local
  process boundaries; ADR0010 requires worthwhile measured gain within coverage
  constraints. Existing North Star direction is respected; no temporary topic
  is realized or changed by this bounded test maintenance.

## Ordered slices

### 1. Production policy coverage uses the least expensive real boundary
Type: Structure
Status: done

First map every original policy observation to an inspected surviving or
replacement assertion. Establish missing real-Git boundary coverage before
narrowing its predecessor. Reduce repeated full-app policy activations while
keeping the actual watcher's no-work skip, published-policy precedence,
latest-selected commit, unsupported-policy/build-failure baseline and
post-success skip observations. Preserve real install/build/preview, recovery,
shared records/configuration and process/check-out cleanup. Keep one coherent
journey, without additional fixture modes, internal outcome stubs or new
production seams. A necessary cohesive split of test support is allowed.

Proof: original-to-surviving coverage-map.md beside this plan; discriminator
checks for uncertain equivalence; the exact normal local family including all
replacement cost; three consecutive complete strict passes of changed async
family; applicable ordinary production/deployment/refusal/failure consumers;
consumer trace and quiescence. Owned code stays within250lines after formatting.
The coordinator owns fresh complete candidate CI, unchanged-case/verdict and
intentional-move accounting, gate/build observations, fixture costs, queue,
job/suite elapsed and uncertainty. Publish a reviewed progress increment when
hosted proof needs its revision, leaving this slice unfinished until those
observations are accepted. No deliberate scratch fault enters a commit.

## Current decisions

One cohesive Structure slice owns policy-proof relocation and cheaper real
integration. The user authorized implementation and measurement; normal planning
does not add a review stop. Replanning is permitted within this same outcome if
evidence requires it; no numeric slice budget or expanded outcome is selected.
The coordinator owns formatter, hooks, commits, publication, CI and closure.
Implementation/refactor agents return uncommitted work and do not run independent
hook-owned lint/typecheck. Full filesystem access is enabled; do not supply
sandbox_permissions. Use env -u NO_COLOR for all dashboard commands.

## Story obligations

### G1. Candidate hosted evaluation remains incomplete
Reported: slice 1 — "Fresh candidate CI, named candidate revision, hosted verdict/platform accounting, queue/job/suite comparison and runner-variance assessment remain coordinator-owned."
Story clause: "Compare fresh full hosted CI on named baseline and candidate revisions"
Disposition: proved by slice 1: durable docs/maintainer/production-policy-test-timings.md and baseline/candidate/repaired/repeat-measured.json compare named revisions, all original identities/verdicts, unchanged skips/attempts, real-build counts, fixture spans, queues/jobs/suites and variance. Both repaired runs pass16jobs. Normal local feedback and first hosted policy case improve; overall elapsed CI does not improve in this sample. All15 linked source commitments now cite their specific observation.

### G2. Consumer trace prose overstated its row count
Reported: slice 1 — "Both saved files contain 96 consumers: 11 run, 85 excluded, with none missing a disposition."
Story clause: "Map original observations to surviving proof."
Disposition: proved by slice 1: parent independently counted all96 located rows after the trace heading,11run and85excluded, no missing disposition. Corrected97 to96 in plan/map prose; actual consumer set, coverage ledger, observations and implementation are unchanged. Refactor removed only an extra EOF blank line, so all accepted proof remains applicable.

### G3. First candidate full CI failed a custom-provider fixture race
Reported: slice 1 — "CI40830010312 job test (1/3) failed: custom integrated-state completion expected confirmed shutdown but received retained."
Story clause: "Compare fresh full hosted CI on named baseline and candidate revisions"
Disposition: proved by slice 1: deterministic slow-registration diagnostic records success plus retained/unread_actionable_failure for startup D. Parent inspected observe/register/release, real completion assertions and unchanged safety consumers. Custom hold/release no-ops violated the existing fixture contract; file handshake repairs that precondition without suppressing runtime safety. Three complete six-case passes and six downstream/safety files (53 top-level plus4 nested cases) pass. Independent refactor reports no edits and REFACTOR COMPLETE. Hosted acceptance is separately proved by G1; the failed run is never counted as green CI.

## Plan concern review

Refinement was not needed: one cohesive owner, existing real boundaries and
bounded proof loop. Baseline and discriminator premises are observed in this
checkout. No remaining human choice or architectural conflict was identified.
The future implementation/measurement proof is owned by slice1 and may not be
claimed complete merely because its preparation is ready.

## Accepted local proof before independent refactor

The original-observation ledger is coverage-map.md. New real-Git rule coverage
selected4/passed strict before narrowing F/H. Retained actual watcher E/G
proves selected-policy precedence and no-work; P/Q and R/S remain independent
real recoveries. E/Q policy ignores workflow/docs repairs, so Q must retain
P application paths. Actual E/Q/S prefix, browser, no-work and replacement
signals preserve the integration contract. Parent inspected the unchanged
watch-dashboard qualifier boolean branch through deployment staging, actual
changed tests and all original ledger rows; no internal result is faked.

Three consecutive normal-family runs selected11 (all10original names plus
new Git case), strictpass/terminal0, wall67.53/67.75/67.30s, reporter67.091/
67.356/66.895s versus baseline74.68/74.315s. Exact same filters/default cap/
Node/deps/env; new proof and setup cost included. The broader normal command
`env -u NO_COLOR npm run test:dashboard -- production-watcher production-deployment production-qualification`
selected27 across6owning specs and passed strict, terminal0, wall84.83s.
Consumer trace dispositions cover96listed files, with actual changed callers
observed; quiescence.json has no processes/output paths for five run IDs.
Raw literal commands/comparison are implementation-commands.txt and
local-family-comparison.json. Single baseline, differing host load and unknown
other-chat work limit inference. Actual policy activations5to3 and successful
watcher builds8to6 are observed through independent gate-prefix assertions;
one held shutdown gate and global Vite build remain. Failed R/S preparation
attempt counts vary and are not claimed exact.

Fresh baseline40825747965 passed16jobs:1740selected/1736expected/same4skips,
580owning files,12shards/4workers, no extra attempts. Longest dashboardjob217s,
maxsuite191.422s, fullCI221s, firstqueue3s/startspread1s. Baseline reports and
baseline-measured.json retain identities/hooks/jobs. Main preparation accepted
58e2f647 after unrelated VERSION/CHANGELOG-only release metadata; this execution
branch intentionally stays prepared2f8cb0e2, keeping baseline runtime unchanged.
Repeated startup confirmed existing ready claim. Its default maintenance was
stopped/diverged by unrelated root work; root work is preserved. At progress90ea, G1 remained incomplete and required the published revision.
Its final accepted observations are below; no early done mark was made.

Independent refactor /root/refactor_policy_coverage completed with
`## REFACTOR COMPLETE`: one EOF blank line removed, no semantic edit or
structural residue. Accepted boundary, setup and observing assertions unchanged;
no tests rerun. Formatted size predictions172/230/78, all records below250.
G2 settles the96-row accounting correction. Refactor quiescent, observer intact.

## Owned CI repair before hosted evaluation resumes

Failed run40830010312 at90ea7710 passed all12 dashboard jobs:1741selected,
1737expected/same4skips,580files, no extra attempts, all1740baseline identities
and verdicts retained plus one real-Git case. Policy body27.959to15.474s;
update chain129.923to116.837s. Maxjob227s/fullCI229s reached a failed Node
result, not green CI. Fixture startup totals also varied; no overall gain claimed.
Repair owns only ci-integrated-state-custom-test-fixtures.mjs. Raw diagnosis,
negative patch/log, three focused passes, six-file consumer/safety pass and
13-consumer trace are ci-repair-custom-completion/ under the raw directory.
Actual runtime correctly retained unread D failure; no assertions, runtime,
guidance, installed copies or dashboard code change. Fresh independent refactor
/root/refactor_ci_fixture_repair returned REFACTOR COMPLETE, no edits/tests.
Saved clean CI repair receipt i8D6Ze was restored after f84ddb57 publication;
no stash bytes were applied or dropped. G1 now has complete hosted observations.

## Accepted hosted measurements

Durable report: docs/maintainer/production-policy-test-timings.md. Repaired push
40832680173 and identical-revision repeat40833205738 at f84ddb57 each pass16jobs.
All1740 baseline identities/verdicts remain, plus one passing Git case; same4skips,
zero extra attempts,580files,12shards and4observed workers. First policy case
27.959s becomes14.346s/21.274s (original candidate15.474s). Whole update chain
129.923s becomes120.714s/194.809s, so no reliable chain-elapsed gain is claimed.
Passing fullCI221s becomes228s/230s; maxdashboard217s becomes225s/226s;
maxsuite191.422s becomes194.337s/203.697s. This sample is slower overall.
First queues3/3/3s, start spreads1/0/1s. Fixture costs and unchanged recovery
variation are in the report, with runner/cache uncertainty and single-baseline
limits. Retain the simpler proof and9.3–9.9percent local gain; no overall CI
speedup claimed. G1/G2/G3 and all67 source commitments have inspected proof.

## Execution review

Original prepared2f8cb0e2 contract and all67 source clauses remain fulfilled.
Attributable revisions:80678d4a admission,2f8cb0e2 preparation,90ea7710 tests,
f84ddb57 fixture repair,90c5122e measurements. Main release/adoption and sibling
consumer-trace work are excluded. Aggregate proof retains real integration and
private state; cheaper Git coverage preceded narrowing. Existing qualifier,
watcher, deployment and process-lifetime owners remain cohesive under ADRs2/8/10.
No correction or refactoring residue found. Empirical direction supports the
measured local gain, without inventing overall CI benefit or future scope.
Process review enabled; retained conversation/handoffs assessed, with earlier
raw transcript unavailable after compaction. No new supported process finding.

## Execution complete

Product advice: no change. This bounded priority is complete; overall elapsed CI
improvement remains unproven. No additional priority is implemented or queued.
