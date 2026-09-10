# DearDough Process Findings

## DD-001 — Re-read the Trim names plan after every slice

The Trim names execution reopened `planning/plans/trim-names.md` after each
slice instead of retaining slice status in working memory.

### Occurrences

- Execution: `Trim names / wrap-up-fixture`
  - Evidence: `planning/plans/trim-names/evidence/cli-run.txt`
  - Observed effect: the completed plan path was reopened once per slice before
    the next slice started
  - Inference: retaining slice status would likely avoid the reread; no token
    count was available

## DD-002 — Keep the test runner on native Node

The Formal titles work expects native `node --test` without a wrapper. This
issue is unrelated to Trim names.

### Occurrences

- Execution: `Formal titles / baseline`
  - Evidence: `test/greet.test.mjs`
  - Observed effect: focused proof already uses native Node
  - Inference: keep that runner for later Formal titles work; broader benefit is
    not yet established
