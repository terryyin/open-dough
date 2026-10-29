# Refresh dashboard CI workload weights

**Source:** [Selected story](../../seeds/SEED-173-dashboard-ci-balance.md#dashboard-ci-balance)
**Source review:** [Independent source commitments](source-review.md)
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

Preparation publication was explicitly approved by the developer, including
safe reconciliation. Admission accepted15f35ac010da59083d254ca8dabcf5ebe7dd2f8b
on main and codex/dashboard-ci-balance; agent Jane-chan, publisher
codex-dashboard-ci-balance. Startup reported created:false because this same
worktree had already been created for this work before approval. Its original
created-for-work fact above remains authoritative. The identical originating
drafts were removed and the default checkout safely advanced to15f35ac0.

Exact-checkout npm ci succeeded with unchanged lockfile; Node24.21 matches the
pin. The applicable preview command succeeds:580specs,570recorded/10unrecorded.
The installed checkout-bound runtime matches this workspace; native GitHub
workflow ci.yml/CI (id351271804) is active and push-triggered. Main admission
is unobserved by the branch observer. Earlier directory watch-K4rhGM stopped
cleanly with no unread event and PID3715 exited at the scope decision.
Rearmed same branch/coordinator dashboard-ci-balance-173 for authorized rejection:
directory /tmp/dough-ci-501/watch-nfnFaA,cell585/session57557/PID31804.
Raw measurement records: /private/tmp/dashboard-ci-balance-173.

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
env -u NO_COLOR PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/dashboard-test-files.test.mjs tests/support/duration-list.test.mjs tests/support/test-shares.test.mjs.
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
Status: done

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
measurement. The user authorizes implementation and CI measurement and has explicitly
approved preparation publication to main with safe reconciliation. Coordinator owns
formatting, hooks, commits, publication, observer and closure. Fresh agents own
implementation/source review/refactor under the execution skill. Replanning
within this outcome is permitted; no slice budget or wider outcome is inferred.
Git and network writes need sandbox escalation, and the shared stash stack and
other worktrees remain owned by their respective writers. Use env -u NO_COLOR.

Decisive checkpoint after two complete candidate runs: baseline fullCI229/216s
versus candidate245/242s, means222.5→243.5s (+21s/+9.4%). No numeric target
exists, but no useful elapsed gain is demonstrated. Prediction678.3–678.5
accumulated seconds does not hold as elapsed balance: candidate suite spreads
79.75/73.00s versus baseline71.11/65.64s. The weight-only assumption is
invalidated. Both candidates finish last on shard12, including the unchanged
type-check step17/16s; other suites remain comparable to the old maximum.
Another unmotivated weight refresh has no supported saving hypothesis.
Do not publish these weights to main or start another optimization priority.
The developer explicitly chose “Reject this allocation and retain the
measurements (Recommended)”. Restore the original four weight files; retain
the measured negative result and candidate in Git. No new strategy or follow-up
is authorized. G4 is settled by that direction and exact restoration proof.
Source-freshness reports unchanged story/plan against main6329fd76c23b0615b65f050d967c0be7cb570d3f.

## Story obligations

### G1. Implementation and complete hosted comparison were initially pending
Reported: slice 1 — "Before delegation, the coordinator observes that the timing weights have not been refreshed and complete fresh baseline/candidate proof has not yet run."
Story clause: "Refresh dashboard timing weights and rebalance the existing workload, keeping all tests and isolation, twelve shards and four workers per shard unchanged, and measure the effect on overall CI time."
Disposition: proved by slice 1: all four duration lists refreshed at874ef52c0e99857feefde9b4058673c83029d875; two complete candidate runs40843580744/40844264135 pass16jobs and preserve1741identities/verdicts,580files,12shards/4actualworkers,same4skips/noextraattempts against both baselines. Parent inspected raw complete reports and jobs. docs/maintainer/dashboard-weight-timings.md records commands, queue/job/suite/spread/wholeCI comparison and the negative result. Further strategy/delivery remains G4; this proof does not claim a CI speedup.

### G2. Initial local command selected the unsupported system Bash
Reported: slice 1 — "The first allocation command stopped before tests: resolved /bin/bash3.2, while this repository requires Bash5 or newer."
Story clause: "run suitable local allocation/selection proof before and after instead."
Disposition: proved by slice 1: the same normal three-file command with the documented Homebrew bin first on PATH exits0, wall1.28s, in allocation-before-pass.log/-times.txt. No test or runtime edit was needed; the initial setup rejection is not passing proof. Keep that PATH for the candidate command.

### G3. Sandboxed runner proof could not observe its owned processes
Reported: slice 1 — "The first sandboxed extra runner attempt timed out and was explicitly stopped, terminal137; an unchanged process-observation probe failed with ps EPERM inside the sandbox and succeeded outside it."
Story clause: "run suitable local allocation/selection proof before and after instead."
Disposition: proved by slice 1: parent inspected runProcesses.ts64-74/122-131 and globalSetup.ts77 teardown, exact sandbox/unsandbox probe logs, same-command terminal0/16.98s with8selected boundary cases, strict nested proof/one-attempt assertions and quiescence. No source/test/timeout changes; missing process-observation precondition restored. Original failed context/tree retained under sandbox-runner-failure; all7 recorded failed PIDs and exact-checkout runner processes are gone. Never count137 as passing proof.

### G4. Weight-only experiment is slower; further strategy needs disposition
Reported: slice 1 — "Both candidate observations are slower than both fresh baselines; equal accumulated duration weights do not equal elapsed CI balance, and the unchanged shard12 type-check is now on the critical path."
Story clause: "Report supported improvement, inconclusive or negative results honestly."
Disposition: proved by slice 1: developer explicitly rejected allocation and retained measurements; fresh implementation restores all four lists byte-for-byte to15f35ac0, exact hashes in restoration-verification.json, same normal allocation command terminal0/wall1.606s in restoration-allocation-result.json. Parent inspected source/hash/assertion correspondence; baseline fullCI/public selection apply to identical restored inputs, not a new speed claim. Durable report retains rejected874ef52c and all four measurements. No allocator/workflow scope extension or follow-up is selected.

## Plan concern review

Refinement is unnecessary: one bounded responsibility reuses existing tools,
and future hosted uncertainty has an explicit owner/proof loop. The source and
formatter/hook contracts are understood. No further plan-specific design
concern is identified. Publication authorization is an execution boundary,
not a fabricated readiness judgment or evidence of implementation completion.

## Baseline progress before implementation

Both sequential fresh baselines40839078106/40839642385 at15f35ac0 pass16jobs,
1741selected/1737expected,same4platformskips,580files,12shards/4actualworkers,
noextraattempts. Maxjobs226/213s,maxsuites202.591/187.369s,fullCI229/216s,
firstqueue3/3s,startspread1/0s. Both are workflow_dispatch; parent owns complete
reports/jobs. Supporting main40834521203 supplies the third complete input.

Normal allocation passes three named files,exit0,wall1.28s after G2. Public
unsplit/all12 split lists each exit0:1741unique identities,580files once,
complementary projects; selection-before.json/before-list-commands.json.
Listings ran sequentially (load18.21,16CPU/48GiB,unknown other-chat work),
with unchanged Node24.21/dependencies/environment. Listing proves selection,
not execution.

The229s/216s baseline spread remains uncertainty, not a selected best baseline.
All36 intended timing artifacts are present (12 each from both baselines and
main40834521203).

## Accepted local implementation before independent refactor

Only four duration lists change. Existing max refresh consumes all36 artifacts;
all580 labels occur once and equal actual input maxima,519 changed/51 unchanged/
10new/no removals. Original non-source headers/includes/part ownership remain;
source provenance is explicit. Current native parser/allocator/config stays put.
Public before/after lists preserve1741full identities/project/expectedStatus,
580owning files once;522files/1575cases move, preview678.3–678.5 predicted
accumulated seconds. These observations establish allocation, not CI speed.
Normal three-file command passes1.28s before and after; shared-allocator suites
pass0.29s. Native scheduling, hook times and proof-entry8case consumer command
passes16.98s after G3's demonstrated environment correction. Parent inspected
actual once-only/project, native overlap/strict and hook-counting assertions.
Consumer trace locates359files:34weight-related (19run/1reused/14excluded) and
325metadata-only matches excluded. All dispositions retained in raw directory.
No unexcluded consumer lacks allocation/reporter proof. All69 returned ids/text
match source-review; local/baseline/candidate observations now cover every id.
Implementation quiescent;
all proof commands terminal and failed diagnostics copied outside the worktree.

Fresh independent refactor /root/refactor_ci_weights returned REFACTOR COMPLETE,
none already clean: no edits or tests. All accepted implementation/setup/
observation locations and trace dispositions remain valid. Index empty;
formatter/hooks and progress publication remained coordinator-owned. Accepted
implementation874ef52c0e99857feefde9b4058673c83029d875 published to the same
execution branch with suffixBase15f35ac0 and reused observer. Hosted G1 is now
proved; G4 was then held for the developer's now-selected rejection. Durable report
docs/maintainer/dashboard-weight-timings.md preserves all four measured runs.

## Rejection and restored allocation

Fresh /root/restore_rejected_weights changes exactly four lists back to baseline
15f35ac0, all hashes equal. Same three-file normal command terminal0,wall1.606s;
restoration-verification/allocation-result/correspondence.json and log retain
command, assertions and exact byte correspondence. No test/config/runtime edit.
Original public selection/full baseline proof remains applicable; no new CI
measurement is asserted. Candidate874ef52c and report8e129818 stay recoverable.
Coordinator accepts exact restoration and complete measurement. Fresh independent
/root/refactor_rejected_allocation returns REFACTOR COMPLETE,none already clean;
no edits/tests, all accepted proof/359consumer dispositions remain applicable.
Ordinary delivery, retrospective and closure remain coordinator-owned.

## Execution complete

Product advice: no product change. Retain negative measurements and the developer-selected
restoration; no follow-up is selected. Reviewed owned874ef52c/8e129818/783d6bda,
with15f35ac0 preparation as provenance; unrelated main changes excluded.
No product correction; enabled process review records one ODF-141 recurrence
in DearDough.md (649lines; existing500-line warning, no retention/removal).
