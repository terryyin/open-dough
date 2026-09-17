# DearDough Process Findings

## DD-053 — Take-queued-work claim staging assumes exclusive backlog ownership

The take-queued-work guidance says to stage the backlog path as a whole when
committing an isolated **Taken** claim. It does not address a concurrent
session's own uncommitted, unrelated edits already present in that same
tracked file at claim time; staging the whole path would have folded that
other session's unreviewed draft content into this execution's claim commit.

### Occurrences

- Execution: `SEED-004#run-standalone-manual-testing-in-isolated-execution @ 290d30d`
  - Timestamp: 2026-09-17T12:08:37+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: modified; revision 9e6ce93; base 0.3.24
  - Evidence: Before the claim, `git status --short` on `.planning/PRODUCT-BACKLOG.md`
    and `.planning/seeds/SEED-008-worktree-branch-trunk-sync.md` already showed
    unstaged modifications (a "Publish Trunk Mode from local main" story
    capture) with mtimes ~2 minutes old, not owned by this execution.
    Following the literal "stage only the backlog path" instruction would have
    staged that unrelated addition together with this claim's move of one
    entry to Taken.
  - Observed effect: The claim was instead built by staging a hand-constructed
    target blob via `git hash-object`/`git update-index` for only the intended
    move, leaving the concurrent session's edits untouched and unstaged; commit
    `290d30d` contains only the claim's own change.
  - Inference: The guidance's "stage only the backlog path" step assumes the
    backlog file has no concurrent uncommitted edits from another session at
    claim time; when it does, whole-path staging would misattribute unreviewed
    content into the claim commit. A hunk- or content-aware staging fallback
    for this case is not currently documented.

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

## ODF-052 — Cursor mailbox probe did not attach CI_MONITOR_READY

Former local code: DD-047.

A harmless `ci-mailbox.mjs probe` printed a `CI_OBSERVER` receipt, but this
coordinator session never received host `CI_MONITOR_READY`. Observation was
not started; later execution-branch pushes were unobserved.

### Occurrences

- Execution: `SEED-004#guide-useful-manual-testing @ ed19f9f`
  - Timestamp: 2026-09-16T16:00:00+08:00
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision 1805b5a; base 0.3.22
  - Evidence: Probe from
    `.worktrees/051-guide-manual-exploration/.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs`
    printed `CI_OBSERVER {"directory":"/tmp/dough-ci-501/watch-P9o15E"}`.
    Pushes `ed19f9f`, `067b29f`, `96822da` to
    `quick/051-guide-manual-exploration`. Plan records CI observation unavailable.
  - Observed effect: No observer was armed; `pendingCi: unobserved` for the
    whole planned execution. GitHub Actions for the branch was not claimed.
  - Inference: The adapter requires a separate hook `CI_MONITOR_READY` after
    the receipt; a probe directory is not an execution observer. Following the
    unavailable-bridge path avoided a disconnected watcher. Whether the Cursor
    hook failed to bind `generation_id` was not proved.

