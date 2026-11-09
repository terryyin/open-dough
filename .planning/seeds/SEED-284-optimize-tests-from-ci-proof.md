---
id: SEED-284
status: active
planted: 2026-11-09
scope: story
---

# Optimize tests from existing CI proof

<a id="optimize-tests-from-ci-proof"></a>

### Optimize tests from existing CI proof

**Identity:** SEED-284#optimize-tests-from-ci-proof

**Goal.** A developer can ask Dough to optimize tests in ordinary language and
get a worthwhile reduction in the wait for trustworthy local test results, or
a prompt explanation of where a worthwhile saving could not be established.
The skill chooses how to proceed from existing evidence, preserves behavioral
coverage and confidence, and brings the developer only consequential questions.

**Default behavior.**

- Start by reading retained CI test proof for the requested scope, using the
  project's configured GitHub Actions workflow or CI adapter. Prefer a complete,
  successful observation of that scope at the relevant revision. Identify the
  repository, revision, attempt, and selection. When only an earlier compatible
  run is available, label its revision and use it as a lead within the parts
  that still apply. Use failed or incomplete proof to diagnose problems and
  report its gaps. Try the existing full report or retained runner output when
  the summary lacks relevant timing detail. If the evidence still runs out,
  state the gap and stop the dependent investigation. A fresh profiling run
  starts only on an explicit request, which can be given in ordinary language.
- Start with a short ranked list, roughly 10–20 leads when useful, at the
  granularity the data supports. Include expensive shared setup, startup, waits,
  or worker tails where existing evidence exposes them. Follow related tests
  when they share the cost or protect behavior a change could affect. The agent
  chooses the shortlist, evidence source, and investigation depth without asking
  the developer for percentages, batch sizes, or modes. File totals and case
  counts guide discovery. Runner reports and job evidence help distinguish shared
  setup, parallel work, queue time, and the work that controls elapsed time.
- Pick the most promising avoidable cost and make the smallest meaningful
  experiment. Continue on further credible opportunities within scope and stop
  when the remaining payoff cannot justify the effort or plausibly reach the
  agreed target. Routine discovery can finish before a published assignment.
  Route a bounded experiment through proportionate execution with the project's
  existing delivery authority. Use a full plan when the evidence calls for
  dependent experiments, a shared harness redesign, or a consequential change
  in where behavior is proved. Keep the CI proof publishing recipe available
  for requests to set up a proof producer.
- Establish replacement proof before narrowing or removing coverage. Run the
  project's ordinary verification for the affected behavior and reuse comparable
  proof from CI produced by normal delivery. Report the scope of any measured
  gain, the protection retained, and any unresolved measurement. A claim about
  local elapsed time requires comparable local evidence. A CI case or file sum,
  a CI job or workflow wall time, and developer wait including admission are
  distinct measures. Compare like selections and runner conditions, including
  replacement proof and shared setup where measured. Follow the project's
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

**Test Optimization Candidates.** Keep the existing record for material costs
that still need deeper developer analysis **and** protect valuable behavior
that the agent cannot safely simplify, downgrade, or remove. Each live entry
names the affected test or fixture, observed cost and conditions, unique
protection, alternatives tried, and the remaining decision or evidence needed.
Resolve clear opportunities during normal optimization. Keep the original
evidence recoverable when a candidate is fixed, accepted, or moves to a named
story, with the live decision in one home.

Put accepted necessary cost beside the owning test, scenario, or shared fixture
using a project-native tag, annotation, or short source comment that explains
why the particular cost is warranted. Use the narrowest scope that owns it. The
indicator guides opportunity selection while the cost still counts in timing
and the test retains its normal execution and verdict. Existing execution tags
keep their own meaning. Revisit the accepted cost when it grows materially,
its justification changes, or new evidence identifies cheaper equivalent proof.
An accepted cost in one case leaves other cases and avoidable setup open to
improvement.

Support the current published four-section candidate format alongside the
shorter live record during rollout. Move substantiated accepted-cost decisions
and their rationale to source as projects adopt the change. Existing
profile-only markers need to be read according to their actual semantics before
treating them as accepted-cost decisions. Reuse the candidate reader and the
existing CI proof contract, including its attempt identity, timing units, and
gap reporting. Coordinate with the current proof and Intent work where the
interfaces meet. Existing retained artifacts are sufficient to start.

**Key examples.**

- An ordinary Pygardon pytest optimization request finds file timings in an
  existing successful CI attempt. If its adapter returns totals only, the
  agent reads the retained full report for that attempt. It follows one
  promising shared cost into a bounded change, or reports a supported stop,
  with zero fresh profiling runs and no request to pick a percentile or mode.
- A proof artifact is missing, untimed, partial, or belongs to a different
  attempt or selection. The agent exposes the gap, uses compatible retained
  evidence at its actual scope, and leaves an unsupported timing claim open.
  An explicit request for fresh profiling runs the appropriate project command.
