# Move Intent reading and review checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-intent-reading-and-review-checks
**Source:** [Move Intent reading and review checks](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-intent-reading-and-review-checks)

## Goal and scope

Preserve every distinct assertion from the 37 non-CI Intent specs at its real
Frontend, Backend or representative E2E boundary. The seed owns goal, scope and
key examples. This is preparation only; no conversion slice has executed.
Keep navigation and runner retirement in [plan 648](../648-move-navigation-checks-and-retire-integrated-ui-test/PLAN.md)
and the remaining CI conversion in [plan 651](../651-move-intent-ci-proof-comparison-and-candidate-checks/PLAN.md).
The two `intent-ci-done-*` specs are part of this reading/review outcome.
No new tier, changed product behavior, E2E rename, tagged-install proof or
unmeasured timing/shard target. No start-blocking story dependency.

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

## Outside-in proof and local gates

Before deleting an old case, retain its assertion-by-assertion disposition to
named maintained cases, including reused cases and inspected setup/observation
locations. Counts and filenames alone do not establish preservation. A mixed
case may have several homes. Observe one representative scratch break at a
changed boundary in its old home before deletion and in its maintained home;
both must fail for the same promise and pass restored. The Purpose target
fault below supplies an observed old-side baseline for slice 1, not a claim
that the converted proof exists. Repeat at another boundary when that fault
cannot discriminate its promise. Revert all scratch edits before delivery.

