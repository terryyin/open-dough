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

## DD-003 — Worktree isolation kept concurrent trunk work out of execution commits

Executing Taken work on a dedicated worktree and branch, then merging back,
left the story's implementation commits as an uncontaminated range even while
unrelated work landed on `main`.

### Occurrences

- Execution: `SEED-010#act-on-identified-retrospective-findings @ 57425ff`
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision 46f8ddb; base 0.3.8
  - Evidence: slice commits `57425ff`, `1d05077`, `3045f72`, `217146d`,
    `03bbc85` on `worktree-quick-039-triage-retrospective-findings`; intervening
    `main` commits `42a291a`, `ec1942b`, `909fbf0`, `aaf3c16`; merge `bf6643a`
  - Observed effect: the retrospective could review the five slice patches
    without isolating them from the concurrent slice-status work that landed on
    `main` during the same window
  - Inference: this is a useful practice for concurrent trunk work, not a claim
    that worktrees are required for every execution

## DD-004 — Native adapter watchdog deadline exceeds the CI job timeout

A hung native-adapter proof can occupy the entire GitHub Actions job because
the supervisor default deadline is longer than the workflow job timeout.

### Occurrences

- Execution: `SEED-010#act-on-identified-retrospective-findings @ 57425ff`
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision 46f8ddb; base 0.3.8
  - Evidence: GitHub Actions run `34476615807` on `3045f72` cancelled at
    ~20m18s in `tests/native-delivery-updated-use-adapters.sh` with the
    watchdog `sleep` still running; `.github/workflows/ci.yml` `timeout-minutes:
    20`; `tests/support/native-run-supervise.sh` default
    `native_case_deadline:-3600`; later SHA `217146d` run `34477941056`
    succeeded in ~10m
  - Observed effect: slice 3 CI was `CI_INCOMPLETE`; the native supervisor was
    not in the slice 3 diff and was not repaired; later SHAs were initially
    unobserved after observer shutdown
  - Inference: when a native journey hangs, the 3600s watchdog cannot fire
    before the 20-minute job kills the run; the hang looks intermittent because
    a later SHA on the same branch passed
