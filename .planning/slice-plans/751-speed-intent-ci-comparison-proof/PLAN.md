# Get fast proof of a story's Intent CI comparison

**Identity:** SEED-413#speed-intent-ci-comparison-proof
**Source:** [Get fast proof of a story's Intent CI comparison](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-comparison-proof)
**Source review:** [source review](source-review.md)

## Goal and scope

Dashboard maintainers get quick Vitest feedback on the comparison shown for
a selected story, including its real refresh and selection behavior. Move
the 69 legacy cases in `intent-ci-comparison-*.spec.ts` and the five case
registration modules they call. The [evidence and timing story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-proof-and-timing)
owns independent Summary, status and history cases. This story owns the
comparisons that follow the same evidence into those views. Retain the
representative E2E coverage of authenticated and cross-service reads.

## Decisions and existing owners

- Follow the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Use `mountComponent` and retrying observations. Keep the page-facing
  MakeMe cases on the existing node-free CI proof builders. Expose the
  needed comparison values through `pageMakeMe` from their existing
  definition. Use a small colocated page object where a repeated browser
  operation would obscure a case's purpose.
- Use `IntentCiComparisonContent` with `StoryCiComparisonAnswer`,
  `ComparisonEndpointProofs`, current preference and sorting for
  presentation. Prefer the existing production comparison and sorting rules
  for exhaustive value-only examples. Keep a rendered observation of each
  distinct visual, role, keyboard and layout behavior. Rendering tests pass
  evidence inputs and read the computed result from the page.
- For refresh and selection use the actual `IntentCiEvidenceProvider`, the
  production reading place and `IntentCiStatus` wherever that composition is
  the contract. `PublishedSource`, `PublishedWork`, story identity and observed
  head select the evidence. Reuse the disposable owners in
  `ciComparisonReading.ts` and `ciComparisonProofs.ts`/`ciProofReading.ts`.
  Expose the comparison and attempt-proof reads with their existing typed
  signatures and production defaults, following `intentReadSource.ts`.
  Use a typed CI status reply in cases that exercise the Taken branch's
  adjacent judgment. Preserve abort, identity/attempt checks, refresh rounds
  and the existing authenticated adapters. The held reply is case-local.
- Drill-down checks exercise actual selection and reading-place ownership
  across story, location, folder and file. Pass the relevant typed
  `IntentLocation`, overlay paths and CI evidence through production
  composition. Use `IntentReadSource` only for the locations/source cases
  whose read is held or fails. Keep same-evidence/no-reread assertions.
- Compare before and after explicit file selections. The Playwright reporter
  can write per-case proof through `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`
  with the runner's normal reporter. Avoid `--reporter=line` when extracting
  that record. Measure command elapsed including preparation, selected and
  retired counts, any E2E cost, and the slowest retained cases. Log the
  equivalent observation for every retired title. A set of variants can
  share setup while distinct failure reasons and branches stay observable.

## Local gate

On macOS use the maintained [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
from an awake machine on AC power with `caffeinate -s -i`. Run the affected
explicit paths or families at two workers with the default test timeouts.
The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
applies. Run `npm run typecheck:dashboard` where types or production seams
change. Trace altered reader contracts and run reached consumers, including
the relevant read/retry or adapter E2E paths when the effect reaches them.
Use the normal runner's list mode to verify moved cases remain selectable.

## Decisive premises and proof

At `42a660a17` on 21 November 2026, macOS on AC with Node 24.21.0 and locked
dependencies, `caffeinate -s -i npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/intent/zz-preparation-413-evidence.spec.ts --workers=2`
mounted `IntentCiComparisonContent` with typed proofs, including unavailable
Landed, and the production view showed “Baseline compared with Branch,”
the exact Landed reason and the entry result “2 → 3 test cases (+1)”.
The scratch file was removed. This checks the direct render route used by
slices 1–2 and 5–8. It supplies held evidence and leaves the read lifecycle
to slices 3–4.

The maintained runner command
`caffeinate -s -i npm run --silent test:dashboard:frontend -- intent-ci-comparison-relative-scale.spec.ts intent-summary-story-comparison-rows.spec.ts --workers=2 --reporter=line`
passed 10 Playwright cases. Four exercised the comparison's live scale,
outlier, unchanged/undefined marks and Show % binding. Use the literal
migrating spec roster at Slice 1 to obtain the comparable baseline for the
entire selected story. The listing at that same revision identified the 69
legacy titles, including registration modules.

The same runner with selectors `intent-ci-comparison-check-again.spec.ts`,
`intent-ci-comparison-selection.spec.ts` and
`intent-project-scope-history-recovery.spec.ts`, at two workers with its
line reporter, passed seven cases. The five comparison cases observed
a disabled/recovered Check again, a recovered Landed proof and stale
comparison and attempt replies losing to the current selection. Slice 3
reaches those same behaviors over the typed source.

| Promise | Owning proof |
| --- | --- |
| Build and attempt choice retains reasons and measured values | Slices 1–2. Exact endpoint labels, timing, missing/ambiguous and cancelled provenance with a rendered fallback. |
| Check again reads the right evidence; old and abandoned reads cannot win | Slices 3–4. Operate the real reader across retry, StrictMode reattach and selection. Observe pending state and a late answer after the current result is visible. |
| Counts and entry timing stay truthful from story to file | Slices 4–6. Distinct absent, partial, legacy, and mixed-unit proof, plus the actual scope binding and native control. |
| Signed ordering and percent display preserve independent sorting and scale | Slices 7–8. Direct rule checks plus native header/checkbox action and geometry in Chromium. |
| The comparison family is cheaper to run with complete proof | Slice 8. Equivalent selection, results, case-count decisions, elapsed comparison and legacy consumer audit. |

## Slices

### 1. Each endpoint names the real build and proof it represents

Type: Behavior
Status: done

Take the family baseline before moving cases. Move `comparisonEndpointCases`,
`comparisonAdapterCases` and the comparison `-wording` cases against typed
completed/active endpoints and proof entries. Consolidate repeated endpoint
assertions into one mounted comparison where the same setup exhibits each
reason. Exercise shipped wording logic directly for equivalent value variants.

**Proof.** Focused Vitest shows exact, ancestor, equivalent, skipped and
cancelled provenance, adapter limits and ambiguity, accessible names and
hover cues. Wall and execution times, counts and their gaps remain distinct.
Keep exact endpoint and attempt selection proof.

**Accepted.** Family baseline at `81b22bafd` before any move: the 69 legacy
cases passed in 19.64 s at two workers (per-case record kept in this
checkout's evidence as `s1-baseline-family.json`). 14 endpoint, adapter and
wording cases became 7 Vitest cases in `intent-ci-comparison-endpoints`,
`-adapter-proof` and `-overall-metrics` with the colocated
`intent-ci-comparison-page.ts`; moved cases summed 1,468 ms as Playwright and
502 ms as Vitest. Consolidation shows the 1 MiB limit at Branch only and
ambiguity at Landed only, since each endpoint renders its reason through the
same production path. Later slices reuse the colocated `mountComparison`.

### 2. Landed gaps keep the usable Branch evidence and explain the nearest result

Type: Behavior
Status: done

Move `comparisonGapCases` and `comparisonCancelledCases`. Use the typed
answer/attempt inputs that make actual fallback and provenance observable.
Group repeated wording by equivalent presentation and keep the cases where
the choice of fallback or timing changes.

**Proof.** The displayed fallback keeps available entry counts and duration,
each independent adapter or final timing cause and the nearest cancelled,
running or proofless result. Preserve absence of borrowed timing and
fabricated zero.

**Accepted.** 13 gap and cancelled cases became 5 Vitest cases in
`intent-ci-comparison-landed-fallback` and `-timing-gaps`; moved cases summed
1,650 ms as Playwright and 1,055 ms as Vitest. Variants sharing one
presentation rerender one mount, polling each exact reason.

### 3. Check again and observed head changes read the current comparison

Type: Behavior
Status: planned

Move `comparisonTakenCases` and comparison `-check-again`, `-gaps`, `-head`,
`-selection` and `-strict-mode`. Start with one retry against the actual
provider and attempt reader over the typed source. Verify that its held
reply disables the control and its release changes the shown endpoint before
moving the remaining lifecycle cases. Keep key/attempt recording and StrictMode
where each is the observable risk.

**Proof.** Failed and unavailable reads recover on Check again, each required
proof rereads once, the same head avoids a reread, the new head requests one,
and a held result for an old identity or attempt leaves the current result
intact. Story Branch and Trunk provisional readings keep their respective
judgments and endpoints.

### 4. Reading across scopes retains the same current comparison

Type: Behavior
Status: planned

Move comparison `-locations`, `-scope-running`, `-scope-selection` and
`-drilldown-relative` through the real selection and evidence owner. Hold
the location reply only in its pending/recovery cases.

**Proof.** Intent locations can be held or fail while the one comparison
stays visible. Retry reads the completion revision. Changing to a queued
story clears the old columns. Branch fallback and Show % follow relevant
scopes without extra CI reads; each rendered scope uses its own scale.

### 5. Entry rows and their drill-downs keep missing and legacy results explicit

Type: Behavior
Status: planned

Move comparison `-entries`, `-count-gaps` and `-legacy` using the actual
entry calculations and the Scope and File Proof views where their output
differs. Share a mount for genuinely equivalent projections of one
arrangement and use direct rule proof for the distinct counts and gaps.

**Proof.** Partial and ambiguous evidence keeps exact gap reasons in the
overall Counts, rows and tree. Legacy results keep both labels and counts.
An expired or untimed result never supplies a false zero or cue.

### 6. The real controls retain each measured unit through the reading

Type: Behavior
Status: planned

Move comparison `-units`, `-units-bindings` and `-presentation-bindings`.
Keep one mounted native control check across the relevant transitions and
test the distinct unit calculations with typed inputs.

**Proof.** Case and file units stay separate at the entry, location, folder,
tree and file. Native Enter and Space reach the expected action; visible and
accessible cues retain the same units.

### 7. Signed entry figures sort accurately in both directions

Type: Behavior
Status: planned

Move comparison `-sort` using `CiProofTable` and its production sorting
state. Consolidate repeated browser setups around one actual sort sequence
and preserve direct checks for each distinct ordering rule.

**Proof.** Baseline and Counts use their own values. Branch and Landed use
signed timing, the intended initial order is visible, gaps stay last and
the header exposes the current sort direction.

### 8. Show % retains geometry and all comparison proof runs faster

Type: Behavior
Status: planned

Move comparison `-relative` and `-relative-scale` using the real preference,
centering and scale logic. Keep a combined representative mounted example
where one outlier, unchanged row and missing baseline can be observed
together. Remove registration modules and support with no remaining
consumers. Compare the explicit before/after family selections and include
any preserved E2E proof cost.

**Proof.** The relative marks keep their signed direction and shared
centering, undefined marks stay absent, and activating Show % leaves
geometry and sorting intact. Verify equivalent proof ownership, Vitest
listing, elapsed time and counts by destination for the whole story.

## Plan review

Refinement pass unnecessary after review of the eight proof boundaries.
Rendering, lifecycle, scope composition, sorting and layout each observe
one production responsibility. Cases sharing an observation move together.
The early retry in Slice 3 validates the new seam before broader migration.
No remaining slice-specific scope or proof concern was identified.
