# Preparation evidence

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
