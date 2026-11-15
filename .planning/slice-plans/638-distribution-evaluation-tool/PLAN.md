# Maintain native evaluations as a Distribution tool

**Source:** [selected story](../../seeds/SEED-371-distribution-evaluation-tool.md#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool)
**Identity:** SEED-371#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool

## Goal and scope

A maintainer finds and runs native acceptance and A/B evaluation tooling from
`Distribution/evaluation/`, and checks that tool independently with
`npm run test:evaluation`. Ordinary CI still proves both test sets under
Distribution Tests. Preserve the existing explicit native options, supported
hosts, isolation, outcomes, retention, replay and historical evidence.

The seed owns the six key examples. No new host, qualification, experiment,
performance claim, release, client-payload change or separate Intent entry is
included. No paid session is required or authorized by this preparation.
The queued [comparison corrections](../621-close-native-comparison-harness-gaps/PLAN.md)
keep their behavior and proof; this story only aligns their location references.

## Existing solution and direction

PFE: reuse the native families documented in
[`native-family-layers.md`](../../../Distribution/tests/native-harness/native-family-layers.md),
the one host-stream reader and replay corpus, supervision, identity and result
retention helpers, and the existing comparison entry, catalog, pair runner,
baseline archive and recovery implementation. Move their responsibilities;
add no parallel runner, host reader, case registry or scheduler.

Keep common execution, host adapters, observation, retention and comparison
orchestration in `evaluation/src/`. Keep reusable family scenarios, fixtures
and assessors in `evaluation/cases/`, with comparison cases together under
`cases/comparison/`. Test-only substitutes, counterexamples and replay inputs
belong with automated checks in `evaluation/tests/`. Classify by responsibility
and actual imports, not by a filename containing `native`. Shared repository,
installation and MakeMe builders remain one canonical implementation; reuse
their actual import closure rather than copying them into the tool.

[`scripts/test.sh`](../../../scripts/test.sh) remains the one scheduler.
Its named-path selection, alternate test root, reports, admission and split
allocator already serve the focused command. Extend default discovery to the
union of guidance and evaluation checks, with one deduplication/deal and the
existing Distribution CI producer and proof-fragment format.

[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) names the
evaluation home and shared group after Terry's 2026-11-15 approval.
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
keeps maintenance outside the declared payload.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) keeps
deterministic checks distinct from native acceptance and paid comparisons.
No North Star topic is needed: the agreed layout and existing owners suffice.

## Proof ownership

| Final promise / key example | Owner and observable proof |
| --- | --- |
| Existing acceptance cases run from the tool home; example 3 | 1: migrated entry and real setup/observer/assessor/retention exercised with controlled hosts; replay, isolation, timeout and failure checks retain their verdicts. |
| Same comparison selection, outcomes and limits; example 4 | 2: catalog filters, substitute pairs, refusal and incomplete-run checks through the new comparison entry. |
| Earlier evidence remains recoverable; example 5 | 2: both original `20261114T045440-*.txt` records recover basis `9c20a8086fe48e2bd60f283f478607440a057216`; recovery prints original bytes. Frozen-baseline checks reassess after raw cleanup without changing archive integrity. |
| Focused checks and explicit native invocation; examples 1, 3 | 3: focused command runs only evaluation checks; disabled assessor fails it; a real-host launch tripwire is untouched. Controlled host substitutes stay allowed. |
| Combined Intent/CI proof, once per check; example 2 | 3: combined discovery equals the union of both roots across all shares; actual shell/file and Node-case outcomes from both roots reach the single Distribution proof summary. |
| Installed guidance and unrelated content unchanged; example 6 | 1–3: declared-payload enumeration and installed-byte checks remain green, including install-omits-internal and payload-declaration-links; final diff contains no installed-guidance or payload-declaration changes. |
| Callers, discovery and maintained instructions use the new home | Each moving slice: consumer trace and relevant consumers; 3: README commands and final stale-live-path search. Historical evidence keeps its paths. |

