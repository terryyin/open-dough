# Move Intent reading and review checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-intent-reading-and-review-checks
**Source:** [Move Intent reading and review checks](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-intent-reading-and-review-checks)
**Source review:** [Source-only commitments](source-review.md)

## Goal and scope

Preserve every distinct assertion from the 37 non-CI Intent specs at its real
Frontend, Backend or representative E2E boundary. The seed owns goal, scope and
key examples. Execution progress and accepted proof are recorded per slice.
Keep navigation and runner retirement in [plan 648](../648-move-navigation-checks-and-retire-integrated-ui-test/PLAN.md)
and the remaining CI conversion in [plan 651](../651-move-intent-ci-proof-comparison-and-candidate-checks/PLAN.md).
The two `intent-ci-done-*` specs are part of this reading/review outcome.
No new tier, changed product behavior, E2E rename, tagged-install proof or
unmeasured timing/shard target. No start-blocking story dependency.

## Existing solution and current decisions

Reuse the [settled solution and decisions](preparation-evidence.md#existing-solution-and-current-decisions).

## Outside-in proof and local gates

Follow the [conversion proof contract and boundary ownership](proof-contract.md)
for assertion dispositions, scratch discrimination and consumer tracing.

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

Retain the [execution identity, delivery and CI observation](execution-context.md).

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
Status: done
Proof: six specs / 860 lines: `intent-code-browse-java`,
`intent-entry-folder-summaries`, `intent-entry-folder-summaries-folders`,
`intent-gherkin-groups`, `intent-gherkin-layout`, `intent-purpose-case`.
Behavior: open a location/folder, source or recorded case → the actual browser
keeps ordered summaries, exclusive/local group expansion, exact source/lines,
case target and scroll, light/dark highlighting and plain-text grammar fallback.
Reuse existing location/file/candidate substitutes and original fixture data;
no new response family. Retain acquisition at real Backend/E2E boundaries.
Reproduce the observed missing-target fault in the new Frontend Purpose case.

Accepted proof: [assertion dispositions and scratch check](slice-1-proof.md),
[consumer and refactor proof](slice-1-consumers.md). Implementation 8.5 active
minutes; independent refactor complete; covering Frontend group passed.

### 2. Preserve failed settings and source-read recovery
Type: Behavior
Status: done
Refactor decision: modularize stream-slot preholding from the 252-line
`dashboardTest.ts` into shared browser support, keeping server/GitHub lifecycle
there. Preserve default/opt-out behavior, genuine locks and independent counts;
reuse the same precondition in Frontend recovery and connection-logo consumers.
Proof: three specs / 526 lines: `intent-gherkin-settings-problems`,
`intent-read-recovery`, `intent-source-target-recovery`.
Behavior: locations or a targeted source read becomes malformed, unreachable,
rate-limited, held or failed → the same explanation, manual/timed Retry,
hidden-view suppression, revision-check continuation and prior reading survive.
Own only the missing controlled authenticated-read failure/hold variants,
using existing held-answer/clock primitives. Keep 15/30/60/60 timing and exact
request deltas. Backend proves settings classification/shared upstream reads;
E2E proves a real classified failure reaches the browser recovery path.

Accepted proof: [assertion map and timing fault](slice-2-proof.md),
[consumer/refactor and covering proof](slice-2-consumers.md); 14.5 active
implementation minutes, independent refactor and covering Frontend pass.

### 3. Preserve selected-story changed-tree reading
Type: Behavior
Status: done
Proof: two specs / 443 lines: `intent-story-changes-gaps`,
`intent-story-changes-only`.
Behavior: select a story, toggle Selected story only, fail/retry its comparison
or refresh the project → changed paths, expanded folders, outside count and
missing-workspace/no-locations/no-test explanations remain correct and usable.
Reuse schema-checked review snapshots/diffs and location answers; arrange each
state explicitly. Keep real branch/completion-to-diff selection in Backend/E2E.
No new general response family; preserve failed/absent distinctions and the
story/Project Intent source difference.

Accepted proof: [slice3 assertion, source and consumer evidence](slice-3-proof.md);
13 active implementation minutes including canonical-family reconciliation,
independent refactor and renewed covering Frontend pass.

Checkpoint before slice4 fulfilled: published trunk history integrated with
converted Java/Purpose homes preserved; [combined-snapshot proof](integration-proof.md)
passed before branch publication. The current high-contrast palette retains
all four exact colour-role assertions with updated authoritative values.

### 4. Preserve story presentation and Review return
Type: Behavior
Status: done
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

Implementation proof: [135 assertion occurrences, same-fault checks and real
boundary observations](slice-4-proof.md), [consumer dispositions](slice-4-consumers.md).
Thirteen active minutes; Done full-app premise proved with explicit historical
answers. Independent dependency/reference cleanup and affected strict proof passed.
The covering focused consumer suite has no observation deferred to CI.

### 5. Preserve Done source, review mode and historical reading
Type: Behavior
Status: done
Proof: seven specs / 960 lines: `intent-done-landed-review-mode`,
`intent-done-project-refresh-proof`, `intent-done-project-refresh-reading`,
`intent-done-review-modes`, `intent-done-source-selection`,
`intent-ci-done-glance`, `intent-ci-done-reference-lifecycle`.
Behavior: change Done story, enter historical versus live/captured Review,
refresh Project Intent or fail/retry a local history read → no prior story,
mode or captured run leaks; historical file/endpoints/Purpose/Proof/scroll and
local history remain correct. Reuse slice4's observed full-app Done fixture,
immutable historical answers, review holds and comparison adapter; extend existing history answers only if
needed. Preserve real source/run judgment and exact GitHub no-extra-call
assertions at Backend/E2E, never by arranging the expected judgment. Split
mixed assertions into those homes within this one Done-reading proof loop.

Implementation proof: [134 observing occurrences and real boundary proof](slice-5-proof.md),
[consumer dispositions](slice-5-consumers.md). All seven sources converted in
14.8 active minutes; strict Frontend25 plus final guard3, real E2E6 and Backend3 passed.
Independent dead-parameter cleanup passed strict3; added client-wire proof passed strict1.
All affected consumer paths are disposed, with no required observation deferred to CI.

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
37 sources are absent. Reconcile against current trunk's partial CI outcome:
15 status/timing specs converted; the remaining20 CI specs belong to plan651.
If that remainder also landed, no Intent product spec remains; otherwise its
20 sources plus navigation remain. Account for independent navigation conversion. Keep live helpers and
historical proof/source identities usable; retire no runner or configuration.

## Premises, observations and sizing review

Retain the [preparation observations and sizing review](preparation-evidence.md#premises-observations-and-sizing-review);
execution rechecks only consuming conditions whose evidence no longer applies.

## Story obligations

### G1. Client shared-read proof is not upstream evidence
Reported: slice 2 — "intent-shared-reads.spec.ts uses a global fetch substitute and is not dashboardServer/GitHub upstream-count evidence."
Story clause: "GitHub request counts"
Disposition: proved by slice 2: slice-2-proof.md#setup-and-boundary-ownership; inspected real E2E classified settings/listing cases preserve the exact heads-check +1, and the rate-limited listing case preserves the real classification/directed wait. Supplemental client proof is labeled correctly and the remaining plan's ownership assumption is corrected.

### G2. Accepted syntax palette invalidates old colour literals
Reported: slice 3 — "The merged snapshot failed Java's obsolete palette literal after SEED-351 intentionally adopted high-contrast palettes and the documented light contrast mix."
Story clause: "Every distinct assertion remains useful"
Disposition: proved by slice 3: integration-proof.md; all four exact keyword/string light/dark assertions remain, updated independently from the accepted named palettes/CSS mix; Java2, whole Frontend and real E2E8 pass on the merged candidate before publication.

### G3. Quiet refactor output did not retain per-case evidence
Reported: slice 4 — "No structured selection/result artifact was retained for the exact refactor invocation."
Story clause: "Every distinct assertion remains useful"
Disposition: proved by slice 4: slice-4-proof.md; coordinator renewed the three affected journeys with the maintained proof recorder, receiving completed strict pass and three passed attempts; all unchanged assertions retain the earlier Frontend16 observation.

### G4. Review answers must distinguish historical identity from live mode
Reported: slice 5 — "A mutable default live snapshot answered a historical request on perspective return."
Story clause: "Done historical versus live/captured review modes"
Disposition: proved by slice 5: slice-5-proof.md; the existing answer family now keys historical snapshots by identity while ordinary requests retain the live default. Whole-app held transitions and real Backend/E2E source judgment passed, with the same loading fault discriminated at old and maintained boundaries.

### G5. Located consumer paths lacked individual dispositions
Reported: slice 5 — "Acceptance found empty Disposition cells in the raw consumer trace; the grouped table alone did not dispose every located path."
Story clause: "Every distinct assertion remains useful"
Disposition: proved by slice 5: slice-5-consumers.md; independent review disposed all 855 original located paths and traced five refactor callers plus 15 additional helper paths. Actual default Review openers, staged text, mark/range and independent state-endpoint readers were inspected; selected Frontend25 observations or precise unchanged/excluded boundaries cover every meaningful consumer.

### G6. Captured-to-live proof must observe the client request
Reported: slice 5 — "Acceptance found that the default Frontend snapshot could answer live even if the ordinary request forwarded the old captured run; existing E2E covers published-to-live."
Story clause: "Done historical versus live/captured review modes"
Disposition: proved by slice 5: slice-5-proof.md; endpoint-only request capture observes the actual ordinary request while held and asserts historical is not true and run is absent. Strict captured-to-live case passed, paired with the real Backend ordinary snapshot/no-selectedRun observation. Captured landing and published-to-live E2E coverage is labeled to its actual boundary.
