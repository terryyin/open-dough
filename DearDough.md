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

- Execution: `SEED-011#customize-project-ci-watcher @ c748b9d`
  - Timestamp: 2026-09-15T14:02:10+08:00
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.20
  - Evidence: Slice 2 added managed `ci-command-adapter.mjs` and passed the
    runtime and update fixtures, but omitted the installation guide's complete
    payload enumeration. GitHub runs `34934932399` and `34935086435` failed
    `tests/dough-update-guidance-payload.sh`; repair `07929e0` added the missing
    path and the focused check passed.
  - Observed effect: Slice 3 paused while the same payload-documentation defect
    was diagnosed and repaired after two failed branch runs.
  - Inference: Proof selection followed runtime/update files without tracing the
    new managed path to the maintained documentation contract, repeating this
    finding's cross-file contract gap.

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
  - Inference: Load required references once, then select sections for concrete
    unresolved questions and size outputs to fit. This should reduce avoidable
    rereading while preserving required context; net time and token cost were
    not measured. No decisive match to an existing local issue was found.

- Execution: `SEED-011#customize-project-ci-watcher @ c748b9d`
  - Timestamp: unknown
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.20
  - Evidence: After Slice 3 implementation, one combined command requested
    status, aggregate statistics, seven full diffs, complete source files, and
    cross-file searches. Its output exceeded the retained context and was
    truncated; smaller targeted inspections were then rerun.
  - Observed effect: The acceptance review repeated reads of the changed
    boundaries before it could approve the slice.
  - Inference: Combining unrelated acceptance questions into one oversized read
    repeated this finding; the additional time and token cost were not measured.
