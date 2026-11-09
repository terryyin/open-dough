# Distinguish test cases and test files in Intent CI proof

**Identity:** SEED-281#distinguish-test-cases-and-files-in-ci-proof

**Source:** [Refined story](../../seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#distinguish-test-cases-and-files-in-ci-proof)
**Source review:** [source-only review](source-review.md)

## Goal and scope

Developers can distinguish reported case outcomes, aggregate file outcomes
and ambiguous legacy results throughout Intent's CI proof and comparisons.
Publishers can report both explicit units for one location, even one path,
with separate counts, outcomes, timing and evidence gaps. Read existing GitHub
Actions and CI adapter summaries during rollout. Adopt the format in Open
Dough CI and publish protocol, collector and guidance in a normal tagged release.

Keep source-inventory and matched-breakdown-path counts apart from reported
file outcomes. Do not extract inner cases from aggregate reports, synthesize
file outcomes from case paths, sum overlapping evidence across units, or turn
unknown evidence into zero. Other projects own their updates and CI
migrations. Layout unification and comparison presentation redesign belong to
SEED-282; which builds Intent compares stays unchanged.

## Existing solution and architectural direction

PFE: extend the shared `src/skills/dough-test-optimization/scripts/ci-proof-*`
contract, figures, converters and collector (attempt identity, declared parts,
outcomes, duration, untimed results, unassigned figures, file breakdowns) and
their validating consumers `dashboard/server/intentCiProofRead.ts`,
`ciAdapterProof.ts` and the browser's `dashboard/src/ciProof.ts`, together.
Keep each location's evidence partitioned by semantic unit, with the same
figures and scope/comparison operations for every unit; a file breakdown
groups results by path without changing their unit.

Change the existing `ciScopeProof`, `ciScopeComparisonCounts` and
`storyCiComparisonCountsWords` responsibilities rather than adding a proof
reader or comparison model per runner; existing views and timing-gap rules
remain the presentation owners. A declared explicit unit, never spelling
(`tests`, `checks`) or path count, establishes comparability.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
(one direct domain model) and [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(published proof authority, existing local read boundary) apply; the
[North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
observation/presentation split needs no new topic. [ADRs 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
govern tagged distribution and whole-payload installation: author under
`src/skills`, keep required modules in `install.sh`'s payload, never hand-edit
installed copies. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and [maintainer guidance](../../../AGENTS.md#runtime-audience) require
publisher instructions addressed to the executing project's own reports and
configuration.

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
Status: done
Proof: ownership rows 1–3; per-commitment observations in
[source-review.md](source-review.md).

Behavior delivered: five cases and one file outcome for a location, even one
path, read as separate units through CI status, Summary and file Proof; a
caseless file failure stays a file failure; nothing migrates between units;
source-file counts stay apart. Contract version 2 keeps one `evidence` per
unit (`case`, `file`, or `legacy` with its old `label`) per entry
(`ci-proof-contract.mjs`, `ci-proof-evidence.mjs`); `--unit case|file` types
outcomes lines, Playwright records count cases, and
`--expect <entry>=<parts>[:<unit>]` keeps a missing part in its unit. Both
readers read version 1 as legacy (`currentSummaryOf`); `ciProofUnits.ts` owns
unit wording and matching; comparisons show no cross-unit or legacy difference.

Accepted proof on trunk `9215bdb89` (`PATH=/opt/homebrew/bin:$PATH`):
`bash scripts/test.sh` over 43 collector, adapter, read, scope, comparison,
sort and timing files plus 10 supplier-agreement users (53/53); typecheck;
lint; `npm run test:dashboard -- tests/intent tests/observation/published-facts
tests/stories/story-dependencies --workers=1` (exit 0, 294 tests, 30 min).

### 2. Compare only evidence with matching known units

Type: Behavior
Status: done
Proof: ownership rows 4–5; extend
`tests/support/intent-scope-comparison-wording.test.mjs` and the existing
story CI comparison and selected-scope/file comparison journeys.

Behavior delivered: every scope compares one row per declared unit both
builds report, each with its own Counts difference, time, signed change,
relative mark, cues and sort key (example 39: `5 → 7 test cases (+2); 1 test
file (no change)`). Units matching nothing across ends share one row with both
labelled ends and why (`… (different units)`, `… (legacy unit unknown)`); a
unit one side lacks reads `—`; overall counts add only matched units or wholly
added/removed entries (`ciScopeComparisonUnits.ts`, `ciScopeComparisonRow.ts`).

Accepted proof: `bash scripts/test.sh` over 46 collector, read, scope,
comparison, sort and timing files (46/46); typecheck; lint; `npm run
test:dashboard -- tests/intent --workers=2` (exit 0, 281 tests, load 5–10;
two cancelled-landing timeouts at load 16–21 passed 12/12 alone).

### 3. Publish explicit units from the project's actual reports

Type: Behavior
Status: done
Proof: ownership row 6; extend `tests/support/ci-proof-declaration.test.mjs`
and `ci-proof-actions.test.mjs` (action replay), collector CLI tests and
adapter contract proof; perform the guidance behavior review required by
[AGENTS.md](../../../AGENTS.md#behavior-review).

Behavior delivered: `ci.yml` declares `dashboard/*=12:case` (Playwright
records) and `tests=3:file src/skills=3:file` with `unit: file` for npm
test's per-file outcomes; the fragments action passes `unit` as `--unit`; a
report missing after a runner error stays a missing part. The publisher
reference ("Units"), skill, adapter proof manual and CLI usage describe
declarations, mixed units, legacy reading, per-unit timing and gaps, and the
stop when a report's unit cannot be established; no case extraction.

Accepted proof: `bash scripts/test.sh` over 39 collector, action, declaration,
adapter, payload and CI-guidance files (39/39, twice); the actions replayed
with ci.yml's inputs; `ci-time-without-runner-waits.spec.ts` (17 passed);
guidance walk through both recipes (job tmp `s3/walk.mjs`); lint.

### 4. Make the protocol available in a tagged release

Type: Behavior
Status: planned
Proof: ownership row 7; release preflight, remote commit/tag verification and
a representative collector invocation from the tagged declared payload.

Behavior: a publisher following the normal update path can fetch the new
protocol, collector and guidance from an immutable numeric Open Dough release.
Landing untagged source alone does not fulfill this promise.

Checkpoint: before any release write, stop for the developer's go-ahead. It
authorizes running Dough Land `--keep-worktree` on this execution checkout to
put slices 1–3 on trunk, then this release from the landed revision.

Run release-and-update-clients limited to the source release (no project
updates or CI migrations): the next numeric patch above the highest fetched
release unless the instruction names one, with reviewed notes and
finalization intent for release-version. Inspect the full promoted diff, pass
the self-installation check before any metadata/commit/tag write, commit
payload changes first, publish trunk and the annotated tag without force, and
verify remote tag/commit identity. An occupied tag or unsafe source state
stops the release. Invoke the released collector in an isolated temporary
directory; claim no other project's installation.

## Story obligations

### G1. Open Dough's outcomes producers stay legacy until declared (first reported in slice 1)
Reported: slice 1 — "Open Dough's real CI on this branch now reports Playwright entries as test cases, and `tests` and `src/skills` (outcomes without `--unit`) as legacy test results labelled `checks`."
Story clause: "Adopt the format in Open Dough's own CI"
Disposition: proved by slice 3: `.github/workflows/ci.yml` declares `:case` dashboard entries and `:file` `tests`/`src/skills` with `unit: file`; `tests/support/ci-proof-actions.test.mjs` replays the actions with ci.yml's inputs (test files, test cases, a missing part)

### G2. Publisher guidance still describes unitless version 1 proof (first reported in slice 1)
Reported: slice 1 — "Consumers stale until slice 3 (publisher guidance, not edited): `src/skills/dough-test-optimization/references/ci-proof-summary.md` … `src/skills/dough-test-optimization/SKILL.md:35` (\"schema versions stay at 1\") … `src/skills/dough-execute-plan/manuals/custom-ci-proof.md:51`."
Story clause: "Evolve the versioned CI proof format, collector, publisher guidance, and Intent reader to use explicit test case and test file units."
Disposition: proved by slice 3: `references/ci-proof-summary.md` "Units", `SKILL.md`, `manuals/custom-ci-proof.md` and CLI usage describe units; `ci-proof-units-cli.test.mjs` usage and adapter-recipe tests

### G3. Several units at one endpoint compare without per-unit deltas (first reported in slice 1)
Reported: slice 1 — "Comparisons where one end has several units still show labelled ends only (no per-unit deltas yet), which is slice 2's job."
Story clause: "Intent shows +2 test cases and no change in test files."
Disposition: proved by slice 2: `intent-ci-comparison-units.spec.ts` example 39 tests (overall "5 → 7 test cases (+2); 1 test file (no change)", per-unit entry, Summary and file Proof rows); `intent-scope-comparison-units.test.mjs` three-build test

### G4. Comparison rows stay one per path (first reported in slice 1)
Reported: slice 1 — "Comparison rows remain one per path, while current-result views use one row per unit."
Story clause: "keep their results and comparisons separate through the CI result, story comparison, location and folder Summary, and individual file Proof views"
Disposition: proved by slice 2: comparison rows are one per path and unit in entry rows, Summary own figures and child rows, outside rows and file Proof (`intent-ci-comparison-units.spec.ts` example 39 tests; `intent-scope-comparison-unit-gaps.test.mjs` outside-row test)

### G5. Outside rows show another unit's Parts (first reported in slice 2)
Reported: slice 2 — "On a Summary's \"Not in the rows above\" rows, a unit the chosen build (Landed) does not report shows Landed's *other* unit's Parts."
Story clause: "Preserve outcomes, available execution time, untimed results, and missing or ambiguous parts within their reported unit."
Disposition: proved by slice 2: `tests/support/intent-scope-comparison-unit-gaps.test.mjs` "a Summary's outside row shows its own unit's Parts, never the chosen build's other unit's…" (failed before the `outsideComparisonRowsOf` fix, passes after)

## Proof and delivery gates

Follow [AGENTS.md test automation](../../../AGENTS.md#test-automation) (MakeMe
data, literal old wire inputs outside builders) and [native setup](../../../tests/native-setup.md).
At slice boundaries run the affected collector/contract/CLI and read, scope,
comparison, timing and sorting checks; trace schema, label and default changes
with the installed [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
(unchanged helpers and wire fixtures included) and add discriminating proof. Before delivering the shared proof model run `npm run typecheck:dashboard`,
`npm run lint` and `npm run test:dashboard -- tests/intent --workers=2` (the
maintained consumer boundary for current results, comparisons and
drill-downs), plus affected adapter/backend checks outside it. No unrelated
full-suite local gate is added solely because CI runs it.

Local gate: start fully awake; on AC guard long runs with `caffeinate -s -i`;
on battery use `caffeinate -i` with the lid open and read the sleep log
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).
Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff; attribution is no
exemption. Before an expensive run inspect host load and competing owned work;
reduce concurrency or sequence work without dropping proof.

## Decisive premises

Observed at `c92119ac9` (not proof); slices 1–2 consumed five rows (`479f6f3b1`).

| Premise / consuming operation | Literal observation and result | Remainder |
| --- | --- | --- |
| Open Dough's producers already expose the required granularity | `node --test tests/support/ci-proof-declaration.test.mjs`: 6/6 passed, including executing both composite actions' actual script commands against outcomes and shared Playwright records, then reading their summaries. Read `scripts/test.sh` outcomes emission: one scheduled job/file supplies one line. Workflow invokes the source modules. | Changed explicit declarations and failed-file behavior receive slice 3's fresh action replay (now `ci-proof-actions.test.mjs`); no claim of a future hosted run yet. |
| Current installation permits the normal release preflight, and the collector is already declared payload | `bash scripts/check-self-installation.sh`: exit 0 in this worktree. `install.sh` includes all five collector modules and the publisher reference. | Slice 4 rechecks fetched tags, committed payload, source state and self-installation before release writes. These mutable execution preconditions are not assumed to remain true; failure stops publication. |

## Current decisions

- Story Branch Mode (the established start's, not the Trunk Mode first
  planned): slices 1–3 publish to the execution branch; slice 4's checkpoint
  covers a Dough Land `--keep-worktree` landing and then the release.
- Keep both reader versions during rollout. Explicit units decide
  comparability; legacy labels are provenance only. One unit-partitioned
  evidence model serves collection, read, projection and comparison.
- The release is source-release only; every other project's update and CI
  migration remains its own work.
- A declaration without a unit takes the one unit its fragments report (test
  cases for Playwright records, legacy `checks` for outcomes without
  `--unit`); slice 3 declares `:case`/`:file` and `--unit file` explicitly.
- `install.sh` grows to 327 lines for exactly the two modules the refactor
  split out (`ci-proof-evidence.mjs`, `ci-proof-options.mjs`); installers and
  tests parse its one-entry-per-line declaration. Narrow coordinator exception
  to the 250-line check, as in ODF-152's 2026-11-08 occurrence.

## Execution

Story Branch Mode (`origin`, target `main`) in workspace
`.worktrees/distinguish-test-cases-and-test-files-in-intent`, branch
`claude/distinguish-test-cases-and-test-files-in-intent`; publisher
`dashboard-territory.local-open-dough`; agent `juacompe-chan`. The claim at
`479f6f3b112bb7ebe295a1a9724cfce85dc9664d` stays the first published base.
SEED-282 landed mid-slice (merge `0eee12e4d`, shared signed change), so slice
1 was replayed onto trunk `9215bdb89` (local WIP `e0384b5d5`) with its unit
rule in `afterCellOf`. Coordination: the retry-spec repair landed on trunk
(`acfd70db4`); recheck `intent-ci-comparison-retry.spec.ts` after integrating
trunk. SEED-286 (queued) owns the comparison family's load timeouts, which
reach the new `intent-ci-comparison-units.spec.ts` when first in a worker.
