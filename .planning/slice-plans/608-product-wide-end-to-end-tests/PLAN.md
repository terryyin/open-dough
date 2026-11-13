# Run and observe product-wide end-to-end tests

**Identity:** SEED-334#run-and-observe-product-wide-end-to-end-tests
**Source:** [Story](../../seeds/SEED-334-product-wide-end-to-end-tests.md#run-and-observe-product-wide-end-to-end-tests)

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
Status: planned
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

### 2. Run focused dashboard boundary and harness checks independently
Type: Behavior
Status: planned
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

### 3. Run representative workflows from product-wide sources
Type: Behavior
Status: planned
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

### 4. Run and publish three independently owned test groups
Type: Behavior
Status: planned
Proof: All three native JSON lists and actual runs; runner isolation regression;
CI action/declaration/frontend-artifact replays; an actual hosted migrated run
showing producer matrices, counts, outcomes, durations and file attribution.

Behavior: CI runs the independently runnable groups → each producer owns its
setup/workers/shards/timing/proof outputs → changing E2E settings leaves both
focused selections and settings intact. Reuse local runner proof from 1–3;
retire `test:dashboard` and the umbrella config.
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

### 5. Observe a complete tagged installed preparation workflow
Type: Behavior
Status: planned
Proof: `npm run test:e2e -- <released-preparation-spec> --workers=1`, plus
focused source provenance/unavailable-release and working-tree freshness checks.

Behavior: A fixture installs complete Open Dough from published `v0.3.97`
(or another explicitly pinned published tag when a diagnosed incompatibility
requires it) → its dashboard starts story preparation → the installed command
publishes the expected profile at the bare origin. Verify release tag/resolved
revision/installation version and actual installed command path; retain those
inputs with the case's proof. Use real installer/repository builders and the
existing prepared-origin seam; isolate tagged and working-tree cache identities.
A missing/unverifiable pinned source fails clearly without branch fallback.
Reuse the full refusal/restart/retry prerequisite proof below; after migration,
verify that scenario and tagged provenance at the new path. Preserve the default
30 s case budget and separately bounded shared-input worker preparation.
Name browser/server/Git/script
integration and synthetic GitHub/native protocol boundaries in enduring docs.

### 6. Read the new entry and historical proof without false continuity
Type: Behavior
Status: planned
Proof: Focused Project Intent/Purpose/Proof navigation plus story comparison
and history regressions with old/new entries, matching focused scopes, missing
parts, reported zeros, and a registering helper's source; existing readers pass.

Behavior: A developer opens current **E2E Test** or a story spanning migration →
the correct settings/source revision and proof group appear → configured names
are used where an entry is named, source navigation resolves, old evidence stays
readable, and unsupported comparisons show explicit gaps/added/removed scopes.
Extend existing `IntentCiEntryLink`/location label ownership without changing
path identity or fabricating historical labels. Preserve generic scope+entry+
unit comparability; prove frontend/backend matched comparisons and unmatched
historical plain-text fallback. Update maintained proof/history documentation.

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
