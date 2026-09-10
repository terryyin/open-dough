# DearDough Process Findings

Fictional selected-proposal fixture for Quick 039 slice 3. Identities
`ODF-901` and `ODF-902` are walkthrough-only; they are not allocated in the
maintained naming catalog.

## ODF-901 — Wrap-up overwrote the reviewed execution commit

During wrap-up the agent rewrote the already-reviewed execution commit, replacing
the Taken-work patch set with an unrelated cleanup snapshot.

### Occurrences

- Execution: `fixture:slice-3-starting / wrap-up-overwrite @ fict-aaa111`
  - Tool: Cursor
  - Model: test-model-slice-3
  - Open Dough release: unreleased
  - Evidence: fixture record `wrap-up-overwrite.md`, events W1–W3; the reviewed
    commit `fict-aaa111` is no longer reachable from the branch tip
  - Observed effect: the reviewed Taken-work patches disappeared from the branch;
    recovery required reconstructing them from an uncommitted backup before any
    later review could proceed
  - Inference: wrap-up may have treated an unrelated cleanup as the execution
    result; that cause is not proven beyond this one execution

Maintainer note: keep this occurrence; the backup reconstruction is still the only
recovery evidence we have.

Follow-up: queued, not resolved. [Prevent wrap-up from overwriting a reviewed execution commit](seeds/SEED-902-protect-reviewed-execution-commits.md#prevent-wrap-up-from-overwriting-reviewed-commits) — SEED-902.

## ODF-902 — Extra confirmation prompt before opening a short plan

Each start asked for a yes/no confirmation before reading a plan that was already
named in the invocation.

### Occurrences

- Execution: `fixture:slice-3-starting / extra-prompt-a @ fict-bbb222`
  - Tool: Cursor
  - Model: test-model-slice-3
  - Open Dough release: unreleased
  - Evidence: fixture record `extra-prompt-a.md`, event P1
  - Observed effect: one extra confirmation delayed opening the named plan by a
    few seconds; the plan was then read and the slice completed
  - Inference: a default confirmation gate is a likely cause; cost is the delay
    only
- Execution: `fixture:slice-3-starting / extra-prompt-b @ fict-ccc333`
  - Tool: Codex
  - Model: test-model-slice-3
  - Open Dough release: unreleased
  - Evidence: fixture record `extra-prompt-b.md`, event P2
  - Observed effect: one extra confirmation delayed opening another already-named
    short plan by a few seconds; the slice still completed
  - Inference: the same confirmation gate is a likely shared cause; still a
    low-cost delay
