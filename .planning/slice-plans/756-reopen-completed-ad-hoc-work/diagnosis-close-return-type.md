# Diagnose the close result's type in the published-session journey

- Revision `7a8697b8ab8b7560a601b27af608dff08b695c12`, GitHub Actions
  [run 45138365896](https://github.com/terryyin/open-dough/actions/runs/45138365896),
  attempt 1, Lint and type-check step 11. The run reported unsafe member
  access at `e2e/sessions/recently-done-published-sessions.spec.ts:70`.
  While the lint job was terminal, other jobs were still running.
- Round 1. The new concurrent close settlement can be returned through the
  publisher's untyped extension data. Hypothesis: close contract inference
  carries that untyped value to the E2E consumer. Run a focused lint
  reproduction once, inspect the source and declaration boundary, then
  validate one source correction with the same lint and affected proofs.
  The implementation check covered modified files and Dashboard types.
  This E2E consumer was outside that local check's scope.
- Slice 2's uncommitted changes are parked in the coordinator's CI repair
  stash. No slice 2 bytes enter the repair or its reproduction.
- Round 1 ended after 1.2 active minutes. One local targeted ESLint run
  reproduced the exact rule and line on the accepted revision. Returning
  the generic publisher result's extra `settlement` field widened the
  close result consumed by the E2E spec. Keep the typed settlement in
  the fetch callback's closure and retain the publisher's normal receipt
  for other outcomes. The same lint command passed with that correction.
- The one-worker E2E command exited 0 with its quiet reporter. Run it once
  with a proof-record path to verify that all three intended cases ran.
  The expected result is the same clean exit with named case evidence.
- The proof record confirmed three passing Chromium cases with no retries.
  The Distribution check passed all 37 cases from 11 specs, including both
  same-UUID close races and the wrap-up consumers. The repair's commands
  and case evidence are in `repair1-report.md` in this worktree's Git evidence
  directory.
- Failure handling follows the
  [shared policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- The repair stays within the publisher examined in `slice-1-refactor.md`
  and the same close-result consumer trace. It changes the local route of
  the value and adds no new public representation, helper or dependency.
- The completed attempt inventory has only the recorded lint failure.
  Publish one repair candidate. The unchanged E2E consumer type and the
  same CI lint job should pass with the repaired return.