## Decisive premises and preparation evidence

Observed on 2026-11-15 in this owned workspace at
`efdaec1e62f63be66d7cf6548aa37343742eed15`, Node 24.21.0 and Bash 5.3.20,
with `/opt/homebrew/bin` first on PATH. All scratch files and edits were
removed before recording this plan. The native evaluation paths are unchanged
on fetched `ef93db6ca2a40d4a5729bc3cb0e73072b3904f74`.

| Consuming operation | Form observed and result | Remainder |
| --- | --- | --- |
| Acceptance assessment at a relocated path | Copied `native-journey-state.sh` and its ADR assessor into `evaluation/src/`, with its existing check in `evaluation/tests/native-harness/`; `OPEN_DOUGH_TEST_DIR=Distribution/evaluation/tests bash scripts/test.sh` passed. Disabling the success assignment in the copied assessor made this same command exit 1 naming the failed expected observation; restoring it passed. | Migration must apply the same path/consumer treatment to every family; slice 1 owns their regression proof. |
| Relocated native context entry reaches supervision and retained failure evidence | Scratch context entry in `evaluation/cases/adr-awareness/` and native runtime in `evaluation/src/`; `bash scripts/test.sh Distribution/tests/native-harness/native-runner-failures.sh Distribution/tests/native-harness/native-run-timeout.sh` passed through the rewired consumers. It observed missing/nonzero/denied controlled hosts, immutable prior results, timeout, owned-process cleanup and no retry. Bulk-moving all support first failed on `repository-fixture.mjs`'s relative teardown import; leaving shared builders and their closure canonical resolved it. | Settled for this representative route; retain that ownership rule across the other families. |
| Comparison catalog from the new home | Copied the comparison entry and catalog into `evaluation/src/`, cases into `evaluation/cases/comparison/`, rewired catalog lookup. `bash Distribution/evaluation/src/native-comparison.sh` passed; the same entry with `--list --where hosts=codex --where workflow=blocked` selected paused-supplier and supplier-watch with their existing traits. | No host ran. Full comparison movement and evidence preservation belong to slice 2. |
| Recovery after moving hash-bound files; archive reassessment after raw cleanup | Baseline commands A and B below passed: refresh recovers each fixture record's committed basis after moving the harness and rejects edited/conflicting evidence; baselines reassesses after raw cleanup and compares the unchanged hash. Also ran `bash Distribution/tests/native-comparison/native-comparison.sh --recover` separately on `paused-supplier/comparisons/20261114T045440-40bf.txt` and `doughnut-title-precedence/comparisons/20261114T045440-26b0.txt` under `Distribution/tests/native-comparison/`: both exited 0, unchanged since `060c09c9`, basis `9c20a8086fe48e2bd60f283f478607440a057216`, recovery pass. | New paths must preserve these observations; no claim of baseline applicability merely from a successful reassessment. |
| Focused and combined discovery using the existing scheduler | Scratch discovery union added `evaluation/tests` to `scripts/test-jobs.sh` and its Node manifest. `OPEN_DOUGH_TEST_DIR=Distribution/tests bash scripts/test-jobs.sh`, then the same command with `OPEN_DOUGH_TEST_SPLIT=1/3`, `2/3`, `3/3`, listed one relocated real shell check and `native-codex-session.test.mjs` each exactly once. The focused-root command ran both successfully. | Slice 3 migrates the complete check set and preserves existing alternate-root behavior. |
| Evaluation-labelled outcomes under existing CI entry | Scratch `distribution-ci-proof.test.mjs` used `Distribution/evaluation/tests/native-harness/` labels for its shell and Node fixture checks. `bash scripts/test.sh Distribution/tests/ci/distribution-ci-proof.test.mjs` passed: the real runner, fragment action and summary retained their expected pass/fail/other counts in entry `Distribution`. | Slice 3 extends this proof to mixed roots in one run. |
| Intent/convention membership at the new paths | Scratch added evaluation shell and Node patterns to the existing Distribution sources. `node .agents/skills/dough-execute-plan/scripts/test-entry-rules.mjs --project . --source Distribution/evaluation/tests/native-harness/native-journey-state.sh --source Distribution/evaluation/tests/native-harness/native-codex-session.test.mjs` returned MakeMe true and pageObjects false for both. | Actual source declarations and all authored/moved test paths are checked in slice 3. |
| Installation remains payload-declared | Command A passed the real three-platform installation enumeration and byte comparisons in `install-omits-internal.sh`; the installer selects declared managed files, not a walk of Distribution. | Repeat against the final tree, where evaluation files actually exist. |

