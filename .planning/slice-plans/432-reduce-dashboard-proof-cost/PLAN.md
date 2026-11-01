# Reduce dashboard proof cost while retaining worthwhile coverage

**Identity:** SEED-208#reduce-dashboard-proof-cost
**Source:** [selected story](../../seeds/SEED-208-dashboard-proof-cost.md#reduce-dashboard-proof-cost).
**Assessment:** [family value/cost decisions](../../../docs/maintainer/dashboard-test-value-review.md).

## Goal and scope

Less waiting and less redundant test orchestration for dashboard developers,
without losing worthwhile user protection. This is a test-suite correction:
Structure slices below directly own evidenced test/fixture weaknesses and keep
product behavior unchanged. All slices are planned; this record authorizes no
implementation. No extra performance target or numeric execution budget was
supplied. Do not turn the nine bounded proof loops into a general harness project.

Apply two gates first: behavior value, then incremental coverage versus total
cost. Either negative answer removes or narrows proof. Simplification with
surviving protection may be worthwhile independently of measured elapsed gain,
as the developer explicitly directed. Infrastructure changes need measured
benefit that justifies their complexity. No mocking, retry/skip/exclusion policy,
longer timeouts, shared mutable state, new runner, or deployment redesign.

## Existing solutions and architectural constraints

- `dashboardTest.ts` already supports `request` plus `serverMode: "boundary"`;
  `preparationPage.ts` honors that mode. Reuse it, not a parallel HTTP harness.
- `codexLaunch.ts` owns native fixture/machine state without an installed origin;
  `pageTest.ts` owns the read-only worker `launchJourney`. Use those for dialogs
  that do not exercise installed starts. Worker fixtures stay declared once.
- `startOriginPreparation.ts` already packs installed skill origins once per
  run; `preparingJourney.ts` already caches immutable published history per
  worker. Neither is an unimplemented optimization. Writable origins, HOME,
  refs/indexes, request state, and servers remain private per test.
- `agentLaunchBoundary.ts` provides actual launch/mark operations for incidental
  setup; existing deletion journeys own confirmation and focus contracts.
- Keep [ADR 0008, dashboard architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  durable origin records and local session evidence have different authority.
  Fixtures cannot manufacture an outcome a test claims the product establishes.
- Apply [ADR 0010, improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  to runtime and maintenance gains, including the cost of experiments/review.
  The dashboard UX North Star requires understandable purpose/proof and honest
  uncertainty; this plan makes no new UI or architecture decision.
- `dashboard/tests/README.md`, `writing-journeys.md`, and
  `tests/native-setup.md` own test placement, event waits, setup and commands.
  Use check-only `.githooks/pre-commit`; format only changed paths.

## Baseline and proof protocol

Recorded historical scope: normal `npm run test:dashboard`, eight local workers,
1,742 cases at SEED-197 after revision `125edc37`. Its 615.3s wall is context only;
the earlier 1,060.4s baseline had different load and crossed a reboot. Current
case count and a comparable baseline are unknown. No fresh run happened in triage.

Run commands from the owned execution checkout, after locked native setup.
For each focused family below use `npm run test:dashboard -- <named specs>`;
save strict proof and `.tsv` to unique absolute paths outside the repository via
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` and `OPEN_DOUGH_DASHBOARD_TIMES`, unsetting
`NO_COLOR`/`FORCE_COLOR`. Record exact revision, case selection, workers, cache,
host/load/memory, duration and outer wall. For comparisons also use
`--workers=1` where default scheduling masks work removed. Use three comparable
focused observations when results are doubtful; changed async synchronization
requires three consecutive passes with a causal explanation. Do not rerun a
failure hoping for green. Do not add all file contributions as wall savings.

Before each edit establish the family baseline and surviving assertions. After
each edit run its family and affected consumers; retain the chosen simplification
with its proof, or undo an ineffective infrastructure experiment. A failed or
incomplete run is not a baseline or evidence of acceptance. No new lower-level
case should require another full native launch merely to move assertions.

## Ordered slices

### 1. Establish the current cost and survival map
Type: Structure
Status: planned
Proof: Successful strict normal full-suite baseline and focused family records.

Bounded early probe: inspect host contention and setup first, then run normal
`npm run test:dashboard` and the affected families. Attribute setup versus body
cost using existing runner records and a small temporary diagnostic when needed.
Confirm which catalog cases never start installed work, and identify real
minimal Git preconditions and boundary-fixture extension points. These are
decisive premises for slices 2, 3, 6, and 8; if absent, revise only the affected
approach before editing. Stop profiling when it no longer changes an experiment.
This slice removes reliance on a historical, incomparable performance baseline.

### 2. Preserve review admission without browser or irrelevant history
Type: Structure
Status: planned
Proof: HTTP admission statuses, contents, fixed-pair authority and actual Git
nonmutation remain green in the review/mark family; record before/after costs.

Move `story-review-refusal`, `story-review-commit-admission`,
`story-review-file-text-admission`, and `story-review-one-shot-admission` to
boundary homes using `request`; extract only mark admission from
`story-review-mark`. Reuse fixture helpers. Simplify rejection preconditions to
real repositories with mutation sentinels; retain rich file/range histories and
one actual start/capture/retire historical path. No simulated read-only result.
Focused proof includes all five original responsibilities, `story-review.spec`,
and `boundary/serving-modes.spec.ts` if common serving setup changes.
Expected gain: browser/preview and irrelevant Git construction, not the rejected
boundary-only rename. Keep a placement simplification as such; do not report it
as runtime gain without comparable measurements. Do not add a generic builder.

### 3. Prove model selection with fewer full starts and a cheaper dialog fixture
Type: Structure
Status: planned
Proof: Actual model/effort reaches native creation in story/ad-hoc shapes and
refinement persistence before input; all catalog/effort UI variants remain green.

Transfer refinement's distinct selected-model/effort-before-input assertions to
`agent-launch-preparation-codex.spec.ts`, preserving its default-model coverage;
only then remove the refinement repetition in `agent-launch-codex-model`.
Separate catalog-only registrations from `codexStart` into existing
`codexLaunch`/read-only `launchJourney` setup. Keep established-workspace and
confirmation cases on real starts. Preserve cancellation, late host/project
replies, keyboard feedback, defaults and stale catalog rejection. No stubbed
successful start and no new shared mutable protocol state.
Run the model file and all three imported case families plus
`agent-launch-preparation-codex`, `agent-launch-start-codex`, and
`boundary/agent-launch-codex-model-boundary.spec.ts`; extend to other fixture
consumers only when changed. Expected largest benefit: removing installed-origin
preparation across the dialog family, not another one-case trim experiment.

### 4. Retain phase integration without the host/workflow cross-product
Type: Structure
Status: planned
Proof: Claude execution and Codex refinement still observe preparation, native
launch, reload, and placement on initiating/observing pages; both handoffs retain
the appropriate readiness semantics.

Keep Claude execution in `agent-launch-start-phases` and Codex refinement in
`agent-launch-preparation-phases`; remove the opposite two complete journeys.
Preserve the Claude argv readiness check. Reuse the existing changed-readiness
`expectExecutionInput(..., true)` and retry observations in
`agent-launch-start-codex`; do not assume a test name proves this correspondence.
Move the stored-but-not-running case to real boundary proof without `page`.
Run both phase files plus `agent-launch-start-codex` and
`agent-launch-preparation-codex`. Expected gain: two fewer complete lifecycles;
even unchanged focused wall does not justify restoring duplicated proof.

### 5. Keep one fail-closed proof for ambiguous completion attribution
Type: Structure
Status: planned
Proof: Ambiguous printing-driver review reports unavailable and returns no
files; missing-agent recovery and genuine conflict attribution remain green.

Add `not.toHaveProperty("files")` to the existing ambiguous case in
`boundary/story-review-completed-driver.spec.ts`, then drop only the
`ambiguous-merge` iteration from `story-review-completed-gaps`.
Run both files and `story-review-completed-conflicts`; use a targeted negative
control if plain/printing equivalence is disputed. Restore the control before
delivery. Expected small runtime gain and less duplicate history construction;
do not rewrite attribution or build a cache for this one case.

### 6. Exercise deletion placements without replaying incidental launch dialogs
Type: Structure
Status: planned
Proof: Recently-done/done-card/Taken/Backlog/sidebar placement and keyboard
destinations survive deletion; only the selected stored record disappears and
no native conversation is stopped.

Narrow `agent-launch-recent-delete` to its placement/focus deltas; the generic
question, Keep/Escape/default-focus contract stays in `agent-launch-story-card-delete`.
Use existing real launch/mark HTTP operations for the four incidental sessions
and two done states instead of their repeated dialogs. Delete remains a real
page action. Keep all distinct placement observations and private test state.
Run both deletion files plus their unavailable siblings. Expected gain is
incidental UI setup and simpler orchestration; dialog assertion trimming alone
has negligible expected wall return. Do not merge unrelated lifecycle tests.

### 7. Prove automatic terminal attachment once across equivalent input shapes
Type: Structure
Status: planned
Proof: A real launch auto-attaches the terminal with keyboard/input/scroll and
Close behavior; nonblank exact input and truly blank submission still survive.

Collapse the blank/nonblank full terminal loop to one representative journey.
Keep a minimal real page blank-submission delta if its UI submission path has no
surviving owner; native argv blank/whitespace/text semantics already belong to
`boundary/agent-launch-ad-hoc-boundary` and `agent-completion-input`.
Run those files and `agent-launch-ad-hoc-terminal`. Preserve its two distinct
close/reopen races; they rewrite responses and cannot be claimed as no-mock
replacement proof. Do not extend that mechanism or redesign settlement here.
Expected gain: up to one fewer full terminal journey, without a new fixture.
The second-server integrated path remains accepted and unchanged.

### 8. Keep attention lifecycle proof focused on durable user behavior
Type: Structure
Status: planned
Proof: Refused completion requests preserve the previous message; installed
reporting survives retirement/restart and explicit read/Done behavior stays green.

Move the attention journey's eight malformed/foreign-body rows plus cross-origin
refusal onto already-launched state in `boundary/agent-completion-identity`.
Keep the successful installed command and page lifecycle in
`agent-completion-attention`. Reuse real HTTP/store operations and existing
identity helpers; no extra native launch fixture merely to relocate assertions.
Run both files. Expected runtime gain is small; clearer ownership and less
multi-responsibility journey code justify this bounded change independently.
Preserve accepted real production watcher/install/build chains unchanged.

### 9. Verify the combined result and settle residual costs
Type: Structure
Status: planned
Proof: Successful strict full suite with no skips and comparable before/after
wall/case records; every transferred candidate has an evidenced disposition.

Run normal `npm run test:dashboard` under comparable host conditions. Include
replacement proof cost. Validate affected source/support files with
`npm run typecheck:dashboard` and the ordinary lint hook; shared fixture changes
justify full-suite coverage. Inspect diff for mocks, focus markers, lost
assertions, new unnecessary support code and misleading speed claims.
Update `TEST-OPTIMIZATION-CANDIDATES.md` Latest pass. Remove implemented
transferred entries; accept valuable residual scope only after measured
experiments leave no credible worthwhile cheaper design. Preserve accepted
selection/second-server/watcher protection, no exclusions, and ordinary CI.
If whole-suite improvement is inconclusive, report that honestly and separate
the retained, independently worthwhile coverage simplifications.

## Current decisions and stopping points

- Source-value decisions are authorized; speed and numeric ROI remain unproved.
- Each family has one bounded proof loop. If fixture complexity exceeds the
  credible removable work, keep the valuable residual path and record why.
- No repeated experiment solely to seek statistical luck; a changed hypothesis
  and comparable conditions are required after contrary evidence.
- The first-to-drop work is speculative fixture optimization, then low-return
  admission relocation that adds setup. Retain proven simple reductions.
- No permission is inferred to change product behavior or erase a unique promise.
- No new North Star topic, generic framework, external service, or ADR is needed.

## Learnings and preparation review

The source review established real duplication but also the unique completed
review radio round trip; its prior overlap description was incomplete.
Refinement was not needed: slices own separate cohesive correction/proof loops,
share one measurement protocol, and bound unknown cost premises in slice 1.
No remaining slice-specific concern identified by this preparation review.
Actual benefits remain hypotheses; the early probe and final re-profile own them.
