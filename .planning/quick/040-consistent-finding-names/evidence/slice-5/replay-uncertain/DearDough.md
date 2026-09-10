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

## DD-003 — Transcript reread lost an observation location

The reviewer reopened a long transcript after losing one observation location.
The record does not show repeated plan or commit-boundary reconstruction, so a
shared cause with DD-001 is not established.

### Occurrences

- Execution: `record:quick-036-slice-2`
  - Tool: Cursor
  - Open Dough release: 0.3.4
  - Evidence: representative record `../records/similar-symptom.md`, events S1 through S3
  - Observed effect: the transcript was reopened once to recover an observation location
  - Inference: the cause and relationship to DD-001 remain uncertain
