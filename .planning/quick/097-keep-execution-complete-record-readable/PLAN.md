# Keep plans with quoted records readable and prove the completion record once

This bounded retrospective correction has this plan as its canonical home.

**Identity:** quick/097-keep-execution-complete-record-readable/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bcb678f112e368c73edddf027faead7029f134c8b1397fd10b8207614781685b"}}
```

## Source and provenance

Execution retrospective of `SEED-021#see-finished-execution` (story 5 of
`3dd84041696b0c2be144b64d510f395c49b2f8db:.planning/seeds/SEED-021-observe-published-story-progress.md`),
plan `3dd84041696b0c2be144b64d510f395c49b2f8db:.planning/quick/094-see-finished-execution/PLAN.md`.
Reviewed commits on
`claude/094-see-finished-execution`: `d4dbbdb`, `7ec2fef`, `102c659`,
`c06c4d3`, `f10aa01`; claim `04a034b` is provenance. That story's promises
stand: the record's form, the card and detail wording, the waiting time, the
guidance order (record, one commit, publication, completion wait), and
wrap-up's use of the recorded advice are unchanged.

## Beneficiary and outcome

Terry sees the right slice count and completion state for every plan,
including plans that quote Markdown examples in fenced blocks. Maintainers can
reword the execution-completion guidance without failing tests, while a test
still fails if the documented record form stops being readable by the plan
reader.

## Current findings

- **Two heading rules in one reader (F1).**
  `src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs`
  skips fenced lines only in `readCompletion` (`unfencedIndexes`).
  `sectionBounds` and the `### ` scan in `readPlanSlices` do not. Verified at
  `f10aa01`: a two-slice plan whose slice 1 quotes
  ```` ```markdown ```` / `## Execution complete` / ```` ``` ```` returns
  `interpreted` with only slice 1, so the card would say "1 of 1 slices
  recorded complete". A fenced `### …` line inside a slice makes the plan
  `uninterpretable`. The fence closer accepts any line that starts with the
  opener's first three characters, so a four-backtick fence closes at an
  inner three-backtick line.
- **Sentence-pinned guidance test, missing contract (F2).**
  `src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs`
  asserts most promises with whole-sentence regexes (including link text and
  wrapping). [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  §2 asks guidance tests to check intended behavior, allow equivalent
  phrasing, and keep exact matching for explicit contracts. The neighbouring
  `ci-completion-lifecycle-guidance.test.mjs` already follows that style. The
  one explicit contract — the record form in
  `src/skills/dough-execute-plan/references/finish-or-stop.md#record-execution-completion`
  is read by `readPlanSlices` as `completion.advice` — has no test.

## Scope

Included: one fence-aware line rule shared by the reader's section bounds,
slice-heading scan, and completion reader, with a fence closer that honours
the opener's character and length; the guidance test rewritten to
behavior-skeleton assertions for the same promises; one contract test that
reads the fenced record example from finish-or-stop and checks the reader's
answer.

Excluded: any change to the record form, guidance behavior, card or detail
wording; folding `plan-execution-complete-detail.spec.ts` into
`taken-execution-complete.spec.ts` (small overlap, judged not worth a
correction); the two undiagnosed load-only failures noted in plan 094's
Learnings (no race evidence; the queued quiet, stable, fast test suite story
owns suite stability).

## Preserved promises and constraints

- Every existing plan-reader and completion unit case keeps its answer,
  including the fenced-quote case returning no completion.
- Unsupported slice layout is still `uninterpretable`, not an empty list.
- The ten guidance promises asserted today stay asserted.

## Outside-in proof

| Example | Slice | Observation |
| --- | --- | --- |
| Slice 1 quotes a fenced `## Execution complete`; slice 2 follows | 1 | Reader unit case: both slices interpreted, no completion |
| A slice quotes a fenced `### …` heading | 1 | Reader unit case: interpreted, slice count unchanged |
| A four-backtick fence contains a three-backtick line | 1 | Reader unit case: the fence ends only at a four-backtick line |
| Rewording a guidance sentence without changing behavior | 2 | Guidance test stays green (paraphrase sanity check during the slice) |
| finish-or-stop's record example | 2 | Contract test: `readPlanSlices` returns `completion.advice` |

## Current decisions

- **One line rule, one module.** Fence awareness is computed once per plan and
  used by every section and heading scan in
  `product-backlog-plan-reader.mjs`; the dashboard keeps projecting its answer
  unchanged (North Star "One backlog interpretation").
- **Contract test beside the reader.** The record-form contract test may live
  in `tests/support/product-backlog-plan-completion.test.mjs` or in the
  guidance test; either way it reads the example from `finish-or-stop.md`
  rather than copying it.

## Ordered slices

### 1. Plans that quote Markdown in fences keep every slice

Type: Behavior
Status: done
Proof: new cases in `tests/support/product-backlog-plan-reader.test.mjs` for a
fenced `## Execution complete` inside slice 1 with slice 2 following, a fenced
`### …` inside a slice, and a four-backtick fence containing a
three-backtick line, run with
`node --test tests/support/product-backlog-plan-reader.test.mjs tests/support/product-backlog-plan-completion.test.mjs`;
`/opt/homebrew/bin/bash tests/product-backlog.sh`; `npm run typecheck:dashboard`.

Behavior: a published plan whose slices quote Markdown headings in fenced
blocks → the reader interprets it → every slice is counted and the completion
record is read only from the plan's own section.

Accepted: `unfencedLines` in `product-backlog-plan-reader.mjs` is computed once
per plan and used by `readCompletion`, `sectionBounds`, the `### ` heading
scan, `readSlice` field detection, and `continuation`; a closer must be a bare
run of the opener's character at least as long. Observed by the parameterized
"readPlanSlices keeps every slice when a slice quotes …" cases (fenced
`## Execution complete`, fenced `### …`, four-backtick fence around a
three-backtick line) and "readPlanSlices keeps a slice's own Type and Status
when its Proof quotes fenced field lines", each failing before the fix.
`node --test tests/support/product-backlog-plan-reader.test.mjs tests/support/product-backlog-plan-completion.test.mjs`
14 pass; `/opt/homebrew/bin/bash tests/product-backlog.sh` 136 pass;
`npm run typecheck:dashboard` clean.

### 2. The completion-record guidance test checks behavior and the record contract

Type: Structure
Status: planned
Proof: `node --test src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs`
(plus the contract test's file when separate); a temporary rewording of one
sentence in `finish-or-stop.md` without behavior change keeps it green and is
reverted.

Structure: replace sentence regexes with keyword-skeleton assertions for the
same promises, drop the test-local fence rule if the contract test no longer
needs it, and add the contract test that parses the fenced record example
from `finish-or-stop.md#record-execution-completion` with `readPlanSlices`.

## Learnings

- Slice 1: fenced field lines (`Status:`, `Type:`) inside a slice broke the
  same promise as fenced headings, so the shared line rule also covers slice
  fields and the Proof/Accepted continuation break. A backtick opener whose
  info string contains a backtick is still treated as an opener (CommonMark
  edge, not seen in plans).
