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

- Execution: `SEED-004#guide-implementation-from-generic-to-specific @ 45f70d3`
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: modified; revision `11fa43c`; base `0.3.9`
  - Evidence: The invoked installed retrospective `SKILL.md` is identical to
    source and links `references/bounded-process-log.md`, but neither installed
    root nor the managed payload contains that reference; only the source tree
    does. SEED-010 Story 2 already owns complete release and adoption.
  - Observed effect: This retrospective had to load the source reference as a
    fallback to make its permitted process-log write; an ordinary installed use
    would lack the required bounds procedure.
  - Inference: Dogfooding modified guidance needs an explicit authority and
    complete-dependency boundary before the released adoption story finishes.

## DD-006 — Over-sliced guidance work multiplied fixed delivery gates

**Importance:** Important — the execution did not surface this disproportionate
cost on its own; it became visible only after the developer explicitly prompted
the retrospective, so one occurrence is enough to retain the signal.

The guidance story was decomposed into six sequential Behavior slices, each
requiring a fresh implementation handoff, fresh independent refactor, formatting,
lint, commit, push, and plan update even though the edits formed three tightly
connected textual changes across one lifecycle.

### Occurrences

- Execution: `SEED-004#guide-implementation-from-generic-to-specific @ 45f70d3`
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: modified; revision `11fa43c`; base `0.3.9`
  - Evidence: The Taken commit at 15:49:37 and final implementation commit at
    16:36:11 bound 46m34s of committed execution; the developer observed roughly
    55 minutes including preflight and shutdown. The execution changed 18 files
    with 569 insertions, but also ran six implementation handoffs, six refactor
    handoffs, and six delivery cycles. Four refactors made no edits; two removed
    narrow duplicated orchestration. Recognition evidence alone added 240 lines.
  - Observed effect: A source-guidance change expected to be mostly text editing
    consumed nearly an hour, with repeated fixed gates dominating the elapsed
    time despite no implementation failure or CI repair.
  - Inference: Cross-workflow risk and the two useful deduplication edits justify
    meaningful review, but not six full delivery cycles. Future guidance plans
    should account for per-slice coordination cost and combine tightly coupled
    lifecycle variants into fewer end-to-end Behavior slices when their proof
    and safe stopping point remain coherent.