- Pygardon's minimal real H.264 round trip carries its accepted codec cost in
  source. The worker-stall test can explain the real exit timeout while the
  surrounding family's repeated setup remains eligible. A Doughnut scenario tag
  applies to its scenario even when CI reports an aggregate for the whole
  feature. Pygardon's `slow` and `host_docker` markers have separate execution
  effects and do not acquire accepted-cost meaning by inference.
- Open Dough's rate-limit test illustrates a live candidate while its valuable
  directed-time proof still needs a developer decision about a controllable
  clock in the released request owner. A resolved accepted cost leaves the live
  list once its rationale is recorded in source. Intent continues reading old
  published records during migration and reads the new shortlist correctly.

**Evidence and evaluation.** The old project skills offered literal runner
commands and ranked the slowest 10%, so agents had a clear first action.
Rank-based batches also caused repeat visits to the same files. The shared
skill kept useful family and coverage analysis, dropped the explicit shortlist,
and later added admission before profiling. Recover a bounded starting point
and defer the administrative commitment until the evidence warrants it.
[Old Doughnut guidance](https://github.com/nerds-odd-e/doughnut/blob/47df168656/.agents/skills/test-optimization/SKILL.md#L107),
[extraction record](https://github.com/terryyin/open-dough/blob/dcd3d5fb3b939fba76e80a90e840bf6e512ec186/src/skills/dough-test-optimization/RECOGNITION.md),
[admission change](https://github.com/terryyin/open-dough/commit/bd387824c).

- **Pygardon.** The older pytest pass went from 63.37s to 53.70s. A frontend
  pass after extraction went from 21.2s to 15.5s across interleaved runs. More
  recently, the Git fixture pass reduced focused wall time from 45.86s to
  29.78s. The later reranked pass found a focused gain from 20.03s to 12.66s,
  while heavy and changing load made the ordinary suite comparison
  inconclusive. A bounded fixture pass also had a 25,094-token startup read
  truncate. The retained pytest CI report has 1,212 timed file rows even when
  its compact adapter response omits the breakdown.
  [Older pytest pass](https://github.com/terryyin/pygardon/commit/c6b27a19e),
  [post-extraction frontend pass](https://github.com/terryyin/pygardon/commit/101d3aafa),
  [Git fixture pass](https://github.com/terryyin/pygardon/blob/22e3c9e1e/.planning/slice-plans/453-python-unit-test-feedback/PLAN.md#ordinary-selection-re-profile),
  [reranked pass](https://github.com/terryyin/pygardon/blob/1cff6dd65/.planning/TEST-OPTIMIZATION-CANDIDATES.md#latest-pass),
  [startup finding](../../docs/maintainer/findings/ODF-264.md#odf-264),
  [hosted proof](https://github.com/terryyin/pygardon/commit/b455885c2).
- **Doughnut.** An earlier E2E pass went from 23m46s to 18m34s after cutting
  repeated setup and overlapping scenarios. A recent merge saved about 0.2s
  focused with no demonstrated full frontend gain. Two record-only refactors
  in that pass reported 106,673 tokens for two wording edits. The v0.3.84
  records-only disposition already addresses that example. Existing CI proof
  ranks EPUB at 53.79s across 21 cases, and retained Cypress logs can identify
  individual scenarios. The existing profile-only slowness tag is distinct
  from ordinary selection tags.
  [Earlier E2E pass](https://github.com/nerds-odd-e/doughnut/commit/10b3217797),
  [recent measurements](https://github.com/nerds-odd-e/doughnut/blob/9d95965cfb/.planning/TEST-OPTIMIZATION-CANDIDATES.md#latest-pass),
  [refactor finding and released response](../../docs/maintainer/findings/ODF-141.md#odf-141),
  [CI proof](https://github.com/nerds-odd-e/doughnut/actions/runs/42498952903),
  [tag guidance](https://github.com/nerds-odd-e/doughnut/blob/c3c463656a/.agents/skills/e2e-authoring/SKILL.md#test-optimization-profiling).
- **Open Dough.** One ordinary dashboard pass went from 630s to 589s after
  replacing repeated browser variants with cheaper boundary proof. Six later
  passes spent about 146 minutes on recorded baseline and final suite runs.
  Another candidate command spent about 38 minutes waiting for suite admission.
  In a retained CI run, a watcher file had 65s of case time and 195s including
  shared hooks. A different shard held up CI.
  [Ordinary gain](https://github.com/terryyin/open-dough/commit/f5d22bce4),
  [local pass records](../../docs/maintainer/dashboard-local-test-timings.md),
  [final pass](../../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-seed-197-2026-10-31),
  [admission finding](../../docs/maintainer/findings/ODF-405.md#odf-405),
  [CI attempt](https://github.com/terryyin/open-dough/actions/runs/42548844204).

Pilot the new default on one ordinary Pygardon pytest pass. Judge time to a
credible keep-or-stop decision, full-run cost, and any verified change in the
developer's ordinary wait with the required protection. A timely, evidenced
stop is a useful result when the available opportunities do not pay for the
work. Follow [ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
and [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for the distinction between the maintained source decision, published workflow
record, and observed CI result.
