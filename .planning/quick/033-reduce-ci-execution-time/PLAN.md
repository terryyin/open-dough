# Reduce Open Dough's CI execution time to less than half

## Source, authority, and outcome

[SEED-004 Story 21](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-test-optimization-and-plan-open-dough).
Execution is in progress: Slice 1 evidence has been accepted for delivery. The
maintainer authorized execution on 2026-09-15 and
requested an explicit process retrospective using the installed
`dough-test-optimization` skill.

Give Open Dough developers trustworthy CI feedback in strictly less than 50%
of the current execution time while preserving behavioral protection. Include
profiling, measured test optimization, ordinary local re-profiling, and CI
acceptance measurement. Exclude feedback-driven skill implementation, unrelated
CI infrastructure work, and other projects. A 10-minute baseline therefore
requires a result below 5 minutes; a local speedup with CI at 60% remains unmet.

## Existing solution and architectural context

Reuse `npm test` → `scripts/test.sh`, which runs discovered shell tests outside
`tests/support/` and then `scripts/check-self-installation.sh`. Reuse
`.github/workflows/ci.yml`: parallel `lint` and `test` jobs on Ubuntu 24.04,
Node 24, with dependency/setup costs included; `npm run lint` remains the lint
entry point. Test documentation is `tests/README.md`, and shared support is in
`tests/support/`. No evidence supports a new benchmark framework.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires inexpensive feedback, empirical adaptation, and cohesive reuse.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires deterministic CI protection, shared behavior checked once with
adapter-specific differences, and honest separation from native acceptance.
Preserve those responsibilities; reassess before changing runner, fixtures,
concurrency, or the established cross-tool solution.

## Execution identity and measurement contract

- Originating checkout: `/Users/terryyin/git/open-dough`, branch `main`; Taken
  claim commit `e61c329`.
- Execution checkout: `/Users/terryyin/git/open-dough-worktrees/033-reduce-ci-execution-time`,
  branch `codex/033-reduce-ci-execution-time`, created from `e61c329`.
- Integration target and authorized destination: `main` via `origin`; deliver
  the execution branch to `origin` before integration.
- CI observer: Codex cell `21`, session `91396`, PID `43121`, receipt directory
  `/tmp/dough-ci-501/watch-pX5OCG`, coordinator `root`, checkout and branch as
  above, repository `terryyin/open-dough`, workflow `ci.yml` / `CI`.

One human-owned choice remains open: CI elapsed time from execution start until
all required checks complete, excluding queue time (recommended), versus total
runner time across jobs. Select the metric and repeat/aggregation procedure
before claiming a CI baseline or ratio; this does not block local work.

Local comparisons use literal `/usr/bin/time -p npm test` in ordinary runner
mode after runtime setup. Record revision, runtime, filters/workers, cache and
fixture conditions, wall time, and an honestly labelled count. CI comparisons
use successful, comparable baseline/final runs and record URL, commit,
workflow/event, job times, setup/cache, metric, and aggregation. Never equate
shell invocations with behavioral cases or cherry-pick successful pairs; failed
or incomplete runs are diagnostics.

### Slice 1 evidence

- Baseline: on 2026-09-15, revision
  `e61c329a0ac9e59ae7ccd9b122edc8858582d27a`, `/usr/bin/time -p npm test`
  passed with `real 622.86`, `user 313.53`, `sys 231.32`. Environment: macOS
  26.6.2 arm64, Node 24.5.0, npm 11.5.1; dependencies were installed once with
  `npm ci` outside the timing; checkout/npm cache were warm and each `mktemp`
  fixture fresh; no filters or workers; `scripts/test.sh` ran sequentially.
- Count: 49 files selected by
  `find tests -type f -name '*.sh' ! -path 'tests/support/*'`, plus self-install,
  equals 50 shell-script invocations, not behavioral cases. The scripts use
  mixed/nested assertions (`tests/execution-ci-runtime.sh` alone reported 65
  Node cases), so no trustworthy suite-wide behavioral-case count exists.
