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
Status: done
Proof: outside-in examples 1–6 above through the fresh fixture; focused route
plus the plan-reader consumers' tests; the two discrimination observations.
Accepted: source-only review (fresh agent, story text only) returned C1–C27
and exclusions E1–E7; every commitment maps to product and observation.
`execution-increment-fresh-slice-status.test.mjs` covers examples 1–5 (retry
after `staged whitespace` commits only slice 4 done plus the coordinator's
accepted-proof edit; fenced `Status:` untouched; slice 7, unreadable layout,
duplicated `### 4.` refuse as `plan/status mutation` with plan bytes,
index and HEAD unchanged; newly done slice 2 refuses naming it; `plan.update`
refuses as `context`). `execution-increment-fresh.test.mjs` "planned
obligations refuse before the status step, also when already done, and after
it before commit" covers example 6; authorship test's order log is
`generation\nformatting\nsummary\n`. Setup: `planned()` commits the plan at
HEAD (`--no-verify`) then writes the accepted-proof edit. Discrimination:
throwing on an already-done slice failed example 1's retry (code 1 vs 0);
disabling the other-slice check let example 4 commit (code 0 vs 1). Status
step lives in `selected-slice-status.mjs`; reader exposes
`locatePlanSliceStatuses`, `readPlanSlices` output unchanged. Commands, all
exit 0 on the final tree: `env PATH="/opt/homebrew/bin:$PATH" bash
scripts/test.sh` over execute-plan `story-obligations*`,
`execution-increment-fresh*`, `execution-completion-record-guidance`,
`read-budget-guidance` tests and `tests/support/product-backlog-*`,
`story-state*` (71 files); payload/install shell tests
(`install-public-payload`, `product-backlog-payload-update`,
`payload-declaration-links`, `install-omits-internal`, `update-*`,
`retrospective-reference-payload`, `pin-and-inspect`,
`install-preserves-open-dough-json`, `dough-update-guidance-payload`);
`npx tsc --build dashboard/tsconfig.json`; `npm run build:dashboard`.

Behavior: a planned fresh delivery request naming plan path and slice →
the helper sets only that slice's real `Status:` line to `done` (no change when
already `done`), refuses missing/ambiguous/unreadable targets and other newly
`done` slices before staging, and otherwise stages, checks and commits as
today; `fresh-increment.md` documents the `plan` field without `update`, states
that other plan evidence is the coordinator's prior owned edit, and keeps its
order description and repair example accurate within the delivery-row budget.

## Story obligations

### G1. A CI repair must name an already done slice
Reported: slice 1 — "A planned owned repair must therefore name the already-done slice it repairs, not the interrupted in-progress slice."
Story clause: "An executing agent can retry a refused fresh delivery without changing another slice's status or asking the developer to repair the plan."
Disposition: no user cost "An executing agent can retry a refused fresh delivery without changing another slice's status": an owned CI failure is on a revision this execution registered after publication; every increment publication carries its slice's done status, so a repair names that done slice and changes no status (`wrap-up.md` step 5). The only earlier registered revision, a Trunk Mode claim, is the start operation's backlog Take, not slice work delivered through fresh preparation.

### G2. Status rewrite normalizes mixed line endings
Reported: slice 1 — "a plan with mixed CRLF/LF line endings would be normalised to the dominant style when its status changes. This is not tested."
Story clause: "Reuse the existing plan slice reader, obligation checks, staging, commit and publication; add no second plan representation."
Disposition: no user cost "An executing agent can retry a refused fresh delivery without changing another slice's status": the rewrite uses the backlog's existing `splitSource`/`joinSource` line handling that other plan and backlog writers already apply; slice statuses and content are unchanged, only an inconsistent line ending style is unified.

## Concerns

Slice-plan refinement was not needed: one cohesive Behavior with one proof
loop, no Structure preparation, sized as one fresh-helper change with its
guidance. This review identified no remaining slice-specific concerns.

At completion, record the actual response, proof, first containing release or
explicit unreleased status, and the next ordinary eligible-use observation at
[ODF-323](../../../docs/maintainer/findings/ODF-323.md), per the story's
Evaluation.

## Execution complete

Product advice: no new product work. The response matches the near-future
direction of closing improvement loops with existing evidence. ODF-323 stays
open until a release carries the self-marking delivery and an ordinary
eligible retry is observed; until then installed copies still take a
caller-written `plan.update`. Story 18 remains the next queued item.
