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
refinement commits it. Recorded facts stay `refined`; preserve any existing
selected approach and plan association, otherwise leave the approach
unselected. “Flawless” grants no planless authority. Reporting an outcome does
not create or renew `ready` or select `planless`; the existing preparation
review procedure still owns assessment of the current story and any plan.

Excluded, as the story defers: a dashboard-visible flawless state or new
story-state value, automatic dashboard session Done for refinement sessions,
changes to slice planning and slice-plan refinement reports, and automatic
continuation into planning or execution.

## Direction and PFE

- Extend the existing report step. Story Refinement's
  [SKILL.md](../../../src/skills/dough-story-refinement/SKILL.md) "Refine and
  report" owns the report sentence. The outcome rule is one section,
  "Report the refinement outcome", directly after it in SKILL.md (moved from
  planning.md during Slice 1's refactor; see Learnings). Do not add a new
  reference file: `install.sh` `managed_files` already declares `SKILL.md`, `planning.md`
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
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-story-refinement/scripts/*.test.mjs`
because existing refinement guidance tests read the same files. Run
`npm run lint` for formatting. CI runs the full suite after publication.

## Slices

### 1. Ordinary refinement ends with one of three outcomes

Type: Behavior
Status: done
Proof: `refinement-outcome-guidance.test.mjs` asserts the SKILL.md outcome
section and the report sentence's link to it. Behavior review walks key examples 1 (ready for
slice planning, uncommitted, no question), 2 (flawless with the skip-planning
command, state still unselected) and 3 (open decision listed with a
recommendation). Then the local gate.

Also walk examples 7–9: an existing plan stays associated and supplies the next
step; missing context before a seed write produces engagement without claiming
a recorded refinement; mixed stories retain independent outcomes. Pin these
reporting promises in the same focused guidance test without adding recorder
or dashboard behavior.

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
and planless authority, preserves existing approaches and plan associations,
and separates its reported outcome from assessment under the unchanged
preparation review procedure. It claims no completed seed write when context
is missing and gives each story an independent outcome. Update the SKILL.md
report sentence ("Report the story links,
material constraints and deferred promises, and unresolved decisions") to
point at the section, keeping the keep/discard and workspace close/retain
clause. Several stories get one outcome each.

Accepted proof: `PATH=/opt/homebrew/bin:$PATH npm test --
src/skills/dough-story-refinement/scripts/refinement-outcome-guidance.test.mjs
src/skills/dough-story-refinement/scripts/one-shot-refinement-guidance.test.mjs
src/skills/dough-story-refinement/scripts/established-preparation-guidance.test.mjs
src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs`
exits 0; six tests observe `markdownSection(SKILL.md, "## Report the refinement
outcome")` and the "Refine and report" sentence. All
`src/skills/dough-story-refinement/scripts/*.test.mjs` pass. Behavior review
walked examples 1, 2, 3, 7, 8 and 9 through the edited guidance; each yields
its intended outcome.

### 2. One-shot refinement reports the same outcome

Type: Behavior
Status: planned
Proof: extend `refinement-outcome-guidance.test.mjs` for one-shot's "Stop for
review" and "Land automatically when selected". The existing assertions in
`one-shot-refinement-guidance.test.mjs` stay green unchanged. Behavior review
walks key example 5 (auto-land with an open decision stays committed and
unlanded, outcome Needs human engagement). Then the local gate.

Behavior: a one-shot refinement in review mode → reports the SKILL.md
outcome (`../SKILL.md#report-the-refinement-outcome`) together with the existing review facts: workspace, branch,
`startingRevision`, result commit, recorded facts, and not visible on trunk.
Auto-land lands only on a ready outcome and reports it as landed with the next
step. An open decision or a stop ends as Needs human engagement with the
result committed and unlanded, as today.

## Current decisions

- One section in `SKILL.md`, with no new reference file (payload
  declaration above).
- Reporting only: no recorder, story-state, dashboard or script change.

## Learnings

- Slice 1: the outcome section took `planning.md` to 275 lines, over the
  refactor pass's 250-line limit. It moved, unchanged, into SKILL.md (118
  lines), which already owns the report step and is a declared file.
- `npm test` accepts files, not a directory; the local gate uses a glob.
