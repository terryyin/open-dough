# Run and observe product-wide end-to-end tests

**Identity:** SEED-334#run-and-observe-product-wide-end-to-end-tests
**Source:** [Story](../../seeds/SEED-334-product-wide-end-to-end-tests.md#run-and-observe-product-wide-end-to-end-tests)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Developers run representative product workflows with `test:e2e`, run focused
frontend/backend groups independently, and read correctly attributed current
and historical proof. Deliver the source's three groups, inventory/behavior
preservation, tagged installed preparation journey, strict CI publication,
Intent navigation/display names and migration semantics. Add no future service,
new native-agent acceptance, release, benchmark or generic runner registry.

## Architecture and existing solutions

- Put representative specs in `e2e/`; keep `dashboard/frontend-tests/` and
  `dashboard/backend-tests/`. Commands are `test:e2e`,
  `test:dashboard:frontend`, `test:dashboard:backend`. Remove `test:dashboard`
  at the coordinated runner/CI switch in slice 4.
- Reuse duration dealing (`scripts/share-deal.mjs`), strict reporter/proof
  records, fixture artifact/process ownership, repository builders and existing
  CI actions. Share mechanism, not one mutable setup/output namespace. Keep
  dashboard-specific non-registering support with its existing owner unless a
  concrete dependency requires a move. A future service needs no scaffolding.
- Preserve declared `test.location` as case-file proof identity and enclosing
  spec as shard/timing identity. Move case-registering modules with their cases;
  do not rewrite attribution to conceal an outside-root module.
- Literal entry paths retain identity. Configured labels name entries, including
  **E2E Test**, with path/source context still accessible. Historical paths and
  records remain unchanged; no `dashboard/tests` → `e2e` alias or rewritten past.
- Follow [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  (immutable release, no branch fallback),
  [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  (complete real installation),
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  (deterministic versus native evidence), and
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  (source authority and evidence distinctions). No conflict found. Existing
  [North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
  supplies sufficient direction; add no new topic.

## Baseline and decisive premises

Observed 2026-11-13 at `66375ceaaa2e08dbc7ce3ec90bce207abaece4e0`:

| Premise / consumer | Observation, result and remaining boundary |
| --- | --- |
| Current runner discovers a finite inventory; slices 1–4 must preserve it | `npm run test:dashboard -- --list --reporter=json` exited 0, no errors: 1,015 selected specs (598 integrated, 27 frontend, 390 backend), 2,717 declarations (1,319/55/1,343 by case-source root). Selection only; repeated with checkout-local locked dependencies at Playwright 1.65.0, same counts (excluding the named scratch probe). Refresh at execution base before moving sources. |
| Case provenance differs from spec timing; slices 1–4 and 6 consume it | JSON declared locations include 17 non-spec registering modules. `ProofRecord` records location; `ci-proof-fragments.mjs` consumes it; `SpecTimes.specFile` consumes the enclosing file suite. Preserve both mappings and test the actual transformed reports in slice 4. |
| Existing collection supports independent parts and strict absence; slice 4 consumes it | `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/ci-proof-actions.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs tests/support/intent-ci-scope-history-gaps.test.mjs tests/support/intent-ci-scope-history-timing.test.mjs tests/support/intent-ci-comparison-sort.test.mjs` passed (silent, exit 0). Actual YAML shell replay with different part counts, missing report and file attribution passed. New producer declarations/hosted run remain delivery proof. |
| Existing comparison/history distinguishes changed scopes; slice 6 consumes it | Same focused run passed: absent entries and changed owning entries become gaps; new comparison paths have no unsupported timing delta. Inspected current/historical settings readers. Add explicit old `dashboard/tests`/new `e2e` navigation and label regressions, rather than claiming those new examples already passed. |
| A published tagged installation supports preparation; slice 5 consumes it | Published `v0.3.97` peels to `d2d303b6215e3c707a75a8a257b98dc257e1bc7b` (verified with `git ls-remote --tags origin refs/tags/v0.3.97 'refs/tags/v0.3.97^{}'`). Its real installer produced version 0.3.97 and 22 skills in an isolated queued project; a packed bare origin supplied the complete installed input. The full maintained refusal/restart/retry scenario now passes with ordinary and complete tagged inputs at the unchanged 30 s case budget; see accepted prerequisite proof below. Earlier failures and their traces remain at `/tmp/seed334-observation-evidence-RBcpBv`; the start-only pass was not used to clear them. |

Derive all 17 registering sources and exact paths from native JSON: production
update journeys/policies; Codex boundary effort and model/effort dialog/workspace;
five mounted comparison modules; Cursor effort dialogs; story-card touch start;
feedback-maintenance due/eligibility; agent-session Cursor unavailability and
former-height sidebar. Include their paths in Intent without exposing fixture-only support.

Before the first migration edit, capture selected spec → registration-source →
case identity/behavior → destination/surviving proof, real integrations and
simulated external boundaries, all 13 old dashboard shard
memberships, `dashboard/longest-first`, current proof entries/parts and frontend
artifact inputs. Keep this execution evidence with this plan; reconcile every
item after migration. Totals find loss/double assignment but do not prove
behavior; replacement proof must pass before any variant is removed.

## Verification and execution rules

- Apply [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  as written to every local/hosted failure, including earlier failures and
  failures in other groups. Carry that link into every delegation/repair.
- Local gates: focused changed-boundary tests and their traced consumers,
  `npm run lint`, `npm run typecheck:dashboard`; at the final migration gate run
  all three new groups and `npm test` because shared setup, selection, resource
  admission and CI proof fixtures have distributed consumers. Final completion
  requires hosted all-group proof on the final candidate as well. Sequence full
  runs under maintained admission. From a fully awake macOS machine on AC use
  `caffeinate -s -i`; on battery plug in or use lid-open `caffeinate -i` and read
  the sleep log, per [machine sleep](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Before expensive runs inspect host load, memory, competing work and scope;
  choose bounded concurrency preserving coverage. No elapsed-time waits,
  `test.slow()`, suite/hook timeout overrides, or rerun-until-green.
- Before test edits/delegation run installed `test-entry-rules.mjs` on exact
  paths. Current three roots select MakeMe; both browser roots select page
  objects. `e2e/` currently selects neither: add its explicit MakeMe/page-object
  entry before moving/authoring there, then rerun selection. Helpers follow
  consuming tests. Reuse `tests/support/makeMe.mjs` and focused page owners.
- At every slice trace changed contracts, removed paths/literals and new
  preconditions using installed consumer-trace tooling; run or justify reuse
  for the full affected boundary. Perform independent post-change refactoring
  before commit; preserve scenario inputs and independent assertions.
- Future checks below are acceptance obligations, not claims about current
  proof. Add a discriminating check where existing assertions do not cover the
  promise. Slice delivery owns applicable asynchronous CI diagnosis/repair.

## Ordered slices

### 1. Run focused dashboard presentation checks independently
Type: Behavior
Status: done
Proof: Native JSON selection for `npm run test:dashboard:frontend -- --list`,
focused actual frontend runs and moved presentation cases; current CI remains green.

Behavior: A developer requests focused dashboard UI checks → the frontend
runner executes only its owned presentation/interaction/recovery cases, under
its own setup invocation, worker/shard inputs and outputs → its observed results
can be obtained without starting the E2E runner. Inventory current integrated
cases by proof purpose; move presentation-only cases and registering modules
with controlled backend answers while preserving every observed rule. Keep real
integration where its assertion needs it. Update placement/command guidance.
Prove direct-config/non-root-CWD invocation, concurrent output isolation,
interruption cleanup and full-suite admission when introducing this runner.
Preserve enduring real/substituted-boundary descriptions for retained journeys.
The old umbrella remains the CI entry temporarily through slice 4; it still
selects the moved frontend sources exactly once.

Accepted proof (2026-11-13): baseline manifest and reconciliation beside this
plan ([migration-manifest.md](migration-manifest.md)): umbrella 1,015 specs /
2,722 cases (all 2,717 base cases once, plus 5 new lifecycle cases in
`migration-added.json`); frontend runner native list 52 specs / 153 cases,
only `frontend-tests/`, full run 153/153. Moved: 25 mounted-comparison specs
and their 5 registering `mountedComparison*Cases.ts` modules to
`frontend-tests/intent/` (imports only). Runner settings share
`dashboard/tests/support/runnerConfig.mjs` (per-prefix split/times/proof
record/deadline/run stamp, admission, run options) and `runLifecycle.ts`
teardown. Lifecycle proof in `backend-tests/intent/proof-record-entry.spec.ts`
(direct config from another CWD, concurrent frontend×2 + umbrella outputs),
`dashboard-artifact-demand`/`run-processes` (interruption, teardown sweep) and
`tests/support/local-test-suite-focused-runners.test.mjs` (admission; renamed in slice 2).
Learnings: the frontend runner still deals by the shared `dashboard/longest-first`
(labels relative to `dashboard/`); slice 4 gives each producer its own list. The
remaining 573 integrated specs are pending inventory (obligation G1).

### 2. Run focused dashboard boundary and harness checks independently
Type: Behavior
Status: done
Proof: Backend JSON selection and actual focused endpoint/runtime cases;
source freshness, concurrent origins and failure cleanup remain observed.

Behavior: A developer requests `test:dashboard:backend` → only focused server
and runtime-contract cases run under their independent setup/settings/output →
variants and failures remain observable without a browser workflow. Move no-page
and harness checks from the old integrated root to their proper focused owner;
refactor fixture setup only when needed to preserve their stable boundary.
Keep true external substitutes explicit. Update backend placement/invocation
and per-journey boundary descriptions. Prove direct-config/non-root-CWD use,
concurrent outputs, interruption cleanup and full-suite admission here.
The old CI umbrella still selects these destinations through slice 4.

Accepted proof (2026-11-13): `npm run test:dashboard:backend` →
`dashboard/backend.playwright.config.ts` (shared `prepareFocusedRun` in
`runnerConfig.mjs`; setup `backendGlobalSetup.ts` with `serviceRunSetup.ts`;
unregistered artifacts answer 404 naming the run's setup). Native lists:
umbrella 1,032 specs / 2,727 cases (every base case once plus 10 new proof
cases, `migration-reconciliation-slice-2.json`), backend 414 / 1,399, frontend
52 / 153. Full backend run 1,398 passed, 1 opt-in skip. Moved: 7 whole specs
(3 session, 4 runtime harness), one registering module, and 29 server-boundary
cases split from 17 integrated specs (`migration-case-moves.json`); 63/63 and
38/38. Lifecycle cases now live in `backend-tests/runtime/runner-ownership.spec.ts`
(both focused runners, direct config, concurrent frontend×2 + backend×2 +
umbrella) with `run-processes`, `dashboard-artifact-demand` and
`tests/support/local-test-suite-focused-runners.test.mjs`. A flaky held-auth
release in `fixtures/fake-gh` (macOS `fs.watch` latency) was repaired and
proved with `--repeat-each=5`.
Learnings: of the remaining 566 integrated specs, 546 open a page in every case
and 17 keep page journeys after their server cases split out; 3 are
production-watcher chains (`migration-classification.json`). Slice 3 decides
workflow versus detailed UI for them (G1). The first full backend run at load
~30 failed 12 timing-bound cases that passed in the clean run (G2).

### 3. Run representative workflows from product-wide sources
Type: Behavior
Status: done
Proof: Compare the refreshed manifest against native runner JSON; run moved
journeys and all affected shared-fixture consumers, including registration
modules. Existing CI must publish the new paths correctly in this slice.

Behavior: A developer runs `test:e2e` → its dedicated config/lifecycle selects
and executes representative workflows from `e2e/` → product results and case
sources are observable independently. Move genuine workflows and registering
modules there; preserve complete scenarios and per-journey boundary descriptions.
Prove direct-config/non-root-CWD use, concurrent outputs, interruption cleanup
and full-suite admission here. Correct imports, root derivation, TypeScript membership,
ESLint test rules/exceptions, source links and output paths. Reuse dashboard
support without moving unrelated helpers. Update Intent to `e2e` with label
**E2E Test** and matching explicit case-source includes. During this interim,
the old runner discovers the new root and emits `e2e` proof instead of the
retired `dashboard/tests` entry; update CI entries/expectations atomically so
native selection proves the umbrella admits the sibling root, excludes retired
sources, and selects every destination exactly once across all old shards;
discovery roots, mapped timing labels and proof expectations agree. Prove
helper attribution from the produced report. Slice 4 removes this umbrella.

Accepted proof (2026-11-13): `npm run test:e2e`
→ `e2e/playwright.config.ts` (prefix `OPEN_DOUGH_E2E`, setup
`dashboard/tests/support/e2eGlobalSetup.ts`, `chromium-deployments` for the
production chains). All 566 remaining integrated specs were read by purpose
(`migration-purpose.json`): 301 workflows moved to `e2e/<feature>/` with 7
modules (4 registering), `first-open-waits-for-read` to backend. Intent entry
`e2e` (**E2E Test**) and CI `entries`/`expect` `e2e=13:case` added beside the
kept `dashboard/tests` entry. Native lists: umbrella 1,033 / 2,731, e2e 302 /
560, frontend 52 / 153, backend 415 / 1,407; `migration-reconciliation-slice-3.json`
every base case once; each of 13 umbrella shards selects every destination once.
Full e2e run 549 passed; the production chain failure (also at base) was an
`fs.watch` latency defect in `watcherEvents.ts`/`productionBuildGate.ts`,
repaired (30/30 at `--repeat-each=3`); two Intent prior-build cases are
load-sensitive (G8). The refactor reorganized all 18 moved specs that exceeded
250 lines along existing support owners (32/32 e2e, 8/8 umbrella, 7/7 backend).
Oversized: about 72 minutes implementation plus 25 minutes refactor. Failed
sizing assumption: detailed UI checks could reach the frontend group with
existing controlled answers. 204 detailed-UI and 59 mixed specs need new
substitutes (settings, launch, sessions/terminals WebSockets, story review,
Intent CI/proof/history, board/navigation), 145 of them large; batches and
per-case splits are in `migration-conversion-batches.json`. Terry chose
(2026-11-13) to split them out: SEED-334's interim **Dashboard Integrated UI
Test** group keeps them (slice 4), and SEED-334#focus-detailed-dashboard-ui-checks,
first in the backlog, converts them (G1 owner changed). Hosted CI on `8d61061`
(run 43374366861) passed and its summary publishes `e2e`: 559 passed, 1 other,
13 parts, 306 files including the 4 registering modules under `e2e/`.

### 4. Run and publish independently owned test groups
Type: Behavior
Status: done
Proof: All four native JSON lists and actual runs; runner isolation regression;
CI action/declaration/frontend-artifact replays; an actual hosted migrated run
showing producer matrices, counts, outcomes, durations and file attribution.

Behavior: CI runs the independently runnable groups → each producer owns its
setup/workers/shards/timing/proof outputs → changing E2E settings leaves both
focused selections and settings intact. Reuse local runner proof from 1–3;
retire `test:dashboard` and the umbrella config. Per Terry's 2026-11-13 owner
change, the 264 specs left in `dashboard/tests/` become the interim
**Dashboard Integrated UI Test** group: `npm run test:dashboard:integrated`
with its own config (reuse `prepareFocusedRun`), setup, CI producer and
labelled Intent entry, removed later by
SEED-334#focus-detailed-dashboard-ui-checks. Repair or prove stable the
load-sensitive cases owned here (G2, G8) under the failure policy.
Give each CI producer its own matrix/allocation and report destinations;
change fragments, `ci-proof.needs`, expected part counts and timing inputs
in the same green change. Keep summary/frontend artifact names supported by
existing readers and retain strict missing/zero/list-only distinctions.
Map old timing labels to current spec destinations; size shards from actual
membership/durations without claiming speedup. Update `test-shares`,
`ci-container`, repeat helpers, concurrent-run/admission fixtures, setup docs,
all delivery commands, and live story/plan references to the appropriate group.
Recheck aggregate consumers of direct invocation, output ownership, cleanup
and full-suite admission at the final switch, reusing sufficient proof from 1–3.
Inspect hosted artifacts at the published revision; local replay cannot
substitute for that receipt. Failures stop dependent completion under policy.

Progress (2026-11-13, hosted observation pending): four group runners via
`prepareFocusedRun`; interim `npm run test:dashboard:integrated`
(`dashboard/integrated.playwright.config.ts`, `integratedGlobalSetup.ts`);
`test:dashboard` and the umbrella config retired. CI: `ci.yml` callers `e2e`
(6 shards), `dashboard-integrated` (5), `dashboard-frontend` (1),
`dashboard-backend` (4) of reusable `browser-test-group.yml`, each with its own
duration list, artifacts and fragments; `expect` e2e=6, dashboard/tests=5,
dashboard/frontend-tests=1, dashboard/backend-tests=4. The CI-time reader
(`dashboard/server/ciWorkflowJobs.ts`) now reads reusable-workflow callers;
comparison fixtures read a frozen `fixtures/observed-runs-ci.yml`. Native lists
E2E 302/560, integrated 264/611, frontend 52/153, backend 415/1,411;
`migration-reconciliation-slice-4.json` every base case once plus 18 added.
Local gate: frontend 153/153, integrated 611/611, backend and E2E passed after
two found defects were fixed (G11 open); lifecycle 33/33; G8 repaired (6/6,
8/8 at 4 workers). G2: three cases repaired; Terry chose (2026-11-13) to move
`production-deployment:62` and `production-publication-fixture:175`
preparation into worker fixtures under the existing 60 s cold-input worker
bound, keeping the 30 s case budget. `landed-ci-follow-up-reading` ×2,
`landed-ci-repeat-reconciliation` ×3, `landed-ci-scope-*` ×3 and
`story-branch-landing-capture` ×3 are owned by the active
execution SEED-324#close-landed-ci-repeat-check-gaps (its own G2
and uncommitted `landedCiHistoryTest.ts` edits); no duplicate repair here.

Hosted proof (2026-11-13): run 43411925055 on `da25819` passed with jobs e2e
×6, dashboard-integrated ×5, dashboard-frontend ×1, dashboard-backend ×4; its
summary has every part present per entry with files only inside each entry,
and `frontend-test-proof` names only `dashboard/frontend-tests` files. Repairs
after it: G2 worker fixtures (`publishedMainWorkerFixtures.ts`,
`pinnedDeployment.ts`; 39/39 repeats at load 39.6), G11 worker-prepared
queued origin (repeats at load 27–30), G12 (deadline-stopped jobs now report
their own elapsed seconds; repeat-transport `fs.watch` hang; workspace
publication and native admission jobs split by journey), G13 (CI mailbox polls
instead of macOS FSEvents watches, whose close blocked the worker past its
stop deadline; ESRCH during termination counts as gone; 48–72 concurrent
stress passes). Final `npm test` (22:11–22:53, load 77→14 on the 15-minute
average) had no TIMEOUT and no G13 failure but failed two native admission
journeys (G14).

Final gate (2026-11-14): host-exit diagnostics for G14 in
`tests/support/native-agent-publication.sh` and the substitute suite; G15
split the one-shot results job by journey. Whole `npm test` 08:03–08:17
passed 635 jobs (load 7–16, no sleep). Terry (2026-11-14) made G14 a scoped
exception owned by SEED-345 and left the remaining landed CI cases with
SEED-324's active execution (G2).

**Former slices 5 and 6.** Terry moved them (2026-11-14) with their promises to
SEED-334#observe-tagged-install-and-read-e2e-proof, queued first; their text
and premises remain at `d21a0ebc5ee0426f9898d10725c9e7765f49bc8e` (obligations
G10 and G16).

## Execution complete

Product advice: Retain the delivered runners: four independently runnable,
separately published groups that reconcile every base case once. Keep
SEED-334#observe-tagged-install-and-read-e2e-proof first in the queue; it
delivers E2E Test naming and history in Intent and the tagged installed
workflow, closest to the near-future direction of reviewing intent protection
through maintained high-level tests and CI proof. Queue the correction
SEED-334#keep-one-browser-test-group-roster ([plan](../617-keep-one-browser-test-group-roster/PLAN.md))
ahead of SEED-334#focus-detailed-dashboard-ui-checks so that story's group
removal becomes a single edit, and plan the detailed-UI story by its recorded
conversion batches: this execution disproved the assumption that existing
controlled answers suffice (204 detailed and 59 mixed specs need new
substitutes, 145 large). No new feature recommendation.

## File-size decisions and cumulative design

Inspected anticipated runner/proof consumers do not exceed 250 lines;
`ci.yml` is 250, `startOriginPreparation.ts` 248, `test-shares.mjs` 247 and
`quietReporter.ts` 241. Keep growth cohesive under the existing file-size check.
Expected import-edited/moved oversized specs have these reorganization owners:

| File (lines) | Cohesive seam / callers and preserved proof | Slice |
| --- | --- | --- |
| `configuration/project-remove.spec.ts` (252) | Reuse `systemSettingsPage` remove/back operations; retain all three disk/restart/re-add/selection journeys and assertions. | 3 |
| `launches/agent-launch-model.spec.ts` (277) | Reuse/extend `launchStoryCardPage` dialog composition and model/effort controls; preserve complete argv/default/failure workflows and any focused UI variants. | 1, 3 |
| `sessions/agent-launch-attention.spec.ts` (257) | Share the named three-session roster with attention fixture data; retain both counts/read-failure and Taken/orphaned-session scenarios. | 3 |
| `sessions/agent-launch-session-state-pace.spec.ts` (254) | Separate complete terminal/Mark-as-done acknowledgment from listing/host-transition pace; retain each ordered journey using existing pace/terminal owners. | 3 |
| `backend-tests/launches/start-origin-isolation.spec.ts` (262), if edited | Separate whole concurrency, working-source freshness and failure-cleanup contracts; reuse `startOriginObservation`, preserve each outcome and add released provenance beside freshness. | 5 |

Recheck edit scope before delegation. One rule governs the sequence: each behavior has
one cheapest sufficient proof owner; registering sources follow it, while shared
lifecycle/reporting mechanisms remain shared. Group separation does not justify
parallel proof schemas, fixture registries or a framework for future services.

## Preparation assessment

Six slices remain: each runner owns its lifecycle proof on introduction; CI switching and historical reading retain their own observations. Migration and hosted proof remain execution acceptance work.

Accepted prerequisite repair, 2026-11-13, based on `8f70215aca94`:

- The recovery case waits for Story A's preparation and refusal/session results instead of draining unrelated page reads. Full restart, retry, observer/reload, native-input, durable-record and independent Git-origin assertions remain.
- Cold shared inputs exceeded the inherited 30 s worker slot, then completed before a replacement worker received them in 18 ms. Their owning worker fixtures now have a separate 60 s bound; every scenario, private setup and observation keeps the default 30 s case budget. Demand, failure, interruption and cleanup stay owned by the existing run.
- `caffeinate -s -i env -u OPEN_DOUGH_START_ORIGIN_PREPARATION OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed334-worker-budget-recovery-proof.json npm run test:dashboard -- tests/launches/agent-launch-preparation-codex.spec.ts tests/launches/agent-launch-start-codex.spec.ts --workers=1` passed 2/2 (13.253 s preparation, 12.664 s execution).
- `caffeinate -s -i env OPEN_DOUGH_START_ORIGIN_PREPARATION=/tmp/seed334-ready-tagged-tjiWvS/prepared OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed334-worker-budget-tagged-proof.json npm run test:dashboard -- tests/launches/agent-launch-preparation-codex.spec.ts --workers=1` passed the complete tagged scenario (6.542 s). Setup and pinned identity: `/tmp/seed334-setup-tagged.mjs`, `/tmp/seed334-ready-tagged-input.json`.
- Under AC `caffeinate -s -i`, `npm run test:dashboard -- backend-tests/runtime/dashboard-artifact-demand.spec.ts --workers=1` passed all five app/bundle completion, failure and interruption cases; `npm run test:dashboard -- tests/launches/responsive-session-start.spec.ts tests/intent/intent-summary-story-comparison-sort.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts --grep 'before Start|Summary keeps its sort|saved accepted requests never invent' --workers=1` passed three cases covering the other changed worker profiles. Both used ordinary input; proof is `/tmp/seed334-worker-budget-artifact-lifecycle-proof.json` and `/tmp/seed334-worker-budget-other-profiles-proof.json`.


## Story obligations

### G1. Detailed UI checks remain in the integrated root
Reported: slice 1 — "The remaining 573 tests/ specs are not inventoried by behavior yet. The manifest marks them pending: slice 2/3 inventory."
Story clause: "move detailed UI, server and harness checks to their focused owner"
Disposition: owner changed "moves those checks to Dashboard Frontend Test and removes the interim group"
Commitment: 2c.1


### G2. Load-sensitive backend cases fail at high host load
Reported: slice 2 — "Several backend cases are sensitive to load because of fixed 5 s expect.poll bounds and the 30 s case budget (landed-ci repeat/follow-up, production-deployment/publication). They passed in a clean run but failed at load around 30."
Story clause: "throughout the migration, including failures attributed to the prior layout"
Disposition: owner changed "execution is repairing stay with that execution"
Commitment: R3b

### G3. Moved backend session specs still wait on wall-clock time
Reported: slice 2 — "cursor-runner-sessions-sharing (delay(reuseMs+200)) and cursor-session-alerts (awaitAlertPolls, a 350 ms wait) moved unchanged and still wait on wall-clock time. Fixing them needs a controlled reuse/alert clock in the server, which is a product change."
Story clause: "throughout the migration, including failures attributed to the prior layout"
Disposition: no user cost "understand their purpose and observed results in Intent and CI": the waits predate this story and were relocated byte-for-byte; both specs pass under the backend runner and in the umbrella, so the move changes neither their observed results nor their stability; replacing the waits needs a server-side controlled clock outside this story's runner migration.

### G8. Two Intent prior-build cases time out at high host load
Reported: slice 3 — "intent-scope-prior-build-average and -prior-build-states failed at load ~38. They passed alone (8.7 s, 7.4 s) and at load ~18 with 2 workers ×3 took 12.9–24.1 s and 10.6–19.2 s against the 30 s budget."
Story clause: "throughout the migration, including failures attributed to the prior layout"
Disposition: proved by slice 4: e2e/intent/intent-scope-prior-build-average.spec.ts and -prior-build-states.spec.ts serve the worker's kept comparison story; 6/6 at load 19→15 (5.7–11.4 s), 8/8 at 4 workers, passing in the full E2E gate and hosted run 43411925055

### G9. Moved E2E specs still wait on wall-clock time
Reported: slice 3 — "Wall-clock waits in moved specs (left unchanged, as G3 was): limited-reading-detail (3 s setTimeout), published-facts-isolation (1 s), revision-stream-stopped/-visibility (page.waitForTimeout); and in a shared helper, support/voiceRecovery.ts waitForTimeout(200)."
Story clause: "throughout the migration, including failures attributed to the prior layout"
Disposition: no user cost "understand their purpose and observed results in Intent and CI": the waits predate this story and moved with only import-path changes; their specs pass in the E2E run, so relocation changes neither their observed results nor their stability; replacing them belongs to each journey's own synchronization work, not to the runner migration.

### G10. Moved E2E specs lack enduring boundary descriptions
Reported: slice 3 — "103 moved specs have none; their boundaries are recorded only in migration-purpose.json. The README states the shared boundary set."
Story clause: "Identify each representative journey's real integrations and simulated external boundaries"
Disposition: owner changed "This story keeps the runners, inventory, CI publication and their guidance"

### G11. A reconciliation E2E case nears its budget at moderate load
Reported: slice 4 — "e2e/launches/responsive-session-reconciliation-kept.spec.ts:58 timed out in the full E2E run at load ~9–16. With --repeat-each=4 --workers=4 it passed 8/8 but took 17–25 s of its 30 s budget."
Story clause: "throughout the migration, including failures attributed to the prior layout"
Disposition: proved by slice 4: e2e/launches/responsive-session-reconciliation-kept.spec.ts uses queuedClaudePreviewTest (worker-prepared queued origin, app and bundle); A/B repeats 4/4 twice at load 27–30 against a baseline 2/4 timeouts, file 6/6 at load 19–23; hosted run 43456218540 on d21a0eb passed

### G12. Repository test jobs outlived their safety deadline
Reported: slice 4 — "Run 2 failed with three safety-deadline TIMEOUTs: workspace-publication.test.mjs after 2,202 s, git-publication-native-admission.sh after 2,122 s, and ci-github-workflow-repeat-transport.test.mjs after 215 s ... a runner job outlived its 180 s safety deadline by about 33 minutes, so the deadline did not end it."
Story clause: "throughout the migration, including failures attributed to the prior layout"
Disposition: proved by slice 4: tests/support/test-runner-deadline-elapsed.test.mjs (failed first) proves deadline-stopped jobs report their own elapsed time; repeat-transport polls (72/72 concurrent at load 14–57); workspace-publication and native admission jobs split by journey; whole npm test runs 19:54–20:57 and 22:11–22:53 had no TIMEOUT; hosted run 43456218540 passed

### G13. CI mailbox lifecycle checks fail under whole-suite load
Reported: slice 4 — "src/skills/dough-execute-plan/scripts/ci-mailbox-removed-worktree.test.mjs:112 ... failed in the whole-suite run at load up to about 49. The observer ended in state lost with 'CI observer terminal result was not published before its lifecycle deadline' instead of ended. It passed 3/3 alone right after ... The earlier slice-4 full run had ci-mailbox-complete.test.mjs fail in a similar way."
Story clause: "throughout the migration, including failures attributed to the prior layout"
Disposition: proved by slice 4: ci-mailbox-change-watch.mjs and ci-mailbox-store.mjs poll instead of FSEvents watches, ci-mailbox-worker-process.mjs treats ESRCH as gone; failing-first tests in ci-mailbox.test.mjs and ci-mailbox-worker-loss.test.mjs; ci-mailbox-removed-worktree 72/72 twice at load up to 239, ci-codex-stop-lifecycle 48/48; final npm test 22:11–22:53 had no G13 failure

### G14. Native admission substitute journeys end with an empty stream
Reported: slice 4 — "FAIL: tests/git-publication-native-admission-correction.sh: substitute claude admission-correction exited 1, assessment fail: incomplete or stale native stream (missing) ... the claude substitute admitted the claim (claim-owned: true, claim-admitted: true) but left events.jsonl, response.md and stderr.log empty."
Story clause: "throughout the migration, including failures attributed to the prior layout"
Disposition: owner changed "is a scoped exception owned by"

### G15. A one-shot native publication job outran its safety deadline under heavy load
Reported: slice 4 — "In loop B round 2, at 15-minute load about 39 (1-minute peak 105), tests/git-publication-native-one-shot-results.sh failed: TIMEOUT … (safety deadline 180s; after 180.1s)."
Story clause: "throughout the migration, including failures attributed to the prior layout"
Disposition: proved by slice 4: tests/git-publication-native-one-shot-results.sh and new -reviews.sh split the serial job by journey (27.4 s and 18.3 s alone versus 44.1 s; 148–158 s and 105–129 s under 12 looping jobs at load up to 33, where the old job took 244–264 s); final npm test 2026-11-14 08:03–08:17 passed 635 jobs with no TIMEOUT

### G16. Tagged installed journey and Intent reading moved to a follow-up story
Reported: slice 4 — "Terry chose (2026-11-14) to finish slice 4 and move slices 5–6 into a new story queued first."
Story clause: "This story keeps the runners, inventory, CI publication and their guidance"
Disposition: owner changed "This story keeps the runners, inventory, CI publication and their guidance"
