# DearDough Process Findings

## ODF-001 — Mixed execution changes obscure commit provenance

Former local code: DD-001.

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

## ODF-002 — Planless Taken work lacks closure evidence

Former local code: DD-002.

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

## ODF-003 — File-type assumptions skipped affected maintained proof

Former local code: DD-003.

Slice implementation and refactor handoffs treated runtime Markdown changes as
having no applicable maintained tests, even though one changed phrase was an
explicit contract in the focused CI runtime suite.

### Occurrences

- Execution: `SEED-004#execute-in-worktree-and-merge-at-wrap-up @ 8a1be3c`
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

## ODF-004 — Exact CI repair recovery preserved in-progress slice work

Former local code: DD-004.

The asynchronous repair protocol isolated a real failure without losing or
mixing the active slice, then resumed the same implementation from its precise
handoff.

### Occurrences

- Execution: `SEED-004#execute-in-worktree-and-merge-at-wrap-up @ 8a1be3c`
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.8
  - Evidence: Run `34550693158` triggered a safe Slice 4 pause; stash
    `38c6397e97c663307d721496998200c3da10768c` preserved its two paths while
    `2272133` repaired CI, after which the exact stash was applied and dropped.
  - Observed effect: Slice 4 resumed with its completed fixture proof and
    partial guidance intact; the older unrelated stash remained untouched.
  - Inference: Explicit writer quiescence, exact stash identity, and focused
    repair delivery formed a useful recovery boundary for worktree execution.

## ODF-005 — Installed and unreleased execution guidance competed for authority

Former local code: DD-005.

The selected quick story had explicit planless execution authority, while the
installed execution skill still required a plan and the repository's unreleased
source already defined the quick path.

### Occurrences

- Execution: `SEED-004#drop-recently-done-from-product-backlog @ 30a5026`
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: unreleased; revision `533da34`; base `0.3.8`
  - Evidence: The execution first loaded
    `.agents/skills/dough-execute-plan/SKILL.md`, which excluded seed execution,
    then inspected `src/skills/dough-execute-plan/SKILL.md`, which accepted an
    explicitly selected canonical story as one quick slice.
  - Observed effect: Execution required an extra authority reconciliation before
    the queued story could move to **Taken** and implementation could begin.
  - Inference: Maintainer dogfooding of unreleased workflow behavior needs an
    explicit source-versus-installed authority convention to avoid contradictory
    execution gates.

## ODF-006 — Oversized context reads obscure narrow execution inputs

Former local code: DD-006.

Bundling large skill references and planning documents into one output exceeded
output limits during a small guidance change, obscuring requested context and
prompting further reads. This concerns input selection, not a reason to omit
required review or proof.

### Occurrences

- Execution: `SEED-010#retain-reconciled-findings-in-open-dough @ 0120ac3`
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

- Execution: `.planning/quick/039-match-success-claims-to-proof/PLAN.md @ e710426`
  - Tool: Codex
  - Open Dough release: 0.3.13 (installed execution/refactor contracts at
    `bb891de` match the release; the changed source guidance was not installed).
  - Evidence: This conversation's refinement/planning reads combined ADRs,
    skill references, story context, and search results into outputs reported
    as truncated. This retrospective's suite/context reads also exceeded their
    output budgets; subsequent focused reads supplied decisive sections.
  - Observed effect: Some requested context was unavailable in the initial
    outputs and further reads were needed. The completed slice changes two
    runtime sections by a net 73 words; that small change did not require
    repeatedly returning broad context already present in the conversation.
  - Inference: Reuse loaded guidance and request only unresolved sections;
    batch independent reads without exceeding the aggregate output budget.
    This is the same context-selection problem as ODF-006, not evidence of
    measured token savings or a reason to skip required review.

## DD-007 — A failed verification command did not stop commit and push

A sequential shell batch continued after a failed required check, so the
coordinator committed and pushed the defect that the check had just identified.
Use fail-fast control flow or inspect each required result before dependent
mutations; a final successful command must not hide an earlier failure.

### Occurrences

- Execution: `.planning/quick/039-match-success-claims-to-proof/PLAN.md @ e710426`
  - Tool: Codex
  - Open Dough release: 0.3.13 (installed execution contracts at `bb891de`).
  - Evidence: After the coordinator's completion-note edit, both
    `git diff --check` and `git diff --cached --check` reported
    `PLAN.md:195: new blank line at EOF`. The same shell batch still committed
    `e710426` and pushed it. It had no fail-fast control flow. The next batch
    used `set -e`, removed the extra blank line, checked, committed `64dcb0b`,
    and pushed again.
  - Observed effect: A second commit and push were needed for an already
    detected formatting defect. The final aggregate diff passes the check;
    no corresponding implementation correction remains.
  - Inference: The verification gate existed but was not enforced by command
    orchestration. Making check failure stop dependent staging/commit/push
    should avoid this repair loop; token and elapsed savings were not measured.
