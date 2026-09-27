# Execute a plan's slices in sequence

## Source

**Identity:** SEED-008#isolate-parallel-slice-delivery

[Story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#isolate-parallel-slice-delivery),
refined 2026-09-27. Findings ODF-128 to ODF-131; ODF-155 is out of scope.

## Goal and scope

Within one plan, slices execute one after another in plan order, each finishing
delivery before the next starts. Excluded: any opt-in for concurrent or
reordered slices, isolation machinery, parallel stories, ADR changes, native
host runs. Deleted behavior gets no replacement sentence saying it no longer
happens; state the positive default instead.

Keep `dough-execute-plan/SKILL.md` at or under 250 lines (it is at 250), so
each addition needs a matching cut.

## Decisive premises

| Premise | Observation (2026-09-27, `ae4a3082`) | Result |
| --- | --- | --- |
| Execution alone permits concurrent slices | `dough-execute-plan/SKILL.md:242-244` is the only permission; sweep of `src/**/*.md` for concurrent, parallel, wave, disjoint and sibling-slice wording finds nothing in slice planning, plan refinement or decomposition, which already speak of an ordered sequence | Holds; planning needs no change |
| Execution may also reorder | "next dependency-ready slice" at `SKILL.md:204` and `:215`, and "dependency-ready slice" at `references/execution-decisions.md:35,42` | Holds; replace with plan order |
| Concurrent-writer wording exists beyond the permission | `references/delegation.md:54-60` ("other agents may share the execution checkout"), `references/wrap-up.md:154-158` ("a sibling writer's work"), `scripts/shared-checkout-writers-guidance.test.mjs` | Holds |
| Those protections have independent reasons | The Git stash stack is shared across all worktrees; a separate-checkout baseline keeps the candidate intact; humans and other sessions can leave unowned staged content | Keep the protections, restate their reason |
| Focused proof runs locally | `node --test src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs`: 3 pass, 37 ms | Holds |

## Ordered slices

### 1. Execute a plan's slices one after another in plan order
Type: Behavior
Status: done

Behavior: a coordinator executing a plan whose unfinished slices touch
different files selects the first unfinished slice in plan order, delivers it
end to end, and only then starts the next from that result; its delegated
agent and delivery keep the stash, baseline and owned-staging protections for
reasons that hold without a concurrent slice.

In `SKILL.md`, replace the concurrency paragraph with the sequential default
(one sentence: slices run one at a time in plan order, each finishing delivery
before the next starts; a quick execution has one slice) and change both
"dependency-ready" selections to the next unfinished slice in plan order. In
`execution-decisions.md`, align the two "dependency-ready slice" mentions. In
`delegation.md`, replace "other agents may share the execution checkout" with
the independent reasons (the stash stack is shared across worktrees; unowned
work may be present). In `wrap-up.md` step 6, say "another writer's work"
instead of "a sibling writer's". Work inside one slice may still use parallel
helpers; say nothing about it.

Proof: update `shared-checkout-writers-guidance.test.mjs` (ADR 0005 section 2,
paraphrase-tolerant): add a case that `SKILL.md` selects the next unfinished
slice in plan order and completes its delivery before starting another; rename
the sibling-writer cases to other writers and keep their protection assertions.
Red first: the new case fails against the current `SKILL.md`. Then
`node --test src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs`
and `npm test`. Check `wc -l src/skills/dough-execute-plan/SKILL.md` ≤ 250.

Accepted proof (2026-09-27): red first, the new case "the coordinator runs the
next unfinished slice in plan order and delivers it before starting another"
failed against the old `SKILL.md` (1 fail, 3 pass); after the edits
`node --test src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs`
passed 4/4, `PATH=/opt/homebrew/bin:$PATH npm test` exited 0, and `SKILL.md` is
249 lines. The refactor pass only re-wrapped the test's header comment.

## Current decisions

- No opt-in for concurrent or reordered slices (Terry, 2026-09-27).
- ODF-155 remains open; wrap-up records on it that this story did not address it.

## Learnings

- `scripts/test.sh` needs Bash 5; on macOS run `npm test` with a modern bash
  first on `PATH` (for example `/opt/homebrew/bin`).
