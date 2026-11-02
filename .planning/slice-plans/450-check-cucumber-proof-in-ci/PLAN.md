# Check locally collected Cucumber proof against CI

**Identity:** SEED-192#check-cucumber-proof-in-ci
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#check-cucumber-proof-in-ci).

## Goal and scope

A Pygardon push's CI verdict says whether CI reproduces the committed local
Cucumber proof. Each applicable scenario or outline row passes in CI within
`5 ×` its proved `durationMs`. Every case CI did not check is named with its
reason. The story's comparison table and key examples 1–10 own the rules.
Open Dough publishes them in the
[Cucumber proof reference](../../../src/skills/dough-test-optimization/references/cucumber-proof.md),
and Pygardon implements them in its own CI recipe.

Material exclusions (deferred, not rejected): Intent display of corroboration;
Doughnut and other runners; implementation, step or configuration provenance
between a proof's commit and the checked revision; broader performance
policies; proof authenticity. Open Dough ships no comparison tool and changes
no dashboard or server code.

Assumptions: Pygardon is the evaluation project. Its CI is the self-hosted
controller running `scripts/check-prepared-checkout.sh` in its Linux ARM64
container (`docs/container-checks.md` in Pygardon), not a GitHub Actions job.

## Existing solutions and decisions

PFE:

- **Measurement.** Pygardon's `ci` profile already loads the proof plugin
  (`e2e_test/plugins/cucumberProof.mts`, `cucumberProofStore.mts`), so the CI
  run writes its own run file with the reference's identities and
  `durationMs`. Reuse that file as CI's side of the comparison instead of a
  second timer or report format. The CI checkout is disposable, so the
  plugin's cleanup there never touches committed proof.
- **Committed side.** Read committed proof from the checked revision's tree
  (`git ls-tree`/`git show <sha>:<path>`), never the working directory the CI
  run writes into. Apply the reference's existing reading rules (latest by
  `finishedAt`, successes only, one malformed file makes the location
  unreadable).
- **Selection.** Derive CI's selection from the CI configuration with
  Cucumber.js's own `loadConfiguration` + `loadSources` (profile `ci`, the
  recipe's tag expression). Map a pickle to its feature/scenario/example
  identity the way the plugin already does. Use the same source for
  "excluded by tag" (pickles of all sources minus selected) and for "no longer
  in source". Proof locations that CI's profile paths never cover are
  "location not run by CI".
- **Report and gate.** Run the comparison as a `run_check` stage right after
  `cucumber-js` in `check-prepared-checkout.sh`, so it gets an outcome, a
  duration and the existing failure handling. On success it prints only a few
  lines inside the 100-line successful-log budget
  (`docs/successful-ci-check-logs.md`).
- **Payload.** The reference is already in `install.sh` `managed_files` and
  linked from `dough-test-optimization/SKILL.md`; editing it changes no
  declaration. Payload declaration tests still run. Release and rollout use the
  internal `release-and-update-clients` skill, as the previous Cucumber proof
  story did.

