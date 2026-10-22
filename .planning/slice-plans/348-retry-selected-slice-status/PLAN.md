# Retry delivery without advancing another slice's status

**Identity:** SEED-010#retry-selected-slice-status
**Source:** [Story 17](../../seeds/SEED-010-learn-from-execution-retrospectives.md#retry-selected-slice-status)

## Goal and scope

An executing agent retries a refused guarded fresh delivery with the same
request, and the plan ends with only the selected slice `done`. Guarded fresh
delivery of planned work marks the selected slice `done` itself, bounded to
that slice's section; the caller-authored `plan.update` command goes away.
The story's Scope and Key examples are the commitments.

Excluded, as the story defers: rollback of caller actions; retry safety for
generation, formatting or summary commands; quick work.

Assumptions: the coordinator's other plan evidence (accepted proof, learnings,
revised slices) is already in the working plan before invocation, as the plan
is an owned whole-file path; every executed plan is tracked at the execution
checkout's HEAD (it is committed by preparation landing before Take).

## Existing solution (PFE)

- `src/skills/dough-execute-plan/scripts/execution-increment-preparation.mjs`
  validates the preparation input (`inputRefusal`) and runs the ordered
  operations; `operation = "plan/status mutation"` currently runs the caller's
  `plan.update` command between the two obligation checks. The new status step
  replaces that command in place, keeping the order and both obligation checks.
- `src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs`
  `readPlanSlices` is the one slice reader (`## Ordered slices`/`## Slices`,
  `### N. name`, `Status: planned|done`, fenced lines ignored). It returns no
  line positions. Extend it to report each slice's status line position (or
  export the locator it already uses) rather than writing a second parser.
- `src/skills/dough-execute-plan/references/fresh-increment.md` documents the
  `plan` field and the operation order; it is a delivery-row passage counted
  by `read-budget-guidance.test.mjs`.
- Tests: `execution-increment-fresh.test.mjs` (context refusals, failed plan
  mutation, obligations before/after mutation) and
  `execution-increment-fresh-authorship.test.mjs` (operation order log
  `generation\nformatting\nplan update\nsummary\n`), both through `planned()` in
  `execution-increment-fresh-test-fixtures.mjs`, whose caller command flips
  slice 4 and appends accepted proof.

No ADR concern: this changes one helper's input contract inside the released
payload under ADR 0003; no new architecture.

## Decisive premises

- **Reader bounds a slice and skips fenced Status lines.** Consuming operation:
  `readPlanSlices`. Observation in this workspace (`node -e` over a plan whose
  slice 2 holds a fenced `Status: done` above its real `Status: planned`):
  slice 2 read `planned`; a duplicated `### 2.` heading returned two index-2
  slices (ambiguity is detectable); a plan without the section returned
  `uninterpretable`. Settled.
- **Only fresh-increment guidance and the fresh tests consume `plan.update`.**
  `grep` over `src/` for `plan/status`, `update:` and `--preparation-file`
  found no other producer; the one CLI producer is the coordinator following
  `fresh-increment.md`. Consumers are found by the slice's test run after the
  change (removed field refusal will surface any other fixture).
- **Focused proof route.** `env PATH="/opt/homebrew/bin:$PATH" bash
  scripts/test.sh src/skills/dough-execute-plan/scripts/execution-increment-fresh.test.mjs
  src/skills/dough-execute-plan/scripts/execution-increment-fresh-authorship.test.mjs
  src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs` exits 0
  quietly in ~7 s on this checkout (system `/bin/bash` 3.2 refuses; Bash 5 must
  lead `PATH`). Settled.

## Outside-in proof

Through `deliverFreshExecutionIncrement`/the `fresh` CLI with the existing
local fixture, `--authority local-only`:

1. Slice 4 `planned`, preparation `plan: {path, slice: 4}` plus a work edit
   that leaves a trailing blank line: result `preparation-failed`, operation
   `staged whitespace`, slice 4 reads `done`, slices 1–3 `planned`, nothing
   committed. Repair the blank line and repeat the same request: committed;
   the committed plan differs from the pre-attempt plan only in slice 4's
   status line plus the coordinator's own accepted-proof edit.
2. A fenced `Status:` line inside slice 4 stays unchanged.
3. `slice: 7` in a 1–4 plan, an unreadable layout, or a duplicated `### 4.`:
   operation `plan/status mutation`, reason names the slice, plan bytes
   unchanged, nothing staged or committed.
4. Slice 2 `done` in the working plan but `planned` at HEAD while delivering
   slice 4: refused naming slice 2 before staging.
5. A request still carrying `plan.update` refuses as `context` (the field is
   no longer accepted), so stale callers are told rather than silently ignored.
6. Existing obligation tests keep refusing before and after the status step,
   including when slice 4 already reads `done`.

Discrimination: with the idempotence branch disabled in a scratch edit, the
repeat in example 1 must fail; with the other-slice check disabled, example 4
must commit. Record both observations at acceptance.

Local gate: the focused route above. Because the slice changes the shared
plan reader used by backlog, obligations and dashboard reading, also run
`src/skills/dough-product-backlog/scripts/` and
`src/skills/dough-execute-plan/scripts/story-obligations*.test.mjs` through
the same runner before delivery.

## Ordered slices

### 1. Fresh delivery marks the selected slice done and repeats safely
Type: Behavior
Status: planned
Proof: outside-in examples 1–6 above through the fresh fixture; focused route
plus the plan-reader consumers' tests; the two discrimination observations.

Behavior: a planned fresh delivery request naming plan path and slice →
the helper sets only that slice's real `Status:` line to `done` (no change when
already `done`), refuses missing/ambiguous/unreadable targets and other newly
`done` slices before staging, and otherwise stages, checks and commits as
today; `fresh-increment.md` documents the `plan` field without `update`, states
that other plan evidence is the coordinator's prior owned edit, and keeps its
order description and repair example accurate within the delivery-row budget.

## Concerns

Slice-plan refinement was not needed: one cohesive Behavior with one proof
loop, no Structure preparation, sized as one fresh-helper change with its
guidance. This review identified no remaining slice-specific concerns.

At completion, record the actual response, proof, first containing release or
explicit unreleased status, and the next ordinary eligible-use observation at
[ODF-323](../../../docs/maintainer/findings/ODF-323.md), per the story's
Evaluation.
