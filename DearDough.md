# DearDough Process Findings

## DD-001 — Mixed execution changes obscure commit provenance

The execution's product changes were committed together with a much larger,
separately described cleanup, so the commit does not identify the Taken-work
outcome as one of its responsibilities.

### Occurrences

- Execution: `SEED-004#show-stories-as-taken-during-execution @ 519bb4a`
  - Tool: Codex
  - Model: GPT-5
  - Evidence: `519bb4a` changes 147 files; the Taken outcome occupies eight
    files, while the commit subject describes only removal of Quick 040 and
    DearDough material.
  - Observed effect: The retrospective had to isolate the eight relevant
    patches instead of reviewing the commit as one uncontaminated execution.
  - Inference: Separate commits for independently completed work would make
    review scope, attribution, and recovery clearer.

## DD-002 — Planless Taken work lacks closure evidence

This story was intentionally implemented without a slice plan, but the current
wrap-up workflow requires a plan identity, completed slice state, and a
plan-recorded retrospective completion marker.

### Occurrences

- Execution: `SEED-004#show-stories-as-taken-during-execution @ 519bb4a`
  - Tool: Codex
  - Model: GPT-5
  - Evidence: The story records direct planless implementation and remains under
    **Taken**; `dough-story-wrap-up` requires the selected work's executable
    plan and retrospective-completion evidence.
  - Observed effect: The execution can be reviewed from the story, conversation,
    and commit, but it cannot satisfy the existing wrap-up closure contract.
  - Inference: Planless execution needs either an explicit one-off closure
    decision or a deliberately designed closure record; retroactively inventing
    a plan would misrepresent the execution.

Resolution: On 2026-09-10, the human authorized a one-off closure for this
execution and retained the existing plan-required wrap-up contract unchanged.

## DD-003 — Conventional guidance edits trigger delivery-mechanism rechecks

A small instruction-only change was verified with payload upgrade and all-tool
installation suites even though it changed no installation or discovery
mechanism.

### Occurrences

- Execution: `SEED-004#execute-without-redundant-in-progress-status @ ec1942b`
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.8
  - Evidence: The developer identified the work as a simple direct change and
    skipped slice planning. Before `ec1942b`, verification ran five skill
    validators plus `story-payload-update.sh`, `execution-payload-update.sh`,
    `dough-update-guidance-payload.sh`, and `install-all-tools.sh`; the commit
    changed Markdown guidance and planning records only.
  - Observed effect: All checks passed, but installation and payload behavior
    unrelated to the changed status semantics was exercised again.
  - Inference: The representative current-behavior review required by
    `AGENTS.md` and ADR 0005 was the useful confidence boundary; delivery tests
    added avoidable execution time because their mechanism and declarations
    were unchanged.
