# Restate the CI pause's preservation for sequential slices

## Source

**Identity:** SEED-008#restate-ci-pause-ownership

[Correction story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#restate-ci-pause-ownership)
from the execution retrospective of
"Execute a plan's slices in sequence" (SEED-008#isolate-parallel-slice-delivery;
story `.planning/seeds/SEED-008-worktree-branch-trunk-sync.md` and plan
`.planning/slice-plans/131-execute-slices-in-sequence/PLAN.md` at `92703196`;
implementation commit `1d3a26cd`, Take `cc9a60e0`).

## Goal and scope

The CI pause contract gives a paused agent the same preservation reason as
delegation: unowned work from humans or other sessions may be present in the
execution checkout. Keep the preservation duty itself. Excluded: other CI
repair steps, concurrent-slice opt-ins, native host runs. State the positive
reason; add no sentence saying agents no longer run concurrently.

## Decisive premises

| Premise | Observation (2026-09-27, `1d3a26cd`) | Result |
| --- | --- | --- |
| The pause contract still names concurrent agents | `src/skills/dough-execute-plan/references/ci-monitor.md:249`: "Preserve other agents' work in this execution checkout." | Holds |
| Delegation already states the sequential reason | `references/delegation.md` ownership bullet: "the Git stash stack is shared across all worktrees and that unowned work, from humans or other sessions, may be present in the checkout and must be preserved" | Holds; reuse its wording |
| No test covers the pause contract text | `grep -rn -E "pause-and-resume|PAUSED FOR CI|other agents' work|Pause and resume writers" src tests --include='*.mjs'` finds nothing | Holds; add a case |
| Focused proof runs locally | `node --test src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs`: 4 pass | Holds |

## Ordered slices

### 1. A paused agent preserves unowned work for the delegation's reason
Type: Behavior
Status: planned

Behavior: an implementation agent paused for a CI repair reads, in the pause
contract, that unowned work from humans or other sessions may be present in
the execution checkout and must be preserved, matching its delegation.

In `ci-monitor.md` "Pause and resume writers", replace "Preserve other agents'
work in this execution checkout." with that reason.

Proof: in `shared-checkout-writers-guidance.test.mjs` (ADR 0005 section 2,
paraphrase-tolerant), add a case reading the "Pause and resume writers"
section and asserting that unowned work from humans or other sessions is
preserved there. Red first against the current text. Then
`node --test src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs`
and `npm test` with Bash 5 on `PATH`.

## Current decisions

None yet.

## Learnings

None yet.
