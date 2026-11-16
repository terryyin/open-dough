# Close the landed CI repeat checks' coverage gaps

**Identity:** SEED-324#close-landed-ci-repeat-check-gaps
**Source:** [story](../../seeds/SEED-324-landed-ci-repeat-checks.md#close-landed-ci-repeat-check-gaps)

## Supplier boundary

SEED-332#answer-fake-gh-reads-in-process (philip-chan) owns `src/fake-gh.mjs`,
the shared fake GitHub read transport, and its stability work. This correction
consumes its published interfaces. The story's dependency block records the
supplier outcome this correction needs; integrating that outcome and proving
this correction's own checks remain this correction's work.

## Verification

Run `node --test tests/*.test.mjs`. A slice is accepted when its named proof
passes on the slice's final state. Moved checks keep their titles and
assertions unchanged.

## Ordered slices

### 1. A failed run on an eligible receipt requests one rerun
Type: Behavior
Status: planned
Proof: `a failed first attempt requests one rerun` passes; a failed rerun
requests no further repeat.

### 2. A queued repeat reads "CI rerun in progress"
Type: Behavior
Status: planned
Proof: `a queued repeat reads as progress` passes for queued and in-progress runs.

### 3. The automatic-repeat checks are filed by the stage they start from
Type: Structure
Status: planned
Proof: the family passes with each case in its stage file —
`tests/repeat-receipt-stage.test.mjs`, `tests/repeat-request-stage.test.mjs`
and `tests/repeat-verdict-stage.test.mjs` — titles and assertions unchanged,
and `tests/repeat-checks.test.mjs` removed. The stage files read runs through
one shared fixture, `tests/support/repeat-fixture.mjs`, which uses the
supplier's in-process reader (`createFakeGhReader`) instead of a process per
read; the per-process reader is what exhausted the family's budgets.

### 4. A dashboard sends no rerun request for a landing another dashboard spent
Type: Behavior
Status: planned
Proof: a receipt already spent by another dashboard requests no rerun.
