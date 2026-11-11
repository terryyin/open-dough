# Slice 1 acceptance evidence

Source commitments 25, 26, 27, 29, 32, 46, 50–55 accepted.

- Integrated adapter: `dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts`
  publishes its story and supplies adapter answers; `comparisonBuildReading` observations
  assert caller revisions, wall/active times and explicit source cues. Exact adapter
  request/response evidence remains outside the browser owner.
- Rendered legacy/units: `intent-ci-comparison-mounted-legacy.spec.ts` and
  `intent-ci-comparison-mounted-units.spec.ts` retain fixture sort/presentation inputs,
  literal Counts/unit/timing rows and unsupported-difference reasons.
- File Proof: mounted legacy/units, integrated units-bindings and Summary file specs
  now call `expectFileComparisonRows` with complete caller rows. Static fixture
  selection and integrated live navigation remain outside that observation.
- Summary: `intentScopeProofPage.ts` owns `expectNamedScopeFigures` and
  `expectNamedScopeRows`; integrated and rendered callers retain their independent
  figures, row count/order and units. Generic semantic table polling moved byte-identically
  into `proofTablePage.ts`, with its public re-export preserved.
- All 54 changed dashboard paths inspected through the implementation trace; 42 callers
  use the one comparison owner. Nine repeated comparison metric selectors formerly
  occupied 160 lines across 37 files at both `7eab3d6ca` and execution HEAD.
  The reader is 32 lines; file reader35, semantic table61, scope197, setup62.
  Direct `relativeTimingMarks.ts` geometry observation stays independent.
- No changed expected value, ordering, test tier, MakeMe setup, causal release, clock,
  accessibility contract or product runtime. Largest changed spec245 lines.