- Update duplication: `tests/update-when-needed.sh` exactly executes the
  independently selected `tests/install-all-tools.sh`. The alias timing
  `/usr/bin/time -p bash tests/update-when-needed.sh` passed in 40.48 seconds
  (`user 21.71`, `sys 14.97`); the target passed separately in 37.63 seconds
  (`user 20.77`, `sys 13.35`).
- Native-wrapper duplication: `tests/native-case-selection.sh` lines 39-149
  own selection assertions; lines 151-156 rerun four wrappers independently
  selected by the ordinary runner. `/usr/bin/time -p bash
  tests/native-case-selection.sh` passed in 20.63 seconds (`user 10.13`,
  `sys 8.51`); direct context/Codex/Cursor/Claude wrapper timings were 12.61,
  3.53, 3.56, and 3.48 seconds.
- Interpretation: these exact repeats nominally cost about 61 seconds, under
  10% of baseline, so they cannot meet the target alone. Re-profile after their
  removal before choosing a larger strategy. Twenty-three top-level scripts
  source `tests/helpers/release-fixture.bash`; this is an investigation lead,
  not proof that isolated scenarios or ADR 0005 platform responsibilities are
  redundant. No raw profile artifact was retained.
- CI candidate only: successful main-push run
  `https://github.com/terryyin/open-dough/actions/runs/34917070078` at revision
  `7bb6a0fad86d799179c0c93655cd5805964d71ee` (parent of the Taken-only claim)
  used Ubuntu 24.04, Node 24, npm caching, `npm ci`, and parallel lint/test jobs.
  No duration is selected because the metric and aggregation remain unresolved.

## Ordered slices

### 1. A developer can identify the measured cost worth removing

Type: Behavior
Status: done

Behavior: Given the unchanged suite, profiling produces a comparable local
baseline, an available matching-condition CI candidate with metric-dependent
proof pending, and an evidenced first optimization family. Proof is the Slice 1
evidence above; no speedup is claimed.

Safe stopping point: product behavior is unchanged, the local baseline is
usable, and two exact-repeat experiments are executable. Missing CI metric
ownership leaves only CI proof pending. Sizing: one diagnostic loop; the baseline
took 622.86 seconds, and profiling stopped once useful experiments were found.

### 2. Developers do not run the superseded update journey twice

Type: Behavior
Status: done

Behavior: The ordinary runner selects the all-tool installer/update journey
once, preserving old-record upgrade, missing-sibling restoration, conflict,
force-repair, and no-op behavior.

- Hypothesis/saving: the alias adds no behavior beyond `exec bash
  tests/install-all-tools.sh`; removing it avoids a nominal 40.48 seconds.
- Change/consumers: remove `tests/update-when-needed.sh` and obsolete support,
  retaining the canonical target selected by `scripts/test.sh` and available to
  developers by its canonical filename.
- Surviving proof: before removal establish the target with literal
  `/usr/bin/time -p bash tests/install-all-tools.sh`; compare focused cost, then
  run the mapped ordinary suite.
- Decision/stopping point: retain only if canonical proof passes and timing
  supports duplicate removal; otherwise undo this experiment and record its
  distinct responsibility. End with one passing canonical journey and no
  installer/updater product change.

Outcome: removed only `tests/update-when-needed.sh`. The canonical journey
passed before and after deletion in 37.10 and 36.80 seconds; its accepted
assertions and `scripts/test.sh` discovery boundary are unchanged. Expected
ordinary invocation count is now 49; Slice 4 owns whole-suite measurement.

### 3. Native case selection does not repeat default wrapper journeys

Type: Behavior
Status: planned

Behavior: Native case inventory and invalid selections remain off the native
path without the selection test rerunning four default wrapper journeys.

- Hypothesis/saving: remove only `tests/native-case-selection.sh` lines 151-156;
  the whole script cost 20.63 seconds and its separately timed nested wrappers
  totalled 23.18 seconds in another run.
- Change/consumers: keep lines 39-149 sentinel assertions and the independently
  selected context, Codex, Cursor, and Claude wrapper files.
