# Fewer CI runner jobs without a later verdict

**Source:** [refined story](../../seeds/SEED-350-fewer-ci-jobs.md#run-ci-on-fewer-jobs)
**Source review:** [independent commitments](source-review.md)
**Identity:** SEED-350#run-ci-on-fewer-jobs

## Goal and boundaries

Keep the smallest measured passing CI layout, preserving complete tests and
proof and no worse whole-workflow wall time both alone and with another run.
All groups, lint, proof placement and reviewed job/run budgets are open. No
19/18-job floor. The seed owns the outcome and examples.

Do not optimize/remove tests, buy capacity, alter dashboard presentation, or
build an automatic scheduler. A documented rule plus one measured reduction
or no-change is safe interim value, not cancellation of the remaining search.
Preparation authorizes no implementation or dispatches. Execution mode remains
the executing instruction's choice; variants can run from Story Branch refs.

## Existing solution and architecture

PFE found one suitable allocation owner: `scripts/share-deal.mjs`, consumed by
`scripts/test-shares.mjs`, Distribution discovery and browser configurations.
Reuse its selection and previews. Refresh from complete recent CI artifacts;
summed job/spec seconds rank candidates without certifying parallel wall time.

`.github/workflows/ci.yml` owns placement/counts and expected proof parts;
`browser-test-group.yml` owns per-group execution. The two local CI proof
actions already preserve outcomes, units and missing parts. Co-hosting work
may change physical placement, but keep each logical producer's selection,
settings, report and failure visible. Do not let a first failing command skip
the remaining required checks or their proof.

`scripts/ci-repeat.sh` owns dispatch attribution and bounded repetitions
(default two concurrently). Reuse suitable behavior; it reports stability,
not A/B timing. Exact-attempt run/jobs reads and proof artifacts supply timings.
Its queued SEED-324 coverage-gap story is not a prerequisite; do not assume
unobserved repeat-helper behavior works.
`dashboard/server/ciWallTimeReference.ts` provides a useful existing eligibility
rule (successful build, valid attempt bounds, complete declared proof), but
its retained dashboard store is not an experiment acquisition route.
`ciTimeWithoutRunnerWaits.ts` measures a different quantity; do not substitute
it for whole-run elapsed time or add another dashboard metric.

Follow Accepted [ADR 0002 — lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(reuse and coherent responsibilities),
[ADR 0008 — dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(procedures and particular observed proof remain distinct), and
[ADR 0010 — definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
(prospective basis and bounded claims). No conflict or supersession found.
`.planning/NORTH-STAR.md` has no governing CI-layout topic; none is needed.

Expected edited owners are below 250 lines at `01ef3a5ec`. The repeat helper
is 228: if it must grow, separate dispatch attribution from result reporting.
Recheck additional edited files. The dashboard timing spec is 242 lines;
extend it only if workflow matching behavior changes.

## Outside-in proof ownership

| Source promise / boundary | Owning slice | Observable proof |
| --- | --- | --- |
| Attributable baseline; whole verdict includes all queues and final proof | 1 | Exact revision/attempt run and jobs timestamps plus complete proof; solo and overlap contexts distinguished |
| Fewer Distribution jobs, same tests/proof, no worse in either context | 2 | Allocation union equals baseline; supported runner checks; repeated matched complete CI comparisons |
| Every group/lint/budget open; smallest measured passing whole layout | 3 | Candidate ledger includes combined packings and rejected/inconclusive cases; final solo/overlap confirmation |
| Every test and proof unit survives placement/count changes | 2 and 3 | Selected file/case identities and outcomes, declaration/fragment replay, real CI artifacts with no missing/ambiguous parts |
| Future job additions need measured whole-run benefit | 4 | Walk an add-share proposal through AGENTS and both sizing documents; rule includes queueing, baseline and outcome |

## Decisive premises and observations

Preparation observations: 2026-11-14 at `01ef3a5ec`, this owned worktree;
read-only CI access, with scratch edits reverted.

| Premise / consuming operation | Observation and result | Remainder / owner |
| --- | --- | --- |
| Whole-run queueing is real | `gh api repos/terryyin/open-dough/actions/runs/43552321296` and its `/jobs?per_page=100`: creation 03:34:20Z, last completion 03:40:10Z; 22 jobs, 3,487 runner-seconds; test share queued 77 s and proof queued 74 s | Historical evidence is exploratory, not candidate causality; slice 1 |
| Older comparison is matched | Same API reads for 43532089843: 295 s, 18 jobs, 3,513 runner-seconds; browser job names `dashboard (i/13)` differ from current separate groups | False premise; use fresh fixed-workload baseline, slice 1 |
| Count previews reach real discovered selections | `PATH="/opt/homebrew/bin:$PATH" node scripts/test-shares.mjs preview --split-count N`, N=4,3,2,1: all exit 0, 644 checks, approximately 500/667/1,000/2,000 job-seconds per share | Two/one exceed the current 694 aggregate budget; reviewed repacking budget belongs to slice 2 |
| Browser preview uses the same groups | `node scripts/test-shares.mjs preview --split-count N --spec-dir e2e`; dashboard form adds `--spec-dir dashboard --root ROOT --list LIST`. Observed E2E 6/4, integrated 5/4, frontend 1, backend 4/3: all exit 0; file totals 303/269/57/432, unrecorded 12/15/19/58 | Stale/unrecorded timing cannot certify wall time; slices 1 and 3 refresh/account for it |
| Count consumers can be located by execution | Scratch `ci.yml` changed Distribution matrix 4→3 and expected parts 4→3; the four-check command below exited 1 at `ci-proof-actions.test.mjs:48`, whose expected missing parts still named four | Update that contract consumer with a kept count change; other count consumers remain subject to the same probe |
| Existing local proof route works | Exact four-check command below passed after byte-for-byte workflow restoration, exit 0; Bash 5 via `/opt/homebrew/bin`, on AC under `caffeinate -s -i` | Establishes current contract baseline, not future timing or proof preservation |
| Live experiments can be attributed without changing tests | Real run/jobs API reads succeeded; workflow has independent `workflow_dispatch` runs, proof revision, per-producer artifacts | Dispatch, complete proof acquisition and representative timing are state-changing/hosted: early probe slice 1; failure stops dependent comparisons |

Four-check command observed red under the scratch count change and green after
restoration (use the same supported runner during execution):

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- \
  Distribution/tests/support/ci-browser-groups.test.mjs \
  Distribution/tests/support/ci-proof-declaration.test.mjs \
  Distribution/tests/support/ci-proof-actions.test.mjs \
  Distribution/tests/support/browser-group-shards.test.mjs
```

## Measurement basis for execution

Follow the [durable prospective protocol](../../../docs/maintainer/ci-layout-measurements.md#prospective-protocol--2026-11-14)
for the fixed workload, complete-verdict metric, solo/mixed/equivalent two-run
blocks, sampling ceiling and strict no-regression decision. Its acquisition,
run and candidate ledgers retain timestamps, proof, load limits, unsuccessful
attempts and search exclusions through wrap-up. Uncertainty keeps a candidate
unkept and the dependent search unfinished; it never establishes no-change.

## Ordered slices

### 1. Obtain an attributable whole-CI comparison
Type: Behavior
Status: planned

Behavior: A developer needs evidence for a proposed reduction → execution
pins the workload and prospectively records the protocol, then runs baseline
and a reversible three-Distribution-share candidate → complete exact-attempt
measurements distinguish solo time, overlap time, runner waits and proof.

This early hosted probe reuses dispatch attribution and real workflow/proof
actions. Reach successful runs and full proof, not just dispatch acceptance. If auth,
run ownership, proof acquisition, workload matching or sampling cannot support
the comparison, stop dependent slices with the observed failure and revised
route/decision. Revert or park only this attempt's unkept variant.

Proof: The recorded run table recomputes whole elapsed time from timestamps and
shows both contexts on the same workload. An intentionally queued proof job
must remain in the metric. Any test failure is repaired under the policy below,
not discarded to improve the timing sample. Reuse matching probe evidence later.

### 2. Keep the smallest proven Distribution share count
Type: Behavior
Status: planned

Behavior: The comparison route works → evaluate 3, 2 and 1 shares, using
recorded work to order trials and reviewing packing-dependent budgets → adopt
the smallest passing count with all checks and complete file proof, or retain
four with measured rejection evidence. Do not exclude two/one merely because
the old per-share aggregate ceiling was calibrated for a different packing.

Keep per-check performance protection. Review aggregate/run/job budget changes
against unchanged checks and whole-run time. Update workflow matrix,
expected proof parts and reached contract consumers together.

Proof: Allocation union equals the baseline's discovered check identities,
every check belongs to exactly one share, four-check contract selection passes,
and matched complete CI samples meet the basis in both contexts. Existing
`Distribution/tests/support/test-shares.test.mjs` and
`Distribution/tests/test-runner-budget.sh` cover allocation/budget semantics
if those owners change; run them through `npm test --`.

### 3. Pack the whole workflow into fewer measured passing jobs
Type: Behavior
Status: planned

Behavior: Distribution's result and baseline measurements are available →
evaluate smaller browser matrices and combined layouts, including lint/proof
placement where their slack makes it credible → keep the lowest measured
passing total without delaying either context's final verdict or losing proof.

Consider all four groups, not just the quickest next reduction. Use fresh
duration evidence before ranking; larger per-shard predicted work is a risk to
measure, not a permanent rejection. Packing logical producers together is an
option when count-only changes stop saving jobs; preserve independent outcomes
and proof even on partial failure. Do not merge product test responsibilities
or add a framework simply to co-host commands. Review any genuine design change
against the same source and ADRs before its dependent implementation.

Proof: Browser selections retain all file/case identities exactly once;
declaration/replay checks and full real proof remain complete for all five
Intent entries, including file/case units and failure reporting. Confirm final
combined layout against the fixed baseline alone and under the matched two-run
load. The retained table names kept, rejected and inconclusive candidates and
limits the minimum claim to its actual search. No untested combined reduction
is declared a measured failure.

### 4. Make future layout decisions use whole-run evidence
Type: Behavior
Status: planned

Behavior: An agent proposes another runner job → `AGENTS.md` and both share /
shard sizing documents require a stated baseline and measured complete-verdict
benefit including runner queues under the account limit → a shorter isolated
job or queue-free chain alone cannot justify adding the job.

Update actual counts, preview commands and budget explanations consistently;
link the durable measurements without copying a changing measurement table to
three homes. Record the final observed result and rejected layouts there, so
deleting spent seed/plan records will not remove the evidence.

Proof: Walk the seed's faster-job/later-verdict counterexample through all three
guidance entry points and confirm it is rejected for the same whole-run reason.
Run formatting/link checks appropriate to the changed documents; do not add
tests mirroring prose. An evidenced no-change result still documents the rule.

## Verification and delivery gates

Local gate: supported named checks above, plus affected allocation/budget tests
when their owners change; workflow static checks and actual CI are necessary
for workflow placement. Do not run every browser group locally for a YAML-only
count change: real CI owns hosted timing and full retained proof. If browser
support/specs change, follow `Distribution/tests/README.md`'s affected-group
gate. Before test edits, resolve MakeMe and browser page-object selection via
the installed skills and `.planning/open-dough.json`; no sleeps, `test.slow()`
or suite/hook timeout overrides. Full local runs follow admission/headroom rules.

macOS long local gate: start fully awake; on AC use `caffeinate -s -i` (`-s`
is honored only on AC). On battery, plug in or keep the lid open under
`caffeinate -i` and inspect the sleep log afterwards, as maintained in
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).

The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to every local/CI failure, base failure and repair handoff.
Use post-change refactoring and ordinary execution delivery per slice; preserve
another active execution's exact repair and identify its remaining gate.
Hosted failures on published variants remain owned through applicable final CI.
No rerun-until-green, skipped test, or weakened proof can make a candidate pass.

## Current decisions and concern evidence

No scope change or ADR exception. The supplied account limit of 20 was not
independently verified. Report observed load and visibility limits; smaller
layouts remain hypotheses for the probe and comparisons.

Execution resumed 2026-11-14 in the established owned worktree and branch
`codex/run-ci-on-as-few-jobs-as-its-wall-time-allows`, story-branch mode.
Origin/main and the execution branch both confirmed accepted Take
`d21aaf78c60ee03fb08f382397f2b6a4ea3270b1`; starting revision
`c4117d407650eb1e037d1b0082f103699825cd5b`. Publisher
`dashboard-territory.local-open-dough`, agent `aki-chan`. The default checkout
is `/Users/terryyin/git/open-dough`; no originating integration checkout was
supplied. No second start or claim. Locked `npm ci` succeeded in this checkout,
then the real three-share preview succeeded with all 644 checks. The tracked
pre-commit hook is check-only (staged lint, script-triggered typecheck);
`npm run format` selects changed/new paths. Replanning retains the plan's
existing authority; no numeric slice budget or exception was supplied.

Observer: GitHub Actions `terryyin/open-dough`, verified active `ci.yml` / `CI`
(351271804), execution-branch target. Coordinator `aki-chan-seed350`, checkout
as above; directory `/tmp/dough-ci-501/watch-fNDC3o`, PID 82547, yielded cell
`g188:9`, stream session 28375. The Take's trunk CI is unobserved by this
branch observer. Use the retained directory/coordinator for managed delivery.

Slice-plan refinement was not needed: the four proof loops separate attribution,
Distribution packing, whole-workflow packing and the maintained rule within one
allocation/proof model. No remaining planning concern was found; slice 1 bounds
state-changing measurement premises and stops dependent work if it fails.


## Story obligations

### G1. Complete candidate proof and matched comparisons
Reported: slice 1 — "B1 baseline acquisition passed; candidate exact hosted proof and repeated solo, mixed and equivalent two-run comparisons remain unobserved."
Story clause: "Use matched concurrent comparisons and repeated samples to distinguish layout effects from runner noise."
Disposition: return