## Proof

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice1-fixed-proof.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-adapter-planning-skip.spec.ts tests/intent/intent-ci-comparison-adapter-taken.spec.ts tests/intent/intent-ci-comparison-adapter.spec.ts tests/intent/intent-ci-comparison-cancelled-landing.spec.ts tests/intent/intent-ci-comparison-count-gaps.spec.ts tests/intent/intent-ci-comparison-drilldown-relative.spec.ts tests/intent/intent-ci-comparison-locations.spec.ts tests/intent/intent-ci-comparison-missing-run.spec.ts tests/intent/intent-ci-comparison-mounted-entries.spec.ts tests/intent/intent-ci-comparison-mounted-gaps.spec.ts tests/intent/intent-ci-comparison-mounted-head.spec.ts tests/intent/intent-ci-comparison-mounted-legacy.spec.ts tests/intent/intent-ci-comparison-mounted-relative.spec.ts tests/intent/intent-ci-comparison-mounted-retry.spec.ts tests/intent/intent-ci-comparison-mounted-scope-running.spec.ts tests/intent/intent-ci-comparison-mounted-scope-selection.spec.ts tests/intent/intent-ci-comparison-mounted-selection.spec.ts tests/intent/intent-ci-comparison-mounted-sort.spec.ts tests/intent/intent-ci-comparison-mounted-units.spec.ts tests/intent/intent-ci-comparison-mounted-wording.spec.ts tests/intent/intent-ci-comparison-pending-proof.spec.ts tests/intent/intent-ci-comparison-presentation-bindings.spec.ts tests/intent/intent-ci-comparison-relative.spec.ts tests/intent/intent-ci-comparison-retry.spec.ts tests/intent/intent-ci-comparison-skipped-landed.spec.ts tests/intent/intent-ci-comparison-strict-mode.spec.ts tests/intent/intent-ci-comparison-taken.spec.ts tests/intent/intent-ci-comparison-trunk-finality.spec.ts tests/intent/intent-ci-comparison-units-bindings.spec.ts tests/intent/intent-ci-comparison.spec.ts tests/intent/intent-ci-done-endpoint-readiness.spec.ts tests/intent/intent-ci-done-prior-build.spec.ts tests/intent/intent-ci-done-prior-provenance.spec.ts tests/intent/intent-ci-done-prior-states.spec.ts tests/intent/intent-ci-done-reference-lifecycle.spec.ts tests/intent/intent-ci-proof-units.spec.ts tests/intent/intent-scope-collected-file-timing-gaps.spec.ts tests/intent/intent-scope-collected-file-timing-history.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-scope-prior-build-average.spec.ts tests/intent/intent-scope-prior-build-states.spec.ts tests/intent/intent-scope-timing-history-gap-build.spec.ts tests/intent/intent-scope-timing-history-gaps.spec.ts tests/intent/intent-scope-timing-history-legacy.spec.ts tests/intent/intent-scope-timing-history-provenance.spec.ts tests/intent/intent-scope-timing-history-reading.spec.ts tests/intent/intent-scope-timing-history-segments.spec.ts tests/intent/intent-scope-timing-history-units.spec.ts tests/intent/intent-story-dark-appearance.spec.ts tests/intent/intent-summary-ci-proof-gaps.spec.ts tests/intent/intent-summary-ci-proof-kept.spec.ts tests/intent/intent-summary-ci-proof-sort.spec.ts tests/intent/intent-summary-ci-proof-table.spec.ts tests/intent/intent-summary-ci-proof.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-story-comparison-mounted-fallback.spec.ts tests/intent/intent-summary-story-comparison-mounted-file.spec.ts tests/intent/intent-summary-story-comparison-mounted-gaps.spec.ts tests/intent/intent-summary-story-comparison-mounted-outside.spec.ts tests/intent/intent-summary-story-comparison-mounted-relative.spec.ts tests/intent/intent-summary-story-comparison-mounted-signed-sort.spec.ts tests/intent/intent-summary-story-comparison-mounted-sort.spec.ts tests/intent/intent-summary-story-comparison-mounted.spec.ts tests/intent/intent-summary-story-comparison-presentation-bindings.spec.ts tests/intent/intent-summary-story-comparison-renamed.spec.ts tests/intent/intent-summary-story-comparison-sort.spec.ts tests/intent/intent-summary-story-comparison-source.spec.ts --workers=1
```

Terminal exit0; strict and runner verdict passed, selected158/158 expected; run
`372b2766-84c8-4257-bc68-9de819e99ed8`, 357.1s. Verdict retained at
`/tmp/seed300-slice1-fixed-proof.json`. `npm run typecheck:dashboard` and
`git diff --check` passed. Actual setup/observations are the integrated adapter,
static legacy/units, live comparison, Summary, Done/reference and scope specs
selected by that command; fixture data supplies preconditions, assertions read UI.
Consumer trace `/tmp/seed300-slice1-consumer-trace.md` supplies every disposition.
Pure moved-reader/unchanged-export callers reuse unchanged proof; lexical record
and production matches are excluded because no changed browser contract reaches them.

## Discrimination and repaired failure

Scratch missing Counts selector made integrated count-gaps and rendered legacy cases
fail at their independent expected Counts. Scratch missing file table made integrated
and rendered file cases fail at semantic table expectations. Both exact reader byte
sets restored. The first normal cohort exposed a relative `has` locator rooted at
the panel; fixed `comparisonBuildReading` to use page-rooted rowheader semantics.
Initial failed evidence `/tmp/seed300-slice1-proof.json`; full corrected cohort passed.
No failed proof was waived or hidden.

## Boundary and resource decisions

One worker on local16CPU/48GiB/AC under `caffeinate -s -i`; improved prelaunch load3.86,
47% free memory supported normal proof. No other owner's processes changed.
Source freshness returned unchanged at pinned trunk/base
`8299f4e64f49939e1d6120390ebd0b44a0532328`; no incoming named sibling change exists.
Independent refactor and guarded delivery still owed at initial acceptance.

## Independent refactor

`/root/refactor1` returned `## REFACTOR COMPLETE`. One implicated leftover lookup
in `dashboard/tests/intent/intent-story-ci-cues.spec.ts` now uses `fileProofTable`;
its exact cue/style/accessibility/selection assertions remain at the call site.

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-refactor1-proof.json npm run test:dashboard -- tests/intent/intent-story-ci-cues.spec.ts --workers=1
```

1/1 strict/runner passed; typecheck and whitespace check passed. Existing158-case
proof unchanged. Consumer dispositions `/tmp/seed300-refactor1-consumer-trace.md`.
All changed files under250; no production or unresolved gap. Final pre-delivery
freshness again unchanged at8299, no incoming sibling changes.
