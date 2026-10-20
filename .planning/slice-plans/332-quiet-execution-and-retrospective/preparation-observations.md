# Preparation observations

Observed on 2026-10-20 in
`/Users/terryyin/git/open-dough/.worktrees/keep-retrospective-and-execution-completion-quie`
at `32ec068d98a43e1308d7578e97ef18475f423f18`. These are preparation observations,
not proof that the new response behavior is implemented.

1. **Mandatory success output is an instruction contract with active consumers.**
   Read `finish-or-stop.md`, retrospective `## Report`, shared completion
   attention and `ci-completion-wait.md` through their final response branches.
   The reviewed and skipped execution paths require `PLAN EXECUTION COMPLETE`,
   retrospective requires `EXECUTION RETROSPECTIVE COMPLETE`, and integrated
   success requires a revision recap. The focused command below passed:

   ```sh
   PATH="/opt/homebrew/bin:$PATH" npm test -- .seed145-observe.sh \
     src/skills/dough-land/scripts/completion-attention-guidance.test.mjs \
     src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs \
     src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs
   ```

   Its guidance suites assert those old output requirements and preserve the
   real plan-reader completion record. They locate contracts to change; they
   do not prove agent follow-through or the desired quiet behavior.
2. **Removing the success banner reaches and fails the existing native assessor.**
   The scratch `.seed145-observe.sh` sourced
   `tests/support/ci-completion-native-assess.sh` and
   `tests/support/ci-completion-native-counterexamples.sh`. For each of
   `pending`, `ready`, and `skip-retro`, it ran
   `ci_completion_write_observation "$scenario" "$dir/reported"` then
   `ci_completion_assess "$scenario" "$dir/reported"` (accepted). It applied
   `sed 's/^completion-marker: 1$/completion-marker: 0/'` to that observation
   and called the same assessor (rejected in all three cases).
   Every other observation stayed identical. This reaches the consuming
   operation and proves the obsolete marker dependency; the generated review/CI
   facts are fixture inputs, not observations of a live execution. The scratch
   file and temporary data were removed before seed/plan writes.
3. **Native agent behavior is not settled by static or substitute evidence.**
   The actual native route is
   `PATH="/opt/homebrew/bin:$PATH" bash tests/git-publication-native.sh --native
   <host> --case execution-review/<pending|ready|failure|skip-retro>`.
   Its fixture, observer and assessor were inspected; the existing assessor
   cannot judge quiet success until slice 2. Credentialed host execution is
   not a claimed preparation observation. The separately linked acceptance
   owns fresh behavior proof; implementation readiness depends on the observed
   instruction/consumer change, not a claim that old native proof already covers it.
