# DearDough Process Findings

## DD-002 — Keep the test runner on native Node

The Formal titles work expects native `node --test` without a wrapper. This
issue is unrelated to Trim names.

### Occurrences

- Execution: `Formal titles / baseline`
  - Evidence: `test/greet.test.mjs`
  - Observed effect: focused proof already uses native Node
  - Inference: keep that runner for later Formal titles work; broader benefit is
    not yet established