Both baseline commands used `OPEN_DOUGH_TEST_JOBS=2`; A also used
`caffeinate -s -i` on AC power. They exited 0:

```sh
# A
npm test -- Distribution/tests/native-comparison/native-comparison-refresh.sh \
  Distribution/tests/native-harness/native-journey-state.sh \
  Distribution/tests/native-harness/native-stream-replay.sh \
  Distribution/tests/native-harness/native-evidence-identity.sh \
  Distribution/tests/native-comparison/native-comparison-incomplete.sh \
  Distribution/tests/installation/install-omits-internal.sh \
  Distribution/tests/test-runner/test-runner-selection.sh
# B
npm test -- Distribution/tests/ci/distribution-ci-proof.test.mjs \
  Distribution/tests/test-runner/test-runner-split.sh \
  Distribution/tests/native-comparison/native-comparison-baselines.sh
```

## Ordered slices

### 1. Run acceptance cases from the evaluation home
Type: Behavior
Status: planned
Proof: existing native-family substitute journeys, replay and lifecycle checks
through their migrated implementation; installation checks remain green.

Behavior: an existing acceptance case and explicit host selection → invoke its
documented evaluation entry → the same isolated setup, observation, assessment,
retention and terminal cleanup, with the same supported options and verdicts.

Move shared native runtime and reusable acceptance-family material by their
existing seams. Separate test-only branches from native entries as needed,
keeping default automated checks credential-free. Rewire comparison callers
of moved shared helpers in the same slice so they still work from their
temporary old location. Update native-stream and assessor guards to cover the
new owners; retain the raw replay corpus and its observed signals.

Run affected family consumers, including native stream replay, evidence
identity, runner failures, timeout/watchdog cleanup, workspace isolation,
git-publication substitutes and updated-use adapters. Keep source-relative
resolution, fixture-copy/import closure and identity file lists complete.
Add the README's layout and acceptance commands. Align the 290-line
`Distribution/tests/git-publication/native-publication.md`: separate its
acceptance-running instructions from proof-scheduling scenario/evidence
guidance, link the two maintained topics and keep each under 250 lines.

### 2. Run comparisons and recover their earlier evidence
Type: Behavior
Status: planned
Proof: comparison catalog, case, pair, refusal/incomplete, refresh/recovery and
frozen-baseline checks at the new entry; unchanged tracked evidence bytes.

Behavior: a maintainer selects an existing comparison or retained record →
invoke the new comparison entry → the same selection and quality-first result,
or the original recovered record/baseline provenance without a native launch.

Move comparison orchestration into `src/`, reusable cases into
`cases/comparison/` and their automated self-check branches into checks.
Reuse slice 1's shared runtime. Update fixture source snapshots, Git-basis
input enumeration, imported setup closure and current-assessor lookup together.
Never mass-rewrite task/basis inputs, archived observations, retained streams,
recorded hashes or historical paths. New runs name their new committed basis;
old archives retain theirs, with derived reassessment separate from capture.

Run every credential-free comparison check, especially refresh, baselines,
pairs, inflight, incomplete, unavailable and baseline-reuse/refusal consumers.
Recover both original records and compare all moved tracked comparison records
and archives against their pre-move bytes. Update comparison guides and the
maintainer findings' live commands, preserving pinned historical GitHub links.
Align plan 621's live paths without implementing its corrections: its current
389 lines require moving provenance, original findings, PFE and dated premise
observations into a linked non-executable preparation-evidence reference.
Keep executable slices, constraints, proof ownership and decisions in its one
PLAN.md; preserve all evidence and keep both files under 250 lines.

