# Reduce dashboard proof cost while retaining worthwhile coverage

**Identity:** SEED-208#reduce-dashboard-proof-cost
**Source:** [selected story](../../seeds/SEED-208-dashboard-proof-cost.md#reduce-dashboard-proof-cost).
**Source review:** [source-only commitments](source-review.md)
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
`NO_COLOR`/`FORCE_COLOR`. Do not pass `--reporter`: it replaces the configured
quiet reporter that writes both records (`dashboard/playwright.config.ts`). Record exact revision, case selection, workers, cache,
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
Status: done
Proof: Successful strict normal full-suite baseline and focused family records.

Bounded early probe: inspect host contention and setup first, then run normal
`npm run test:dashboard` and the affected families. Attribute setup versus body
cost using existing runner records and a small temporary diagnostic when needed.
Confirm which catalog cases never start installed work, and identify real
minimal Git preconditions and boundary-fixture extension points. These are
decisive premises for slices 2, 3, 6, and 8; if absent, revise only the affected
approach before editing. Stop profiling when it no longer changes an experiment.
This slice removes reliance on a historical, incomparable performance baseline.

Result (e073d3f2, 16 cores/48 GB, competing VM, doughnut e2e and other agents):
two full runs, neither strict-green. Run 1 (load 7→35, 909 s, written with a
`--reporter` override and so no records) failed `production-watcher-updates`,
`agent-launch-ad-hoc-sessions:68` and `recently-done-sessions-sidebar-room:34`;
all three files passed at `--workers=4`. Run 2 (load 11–29): 1,831 cases,
0 skipped, 1,830 passed, 650.6 s wall, 4,762.7 summed test seconds; it failed
`recently-done-sessions-sidebar-paging:34` (stayed at 40, wanted 45), which passed
at `--workers=4`. Probable cause: `recentlyDoneSessionsSidebarPaging.ts:66-77`
treats a synchronous `scrollTop === 0` as re-armed before the page's reveal
trigger observes the return to the top. Every S2–S8 family case passed in both
runs, and each family passed strict alone at `--workers=1`.

| Slice | Cases | Summed s (8 workers) | Wall s (1 worker) | Credible removable summed s |
| --- | --- | --- | --- | --- |
| 2 | 17 | 64.3 | 34 | 3–5 (browser/preview; estimate) |
| 3 | 20 + 11 boundary | 53.1 | 48 | 5–7 (one full start ~3.4–4.8; origin swap ~2) |
| 4 | 5 | 35.7 | 27 | 9–11 |
| 5 | 12 | 60.0 | 45 | ~2.8 |
| 6 | 9 | 27.7 | 35 | 2–3 |
| 7 | 15 | 40.5 | 47 | ~2 (the two preserved races cost 17 s each) |
| 8 | 2 | 39.9 | 41 | ~0 (refusal rows are <0.5 s of HTTP) |

The combined credible gain (25–35 summed s, under 1% of the suite) is below the
spread between two full runs on this host, so whole-suite wall cannot show it.
Records: `~/.claude/jobs/e8e9da13/tmp/baseline-full2/` and `baseline-s2`…`s8/`.
Premises: S2, S6 and S8 boundary/real-API homes exist as planned; S3's
installed-origin preparation costs only 0.12–0.26 s per case (packing is once
per run), so it is not the largest benefit.

### 2. Preserve review admission without browser or irrelevant history
Type: Structure
Status: done
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

Result: the four admission specs and mark admission now live in
`dashboard/tests/boundary/` with `request` and `serverMode: "boundary"`; refusal,
both commit-admission cases and mark admission use the new minimal
`admissionWorktree` (story commit, real `--no-ff` trunk merge, unstaged edit,
later trunk commit only in the origin); file-text keeps `storyWorktree` and
one-shot keeps its real start/capture/retire path. Every status/body row and
nonmutation sentinel survived; mark admission gained an `observed()` sentinel.
Family 17/17 strict at default workers (`tmp/after-s2-default`) and twice at
`--workers=1` (33.7 and 38.8 summed s against 29.7 baseline, loads 8–14, with
untouched browser journeys also slower); no runtime gain is claimed. Refactor
reused `getReview` in file-text and one-shot (rerun 6/6, `tmp/refactor-s2`).
`docs/maintainer/dashboard-test-value-review.md` and the candidate record still
name the old paths; slice 9 reconciles them.

### 3. Prove model selection with fewer full starts and a cheaper dialog fixture
Type: Structure
Status: done
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
consumers only when changed. Expected gain is small (slice 1: about 2 summed s
from the origin swap of nine non-installed cases, plus one full start from the
refinement repetition). Keep the swap because the story requires catalog-only
cases not to prepare installed-start repositories, and report it as
simplification, not speedup. Non-installed cases: `codexModelCatalogCases.ts`
:9, :70, :141, :179; `codexEffortDialogCases.ts` :5, :79, :118;
`codexEffortWorkspaceCases.ts:41`; the ad-hoc iteration of
`agent-launch-codex-model.spec.ts:10`. Ad-hoc `cwd` assertions then name the
fake HOME project instead of `origin.project`.

Result: seven cases moved to `codexLaunch` with the read-only launch journey
(`codexModelCatalogCases.ts` and `codexEffortDialogCases.ts` now use only that
fixture), plus the ad-hoc shape of `agent-launch-codex-model.spec.ts`; the
execution shape stays on `codexStart`. `codexEffortWorkspaceCases.ts` keeps the
installed cases, including workspace confirmation (moved there in refactoring)
and the effort-only ad-hoc case, which the plan listed as non-installed but
which checks reporting input that only an installed launch workspace records
(`server/launchWorkspaceReporting.ts`). Refinement's selected model/effort now
reaches the first `thread/start` and persists in `refinement-starts.json`
before input in `agent-launch-preparation-codex`; its default native creation
stays observed on the retry. A retry never rewrites the kept start
(`server/preparationStart.ts:149-163`), and native creation follows the retry's
request (`server/hosts/codex/launch.ts:47-50`), as Claude's kept-start journey
also asserts. Family 30/30 strict (`tmp/after2-s3-default`, `tmp/after2-s3-w1`:
37.7 summed s against 43.9 at lower load); reported as simplification.

### 4. Retain phase integration without the host/workflow cross-product
Type: Structure
Status: done
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

Result: `agent-launch-start-phases` keeps only the Claude execution journey
(with its argv readiness check) and `agent-launch-preparation-phases` only the
Codex refinement journey; the stored-but-not-running case moved unchanged to
`boundary/agent-launch-start-kept-not-running.spec.ts`. Codex execution's
changed readiness stays owned by `agent-launch-start-codex`'s card-start test,
whose `expectExecutionInput(..., true)` asserts the stored start's
`changedSinceReview` and exact equality of the single `turn/start` handoff
block, including `- readiness: Changed since readiness review` (stricter than
the removed substring check). Only the cross-product wording "Starting
refinement in Claude Code…" lost its own observation; both template halves
remain observed. Family at `--workers=1`: 33.9 → 22.9 summed s, 38 → 27 s wall
(loads 5–7; `tmp/before-s4-w1`, `tmp/after-s4-w1`), all strict. Slice 9 also
settles the superseded rejection note at
`docs/maintainer/dashboard-local-test-timings.md:139`.

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
Slice 1 found the two races cost about 17 s each, mostly waiting inside
`openWhileStarting`; record that as a residual candidate in slice 9.

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

First fix the load-exposed synchronization in
`recentlyDoneSessionsSidebarPaging.ts` (wait for the page's observed re-arm, not
a synchronous `scrollTop`), proved by its family; diagnose any other slice 1
failure that recurs rather than rerunning it. Then run normal
`npm run test:dashboard` for the reference revision `e073d3f2` (a temporary
owned checkout) and the candidate back to back under the same load, and judge
the ratio with the loads recorded, since slice 1's two runs differed by 258 s. Include
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

CI run 41263584410 on slice 2's `332c1327` failed dashboard shards 2, 4, 9, 11
and 12 in `agent-terminal-done-question`, `agent-terminal-lifetime`,
`session-workspace-retirement`, `sessions-sidebar-navigation-cases` and
`agent-launch-ad-hoc-sessions` (project-choice `locator.check` timeouts). None
is touched by this story; the same shards failed on other branches built on
the banner change `c26577b5`, and trunk's `62defee5` ("Choose and check projects
through whichever banner control shows") repairs them, including
`recently-done-sessions-sidebar-paging`. Disposition: base defect owned and
repaired on trunk; the branch takes trunk before slice 3's publication so later
CI verdicts observe this story's changes. Slice 9 re-checks whether slice 1's
local paging failure still needs its own fix after that merge.

The source review established real duplication but also the unique completed
review radio round trip; its prior overlap description was incomplete.
Refinement was not needed: slices own separate cohesive correction/proof loops,
share one measurement protocol, and bound unknown cost premises in slice 1.
No remaining slice-specific concern identified by this preparation review.
Actual benefits remain hypotheses; the early probe and final re-profile own them.

## Story obligations

### G1. Kept-start "Default model" wording lost its only observation
Reported: slice 3 — "the 'Default' branch of the kept-start sentence (`src/StartEffects.tsx:81`) ... no other test covers 'with Default model'."
Story clause: "while retaining the important behavior those tests protect"
Disposition: proved by slice 3: `agent-launch-start-codex.spec.ts` card-start test asserts "This start requested Codex with Default model." on the reopened kept start
