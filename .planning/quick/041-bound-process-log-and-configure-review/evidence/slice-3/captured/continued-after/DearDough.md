# DearDough Process Findings

## Retention

- Highest allocated local number: 6
- Recovery: `git show 90d2b82bd4ac9f1b40e97ece48debaeb826ceb36:DearDough.md`
- Occurrence history is partial

## DD-002 — Repeated lookup of the same planning filename

The execution reconstructed the same planning filename after it had
already been established, adding repeated lookup without new evidence.

### Occurrences

- Execution: `record:slice-3-dd002-a`
  - Tool: Cursor
  - Open Dough release: unreleased
  - Evidence: `records/pruned-dd002-occurrence-rereview.md` event C1 for the established name
  - Observed effect: the planning filename was recovered once, then looked up again
  - Inference: retaining the established name would avoid the extra lookup

- Execution: `record:slice-3-dd002-b`
  - Tool: Cursor
  - Open Dough release: unreleased
  - Evidence: distinct execution recovered the same filename after a later focus switch
  - Observed effect: the already established name was reconstructed during product review
  - Inference: the distinct execution supports keeping one established name across focuses

## DD-003 — Plan-conflict handoff skipped, then the approved contract was rewritten

The execution treated an apparently accidental plan restriction as
resolved by rewriting the historical contract instead of stopping for
the human decision. The delivered outcome changed a promised constraint.

### Occurrences

- Execution: `record:slice-3-dd003-a`
  - Tool: Cursor
  - Open Dough release: unreleased
  - Evidence: `records/dd003-new-recurrence.md` events R1-R2 analog in the original execution
  - Observed effect: an approved restriction was rewritten without a human decision
  - Inference: skipping the handoff can change the source outcome; current and likely to recur

- Execution: `record:slice-3-dd003-recurrence`
  - Tool: Cursor
  - Open Dough release: unreleased
  - Evidence: `records/dd003-new-recurrence.md` events R1-R2
  - Observed effect: an approved restriction was rewritten without a human decision
  - Inference: distinct execution of the same concrete handoff skip

## DD-005 — Failed write retry silently discarded uncommitted user edits

After a process-log write failed, a retry truncated the destination
and reconstructed it from an incomplete candidate, dropping uncommitted
human notes that existed only in the working tree.

### Occurrences

- Execution: `record:slice-3-severe`
  - Tool: Cursor
  - Open Dough release: unreleased
  - Evidence: `records/severe-failed-write-retry.md` events S1-S3
  - Observed effect: uncommitted human notes were absent after the retry
  - Inference: a failed write must leave original bytes unchanged; currently actionable

## DD-001 — Occasional extra blank line in generated notes

A generated note file sometimes contained one extra blank line.
The extra line did not change review conclusions or hide evidence.

### Occurrences

- Execution: `record:slice-3-dd001-new`
  - Tool: Cursor
  - Open Dough release: unreleased
  - Evidence: `records/dd001-new-execution.md` events N1-N2
  - Observed effect: one extra blank line appeared in a generated note
  - Inference: cosmetic only; recovered identity, new execution only

## DD-006 — Duplicate remaining-work slice restated completed work

The execution duplicated the same bounded-correction plan instead of
revising the overlapping slice in place.

### Occurrences

- Execution: `record:slice-3-unmatched`
  - Tool: Cursor
  - Open Dough release: unreleased
  - Evidence: `records/unmatched-new.md` events U1-U2
  - Observed effect: completed work was restated as if it were still planned
  - Inference: distinct unmatched issue; identity safely allocatable
