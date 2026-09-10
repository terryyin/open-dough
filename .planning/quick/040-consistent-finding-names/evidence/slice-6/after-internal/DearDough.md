# DearDough Process Findings

Human note: keep the execution labels recognizable to maintainers.

## ODF-001 — Repeated context recovery obscured the execution boundary

The execution repeatedly reconstructed the same plan and commit boundary instead
of retaining one compact manifest for later review steps.

Human note: this may matter most when a review spans several focus areas.

### Occurrences

- Execution: `Quick 034 / 7650585`
  - Tool: Codex
  - Model: gpt-5
  - Open Dough release: 0.3.4
  - Evidence: representative record `../records/repeated-recovery.md`, events R2, R4, and R6
  - Observed effect: the plan path and commit membership were rediscovered three times before findings could be assessed
  - Inference: retaining the reviewed manifest would likely avoid repeated recovery; no token count was available
- Execution: `record:quick-040-slice-6-distinct-recovery`
  - Tool: Cursor
  - Open Dough release: 0.3.6
  - Evidence: representative record `../records/distinct-recovery.md`, events E1 through E4
  - Observed effect: one established execution boundary was reconstructed twice during later review focuses
  - Inference: the distinct recurrence supports retaining one compact manifest across review focuses; no token count was available

## DD-002 — Transcript reread lost an observation location

The reviewer reopened a long transcript after losing one observation location.
This remains separate from ODF-001 because the record does not prove that plan
or commit-boundary reconstruction caused the similar rereading symptom.

### Occurrences

- Execution: `record:quick-040-slice-6-transcript-reread`
  - Tool: Claude Code
  - Open Dough release: unknown
  - Evidence: representative record `../records/unseen-issue.md`, events S1 through S3
  - Observed effect: the transcript was reopened once to recover an observation location
  - Inference: the cause and relationship to ODF-001 remain uncertain
