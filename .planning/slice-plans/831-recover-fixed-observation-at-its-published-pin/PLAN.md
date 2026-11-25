# Recover a fixed observation at its published pin

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#recover-fixed-observation-at-its-published-pin)

**Identity:** SEED-430#recover-fixed-observation-at-its-published-pin

## Source and provenance

Retrospective correction of
SEED-430#open-published-board-from-local-git (`548a3814652df8782da71457ac3acffd973a2f08:.planning/seeds/SEED-430-read-published-project-data-from-local-git.md`),
plan 824 (`548a3814652df8782da71457ac3acffd973a2f08:.planning/slice-plans/824-open-published-board-from-local-git/PLAN.md`), executed from Take `f4e55eeb5` through `851fc01` on branch
`claude/publish-fixed-board-test-fixtures-through-real-g`. Its slice 6
(`851fc01`) moved the authenticated observation journey to real commits.
Its contract kept fixed publications with this owner and a publication that
moves the same trunk with the moving story.

## Goal and scope

Maintain browser coverage for recovery when access returns to the same
Doughnut publication. Correct the existing fixture journey and the two
pieces of fixture residue below. The moving-publication journeys and the
production Dashboard reader are outside this correction's scope.

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

The [shared published Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
direction uses the configured origin as the authority and holds details at
the observed pin. This test keeps REST and routed Git on the same publication
through recovery. The [test support direction](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
and [test runner direction](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
apply here. Keep the browser test at the production preview-server boundary
and reuse the existing fixture and page objects.

## Current decisions

- Reuse the previous answerer returned by `github.serve` when installing
  `notLoggedIn`. It carries the original publication's origin and request
  observer. Re-serve it for recovery and check the route with the existing
  `expectServedHomesReach` helper. Keep the SHA from the initial publication
  as the expected revision for the browser and the routed Git ref.
- Keep `revisionA` local to `takenAgentProfileRecords.ts`. The file still
  passes the value to `describedRevision`.

## Decisive premises

Observed in the owned preparation worktree at `ed65a5916b9a` on
macOS with Node 24.21.0, the fixture's built preview server, fake `gh`,
and Chromium. Origin main's subsequent advance to `a5a980624` changed the
backlog and an assignment profile only.

| Premise and consuming operation | Observation and result |
| --- | --- |
| The current recovery assertion accepts a moved pin. The browser reload can distinguish a moved pin from the originally displayed one. | The focused browser command below passed on the base (4 cases, 24.2 s). A scratch edit kept republication and expected the original pin in the recovery step. Running the same invocation with only the authenticated observation spec selected failed at the browser revision assertion, expected `4175eed`, displayed `84adb89`. |
| The replaced answerer still serves the original publication when restored. The failure remains actionable and Git resolves the same pin during failure and recovery. | A scratch edit returned the previous answerer from the login-failure step, re-served it on recovery, and checked the full pin with `expectServedHomesReach` under the registered dashboard HOME in both steps. The original browser revision, recovered membership, cleared error, existing pinned reads and credential checks passed (4 cases, 25.2 s for the focused command). |
| The abandoned export can go while preserving the existing profile data, and the Recently done comment describes commit identity rather than data differences. | The trace found the Taken profile spec as the only source importing that fixture, with no import of its `revisionA`. Keeping the value private passed the Taken profile case in the scratch run and `npm run typecheck:dashboard`. The Recently done cases passed with the existing fixture. The comment change affects prose only. |

Scratch code was reverted. These observations establish the approach and
proof route. Slice 1 owns verification of the delivered change.

## Ordered slices

### 1. Show restored access at the already-read revision

Type: Structure
Status: planned

Change: In the existing authenticated observation scenario, retain the
original Doughnut answerer when installing the login failure and restore it
before reloading. Correct the rationale comment in
`recentlyDoneReadFailures.ts` and make the unused export private.

Proof owned by slice 1:

| Promise | Observation |
| --- | --- |
| Real Git trunk and recovered Board agree with the original pin | The initial publication routes and verifies the full SHA. At refusal and restoration, `expectServedHomesReach` queries `refs/heads/main` through each served HOME and compares with that initial SHA. After reload, the Board shows that revision and the original Taken and queued stories. |
| Refusal and other Board read boundaries remain covered | The full scenario observes the login error and no cards during refusal, no error on recovery, and keeps the existing per-project ref and pinned content checks, blob links, reloads and browser credential checks. |
| Fixture cleanup preserves its callers | The Taken profile case publishes and renders the same profile data. The Recently done cases still observe record and catalog outcomes. Dashboard typecheck checks the static boundary. |

Run the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
on the final uncommitted change. Preparation traced the authenticated
observation recovery step and the two fixture modules. Other `revisionA`
matches refer to separate fixtures or unrelated symbols. Backend specs
that cite the browser scenario exercise separate fake GitHub instances.
The reference in the Board fixture audit describes the scenario.

Budget 6 active minutes. One Structure slice is sufficient for the
test-proof correction and its fixture residue. No further slice-plan
refinement or slice-specific concern remains after the observed recovery
and consumer checks.

## Local gate

Run the focused browser journeys and Dashboard typecheck:

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/authenticated-project-observation.spec.ts e2e/stories/recently-done-stories.spec.ts e2e/stories/taken-agent-profile.spec.ts --workers=1 --reporter=line
npm run typecheck:dashboard
```

Run long checks under [`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).