For module moves, changed contracts and retired outputs, apply the
[consumer-trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Follow page objects, fixtures, exported helpers and registered source paths to
their observing journeys in all groups. Keep consumers, imports, registration
and proof documentation aligned; remove no shared helper still used elsewhere.

| Source promise / example | Owning slice and observable proof |
| --- | --- |
| Nested summaries, Gherkin/Java exact text, target case, grammar fallback / 4 | 1: real Frontend actions, text/line/target/scroll/style assertions; retained E2E source acquisition. |
| Unusable settings, timed/hidden recovery, failed source target / 3–4 | 2: controlled answer/clock transitions and exact browser asks; real Backend classification/upstream effects and E2E retry. |
| Story gaps, changes-only and no-text browsing / 1 | 3 and 8: changed-tree interaction, absent/failed explanations, real source judgment, exact request deltas. |
| CI cues, coverage, dark/narrow views, title and Review return / 1, 4 | 4: actual styles, keyboard, focus/scroll, distinct coverage states; Backend/E2E retains acquisition/source effects. |
| Done historical/live/captured modes, selection, refresh and local history / 2 | 5: held mode/source answers cannot leak old content; real server chooses source/run; refresh/retry preserves file, endpoints, tabs, history and reading. |
| Notice, planning/settings update, failure/held/retry, cross-project late answer / 3 | 6: real Frontend state transitions; representative real SSE/revision acquisition remains Backend/E2E. |
| Activation, project visits, sidebar and selected-story defaults / 4 | 7: actual controls, keyboard, selected scope, file column, reading place, notice and project isolation. |
| Reading reuse, selection races, per-project reading reset / 1, 4 | 8: actual selection and Purpose with exact browser asks/no-extra-text/diff counts. |
| All 37 dispositions; no converted interim cases or stale timing rows | Every slice removes only its sources/rows; 8 reconciles all sources and the current interim selection. |
| Shared support and remaining runner still usable | Every slice traces consumers and runs affected proof; 8 lists the remaining group without retiring it. |

Local gates: focused maintained cases via `npm run test:dashboard:frontend -- <paths>`,
`npm run test:dashboard:backend -- <paths>` and/or `npm run test:e2e -- <paths>`;
`npm run lint` and `npm run typecheck:dashboard` for changed TypeScript.
Run the covering focused suite and affected shared consumers when the change
reaches their behavior; CI alone does not make every group a local gate.
Select [MakeMe and browser page objects](../../../AGENTS.md#test-automation)
for the actual destination before writing tests. No `test.slow()`; keep default
budgets, with no suite/file/group/hook timeout overrides. Apply the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written, including hosted failures after publication. Each slice owns
post-change refactoring and execution's delivery/CI gates.

The local gate uses the maintained macOS
[sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; on battery, plug in or keep the lid
open under `caffeinate -i`, then inspect the sleep log. Inspect host load,
memory and competing work before expensive proof. Full runs share admission
across worktrees; reduce concurrency without dropping cases when warranted.

## Ordered slices

Eight cohesive conversion loops replace provisional batches 1–5. Source
counts/lines below are at `4df4b24298cf313bdbac952a5edd6421345f6f21` and guide
sizing, not acceptance. Each slice has 15 active minutes excluding running
commands. Reuse source data and page objects; introduce at most one missing
service-answer family in a slice, with later variants using the same family.
The preceding conversion at `bfd4e7815` found that two new families overrun
and one costs most of that budget. If actual family or assertion work exceeds
this estimate, apply sizing/escalation before extending the batch; preserve
elapsed time and evidence. A second overrun requires story reassessment.

### 1. Preserve source browsing and recorded Purpose targets
Type: Behavior
Status: planned
Proof: six specs / 860 lines: `intent-code-browse-java`,
`intent-entry-folder-summaries`, `intent-entry-folder-summaries-folders`,
`intent-gherkin-groups`, `intent-gherkin-layout`, `intent-purpose-case`.
Behavior: open a location/folder, source or recorded case → the actual browser
keeps ordered summaries, exclusive/local group expansion, exact source/lines,
case target and scroll, light/dark highlighting and plain-text grammar fallback.
Reuse existing location/file/candidate substitutes and original fixture data;
no new response family. Retain acquisition at real Backend/E2E boundaries.
Reproduce the observed missing-target fault in the new Frontend Purpose case.

### 2. Preserve failed settings and source-read recovery
Type: Behavior
Status: planned
Proof: three specs / 526 lines: `intent-gherkin-settings-problems`,
`intent-read-recovery`, `intent-source-target-recovery`.
Behavior: locations or a targeted source read becomes malformed, unreachable,
rate-limited, held or failed → the same explanation, manual/timed Retry,
hidden-view suppression, revision-check continuation and prior reading survive.
Own only the missing controlled authenticated-read failure/hold variants,
using existing held-answer/clock primitives. Keep 15/30/60/60 timing and exact
request deltas. Backend proves settings classification/shared upstream reads;
E2E proves a real classified failure reaches the browser recovery path.

### 3. Preserve selected-story changed-tree reading
Type: Behavior
Status: planned
Proof: two specs / 443 lines: `intent-story-changes-gaps`,
`intent-story-changes-only`.
Behavior: select a story, toggle Selected story only, fail/retry its comparison
or refresh the project → changed paths, expanded folders, outside count and
missing-workspace/no-locations/no-test explanations remain correct and usable.
Reuse schema-checked review snapshots/diffs and location answers; arrange each
state explicitly. Keep real branch/completion-to-diff selection in Backend/E2E.
No new general response family; preserve failed/absent distinctions and the
story/Project Intent source difference.

### 4. Preserve story presentation and Review return
Type: Behavior
Status: planned
Proof: six specs / 878 lines: `intent-story-ci-cues`, `intent-story-coverage`,
`intent-story-dark-appearance`, `intent-story-review-return`,
`intent-story-summary-title`, `intent-story-views-narrow`.
Behavior: inspect a selected story's views in light/dark or narrow/short space,
then open/close Review by keyboard → cues and coverage states stay distinct,
title is full and unique, controls remain reachable, and the same file/tab/
scroll and header focus return. Reuse Done record/review answers and production
comparison/history mounts for isolated presentation. Whole-app focus and view
transitions stay whole-app checks; component mounts cannot replace them.
Use CI fixtures already delivered, or minimal explicit answers only where the
interaction requires them; do not recreate acquisition in Frontend.

### 5. Preserve Done source, review mode and historical reading
Type: Behavior
Status: planned
Proof: seven specs / 960 lines: `intent-done-landed-review-mode`,
`intent-done-project-refresh-proof`, `intent-done-project-refresh-reading`,
`intent-done-review-modes`, `intent-done-source-selection`,
`intent-ci-done-glance`, `intent-ci-done-reference-lifecycle`.
Behavior: change Done story, enter historical versus live/captured Review,
refresh Project Intent or fail/retry a local history read → no prior story,
mode or captured run leaks; historical file/endpoints/Purpose/Proof/scroll and
local history remain correct. Reuse existing review holds, Done publication,
association and comparison mounts; extend existing history answers only if
needed. Preserve real source/run judgment and exact GitHub no-extra-call
assertions at Backend/E2E, never by arranging the expected judgment. Split
mixed assertions into those homes within this one Done-reading proof loop.

### 6. Preserve revision notice and update isolation
Type: Behavior
Status: planned
Proof: five specs / 663 lines: `intent-revision-notice`,
`intent-revision-planning-only`, `intent-revision-settings-update`,
`intent-revision-update-boundaries`, `intent-revision-update-outcomes`.
Behavior: a newer revision arrives and the reader chooses Show latest, Retry,
Development/Intent or another project during a held/failed update → one notice,
shown/latest source distinction, selection, focus and failure recovery survive;
a late answer never changes another project's reading. Own only any missing
revision-keyed location/file answer controls, reusing slice 2's failures/holds.
The mutable default files map is not a historical revision store: explicitly
key answers when old and latest files differ. Real SSE and acquisition stay
in the existing observation/E2E homes, supplemented for any unmapped assertion.

### 7. Preserve activation and project visits with the file column
Type: Behavior
Status: planned
Proof: four specs / 694 lines: `intent-home-activation`,
`intent-project-visit`, `intent-project-visit-selection`, `intent-sidebar-toggle`.
Behavior: activate a home tab, visit Project Intent, select/clear another story,
or hide/show files and return → each scope keeps its selected source, reading,
column choice and notice; keyboard navigation and narrow layout remain usable.
Reuse candidate/location/review answers and any CI answers delivered meanwhile.
No new family; retain actual browser scope transitions and source pinning,
including story defaults after reselecting while Intent was hidden.

### 8. Preserve reading reuse and reconcile the Intent conversion
Type: Behavior
Status: planned
Proof: four specs / 523 lines: `intent-read-reuse`, `intent-read-reuse-story`,
`intent-reading-place`, `intent-selection-reads`; all 37 dispositions and
current interim runner selection.
Behavior: browse folders, open/reopen a file/diff, leave/return, select during a
held startup answer or switch projects → exact request deltas, no redundant
published text beside a diff, per-project reading reset and selected Purpose
remain protected. Reuse prior answer controls. Remove no unconverted case.
Run `npm run test:dashboard:integrated -- --list --reporter=line`: this story's
37 sources are absent. If CI conversion landed too, no Intent product spec
remains; otherwise only that story's 35 Intent CI sources plus navigation
remain. Account for independent navigation conversion. Keep live helpers and
historical proof/source identities usable; retire no runner or configuration.

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
