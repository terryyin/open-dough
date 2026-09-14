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
  - Inference: Load required references once, then select sections for concrete
    unresolved questions and size outputs to fit. This should reduce avoidable
    rereading while preserving required context; net time and token cost were
    not measured. No decisive match to an existing local issue was found.

## DD-008 — Worktree-bound CI observer notifications cannot reach the originating-checkout session

In Story Branch Mode the coordinator session runs against the originating
checkout while the CI observer is launched from the execution worktree; the
host hook claims only mailboxes owned by its own checkout, so the observer's
notifications never arrive in the executing session.

### Occurrences

- Execution: `SEED-004#return-complete-usable-delegated-handoffs @ c8d2fd0`
  - Timestamp: 2026-09-14T16:07:00+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.17
  - Evidence: readiness probes from the execution worktree
    (`/private/tmp/open-dough-048-delegated-handoffs`) produced no
    `CI_MONITOR_READY` context, while the same probe from the originating
    checkout did; `ci-mailbox.mjs` binds each mailbox to the launching
    checkout (`CI mailbox belongs to another checkout`) and the session hook
    resolves to the originating checkout; observer `watch-LzixQz` ran for
    branch `cursor/048-complete-delegated-handoffs` with no in-session
    delivery; recorded in plan 048 commit `5a26c61`. The prior Cursor
    execution's observer (`watch-7SiFOl`, plan 047) was likewise
    worktree-bound.
  - Observed effect: the observer ran and recorded terminal results, but
    in-session notification was structurally impossible; the coordinator
    reported the bridge limitation and inspected CI state directly at
    shutdown instead of receiving failure notifications.
  - Inference: the host-adapter mailbox ownership rule predates Story Branch
    Mode's separate execution worktree; no delivered failure occurred in this
    execution, so the impact here was lost notification coverage rather than
    a missed repair. Whether plan 047's session had the same gap is
    unverified.

## DD-009 — Inserted guidance section left the return contract under the wrong heading

A slice inserting a new `##` section into `delegation.md` ahead of the file's
unheaded return-contract paragraphs left that general contract rendering under
the new section's heading; the slice's own refactor pass reported the change
already clean, and a later slice had to restore the structure.

### Occurrences

- Execution: `SEED-004#return-complete-usable-delegated-handoffs @ c8d2fd0`
  - Timestamp: 2026-09-14T16:12:41+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.17
  - Evidence: slice 1 commit `c8d2fd0` inserted
    `## Own verification to its terminal result` before the unheaded return
    contract; slice 1's refactor returned `none — already clean`; slice 2's
    implementation agent flagged the mis-heading and appended its own section
    at end of file to avoid worsening it; slice 2's refactor added
    `## Return a targeted report with focused proof` in commit `89728cb`.
  - Observed effect: one avoidable structural defect carried across slices and
    one extra structural fix inside a later slice's refactor pass.
  - Inference: inserting a headed section into prose with unheaded trailing
    content changes what the following content renders under; a structural
    heading check belongs in the post-change refactor pass for guidance
    insertions. Cost was small and not measured beyond the extra fix.