- Surviving proof: run `/usr/bin/time -p bash tests/native-case-selection.sh`,
  `bash tests/dough-adr-awareness-context.sh`,
  `bash tests/dough-adr-awareness-codex-delivery-to-use.sh`,
  `bash tests/dough-adr-awareness-cursor-delivery-to-use.sh`, and
  `bash tests/dough-adr-awareness-claude-delivery-to-use.sh`.
- Decision/stopping point: retain only if selection behavior and all wrappers
  pass and focused time improves; otherwise undo only this experiment. End with
  both responsibilities independently observable, without the nested lifecycle.

### 4. Developers can select the next material cost after exact duplicates are gone

Type: Behavior
Status: planned; depends on Slices 2 and 3

Behavior: After the two retained optimizations, a comparable ordinary local
re-profile reports wall time and invocation count, then profiles the remaining
installer/update family only far enough to replace this slice in place with the
next smallest evidence-backed experiments.

Proof: run literal `/usr/bin/time -p npm test` under baseline conditions and
compare with 622.86 seconds. Record surviving behavior, removed support, rejected
experiments, and remaining gap; map each next family to its consumers, removable
cost, surviving proof, literal focused command, smallest change, and safe stop.
Do not infer redundancy from 23 fixture consumers or weaken ADR 0005 proof.

Decision: if the ordinary run does not improve, revisit the duplicate-cost
hypothesis before delivery. If it improves but remains at or above 311.43
seconds, replace this slice with a larger measured strategy without claiming
completion. Stop for human judgment before fixture sharing, platform-proof
removal, or concurrency with unproved isolation or architectural tradeoffs.

Safe stopping point: both independent improvements are delivered with a fresh
profile and executable next experiment, or an unsupported experiment is undone
without disturbing the other.

Every experiment follows hypothesize → measure → retain/revise/undo → reassess.
Establish replacement proof first; use no skips, focus markers, weakened
assertions, or retry masking. Refine this plan in place for multiple proof loops
or uncertain boundaries. Final comparable CI acceptance remains required once
the local strategy plausibly reaches the target.

## Proof ownership and lifecycle

| Promise | Owner and observable evidence |
| --- | --- |
| Comparable local baseline | Slice 1: revision/conditions, literal command, 622.86 seconds, and honest script count |
| Comparable CI baseline | Later metric-dependent slice after human metric/aggregation selection; discovered run is only a candidate |
| Preserve behavioral confidence | Slices 2-3: canonical all-tool journey, selection assertions, and independently selected wrappers |
| Improve ordinary local wall time | Slice 4: comparable full `npm test` re-profile after both experiments |
| CI time strictly below half | Later final slice: comparable CI result and ratio under the preselected procedure |
| Learn from real skill use | Automatic execution retrospective, including process review |

Preserve these mappings during refinement. Use focused proof per change and
widen for shared consumers; normal refactor, format, commit, push, and CI gates
still apply. Keep the plan/evidence through retrospective and story wrap-up; do
not create a profiling plan, feedback tracker, or evidence archive.

At retrospective, assess family selection, proof preservation, experiment
quality, target reassessment, local-versus-CI measurement, and in-place plan
updates. Retain actual decisions, rejected experiments, outcomes, and material
friction as inputs. Record supported findings through `DearDough.md`, or report
none; skill changes remain follow-up work. Preserve these inputs if execution
stops before review.

## Current decisions and learnings

- The baseline is 622.86 seconds for 50 shell invocations at `e61c329`; no
  speedup is claimed.
- CI metric and aggregation are open; run 34917070078 is only a candidate.
- The first two experiments nominally save about 61 seconds, so comparable
  re-profiling and a larger evidence-backed strategy remain necessary.
- The update alias experiment retained its canonical proof and removed one
  measured 40.48-second duplicate invocation.
- Twenty-three release-fixture consumers are an investigation lead, not
  consolidation evidence.
- Process review of the optimization skill is explicitly required.
