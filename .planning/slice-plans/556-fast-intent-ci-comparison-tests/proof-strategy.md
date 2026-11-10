# Fast Intent CI comparison proof strategy

[Active plan](PLAN.md) · [Execution evidence](execution-evidence.md)

## Existing solutions and architectural direction

PFE found existing owners rather than a need for another comparison model:

- `dashboard/server/baseCiRevisionNearest.ts` already accepts revision lists,
  a `RevisionCiLookup`, a story-start bound and a proof-usability callback.
  Reuse that contract and the actual resolution code. The Done/Taken readers,
  Git first-parent reads, exact skipped/cancelled handling and artifact reads
  still mix acquisition with rules. Modularize only the concrete I/O necessary
  to exercise the real rule orchestration with arranged facts; do not mock
  internal rule collaborators or export private helpers solely for tests.
- `intentCiComparisonRead.ts`, `intentCiComparisonAnswers.ts` and the proof
  readers own retry and memory. Final-answer memory has no TTL. Drive those
  owners with counted external operations; do not invent a second cache.
- `dashboard/tests/support/frontendApp.ts` already serves the shared app build
  with route/WebSocket substitutes and no dashboard server or fake GitHub.
  Keep it for full-app integration. Its measured comparison journey took
  1,491 ms, so it is insufficient as the fast presentation-rule boundary.
  A bounded scratch entry using the existing Vite config/build API and
  `frontendAppServer.ts` mounted real comparison components/providers and
  exercised Show % and sorting in 593 ms. That route supplied slices 3–4's real
  mounted rules, but later CI disproved portable sub-second cost. The revised
  slices 6 and 8 use existing Vite SSR plus actual production CSS/browser observation
  for static rules and the production-used plain client reading owner for
  lifecycle rules. Retain live controls/transport connections. See the decisive
  [checkpoint and consuming probe](ui-pilot-evidence.md#supported-remaining-boundary).
  No new runner/dependency, replacement DOM or production test flag is needed.
  A prepared answer never proves backend resolution or transport.
- `tests/support/makeMe.mjs` already owns repositories, published sources, CI
  runs, adapter attempts, jobs, proof entries, launches and Done/landing records.
  Extend these builders and add a canonical comparison answer/slot builder
  where needed. Keep case-driving facts explicit. History arrangement belongs
  in the shared repository builder/harness, not a parallel test-local model.
- The repository snapshot/materialization support under `tests/support/` is
  the first candidate for immutable shared Git preparation. Reuse it where it
  saves retained integration cost. Do not prescribe APFS cloning or a mutable
  shared dashboard server; change lifecycle only if measurements justify it
  and isolated consecutive tests prove safe reset and teardown.
- `oneShotReviewChoices.ts` currently launches/captures each choice. Existing
  MakeMe launch/landing records can arrange reader preconditions. Preserve the
  actual launch/capture ownership in `review/story-review-one-shot.spec.ts`
  and `review/recently-done-one-shot-review.spec.ts`, inspecting their assertions
  before narrowing the Refresh cases.

Follow [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
especially direct domain mapping and stop-and-fix;
[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
which keeps Git/CI facts distinct from disposable derived answers; and
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
which requires an evidenced useful gain against a stated baseline.
The existing [One Intent workspace with landed CI evidence](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
direction keeps endpoint and scope interpretation shared. No new architectural
decision, North Star topic, comparison semantics or persistence authority is
needed. Do not change installed guidance copies for this test change.

## Outside-in proof ownership

Before removing a predecessor case, map its actual distinguishing assertions
to retained or replacement proof in this plan's execution evidence. Preserve
independent expectations, ordering/negative observations that are promises,
and integration observations that a substitute cannot establish. Consolidate
equivalent cases by fault-detection purpose, not by filename or line coverage.

| Source promise / important examples | Owning slice and observable signal |
| --- | --- |
| Minimal portable arrangement; every rule test <1,000 ms; no raised timeout; equivalent behavioral confidence | Every slice: strict ordinary-mode before/after profile including replacement cases, explicit MakeMe facts, default-timeout/static review and distinguishing failure control before predecessor removal. Final aggregate profile in slice 8. |
| Published Done/Taken endpoints, both modes, owning merge/fast-forward and earlier completion; exact/ancestor and skipped/equivalent provenance; adapter attempt identity/timing | Slice 1: browser-free comparison boundary returns independently named endpoint revisions, statuses and proof identities; representative real Git/provider/authenticated reads still reach the rendered comparison. |
| Cancelled landing's nearest usable later trunk build; proofless/unbuilt gaps, running/head/30-revision stops; exact-only timed-out/unexplained, bounded baseline/branch walks | Slice 2: arranged revision/run/proof cases assert selected build or precise gap, requested status and refreshability, plus retained cancelled-landing wiring. |
| Unavailable answer/slot/proof recovers, Check again busy state and read counts; final Done/proof reuse; Taken/head and awaiting-later freshness | Slice 3 accepted server memory/acquisition proof remains. Slice 8 replaces mounted client variants with actual request-state rules, held fetch/abort witnesses and real React busy/recovery/selection connections. Observe failure and recovery. |
| Shared endpoints/fallback through homepage, tree, Summary and file Proof; signed whole-second vs precise scope timings, zero/gaps, counts, source cues, sorting, shared scales and Show % | Slice 4's complete assertion maps constrain slice 6: actual production-rendered variants with real browser semantic/CSS/geometry observations, plus uniquely mapped live sort/Show %/drill controls. Retain acquisition, no-extra-CI-read and preference continuity connections. |
| Comparison stays visible with held/failed locations/Changed tests reads | Slice 3: retained full-app request held until observable release/rejection, comparison remains usable; preserve retry/selection and enclosing assertions. |
| Current Done pending/final rules after main integration | Slice 7: actual shared finality/memory over raw canonical receipt/history/artifact inputs, all 24 incoming rule-oracle mappings, retained real project-store/clock/provider-owner/persistence/UI connections. |
| Refresh retains selected captured run after new capture/session replacement, falls back newest → remaining → legacy gap after deletion/expiry | Slice 5: sub-second real record-reader/selection cases with directly stored MakeMe records; declared retained Refresh transport journey; actual launch/capture journeys prove record production. |

## Measurement and experiment procedure

The source retains a 2026-11-09 trace at load 17–19: cancelled-gap fixture
startup 20.6 s plus about 15 s Git publication before a 35.2 s timeout; retry
startup 2.1 s, publication about 5 s and two roughly 4.3 s reads, passing in
23.2 s. This is diagnosis evidence, not a successful full-family baseline or
a measured speedup. [DD-445](../../../docs/maintainer/project-test-findings.md#dd-445)
records unchanged review-refresh timing varying from 13.8 s to 26.5 s in CI.

Before the first implementation edit, capture the ordinary local family
baseline, including both review Refresh cases. Retain revision, exact command,
selection/case count, Node/platform, default workers/trace, cache conditions,
before/after load/memory, wall time and requested proof-record attempt timings.
Raw records stay outside Git. Reuse that baseline for unchanged groups; add
focused baseline observations only when necessary. Failed/incomplete attempts
remain failed/incomplete and are repaired under the project's failure policy.

Each slice follows dough-test-optimization's hypothesize → smallest meaningful
change → equivalent proof and comparable timing → retain/revise/revert loop.
Record expected removed cost, actual result and surviving proof for removals.
Include newly added tests and common setup in feedback measurements. Never
substitute summed case times for wall time or default two-worker feedback with
a faster diagnostic configuration. A one-worker/step profile is diagnostic.

Use the runner's caller-owned transcript (`OPEN_DOUGH_DASHBOARD_PROOF_RECORD`;
[proof record](../../../dashboard/tests/proof-record.md)) for exact selections,
strict terminal verdicts and attempt durations. Choose a fresh absolute path
outside `dashboard/test-results/` for each invocation. No custom reporter is
needed. Keep focused performance checks separate from correctness assertions
that would become machine-speed races.

After each slice compare the remaining gap with credible removable cost.
If the approach cannot plausibly meet the target, record the measurement,
invalidated assumption, consequence and authorized strategy change before
another dependent experiment. Changing the target or losing confidence needs
Terry's decision; a candidate entry alone cannot complete this story.

## Verification and execution gates

Follow [the project's failing and flaky test policy as written](../../../AGENTS.md#failing-and-flaky-tests)
for every plan slice, delegation and repair handoff. Attribution to base is not
an exemption; published failures remain owned through applicable final CI;
preserve another active repair owner's files; human exceptions retain only
their stated scope. Never rerun until green as a fix.

Use MakeMe for all domain arrangement, independent expected values outside
builders, observable events/controlled clocks, no sleeps, no `test.slow()` and
no `test.setTimeout` in this family. Establish replacement proof before deleting
the original, with a focused plausible wrong-behavior control when preservation
is uncertain. Changes to asynchronous synchronization need three consecutive
focused passes after the diagnosed fix, per dough-test-optimization.

The installed execution workflow owns source review, independent post-change
refactoring, consumer tracing, agent commits, delivery, retrospective and CI
repair. Search all consumers of changed lookup/read/cache/fixture contracts;
run affected suites within focused-check cost plus out-of-suite consumers.
Shared MakeMe changes require `npm run typecheck:dashboard` and their owning
Node/builder checks, because JS signatures are consumed by TypeScript
([test data architecture](../../../tests/README.md#test-data-architecture)).

Local gate: focused new/migrated comparison and review tests, retained wiring
and changed shared consumers, then dashboard typecheck and applicable hooks.
Before long runs inspect this host's load/memory, competing work and expected
cost. Start fully awake; on AC use `caffeinate -s -i`; on battery plug in or use
`caffeinate -i` with lid open and inspect the sleep log, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Full suites share the maintained admission mechanism and are not routine local
gates here; required family profiling is still owed. Use Homebrew Bash 5 first
on PATH for repository shell checks. Do not stop another story's tests.

Baseline selection (preserve ordinary default workers and tracing):

```sh
caffeinate -s -i npm run test:dashboard -- 'tests/intent/intent-ci-comparison' 'tests/intent/intent-summary-story-comparison' tests/review/story-review-one-shot-choice-refresh.spec.ts
```

For final measurement, retain that selection for surviving integration and
add the explicitly inventoried replacement backend/frontend paths. Record the
literal final command with those paths; a filename-pattern count alone does
not establish equivalent coverage. For focused preservation as appropriate:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/intent-ci-comparison-sort.test.mjs tests/support/intent-scope-comparison-wording.test.mjs tests/support/intent-scope-comparison-cues.test.mjs
npm run typecheck:dashboard
```

## Decisive premises and observed results

Preparation observations are from this owned checkout at
`dd7c8e15b8ccf917ea8bebc8755c6b72704a1214`, 2026-11-09, Node v24.21.0.
`npm ci --ignore-scripts --no-audit --no-fund` succeeded. No implementation is
authorized by this preparation.

| Premise / consuming operation | Consuming form/profile and result | Unverified remainder |
| --- | --- | --- |
| Resolve rule cases without subprocesses using the existing lookup | `node --input-type=module` imported `nearestRevisionBuild`; MakeMe supplied completed runs at nearer/older/start. With real proof-usability and bound handling, it selected `older`, `ancestor`, one skipped revision; bound-at-start returned undefined with zero run lookups. Assertions passed in 0.43 ms excluding import startup. | Done/Taken orchestration and concrete Git/artifact acquisition still need the minimal seam in slice 1; this does not claim full comparison coverage or final speedup. |
| Existing in-process slot/timing boundary executes without a browser, and frontend substitutes can run the real built app | `caffeinate -s -i npm run test:dashboard -- backend-tests/intent/ci-time-without-runner-waits.spec.ts frontend-tests/intent-candidates-read-recovery.spec.ts --workers=1` exited 0 under the strict reporter. | This proves current route availability, not replacement comparison fault detection or sub-second frontend cases. |
| The current runner discovers the claimed comparison family | `npm run test:dashboard -- --list --reporter=list 'tests/intent/intent-ci-comparison' 'tests/intent/intent-summary-story-comparison'` exited 0: 73 tests in 25 files. | Selection only; the pre-change execution baseline remains the first implementation prerequisite. |
| Directly arranged launch records can drive the actual review selection and retention rules | Native `node --input-type=module` imported `reviewLandedRunsOf`, `preferredReviewRun`, `reviewRunKey` and `withinRetention`. MakeMe arranged first/third captured records and a legacy record. Assertions observed newest-first `[third, first, legacy]`, explicit-time expiration left `[first, legacy]`, then legacy fallback; 0.16 ms excluding imports. | No record-store writes, session replacement or UI Refresh occurred. Slice 5 retains those distinct boundary/transport obligations. |
| Prepared comparison/proof answers can reach actual selected-story rendering through frontendApp | `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-frontend-scratch-proof-20261109-b.json npm run test:dashboard -- frontend-tests/scratch-ci-comparison-preparation.spec.ts --workers=1` strictly passed at 08:18:55Z. A MakeMe Taken Trunk profile and comparison/proofs produced Baseline 2 min / Provisional 3 min, without-waits 1 min 30 s / 2 min, active heading and entry +1 s, with exactly one comparison and two proof requests. Test 1,491 ms; runner 2,524.484 ms. | Rendering route settled, but full-app rule-test timing premise false for this observation. Summary/file/Show % were not covered. Scratch spec and builder getters were removed; retained source `/tmp/seed286-frontend-scratch-probe-20261109.ts`. |
| A smaller production rendering/interaction boundary is available below the target | `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-mounted-proof-20261109-a.json npm run test:dashboard -- frontend-tests/scratch-ci-mounted-preparation.spec.ts --workers=1` strictly passed on its first run: 593 ms per test, runner 1,625.126 ms, separate one-time Vite bundle build with existing `dashboard/vite.config.mts`. Actual IntentReadingProvider/Place/Scope, comparison preference/frame/summary, endpoints and entry table consumed MakeMe facts via production `comparisonEntriesOf`/`activeComparisonOf`. It showed Landed, 2/3/4 min endpoints, then actual Show % produced independently expected +100%, +50%, −50%, +100%; actual Baseline sort toggled ascending and descending. Cleanup unmounted the React root. | Settles a credible fast rule boundary, not all migrated cases or loaded/CI timing. Whole-app navigation stays retained integration. Scratch source/build script retained at `/tmp/seed286-mounted-probe-source-20261109-a/`; all checkout scratch edits removed. |

The host was on AC with 48 GiB memory, load 10.4/15.4/16.9 before the focused
run; another story's one-worker Intent run was active. Preparation chose one
worker and no full suite or 73-case timing run. Recheck headroom before actual
profiling; leave unrelated processes with their owners.

## Original preparation review

Slice-plan refinement ran in place after independent proof/measurement review.
Retain all five boundaries: each owns one feedback outcome, its real behavior,
proof-preserving migration, measured experiment and cleanup. Refine slices 3
and 4 to use the observed mounted production route for fast UI rules, retaining
whole-app transport/navigation; make slice 5's rule/transport boundary explicit
and require executed or matching retained launch/capture preservation proof.
The sequence shares one comparison and record model instead of accumulating
special-case resolvers. No Structure-only preparation slice, sizing exception
or story-resplit recommendation is needed. No remaining slice-specific concern
was identified after the revised approach's consuming-profile observations.
Every permanent replacement still owes discrimination, measured local feedback
gain and final local/CI threshold evidence during execution. No execution,
Take or story-completion claim is made by this plan.

## Earlier remaining-work refinement

At `2023e150...`, rejected loader/observer pilots were restored before refinement.
The actual SSR/static-browser consuming probe and independent boundary review
support seven slices: retain completed 1–5, presentation plus its controls in 6,
client request lifecycle plus aggregate acceptance in 7. The source's 130 texts
and target are unchanged; C067 remains final target CI. The checkpoint records
the measured remaining gap, supported different strategy and concrete limits.
No sizing exception, >15-slice recommendation or human decision is outstanding.
Retirement still requires fault-equivalent proof and each live connection;
the current strategy does not claim the complete family or CI target already met.

## Current remaining-work refinement

Exactc216/run42743624437/attempt1 settles the pre-integration201-rule checkpoint:
all17jobs pass, complete11–988ms; actual local248 ordinary/load3–298/3–660ms.
The prior8 client/presentation/finality proof stays at its unchanged boundaries.

Accepted-main2751 SEED-288 changes timed settled-none/retained collector policy.
[One bounded integration9](incoming-equivalent-integration.md) adopts that source
through existing factories/shared owners, preserves all incoming oracles and
renews actual integrated-family proof. Two state-changing same-process probes
come first; failure stops dependent migration. No false premise is called proved.

All130 source texts remain; six settled client/snapshot observations stay8,
50 remaining/global commitments move9, C067 stays blank/targetCI. G1/G3/G4/G5
record only the accepted checkpoint; G11 owns changed-source final proof.
Nine Behavior slices need no sizing exception or resplit. The same Taken
checkout/claim remains; no new admission or human decision is implied.
This actual refinement receives a fresh recorded readiness judgment after review;
ordinary slice delivery will not renew it. Retrospective/WrapUp follows settled9.
