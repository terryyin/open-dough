# Refresh dashboard CI workload weights

**Source:** [Selected story](../../seeds/SEED-173-dashboard-ci-balance.md#dashboard-ci-balance)
**Identity:** SEED-173#dashboard-ci-balance

## Goal and scope

Refresh current timing weights and rebalance existing dashboard work while
preserving every test, isolation, twelve shards and four workers per shard.
Measure overall CI elapsed, not merely aggregate test seconds. Start with
weight data only, using the existing refresh/deal mechanism. Application,
test bodies, fixtures, retries/skips, clocks, workflow, dependency and guidance
changes are excluded. No numeric improvement target is promised.

## Execution identity and current boundary

Owned local preparation workspace
/Users/terryyin/git/open-dough/.worktrees/dashboard-ci-balance, branch
codex/dashboard-ci-balance; created for this work from freshly fetched main
d57a83b2bc6d6f9e84814c34de2b6a6dbdfa1763. Originating/default checkout
/Users/terryyin/git/open-dough. Remote origin, trunk main. Execution will use
Story Branch Mode and this same workspace, without another worktree or claim.

Automatic approval review rejected the startup command before execution:
main publication of preparation metadata lacked explicit authorization.
No claim or profile was published. This draft and plan are local; no weights
are changed. Admission/publication approval is the remaining boundary before
implementation. Retain the same source and workspace after approval.

## Existing solution and decisive premises

The current duration index includes journeys, agents and boundary parts.
readDurationList and test-shares refresh preserve that structure. mergeTimes
records the largest observed per-file duration across supplied reports; retain
that existing aggregation contract first, with explicit source provenance.
The native Playwright projects remain complementary and queue serial deployment
chains early. The existing allocator deals discovered files exactly once.

Current weights describe570 recorded files from pre-optimization runs
40789926577/40790934008; current reports contain580 files and1741 cases.
The preceding investigation retained complete post-change reports under
/private/tmp/production-policy-ci-time-171. Main40834521203 at d57a83b2
passed16jobs,1737 expected cases and the same4 platform skips, with no retry.
Its suites ranged130–207s; fullCI241s. Shard8 carried770 accumulated spec
seconds versus477 on shard12. These are neither CPU nor elapsed seconds.
The same earlier candidate had materially varying shard and recovery costs,
so stale weights are a hypothesis to test, not proof of recoverable savings.

PFE: use scripts/test-shares.mjs refresh/preview, duration-list storage and
existing allocation/selection tests. No new allocator or measurement framework.
ADR0002 supports coherent reuse; ADR0008 preserves published/local state and
isolation; ADR0010 requires honest measured useful gain. Near-future direction
supports the empirical response; no temporary direction topic is realized.

## Measurement and proof ownership

After authorized admission and exact-checkout npm ci/command readiness, capture
two fresh full baseline runs sequentially at the prepared metadata revision
with the runtime of d57a83b2. Confirm complete green reports, identical cases,
12shards and4actual workers. Keep queue, setup, test, artifact and total time
separate. No concurrent owned CI measurement runs. Record revision, trigger,
commands and every result, including failures. A failure needs owned diagnosis,
not rerunning until green. Earlier main40834521203 is supporting context.

Use those two complete baseline timing artifacts plus the complete current-main
40834521203 artifacts as refresh inputs. Their source and max aggregation must
be explicit. Preserve each executed beforeAll/afterAll hook once, as the existing
reporter does. Confirm all580 discovered spec paths have one recorded weight;
retain the existing list parts, with genuinely unrecorded files accounted for.

Normal local proof before/after uses the same default command and environment:
env -u NO_COLOR npm test -- tests/support/dashboard-test-files.test.mjs tests/support/duration-list.test.mjs tests/support/test-shares.test.mjs.
Record terminal status and selected observations. Also compare the public
Playwright list output for every one of12 configured splits and unsplit mode:
each original full identity exactly once, with unchanged deployment/ordinary
partition. Listing proves selection, not execution or isolation. Unsplit local
wall speed is not the target because weights do not participate in that mode.
No new test is justified for this data-only reversible change.

Coordinator owns two sequential complete candidate CI observations at one
reviewed published revision, report downloads and unchanged-case/verdict,
platform-skip/retry/worker accounting. Compare fullCI, slowest job/suite, shard
spread and setup/queue/artifact costs against both fresh baselines. Report
runner/cache uncertainty and differences from the additional supporting run.
No summed-duration or offline balance model may be reported as measured CI gain.
If results undermine the hypothesis, reassess the weight strategy within this
outcome, or retain an honest inconclusive/negative result without false claims.
Do not implement another optimization priority to manufacture a speedup.

## Ordered slices

### 1. Current timing weights rebalance the unchanged browser workload
Type: Structure
Status: planned

Capture/reuse the named evidence, refresh weights through the existing tool,
inspect the public twelve-way selection and unsplit selection, and verify
ordinary local allocation consumers. Keep all tests, isolation, twelve shards,
four observed workers, strict verdicts and native serial-first scheduling.
Run the installed consumer trace for changed duration inputs and their config,
preview, validation and guidance consumers, assigning every consumer a truthful
proof/disposition. Run formatter and hook-owned lint only through coordinator
delivery. Independent source review and refactor precede publication. Publish a
reviewed progress revision when hosted measurement needs it, with the slice
unfinished until the coordinator accepts the complete hosted comparison.

Proof: ordinary local commands above, literal selection/identity comparison,
complete baseline/candidate reports and case accounting, actual worker counts,
source provenance and durable maintainer timing report. No assertion, test,
fixture or runtime behavior is narrowed. Existing full CI observes isolation.

## Current decisions

One cohesive Structure slice owns data refresh, allocation proof and elapsed
measurement. The user authorizes implementation and CI measurement; preparation
publication needs the explicit approval auto-review requested. Coordinator owns
formatting, hooks, commits, publication, observer and closure. Fresh agents own
implementation/source review/refactor under the execution skill. Replanning
within this outcome is permitted; no slice budget or wider outcome is inferred.
Git and network writes need sandbox escalation, and the shared stash stack and
other worktrees remain owned by their respective writers. Use env -u NO_COLOR.

## Plan concern review

Refinement is unnecessary: one bounded responsibility reuses existing tools,
and future hosted uncertainty has an explicit owner/proof loop. The source and
formatter/hook contracts are understood. No further plan-specific design
concern is identified. Publication authorization is an execution boundary,
not a fabricated readiness judgment or evidence of implementation completion.
