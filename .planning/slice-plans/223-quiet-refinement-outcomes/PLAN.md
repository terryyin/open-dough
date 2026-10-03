# Finish refinement quietly with a clear next step

**Identity:** SEED-085#quiet-refinement-outcomes
**Source:** [refined story](../../seeds/SEED-085-quiet-refinement-outcomes.md#quiet-refinement-outcomes).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace.

## Goal and boundaries

Every Story Refinement session ends each selected story with exactly one
outcome: **Ready for slice planning**, **Flawless — ready for execution**, or
**Needs human engagement**. A ready outcome gives the story link, where the
draft is, and one next step. It does not recap the seed or end with a question.
A needs-engagement outcome lists each expected response, who decides it, a
recommended answer when there is one, and what continues afterwards. This
applies to ordinary and one-shot refinement, direct and dashboard-started.

Unchanged: ordinary refinement leaves its draft uncommitted, and one-shot
refinement commits it. Recorded facts stay `refined` with an unselected
approach. “Flawless” grants no planless authority and records neither `ready`
nor `planless`.

Excluded, as the story defers: a dashboard-visible flawless state or new
story-state value, automatic dashboard session Done for refinement sessions,
changes to slice planning and slice-plan refinement reports, and automatic
continuation into planning or execution.

## Direction and PFE

- Extend the existing report step. Story Refinement's
  [SKILL.md](../../../src/skills/dough-story-refinement/SKILL.md) "Refine and
  report" points at
  [planning.md](../../../src/skills/dough-story-refinement/references/planning.md),
  which owns the conversation and scope rules. Add the outcome rule there as one
  section and link it from the report sentence. Do not add a new reference
  file: `install.sh` `managed_files` already declares `SKILL.md`, `planning.md`
  and `one-shot-refinement.md`, but a new file would need maintainer promotion
  (ADR 0003).
- Flawless reuses existing rules and defines no new criteria:
  [slice sizing](../../../src/skills/dough-story-decomposition/references/problem-decomposition.md#size-and-escalate-slices)
  for one planless slice, the decisive-premise rule in slice planning, and
  [planless authority](../../../src/skills/dough-product-backlog/references/record-preparation.md#planless-authority).
  Readiness recording stays unchanged.
- One-shot refinement's "Stop for review" and "Land automatically when
  selected" report the same outcome. They do not define it again.
- Accepted ADRs
  [0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  (Proposed edits stay in declared files) and
  [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  (guidance is addressed to the refining agent, without maintainer
  vocabulary). No ADR conflict.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Ordinary refinement's only final-report instruction is SKILL.md "Refine and report" | Slice 1 | `grep -rn "unresolved decisions" src/skills/dough-story-refinement` | Confirmed. `SKILL.md:72` and `one-shot-refinement.md:100` only. `established-preparation.md` has no report text. The disposition reference only requires stating the pending disposition, which a ready outcome keeps. |
| One-shot has its own report in "Stop for review", and auto-land stops when a decision remains open | Slice 2 | Read `one-shot-refinement.md:93-125` | Confirmed. |
| No existing test pins the current report wording | Slices 1, 2 | `grep -rn -e "material constraints" -e "Stop for review" -e "unresolved decisions" src tests scripts dashboard/tests`, excluding `.md` | Only `one-shot-refinement-guidance.test.mjs:50,71`. They select the "Stop for review" section and assert unchanged facts (nothing pushed or retired, no Preparing assignment, Unless automatic landing was selected). Slice 2 keeps those sentences. |
| The full suite runs a new guidance test, and it is fast | Slices 1, 2 | `tests/node-test-files:3` globs `src/skills/*/scripts/*.test.mjs`. Ran `node --test src/skills/dough-story-refinement/scripts/one-shot-refinement-guidance.test.mjs …/established-preparation-guidance.test.mjs` | 11 passed in 36 ms. `PATH=/opt/homebrew/bin:$PATH npm test -- <file>` exits 0. Plain `/bin/bash` 3.2 refuses to run it. |
| The edited files are in the declared payload | Slices 1, 2 | `grep -n dough-story-refinement install.sh` | Confirmed: lines 92–96 list `SKILL.md`, `one-shot-refinement.md` and `planning.md`. |

## Outside-in proof

The skill's runtime behavior is guidance text. A new
`src/skills/dough-story-refinement/scripts/refinement-outcome-guidance.test.mjs`,
in the style of `one-shot-refinement-guidance.test.mjs` (`markdownSection` plus
regex), pins each promise in the section that owns it. AGENTS.md's behavior
review walks key examples 1–3 through the edited guidance and is recorded in
this plan. No paid native run is planned; native checks remain manual.

Local gate: the focused test files listed in each slice, then
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-story-refinement/scripts`
because existing refinement guidance tests read the same files. Run
`npm run lint` for formatting. CI runs the full suite after publication.

## Slices

### 1. Ordinary refinement ends with one of three outcomes

Type: Behavior
Status: planned
Proof: `refinement-outcome-guidance.test.mjs` asserts the planning.md outcome
section and the SKILL.md link. Behavior review walks key examples 1 (ready for
slice planning, uncommitted, no question), 2 (flawless with the skip-planning
command, state still unselected) and 3 (open decision listed with a
recommendation). Then the local gate.

Behavior: a developer refines a story (direct or with an established
preparation) → the report ends with exactly one outcome per story:
- **Ready for slice planning** or **Flawless — ready for execution** gives the
  story link, the uncommitted draft's workspace, and one next step, without a
  recap or closing question. The pending draft and any Preparing assignment
  are stated as information, not as a keep prompt.
- **Needs human engagement** lists each response: what, who decides, the
  recommended answer, and what continues afterwards. It covers open
  goal/scope/constraint decisions, boundary changes (split, merge, drop),
  missing context, and stopped writes, recordings or landings.

The section defines flawless by reference to slice sizing, decisive premises
and planless authority, and states that flawless records neither `ready` nor
`planless`. Update the SKILL.md report sentence ("Report the story links,
material constraints and deferred promises, and unresolved decisions") to
point at the section, keeping the keep/discard and workspace close/retain
clause. Several stories get one outcome each.

### 2. One-shot refinement reports the same outcome

Type: Behavior
Status: planned
Proof: extend `refinement-outcome-guidance.test.mjs` for one-shot's "Stop for
review" and "Land automatically when selected". The existing assertions in
`one-shot-refinement-guidance.test.mjs` stay green unchanged. Behavior review
walks key example 5 (auto-land with an open decision stays committed and
unlanded, outcome Needs human engagement). Then the local gate.

Behavior: a one-shot refinement in review mode → reports the planning.md
outcome together with the existing review facts: workspace, branch,
`startingRevision`, result commit, recorded facts, and not visible on trunk.
Auto-land lands only on a ready outcome and reports it as landed with the next
step. An open decision or a stop ends as Needs human engagement with the
result committed and unlanded, as today.

## Current decisions

- One section in `planning.md`, with no new reference file (payload
  declaration above).
- Reporting only: no recorder, story-state, dashboard or script change.

## Learnings

None yet.
