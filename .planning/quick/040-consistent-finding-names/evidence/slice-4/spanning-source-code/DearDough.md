# DearDough Process Findings

## DD-001 — Repeated context recovery obscured the execution boundary

The execution repeatedly reconstructed the same plan and commit boundary instead
of retaining one compact manifest for later review steps.

### Occurrences

- Execution: `Quick 034 / 7650585`
  - Tool: Codex
  - Model: gpt-5
  - Open Dough release: 0.3.4
  - Evidence: representative record `../records/repeated-recovery.md`, events R2, R4, and R6
  - Observed effect: the plan path and commit membership were rediscovered three times before findings could be assessed
  - Inference: retaining the reviewed manifest would likely avoid repeated recovery; no token count was available

- Execution: `Quick 040 / later-C`
  - Tool: Codex
  - Model: gpt-5
  - Open Dough release: 0.3.6
  - Evidence: representative record `../records/reintroduced-recovery.md`, events R2, R4, and R6
  - Observed effect: the plan path and commit membership were rediscovered three times before findings could be assessed
  - Inference: retaining the reviewed manifest would likely avoid repeated recovery; no token count was available
