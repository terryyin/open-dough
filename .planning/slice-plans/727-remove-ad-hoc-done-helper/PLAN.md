# Mark ad hoc sessions Done in their own cases

**Identity:** SEED-413#remove-ad-hoc-done-helper
**Source:** [Mark ad hoc sessions Done in their own cases](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#remove-ad-hoc-done-helper)

## Source and provenance

This plan corrects a completed execution.

- **Story:** `SEED-413#refuse-story-launch-session-file-reads`, plan 726,
  recoverable from the story branch
  `claude/direct-story-launch-file-reads-to-their-story` at `454ce2e80`.
- **Manifest:** `39baced58`, the slice 1 increment. Its local broad gate failed
  at load 28–40. The cause was `markAdHocDone`, which posted Done for a
  session the fake Claude listed busy, so every mark waited out the 5 s
  manual rename wait (`dashboard/server/hosts/claude/rename.ts`
  `defaultRenameWaitMs.manual`). The repair added
  `dashboard.claudeSessionBecomes(session, "done-live")` to the helper. The
  10 consumer specs dropped from 333 s to 147 s summed test time, and every
  case still passed.
- **Direction:** [North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  says that, outside data builders and page objects, changes to test support
  may only remove code. Adding that line to the `adHocReview.ts` helper went
  against it. The execution's retrospective found this during wrap-up.

## Goal and scope

Remove `markAdHocDone` from `dashboard/test-support/support/adHocReview.ts`.
Each consuming case lists its session finished with
`dashboard.claudeSessionBecomes(session, "done-live")` and then marks it Done
through `markDone` from `dashboard/test-support/agentLaunchBoundary.ts`,
asserting the 200 answer as the helper did. Keep every case's inputs,
expected outcomes and current speed. Add no new test-support code.

Exclusions: other Done helpers, such as `sessionCheckoutWork.markDone`, and
the fake Claude fixture stay unchanged. Plan 726's product advice holds an
unmeasured hypothesis about `sessionCheckoutWork`. It needs its own
measurement before any work.

## Current decisions

- Write the two calls at each call site rather than keep any shared step,
  so each case shows the session finishing before Done. When a case already
  changes the listing before Done, keep its own listing change and drop the
  duplicate.
- A case that needs Done on a busy session uses `markDone` directly with its
  own listing, as `sessions/` rename-wait specs do. Plan 726's run showed no
  current consumer needs that.

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| Every consumer passes when its sessions are listed `done-live` before Done | Plan 726 `d2-after` ran the 10 consumer specs with that order through the helper: 30 of 30 passed at load 14–15. Recorded in the story branch's diagnosis record at `454ce2e80`. |
| Consumers | `grep -rn "markAdHocDone(" dashboard/backend-tests` at `454ce2e80` lists 25 calls in 9 specs. `review/ad-hoc-branch-attribution.spec.ts` (5), `review/ad-hoc-branch-result.spec.ts` (5), `review/ad-hoc-manual-landing.spec.ts` (5), `launches/agent-launch-session-branch-landing.spec.ts` (2), `review/ad-hoc-manual-landing-observation-retry.spec.ts` (2), `review/ad-hoc-manual-landing-observation.spec.ts` (2), `review/ad-hoc-manual-landing-precedence.spec.ts` (2), `review/ad-hoc-manual-landing-observation-lifecycle.spec.ts` (1), `review/ad-hoc-session-comparisons.spec.ts` (1). |

## Ordered slices

### 1. Each ad hoc case marks its finished session Done itself

Type: Structure
Status: planned

Inline the helper at all 25 call sites, then delete `markAdHocDone` and its
comment from `adHocReview.ts`. No test-support line is added.

| Promise | Slice 1 proof |
| --- | --- |
| No consumer remains and the helper is gone | `grep -rn markAdHocDone dashboard` finds nothing. The `adHocReview.ts` diff only removes lines. |
| Every consumer keeps its behavior and speed | Run the 9 consumer specs with `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD`. All pass, and per-case durations match plan 726's `d2-after` within load variation; record the load. |
| Types and lint hold | `npm run typecheck:dashboard` and `npm run lint`. |

## Local gates

Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) selection
before test edits. Run `npm run test:dashboard:backend -- <the 9 specs>` with
Homebrew Bash 5, with `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset. On AC, run it under
`caffeinate -s -i` per
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default test timeouts.

## Plan review

Slice-plan refinement was not needed. The work is one mechanical Structure
change across 9 specs with one proof run, well within the 15-minute budget.
This review found no remaining slice-specific concern.
