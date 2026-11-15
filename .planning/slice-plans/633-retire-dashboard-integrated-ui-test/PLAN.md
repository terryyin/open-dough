# Move Intent and navigation checks out and retire Dashboard Integrated UI Test

Provisional planning material for `SEED-334#retire-dashboard-integrated-ui-test`;
the source below is its canonical story, not this unselected draft.
**Source:** [Move Intent and navigation checks out and retire Dashboard Integrated UI Test](../../seeds/SEED-334-product-wide-end-to-end-tests.md#retire-dashboard-integrated-ui-test)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

Convert every interim case under `dashboard/tests/{intent,navigation}` while
preserving each distinct regression assertion in E2E, Frontend or Backend,
then retire the empty group's Intent entry, runner, CI producer and live
tooling references. Split on 2026-11-15 from
[SEED-334#finish-dissolving-integrated-ui-test](../632-finish-dissolving-integrated-ui-test/PLAN.md),
whose original slices 6 and 7 (Intent; navigation) and 8 (retirement) are
mapped below. Slice 8 here needs that story's conversions on trunk; slices
1–7 do not.

Architecture, proof rules, local gates and carried learnings are those of
[plan 632](../632-finish-dissolving-integrated-ui-test/PLAN.md#existing-solution-and-architecture);
refinement confirms or adjusts them here.

## Retirement inputs

At `c327752a0f385417c74b1a7b3511ebe5d3b450e6` the interim group was named by
its Intent location in `.planning/open-dough.json`, `package.json`, `ci.yml`
job `dashboard-integrated`, `dashboard/integrated.playwright.config.ts`, the
`integrated.longest-first*` lists, runner support
(`dashboard/tests/support/groupRunnerExamples.ts`), Distribution CI helpers
and tests, and placement READMEs. Leave `integratedStateCompletion` in
`.planning/open-dough.json` alone; it is not the interim group's Intent entry.
Retirement may land before or after SEED-334#keep-one-browser-test-group-
roster; either way three groups remain.

## Provisional slices

Sizes are interim specs / lines at `788c5a64ca128ee64bc10ffe752f617633a28127`,
against the carried capacity of about 2.5–3k lines per slice. Original slice 6
(Intent, 72 / 11,009) maps to slices 1–4; original slice 7's navigation part
(41 / 6,516) maps to slices 5–7; original slice 8 maps to slice 8. Original
slice 7's stories and observation parts stay in plan 632 (its slices 6–8).

### 1. Convert Intent CI status and timing history
Type: Behavior
Status: provisional
Proof: `intent-ci-status-*`, `intent-ci-wall-time-history*` and
`intent-scope-*` (16 / 2,470) retain CI status freshness/sort/kept/side-panel/
homepage/execution-time, wall-time history window/order/gaps and scope timing
history assertions, including the direct Backend conversion of
`intent-ci-status-read-boundary.spec.ts` with every refusal and
no-additional-GitHub-call assertion.

### 2. Convert Intent CI proof, comparison and optimization candidates
Type: Behavior
Status: provisional
Proof: `intent-ci-comparison-*`, `intent-ci-proof*`, `intent-summary-*` and
`intent-test-optimization-candidates*` (20 / 2,992) retain comparison,
proof table/grouping/accessibility/gaps/sort and optimization-candidate
assertions.

### 3. Convert Intent story, done review and revision
Type: Behavior
Status: provisional
Proof: `intent-story-*`, `intent-done-*`, `intent-ci-done-*` and
`intent-revision-*` (20 / 2,944) retain story changes/cues/coverage/views,
done review modes/source selection/refresh and revision notice/update
assertions.

### 4. Convert Intent source, Purpose and reading recovery
Type: Behavior
Status: provisional
Proof: the remaining 16 Intent specs (2,603): code browse, entry folder
summaries, Gherkin, home activation, project visit, Purpose case, read
recovery/reuse, reading place, selection reads, sidebar toggle and source
target recovery; no product spec remains under `intent/`.

### 5. Convert board reading, paging and accessibility
Type: Behavior
Status: provisional
Proof: `accessible-board*` and `board-*` navigation specs (15 / 2,080) retain
keyboard/touch/scroll, clamp/height/kept, paging and board reading assertions.

### 6. Convert frame, header and side panel
Type: Behavior
Status: provisional
Proof: `dashboard-header*`, `development-intent-frame*`, `frame-*`,
`side-panel-width*` and `notification-story-navigation` (12 / 2,160) retain
frame look, header, side-panel width and notification navigation assertions.

### 7. Convert story and project selection and references
Type: Behavior
Status: provisional
Proof: `project-*`, `source-navigation`, `story-card-*`,
`story-destination-repeat-cue` and `story-reference-*` (14 / 2,276) retain
project keyboard/selection, source navigation and story reference
identity/done/recovery assertions; no product spec remains under
`navigation/`.

### 8. Retire Dashboard Integrated UI Test
Type: Behavior
Status: provisional
Proof: no `dashboard/tests/**/*.spec.ts` product case remains. Remove the
current Intent location, npm command, Playwright config, `dashboard-integrated`
CI producer/shards, duration lists and live tooling/placement references.
Keep `integratedStateCompletion`, shared helpers and historical evidence.
Behavior: every interim assertion has a maintained home → retire the empty
group → only E2E, Frontend and Backend are current, all shared imports work,
and old integrated artifacts/source remain readable at their old revisions
without current-proof claims, fabricated comparisons or dead links.
Update roster or hard-coded callers regardless of the roster story's order.
Focused `ci-browser-groups`, related CI declarations and `runner-ownership`
prove the remaining groups; retained Intent/history cases prove old evidence.

## Resumption

Resume through `dough-story-refinement` for this story, then realign this
plan with `dough-slice-plan-refinement`. Intent slices 2 and 3 hold about 20
small specs each, above the carried "about 11 small specs" observation;
refinement must confirm their fit or rebalance within eight slices.
