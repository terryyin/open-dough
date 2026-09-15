# Reduce Open Dough's CI execution time to less than half

## Source, authority, and outcome

[SEED-004 Story 21](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-test-optimization-and-plan-open-dough).
Execution is in progress under the maintainer's 2026-09-15 authorization, with an explicit retrospective using the installed `dough-test-optimization` skill.

Give Open Dough developers trustworthy CI feedback in strictly less than 50% of current execution time while preserving behavioral protection. Include profiling, measured test optimization, ordinary local re-profiling, and CI acceptance measurement. Exclude feedback-driven skill implementation, unrelated CI infrastructure, and other projects. A 10-minute baseline requires below 5 minutes; local improvement with CI at 60% remains unmet.

## Existing solution and architectural context

Reuse `npm test` -> `scripts/test.sh`, which runs discovered shell tests outside `tests/support/` and then `scripts/check-self-installation.sh`. Reuse `.github/workflows/ci.yml`: parallel `lint` and `test` jobs on Ubuntu 24.04 and Node 24, including dependency/setup costs; `npm run lint` remains the lint entry point. Test documentation is `tests/README.md`, shared support is in `tests/support/`, and no evidence supports a new benchmark framework.

[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires inexpensive feedback, empirical adaptation, and cohesive reuse.
[ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires deterministic CI protection, shared behavior checked once with
adapter differences per tool, and honest separation from native acceptance.
Preserve those responsibilities; reassess before changing the runner, fixtures,
concurrency, or established cross-tool solution.

## Execution identity and measurement contract

- Originating checkout: `/Users/terryyin/git/open-dough`, branch `main`; Taken
  claim commit `e61c329`.
- Execution checkout: `/Users/terryyin/git/open-dough-worktrees/033-reduce-ci-execution-time`,
  branch `codex/033-reduce-ci-execution-time`, created from `e61c329`.
- Integration target and authorized destination: `main` via `origin`; deliver
  the execution branch to `origin` before integration.
- CI observer stopped after Slice 5 profiling when Git became unavailable: Codex cell `21`, session `91396`, former PID `43121` now absent, receipt directory `/tmp/dough-ci-501/watch-pX5OCG`, coordinator `root`, checkout/branch above, repository `terryyin/open-dough`, workflow `ci.yml` / `CI`, terminal state `stopped`, no unread events, and `pendingCi: unobserved`.
- Runtime restored: Apple Git 2.50.1 with `xcode-select` at `/Library/Developer/CommandLineTools`.
- Active CI observer: Codex cell `55`, session `45708`, PID `31323`, receipt directory `/tmp/dough-ci-501/watch-vaTHR9`; coordinator/repository/branch/workflow remain as above.

One human-owned choice remains open: CI elapsed time from execution start until all required checks complete, excluding queue time (recommended), versus total runner time across jobs. Select the metric and repeat/aggregation procedure before claiming a CI baseline or ratio; local work is not blocked.

Local comparisons use literal `/usr/bin/time -p npm test` after runtime setup in
ordinary runner mode. Record revision, runtime, filters/workers, cache/fixture
conditions, wall time, and an honestly labelled count. CI comparisons use
successful comparable baseline/final runs and record URL, commit, workflow/event,
job times, setup/cache, metric, and aggregation. Shell invocations are not
behavioral cases; failed/incomplete runs are diagnostics, and pairs are not
cherry-picked.

## Accepted evidence and learnings

- Baseline: on 2026-09-15 at `e61c329a0ac9e59ae7ccd9b122edc8858582d27a`,
  `/usr/bin/time -p npm test` passed: `real 622.86`, `user 313.53`, `sys
  231.32`. Setup was macOS 26.6.2 arm64, Node 24.5.0/npm 11.5.1, `npm ci`
  before timing, warm checkout/npm cache, fresh per-test `mktemp` fixtures, and
  sequential `scripts/test.sh` with no filters/workers. Its discovery selected
  49 test scripts plus self-installation: 50 shell invocations, not behavioral
  cases. Mixed/nested assertions prevent a trustworthy suite-wide case count.
- Slice 1 found two exact repeats. `tests/update-when-needed.sh` merely executed independently selected `tests/install-all-tools.sh`; they passed in 40.48 and 37.63 seconds. `tests/native-case-selection.sh` passed in 20.63 seconds; lines 151-156 reran four independently selected wrappers timed at 12.61, 3.53, 3.56, and 3.48 seconds. Their roughly 61-second nominal cost could not meet the target alone. No raw profile artifact was retained.
- Slice 2 removed only `tests/update-when-needed.sh`. The canonical
  `/usr/bin/time -p bash tests/install-all-tools.sh` journey passed before/after
  in 37.10/36.80 seconds; its installer/update assertions and `scripts/test.sh`
  discovery boundary remained unchanged. Expected ordinary count became 49
  invocations.
- Slice 3 removed only the four nested wrapper calls and aligned
  `tests/README.md`. `/usr/bin/time -p bash tests/native-case-selection.sh`
  retained lines 39-149 and passed in 1.49 versus 20.63 seconds. Literal `bash`
  commands for `tests/dough-adr-awareness-context.sh`,
  `tests/dough-adr-awareness-codex-delivery-to-use.sh`,
  `tests/dough-adr-awareness-cursor-delivery-to-use.sh`, and
  `tests/dough-adr-awareness-claude-delivery-to-use.sh` all passed with their
  wrapper boundaries unchanged.
- Comparable re-profile after Slices 2-3: at
  `a92f7ed06202630487f5a5b2d6c4aaa554a0e5ac`, literal `/usr/bin/time -p npm
  test` passed: `real 552.78`, `user 280.25`, `sys 201.72`, with the baseline
  setup above and 48 discovered tests plus self-installation (49 invocations).
  This is 70.08 seconds/11.25% faster, but 241.35 seconds above the required
  less-than-311.43 local threshold.
- Comparable re-profile after Slice 4: at `ef9541f6feb96b858d70bffda95f0a5df5cb9caa`, literal `/usr/bin/time -p npm test` passed: `real 541.08`, `user 264.82`, `sys 201.16`, under baseline setup with 48 discovered tests plus self-installation (49 invocations). It is 11.70 seconds/2.12% faster than the post-Slices-2-3 run and 81.78 seconds/13.13% faster than baseline, but 229.65 seconds above the less-than-311.43 threshold. Slice 4's changed test passed; its smaller whole-suite delta than the 52.55-second focused reduction limits attribution to the measured terminal result without invalidating focused proof.
- `tests/story-payload-update.sh` passed under `/usr/bin/time -p bash` in 87.37
  seconds (`user 44.78`, `sys 35.52`). Every Codex/Cursor/Claude entry hint
  proves successful upgrade, unmanaged collision refusal, two-root payload/link
  integrity, and sentinel preservation; each also repeats the same three-reference
  x edit/remove damage matrix against the Claude physical root.
- `src/install/open-dough-platform.sh` identifies the platform as an invoking-tool
  hint. It, `install.sh`, and `src/install/open-dough-release-apply.sh` show every
  successful operation/update traverses the same two unique physical destinations.
  ADR 0005 therefore supports one shared damage matrix while retaining all
  adapter-specific success paths.
- Disposable `/tmp/open-dough-story-payload.p0HKuK/story-payload-update.sh` kept
  all three entry hints' success/collision/link/sentinel paths but ran the full
  three-reference x edit/remove matrix only for Cursor. Literal `/usr/bin/time
  -p bash /tmp/open-dough-story-payload.p0HKuK/story-payload-update.sh` passed
  in 39.15 seconds (`user 19.56`, `sys 16.02`), a plausible 48.22-second saving,
  not a tracked-suite saving. Raw experimental material remains outside Git.
- Twenty-three release-fixture consumers remain an investigation lead, not consolidation evidence. Process review of the optimization skill remains required.
- The three adapter-specific public-payload checks are structurally similar, but fresh literal `/usr/bin/time -p bash` runs passed in 0.92 seconds for Codex, 0.89 for Cursor, and 0.93 for Claude Code. Their 2.74-second aggregate cost is immaterial against the remaining gap, so no proof consolidation is planned there.
- `tests/install-all-tools.sh` remains a stronger bounded candidate with its
  accepted 36.80-second focused baseline. Its entry loop gives Codex, Cursor,
  and Claude fresh-install proof, then repeats missing-registration repair and
  final no-op checks for each. `open-dough-platform.sh` establishes that the
  selected platform is only an invoking-tool hint and every success uses the
  same two physical roots. Codex and Cursor take the same missing-entry branch;
  Claude uniquely removes the whole Cursor settings file. ADR 0005 supports
  retaining every-entry fresh installation, one missing-entry repair, the
  distinct missing-file repair, and one shared final no-op while measuring
  whether the narrower lifecycle removes material cost. This is an experiment,
  not redundancy inferred from invocation or fixture counts.
- CI candidate only: successful main-push run
  `https://github.com/terryyin/open-dough/actions/runs/34917070078` at
  `7bb6a0fad86d799179c0c93655cd5805964d71ee` used Ubuntu 24.04, Node 24,
  npm caching, `npm ci`, and parallel lint/test jobs. No duration is selected
  while the metric/aggregation choice remains open.

## Ordered slices

### 1. A developer can identify the measured cost worth removing

Type: Behavior
Status: done

Behavior: Profiling of the unchanged suite produced the comparable baseline, matching-condition CI candidate with metric-dependent proof pending, and two evidenced exact-repeat experiments. Product behavior stayed unchanged; the 622.86-second diagnostic loop stopped once useful experiments were found.

### 2. Developers do not run the superseded update journey twice

Type: Behavior
Status: done

Behavior: The ordinary runner selects the all-tool installer/update journey
once, preserving old-record upgrade, missing-sibling restoration, conflict,
force-repair, and no-op behavior. Outcome and accepted proof are recorded above.

### 3. Native case selection does not repeat default wrapper journeys

Type: Behavior
Status: done

Behavior: Native case inventory and invalid selections remain off the native path without the selection test rerunning four default wrapper journeys. Outcome and accepted proof are recorded above.

### 4. Story payload protection does not repeat shared damage cases per entry hint

Type: Behavior
Status: done

Behavior: Codex, Cursor, and Claude entry hints each retain old-to-new payload
upgrade, unmanaged-collision refusal, two-root payload/relative-link integrity,
and unrelated-file preservation. One representative entry runs the complete
shared physical-root matrix: each decomposition/refinement reference's edit and
removal, ordinary-update and repeat-install refusal, unchanged targets, and
explicit-force repair.

- Hypothesis: reduce `tests/story-payload-update.sh` from 87.37 toward the
  disposable 39.15 seconds by removing 36 repeated installer/updater operations.
- Change: keep the three-entry outer loop and every success/collision/link/sentinel
  assertion. Move or condition only the three-reference x edit/remove matrix so
  one entry owns it, and align the final test description. Do not change product,
  helper, or fixture sharing.
- Consumers/proof: the installer and release updater share managed-payload
  validation across `.agents/skills` and `.claude/skills`. Every-entry success
  retains ADR 0005 adapter proof; the representative matrix retains every
  reference, damage class, refusal entrypoint, immutability check, and force
  restoration. `tests/install-all-tools.sh` remains corroborating entry-context
  integration proof, not grounds to remove this test's upgrade assertions.
- Command/decision: run literal `/usr/bin/time -p bash
  tests/story-payload-update.sh`. Retain only if all promised observations pass
  with material reduction comparable to 39.15 seconds; otherwise revise/undo
  this experiment while preserving Slices 2-3. Stop before losing any success
  path, reference, damage class, refusal, immutability, force-repair, or assertion
  without an established surviving owner.

Outcome: the complete shared matrix now runs once through the Cursor hint while
all three success paths remain. Focused proof passed in 34.82 seconds versus
87.37 seconds, a 52.55-second (60.2%) reduction with observations unchanged.

### 5. Repeated installation lifecycle proof runs only where behavior differs

Type: Behavior
Status: done

Behavior: `tests/install-all-tools.sh` still proves that Codex, Cursor, and Claude
entry hints each perform a fresh complete two-root installation with both host
registrations and no Git commit. The shared repeat lifecycle runs only for
distinct observations: one Codex/Cursor missing-entry repair, Claude's missing
settings-file repair, and one repaired-install final no-op. All later conflict,
force, unsafe-topology, and old-root update scenarios remain unchanged.

- Hypothesis: the accepted 36.80-second focused baseline includes nine successful
  `install.sh` operations in the three-entry fresh/repair/no-op loop. Preserve
  every-entry fresh install, use Cursor as the representative shared-root
  missing-entry repair and final no-op, and retain Claude's distinct missing-file
  repair. Removing only Codex's equivalent repair/no-op and Claude's generic
  final no-op should produce a material focused reduction without weakening an
  adapter difference or installation outcome.
- Change: reorganize only that entry loop's repair/no-op observations. Do not
  change production installers, fixtures, shared mutable state, the runner, or
  any scenario after the loop. Keep targets isolated and fresh.
- Consumers/proof: each platform hint retains complete-payload, two-root, hook,
  sentinel, and no-commit proof. Cursor owns missing managed-entry restoration,
  payload-byte/mtime preservation, and the final full no-op; Claude owns missing
  settings-file restoration and payload-byte/mtime preservation. The selected
  platform's hint-only semantics and common two-root operation are established by
  `src/install/open-dough-platform.sh`; ADR 0005 requires the adapter observations
  above, not three repetitions of shared lifecycle behavior.
- Command/decision: first reuse the unaffected 36.80-second baseline, then run
  literal `/usr/bin/time -p bash tests/install-all-tools.sh`. Retain only if every
  promised observation passes and the focused wall time improves materially;
  otherwise revise or undo only this experiment. Record exact operations removed,
  surviving proof, terminal timing, and whether the result changes the credible
  strategy for the 229.65-second remaining local gap.

Outcome: every fresh entry path and distinct repair remains; Cursor owns the
shared final no-op. Focused proof passed after refactoring in 29.79 seconds
versus 36.80, a 7.01-second (19.0%) retained reduction.

### 6. Developers can reassess the remaining installer/update cost

Type: Behavior
Status: planned; depends on Slice 5

Behavior: A comparable ordinary re-profile reports wall time and honest shell-invocation count after retained Slice 5 work, then reassesses the remaining installer/update family only far enough to select the next evidence-backed experiment or establish that authorized savings cannot plausibly close the gap.

Proof: run literal `/usr/bin/time -p npm test` under baseline conditions and compare with 622.86, 552.78, and 541.08 seconds. Record surviving behavior, removed support, rejected experiments, remaining gap, and any next family's consumers, removable cost, surviving proof, literal command, smallest change, decision, and safe stop. If the suite does not improve, revisit Slice 5 before delivery. If still at or above 311.43 seconds, replace this slice without claiming completion. If no credible authorized saving closes the gap, stop for human judgment. Do not infer redundancy from fixture counts or authorize fixture sharing, platform-proof removal, concurrency, runner changes, or confidence/architecture tradeoffs.

Every experiment follows hypothesize -> measure -> retain/revise/undo -> reassess.
Establish replacement proof first; use no skips, focus markers, weakened
assertions, or retry masking. Refine this plan in place for multiple loops or
uncertain boundaries. Final comparable CI acceptance remains required once the
local strategy plausibly reaches the target.

## Proof ownership and lifecycle

| Promise | Owner and observable evidence |
| --- | --- |
| Comparable local baseline | Slice 1: recorded revision/setup, `scripts/test.sh` discovery, literal command, 622.86 seconds, honest count |
| Comparable CI baseline | Later metric-dependent slice after human metric/aggregation selection; discovered run remains a candidate |
| Preserve confidence | Slices 2-3 accepted boundaries above; Slice 4 owns every-entry upgrade plus one complete shared damage matrix |
| Improve ordinary wall time | Accepted 552.78-second re-profile after Slices 2-3 and 541.08-second re-profile after Slice 4; Slice 6 owns the next comparable `npm test` run |
| CI time strictly below half | Later final slice: comparable CI result and ratio under the selected procedure |
| Learn from real skill use | Automatic retrospective, including requested optimization-process review |

Use focused proof per change and widen for shared consumers. Preserve this plan,
evidence, identity, and observer through retrospective and story wrap-up; do not
create a profiling plan, feedback tracker, or evidence archive.

At retrospective, assess family selection, proof preservation, experiment
quality, target reassessment, local-versus-CI measurement, in-place plan updates,
actual/rejected decisions, outcomes, and material friction. Record supported
findings through `DearDough.md`, or report none; skill changes are follow-up work.