Applicable Accepted decisions: [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(reuse the recorder and recipe), [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(release before client adoption), [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(rules written for the agent in the adopting project), [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(CI observations never become committed proof), [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
(record added CI time and log lines for Terry's evaluation). No conflict; no
new ADR or North Star topic.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Cucumber.js's API derives CI's selection without running scenarios | Comparison's "selected" and "excluded by tag" sets | 2026-11-02, Pygardon `a377b76b2`, Cucumber.js 13.2.1: scratch script outside the checkout ran `loadConfiguration({profiles:['ci'], provided:{tags:'not @wip and not @codec-gap and not @host-docker'}})` then `loadSources` | 139 pickles selected, 168 with no tag filter, 0 errors; items carry `uri`, `name`, `location`. Nothing was written to the checkout |
| Proof-only commits trigger ordinary CI | Example 10 | Pygardon `.github/workflows/ci.yml` ignores only `.planning/**`, `docs/**` | Settled: `e2e_test/proof` triggers CI |
| No retries configured | Retry handling needs no rule | Both `cucumber.js` configurations; committed proof | No `retry` key; every observation has `attempts: 1` |
| The plugin records in the CI container with timings that compare to local ones, and the report fits the log budget | Every CI-side comparison; the 100-line budget | Not observable without a Pygardon CI run (owner-held, outward-facing push) | **Open, bounded by slice 1's branch CI run**: a run with no CI observations, or a successful log over 100 lines, stops dependent slices and changes the plan |

## Outside-in proof

| Story example | Slice | Observable proof |
| --- | --- | --- |
| 1 Corroborated, 4 tag exclusion, 5 location not run, 10 proof-only commit | 1 | Real Pygardon CI run on a pushed Pygardon story branch: the comparison stage's log names the corroborated count, the `@codec-gap`/`@wip`/`@host-docker` groups and the packaged location |
| 1–9 per-case rules | 1 | Pygardon's own tests for the comparison, one per table row, including the exact `5 ×` boundary and a zero local duration |
| 2, 3, 6, 7, 8, 9 on the producer side | 2 | Recorded walk: scratch Cucumber.js project built only from the reference text, with committed proof and a CI-like command, shows each verdict |
| Real adoption | 3 | Pygardon lands its comparison against the released reference; its `main` CI passes with the comparison stage; Terry evaluates the log |

## Ordered slices

### 1. Pygardon's CI reports whether it reproduces committed proof
Type: Behavior
Status: planned
Proof: Pygardon's own test conventions for the comparison (one test per
comparison-table row, the `5 ×` boundary, zero local duration, malformed file);
then the real CI run of a pushed Pygardon story branch, which is this plan's
early probe. Record the corroborated, skipped and unchecked counts, the
highest CI/local ratio, the stage's duration and the successful log's line
count. Apply Open Dough's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
to both repositories.

Behavior: committed proof at a pushed revision → Pygardon CI's Cucumber stage
passes → the comparison stage reports the corroborated, skipped and unchecked
groups with reasons, and fails on a missing case, a `> 5 ×` case or a
malformed proof file.

In this preparation's Open Dough workspace, draft the rules as a "Check proof
in CI" section of the reference. In an owned Pygardon worktree, implement them
from the draft and add the stage after `cucumber-js` in
`check-prepared-checkout.sh`. Do not land in Pygardon yet.

Probe outcomes that stop dependent slices: CI recorded no observations; the
successful log exceeds 100 lines; or genuine `> 5 ×` cases fail on proof
just refreshed locally. The last is the gate working, but adoption would turn
Pygardon's CI red, so report the cases and ratios and stop for Terry.

### 2. The reference's CI rules work for a project that follows them
Type: Behavior
Status: planned
Proof: The [behavior review](../../../AGENTS.md#behavior-review) walk, recorded
in this plan. In the execution job's scratch directory, use a minimal
Cucumber.js 13 project with a recorder and comparison written only from the
reference text. Commit proof, then run a CI-like command against examples 2,
3, 6, 7, 8 and 9 and record each verdict. Correct the reference where the walk
or slice 1 disagrees with it. Run `bash scripts/test.sh` for
`tests/payload-declaration-links.sh` and `tests/compare-payload.sh`.

Behavior: an agent in a Cucumber.js project follows the reference → its CI
gives the comparison table's verdict for every case, without changing
committed proof or the run's existing output.

### 3. Pygardon lands the comparison from the released reference
Type: Behavior
Status: planned
Proof: Once Terry authorizes the release, `release-and-update-clients`
publishes it and updates every production-dashboard project. Then align the
Pygardon worktree with the installed reference, land in Pygardon, and observe
its `main` CI passing with the comparison stage. Record, for Terry's
evaluation (ADR 0010), the stage's added CI time, the log lines it adds, and
the report.

Behavior: a Pygardon developer pushes ordinary work with committed proof → the
CI verdict corroborates that proof or names each discrepancy and each
unchecked group.

## Current decisions

- The comparison runs only after a passing Cucumber stage. A failed or
  interrupted stage is CI's verdict, and no comparison follows.
- Terry decides the release in slice 3 and any `> 5 ×` stop in slice 1.

## Plan concerns

Slice-plan refinement was not needed: three Behavior slices each have one
proof loop, and slice 1 bounds the only open premise as an early probe. No
other slice-specific concern was identified in this review.