### 3. Check the tool independently and retain combined CI proof
Type: Behavior
Status: planned
Proof: focused command, combined discovery/split checks, real CI fragments and
summary, Intent selection, host-launch tripwire, and final repository suite.

Behavior: run `npm run test:evaluation` → only evaluation-tool checks run;
run ordinary CI → guidance and evaluation checks each run once and report
under Distribution Tests, with neither route starting a real native session.

Move the tool's automated checks and test-only support into feature groups
under `evaluation/tests/`. Keep deterministic installed-guidance tests in
`Distribution/tests/`. Add the focused npm command using the existing runner's
alternate root; extend default discovery, Node manifests, aggregate exclusions
and duration labels coherently. Preserve named selections, outside-checkout
substitute roots, local admission, deadlines, silent-pass rules and reports.
Extend the existing Distribution Intent sources to the actual executable
evaluation checks; do not select runtime/case scripts as test Purpose.

Extend discovery and CI-proof journeys with both roots and failure cases,
proving counts, paths, exit status and one occurrence across all shares.
Complete the README with prerequisites, focused checks, explicit native entry
commands, comparison/recovery commands and evidence limits. Update feature
navigation and maintained callers. Old paths in immutable evidence remain.

## Execution gates and current decisions

- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written, including local/CI differences and failures predating this work.
- Before editing tests, apply AGENTS.md's MakeMe and applicable page-object
  selection. No browser behavior is changed by the plan. Use controlled hosts
  only at the external host boundary; exercise real setup, Git, readers,
  assessors, retention, discovery and proof reporting. No `test.slow()` or
  suite/file/group/hook timeout override.
- Generate the installed consumer trace from each actual movement diff,
  including indirect shell sources, generated fixture scripts, import closure,
  corpus guards, hash inputs and historical recovery. Dispose of every listed
  consumer through proof or an evidenced exclusion. Follow transitive callers
  regardless of whether their filenames contain `native`.
- Local gate: focused affected checks per slice; final `npm test` is warranted
  by the cross-family runtime, fixture and discovery migration. Run the CI
  share preview at the current split count (currently 3), preserving existing
  duration values under renamed labels. Run required lint/hooks; if moved
  JavaScript fixtures reach dashboard TypeScript consumers, run
  `npm run typecheck:dashboard` and affected consumers. Keep normal post-change
  refactoring and delivery gates.
- Every long local gate follows the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  fully awake on AC, `caffeinate -s -i`; on battery plug in, or keep the lid
  open under `caffeinate -i` and inspect sleep logs afterwards. Respect shared
  full-suite admission; choose concurrency from current host headroom.
- Recheck fetched trunk and overlapping work before execution. The silent
  supplier wait landed at `ef93db6c` without evaluation-harness changes;
  retain its installed behavior and findings. Plan 621's correction remains
  separate, with location-only alignment here. No blocking supplier agreement
  is needed merely because paths overlap.
- Each slice is one usable capability and proof loop, sized for 15 active
  minutes excluding commands. Use existing responsibility seams and mechanical
  path rewiring; if actual consumers require broader redesign, stop and resize
  rather than silently absorb the separate harness corrections.
- Cumulative design: one execution/observation/assessment implementation serves
  both acceptance and comparison; one scheduler serves focused and combined
  checks. Interim acceptance/comparison checks stay at their old test locations
  until slice 3, with imports updated in each moving slice; slice 3 removes
  that temporary layout. Every delivered boundary must pass CI.
- Slice-plan refinement was not needed: these three boundaries each provide a
  usable operation, share existing owners and keep their proof and cleanup
  together. Remaining slice-specific concerns identified in this review: none.

## Learnings

None beyond the result-bearing preparation observations above.
