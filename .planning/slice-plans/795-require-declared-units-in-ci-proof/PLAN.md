# Read and collect CI proof only in declared units

**Identity:** SEED-423#require-declared-units-in-ci-proof
**Source:** [Read and collect CI proof only in declared units](../../seeds/SEED-423-shrink-the-installed-distribution.md#require-declared-units-in-ci-proof)
**Split from:** SEED-423#retire-finished-migrations-and-legacy-formats (plan 794) before readiness on 2026-11-23, when retiring CI proof summary `schemaVersion: 1` and `unit: "legacy"` alongside the installer, backlog, and execution legacy readers exceeded the eight-slice plan limit.
**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

## Provisional input

Resume through `dough-story-refinement` and plan realignment before execution.
Carry forward the 2026-11-23 audit findings from
`SEED-423#retire-finished-migrations-and-legacy-formats`:

- All six maintained repositories (`open-dough`, `doughnut`, `pygardon`,
  `terry-talks`, `lizard`, `clipboard`) already pass explicit `case` or `file`
  units in their CI workflows and emit `schemaVersion: 2` since 2026-11-10.
- `~/.open-dough/dashboard/landed-ci-history.json` holds `0` `schemaVersion: 1`
  summaries and `22` retained builds from 2026-11-05..2026-11-10 (`doughnut`:
  14, `terry-talks`: 5, `clipboard`: 3) whose stored `proof.summary` carries
  `unit: "legacy"` (`0` alongside declared units). Because `readMachineJson`
  validates the entire store at once, `retainedProofSchema` in
  `dashboard/server/landedCiObservation.ts` must map a retained `{ kind: "summary", summary }`
  that fails `summaryProblems(summary)` to
  `{ kind: "unavailable", reason: "invalid", detail }` — matching live
  `ciProofArtifact.ts` and `ciAdapterProof.ts` under
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  — rather than failing `storeSchema` and invalidating all projects' landed CI
  history.
- Check whether plan 793 (*Call custom CI through a minimal adapter interface*)
  has landed before refining Slice D, since both touch `ci-proof-read.mjs` and
  `ciAdapterProof.ts`.
- Follow the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  and [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

### A. Collector contract and fragment options require `schemaVersion: 2` and declared units

Retire `READABLE_SUMMARY_VERSIONS` version `1`, `currentSummaryOf`,
`LEGACY_UNIT`, `legacyEntryProblems`, and unit-less `--expect` / fragment
inputs across `ci-proof-contract.mjs`, `ci-proof-evidence.mjs`,
`ci-proof-options.mjs`, `ci-proof-fragments.mjs`, `ci-proof-collect.mjs`,
`ci-proof-summary.mjs`, `ci-proof-read.mjs`, and
`references/ci-proof-summary.md`.

Proof: `ci-proof-collect.test.mjs`, `ci-proof-unit-declarations.test.mjs`,
`ci-proof-units-cli.test.mjs`, `ci-proof-summary.test.mjs`, and
`ci-proof-outcomes.test.mjs` pass; `ci-proof-legacy-results.test.mjs` is
retired or replaced with rejection coverage for schema 1 and unit-less inputs.

### B. CLI proof check, scope, and ranking readers drop `legacy` unit branches

Remove `unit === "legacy"` and unit-less formatting branches across
`ci-proof-check.mjs`, `ci-proof-scope.mjs`, `ci-proof-scope-gaps.mjs`,
`ci-proof-ranking.mjs`, `ci-proof-ranking-table.mjs`, and
`ci-proof-table-text.mjs`.

Proof: `Distribution/tests/skills/dough-test-optimization/ci-proof-*.test.mjs`
and `execution-payload-update.sh` pass with declared `case` and `file` units.

### C. Dashboard CI proof schema, wording, and comparison speak only `case` and `file`

Remove `unit: z.literal("legacy")` from `dashboard/src/ciProof.ts` and retire
`"legacy"` handling across `ciProofUnits.ts`, `ciProofWording.ts`,
`ciScopeComparisonUnits.ts`, `ciScopeComparisonTiming.ts`,
`ciScopeComparisonCountsCell.ts`, `ciScopeComparisonCountEndpoints.ts`,
`storyCiComparisonEntries.ts`, `storyCiComparisonCountTotals.ts`, and shared
test builders (`ciProofEntryTestData.mjs`, `ciProofEvidenceTestData.mjs`,
`ciProofFragmentTestData.mjs`, `ciProofEntryInputs.ts`,
`ciComparisonUnitsJourney.ts`).

Proof: `npm run typecheck:dashboard`, `Distribution/tests/support/*ci*proof*.test.mjs`,
`Distribution/tests/support/*ci*comparison*.test.mjs`, and affected
`dashboard/frontend-tests/intent/` and `e2e/intent/` specs pass.

### D. Landed CI history and proof readers surface retired summaries as `invalid` unavailable proof

Update `retainedProofSchema` in `dashboard/server/landedCiObservation.ts` so a
retained summary failing `summaryProblems` normalizes to
`{ kind: "unavailable", reason: "invalid", detail }`, drop `hasLegacy` and
`legacyReason` from `ciScopeHistoryTiming.ts`, `ciScopeHistory.ts`, and
`dashboard/src/ciScopeHistory.ts`, and update `ciProofArtifact.ts`,
`ciAdapterProof.ts`, `landed-ci-history-proof-versions.test.mjs`,
`landed-ci-scope-legacy-gap.spec.ts`, `landed-ci-proof-adapter-units.spec.ts`,
`ci-proof-memory-github-gaps.spec.ts`, and
`ci-proof-memory-adapter-gaps.spec.ts`.

Proof: stored v1 or `unit: "legacy"` summaries in `landed-ci-history.json` keep
the machine store and wall-time points readable across reads and atomic writes
while reporting `"Invalid CI proof summary"` on scoped test-execution readings
without GitHub re-fetches.
