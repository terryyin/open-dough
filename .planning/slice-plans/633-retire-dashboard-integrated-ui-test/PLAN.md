# Move Intent CI checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#retire-dashboard-integrated-ui-test
**Source:** [Move Intent CI checks out of Dashboard Integrated UI Test](../../seeds/SEED-334-product-wide-end-to-end-tests.md#retire-dashboard-integrated-ui-test)
**Source review:** [source review](source-review.md)

## Goal and scope

Preserve every distinct assertion from the 35 interim Intent CI specs in
Frontend, Backend or representative E2E homes. The seed owns scope and examples.
This is preparation only; no slice has executed. The interim runner stays for
37 other Intent and 41 navigation specs, owned by
[reading/review](../647-move-intent-reading-and-review-checks/PLAN.md) and
[navigation/retirement](../648-move-navigation-checks-and-retire-integrated-ui-test/PLAN.md).
No new tier, product behavior, timing target, tagged-install proof or E2E rename.

## Existing solution and current decisions

PFE: reuse `dashboard/tests/support/frontendApp.ts` and its static built app,
`frontendServiceSubstitutes.ts`, `frontendAuthenticatedReadSubstitute.ts` and
held-answer owner `frontendSubstituteAnswers.ts` for Frontend interaction.
Reuse production component mounts/bindings in `dashboard/frontend-tests/intent/`
and the real authenticated Backend boundary with `rawHttp.ts` for HTTP behavior.
Existing `e2e/intent/` journeys retain acquisition, ZIP parsing, source pinning,
SSE and workflow connections; inspect assertions before claiming reuse.
[Comparison proof ownership](../../../dashboard/tests/intent-ci-comparison-proof.md)
maps acquisition/rules/presentation, not permission to drop mixed assertions.

The authenticated-read substitute already answers locations, candidates, files
and revision changes; it does not implement CI status/proof/history. Add only
the current service-answer family beside existing substitutes. Do not use the
default backlog answer as a CI success fallback. Keep actual in-service
collaborators: an arranged response does not prove Backend chose or acquired it.
No new harness, generic framework or delivery-shaped production rule is needed.

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for coherent domain rules and bounded whole-product work,
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for published versus local evidence, and
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
for preserved useful protection without an unmeasured speed claim.
The existing [North Star](../../NORTH-STAR.md) suffices; no new direction or ADR.

Each batch has one proof loop: preserve its originating assertions at their
real boundaries, remove interim homes/duration rows, verify maintained homes.
Shared response families follow service contracts, not batch membership.
Keep negative effects, focus, keyboard, request-count and stale-answer assertions.

## Proof and local gates

Before changing a boundary, retain an assertion-by-assertion disposition to
named maintained cases, including reused cases and negative effects. Observe a
representative scratch break in the interim home before removing it, then in
the new home; both must fail for the same promise and pass restored. Frontend
arranges service answers, then observes actual product actions and rendering.
Use the installed [consumer-trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for moved modules, changed contracts and retired outputs; follow helpers and
fixture exports to observing journeys in all groups. Align imports, registering
modules, fixtures and proof documentation with each move.

Local gate: focused converted cases via `npm run test:dashboard:backend -- <paths>`,
`npm run test:dashboard:frontend -- <paths>` and/or `npm run test:e2e -- <paths>`;
`npm run lint` and `npm run typecheck:dashboard` for changed TypeScript.
Choose broader local proof for affected shared consumers; CI alone does not
make all groups a local gate. Select MakeMe and browser page objects before
writing tests under [AGENTS.md](../../../AGENTS.md#test-automation).
Retain default budgets; no `test.slow()` or suite/file/group/hook overrides.
Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written, including hosted failures after publication. Each slice owns
post-change refactoring and the execution workflow's delivery/CI gates.

The local gate uses the maintained macOS
[sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC with `caffeinate -s -i`; on battery, plug in or keep the lid
open under `caffeinate -i` and inspect the sleep log afterwards. Full runs share
admission across worktrees. Inspect that host's load, memory and competing work
before expensive proof; reduce workers without losing cases when warranted.

| Promise / source example | Owning slice and observation |
| --- | --- |
| HTTP refusals, fresh unread, kept-none and exact extra GitHub calls / example 1 | 1: direct real Backend HTTP answers and observed fake GitHub calls, no browser. |
| CI status values, freshness, reuse, sorting and interaction | 2: real Frontend controls/rendering; Backend/E2E retains acquisition. |
| History windows/order/gaps and scope units/provenance | 3–4: former assertions in controlled UI and retained real acquisition. |
| Proof table/accessibility/grouping/sort and omitted-attempt refusal / example 2 | 5: actual rendering plus direct Backend refusal/no-call and real ZIP acquisition. |
| Comparison values/gaps, preferences, navigation and source pinning / example 3 | 6: mounted/built-app interactions plus real source/acquisition connections. |
| Candidates, failed/held reads, revision, file/Purpose/case targets / example 3 | 7–8: real navigation/reading position and counted service reads. |
| Every originating assertion has a home; only converted cases/timing rows go | Each slice's dispositions and passes; 8 reconciles all 35 sources and lists the interim remainder. |
| Shared helpers and old proof remain usable | All slices: affected consumer proof; retain shared support and artifact/source identities. Retirement and changed-scope history belong to plan 648. |

## Ordered slices

Counts are source specs/lines at `f03e959480b2a04a7194b072cf71aa9da55ee1a9`.
Each slice has 15 active minutes, excluding running commands. One new Frontend
answer family costs most of that budget; none owns two. Introduce families
separately from later variants. Counts guide sizing, not acceptance.

### 1. Preserve CI-status HTTP refusals without a browser
Type: Behavior
Status: done
Proof: `intent-ci-status-read-boundary.spec.ts` (1 / 70), direct Backend requests,
every malformed query and exact fresh/kept call sequence.
Behavior: configured published project → malformed or fresh/kept CI-status
request → the same answers and upstream effects occur without a page. Reuse
`pageTest.ts`, a boundary-mode server and `rawHttp.ts`. Apply the observed
pinned-revision scratch fault to both old and new homes.
Accepted: `dashboard/backend-tests/intent/intent-ci-status-read-boundary.spec.ts`
(real boundary-mode server, `rawRequest`, `judgmentCalls` over fake GitHub calls)
now also asserts no judgment call after each refusal group. Scratch removal of the
revision refusal failed it (400 expected, 200 received); restored, it passed.
`judged`/`runUrl`/`trunkCi`/`judgmentCalls` moved page-free to
`dashboard/tests/support/trunkCiAnswers.ts`, re-exported by `intentCiStatusPage.ts`;
re-export consumers ran (integrated kept/homepage, e2e ci-status) and typechecked.
Integrated selection: 229 tests / 112 files.

### 2. Preserve CI-status presentation and reading lifetime
Type: Behavior
Status: done
Proof: remaining six `intent-ci-status-*` specs (6 / 1,270): execution-time,
freshness, homepage, kept, side-panel and sort; real acquisition/no-extra-call
proof stays Backend/E2E.
Behavior: read, sort, revisit or refresh CI status → controlled answers expose
the same values, freshness, kept cues and interaction. Own one CI-status answer
family in separate support. Existing E2E status journeys keep real judgment-to-
display connections.
Accepted: six Frontend specs `dashboard/frontend-tests/intent/intent-ci-status-*.spec.ts`
(14 cases) with one family `dashboard/tests/support/frontendCiStatusAnswers.ts`
(fresh/kept per branch, read counts, fail/hold). Scratch "Previously retrieved at"
cue break failed old and new homes; restored passed. Call accounting reuses E2E
`intent-ci-status.spec.ts`/`-story.spec.ts`. The substitute's revision check
reports arranged `branchHeads` (opt-in). Full Frontend suite 373 passed.
Learning for slice 5: the family also has `openFrontendRunProof` (proof table for
the status's run, from `makeMe.aCiProof`); slice 5 reuses or absorbs it rather
than adding a second proof family.

### 3. Preserve CI wall-time history reading
Type: Behavior
Status: planned
Proof: four `intent-ci-wall-time-history*` specs (4 / 562), window/order/gaps
and selected points; reuse applicable E2E adapter/provenance cases.
Behavior: read/change a history window or select a point → the same ordering,
gaps, values and linked run remain protected. Own at most one history-answer
family; keep real collection/request accounting Backend/E2E.

### 4. Preserve scope timing history and its gaps
Type: Behavior
Status: planned
Proof: `intent-scope-glance` and four `intent-scope-timing-history-*` specs
(5 / 578): gap-build, gaps, legacy and provenance.
Behavior: select entry/folder/file scope → observe the same values, gaps, build
eligibility and provenance. Reuse history answers; any scope-specific contract
extension belongs here, with actual scope navigation.

### 5. Preserve CI proof reading and query refusal
Type: Behavior
Status: planned
Proof: three `intent-ci-proof*` and four `intent-summary-ci-proof-*` specs
(7 / 1,060): table/grouping/accessibility/kept/gaps/sort; direct Backend
omitted-attempt refusal without an extra GitHub ask.
Behavior: open proof or select a configured entry → the same run, attempt,
counts, timings, gaps, accessible cells and destinations remain protected.
Own one proof-answer family; real ZIP/artifact acquisition and attempt memory
keep Backend/E2E homes. Historical-only entries still have no dead source link;
do not rewrite old entry identities.

### 6. Preserve comparison navigation and preferences
Type: Behavior
Status: planned
Proof: four `intent-ci-comparison-*` and two `intent-summary-story-comparison-*`
specs (6 / 998): count-gaps, drilldown-relative, locations, relative, file, sort.
Behavior: compare a story, change scope/sort/Show %, or open its file → the same
gaps, signed marks, percentages, order, focus and pinned destinations remain
observed across views. Reuse production mounts/bindings; add only missing
full-app answers. Retain real API/upstream counting from comparison-locations
at Backend/E2E, not substitute logs.

### 7. Preserve candidate selection and Purpose targets
Type: Behavior
Status: planned
Proof: `intent-test-optimization-candidates.spec.ts`, `…-case`, `…-open`
(3 / 595): list identity and source/case/Purpose navigation, including refusals.
Behavior: choose a recorded candidate → actual controls open its source and
case at the same revision/reading position. Reuse candidate/file/location
substitutes; any held/failed candidate answer family is owned here. Real
candidate acquisition stays outside Frontend.

### 8. Preserve candidate refresh and close the CI conversion
Type: Behavior
Status: planned
Proof: `intent-test-optimization-candidates-{live,revision,states}` (3 / 339),
all 35 assertion dispositions and remaining interim selection.
Behavior: change project/revision or receive live/failed candidate answers →
the same freshness, state and stale-answer exclusion remain protected; no
selected CI spec remains in the interim group. Reuse slice 7's family. Run
`npm run test:dashboard:integrated -- --list --reporter=line`: only 37 other
Intent and 41 navigation specs remain (adjust for independent conversions).
Keep `groupRunnerExamples.ts` runnable: when its title example moves, select a
still-interim case and actual title, with focused runner-ownership proof.

## Premises, observations and sizing review

Observed 2026-11-15 in this owned checkout at `f03e959480b2a04a7194b072cf71aa9da55ee1a9`:

| Decisive premise / consuming operation | Result and remainder |
| --- | --- |
| Current selection: `npm run test:dashboard:integrated -- --list --reporter=line` | Exit 0; 230 tests / 113 files, only Intent 72 and navigation 41. CI partition 35 / 5,472 lines; other Intent 37 / 5,547. Selection evidence only. |
| Refusal observes the real parser: `caffeinate -s -i npm run test:dashboard:integrated -- intent/intent-ci-status-read-boundary.spec.ts --workers=1` | Baseline passed; scratch removal of `parseIntentCiStatusRead`'s revision refusal failed at pinned revision (expected 400, got 200); restored run passed. Scratch reverted. Slice 1 must reproduce that discrimination in its new Backend home. |
| Static Frontend runner reaches real browser controls: `caffeinate -s -i npm run test:dashboard:frontend -- control-reachability-observation.spec.ts --workers=1` | Exit 0. New CI response families and their proof are future slice work, not claimed implemented. |
| Server preparation needs worktree-local dependencies | First refusal run stopped before the test at missing `node_modules/.dough-server-bundle-*`; `npm ci` installed 183 locked packages, then baseline/fault/restored completed. Execution includes checkout-bound dependency setup. |
| Family cost governs sizing | Retained `bfd4e7815:.planning/slice-plans/632-finish-dissolving-integrated-ui-test/PLAN.md` records a two-family overrun and one-family budget. Repartitioned into 1–7 files per slice with explicit family ownership; no 20-spec batch remains. |

The observation host was awake on AC, load 6.74/5.75/6.05; memory and competing
test work were inspected. Chose focused single-worker checks, no broad run.
Execution reassesses its own host before expensive proof. Existing expected
edited support is at most 226 lines; keep new families separate and apply the
250-line check to actual proposed edits. No already-oversized expected code
edit requires separate reorganization.

Slice-plan refinement ran: split original CI batches 1–2 into these eight
loops; original 3–4 map to plan 647 and 5–8 to plan 648. Cumulative design uses
one model at established service boundaries. Review identified no remaining
slice-specific concern. If a family or mixed proof exceeds these assumptions,
apply sizing/escalation before broadening its batch; preserve overrun evidence
and reassess the story after a second overrun.

## Story obligations

### G1. Execution-time proof table now reads a built proof, not an extracted collector ZIP
Reported: slice 2 — "the proof now comes from `makeMe.aCiProof`, not from a real collector summary ZIP that the Backend extracted"
Story clause: "Backend/E2E retains real parsing/acquisition/refusal and request counts."
Disposition: receiving slice 5

### G2. Trunk homepage lost "another branch moving reads no judgment"
Reported: slice 2 — "There is no Frontend equivalent for \"another branch moved\", because the substitute's revision check reports no branches."
Story clause: "Split mixed cases by their assertions, including negative effects."
Disposition: proved by slice 2: dashboard/frontend-tests/intent/intent-ci-status-kept.spec.ts test 2 step "time alone and another branch moving ask for no judgment" asserts the page re-read the moved branch yet `ci.reads()` and Checked datetime are unchanged
