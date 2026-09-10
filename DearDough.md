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

## DD-003 — CI observation skipped when the host bridge is not ready

A completed execution was pushed to the authorized remote, including `main`,
without an attached CI observer because the Cursor host hook did not add
`CI_MONITOR_READY`.

### Occurrences

- Execution: `SEED-010#prove-retrospective-completion-without-redundant-plan-ceremony @ ae12e1e`
  - Tool: Cursor
  - Model: Grok 4.6
  - Open Dough release: 0.3.8
  - Evidence: Quick 039 PLAN learnings; execution report `pendingCi: unobserved`;
    session hook context contained GSD messages only, not `CI_MONITOR_READY`.
  - Observed effect: The feature branch and `main` were updated without
    coordinator notification of GitHub Actions results.
  - Inference: Execute-plan correctly continues without polling when readiness
    is missing. A coordinator whose writers use a separate worktree while the
    Cursor workspace remains `main` may not receive host-bridge readiness, so
    coverage is lost rather than delayed. This execution does not prove how
    often that binding fails.