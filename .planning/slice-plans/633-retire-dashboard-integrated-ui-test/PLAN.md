# Move Intent CI status and timing checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#retire-dashboard-integrated-ui-test
**Source:** [Move Intent CI status and timing checks out of Dashboard Integrated UI Test](../../seeds/SEED-334-product-wide-end-to-end-tests.md#retire-dashboard-integrated-ui-test)
**Source review:** [source review](source-review.md)

## Goal and scope

Preserve every distinct assertion from 15 interim Intent CI specs (status,
wall-time history, scope timing history) in Frontend, Backend or representative
E2E homes. The seed owns scope and examples. Split on 2026-11-15 at delivered
slice 5: original slices 6–10 (scope glance, proof, comparison, candidates;
20 specs) moved to [plan 651](../651-move-intent-ci-proof-comparison-and-candidate-checks/PLAN.md).
The interim runner stays for those, 37 other Intent and 41 navigation specs, owned by
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
| History windows/order/gaps and scope units/provenance | 3–5: former assertions in controlled UI and retained real acquisition. |
| Every originating assertion has a home; only converted cases/timing rows go | Each slice's dispositions and passes; the integrated `--list` at slice 5 shows 98 files. |
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
Learning for plan 651 (proof): the family also has `openFrontendRunProof` (proof table for
the status's run, from `makeMe.aCiProof`); that slice reuses or absorbs it rather
than adding a second proof family.

### 3. Preserve CI wall-time history order and gaps
Type: Behavior
Status: done
Proof: `intent-ci-wall-time-history-order` and `-gaps` (2 / 211): accepted
order with a middle gap, reversed build-date labels and true span; gap-only
history wording, evidence rows, keyboard run links and phone width.
Behavior: read a history with gaps or out-of-date-order builds → the same
ordering, gap rows, values and linked runs remain protected. Owns the one
history-answer family `dashboard/tests/support/frontendCiHistoryAnswers.ts`
(project `intent=ci-history`, read counts, point/gap/pending-gap entries).
Order service-side home: `Distribution/tests/support/landed-ci-history-reading-order.test.mjs`
(verified). Before citing `landed-ci-history-gaps`/`-pending-proof` for which
builds collection names, inspect their assertions. Scratch-break the gap
rendering in `dashboard/src/IntentCiHistory*` in old and new homes.
Accepted: FE `intent-ci-wall-time-history-{order,gaps}.spec.ts` with family
`serveFrontendCiHistory` and builder `makeMe.aCiHistoryAnswer`
(`Distribution/tests/support/ciHistoryAnswerTestData.mjs`). Gap-naming homes
verified in `landed-ci-history-gaps.spec.ts`/`-pending-proof.spec.ts`. Removing
`GapEvidence`'s run link failed old and new gaps homes; restored, both passed.
`ciHistoryWindowPage.ts` removed with its last consumer. Integrated: 104 files.

### 4. Preserve CI wall-time history window and selected run
Type: Behavior
Status: done
Proof: `intent-ci-wall-time-history-window` and `intent-ci-wall-time-history`
(2 / 351): 20-build window, no controls, sample rows, point/stroke geometry;
proof labels, one measured build, disclosure, keyboard run link, empty history.
Behavior: read a full window or a single measured build → the same values,
geometry, run link and empty-state wording remain protected. Reuse slice 3's
family and `openFrontendRunProof`. Add one Backend case reading a stored 35-build
history with an older gap (`windowLandings` in `server/landedCiMeasuredBuilds.ts`):
newest 20 plus gaps among/after them, older gap dropped. Verify the collection
`timeMs` home (`landed-ci-history-time-without-runner-waits`/`-collection`) before
citing it.
Accepted: FE `intent-ci-wall-time-history{,-window}.spec.ts` (3 cases) and Backend
`landed-ci-history-read-window.spec.ts` (stored 35 builds + older gap read over
HTTP). Widening `windowLandings` to 21 failed old integrated `-window` and the new
Backend case; restored, both passed. Collection/`timeMs` homes verified in
`landed-ci-history-collection` and `-time-without-runner-waits`. Integrated: 102 files.

### 5. Preserve scope timing history gaps, legacy unit and provenance
Type: Behavior
Status: done
Proof: four `intent-scope-timing-history-*` specs (4 / 366): gap-build, gaps,
legacy and provenance.
Behavior: read a selected scope's timing history with a stand-in, unverified,
pending or legacy-unit entry, or a later-build provenance → the same status,
readout, marks and absent charts remain protected on the mounted production
comparison (`summaryScopeFacts`/`serveComparison`, routed scope history read).
Accepted: FE `dashboard/frontend-tests/intent-scope-timing-history-{gaps,provenance}.spec.ts`
and a legacy case in `-units.spec.ts` (6 passed). Changing the `later:` wording in
`dashboard/src/ciHistoryWords.ts` failed old `gap-build`/`provenance` and new
`gaps`/`provenance` homes; restored, all passed. Integrated: 98 files.

## Execution complete

Product advice: no product change. The delivered conversions protect CI status,
wall-time history and scope timing history at their owning boundaries. For the
remainder story (plan 651): refine it with proof split across slices, and
separate the published-project arrangements (story board, unconfigured
Doughnut) from the CI-status answer family in `frontendCiStatusAnswers.ts`
before proof extends that module. Process review is deferred into wrap-up with
the Intent Coverage check.

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

### Slice 3 overrun and story reassessment (2026-11-15)

Slice 3 (four wall-time specs) stopped at 15 active minutes with the history
family and the `-order` Frontend spec passing; its scratch break, the other
three specs, a missing Backend read-window case and deletions remained. The
false assumption: one new family plus four specs and their home inspection fit
one slice; slice 2 fit only because its family carried no Backend gap. This is
the story's second overrun (first at `bfd4e7815`). Story boundary retained:
slices 1–2 delivered the CI-status outcome (7 specs, C1.1) independently, the
remaining families are independent loops of the same outcome, and the split
stays within the in-progress allowance (9 slices). Slice 3 split into 3 (order,
gaps, family) and 4 (window, selected run, Backend window case); kept work is
compatible. Proof (now in plan 651) carries the same risk with seven specs; its family
already exists in part (`openFrontendRunProof`), so it stays, but convert in
complete units and stop at the limit rather than broaden.

### Slice 5 overrun (2026-11-15)

Slice 5 stopped at about 13 active minutes with four of five specs converted.
`intent-scope-glance` needs a Done-story built-app arrangement, a new family the
plan did not foresee (false assumption: scope history answers alone serve every
scope spec). Third overrun of this story. The in-progress split takes the plan
to its ten-slice ceiling; remaining slices 6–10 (glance, proof, comparison,
candidates) are proposed as a separate story at a delivered boundary.

### Split at delivered slice 5 (2026-11-15)

The developer chose to split here. Slices 6–10 moved unchanged to provisional
[plan 651](../651-move-intent-ci-proof-comparison-and-candidate-checks/PLAN.md)
under SEED-334#move-intent-ci-proof-comparison-and-candidate-checks (20 specs),
awaiting story refinement. This plan closes with slices 1–5.

## Story obligations

### G1. Execution-time proof table now reads a built proof, not an extracted collector ZIP
Reported: slice 2 — "the proof now comes from `makeMe.aCiProof`, not from a real collector summary ZIP that the Backend extracted"
Story clause: "Put HTTP refusal, request accounting, acquisition and storage assertions at the Backend boundary"
Disposition: owner changed "the CI proof, comparison and optimization-candidate specs belong to the next story"

### G2. Trunk homepage lost "another branch moving reads no judgment"
Reported: slice 2 — "There is no Frontend equivalent for \"another branch moved\", because the substitute's revision check reports no branches."
Story clause: "Split mixed cases by their assertions, including negative effects."
Disposition: proved by slice 2: dashboard/frontend-tests/intent/intent-ci-status-kept.spec.ts test 2 step "time alone and another branch moving ask for no judgment" asserts the page re-read the moved branch yet `ci.reads()` and Checked datetime are unchanged
