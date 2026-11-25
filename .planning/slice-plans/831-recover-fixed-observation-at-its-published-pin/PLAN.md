# Recover a fixed observation at its published pin

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#recover-fixed-observation-at-its-published-pin)

**Identity:** SEED-430#recover-fixed-observation-at-its-published-pin

## Source and provenance

Retrospective correction of
[SEED-430#open-published-board-from-local-git](../../seeds/SEED-430-read-published-project-data-from-local-git.md#open-published-board-from-local-git),
plan 824, executed from Take `f4e55eeb5` through `851fc01` on branch
`claude/publish-fixed-board-test-fixtures-through-real-g`. Its slice 6
(`851fc01`) moved the authenticated observation journey to real commits.
Its contract kept fixed publications with this owner and a publication that
moves the same trunk with the moving story.

## Findings

- `commitPublishedOrigin`
  ([publishedOrigin.ts](../../../dashboard/test-support/support/publishedOrigin.ts))
  numbers each fixture commit message, so publishing identical files again
  makes a new revision. Slice 6 accepted the opposite premise.
- In
  [authenticated-project-observation.spec.ts](../../../e2e/observation/authenticated-project-observation.spec.ts),
  the step "after access is restored, reloading shows the selected
  project's published work" calls `publishCommittedFiles` again for
  Doughnut and asserts the new revision. Before the execution it re-served
  the same revision the Board had read. The step now proves recovery at a
  moved trunk, so a regression that keeps a stale failure for the
  already-read revision would pass.
- [recentlyDoneReadFailures.ts](../../../dashboard/test-support/recentlyDoneReadFailures.ts)
  explains distinct revisions by distinct files; the commit counter is the
  actual reason.
- [takenAgentProfileRecords.ts](../../../dashboard/test-support/takenAgentProfileRecords.ts)
  still exports `revisionA`, which nothing imports since slice 1.

## Preserved promises and constraints

Keep every fixed publication on a real commit whose revision every served
HOME reaches. Keep the not-logged-in failure as the REST answer of the step
that exercises it. Keep the journey's other steps, pinned `gh` calls and
blob links unchanged.

## Current decisions

- Restore the Doughnut answerer that `github.serve` replaced with
  `notLoggedIn`; `serve` returns the replaced answerer. Do not publish again.
- Assert the restored step against the Doughnut revision the earlier steps
  read.

## Ordered slices

### 1. Show restored access at the already-read revision

Type: Structure
Status: planned

Change: In the restored-access step, re-serve the retained Doughnut
answerer and assert the revision the Board showed before the failure.
Correct the rationale comment in `recentlyDoneReadFailures.ts` and remove
the unused `revisionA` export.

Proof: Run `authenticated-project-observation.spec.ts` and
`taken-agent-profile.spec.ts`; Dashboard typecheck. Observe that the
restored step's shown revision and routed trunk equal the pin from the
first Doughnut read. Budget 6 active minutes.

## Local gate

Run focused checks and Dashboard typecheck for each changed boundary.
Run long checks under [`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).
