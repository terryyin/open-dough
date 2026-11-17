# Recovery proof covers historical case paths

**Identity:** SEED-393#recovery-proof-covers-historical-case-paths
**Source:** [Recovery proof covers historical case paths](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#recovery-proof-covers-historical-case-paths)

## Provenance and findings

This is an Intent Coverage finding on SEED-393#repeat-native-guidance-checks-on-real-story-examples,
checked at revision `4d50a0a39412906f6ce8fddd659d88ba1318dae0`. Verdict:
confirmed missing test path, bounded to the examined check.

- Fault: `native_comparison_basis_observe` in
  `Distribution/evaluation/src/native-comparison-basis.sh` lost its
  historical case-directory forms (`native-comparison/<case>/`,
  `cases/comparison/<case>/`).
- Independent witness:
  `Distribution/evaluation/src/native-guidance-check.sh --recover Distribution/evaluation/cases/guidance-checks/paused-supplier/comparisons/20261114T102744-1921.txt`.
  Under the fault it reported `recovery: fail` with "no case directory
  recorded".
- Examined check:
  `Distribution/evaluation/tests/native-guidance-checks/native-comparison-refresh.sh`.
  It passed under the fault, because its fixture records are saved only under
  `cases/guidance-checks/<case>/`.

## Preserved promises and constraints

Recovery of kept records still reaches their original inputs, and those
records stay byte-identical. Make no product change unless the new proof
exposes a defect. Keep the default timeouts.

## Slices

### 1. Recovery test covers a record saved under a historical path
Type: Behavior
Status: planned

Behavior: the maintained refresh and recovery test recovers a record whose
inputs were saved under a historical case-directory form. It asserts
`recovery: pass`, the historical `case-basis-directory` and an unchanged
report.

Proof: the test fails with the fault above applied and passes once it is
restored, run through `bash scripts/test.sh`.

## Verification and delivery

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Local gate: the changed test through `bash scripts/test.sh`, then
`npm run test:evaluation` under `caffeinate -s -i` on AC.
