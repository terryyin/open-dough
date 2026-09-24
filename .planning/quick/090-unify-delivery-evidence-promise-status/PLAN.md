# Recognize promise statuses once across delivery-evidence observers

Status: planned.

This bounded retrospective correction has this plan as its canonical home.

**Identity:** quick/090-unify-delivery-evidence-promise-status/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"89cbb8eb427cafbf646294b893cf93cabc394536cc4c96cf5f1b2de7032e3ef1"}}
```

## Source and provenance

Execution retrospective of
`SEED-004#accept-delivery-evidence-native` and its plan, recoverable at
`958680a:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
`958680a:.planning/quick/089-accept-delivery-evidence-native/PLAN.md`. Reviewed commits on
`claude/089-accept-delivery-evidence-native`: `eff3e76`, `c33dbea`, `0662ed2`,
`f7aee84`, `9353343`. That story's promises and results stand; this correction
changes no native acceptance result.

## Beneficiary and outcome

Maintainers who rerun native delivery-evidence acceptance get one place to
teach the harness a new way hosts write promise statuses, instead of patching
each case's observer separately.

## Current findings

- Each native slice in plan 089 lost at least one paid host run to an observer
  that missed a real status layout: bold and table statuses and
  `**X:** accepted` (selection), line-leading `**Accepted — Promise 1 …**`
  (claims, then again in consumers).
- Status recognition still lives in three forms:
  `delivery_evidence_selection_status_counts` in
  `tests/support/delivery-evidence-selection-native-observe.sh`, the shared
  `delivery_evidence_promise_status_pattern` in
  `tests/support/delivery-evidence-native-run.sh` (claims and consumers), and
  promise-name-anchored regexes in
  `tests/support/delivery-evidence-gaps-native-observe.sh`. The next layout
  requires coordinated edits in all three.
- The gaps observer has no credential-free observer counterexamples; selection
  has dedicated ones; claims and consumers check the observer only through
  their assessor counterexamples.

## Scope

One Structure correction in test support: a single recognizer of promise
status statements (status and the promise text it belongs to, across heading,
bold, dash, colon, table, and line-leading layouts) that all four observers use.
Each observer keeps only its domain rule on top: selection counts statuses
per promise, gaps anchors to its readiness/requeue and happy-path promises,
and claims and consumers read the single promise.

Excluded: guidance under `src/`, assessors' verdict rules, agent-visible
fixtures and prompts, and native reruns. Two agent-visible fixture leftovers
stay for the next native rerun of their case and are not part of this
correction: the selection zero-test fixture's unused `readOverview`, and the
gaps sufficient-reused return's stale "Setup: none".

## Preserved promises and constraints

- Every existing credential-free counterexample keeps its verdict.
- Generated native fixture workspaces stay byte-identical for every scenario
  of all four cases.
- A leading incomplete status still wins over later accepted words; incidental
  uses of "accepted" or gap words in obtained-proof accounts still do not
  count; gaps still attributes status to the named promise, not to any line.

## Ordered slices

### 1. Promise statuses are recognized once for every delivery-evidence case

Type: Structure
Status: done

Change: replace the three recognizers with one shared recognizer and route the
selection, claims, consumers, and gaps observers through it, keeping each
case's domain rule. Removes the parallel status-layout knowledge found above.

Proof: `bash tests/git-publication-native.sh` with Bash 4+ (credential-free)
passes, and its observer counterexamples cover, for all four cases, the real
host layouts recorded in plan 089: heading `## Promise 1 — …: INCOMPLETE`,
`**X: accepted.**`, `| accepted |` table cells, line-leading
`**Accepted — Promise 1 …**`, and a leading `Incomplete — …` followed by
later accepted words. New gaps observer counterexamples prove per-promise
attribution. An offline populate-and-`diff -r` of each case's scenarios
before and after shows identical fixtures. `npm run format` passes.

Accepted proof (credential-free, Bash 5): `/opt/homebrew/bin/bash
tests/git-publication-native.sh` exits 0 with 11 PASS, including
`run_delivery_evidence_observer_layout_counterexamples` (five host layouts ×
four cases, in `tests/support/delivery-evidence-promise-status.sh`) and
`run_delivery_evidence_gaps_observer_counterexamples` (same-line, heading
`Status:`, table, promise-2-names-readiness, and incidental attribution, in
`tests/support/delivery-evidence-gaps-native-promise-attribution.sh`). Against
the old observers the layout matrix failed 6 of 20 cells and the gaps
examples failed `same-line` and `incidental`. An offline populate of all
twelve scenarios with pinned Git dates, diffed with `diff -r` before and
after, was identical. `npm run format` and `npm run lint` pass.

## Execution

Story Branch Mode. Execution checkout
`../open-dough-worktrees/090-unify-delivery-evidence-promise-status` on
branch `claude/090-unify-delivery-evidence-promise-status`; claim
`42569563` accepted on `origin/main` (unobserved by CI). CI source: GitHub
Actions `ci.yml` / `CI`.

## Current decisions

- No native session is needed: the change is observer-side only and the
  fixtures stay byte-identical.
- Open human decision carried from the source execution, not decided by this
  correction: Cursor's delivery-evidence acceptance predates fixture changes
  in all four cases (sufficient and forbidden sides). ADR 0005 §5 asks that
  reuse be established for current fixtures, while the source story said
  Cursor needs no new sessions unless the guidance changes. Choose between a
  Cursor rerun of the four cases and a recorded reuse justification.

## Learnings

- The shared recognizer is `delivery_evidence_promise_statuses` (prints
  `STATUS<TAB>PROMISE`); the "all promises accepted" summary is shared as
  `delivery_evidence_all_promises_accepted`. A new host layout is taught
  there once.
- Offline fixture comparison needs `GIT_AUTHOR_DATE` and
  `GIT_COMMITTER_DATE` pinned, or commit hashes differ on every populate.
- The queued startup operation cannot take a correction whose plan is its
  own canonical home: it derives that plan as a plan link and the Take
  refuses the duplicate link. This execution built the claim with
  `take --no-plan` and published it through the startup resume path.
- Out of scope and unfixed: the 27 `! delivery_evidence_*_assess …` reject
  counterexamples in the four `*-assess.sh` files can never fail under
  `set -e`, because Bash ignores `set -e` for a `!`-negated command.
