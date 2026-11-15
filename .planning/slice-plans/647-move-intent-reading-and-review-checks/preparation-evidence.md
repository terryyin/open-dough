# Retained preparation evidence

## Existing solution and current decisions

PFE: reuse the static built app and explicit service routes in
`dashboard/tests/support/frontendApp.ts`, `frontendServiceSubstitutes.ts`,
`frontendAuthenticatedReadSubstitute.ts` and `frontendSubstituteAnswers.ts`.
They already supply locations, candidates, published files, Done catalogs and
bodies, held answers and a revision-check answer. Reuse `frontendStoryReview.ts`
with its schema-checked snapshot/range/diff/text/mark controls and
`frontendCompletedStoryAssociation.ts`; reuse MakeMe/described revision data.
Their default success is not proof of historical source judgment. Arrange the
correct published/live answers explicitly, and retain real source judgment
outside Frontend. A stream fulfilled by a route is not real SSE proof.

Existing production comparison mounts/bindings under
`dashboard/frontend-tests/intent/` and timing-history rendering specs retain
presentation proof without a server. Whole-app selection, focus and reading
lifetime must still operate the actual app. Reuse CI answer families delivered
by plan 633 at execution's current trunk; do not add parallel implementations.
When those are absent, use existing component mounts for isolated presentation
and existing E2E acquisition proof, adding only the service answers required by
an actual full-app interaction. Do not treat the authenticated-read backlog
fallback as a successful CI/history/comparison response.

Reuse real workflows in `e2e/intent/intent-{gherkin-browse,code-browse,
file-purpose-proof,story-changes,done-default-answer-selection,
done-retained-workspace,done-retained-landing,done-project-refresh,
read-boundary-recovery}.spec.ts` and their siblings only after inspecting their
assertions. Direct HTTP/refusal and upstream-count homes include
`dashboard/backend-tests/intent/authenticated-read-intent-locations.spec.ts`,
`intent-shared-reads.spec.ts` and the review/observation boundary suites.
Frontend request logs prove browser asks; GitHub logs at the real server prove
upstream calls. Preserve both when the old case observes both.

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for one coherent model and whole-product cohesion,
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for published versus local/historical source evidence and status delivery, and
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
for the stated gain in proof ownership without an unmeasured speed claim.
The [existing North Star](../../NORTH-STAR.md#dashboard-status-delivery) suffices;
no new architecture direction or ADR is needed.

Each conversion loop assigns original assertions, implements their maintained
homes, removes the converted source/duration rows and verifies those homes.
Shared answers follow service contracts rather than batch membership. Preserve
negative effects, absent content, exact counts, focus, keyboard, selected
source/revision, held failures, retries and reading position.

## Premises, observations and sizing review

Observed 2026-11-15 in this owned workspace at
`4df4b24298cf313bdbac952a5edd6421345f6f21`, with scratch changes reverted:

| Decisive premise / consuming operation | Result and unverified remainder |
| --- | --- |
| Current runner input: `npm run test:dashboard:integrated -- --list --reporter=line` | Exit 0; 230 tests / 113 files. Inspected partition: 35 CI Intent, 37 selected non-CI Intent / 5,547 lines, 41 navigation. Selection evidence only. |
| Purpose proof distinguishes target loss: `caffeinate -s -i npm run test:dashboard:integrated -- intent/intent-purpose-case.spec.ts --workers=1` | Baseline passed; scratch replace `resolveCaseTargetLine(text, caseTarget)` with `undefined` in `IntentFileReading.tsx` failed at `expectSourceTargetLine` (expected one target, got zero); restored run passed. New-home discrimination remains slice 1 work. |
| Built app/service substitutes reach actual recovery and Done controls: `caffeinate -s -i npm run test:dashboard:frontend -- intent-candidates-read-recovery.spec.ts stories/recently-done-review-state.spec.ts --workers=1` | Exit 0. Candidate rate-limit/manual Retry and Done review-state interactions passed in the static app without dashboardServer/FakeGitHub. This validates the harness route, not historical source judgment or every future answer. |
| Checkout-local runner dependencies | `npm ci` installed 183 locked packages; the runs above consumed this checkout's dependencies. Execution owns its own dependency setup. |
| New-family cost and source distribution | Retained `bfd4e7815:.planning/slice-plans/632-finish-dissolving-integrated-ui-test/PLAN.md` supplies the two-family overrun/one-family budget. Existing answers cover successful locations/files/candidates/review/Done; planned missing controls are failure/hold variants (2) and revision-keyed answers (6). All 37 sources are explicitly partitioned above; no 20-spec batch remains. |

Observation host: awake on AC; load 9.18/11.79/10.60, memory-pressure free
percentage 56%, no competing test command seen in the inspected process list.
Chose focused single-worker checks, sequenced browser observations; no broad
run. Execution rechecks current host conditions before expensive proof.
Expected edited shared support is 52–201 lines (Frontend app, state, routes,
authenticated-read, review and held-answer modules), below the 250-line check.
Keep new controls beside their owning contract; recheck actual expected edits
before implementation and settle cohesive reorganization for any oversized file.

Slice-plan refinement was not needed after construction: the provisional five
batches were replaced by these eight bounded loops, with explicit source and
proof ownership. Cumulative design reuses one service-boundary model and
preserves real judgment at the real boundary. Review identified no remaining
slice-specific concern; future overruns or missing CI-family assumptions trigger
reassessment rather than a broader implicit batch.
