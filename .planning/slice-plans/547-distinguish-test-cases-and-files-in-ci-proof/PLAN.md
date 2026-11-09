# Distinguish test cases and test files in Intent CI proof

**Identity:** SEED-281#distinguish-test-cases-and-files-in-ci-proof

**Source:** [Refined story](../../seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#distinguish-test-cases-and-files-in-ci-proof)

## Goal and scope

Developers can distinguish reported case outcomes, aggregate file outcomes,
and ambiguous legacy results throughout Intent's CI proof and comparisons.
Publishers can report both explicit units for one location, including one
path, with separate counts, outcomes, timing and evidence gaps. Read existing
GitHub Actions and CI adapter summaries during rollout. Adopt the format in
Open Dough CI and publish the protocol, collector and guidance through a
normal tagged release.

Keep source-inventory and matched-breakdown-path counts separate from reported
file outcomes. Do not extract inner cases from aggregate reports, synthesize
file outcomes from case paths, sum overlapping evidence across units, or turn
unknown evidence into zero. Other projects own their updates and CI migrations.
Layout unification and comparison presentation redesign belong to SEED-282;
which builds Intent compares remains unchanged.

## Existing solution and architectural direction

PFE: extend the shared `src/skills/dough-test-optimization/scripts/ci-proof-*`
contract, figures, converters and collector. They already own attempt identity,
declared parts, outcomes, duration, untimed results, unassigned figures and file
breakdowns. `dashboard/server/intentCiProofRead.ts` and `ciAdapterProof.ts`
already validate the same contract; `dashboard/src/ciProof.ts` validates the
browser response. Extend these consumers together. Keep each location's
reported evidence partitioned by semantic unit, using the same figures and
scope/comparison operations for every unit. A file breakdown groups results by
path; it does not change their unit.

Change the existing `ciScopeProof`, `ciScopeComparisonCounts` and
`storyCiComparisonCountsWords` responsibilities rather than introducing another
proof reader or a comparison model for each runner. Existing views and timing
gap rules remain their presentation owners. Version the changed contract;
normalize supported older summaries into explicitly legacy evidence at the
read boundary. Preserve the old raw unit label as provenance, without assuming
`tests` means cases or `checks` means files. A declared explicit unit, rather
than spelling or path count, establishes comparability.

Follow [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
for one direct domain model and [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for published proof authority and the existing local read boundary. The
[North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
supports the established observation/presentation split; no new topic is needed.
[ADRs 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
govern tagged distribution and whole-payload installation. Author guidance and
collector changes under `src/skills`, and keep required modules in
`install.sh`'s payload. Do not hand-edit installed managed copies.
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and [maintainer guidance](../../../AGENTS.md#runtime-audience) require publisher
instructions to address the executing project's own reports and configuration.

## Outside-in proof ownership

| Story promise | Owner | Observable proof |
| --- | --- | --- |
| Five reported cases and one file outcome coexist in one location/path without becoming six results | 1 | Generate new-format proof through the real converters/collector; read it through Intent and assert separately labelled case/file figures at the CI result, location, folder and file boundaries. |
| A failed file with no case report stays visible; timing and missing/ambiguous/untimed evidence stay with their unit | 1 | Mixed evidence with a failed file, independently timed cases, a missing part and an ambiguous part retains every outcome and gap without inventing cases or zero time. Source and matched-path counts remain independent. |
| Old and new summaries remain readable through GitHub and adapters | 1 | Retain literal v1 wire fixtures, add new wire fixtures, and observe both authenticated reader paths and the browser parser. Keep identity, size and invalid-summary refusals. |
| Baseline five cases/one file to seven cases/one file means +2 cases and unchanged files | 2 | CI comparison and location/folder/file drill-down assert compatible per-unit deltas for Baseline/Branch/Landed, including equal totals with different units. |
| Ambiguous legacy or missing evidence never supplies an explicit-unit delta or a synthetic zero | 2 | Legacy→new, cases→files, missing-unit, no-breakdown and unavailable endpoints remain labelled with no invented subtraction; other compatible groups still compare. |
| Open Dough publishes its actual report granularity and publishers can follow the guidance | 3 | Execute the actual composite action commands against representative runner reports; Playwright emits case results, shell/Node outcomes emit file results, and failed file jobs are retained. Replay GitHub and adapter recipes and review required-input stops. |
| Other publishers can obtain the protocol and collector through the normal release path | 4 | Verify remote trunk contains the release commit and the immutable annotated tag peels to it; inspect its declared payload and run the collector from that released payload. |

## Slices

### 1. Read explicit case and file evidence together

Type: Behavior
Status: planned
Proof: ownership rows 1–3; extend collector/converter contract checks,
`tests/support/dashboard-ci-proof-breakdown-read.test.mjs`,
`tests/support/intent-scope-proof.test.mjs` and existing Intent proof journeys.

Behavior: given reports of five cases and one aggregate file outcome for a
location, collecting and opening that attempt shows both units separately,
including when both name the same path. A file failure without cases stays a
file failure. Counts, time, untimed figures, parts and breakdown coverage never
migrate between units. A location with two matching source files still reports
that inventory separately.

Evolve the versioned fragment/summary representation and declaration so unit
identity participates in expected parts, fragment identity/output names,
duplicate detection and aggregation. A missing unit's declared part must be
observable even when no fragment arrived. Use explicit semantics for the new
case/file groups and preserve legacy input without guessing. Keep old producer
invocations usable during rollout; an outcomes report with unspecified
granularity remains legacy rather than being relabelled. The Playwright record
already reports individual cases. Carry the new representation through both
authenticated read paths, browser validation, current-result tables, scope
projection and file Proof. Align consuming fixtures and actual assertions.

Interim behavior: Open Dough's aggregate-outcomes producer still reports
legacy evidence until slice 3 explicitly declares its file granularity; it
remains readable. Slice 2 owns comparable deltas; slice 1 must keep newly
incompatible groups visibly uncomparable rather than enabling false deltas.

### 2. Compare only evidence with matching known units

Type: Behavior
Status: planned
Proof: ownership rows 4–5; extend
`tests/support/intent-scope-comparison-wording.test.mjs` and the existing
story CI comparison and selected-scope/file comparison journeys.

Behavior: comparing Baseline's five cases/one file with Branch or Landed's
seven cases/one file shows +2 cases and unchanged files in overall, location,
folder and file proof. Each endpoint keeps its unit and evidence status.
Legacy→new or cases→files changes show both labelled endpoints and why a count
delta is unavailable. Two ambiguous v1 summaries labelled `tests` (or both
`checks`) with different totals also show no numeric delta: identical raw
labels establish no semantic-unit match. A group absent at one endpoint is not a measured zero.
An explicitly reported zero in a compatible group remains a real zero.

Apply the same semantic-unit matching rule to overall and scoped counts,
sorting and timing figures. Keep separate durations when a publisher supplies
both aggregate file and case timing; never add them together or distribute file
time over cases. Preserve existing build selection, timing completeness and
unavailable-endpoint rules. Cover three-endpoint comparisons and equal totals
with different units so rendering cannot collapse away a unit change.

### 3. Publish explicit units from the project's actual reports

Type: Behavior
Status: planned
Proof: ownership row 6; extend
`tests/support/ci-proof-declaration.test.mjs`, collector CLI tests and adapter
contract proof; perform the representative guidance behavior review required
by [AGENTS.md](../../../AGENTS.md#behavior-review).

Behavior: running Open Dough CI publishes Playwright's individual cases as test
cases and each shell/Node job-file outcome as a test file, with existing
outcome/timing/part accounting. A Node file with five cases contributes one
file outcome; a failed file without inner case output remains failed.

Align `.github/actions/ci-proof-fragments`, `ci-proof-summary`, workflow
declarations and runner report handling with the real report granularity.
Do not add case extraction to `scripts/test.sh`. Update the publisher reference,
CLI help and adapter proof manual with explicit-unit declarations, mixed-unit
examples, legacy behavior, gap/timing semantics and required configuration.
Use one shared collector for both transports. A report absent after a global
runner error remains missing evidence, not an inferred file or case outcome.
Keep the source modules and required runtime dependencies in the declared
payload, with applicable install/payload checks when that declaration changes.

### 4. Make the protocol available in a tagged release

Type: Behavior
Status: planned
Proof: ownership row 7; release preflight, remote commit/tag verification and a
representative collector invocation from the tagged declared payload.

Behavior: a publisher following the normal update path can fetch the new
protocol, collector and guidance from an immutable numeric Open Dough release.
Landing untagged source alone does not fulfill this promise.

Use the internal release-and-update-clients workflow with its scope explicitly
limited to composing, finalizing and publishing the source release: no project
installation updates or CI migrations. Its default selects the next numeric
patch above the highest fetched release unless the execution instruction names
another version. Supply that numeric version, reviewed notes and finalization
intent to release-version. Inspect the full promoted release diff, run the
required self-installation check before metadata/staging/commit/tag writes,
and keep intended payload changes committed first. Publish trunk and the
annotated tag without force, then verify remote tag/commit identity. Preserve
existing release and failure gates; an occupied tag or unsafe source state
stops the release rather than moving a tag or discarding other work. Inspect
and invoke the released collector in an isolated temporary directory; do not
claim another project's installation or migration.

## Proof and delivery gates

Arrange automated domain data through [MakeMe](../../../tests/README.md#test-data-architecture),
with case-driving facts visible at call sites. Keep literal old wire inputs and
independent expectations outside builders when their exact form is under test.
Use controlled events/clocks; no wall-clock waits, `test.slow()`, or suite/hook
timeout overrides. Follow [native setup](../../../tests/native-setup.md).

At slice boundaries run the affected collector/contract/CLI checks and support
checks for read, scope, comparison, timing and sorting. Use the installed
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
to trace schema/labels/default changes through consumers and their aggregate
assertions, including unchanged helpers and wire fixtures. Add discriminating
new proof for promises current tests do not express. Before delivery of the
shared proof model, run `npm run typecheck:dashboard`, `npm run lint` and
`npm run test:dashboard -- tests/intent --workers=2`: the Intent suite is the
maintained consumer boundary spanning current results, comparisons and
drill-downs. Run affected adapter/backend checks outside that directory too.
No unrelated full-suite local gate is added solely because CI runs it.

Local gate: start fully awake. On AC, guard long runs with `caffeinate -s -i`;
`-s` is honored only on AC. On battery, plug in or start fully awake with the
lid open under `caffeinate -i` and inspect the sleep log afterwards, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff. It applies to local and
published CI failures, including pre-existing failures; attribution is no
exemption. Post-change refactoring and execution's normal delivery/CI gates
remain applicable. Before an expensive run inspect host load, memory and
competing owned work; reduce concurrency or sequence work without dropping
proof.

## Decisive premises

Observed in this assigned workspace at `c92119ac9d982baf23851cbd2579513c17a26111`
on 2026-11-09. These are current-behavior observations, not accepted proof of
the new promises.

| Premise / consuming operation | Literal observation and result | Remainder |
| --- | --- | --- |
| Existing converters/collector support report outcomes, timing and gaps; slice 1 extends that pipeline | `node --test src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs tests/support/dashboard-ci-proof-parse.test.mjs`: 20/20 passed. Setup/assertions inspect actual converter and collector output, attempt identity and gaps. | New version/mixed-unit assertions are owned by slice 1. |
| Same-location mixed units currently fail at collection | In `node --input-type=module`, arrange `makeMe.aCiProofEntry.at('tests').counting(5, 'tests').please()` and `.counting(1, 'checks')`; pass their figures to `fragment` for parts 1/2 of 2, then `summarize` with `expect: [{entry:'tests', parts:2}]` and the fixture `run`. `assert.throws` matched `entry tests has parts counted in tests, checks`. | Existing location-unit assumption must change, not merely its label. |
| Versioned collector output reaches the browser schema with breakdown accounting intact | `node --test --test-name-pattern "a malformed or truncated file breakdown" tests/support/dashboard-ci-proof-breakdown-read.test.mjs`: 1/1 passed, exercising outcomes→collector→contract/browser parse and malformed breakdown refusal. | New wire version and both read transports receive fresh proof in slice 1. |
| Scoped comparisons currently invent a delta across units | `node --input-type=module` imported `countsCellText`; derive measured endpoints from the MakeMe entries above and call `countsCellText(before, after, after, true, true)`. `assert.equal` observed `5 → 1 checks (−4)`. Overall comparison source also sums per raw unit and defaults missing totals to zero. | Slice 2 must change semantic matching and absent-unit handling; existing wording tests do not prove the new rule. |
| Existing browser routes select real proof/comparison journeys in this checkout | `npm run test:dashboard -- tests/intent/intent-summary-ci-proof-table.spec.ts tests/intent/intent-ci-proof-adapter.spec.ts tests/intent/intent-ci-comparison.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts --list --reporter=list`: 12 tests in 4 files selected. After `node scripts/setup-native.mjs npm` and `browser`, `node scripts/setup-native.mjs check` passed with Chromium 153.0.8010.12. | Route/prerequisite observation only; slice owners run the changed journeys and new discriminating assertions. |
| Open Dough's producers already expose the required granularity | `node --test tests/support/ci-proof-declaration.test.mjs`: 6/6 passed, including executing both composite actions' actual script commands against outcomes and shared Playwright records, then reading their summaries. Read `scripts/test.sh` outcomes emission: one scheduled job/file supplies one line. Workflow invokes the source modules. | Changed explicit declarations and failed-file behavior receive slice 3's fresh action replay; no claim of a future hosted run yet. |
| Current installation permits the normal release preflight, and the collector is already declared payload | `bash scripts/check-self-installation.sh`: exit 0 in this worktree. `install.sh` includes all five collector modules and the publisher reference. | Slice 4 rechecks fetched tags, committed payload, source state and self-installation before release writes. These mutable execution preconditions are not assumed to remain true; failure stops publication. |

## Current decisions

- Execute this plan in Trunk Mode (`--trunk`), keeping the release on trunk;
  preparation records grant no execution authority.
- Keep both reader versions during rollout. New explicit units determine
  comparison compatibility; legacy labels are provenance rather than an
  inferred case/file declaration.
- Use one unit-partitioned evidence model throughout collection, read,
  projection and comparison. No per-runner parallel reader or inferred file
  total is warranted.
- The release step is source-release only. Every other project's update and
  CI migration remains its own work.

## Preparation review

Plan refinement was not needed: four Behavior slices have distinct evaluator
boundaries—read evidence, compare evidence, publish from actual reports, and
obtain the tagged protocol—while extending one common unit rule. Slice 1 is
necessarily vertical across the wire and its readers; splitting those layers
would leave an unusable protocol. Its temporary legacy producer is explicitly
replaced by slice 3. No slice-specific concern remains. Slice 4 retains the
normal release preflight and immutable-tag gates at the time of publication.
