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

## DD-003 — File-type assumptions skipped affected maintained proof

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

## DD-004 — Exact CI repair recovery preserved in-progress slice work

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

## DD-005 — Installed and unreleased execution guidance competed for authority

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

## DD-006 — Incomplete proof handoff required a second agent turn

The implementation handoff reported a passing disposable fixture but left its
literal command in the implementation agent's transcript. The coordinator could
not inspect its setup and assertions from the handoff.

### Occurrences

- Execution: `.planning/quick/043-remove-retired-completion-vocabulary/PLAN.md @ a5da136`
  - Tool: Codex
  - Model: GPT-6
  - Open Dough release: unknown
  - Evidence: Execution conversation: implementation final handoff said the
    disposable fixture command was available in its tool transcript; the
    coordinator subsequently requested it by message, then used a follow-up
    task to recover it into `evidence/WALKTHROUGH.md` without rerunning it.
  - Observed effect: Another agent turn was needed before the coordinator could
    inspect already-produced proof. The fixture was not rerun.
  - Inference: Returning inspectable setup, assertions, and the literal command
    with the first proof handoff would avoid this coordination round trip while
    preserving the proof gate. No token cost was measured. This would keep
    bounded maintenance cheaper while the project prioritizes lifecycle-skill
    extraction from Donut.

## DD-007 — Oversized context reads obscured required evidence

Batching large instruction and test bodies into capped output caused truncation
instead of delivering a bounded set of readable decision inputs.

### Occurrences

- Execution: `.planning/quick/043-remove-retired-completion-vocabulary/PLAN.md @ a5da136`
  - Tool: Codex
  - Model: GPT-6
  - Open Dough release: unknown
  - Evidence: Execution conversation: the combined execution-reference read
    reported truncated output. During this retrospective, combined test and
    guidance reads also exceeded their output cap; later reads selected smaller
    test sections and contract searches.
  - Observed effect: Required review material was partly hidden in tool output,
    followed by narrower retrieval. This also affected the retrospective itself.
  - Inference: Size each read to the decision, reuse already-read instructions,
    and return bounded sections from independent searches. The record supports
    avoidable retrieval work, not a quantified token saving or a claim that
    necessary architectural and suite review should be skipped.
