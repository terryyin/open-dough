# DearDough Process Findings

## ODF-001 — Mixed execution changes obscure commit provenance

Former local code: DD-001.

The execution's product changes were committed together with a much larger,
separately described cleanup, so the commit does not identify the Taken-work
outcome as one of its responsibilities.

### Occurrences

- Execution: `SEED-004#show-stories-as-taken-during-execution @ 519bb4a`
  - Timestamp: unknown
  - Tool: Codex
  - Model: GPT-5
  - Evidence: `519bb4a` changes 147 files; the Taken outcome occupies eight
    files, while the commit subject describes only removal of Quick 040 and
    DearDough material.
  - Observed effect: The retrospective had to isolate the eight relevant
    patches instead of reviewing the commit as one uncontaminated execution.
  - Inference: Separate commits for independently completed work would make
    review scope, attribution, and recovery clearer.

## ODF-003 — File-type assumptions skipped affected maintained proof

Former local code: DD-003.

Slice implementation and refactor handoffs treated runtime Markdown changes as
having no applicable maintained tests, even though one changed phrase was an
explicit contract in the focused CI runtime suite.

### Occurrences

- Execution: `SEED-004#execute-in-worktree-and-merge-at-wrap-up @ 8a1be3c`
  - Timestamp: unknown
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.8
  - Evidence: Slice 2 changed the observer identity phrase in
    `ci-monitor.md`; runs `34550693158` and `34551244098` failed
    `ci-supported-host-contract.test.mjs`; repair `2272133` restored the stable
    phrase and all later branch runs passed.
  - Observed effect: Slice 4 paused, its work was stashed and restored, and a
    repair commit was required before execution could continue.
  - Inference: Selecting focused proof from file type instead of tracing the
    changed contract to maintained tests caused avoidable CI repair churn.

## ODF-006 — Oversized context reads obscure narrow execution inputs

Former local code: DD-006.

Bundling large skill references and planning documents into one output exceeded
output limits during a small guidance change, obscuring requested context and
prompting further reads. This concerns input selection, not a reason to omit
required review or proof.

### Occurrences

- Execution: `SEED-010#retain-reconciled-findings-in-open-dough @ 0120ac3`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: This execution conversation's combined read of SEED-010 and
    `dough-execute-plan/references/{delegation,execution-decisions,wrap-up,ci-monitor}.md`
    returned truncated output. The next combined reconciliation/triage/context
    read was also truncated; execution-decisions was subsequently loaded again.
    Bundled document reads in this retrospective repeated the truncation.
  - Observed effect: Requested guidance was not fully visible in those outputs,
    and additional context reads were performed for the same single-slice work.
  -     Inference: Load required references once, then select sections for concrete
    unresolved questions and size outputs to fit. This should reduce avoidable
    rereading while preserving required context; net time and token cost were
    not measured. No decisive match to an existing local issue was found.

- Execution: `SEED-013#minimize-and-prove-ci-watcher-involvement @ 5e2b50a`
  - Timestamp: unknown
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.22
  - Evidence: Startup combined `dough-execute-plan` with delegation,
    execution-decision, and wrap-up references in one read; the 11,635-token
    output was truncated. A later combined planning/decomposition/CI read also
    truncated, so required passages were retrieved again in smaller reads.
  - Observed effect: Execution spent additional reads recovering instruction
    passages that the first bundled reads had already requested.
  - Inference: This is another occurrence of oversized context bundling; the
    later targeted reads were necessary recovery, not evidence the full guidance
    was unnecessary.

## DD-007 — Delivery preparation skipped before push

The execution pushed two completed slices without running the repository's
required formatting/lint preparation, even though the active plan explicitly
identified the broad formatter and required delivery-time resolution.

### Occurrences

- Execution: `SEED-013#minimize-and-prove-ci-watcher-involvement @ 5e2b50a`
  - Timestamp: 2026-09-16T07:14:29Z
  - Tool: Cursor
  - Open Dough release: 0.3.22
  - Evidence: GitHub Actions run `35067498190` for `d57b4c5` failed
    `no-new-func` in `ci-notify-codex-test-fixtures.mjs` and Prettier checks in
    two new fixture files; repair `6b99961` added the scoped explanation and
    formatting before Slice 3 continued.
  - Observed effect: Codex had to pause resumed execution for an avoidable CI
    repair before it could run the planned native acceptance journey.
  - Inference: Skipping the coordinator-owned formatter and staged preparation
    moved deterministic local feedback into CI and added repair churn.
