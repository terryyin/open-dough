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

## DD-003 — Wrap-up plan edits raced the commit

The coordinator issued the slice-3 plan-learning edit in parallel with
`git add`/`git commit`, so the intended learning did not reliably land in the
delivered plan.

### Occurrences

- Execution: Quick 041 `.planning/quick/041-bound-process-log-and-configure-review/PLAN.md` @ `e8e937b`
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `71161c2`; base 0.3.8
  - Evidence: this conversation's slice-3 wrap-up; committed plan Learnings
    jumps from slice 2 to slice 4 with no slice-3 line
  - Observed effect: the delivered plan omits the slice-3 learning the
    wrap-up had already drafted
  - Inference: plan update, staging, and commit must be sequential; parallel
    tool calls can drop wrap-up edits without a failing hook

## DD-004 — Oversized log fixtures were stored, then generated

Slice 2 committed multiple ~500–1,020-line `DearDough.md` copies. Slice 3
then generated the 995-line fixture in `/tmp` and stored only the small
after-state.

### Occurrences

- Execution: Quick 041 `.planning/quick/041-bound-process-log-and-configure-review/PLAN.md` @ `e8e937b`
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `71161c2`; base 0.3.8
  - Evidence: `9de7f00` (~13k insertions, duplicate 1000/1020-line logs);
    slice-3 `build-isolated-fixture.py` rebuilds the 995-line log outside
    the repo
  - Observed effect: git history carries several near-identical full-size
    logs that a generator later proved unnecessary
  - Inference: generating measured logs is a useful practice when the
    proof only needs counts, checksums, and a small captured result; this
    execution does not establish it as a general evidence rule
