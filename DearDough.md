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

## DD-003 — Broad verification repeated focused guidance proof

The execution ran and waited for the full repository test suite even though the
plan explicitly limited this guidance change to representative authoring
walkthroughs, link/frontmatter review, and affected focused checks.

### Occurrences

- Execution: `SEED-004#execute-simple-story-as-one-quick-slice @ d812e92`
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.8
  - Evidence: Quick 040's proof boundary says not to run installer/CI-runtime
    suites merely because execution guidance changed; the execution transcript
    records a full local `npm test` plus an explicit wait for GitHub Actions run
    `34543610881`, whose test job took 10m20s.
  - Observed effect: Merge and cleanup waited for broad verification that
    duplicated the already running repository suite after slice-owned
    walkthroughs, formatting, lint, focused proof, and delivery had passed.
  - Inference: Treating "everything is done" as a new broad-suite requirement
    overrode the plan's proof ownership and added avoidable verification delay.

## DD-004 — Isolated execution preserved concurrent mainline work

Running the plan in its own worktree and branch kept concurrent mainline changes
separate until an explicit merge boundary.

### Occurrences

- Execution: `SEED-004#execute-simple-story-as-one-quick-slice @ d812e92`
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.8
  - Evidence: Quick 040 branched from `97daf44`; while it ran, `main` advanced
    through `a6e3396`. Merge `3395460` retained both histories and required one
    bounded conflict resolution in `.planning/PRODUCT-BACKLOG.md`.
  - Observed effect: All three Quick 040 delivery commits and the concurrent
    wrap-up-context commits reached `main` without either execution rewriting or
    discarding the other's work; the temporary worktree and branch were then
    removed cleanly.
  - Inference: The isolated-worktree practice provided a reliable ownership and
    recovery boundary for concurrent lifecycle work.
