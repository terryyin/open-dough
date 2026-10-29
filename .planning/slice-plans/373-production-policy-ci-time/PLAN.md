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
Retained branch observer: coordinator production-policy-ci-time-171,
directory /tmp/dough-ci-501/watch-sgyuzH, cell375, session92922, PID89768.
Reuse it for all execution increments; no duplicate watcher.

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
Status: planned

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

## Plan concern review

Refinement was not needed: one cohesive owner, existing real boundaries and
bounded proof loop. Baseline and discriminator premises are observed in this
checkout. No remaining human choice or architectural conflict was identified.
The future implementation/measurement proof is owned by slice1 and may not be
claimed complete merely because its preparation is ready.
