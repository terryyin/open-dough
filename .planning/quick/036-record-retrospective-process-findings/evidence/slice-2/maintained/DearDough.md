# DearDough Process Findings

Human note: keep the execution labels recognizable to maintainers.

## DD-001 — Repeated context recovery obscured the execution boundary

The execution repeatedly reconstructed the same plan and commit boundary instead
of retaining one compact manifest for later review steps.

Human note: this may matter most when a review spans several focus areas.

### Occurrences

- Execution: `Quick 034 / 7650585`
  - Evidence: representative record `../../slice-1/records/repeated-recovery.md`, events R2, R4, and R6; later inspection confirmed R3 established commit `7650585` before the repeated lookups
  - Observed effect: the plan path and commit membership were rediscovered three times before findings could be assessed
  - Inference: retaining the reviewed manifest would likely avoid repeated recovery; no token count was available
- Execution: `record:slice-2-distinct-recovery`
  - Evidence: representative record `../records/distinct-recovery.md`, events E1 through E4
  - Observed effect: one established execution boundary was reconstructed twice during later review focuses
  - Inference: the distinct recurrence supports retaining one compact manifest across review focuses; no token count was available

## DD-002 — Compact process map supported reuse

A compact event-and-decision map was reused across review focuses without
reopening the full record.

### Occurrences

- Execution: `SEED-010 Story 1 / record:quick-036-slice-1`
  - Evidence: representative record `../../slice-1/records/process-map.md`, events P1 through P3
  - Observed effect: later conclusions and checks reused the same map
  - Inference: useful in this execution; broader benefit is not yet established

Human note: retain this useful-practice entry even if future reviews focus on costs.

## DD-003 — Transcript reread lost an observation location

The reviewer reopened a long transcript after losing one observation location.
This remains separate from DD-001 because the record does not prove that plan or
commit-boundary reconstruction caused the similar rereading symptom.

### Occurrences

- Execution: `record:quick-036-slice-2`
  - Evidence: representative record `../records/similar-symptom.md`, events S1 through S3
  - Observed effect: the transcript was reopened once to recover an observation location
  - Inference: the cause and relationship to DD-001 remain uncertain
